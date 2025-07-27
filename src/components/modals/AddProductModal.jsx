"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function AddProductModal({ open, onOpenChange, onSaved }) {
    const [form, setForm] = useState({
        name: "",
        cost: 0,
        sellingPrice: 0,
        availableStock: 0,
        minStockLevel: 0,
        initialPurchase: false,
        initialPurchaseQty: 0,
        initialPurchaseDate: "",
        isActive: true,
        categoryId: "",
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (open) {
            axios.get("/api/categories").then((res) => setCategories(res.data.data));
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            cost: Number(form.cost),
            sellingPrice: Number(form.sellingPrice),
            availableStock: Number(form.availableStock),
            minStockLevel: Number(form.minStockLevel),
            initialPurchaseQty: form.initialPurchase ? Number(form.initialPurchaseQty) : 0,
            initialPurchaseDate: form.initialPurchase ? new Date(form.initialPurchaseDate) : null,
            isActive: form.isActive === true || form.isActive === "true",
        };

        await axios.post("/api/products", payload);
        onOpenChange(false);
        onSaved?.();
        resetForm();
    };

    const resetForm = () => {
        setForm({
            name: "",
            cost: 0,
            sellingPrice: 0,
            availableStock: 0,
            minStockLevel: 0,
            initialPurchase: false,
            initialPurchaseQty: 0,
            initialPurchaseDate: "",
            isActive: true,
            categoryId: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800">
                        Add New Product
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Name + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-700">Product Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                                className="bg-white text-black"
                            />
                        </div>
                        <div>
                            <Label className="text-sm text-gray-700">Category</Label>
                            <select
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                            >
                                <option value="" disabled>Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Cost + Selling Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-700">Cost (Buying)</Label>
                            <Input
                                type="number"
                                value={form.cost}
                                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                placeholder="Enter cost"
                                required
                                className="bg-white text-black"
                            />
                        </div>
                        <div>
                            <Label className="text-sm text-gray-700">Selling Price</Label>
                            <Input
                                type="number"
                                value={form.sellingPrice}
                                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                                placeholder="Enter selling price"
                                required
                                className="bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* Row 3: Stock + Min Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-700">Available Stock</Label>
                            <Input
                                type="number"
                                value={form.availableStock}
                                onChange={(e) => setForm({ ...form, availableStock: e.target.value })}
                                placeholder="Enter stock"
                                className="bg-white text-black"
                            />
                        </div>
                        <div>
                            <Label className="text-sm text-gray-700">Min Stock Level</Label>
                            <Input
                                type="number"
                                value={form.minStockLevel}
                                onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                                placeholder="Minimum threshold"
                                className="bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* Active + Initial Purchase Checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-gray-700">Is Active</Label>
                            <select
                                value={form.isActive}
                                onChange={(e) =>
                                    setForm({ ...form, isActive: e.target.value === "true" })
                                }
                                className="w-full border px-3 py-2 bg-white text-black rounded-md"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-6 space-x-2">
                            <input
                                type="checkbox"
                                id="initialPurchase"
                                checked={form.initialPurchase}
                                onChange={(e) =>
                                    setForm({ ...form, initialPurchase: e.target.checked })
                                }
                                className="w-4 h-4 accent-blue-600"
                            />
                            <Label htmlFor="initialPurchase" className="text-sm text-gray-700">
                                Add Initial Purchase?
                            </Label>
                        </div>
                    </div>

                    {/* Conditionally Rendered Initial Purchase Fields */}
                    {form.initialPurchase && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-dashed p-4 rounded-lg">
                            <div>
                                <Label className="text-sm text-gray-700">Initial Purchase Qty</Label>
                                <Input
                                    type="number"
                                    value={form.initialPurchaseQty}
                                    onChange={(e) =>
                                        setForm({ ...form, initialPurchaseQty: e.target.value })
                                    }
                                    placeholder="Quantity"
                                    className="bg-white text-black"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-gray-700">Initial Purchase Date</Label>
                                <Input
                                    type="date"
                                    value={form.initialPurchaseDate}
                                    onChange={(e) =>
                                        setForm({ ...form, initialPurchaseDate: e.target.value })
                                    }
                                    className="bg-white text-black"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                        Add Product
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
