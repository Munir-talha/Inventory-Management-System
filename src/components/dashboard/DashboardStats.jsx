"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, PackageX, CalendarRange } from "lucide-react";
import axios from "axios";

export default function DashboardStats() {
    const [loading, setLoading] = useState(true);
    const [todayStats, setTodayStats] = useState({ totalSale: 0, totalItems: 0 });
    const [weekStats, setWeekStats] = useState({ totalSale: 0, totalItems: 0 });
    const [outOfStockCount, setOutOfStockCount] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [todayRes, weekRes, outRes] = await Promise.all([
                    axios.get("/api/stats/today"),
                    axios.get("/api/stats/week"),
                    axios.get("/api/products/out-of-stock"),
                ]);

                setTodayStats(todayRes.data);
                setWeekStats(weekRes.data);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Today’s Sales */}
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

            {/* This Week's Sales */}
            <Card className="shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-md font-medium text-muted-foreground">
                        This Week's Sale
                    </CardTitle>
                    <CalendarRange className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700">
                        {formatCurrency(weekStats.totalSale)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {weekStats.totalItems} items sold this week
                    </p>
                </CardContent>
            </Card>

            {/* Out of Stock */}
            <Card className="shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-md font-medium text-muted-foreground">
                        Out of Stock
                    </CardTitle>
                    <PackageX className="w-5 h-5 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                    <p className="text-xs text-muted-foreground">products need restocking</p>
                </CardContent>
            </Card>
        </div>
    );
}
