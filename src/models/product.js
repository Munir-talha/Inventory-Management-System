import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product_categories",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.products ||
    mongoose.model("products", productSchema);
