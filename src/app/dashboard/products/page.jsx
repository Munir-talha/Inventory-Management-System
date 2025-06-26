// app/dashboard/products/page.tsx (or .jsx if you're not using TypeScript)

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
        cost: "",
        stock: "",
        categoryId: "",
    });

    const fetchProducts = async () => {
        setLoading(true); // start loader
        try {
            const res = await axios.get("/api/products");
            setProducts(res.data.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false); // stop loader
        }
    };

    const fetchCategories = async () => {
        const res = await axios.get("/api/categories");
        setCategories(res.data.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingProduct) {
            await axios.put(`/api/products/${editingProduct._id}`, form);
        } else {
            await axios.post("/api/products", form);
        }
        setOpen(false);
        setForm({ name: "", cost: "", stock: "", categoryId: "" });
        setEditingProduct(null);
        fetchProducts();
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            cost: product.cost,
            stock: product.stock,
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
                <h1 className="text-2xl font-bold">Products</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingProduct(null)}>Add Product</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold mb-4">
                                {editingProduct ? "Edit" : "Add"} Product
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="Enter stock"
                                    className="bg-white text-black"
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    required
                                />
                            </div>
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
                    {/* Replace this with a spinner or skeleton later */}
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading products...</span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Stock</TableHead>
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
                                <TableCell>{product.stock}</TableCell>
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