import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    costPerUnit: { type: Number, required: true },
}, { _id: false }); // No separate _id for each purchase entry

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    cost: { type: Number, required: true }, // Current/Latest cost
    sellingPrice: { type: Number, required: true },
    availableStock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    purchases: [purchaseSchema],  // 🆕 Purchase history array
}, { timestamps: true });

export default mongoose.models.Product ||
    mongoose.model("Product", productSchema);
