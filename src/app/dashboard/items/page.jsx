//app/dashboard/items/page.jsx
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
import { Plus, Edit, Trash2, Package } from "lucide-react";
import axios from "axios";

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const itemsPerPage = 10;

    const [form, setForm] = useState({
        name: "",
        categoryId: "",
        minStockLevel: 0,
        isActive: true,
    });

    const resetForm = () => {
        setForm({
            name: "",
            categoryId: "",
            minStockLevel: 0,
            isActive: true,
        });
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/items");
            setItems(res.data.data);
        } catch (error) {
            console.error("Failed to fetch items:", error);
            alert("Failed to fetch items");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/api/categories");
            setCategories(res.data.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...form,
                minStockLevel: Number(form.minStockLevel),
                isActive: form.isActive === true || form.isActive === "true",
            };

            if (editingItem) {
                await axios.put(`/api/items/${editingItem._id}`, payload);
                alert("Item updated successfully!");
            } else {
                await axios.post("/api/items", payload);
                alert("Item added successfully!");
            }

            fetchItems();
            resetForm();
            setEditingItem(null);
            setOpen(false);
        } catch (error) {
            console.error("Error saving item:", error);
            const message = error.response?.data?.message || "Failed to save item";
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name || "",
            categoryId: item.categoryId?._id || "",
            minStockLevel: item.minStockLevel || 0,
            isActive: item.isActive ?? true,
        });
        setOpen(true);
    };

    const handleDelete = async (item) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            await axios.delete(`/api/items/${item._id}`);
            alert("Item deleted successfully!");
            fetchItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item");
        }
    };

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Items Catalog</h1>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingItem(null);
                                resetForm();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <Package className="h-6 w-6 text-blue-600" />
                                {editingItem ? "Edit Item" : "Add New Item"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Item Name *
                                </Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter item name (e.g., Honda Tire)"
                                    required
                                    className="bg-white text-black border-gray-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Category *
                                </Label>
                                <select
                                    value={form.categoryId}
                                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="" disabled>
                                        Select category
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Minimum Stock Level
                                </Label>
                                <Input
                                    type="number"
                                    value={form.minStockLevel}
                                    onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                                    placeholder="Alert when stock goes below this level"
                                    min="0"
                                    className="bg-white text-black border-gray-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Status
                                </Label>
                                <select
                                    value={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 py-2.5 rounded-lg font-medium"
                            >
                                {submitting
                                    ? (editingItem ? "Updating..." : "Adding...")
                                    : (editingItem ? "Update Item" : "Add Item")
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
                    <span className="ml-3 text-gray-600">Loading items...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Input
                            placeholder="Search items by name or category..."
                            className="max-w-md border-gray-300 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <div className="text-sm text-gray-500">
                            Total Items: {filteredItems.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">Item Name</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Min Stock Level</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedItems.map((item) => (
                                    <TableRow key={item._id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.categoryId?.name || "-"}</TableCell>
                                        <TableCell>{item.minStockLevel}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(item)}
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
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
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
                                disabled={endIndex >= filteredItems.length}
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