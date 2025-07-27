import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Sale from "@/models/sale";

export async function GET() {
    await connectDB();

    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
        dateOfSale: { $gte: startOfWeek, $lte: endOfDay },
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
