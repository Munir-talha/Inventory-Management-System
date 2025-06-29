"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        cost: 0,
        availableStock: 0,
        initialPurchaseQty: 0,
        isActive: true,
        categoryId: "",
    });

    const resetForm = () => {
        setForm({
            name: "",
            cost: 0,
            availableStock: 0,
            initialPurchaseQty: 0,
            isActive: true,
            categoryId: "",
        });
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/products");
            setProducts(res.data.data);
            console.log("Fetched products:", res.data.data);
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
            availableStock: Number(form.availableStock),
            initialPurchaseQty: Number(form.initialPurchaseQty),
            isActive: form.isActive === true || form.isActive === "true", // ensure it's boolean
        };
        if (editingProduct) {
            await axios.put(`/api/products/${editingProduct._id}`, payload);
        } else {
            await axios.post("/api/products", payload);
        }
        setOpen(false);
        resetForm();
        setEditingProduct(null);
        fetchProducts();
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            cost: product.cost,
            availableStock: product.availableStock || 0,
            initialPurchaseQty: product.initialPurchaseQty || 0,
            isActive: product.isActive,
            categoryId: product.categoryId?._id || "",

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
                <h1 className="text-2xl font-bold">Items</h1>
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
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold mb-4">
                                {editingProduct ? "Edit" : "Add"} Product
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Product name"
                                    className="bg-white text-black"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* cost */}
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    placeholder="Enter cost"
                                    className="bg-white text-black"
                                    value={form.cost}
                                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                    required
                                />
                            </div>

                            {/* availableStock */}
                            <div className="space-y-2">
                                <Label htmlFor="availableStock">Available Stock</Label>
                                <Input
                                    id="availableStock"
                                    type="number"
                                    placeholder="Enter available stock"
                                    className="bg-white text-black"
                                    value={form.availableStock}
                                    onChange={(e) => setForm({ ...form, availableStock: e.target.value })}
                                />
                            </div>

                            {/* initialPurchaseQty */}
                            <div className="space-y-2">
                                <Label htmlFor="initialPurchaseQty">Initial Purchase Qty</Label>
                                <Input
                                    id="initialPurchaseQty"
                                    type="number"
                                    placeholder="Enter initial quantity"
                                    className="bg-white text-black"
                                    value={form.initialPurchaseQty}
                                    onChange={(e) => setForm({ ...form, initialPurchaseQty: Number(e.target.value) })}
                                />
                            </div>

                            {/* isActive */}
                            <div className="space-y-2">
                                <Label htmlFor="isActive">Is Active</Label>
                                <select
                                    id="isActive"
                                    value={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>

                            {/* category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    value={form.categoryId}
                                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-black"
                                    required
                                >
                                    <option value="" disabled>Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" className="w-full">
                                {editingProduct ? "Update" : "Add"} Product
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading items...</span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Initial Qty</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.cost}</TableCell>
                                <TableCell>{product.availableStock}</TableCell>
                                <TableCell>{product?.initialPurchaseQty}</TableCell>
                                <TableCell>{product.isActive ? "Yes" : "No"}</TableCell>
                                <TableCell>{product.categoryId?.name || "-"}</TableCell>
                                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
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
};

export default ProductsPage;
