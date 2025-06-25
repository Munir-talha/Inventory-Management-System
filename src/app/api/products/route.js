// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/product'

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find().populate('categoryId');
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
    }
}
