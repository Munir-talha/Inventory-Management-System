import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import DailyTransfer from "@/models/dailyTransfer";
import Sale from "@/models/sale";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { date, transfers, note } = body;

        if (!date || !transfers) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate transfer amounts
        const totalTransfer = (transfers.cash || 0) + (transfers.easypaisa || 0) + (transfers.bank || 0);

        if (totalTransfer < 0) {
            return NextResponse.json(
                { success: false, message: "Transfer amounts cannot be negative" },
                { status: 400 }
            );
        }

        // Get total sales for the date to validate transfer doesn't exceed sales
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const salesSummary = await Sale.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startOfDay, $lte: endOfDay },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" }
                }
            }
        ]);

        const totalSales = salesSummary.length > 0 ? salesSummary[0].totalSales : 0;

        if (totalTransfer > totalSales) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Total transfer amount (Rs. ${totalTransfer}) cannot exceed total sales (Rs. ${totalSales})`
                },
                { status: 400 }
            );
        }

        const existing = await DailyTransfer.findOne({ date });

        if (existing) {
            existing.transfers = {
                cash: transfers.cash || 0,
                easypaisa: transfers.easypaisa || 0,
                bank: transfers.bank || 0
            };
            existing.note = note || "";
            existing.totalTransferred = totalTransfer;
            existing.updatedAt = new Date();
            await existing.save();
        } else {
            await DailyTransfer.create({
                date,
                transfers: {
                    cash: transfers.cash || 0,
                    easypaisa: transfers.easypaisa || 0,
                    bank: transfers.bank || 0
                },
                note: note || "",
                totalTransferred: totalTransfer,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Transfer recorded successfully",
            data: {
                transfers: {
                    cash: transfers.cash || 0,
                    easypaisa: transfers.easypaisa || 0,
                    bank: transfers.bank || 0
                },
                note: note || "",
                totalTransferred: totalTransfer,
                totalSales,
                remaining: totalSales - totalTransfer,
                date
            }
        });
    } catch (error) {
        console.error("Transfer POST error:", error.message);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const date = url.searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { success: false, message: "Missing date parameter" },
                { status: 400 }
            );
        }

        // Get transfer data
        const transfer = await DailyTransfer.findOne({ date });

        // Get sales data for the same date
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const salesSummary = await Sale.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startOfDay, $lte: endOfDay },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const totalSales = salesSummary.length > 0 ? salesSummary[0].totalSales : 0;
        const totalTransactions = salesSummary.length > 0 ? salesSummary[0].totalTransactions : 0;

        const transferData = transfer ? {
            transfers: transfer.transfers || { cash: 0, easypaisa: 0, bank: 0 },
            note: transfer.note || "",
            totalTransferred: (transfer.transfers?.cash || 0) + (transfer.transfers?.easypaisa || 0) + (transfer.transfers?.bank || 0),
            createdAt: transfer.createdAt,
            updatedAt: transfer.updatedAt
        } : {
            transfers: { cash: 0, easypaisa: 0, bank: 0 },
            note: "",
            totalTransferred: 0,
            createdAt: null,
            updatedAt: null
        };

        return NextResponse.json({
            success: true,
            data: {
                ...transferData,
                totalSales,
                totalTransactions,
                remaining: totalSales - transferData.totalTransferred,
                date
            }
        });
    } catch (error) {
        console.error("Transfer GET error:", error.message);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}