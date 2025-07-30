// app/api/items/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Item from '@/models/item';
import '@/models/product_categories';

export async function GET() {
    try {
        await connectDB();
        const items = await Item.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate('categoryId');
        return NextResponse.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch items'
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        console.log("📦 Item POST body:", body);

        const item = await Item.create(body);
        const populatedItem = await Item.findById(item._id).populate('categoryId');

        console.log('Item created:', populatedItem);
        return NextResponse.json({ success: true, data: populatedItem });
    } catch (error) {
        console.error('Error creating item:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: 'Item with this name already exists in the selected category'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: 'Failed to create item'
        }, { status: 500 });
    }
}