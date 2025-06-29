// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/product';
import '@/models/product_categories'; // ✅ This is the fix!


export async function GET() {
    try {
        await connectDB();
        const products = await Product.find().populate('categoryId');
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        console.log("📦 Product POST body:", body);
        const product = await Product.create(body);
        console.log('Product created:', product);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
    }
}
