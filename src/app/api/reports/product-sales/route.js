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

        let filter = {};

        if (dateParam) {
            const start = new Date(dateParam);
            const end = new Date(dateParam);
            end.setDate(end.getDate() + 1);
            filter.dateOfSale = { $gte: start, $lt: end };
        } else if (startParam && endParam) {
            const start = new Date(startParam);
            const end = new Date(endParam);
            end.setDate(end.getDate() + 1);
            filter.dateOfSale = { $gte: start, $lt: end };
        } else {
            return NextResponse.json({ success: false, message: "Missing date or range" }, { status: 400 });
        }

        const summary = await Sale.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$productId",
                    totalQty: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalCost: { $sum: { $multiply: ["$costPerItem", "$quantity"] } },
                }
            },
            {
                $addFields: {
                    totalProfit: { $subtract: ["$totalRevenue", "$totalCost"] }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $project: {
                    productId: "$_id",
                    name: "$product.name",
                    totalQty: 1,
                    totalRevenue: 1,
                    totalCost: 1,
                    totalProfit: 1
                }
            }
        ]);

        return NextResponse.json({ success: true, data: summary });
    } catch (error) {
        console.error("Product-wise report error:", error.message);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

