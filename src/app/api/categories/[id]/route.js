// app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Category from '@/models/product_categories';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updatedCategory = await Category.findByIdAndUpdate(id, body, {
            new: true,
        });

        if (!updatedCategory) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedCategory });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
    }
}
