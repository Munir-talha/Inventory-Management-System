"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DollarSign,
    PackageX,
    CalendarDays,
    TrendingUp,
} from "lucide-react";
import axios from "axios";

export default function DashboardStats() {
    const [loading, setLoading] = useState(true);
    const [todayStats, setTodayStats] = useState({
        totalSale: 0,
        totalProfit: 0,
        totalItems: 0,
    });
    const [monthStats, setMonthStats] = useState({
        totalSale: 0,
        totalItems: 0,
    });
    const [outOfStockCount, setOutOfStockCount] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [todayRes, monthRes, outRes] = await Promise.all([
                    axios.get("/api/stats/today"),
                    axios.get("/api/stats/month"),
                    axios.get("/api/products/out-of-stock"),
                ]);

                setTodayStats(todayRes.data);
                setMonthStats(monthRes.data);
                setOutOfStockCount(outRes.data.count);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const formatCurrency = (value) =>
        value.toLocaleString("en-PK", {
            style: "currency",
            currency: "PKR",
            maximumFractionDigits: 0,
        });

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ✅ Today’s Sales */}
            <Link href="/dashboard/daily-closing" className="block">
                <Card className="shadow-md border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-md font-medium text-muted-foreground">
                            Today's Sale
                        </CardTitle>
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(todayStats.totalSale)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {todayStats.totalItems} items sold today
                        </p>
                    </CardContent>
                </Card>
            </Link>

            {/* ✅ Today’s Profit */}
            <Link href="/dashboard/daily-closing" className="block">
                <Card className="shadow-md border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-md font-medium text-muted-foreground">
                            Today's Profit
                        </CardTitle>
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${todayStats.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                        >
                            {formatCurrency(todayStats.totalProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Net profit earned today
                        </p>
                    </CardContent>
                </Card>
            </Link>

            {/* ✅ Monthly Sales */}
            <Card className="shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-md font-medium text-muted-foreground">
                        This Month's Sale
                    </CardTitle>
                    <CalendarDays className="w-5 h-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-700">
                        {formatCurrency(monthStats.totalSale)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {monthStats.totalItems} items sold this month
                    </p>
                </CardContent>
            </Card>

            {/* ✅ Out of Stock */}
            <Card className="shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-md font-medium text-muted-foreground">
                        Out of Stock
                    </CardTitle>
                    <PackageX className="w-5 h-5 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {outOfStockCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Products need restocking
                    </p>
                </CardContent>
            </Card>
        </div >
    );
}
