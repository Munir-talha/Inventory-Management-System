//models/item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    minStockLevel: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        default: "System"
    }
}, {
    timestamps: true
});

// Add compound index to prevent duplicate items in same category
itemSchema.index({ name: 1, categoryId: 1 }, { unique: true });

export default mongoose.models.Item || mongoose.model("Item", itemSchema);

