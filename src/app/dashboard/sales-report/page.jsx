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

    useEffect(() => {
        fetchData(filterDate);
    }, []);

    const fetchData = async (dateString) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/reports/product-sales?date=${dateString}`);
            setData(res.data.data);
        } catch (error) {
            console.error("Failed to fetch product sales report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold">📊 Product-wise Sales Summary</h1>
                <div className="flex items-center gap-4">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-[200px]"
                    />
                    <Button onClick={() => fetchData(filterDate)}>Search</Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            setFilterDate(today);
                            fetchData(today);
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Summary for {format(new Date(filterDate), "PPP")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                    ) : data.length === 0 ? (
                        <p className="text-muted-foreground">No sales found for this day.</p>
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
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
