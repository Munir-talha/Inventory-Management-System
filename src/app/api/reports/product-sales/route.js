import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date");
        const startParam = url.searchParams.get("start");
        const endParam = url.searchParams.get("end");

        let filter = { isActive: true };

        if (dateParam) {
            const selectedDate = new Date(dateParam);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.dateOfSale = { $gte: startOfDay, $lte: endOfDay };
        } else if (startParam && endParam) {
            const startDate = new Date(startParam);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(endParam);
            endDate.setHours(23, 59, 59, 999);

            filter.dateOfSale = { $gte: startDate, $lte: endDate };
        } else {
            return NextResponse.json({
                success: false,
                message: "Missing date parameter or date range"
            }, { status: 400 });
        }

        const summary = await Sale.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$itemId",
                    totalQty: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalCost: { $sum: { $multiply: ["$costPerItem", "$quantity"] } },
                    totalProfit: { $sum: "$profit" },
                    totalTransactions: { $sum: 1 },
                    avgSellingPrice: { $avg: "$sellingPricePerItem" },
                    avgCostPrice: { $avg: "$costPerItem" }
                }
            },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "item"
                }
            },
            { $unwind: "$item" },
            {
                $lookup: {
                    from: "product_category",
                    localField: "item.categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    itemId: "$_id",
                    name: "$item.name",
                    categoryName: "$category.name",
                    totalQty: 1,
                    totalRevenue: 1,
                    totalCost: 1,
                    totalProfit: 1,
                    totalTransactions: 1,
                    avgSellingPrice: { $round: ["$avgSellingPrice", 2] },
                    avgCostPrice: { $round: ["$avgCostPrice", 2] },
                    profitMargin: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            "$totalProfit",
                                            { $cond: [{ $eq: ["$totalRevenue", 0] }, 1, "$totalRevenue"] }
                                        ]
                                    },
                                    100
                                ]
                            },
                            2
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Calculate overall totals
        const totals = summary.reduce((acc, item) => {
            acc.totalQty += item.totalQty;
            acc.totalRevenue += item.totalRevenue;
            acc.totalCost += item.totalCost;
            acc.totalProfit += item.totalProfit;
            acc.totalTransactions += item.totalTransactions;
            return acc;
        }, {
            totalQty: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            totalTransactions: 0
        });

        return NextResponse.json({
            success: true,
            data: {
                items: summary,
                totals: {
                    ...totals,
                    avgProfitMargin: totals.totalRevenue > 0
                        ? Math.round((totals.totalProfit / totals.totalRevenue) * 10000) / 100
                        : 0
                },
                dateRange: dateParam ? dateParam : `${startParam} to ${endParam}`,
                recordCount: summary.length
            }
        });

    } catch (error) {
        console.error("Product-wise sales report error:", error.message);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}