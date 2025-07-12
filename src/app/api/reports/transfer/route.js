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

        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        const existing = await DailyTransfer.findOne({ date: formattedDate });

        if (existing) {
            existing.transfers = transfers;
            existing.note = note;
            await existing.save();
        } else {
            await DailyTransfer.create({
                date: formattedDate,
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
        const dateParam = url.searchParams.get("date");

        if (!dateParam) {
            return NextResponse.json(
                { success: false, message: "Missing date" },
                { status: 400 }
            );
        }

        const formattedDate = new Date(dateParam);
        formattedDate.setHours(0, 0, 0, 0);

        const transfer = await DailyTransfer.findOne({ date: formattedDate });

        return NextResponse.json({ success: true, data: transfer || null });
    } catch (error) {
        console.error("Transfer GET error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
