// app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/product';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        console.log('Updating product with ID:', id, 'Data:', body);
        const updatedProduct = await Product.findByIdAndUpdate(id, body, {
            new: true,
        });

        if (!updatedProduct) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
    }
}
