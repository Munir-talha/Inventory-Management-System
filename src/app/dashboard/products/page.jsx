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
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
    const [editingPurchase, setEditingPurchase] = useState(null);

    const itemsPerPage = 10;

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
            purchaseQty: Number(form.purchaseQty),
            purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : null,
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
            purchaseQty: 0,
            purchaseDate: "",
        });
        setOpen(true);
    };

    // const handleViewPurchaseHistory = (product) => {
    //     console.log(product)
    //     setSelectedProductForHistory(product);
    //     setPurchaseModalOpen(true);
    // };

    const handleEditPurchase = (purchase) => {
        setEditingPurchase(purchase);
    };

    const handleUpdatePurchase = async (e) => {
        e.preventDefault();
        await axios.put(`/api/products/${selectedProductForHistory._id}/purchase/${editingPurchase._id}`, {
            quantity: editingPurchase.quantity,
            date: new Date(editingPurchase.date),
            cost: editingPurchase.cost,
        });
        fetchProducts();
        setEditingPurchase(null);
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-sm text-gray-700">Purchase Date</Label>
                                <Input
                                    type="date"
                                    value={form.purchaseDate}
                                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                                    required
                                    className="bg-white text-black"
                                />
                            </div>

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
                                <div>
                                    <Label className="text-sm text-gray-700">Purchase Quantity</Label>
                                    <Input
                                        type="number"
                                        value={form.purchaseQty}
                                        onChange={(e) => setForm({ ...form, purchaseQty: e.target.value })}
                                        placeholder="Enter quantity"
                                        required
                                        className="bg-white text-black"
                                    />
                                </div>
                            </div>

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
                                    <TableHead>Actions</TableHead>
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
                                        <TableCell>{product.isActive ? "Yes" : "No"}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewPurchaseHistory(product)}
                                            >
                                                History
                                            </Button> */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
