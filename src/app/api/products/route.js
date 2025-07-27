// app/api/products/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/product';
import '@/models/product_categories'; // Ensure category model is loaded

// ✅ GET all products with category populated
export async function GET() {
    try {
        await connectDB();
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate('categoryId');
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
    }
}

// ✅ POST new product OR add to purchase history if exists
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const {
            name,
            categoryId,
            cost,
            sellingPrice,
            availableStock,
            minStockLevel,
            isActive,
            purchaseQuantity,
            purchaseDate,
        } = body;

        // 🧐 Check if product with same name and category already exists
        let product = await Product.findOne({ name: name.trim(), categoryId });

        const newPurchaseEntry = {
            quantity: purchaseQuantity,
            date: new Date(purchaseDate),
            costPerUnit: cost,
        };

        if (product) {
            // 🔄 Product exists: Update stock, latest cost, and add purchase history
            product.availableStock += purchaseQuantity;
            product.cost = cost;
            product.sellingPrice = sellingPrice;
            product.minStockLevel = minStockLevel;
            product.isActive = isActive;
            product.purchases.push(newPurchaseEntry);
            await product.save();
        } else {
            // 🆕 Product does not exist: create new product with initial purchase
            product = await Product.create({
                name: name.trim(),
                categoryId,
                cost,
                sellingPrice,
                availableStock,
                minStockLevel,
                isActive,
                purchases: [newPurchaseEntry],
            });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Product POST Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create or update product' }, { status: 500 });
    }
}
