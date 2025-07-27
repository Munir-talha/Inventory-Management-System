// app/api/stats/month/route.js
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
    endOfMonth.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
        dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const totalSale = sales.reduce((sum, sale) => sum + (sale.sellingPricePerItem * sale.quantity), 0);
    const totalItems = sales.reduce((count, sale) => count + sale.quantity, 0);

    return NextResponse.json({ success: true, totalSale, totalItems });
}
