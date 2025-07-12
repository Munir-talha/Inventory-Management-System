import mongoose from "mongoose";

const dailyTransferSchema = new mongoose.Schema({
    date: {
        type: String, // Use "YYYY-MM-DD"
        required: true,
        unique: true,
    },
    transfers: {
        cash: { type: Number, default: 0 },
        easypaisa: { type: Number, default: 0 },
        bank: { type: Number, default: 0 },
    },
    note: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.DailyTransfer || mongoose.model("DailyTransfer", dailyTransferSchema);
