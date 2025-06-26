import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
    },
    {
        timestamps: true,
        collection: "product_category",
    }
);

export default mongoose.models.ProductCategory ||
    mongoose.model("ProductCategory", categorySchema);
