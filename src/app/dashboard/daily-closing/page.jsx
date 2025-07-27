"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function DailyClosingSummaryPage() {
    const [filterDate, setFilterDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchSummary(filterDate);
    }, []);

    const fetchSummary = async (dateString) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/reports/daily-closing?date=${dateString}`);
            console.log(res.data.data)
            setSummary(res.data.data);
        } catch (err) {
            console.error("Failed to fetch daily closing summary:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold">📅 Daily Closing Summary</h1>
                <div className="flex items-center gap-4">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-[200px]"
                    />
                    <Button onClick={() => fetchSummary(filterDate)}>Search</Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            setFilterDate(today);
                            fetchSummary(today);
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {loading ? (
                <p className="text-muted-foreground">Loading...</p>
            ) : !summary ? (
                <p className="text-muted-foreground">No sales data found for this date.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>💰 Total Sales</CardTitle>
                            <p className="text-sm text-muted-foreground">Total amount collected from all sales</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-blue-600">Rs. {summary.totalSales}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>📈 Net Profit / Loss</CardTitle>
                            <p className="text-sm text-muted-foreground">Revenue - Cost = Profit</p>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-xl font-bold ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                Rs. {summary.totalProfit}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>🧾 Total Cost</CardTitle>
                            <p className="text-sm text-muted-foreground">What you spent to sell these items</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-gray-800">Rs. {summary.amountAfterProfit}</p>
                        </CardContent>
                    </Card>

                    {/* <Card>
                        <CardHeader>
                            <CardTitle>🟢 Easypaisa Received</CardTitle>
                            <p className="text-sm text-muted-foreground">Paid by customers via Easypaisa</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-green-600">Rs. {summary.easypaisaAmount}</p>
                        </CardContent>
                    </Card> */}

                    {/* <Card>
                        <CardHeader>
                            <CardTitle>🟠 Cash Received</CardTitle>
                            <p className="text-sm text-muted-foreground">Paid by customers in cash</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold text-orange-600">Rs. {summary.cashAmount}</p>
                        </CardContent>
                    </Card> */}
                </div>
            )}
        </div>
    );
}
