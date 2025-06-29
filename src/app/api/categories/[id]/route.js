import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Category from '@/models/product_categories';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        console.error("Update category error:", error);
        return NextResponse.json({ success: false, message: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        await Category.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (error) {
        console.error("Delete category error:", error);
        return NextResponse.json({ success: false, message: "Failed to delete category" }, { status: 500 });
    }
}
