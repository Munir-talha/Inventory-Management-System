// app/api/purchases/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';
import '@/models/item';
import '@/models/product_categories';

export async function GET() {
    try {
        await connectDB();
        const purchases = await Purchase.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate({
                path: 'itemId',
                populate: {
                    path: 'categoryId'
                }
            });
        return NextResponse.json({ success: true, data: purchases });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch purchases'
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        console.log("🛒 Purchase POST body:", body);

        const purchase = await Purchase.create(body);
        const populatedPurchase = await Purchase.findById(purchase._id)
            .populate({
                path: 'itemId',
                populate: {
                    path: 'categoryId'
                }
            });

        console.log('Purchase created:', populatedPurchase);
        return NextResponse.json({ success: true, data: populatedPurchase });
    } catch (error) {
        console.error('Error creating purchase:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create purchase'
        }, { status: 500 });
    }
}