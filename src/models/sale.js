import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: { type: Number, required: true },
        costPerItem: { type: Number, required: true },
        sellingPricePerItem: { type: Number, required: true },
        total: { type: Number, required: true },
        paymentMode: { type: String, enum: ["cash", "easypaisa", "bank", "other"], default: "cash" },
        dateOfSale: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
