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
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingProduct(null);
                                resetForm();
                            }}
                        >
                            + Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border border-gray-200 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800">
                                {editingProduct ? "Edit Product" : "Add Product"}
                            </DialogTitle>
                        </DialogHeader>

                        {/* FORM CONTENT (unchanged) */}
                        {/* Keep same form code as you've already pasted — it's complete and working. */}
                        {/* You can copy that back here as-is. */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Table */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading products...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <Input
                        placeholder="Search by product name..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <div className="overflow-auto rounded-lg border border-gray-200">
                        <Table className="min-w-[900px]">
                            <TableHeader className="sticky top-0 bg-white shadow z-10">
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
                                {paginatedProducts.map((product) => (
                                    <TableRow key={product._id} className="hover:bg-gray-50">
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.categoryId?.name || "-"}</TableCell>
                                        <TableCell>{product.cost}</TableCell>
                                        <TableCell>{product.sellingPrice}</TableCell>
                                        <TableCell>{product.availableStock}</TableCell>
                                        <TableCell>{product.minStockLevel}</TableCell>
                                        <TableCell>
                                            {product.isActive ? "Yes" : "No"}
                                        </TableCell>
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
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={endIndex >= filteredProducts.length}
                                onClick={() => setCurrentPage((p) => p + 1)}
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
