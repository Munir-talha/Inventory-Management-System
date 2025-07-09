"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { format } from "date-fns";

export default function ProductSalesReportPage() {
    const [filterDate, setFilterDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        fetchData({ date: filterDate });
    }, []);

    const fetchData = async (params) => {
        setLoading(true);
        try {
            let query = "";

            if (params.date) {
                query = `?date=${params.date}`;
            } else if (params.start && params.end) {
                query = `?start=${params.start}&end=${params.end}`;
            }

            const res = await axios.get(`/api/reports/product-sales${query}`);
            setData(res.data.data);
        } catch (error) {
            console.error("Failed to fetch product sales report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthFilter = (months) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setFilterDate(""); // Clear manual date input
        fetchData({ start: startStr, end: endStr });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h1 className="text-2xl font-bold">📊 Product-wise Sales Summary</h1>
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-[160px]"
                        max={today} // ✅ disables future dates
                    />
                    <Button onClick={() => fetchData({ date: filterDate })}>Search</Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            setFilterDate(today);
                            fetchData({ date: today });
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((month) => (
                    <Button
                        key={month}
                        variant="outline"
                        onClick={() => handleMonthFilter(month)}
                    >
                        Last {month} Month{month > 1 ? "s" : ""}
                    </Button>
                ))}
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Summary Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                    ) : data.length === 0 ? (
                        <p className="text-muted-foreground">No sales found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty Sold</TableHead>
                                    <TableHead>Total Revenue</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                    <TableHead>Profit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.productId}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.totalQty}</TableCell>
                                        <TableCell>Rs. {item.totalRevenue}</TableCell>
                                        <TableCell>Rs. {item.totalCost}</TableCell>
                                        <TableCell className="font-semibold text-green-600">
                                            Rs. {item.totalProfit}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* ➕ Total Row */}
                                <TableRow className="bg-gray-100 font-semibold">
                                    <TableCell className="text-right">Total</TableCell>
                                    <TableCell>
                                        {data.reduce((sum, item) => sum + item.totalQty, 0)}
                                    </TableCell>
                                    <TableCell>
                                        Rs. {data.reduce((sum, item) => sum + item.totalRevenue, 0)}
                                    </TableCell>
                                    <TableCell>
                                        Rs. {data.reduce((sum, item) => sum + item.totalCost, 0)}
                                    </TableCell>
                                    <TableCell className="text-green-700">
                                        Rs. {data.reduce((sum, item) => sum + item.totalProfit, 0)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>

                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
