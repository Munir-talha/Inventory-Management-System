import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date");

        if (!dateParam) {
            return NextResponse.json({ success: false, message: "Missing date" }, { status: 400 });
        }

        const start = new Date(dateParam);
        const end = new Date(dateParam);
        end.setDate(end.getDate() + 1);

        const sales = await Sale.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: start, $lt: end }
                }
            },
            {
                $project: {
                    total: 1,
                    profit: {
                        $subtract: ["$total", { $multiply: ["$costPerItem", "$quantity"] }]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalProfit: 1,
                    amountAfterProfit: { $subtract: ["$totalSales", "$totalProfit"] }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: sales.length > 0 ? sales[0] : {
                totalSales: 0,
                totalProfit: 0,
                amountAfterProfit: 0
            }
        });
    } catch (error) {
        console.error("Daily closing error:", error.message);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
