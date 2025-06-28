import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductCategory",
            required: true,
        },
        availableStock: { type: Number, default: 0 },
        initialPurchaseQty: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
