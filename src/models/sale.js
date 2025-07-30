//models/sale.js
import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        costPerItem: {
            type: Number,
            required: true,
            min: 0
        },
        sellingPricePerItem: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        },
        profit: {
            type: Number,
            default: 0
        },
        // paymentMode: {
        //     type: String,
        //     enum: ["cash", "easypaisa", "bank", "other"],
        //     default: "cash"
        // },
        dateOfSale: {
            type: Date,
            required: true,
            default: Date.now
        },
        createdBy: {
            type: String,
            default: "System"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // Optional: Track which purchases this sale consumed (for FIFO tracking)
        purchaseReferences: [{
            purchaseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Purchase"
            },
            quantityUsed: {
                type: Number,
                min: 0
            },
            costUsed: {
                type: Number,
                min: 0
            }
        }]
    },
    { timestamps: true }
);

// Calculate total and profit before saving
saleSchema.pre('save', function (next) {
    this.total = this.sellingPricePerItem * this.quantity;
    this.profit = (this.sellingPricePerItem - this.costPerItem) * this.quantity;
    next();
});

// Add indexes for better query performance
saleSchema.index({ itemId: 1, dateOfSale: -1 });
saleSchema.index({ dateOfSale: -1 });
saleSchema.index({ isActive: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);