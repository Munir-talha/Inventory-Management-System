// app/api/stats/month/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';

export async function GET() {
    await connectDB();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setHours(0, 0, 0, 0);

    const purchases = await Purchase.find({
        dateOfPurchase: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const totalSale = purchases.reduce((sum, p) => sum + (p.costPerItem * p.quantity), 0);
    const totalItems = purchases.reduce((count, p) => count + p.quantity, 0);

    return NextResponse.json({ success: true, totalSale, totalItems });
}
