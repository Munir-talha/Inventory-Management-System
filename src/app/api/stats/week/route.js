// app/api/stats/week/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';

export async function GET() {
    await connectDB();

    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const purchases = await Purchase.find({
        dateOfPurchase: { $gte: startOfWeek, $lte: today }
    });

    const totalSale = purchases.reduce((sum, p) => sum + (p.costPerItem * p.quantity), 0);
    const totalItems = purchases.reduce((count, p) => count + p.quantity, 0);

    return NextResponse.json({ success: true, totalSale, totalItems });
}
