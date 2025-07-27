// app/api/stats/week/route.js
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
