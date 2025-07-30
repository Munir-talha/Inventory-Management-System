//app/dashboard/purchases/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, ShoppingCart, Search } from "lucide-react";
import axios from "axios";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState([]);
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [itemSearchQuery, setItemSearchQuery] = useState("");
    const itemsPerPage = 10;

    const [form, setForm] = useState({
        itemId: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        costPerUnit: 0,
        quantity: 1,
        supplier: "",
        notes: "",
    });

    const resetForm = () => {
        setForm({
            itemId: "",
            purchaseDate: new Date().toISOString().split('T')[0],
            costPerUnit: 0,
            quantity: 1,
            supplier: "",
            notes: "",
        });
        setItemSearchQuery("");
    };

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/purchases");
            setPurchases(res.data.data);
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
            alert("Failed to fetch purchases");
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await axios.get("/api/items");
            setItems(res.data.data);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...form,
                costPerUnit: Number(form.costPerUnit),
                quantity: Number(form.quantity),
                purchaseDate: new Date(form.purchaseDate),
                totalCost: Number(form.costPerUnit) * Number(form.quantity),
            };

            if (editingPurchase) {
                await axios.put(`/api/purchases/${editingPurchase._id}`, payload);
                alert("Purchase updated successfully!");
            } else {
                console.log("Pay: ", payload)
                await axios.post("/api/purchases", payload);
                alert("Purchase recorded successfully!");
            }

            fetchPurchases();
            resetForm();
            setEditingPurchase(null);
            setOpen(false);
        } catch (error) {
            console.error("Error saving purchase:", error);
            const message = error.response?.data?.message || "Failed to save purchase";
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (purchase) => {
        setEditingPurchase(purchase);
        setForm({
            itemId: purchase.itemId?._id || "",
            purchaseDate: new Date(purchase.purchaseDate).toISOString().split('T')[0],
            costPerUnit: purchase.costPerUnit || 0,
            quantity: purchase.quantity || 1,
            supplier: purchase.supplier || "",
            notes: purchase.notes || "",
        });
        setItemSearchQuery(purchase.itemId?.name || "");
        setOpen(true);
    };

    const handleDelete = async (purchase) => {
        if (!confirm(`Are you sure you want to delete this purchase record?`)) return;

        try {
            await axios.delete(`/api/purchases/${purchase._id}`);
            alert("Purchase deleted successfully!");
            fetchPurchases();
        } catch (error) {
            console.error("Error deleting purchase:", error);
            alert("Failed to delete purchase");
        }
    };

    useEffect(() => {
        fetchPurchases();
        fetchItems();
    }, []);

    const filteredPurchases = purchases.filter((purchase) =>
        purchase.itemId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Purchase Records</h1>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingPurchase(null);
                                resetForm();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Record Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <ShoppingCart className="h-6 w-6 text-green-600" />
                                {editingPurchase ? "Edit Purchase" : "Record New Purchase"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Select Item *
                                </Label>
                                <div className="relative">
                                    <Input
                                        value={itemSearchQuery}
                                        onChange={(e) => setItemSearchQuery(e.target.value)}
                                        placeholder="Search for an item..."
                                        className="bg-white text-black border-gray-300 focus:border-green-500"
                                    />
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                                {itemSearchQuery && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                        {filteredItems.map((item) => (
                                            <div
                                                key={item._id}
                                                onClick={() => {
                                                    setForm({ ...form, itemId: item._id });
                                                    setItemSearchQuery(item.name);
                                                }}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                            >
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.categoryId?.name}</div>
                                            </div>
                                        ))}
                                        {filteredItems.length === 0 && (
                                            <div className="p-3 text-gray-500 text-center">No items found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Purchase Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.purchaseDate}
                                        onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                                        required
                                        className="bg-white text-black border-gray-300 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Supplier
                                    </Label>
                                    <Input
                                        value={form.supplier}
                                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                        placeholder="Supplier name (optional)"
                                        className="bg-white text-black border-gray-300 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Cost per Unit (PKR) *
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.costPerUnit}
                                        onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                                        placeholder="Enter cost per unit"
                                        required
                                        min="0"
                                        className="bg-white text-black border-gray-300 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Quantity *
                                    </Label>
                                    <Input
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        placeholder="Enter quantity"
                                        required
                                        min="1"
                                        className="bg-white text-black border-gray-300 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {form.costPerUnit && form.quantity && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="text-sm text-green-700 font-medium">
                                        Total Cost: {formatCurrency(Number(form.costPerUnit) * Number(form.quantity))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Notes
                                </Label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional notes (optional)"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:border-green-500 focus:outline-none resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || !form.itemId}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 py-2.5 rounded-lg font-medium disabled:opacity-50"
                            >
                                {submitting
                                    ? (editingPurchase ? "Updating..." : "Recording...")
                                    : (editingPurchase ? "Update Purchase" : "Record Purchase")
                                }
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-green-600 rounded-full" />
                    <span className="ml-3 text-gray-600">Loading purchases...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Input
                            placeholder="Search by item name or supplier..."
                            className="max-w-md border-gray-300 focus:border-green-500"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <div className="text-sm text-gray-500">
                            Total Records: {filteredPurchases.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Item</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Cost/Unit</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Total</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPurchases.map((purchase) => (
                                    <TableRow key={purchase._id} className="hover:bg-gray-50">
                                        <TableCell>
                                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div>
                                                {purchase.itemId?.name || "N/A"}
                                                <div className="text-xs text-gray-500">
                                                    {purchase.itemId?.categoryId?.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{purchase.supplier || "-"}</TableCell>
                                        <TableCell>{purchase.quantity}</TableCell>
                                        <TableCell>{formatCurrency(purchase.costPerUnit)}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(purchase.totalCost)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(purchase)}
                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(purchase)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredPurchases.length)} of {filteredPurchases.length} purchases
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="border-gray-300"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={endIndex >= filteredPurchases.length}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="border-gray-300"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}