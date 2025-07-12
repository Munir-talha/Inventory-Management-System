"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios from "axios";

export default function TransferPage() {
    const [date, setDate] = useState(() =>
        new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
    );
    const [summary, setSummary] = useState(null);
    const [transfers, setTransfers] = useState({
        cash: "",
        easypaisa: "",
        bank: "",
    });
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSummary(date);
    }, []);

    const fetchSummary = async (selectedDate) => {
        setLoading(true);
        try {
            const saleRes = await axios.get(
                `/api/reports/daily-closing?date=${selectedDate}`
            );
            const transferRes = await axios.get(
                `/api/reports/transfer?date=${selectedDate}`
            );

            const totalSales = saleRes.data.data?.totalSales || 0;
            const transferData = transferRes.data.data?.transfers || {
                cash: 0,
                easypaisa: 0,
                bank: 0,
            };
            const noteText = transferRes.data.data?.note || "";

            const totalTransferred =
                transferData.cash + transferData.easypaisa + transferData.bank;

            setSummary({
                totalSales,
                transferred: totalTransferred,
                remaining: totalSales - totalTransferred,
            });

            setTransfers({
                cash: transferData.cash,
                easypaisa: transferData.easypaisa,
                bank: transferData.bank,
            });

            setNote(noteText);
        } catch (err) {
            console.error("Error fetching summary or transfer", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const totalTransfer =
            Number(transfers.cash) +
            Number(transfers.easypaisa) +
            Number(transfers.bank);

        if (totalTransfer > summary.totalSales) {
            alert(
                `⚠️ Total transfer amount (Rs. ${totalTransfer}) cannot exceed total sales (Rs. ${summary.totalSales}).`
            );
            return;
        }

        try {
            await axios.post("/api/reports/transfer", {
                date,
                transfers: {
                    cash: Number(transfers.cash),
                    easypaisa: Number(transfers.easypaisa),
                    bank: Number(transfers.bank),
                },
                note,
            });
            fetchSummary(date);
        } catch (err) {
            console.error("Error saving transfer", err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold">🏦 Daily Transfer Log</h1>
                <div className="flex gap-4 items-center">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Button onClick={() => fetchSummary(date)}>Search</Button>
                </div>
            </div>

            {loading ? (
                <p className="text-muted-foreground">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>💰 Daily Sales Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>
                                <strong>Total Sales:</strong> Rs. {summary?.totalSales || 0}
                            </p>
                            <p>
                                <strong>Transferred:</strong> Rs.{" "}
                                {summary?.transferred || 0}
                            </p>
                            <p>
                                <strong>Remaining:</strong> Rs. {summary?.remaining || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>📤 Record Transfer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cash">💵 Cash</Label>
                                    <Input
                                        id="cash"
                                        type="number"
                                        placeholder="Cash"
                                        value={transfers.cash}
                                        onChange={(e) =>
                                            setTransfers({ ...transfers, cash: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="easypaisa">📱 Easypaisa</Label>
                                    <Input
                                        id="easypaisa"
                                        type="number"
                                        placeholder="Easypaisa"
                                        value={transfers.easypaisa}
                                        onChange={(e) =>
                                            setTransfers({ ...transfers, easypaisa: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank">🏦 Bank Transfer</Label>
                                    <Input
                                        id="bank"
                                        type="number"
                                        placeholder="Bank Transfer"
                                        value={transfers.bank}
                                        onChange={(e) =>
                                            setTransfers({ ...transfers, bank: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">📝 Note (optional)</Label>
                                    <Input
                                        id="note"
                                        type="text"
                                        placeholder="Note"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors"
                            >
                                💾 Save Transfer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
