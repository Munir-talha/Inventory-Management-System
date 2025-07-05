// models/purchase.js
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // ✅ Matches your Product model name
            required: true,
        },
        quantity: { type: Number, required: true },
        costPerItem: { type: Number, required: true },
        actualCostPerItem: { type: Number, required: true },
        dateOfPurchase: { type: Date, required: true },
    },
    { timestamps: true }
); w

export default mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
