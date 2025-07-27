import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Product from "@/models/product";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const productId = params.id;
        const { quantity, costPerUnit, date } = await req.json();

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        product.purchases.push({
            quantity,
            costPerUnit,
            date: date ? new Date(date) : new Date(),
        });

        product.availableStock += quantity;
        product.cost = costPerUnit; // Update latest cost

        await product.save();

        return NextResponse.json({ success: true, message: "Purchase added successfully" });
    } catch (error) {
        console.error("Add purchase error:", error.message);
        return NextResponse.json({ success: false, message: "Failed to add purchase" }, { status: 500 });
    }
}
