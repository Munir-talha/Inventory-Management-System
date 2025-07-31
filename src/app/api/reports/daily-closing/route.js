import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";
import Purchase from "@/models/purchase";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date");

        if (!dateParam) {
            return NextResponse.json({ success: false, message: "Missing date" }, { status: 400 });
        }

        // Create proper date range for the selected date
        const selectedDate = new Date(dateParam);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch sales summary
        const salesSummary = await Sale.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startOfDay, $lte: endOfDay },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalCost: { $sum: { $multiply: ["$costPerItem", "$quantity"] } },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        // Fetch detailed sales with item information
        const salesDetails = await Sale.find({
            dateOfSale: { $gte: startOfDay, $lte: endOfDay },
            isActive: true
        })
            .populate({
                path: 'itemId',
                populate: {
                    path: 'categoryId',
                    select: 'name'
                }
            })
            .sort({ dateOfSale: -1 });

        // Group sales by item
        const salesByItem = salesDetails.reduce((acc, sale) => {
            const itemId = sale.itemId._id.toString();
            if (!acc[itemId]) {
                acc[itemId] = {
                    itemName: sale.itemId.name,
                    categoryName: sale.itemId.categoryId.name,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalProfit: 0,
                    avgSellingPrice: 0,
                    transactions: []
                };
            }

            acc[itemId].totalQuantity += sale.quantity;
            acc[itemId].totalAmount += sale.total;
            acc[itemId].totalProfit += sale.profit;
            acc[itemId].transactions.push({
                quantity: sale.quantity,
                sellingPrice: sale.sellingPricePerItem,
                total: sale.total,
                profit: sale.profit,
                time: sale.dateOfSale
            });

            return acc;
        }, {});

        // Calculate average selling price for each item
        Object.keys(salesByItem).forEach(itemId => {
            const item = salesByItem[itemId];
            item.avgSellingPrice = item.totalAmount / item.totalQuantity;
        });

        // Fetch detailed purchases with item information
        const purchasesDetails = await Purchase.find({
            purchaseDate: { $gte: startOfDay, $lte: endOfDay },
            isActive: true
        })
            .populate({
                path: 'itemId',
                populate: {
                    path: 'categoryId',
                    select: 'name'
                }
            })
            .sort({ purchaseDate: -1 });

        // Group purchases by item
        const purchasesByItem = purchasesDetails.reduce((acc, purchase) => {
            const itemId = purchase.itemId._id.toString();
            if (!acc[itemId]) {
                acc[itemId] = {
                    itemName: purchase.itemId.name,
                    categoryName: purchase.itemId.categoryId.name,
                    totalQuantity: 0,
                    totalCost: 0,
                    avgCostPerUnit: 0,
                    transactions: []
                };
            }

            acc[itemId].totalQuantity += purchase.quantity;
            acc[itemId].totalCost += purchase.totalCost;
            acc[itemId].transactions.push({
                quantity: purchase.quantity,
                costPerUnit: purchase.costPerUnit,
                totalCost: purchase.totalCost,
                supplier: purchase.supplier,
                time: purchase.purchaseDate,
                notes: purchase.notes
            });

            return acc;
        }, {});

        // Calculate average cost per unit for each item
        Object.keys(purchasesByItem).forEach(itemId => {
            const item = purchasesByItem[itemId];
            item.avgCostPerUnit = item.totalCost / item.totalQuantity;
        });

        // Get purchase summary
        const purchaseSummary = purchasesDetails.reduce((acc, purchase) => {
            acc.totalPurchases += purchase.totalCost;
            acc.totalItems += purchase.quantity;
            acc.totalTransactions += 1;
            return acc;
        }, { totalPurchases: 0, totalItems: 0, totalTransactions: 0 });

        const summary = salesSummary.length > 0 ? salesSummary[0] : {
            totalSales: 0,
            totalProfit: 0,
            totalCost: 0,
            totalTransactions: 0
        };

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    ...summary,
                    amountAfterProfit: summary.totalSales - summary.totalProfit
                },
                purchaseSummary,
                salesByItem: Object.values(salesByItem),
                purchasesByItem: Object.values(purchasesByItem),
                salesDetails,
                purchasesDetails
            }
        });

    } catch (error) {
        console.error("Daily closing error:", error.message);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}