// app/api/stats/today/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';

export async function GET() {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const purchases = await Purchase.find({
        dateOfPurchase: { $gte: today, $lt: tomorrow }
    });

    const totalSale = purchases.reduce((sum, p) => sum + (p.costPerItem * p.quantity), 0);
    const totalItems = purchases.reduce((count, p) => count + p.quantity, 0);

    return NextResponse.json({ success: true, totalSale, totalItems });
}
