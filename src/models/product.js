import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    availableStock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    initialPurchaseQty: { type: Number },
    initialPurchaseDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
