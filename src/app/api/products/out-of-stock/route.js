// app/api/products/out-of-stock/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/product';

export async function GET() {
    await connectDB();

    const products = await Product.find({ availableStock: { $lte: 0 } });
    return NextResponse.json({ success: true, count: products.length, data: products });
}
