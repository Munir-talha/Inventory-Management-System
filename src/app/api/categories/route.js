import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Category from '@/models/product_categories';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error("Fetch categories error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const category = await Category.create(body);
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        console.error("Create category error:", error);
        return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
    }
}
