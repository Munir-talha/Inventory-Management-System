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
import { Checkbox } from "@/components/ui/checkbox";

export default function SalesPage() {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [form, setForm] = useState({
        productId: "",
        quantity: 1,
        sellingPricePerItem: 0,
        dateOfSale: new Date().toISOString().split("T")[0],
        isOnlinePayment: false,
        costPerItem: 0,
        paymentMode: "cash",
        total: 0
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/products").then((res) => setProducts(res.data.data));
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/sales");
            setSales(res.data.data);
            console.log("all: ", res.data.data)
        } catch (error) {
            console.error("Failed to fetch sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId) => {
        const product = products.find((p) => p._id === productId);
        setSelectedProduct(product);
        setForm((prevForm) => ({
            ...prevForm,
            productId,
            sellingPricePerItem: product.sellingPrice || 0,
            costPerItem: product.cost || 0,
            total: (product.sellingPrice || 0) * prevForm.quantity,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!selectedProduct) {
            setError("Please select a product");
            return;
        }

        if (!selectedProduct.isActive || selectedProduct.availableStock <= 0) {
            setError("Product is inactive or out of stock");
            return;
        }

        if (form.quantity > selectedProduct.availableStock) {
            setError(`Only ${selectedProduct.availableStock} items left in stock`);
            return;
        }

        const updatedTotal = form.quantity * form.sellingPricePerItem;
        if (isNaN(updatedTotal) || form.sellingPricePerItem === 0) {
            setError("Invalid price or total calculation");
            return;
        }

        const submissionForm = {
            ...form,
            paymentMode: form.isOnlinePayment ? "easypaisa" : "cash",
            total: updatedTotal
        };

        try {
            await axios.post("/api/sales", submissionForm);
            setOpen(false);
            setForm({
                productId: "",
                quantity: 1,
                sellingPricePerItem: 0,
                dateOfSale: new Date().toISOString().split("T")[0],
                isOnlinePayment: false,
                costPerItem: 0,
                paymentMode: "cash",
                total: 0
            });
            setSelectedProduct(null);
            fetchSales();
        } catch (err) {
            setError("Failed to save sale");
        }
    };

    const total = form.quantity * form.sellingPricePerItem;

    const disableSubmit =
        !selectedProduct ||
        !selectedProduct.isActive ||
        selectedProduct.availableStock <= 0 ||
        form.quantity > selectedProduct.availableStock;

    return (
        <div className="p-4">
            <DashboardStats />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sales</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setError("")}>+ New Sale</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg bg-white p-6 rounded-xl shadow-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">New Sale</DialogTitle>
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
                            </div>

                            {selectedProduct && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Available Stock</Label>
                                        <Input readOnly value={selectedProduct.availableStock} className="bg-gray-100 text-black" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Actual Cost</Label>
                                        <Input readOnly value={selectedProduct.cost} className="bg-gray-100 text-black" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                quantity: Math.max(1, Number(e.target.value)),
                                            })
                                        }
                                        required
                                        className="bg-white text-black"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Selling Price</Label>
                                    <Input
                                        type="number"
                                        value={form.sellingPricePerItem}
                                        onChange={(e) => setForm({ ...form, sellingPricePerItem: Number(e.target.value) })}
                                        required
                                        className="bg-white text-black"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={form.dateOfSale}
                                    onChange={(e) => setForm({ ...form, dateOfSale: e.target.value })}
                                    required
                                    className="bg-white text-black"
                                />
                            </div>

                            <div className="p-4 border rounded-md bg-gray-50">
                                <p className="text-sm">Total Items: {form.quantity}</p>
                                <p className="text-sm">Price per Item: {form.sellingPricePerItem}</p>
                                <p className="font-semibold">Total: Rs. {total}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="easypaisa"
                                    checked={form.isOnlinePayment}
                                    onCheckedChange={(checked) => setForm({ ...form, isOnlinePayment: checked })}
                                />
                                <Label htmlFor="easypaisa">Paid via Easypaisa</Label>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            {selectedProduct && (!selectedProduct.isActive || selectedProduct.availableStock <= 0) && (
                                <p className="text-sm text-red-500">Product is inactive or out of stock</p>
                            )}

                            {selectedProduct &&
                                form.quantity > selectedProduct.availableStock && (
                                    <p className="text-sm text-red-500">
                                        Only {selectedProduct.availableStock} items left in stock
                                    </p>
                                )}

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                disabled={disableSubmit}
                            >
                                Save Sale
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading Sales...</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Selling Price</TableHead>
                                <TableHead>Online</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale._id}>
                                    <TableCell>{new Date(sale.dateOfSale).toLocaleDateString()}</TableCell>
                                    <TableCell>{sale.productId?.name || "-"}</TableCell>
                                    <TableCell>{sale.quantity}</TableCell>
                                    <TableCell>{sale.costPerItem}</TableCell>
                                    <TableCell>{sale.sellingPricePerItem}</TableCell>
                                    <TableCell>{sale.paymentMode !== 'cash' ? "✔️" : "❌"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
