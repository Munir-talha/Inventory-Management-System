import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.product_categories ||
    mongoose.model("product_categories", categorySchema);
