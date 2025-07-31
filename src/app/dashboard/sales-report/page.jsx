"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    CalendarDays,
    TrendingUp,
    Package,
    DollarSign,
    Percent,
    ShoppingCart,
    Clock
} from "lucide-react";

export default function ProductSalesReportPage() {
    const [filterDate, setFilterDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("");

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
                setDateRange(params.date);
            } else if (params.start && params.end) {
                query = `?start=${params.start}&end=${params.end}`;
                setDateRange(`${params.start} to ${params.end}`);
            }

            const response = await fetch(`/api/reports/product-sales${query}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                console.error("Failed to fetch product sales report:", result.message);
                setData(null);
            }
        } catch (error) {
            console.error("Failed to fetch product sales report:", error);
            setData(null);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    Product Sales Analysis
                </h1>
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-[160px] bg-white"
                        max={today}
                    />
                    <Button
                        onClick={() => fetchData({ date: filterDate })}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            setFilterDate(today);
                            fetchData({ date: today });
                        }}
                    >
                        Today
                    </Button>
                </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 6, 12].map((months) => (
                    <Button
                        key={months}
                        variant="outline"
                        onClick={() => handleMonthFilter(months)}
                        size="sm"
                    >
                        <Clock className="h-4 w-4 mr-1" />
                        Last {months} Month{months > 1 ? "s" : ""}
                    </Button>
                ))}
            </div>

            {!data || !data.items || data.items.length === 0 ? (
                <Card className="p-8 text-center">
                    <CardContent>
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-muted-foreground">No sales data found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            No sales recorded for the selected {dateRange.includes("to") ? "date range" : "date"}.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    Total Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(data.totals.totalRevenue)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {data.totals.totalTransactions} transactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <TrendingUp className="h-4 w-4" />
                                    Total Profit
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(data.totals.totalProfit)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {data.totals.avgProfitMargin}% margin
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <ShoppingCart className="h-4 w-4" />
                                    Items Sold
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-orange-600">
                                    {data.totals.totalQty}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {data.recordCount} products
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <Package className="h-4 w-4" />
                                    Total Cost
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(data.totals.totalCost)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cost of goods sold
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Table */}
                    <Card className="shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Detailed Product Performance
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Sales data for {dateRange}
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-gray-700">Product</th>
                                            <th className="text-right p-4 font-semibold text-gray-700">Qty Sold</th>
                                            <th className="text-right p-4 font-semibold text-gray-700">Revenue</th>
                                            <th className="text-right p-4 font-semibold text-gray-700">Cost</th>
                                            <th className="text-right p-4 font-semibold text-gray-700">Profit</th>
                                            <th className="text-center p-4 font-semibold text-gray-700">Margin</th>
                                            <th className="text-right p-4 font-semibold text-gray-700">Avg Price</th>
                                            <th className="text-center p-4 font-semibold text-gray-700">Transactions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={item.itemId} className="border-b hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">{item.categoryName}</p>
                                                    </div>
                                                </td>
                                                <td className="text-right p-4 font-medium">{item.totalQty}</td>
                                                <td className="text-right p-4 font-medium text-blue-600">
                                                    {formatCurrency(item.totalRevenue)}
                                                </td>
                                                <td className="text-right p-4 font-medium text-purple-600">
                                                    {formatCurrency(item.totalCost)}
                                                </td>
                                                <td className="text-right p-4 font-medium text-green-600">
                                                    {formatCurrency(item.totalProfit)}
                                                </td>
                                                <td className="text-center p-4">
                                                    <Badge
                                                        variant={item.profitMargin > 20 ? "default" :
                                                            item.profitMargin > 10 ? "secondary" : "destructive"}
                                                        className="font-medium"
                                                    >
                                                        {item.profitMargin}%
                                                    </Badge>
                                                </td>
                                                <td className="text-right p-4 text-gray-600">
                                                    {formatCurrency(item.avgSellingPrice)}
                                                </td>
                                                <td className="text-center p-4 text-gray-600">
                                                    {item.totalTransactions}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Footer */}
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-4 border-t-blue-500">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Products Analyzed</p>
                                    <p className="text-2xl font-bold text-gray-800">{data.recordCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                                    <p className="text-2xl font-bold text-gray-800">{data.totals.totalTransactions}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Average Profit Margin</p>
                                    <p className="text-2xl font-bold text-green-600">{data.totals.avgProfitMargin}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Report Period</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {dateRange.includes("to") ? "Range" : "Single Day"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}