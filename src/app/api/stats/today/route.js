// app/api/stats/today/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";

export async function GET() {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sales = await Sale.find({
        dateOfSale: { $gte: today, $lt: tomorrow },
    });

    const totalSale = sales.reduce(
        (sum, sale) => sum + sale.sellingPricePerItem * sale.quantity,
        0
    );

    const totalCost = sales.reduce(
        (sum, sale) => sum + sale.costPerItem * sale.quantity,
        0
    );

    const totalProfit = totalSale - totalCost;

    const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    return NextResponse.json({
        success: true,
        totalSale,
        totalProfit,
        totalItems,
    });
}
