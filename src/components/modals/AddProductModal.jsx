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

export default function AddOrEditProductModal({ open, onOpenChange, onSaved, editingProduct = null }) {
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name: "",
        categoryId: "",
        cost: 0,
        sellingPrice: 0,
        availableStock: 0,
        minStockLevel: 0,
        isActive: true,
        purchaseQty: 0,
        purchaseDate: "",
    });

    const resetForm = () => {
        setForm({
            name: "",
            categoryId: "",
            cost: 0,
            sellingPrice: 0,
            availableStock: 0,
            minStockLevel: 0,
            isActive: true,
            purchaseQty: 0,
            purchaseDate: "",
        });
    };

    useEffect(() => {
        if (open) {
            fetchCategories();
            if (editingProduct) {
                setForm({
                    name: editingProduct.name || "",
                    categoryId: editingProduct.categoryId?._id || "",
                    cost: editingProduct.cost || 0,
                    sellingPrice: editingProduct.sellingPrice ?? 0,
                    availableStock: editingProduct.availableStock ?? 0,
                    minStockLevel: editingProduct.minStockLevel ?? 0,
                    isActive: editingProduct.isActive ?? true,
                    purchaseQty: 0,
                    purchaseDate: "",
                });
            } else {
                resetForm();
            }
        }
    }, [open, editingProduct]);

    const fetchCategories = async () => {
        const res = await axios.get("/api/categories");
        setCategories(res.data.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            cost: Number(form.cost),
            sellingPrice: Number(form.sellingPrice),
            availableStock: Number(form.availableStock),
            minStockLevel: Number(form.minStockLevel),
            isActive: form.isActive === true || form.isActive === "true",
            purchaseQty: Number(form.purchaseQty),
            purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : null,
        };

        if (editingProduct) {
            await axios.put(`/api/products/${editingProduct._id}`, payload);
        } else {
            await axios.post("/api/products", payload);
        }

        onSaved?.();
        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800">
                        {editingProduct ? "Edit Product" : "Add Product"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Purchase Qty */}
                    <div>
                        <Label className="text-sm text-gray-700">Purchase Quantity</Label>
                        <Input
                            type="number"
                            value={form.purchaseQty}
                            onChange={(e) =>
                                setForm({ ...form, purchaseQty: e.target.value })
                            }
                            placeholder="Enter purchase quantity"
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Purchase Date */}
                    <div>
                        <Label className="text-sm text-gray-700">Purchase Date</Label>
                        <Input
                            type="date"
                            value={form.purchaseDate}
                            onChange={(e) =>
                                setForm({ ...form, purchaseDate: e.target.value })
                            }
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Product Name */}
                    <div>
                        <Label className="text-sm text-gray-700">Product Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Enter product name"
                            required
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label className="text-sm text-gray-700">Category</Label>
                        <select
                            value={form.categoryId}
                            onChange={(e) =>
                                setForm({ ...form, categoryId: e.target.value })
                            }
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

                    {/* Cost */}
                    <div>
                        <Label className="text-sm text-gray-700">Cost</Label>
                        <Input
                            type="number"
                            value={form.cost}
                            onChange={(e) =>
                                setForm({ ...form, cost: e.target.value })
                            }
                            placeholder="Enter cost"
                            required
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Selling Price */}
                    <div>
                        <Label className="text-sm text-gray-700">Selling Price</Label>
                        <Input
                            type="number"
                            value={form.sellingPrice}
                            onChange={(e) =>
                                setForm({ ...form, sellingPrice: e.target.value })
                            }
                            placeholder="Enter selling price"
                            required
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Available Stock */}
                    <div>
                        <Label className="text-sm text-gray-700">Available Stock</Label>
                        <Input
                            type="number"
                            value={form.availableStock}
                            onChange={(e) =>
                                setForm({ ...form, availableStock: e.target.value })
                            }
                            placeholder="Enter stock quantity"
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Min Stock Level */}
                    <div>
                        <Label className="text-sm text-gray-700">Minimum Stock Level</Label>
                        <Input
                            type="number"
                            value={form.minStockLevel}
                            onChange={(e) =>
                                setForm({ ...form, minStockLevel: e.target.value })
                            }
                            placeholder="Enter minimum level"
                            className="bg-white text-black"
                        />
                    </div>

                    {/* Is Active */}
                    <div>
                        <Label className="text-sm text-gray-700">Is Active</Label>
                        <select
                            value={form.isActive}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    isActive: e.target.value === "true",
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                        {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
