"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/dashboard/DashboardStats";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function PurchasesPage() {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [form, setForm] = useState({
        productId: "",
        quantity: 1,
        costPerItem: 0,
        dateOfPurchase: new Date().toISOString().split("T")[0],
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [filterDate, setFilterDate] = useState("");

    useEffect(() => {
        axios.get("/api/products").then((res) => setProducts(res.data.data));
        fetchPurchases();
    }, []);

    const fetchPurchases = async (date) => {
        const url = date ? `/api/purchases?date=${date}` : "/api/purchases";
        const res = await axios.get(url);
        setPurchases(res.data.data);
    };

    const handleProductSelect = (productId) => {
        const product = products.find((p) => p._id === productId);
        setSelectedProduct(product);
        setForm({
            ...form,
            productId,
            costPerItem: product.cost,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!selectedProduct || !form.quantity || form.quantity <= 0) {
            setError("Invalid form");
            return;
        }

        if (!selectedProduct.isActive) {
            setError("Product is inactive / out of stock");
            return;
        }

        if (form.quantity > selectedProduct.availableStock) {
            setError("Not enough stock available");
            return;
        }

        try {
            await axios.post("/api/purchases", form);
            setOpen(false);
            setForm({
                productId: "",
                quantity: 1,
                costPerItem: 0,
                dateOfPurchase: new Date().toISOString().split("T")[0],
            });
            setSelectedProduct(null);
            fetchPurchases();
        } catch (err) {
            setError("Failed to save purchase");
        }
    };

    <DashboardStats />
    return (
        <div className="p-4">
            <DashboardStats />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchases</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md"
                            onClick={() => setError("")}
                        >
                            + New Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white p-6 rounded-xl shadow-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">New Purchase</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Select Product</Label>
                                <select
                                    className="w-full border p-2 rounded text-black"
                                    value={form.productId}
                                    onChange={(e) => handleProductSelect(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Select a product
                                    </option>
                                    {products.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.name} {product.isActive ? "" : "(Inactive)"}
                                        </option>
                                    ))}
                                </select>
                                {selectedProduct && !selectedProduct.isActive && (
                                    <p className="text-sm text-red-500">This product is inactive or out of stock</p>
                                )}
                            </div>

                            {selectedProduct && (
                                <>
                                    <div className="space-y-1">
                                        <Label>Available Stock</Label>
                                        <Input value={selectedProduct.availableStock} readOnly className="bg-gray-100 text-black" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Actual Cost (Per Item)</Label>
                                        <Input value={selectedProduct.cost} readOnly className="bg-gray-100 text-black" />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                    required
                                    className="bg-white text-black"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Selling Cost (Per Item)</Label>
                                <Input
                                    type="number"
                                    value={form.costPerItem}
                                    onChange={(e) => setForm({ ...form, costPerItem: Number(e.target.value) })}
                                    required
                                    className="bg-white text-black"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={form.dateOfPurchase}
                                    onChange={(e) => setForm({ ...form, dateOfPurchase: e.target.value })}
                                    required
                                    className="bg-white text-black"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Save Purchase
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-4">
                <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-[200px]"
                />
                <Button onClick={() => fetchPurchases(filterDate)}>Search</Button>
                <Button variant="ghost" onClick={() => { setFilterDate(""); fetchPurchases(); }}>Reset</Button>
            </div>

            {/* Purchase Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Total Items</TableHead>
                            <TableHead>Actual Cost</TableHead>
                            <TableHead>Selling Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map((purchase) => (
                            <TableRow key={purchase._id}>
                                <TableCell>{new Date(purchase.dateOfPurchase).toLocaleDateString()}</TableCell>
                                <TableCell>{purchase.productId?.name || "-"}</TableCell>
                                <TableCell>{purchase.quantity}</TableCell>
                                <TableCell>{purchase.productId?.cost}</TableCell>
                                <TableCell>{purchase.costPerItem}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
