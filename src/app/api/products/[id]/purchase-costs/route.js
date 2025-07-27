import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Product from "@/models/product";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const productId = params.id;

        const product = await Product.findById(productId).lean();
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        const purchases = product.purchases || [];
        const filtered = purchases.filter(p => p.quantity > 0);

        const uniqueCosts = [...new Set(filtered.map(p => p.costPerUnit))];

        const formatted = uniqueCosts.map(cost => {
            const purchase = filtered.find(p => p.costPerUnit === cost);
            return {
                costPerItem: cost,
                purchaseDate: purchase.date,
            };
        });

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("GET purchase costs error:", error.message);
        return NextResponse.json({ success: false, message: "Failed to fetch costs" }, { status: 500 });
    }
}
