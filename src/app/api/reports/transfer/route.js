import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import DailyTransfer from "@/models/dailyTransfer";

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

        const existing = await DailyTransfer.findOne({ date });

        if (existing) {
            existing.transfers = transfers;
            existing.note = note;
            await existing.save();
        } else {
            await DailyTransfer.create({
                date,
                transfers,
                note,
            });
        }

        return NextResponse.json({ success: true, message: "Transfer recorded" });
    } catch (error) {
        console.error("Transfer POST error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error" },
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
                { success: false, message: "Missing date" },
                { status: 400 }
            );
        }

        const transfer = await DailyTransfer.findOne({ date });

        return NextResponse.json({ success: true, data: transfer || null });
    } catch (error) {
        console.error("Transfer GET error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
