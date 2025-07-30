// app/api/items/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Item from '@/models/item';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const item = await Item.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('categoryId');

        if (!item) {
            return NextResponse.json({
                success: false,
                message: 'Item not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        console.error('Error updating item:', error);

        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: 'Item with this name already exists in the selected category'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: 'Failed to update item'
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        // Soft delete - set isActive to false
        const item = await Item.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!item) {
            return NextResponse.json({
                success: false,
                message: 'Item not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete item'
        }, { status: 500 });
    }
}
