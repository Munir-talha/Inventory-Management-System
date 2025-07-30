// app/api/purchases/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const purchase = await Purchase.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate({
            path: 'itemId',
            populate: {
                path: 'categoryId'
            }
        });

        if (!purchase) {
            return NextResponse.json({
                success: false,
                message: 'Purchase not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: purchase });
    } catch (error) {
        console.error('Error updating purchase:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update purchase'
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        // Soft delete - set isActive to false
        const purchase = await Purchase.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!purchase) {
            return NextResponse.json({
                success: false,
                message: 'Purchase not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: purchase });
    } catch (error) {
        console.error('Error deleting purchase:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete purchase'
        }, { status: 500 });
    }
}
