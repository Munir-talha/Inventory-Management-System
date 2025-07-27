import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Sale from '@/models/sale';

export async function GET() {
    await connectDB();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const sales = await Sale.find({
        dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }
    });

    let totalSale = 0;
    let totalItems = 0;

    for (const sale of sales) {
        totalSale += sale.sellingPricePerItem * sale.quantity;
        totalItems += sale.quantity;
    }

    return NextResponse.json({ success: true, totalSale, totalItems });
}
