//models/purchase.js
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    costPerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalCost: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: String,
        trim: true,
        default: ""
    },
    notes: {
        type: String,
        trim: true,
        default: ""
    },
    createdBy: {
        type: String,
        default: "System"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate totalCost before saving
purchaseSchema.pre('save', function (next) {
    this.totalCost = this.costPerUnit * this.quantity;
    next();
});

export default mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);