"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, BarChart3, Clock, User } from "lucide-react";


export default function DailyClosingSummaryPage() {
    const [filterDate, setFilterDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchSummary(filterDate);
    }, []);

    const fetchSummary = async (dateString) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/daily-closing?date=${dateString}`);
            const result = await res.json();
            console.log("API Response:", result.data);
            setData(result.data);
        } catch (err) {
            console.error("Failed to fetch daily closing summary:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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

    if (!data || !data.summary) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarDays className="h-8 w-8 text-blue-600" />
                        Daily Closing Summary
                    </h1>
                    <div className="flex items-center gap-4">
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-[200px]"
                        />
                        <Button onClick={() => fetchSummary(filterDate)} className="bg-blue-600 hover:bg-blue-700">
                            Search
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const today = new Date().toISOString().split("T")[0];
                                setFilterDate(today);
                                fetchSummary(today);
                            }}
                        >
                            Today
                        </Button>
                    </div>
                </div>
                <Card className="p-8 text-center">
                    <CardContent>
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-muted-foreground">No data found for {filterDate}</p>
                        <p className="text-sm text-muted-foreground mt-2">Try selecting a different date or check if there were any transactions on this day.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { summary, purchaseSummary, salesByItem, purchasesByItem } = data;

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <CalendarDays className="h-8 w-8 text-blue-600" />
                    Daily Closing Summary
                </h1>
                <div className="flex items-center gap-4">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-[200px] bg-white"
                    />
                    <Button onClick={() => fetchSummary(filterDate)} className="bg-blue-600 hover:bg-blue-700">
                        Search
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            setFilterDate(today);
                            fetchSummary(today);
                        }}
                    >
                        Today
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            Total Sales Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalSales)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.totalTransactions} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <TrendingUp className="h-4 w-4" />
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(summary.totalProfit)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.totalProfit >= 0 ? "Profit" : "Loss"} for the day
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <BarChart3 className="h-4 w-4" />
                            Total Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalCost)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cost of goods sold
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Package className="h-4 w-4" />
                            Purchase Investment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(purchaseSummary.totalPurchases)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {purchaseSummary.totalTransactions} purchases
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Section */}
            {salesByItem && salesByItem.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                            Products Sold Today
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Detailed breakdown of all sales</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-600">Product</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Qty Sold</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Avg Price</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Total Revenue</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesByItem.map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.itemName}</p>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {item.categoryName}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="text-right p-4 font-medium">{item.totalQuantity}</td>
                                            <td className="text-right p-4">{formatCurrency(item.avgSellingPrice)}</td>
                                            <td className="text-right p-4 font-medium text-blue-600">
                                                {formatCurrency(item.totalAmount)}
                                            </td>
                                            <td className="text-right p-4">
                                                <span className={`font-medium ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(item.totalProfit)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Purchases Section */}
            {purchasesByItem && purchasesByItem.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5 text-purple-600" />
                            Inventory Purchased Today
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Stock additions and investments</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-600">Product</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Qty Purchased</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Avg Cost</th>
                                        <th className="text-right p-4 font-medium text-gray-600">Total Investment</th>
                                        <th className="text-left p-4 font-medium text-gray-600">Supplier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchasesByItem.map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.itemName}</p>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {item.categoryName}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="text-right p-4 font-medium">{item.totalQuantity}</td>
                                            <td className="text-right p-4">{formatCurrency(item.avgCostPerUnit)}</td>
                                            <td className="text-right p-4 font-medium text-purple-600">
                                                {formatCurrency(item.totalCost)}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {item.transactions[0]?.supplier || "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {(!salesByItem || salesByItem.length === 0) && (!purchasesByItem || purchasesByItem.length === 0) && (
                <Card className="p-8 text-center">
                    <CardContent>
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-muted-foreground">No transactions found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            No sales or purchases were recorded for {filterDate}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}