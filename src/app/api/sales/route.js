// app/api/sales/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";
import Item from "@/models/item";
import Purchase from "@/models/purchase";
import "@/models/product_categories";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const dateFilter = url.searchParams.get("date");

        const filter = { isActive: true };
        if (dateFilter) {
            const start = new Date(dateFilter);
            const end = new Date(dateFilter);
            end.setDate(end.getDate() + 1);
            filter.dateOfSale = { $gte: start, $lt: end };
        }

        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 })
            .populate({
                path: 'itemId',
                populate: { path: 'categoryId' }
            });

        return NextResponse.json({ success: true, data: sales });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch sales"
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            itemId,
            quantity,
            sellingPricePerItem,
            dateOfSale,
        } = body;

        // Validation
        if (!itemId || quantity == null || sellingPricePerItem == null) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: itemId, quantity, or sellingPricePerItem" },
                { status: 400 }
            );
        }

        if (quantity <= 0 || sellingPricePerItem < 0) {
            return NextResponse.json(
                { success: false, message: "Quantity must be positive and price cannot be negative" },
                { status: 400 }
            );
        }

        // Check if item exists and is active
        const item = await Item.findById(itemId);
        if (!item || !item.isActive) {
            return NextResponse.json({
                success: false,
                message: "Item not found or inactive"
            }, { status: 400 });
        }

        // Calculate current stock
        const purchaseAggregation = await Purchase.aggregate([
            { $match: { itemId: item._id, isActive: true } },
            { $group: { _id: "$itemId", totalPurchased: { $sum: "$quantity" } } }
        ]);

        const salesAggregation = await Sale.aggregate([
            { $match: { itemId: item._id, isActive: true } },
            { $group: { _id: "$itemId", totalSold: { $sum: "$quantity" } } }
        ]);

        const totalPurchased = purchaseAggregation[0]?.totalPurchased || 0;
        const totalSold = salesAggregation[0]?.totalSold || 0;
        const currentStock = totalPurchased - totalSold;

        if (quantity > currentStock) {
            return NextResponse.json({
                success: false,
                message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity}`
            }, { status: 400 });
        }

        // Calculate FIFO cost
        const { costPerItem, purchaseReferences } = await calculateFIFOCost(itemId, quantity);

        // Manually calculate total and profit
        const total = sellingPricePerItem * quantity;
        const profit = (sellingPricePerItem - costPerItem) * quantity;

        // Save Sale
        const sale = await Sale.create({
            itemId,
            quantity,
            costPerItem,
            sellingPricePerItem,
            total,
            profit,
            dateOfSale: new Date(dateOfSale || Date.now()),
            purchaseReferences
        });

        // Populate before returning
        const populatedSale = await Sale.findById(sale._id)
            .populate({
                path: 'itemId',
                populate: { path: 'categoryId' }
            });

        console.log('Sale created:', populatedSale);
        return NextResponse.json({ success: true, data: populatedSale });

    } catch (error) {
        console.error("POST /sales error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to save sale"
        }, { status: 500 });
    }
}

// FIFO Cost Calculation
async function calculateFIFOCost(itemId, quantityToSell) {
    try {
        const purchases = await Purchase.find({
            itemId,
            isActive: true
        }).sort({ purchaseDate: 1 });

        const previousSales = await Sale.find({
            itemId,
            isActive: true
        });

        const purchaseBalances = purchases.map(purchase => {
            const consumed = previousSales.reduce((sum, sale) => {
                const ref = sale.purchaseReferences?.find(ref =>
                    ref.purchaseId.toString() === purchase._id.toString()
                );
                return sum + (ref?.quantityUsed || 0);
            }, 0);

            return {
                ...purchase.toObject(),
                remainingQuantity: purchase.quantity - consumed
            };
        }).filter(p => p.remainingQuantity > 0);

        let remaining = quantityToSell;
        let totalCost = 0;
        const purchaseReferences = [];

        for (const purchase of purchaseBalances) {
            if (remaining <= 0) break;

            const useQty = Math.min(remaining, purchase.remainingQuantity);
            const cost = useQty * purchase.costPerUnit;

            totalCost += cost;
            remaining -= useQty;

            purchaseReferences.push({
                purchaseId: purchase._id,
                quantityUsed: useQty,
                costUsed: cost
            });
        }

        const costPerItem = totalCost / quantityToSell;

        return { costPerItem, purchaseReferences };

    } catch (error) {
        console.error('Error in FIFO:', error);
        const fallback = await Purchase.aggregate([
            { $match: { itemId, isActive: true } },
            { $group: { _id: "$itemId", avgCost: { $avg: "$costPerUnit" } } }
        ]);

        const costPerItem = fallback[0]?.avgCost || 0;
        return { costPerItem, purchaseReferences: [] };
    }
}
