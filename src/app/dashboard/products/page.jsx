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
import axios from "axios";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "",
        categoryId: "",
        cost: 0,
        sellingPrice: 0,
        availableStock: 0,
        minStockLevel: 0,
        isActive: true,
        initialPurchase: false,
        initialPurchaseQty: 0,
        initialPurchaseDate: "",
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
            initialPurchase: false,
            initialPurchaseQty: 0,
            initialPurchaseDate: "",
        });
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

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
            initialPurchaseQty: form.initialPurchase ? Number(form.initialPurchaseQty) : 0,
            initialPurchaseDate: form.initialPurchase
                ? new Date(form.initialPurchaseDate)
                : null,
        };

        if (editingProduct) {
            await axios.put(`/api/products/${editingProduct._id}`, payload);
        } else {
            await axios.post("/api/products", payload);
        }

        fetchProducts();
        resetForm();
        setEditingProduct(null);
        setOpen(false);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name || "",
            categoryId: product.categoryId?._id || "",
            cost: product.cost || 0,
            sellingPrice: product.sellingPrice ?? 0,
            availableStock: product.availableStock ?? 0,
            minStockLevel: product.minStockLevel ?? 0,
            isActive: product.isActive ?? true,
            initialPurchase: !!product.initialPurchaseQty,
            initialPurchaseQty: product.initialPurchaseQty ?? 0,
            initialPurchaseDate: product.initialPurchaseDate
                ? new Date(product.initialPurchaseDate).toISOString().split("T")[0]
                : "",
        });
        setOpen(true);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingProduct(null);
                                resetForm();
                            }}
                        >
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800">
                                {editingProduct ? "Edit Product" : "Add Product"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-700">Is Active</Label>
                                    <select
                                        value={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
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

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                            >
                                {editingProduct ? "Update Product" : "Add Product"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">
                        Loading products...
                    </span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Selling</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Min Stock</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.categoryId?.name || "-"}</TableCell>
                                <TableCell>{product.cost}</TableCell>
                                <TableCell>{product.sellingPrice}</TableCell>
                                <TableCell>{product.availableStock}</TableCell>
                                <TableCell>{product.minStockLevel}</TableCell>
                                <TableCell>{product.isActive ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
