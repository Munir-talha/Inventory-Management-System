"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowRightLeft,
    Wallet,
    Smartphone,
    Building2,
    CalendarDays,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Receipt
} from "lucide-react";

export default function TransferPage() {
    const [date, setDate] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [data, setData] = useState(null);
    const [transfers, setTransfers] = useState({
        cash: "",
        easypaisa: "",
        bank: "",
    });
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        fetchData(date);
    }, []);

    const fetchData = async (selectedDate) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reports/transfer?date=${selectedDate}`);
            const result = await response.json();

            if (result.success) {
                const responseData = result.data;
                setData(responseData);

                setTransfers({
                    cash: responseData.transfers.cash || "",
                    easypaisa: responseData.transfers.easypaisa || "",
                    bank: responseData.transfers.bank || "",
                });

                setNote(responseData.note || "");
            } else {
                console.error("Error fetching data:", result.message);
                setData(null);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClick = () => {
        if (isOverLimit() || getTotalTransfer() === 0) return;
        setShowConfirmation(true);
    };

    const handleConfirmedSubmit = async () => {
        const totalTransfer =
            Number(transfers.cash || 0) +
            Number(transfers.easypaisa || 0) +
            Number(transfers.bank || 0);

        setSaving(true);
        try {
            const response = await fetch("/api/reports/transfer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date,
                    transfers: {
                        cash: Number(transfers.cash || 0),
                        easypaisa: Number(transfers.easypaisa || 0),
                        bank: Number(transfers.bank || 0),
                    },
                    note,
                }),
            });

            const result = await response.json();

            if (result.success) {
                await fetchData(date);
                setShowConfirmation(false);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (err) {
            console.error("Error saving transfer:", err);
            alert("Failed to save transfer. Please try again.");
        } finally {
            setSaving(false);
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

    const getTotalTransfer = () => {
        return Number(transfers.cash || 0) + Number(transfers.easypaisa || 0) + Number(transfers.bank || 0);
    };

    const isOverLimit = () => {
        return getTotalTransfer() > (data?.totalSales || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Not recorded";
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                    Daily Transfer Management
                </h1>
                <div className="flex gap-4 items-center">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-[200px] bg-white"
                    />
                    <Button onClick={() => fetchData(date)} className="bg-blue-600 hover:bg-blue-700">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const today = new Date().toISOString().slice(0, 10);
                            setDate(today);
                            fetchData(today);
                        }}
                    >
                        Today
                    </Button>
                </div>
            </div>

            {!data ? (
                <Card className="p-8 text-center">
                    <CardContent>
                        <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-muted-foreground">No sales data found for {date}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Please select a date with sales transactions to manage transfers.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sales Summary Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    Sales Summary
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Financial overview for {date}</p>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Total Sales</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatCurrency(data.totalSales)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Transferred</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {formatCurrency(data.totalTransferred)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Remaining</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {formatCurrency(data.remaining)}
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Receipt className="h-4 w-4" />
                                    {data.totalTransactions} transactions recorded
                                </div>

                                {data.updatedAt && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Last updated: {formatDateTime(data.updatedAt)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Transfer Progress */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    Transfer Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{Math.min(100, Math.round((data.totalTransferred / Math.max(data.totalSales, 1)) * 100))}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(100, (data.totalTransferred / Math.max(data.totalSales, 1)) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                    {data.remaining > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(data.remaining)} remaining to transfer
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transfer Form Section */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ArrowRightLeft className="h-5 w-5 text-green-600" />
                                    Record Money Transfer
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Allocate sales revenue across different payment methods
                                </p>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Cash Transfer */}
                                    <div className="space-y-2">
                                        <Label htmlFor="cash" className="flex items-center gap-2 text-sm font-medium">
                                            <Wallet className="h-4 w-4 text-green-600" />
                                            Cash Transfer
                                        </Label>
                                        <Input
                                            id="cash"
                                            type="number"
                                            placeholder="0"
                                            value={transfers.cash}
                                            onChange={(e) =>
                                                setTransfers({ ...transfers, cash: e.target.value })
                                            }
                                            className="text-right"
                                            min="0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Physical cash transferred
                                        </p>
                                    </div>

                                    {/* Easypaisa Transfer */}
                                    <div className="space-y-2">
                                        <Label htmlFor="easypaisa" className="flex items-center gap-2 text-sm font-medium">
                                            <Smartphone className="h-4 w-4 text-pink-600" />
                                            Easypaisa Transfer
                                        </Label>
                                        <Input
                                            id="easypaisa"
                                            type="number"
                                            placeholder="0"
                                            value={transfers.easypaisa}
                                            onChange={(e) =>
                                                setTransfers({ ...transfers, easypaisa: e.target.value })
                                            }
                                            className="text-right"
                                            min="0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Mobile wallet transfer
                                        </p>
                                    </div>

                                    {/* Bank Transfer */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bank" className="flex items-center gap-2 text-sm font-medium">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                            Bank Transfer
                                        </Label>
                                        <Input
                                            id="bank"
                                            type="number"
                                            placeholder="0"
                                            value={transfers.bank}
                                            onChange={(e) =>
                                                setTransfers({ ...transfers, bank: e.target.value })
                                            }
                                            className="text-right"
                                            min="0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Bank account transfer
                                        </p>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="space-y-2 mb-6">
                                    <Label htmlFor="note" className="text-sm font-medium">
                                        Additional Notes (Optional)
                                    </Label>
                                    <Textarea
                                        id="note"
                                        placeholder="Add any notes about this transfer..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                {/* Transfer Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium mb-3">Transfer Summary</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Transfer:</span>
                                            <span className="font-medium">{formatCurrency(getTotalTransfer())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Remaining Sales:</span>
                                            <span className="font-medium">{formatCurrency((data.totalSales || 0) - getTotalTransfer())}</span>
                                        </div>
                                    </div>

                                    {isOverLimit() && (
                                        <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            Transfer amount cannot exceed total sales!
                                        </div>
                                    )}
                                </div>

                                {/* Confirmation Section */}
                                {showConfirmation && (
                                    <Alert className="mb-6 border-blue-200 bg-blue-50">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            <div className="space-y-2">
                                                <p className="font-medium">Confirm Transfer Details:</p>
                                                <div className="text-sm space-y-1">
                                                    <p><strong>Date:</strong> {date}</p>
                                                    <p><strong>Total Amount:</strong> {formatCurrency(getTotalTransfer())}</p>
                                                    <div className="ml-4 space-y-1">
                                                        {transfers.cash && <p>• Cash: {formatCurrency(Number(transfers.cash))}</p>}
                                                        {transfers.easypaisa && <p>• Easypaisa: {formatCurrency(Number(transfers.easypaisa))}</p>}
                                                        {transfers.bank && <p>• Bank: {formatCurrency(Number(transfers.bank))}</p>}
                                                    </div>
                                                    {note && <p><strong>Note:</strong> {note}</p>}
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleConfirmedSubmit}
                                                        disabled={saving}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {saving ? "Saving..." : "✓ Confirm & Save"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setShowConfirmation(false)}
                                                        disabled={saving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    {!showConfirmation ? (
                                        <>
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                disabled={isOverLimit() || getTotalTransfer() === 0}
                                                onClick={handleSaveClick}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Save Transfer Record
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setTransfers({ cash: "", easypaisa: "", bank: "" });
                                                    setNote("");
                                                }}
                                            >
                                                Clear Form
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setTransfers({ cash: "", easypaisa: "", bank: "" });
                                                setNote("");
                                                setShowConfirmation(false);
                                            }}
                                            className="flex-1"
                                        >
                                            Clear All & Cancel
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}