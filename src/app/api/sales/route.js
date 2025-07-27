import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";
import Product from "@/models/product";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const dateFilter = url.searchParams.get("date");

        const filter = {};
        if (dateFilter) {
            const start = new Date(dateFilter);
            const end = new Date(dateFilter);
            end.setDate(end.getDate() + 1);
            filter.dateOfSale = { $gte: start, $lt: end };
        }

        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 })
            .populate("productId");
        return NextResponse.json({ success: true, data: sales });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch sales" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const { productId, quantity, costPerItem, sellingPricePerItem, dateOfSale } = body;

        if (!productId || quantity == null || costPerItem == null || sellingPricePerItem == null) {
            return NextResponse.json(
                { success: false, message: "Missing or invalid sale data" },
                { status: 400 }
            );
        }

        const total = sellingPricePerItem * quantity;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return NextResponse.json({ success: false, message: "Invalid or inactive product" }, { status: 400 });
        }

        if (quantity > product.availableStock) {
            return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
        }

        // LIFO: Reduce from latest purchases first
        const sortedPurchases = [...product.purchases]
            .filter(p => p.quantity > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let remainingQty = quantity;
        for (let i = 0; i < sortedPurchases.length && remainingQty > 0; i++) {
            const purchase = sortedPurchases[i];
            if (purchase.costPerUnit === costPerItem && purchase.quantity > 0) {
                const deduction = Math.min(purchase.quantity, remainingQty);
                purchase.quantity -= deduction;
                remainingQty -= deduction;
            }
        }

        if (remainingQty > 0) {
            return NextResponse.json({ success: false, message: "Stock mismatch during deduction" }, { status: 400 });
        }

        // Save updated purchases and stock
        product.availableStock -= quantity;
        product.purchases = sortedPurchases;
        await product.save();

        const sale = await Sale.create({
            productId,
            quantity,
            costPerItem,
            sellingPricePerItem,
            total,
            dateOfSale: new Date(dateOfSale),
        });

        return NextResponse.json({ success: true, data: sale });
    } catch (error) {
        console.error("POST /sales error:", error.message);
        return NextResponse.json({ success: false, message: "Failed to save sale" }, { status: 500 });
    }
}



