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
import { Plus, Edit, Trash2, ShoppingBag, Search, TrendingUp } from "lucide-react";
import axios from "axios";

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [itemSearchQuery, setItemSearchQuery] = useState("");
    const itemsPerPage = 10;

    const [form, setForm] = useState({
        itemId: "",
        quantity: 1,
        sellingPricePerItem: 0,
        paymentMode: "cash",
        dateOfSale: new Date().toISOString().split('T')[0],
    });

    const resetForm = () => {
        setForm({
            itemId: "",
            quantity: 1,
            sellingPricePerItem: 0,
            paymentMode: "cash",
            dateOfSale: new Date().toISOString().split('T')[0],
        });
        setItemSearchQuery("");
    };

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/sales");
            setSales(res.data.data);
        } catch (error) {
            console.error("Failed to fetch sales:", error);
            alert("Failed to fetch sales");
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchases = async () => {
        try {
            const res = await axios.get("/api/purchases");
            console.log("purchases data: ", res.data.data);
            setPurchases(res.data.data);
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
        }
    };

    const fetchInventory = async () => {
        try {
            const res = await axios.get("/api/inventory");
            setInventory(res.data.data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...form,
                quantity: Number(form.quantity),
                sellingPricePerItem: Number(form.sellingPricePerItem),
                dateOfSale: new Date(form.dateOfSale),
            };

            if (editingSale) {
                await axios.put(`/api/sales/${editingSale._id}`, payload);
                alert("Sale updated successfully!");
            } else {
                await axios.post("/api/sales", payload);
                alert("Sale recorded successfully!");
            }

            fetchSales();
            fetchInventory(); // Refresh inventory after sale
            resetForm();
            setEditingSale(null);
            setOpen(false);
        } catch (error) {
            console.error("Error saving sale:", error);
            const message = error.response?.data?.message || "Failed to save sale";
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (sale) => {
        setEditingSale(sale);
        setForm({
            itemId: sale.itemId?._id || "",
            quantity: sale.quantity || 1,
            sellingPricePerItem: sale.sellingPricePerItem || 0,
            // paymentMode: sale.paymentMode || "cash",
            dateOfSale: new Date(sale.dateOfSale).toISOString().split('T')[0],
        });
        setItemSearchQuery(sale.itemId?.name || "");
        setOpen(true);
    };

    const handleDelete = async (sale) => {
        if (!confirm(`Are you sure you want to delete this sale record?`)) return;

        try {
            await axios.delete(`/api/sales/${sale._id}`);
            alert("Sale deleted successfully!");
            fetchSales();
            fetchInventory(); // Refresh inventory after deletion
        } catch (error) {
            console.error("Error deleting sale:", error);
            alert("Failed to delete sale");
        }
    };

    useEffect(() => {
        fetchSales();
        fetchPurchases();
        fetchInventory();
    }, []);

    const filteredSales = sales.filter((sale) =>
        sale.itemId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get unique items from purchases for the dropdownapi/sales
    const getUniqueItems = () => {
        const itemsMap = new Map();
        purchases.forEach(purchase => {
            if (purchase.itemId && purchase.isActive) {
                const itemId = purchase.itemId._id;
                const item = purchase.itemId;
                if (!itemsMap.has(itemId)) {
                    itemsMap.set(itemId, {
                        ...item,
                        costPerUnit: purchase.costPerUnit, // Add cost from purchase
                        purchaseId: purchase._id
                    });
                }
            }
        });
        return Array.from(itemsMap.values());
    };

    const uniqueItems = getUniqueItems();

    const filteredItems = uniqueItems.filter((item) =>
        item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Get current stock for selected item
    const getAvailableStock = (itemId) => {
        console.log('Looking for itemId:', itemId);
        console.log('Available inventory:', inventory);
        const inventoryItem = inventory.find(inv => {
            console.log('Comparing:', inv.itemId, 'with', itemId);
            return inv.itemId.toString() === itemId.toString();
        });
        console.log('Found inventory item:', inventoryItem);
        return inventoryItem ? inventoryItem.currentStock : 0;
    };

    const selectedItem = form.itemId ? uniqueItems.find(item => item._id === form.itemId) : null;
    const availableStock = selectedItem ? getAvailableStock(selectedItem._id) : 0;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Sales Records</h1>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingSale(null);
                                resetForm();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Record Sale
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                                {editingSale ? "Edit Sale" : "Record New Sale"}
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
                                        className="bg-white text-black border-gray-300 focus:border-blue-500"
                                    />
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                                {itemSearchQuery && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                        {filteredItems.map((item) => {
                                            const stock = getAvailableStock(item._id);
                                            return (
                                                <div
                                                    key={item._id}
                                                    onClick={() => {
                                                        setForm({ ...form, itemId: item._id });
                                                        setItemSearchQuery(item.name);
                                                    }}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                >
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-gray-500 flex justify-between">
                                                        <span>{item.categoryId?.name}</span>
                                                        <span className={`font-medium ${stock <= 0 ? 'text-red-600' : stock <= item.minStockLevel ? 'text-orange-600' : 'text-green-600'}`}>
                                                            Stock: {stock}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Cost: {formatCurrency(item.costPerUnit)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredItems.length === 0 && (
                                            <div className="p-3 text-gray-500 text-center">No items found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedItem && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Available Stock</Label>
                                            <p className={`text-lg font-semibold ${availableStock <= 0 ? 'text-red-600' : availableStock <= selectedItem.minStockLevel ? 'text-orange-600' : 'text-green-600'}`}>
                                                {availableStock} units
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Category</Label>
                                            <p className="text-lg font-medium text-gray-800">
                                                {selectedItem.categoryId?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Cost per Unit</Label>
                                            <p className="text-lg font-medium text-gray-800">
                                                {formatCurrency(selectedItem.costPerUnit)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Min Stock Level</Label>
                                            <p className="text-lg font-medium text-gray-800">
                                                {selectedItem.minStockLevel} units
                                            </p>
                                        </div>
                                    </div>
                                    {availableStock <= 0 && (
                                        <div className="mt-2 text-sm text-red-600 font-medium">
                                            ⚠️ Item is out of stock
                                        </div>
                                    )}
                                    {availableStock > 0 && availableStock <= selectedItem.minStockLevel && (
                                        <div className="mt-2 text-sm text-orange-600 font-medium">
                                            ⚠️ Low stock warning
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Sale Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.dateOfSale}
                                        onChange={(e) => setForm({ ...form, dateOfSale: e.target.value })}
                                        required
                                        className="bg-white text-black border-gray-300 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Payment Mode *
                                    </Label>
                                    <select
                                        value={form.paymentMode}
                                        onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        max={availableStock}
                                        className="bg-white text-black border-gray-300 focus:border-blue-500"
                                    />
                                    {form.quantity > availableStock && availableStock > 0 && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Only {availableStock} units available
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Selling Price per Unit (PKR) *
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.sellingPricePerItem}
                                        onChange={(e) => setForm({ ...form, sellingPricePerItem: e.target.value })}
                                        placeholder="Enter selling price"
                                        required
                                        min="0"
                                        className="bg-white text-black border-gray-300 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {form.sellingPricePerItem && form.quantity && selectedItem && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="space-y-2">
                                        <div className="text-sm text-blue-700 font-medium">
                                            Total Sale Amount: {formatCurrency(Number(form.sellingPricePerItem) * Number(form.quantity))}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Cost: {formatCurrency(selectedItem.costPerUnit * Number(form.quantity))}
                                        </div>
                                        <div className={`text-sm font-medium ${(Number(form.sellingPricePerItem) - selectedItem.costPerUnit) * Number(form.quantity) >= 0
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                            }`}>
                                            Estimated Profit: {formatCurrency((Number(form.sellingPricePerItem) - selectedItem.costPerUnit) * Number(form.quantity))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting || !form.itemId || availableStock <= 0 || form.quantity > availableStock}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 py-2.5 rounded-lg font-medium disabled:opacity-50"
                            >
                                {submitting
                                    ? (editingSale ? "Updating..." : "Recording...")
                                    : (editingSale ? "Update Sale" : "Record Sale")
                                }
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full" />
                    <span className="ml-3 text-gray-600">Loading sales...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Input
                            placeholder="Search by item name..."
                            className="max-w-md border-gray-300 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <div className="text-sm text-gray-500">
                            Total Records: {filteredSales.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Item</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Cost/Unit</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Selling Price</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Total</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Profit</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSales.map((sale) => (
                                    <TableRow key={sale._id} className="hover:bg-gray-50">
                                        <TableCell>
                                            {new Date(sale.dateOfSale).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div>
                                                {sale.itemId?.name || "N/A"}
                                                <div className="text-xs text-gray-500">
                                                    {sale.itemId?.categoryId?.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{sale.quantity}</TableCell>
                                        <TableCell>{formatCurrency(sale.costPerItem)}</TableCell>
                                        <TableCell>{formatCurrency(sale.sellingPricePerItem)}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(sale.total)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(sale.profit)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.paymentMode === 'cash'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {sale.paymentMode}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(sale)}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(sale)}
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
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} of {filteredSales.length} sales
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
                                disabled={endIndex >= filteredSales.length}
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