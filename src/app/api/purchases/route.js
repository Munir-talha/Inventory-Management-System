import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Purchase from '@/models/purchase';
import Product from '@/models/product'

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        const query = {};
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            query.dateOfPurchase = { $gte: start, $lt: end };
        }
        const purchases = await Purchase.find(query)
            .populate('productId') // populate full product details
            .sort({ dateOfPurchase: -1 });

        return NextResponse.json({ success: true, data: purchases });
    } catch (error) {
        console.error("GET /api/purchases error:", error);
        return NextResponse.json({ success: false, message: 'Failed to fetch purchases' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { productId, quantity, costPerItem, dateOfPurchase } = body;

        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        if (!product.isActive) {
            return NextResponse.json({ success: false, message: 'Product is inactive or out of stock' }, { status: 400 });
        }

        if (product.availableStock < quantity) {
            return NextResponse.json({ success: false, message: 'Insufficient stock' }, { status: 400 });
        }

        // Save purchase
        const newPurchase = await Purchase.create({
            productId,
            quantity,
            costPerItem,
            actualCostPerItem: product.cost,
            dateOfPurchase: new Date(dateOfPurchase),
        });

        // Update stock
        product.availableStock -= quantity;
        await product.save();

        return NextResponse.json({ success: true, data: newPurchase });
    } catch (error) {
        console.error("POST /api/purchases error:", error);
        return NextResponse.json({ success: false, message: 'Failed to save purchase' }, { status: 500 });
    }
}
