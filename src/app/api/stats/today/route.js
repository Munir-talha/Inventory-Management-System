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

    let totalSale = 0;
    let totalCost = 0;
    let totalItems = 0;

    for (const sale of sales) {
        totalSale += sale.sellingPricePerItem * sale.quantity;
        totalCost += sale.costPerItem * sale.quantity;
        totalItems += sale.quantity;
    }

    const totalProfit = totalSale - totalCost;

    return NextResponse.json({
        success: true,
        totalSale,
        totalProfit,
        totalItems,
    });
}
