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

export default function AddPurchaseModal({ open, onOpenChange, onSaved }) {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        productId: "",
        quantity: 1,
        costPerItem: 0,
        dateOfPurchase: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        if (open) {
            axios.get("/api/products").then((res) => setProducts(res.data.data));
        }
    }, [open]);

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

        if (!selectedProduct || form.quantity <= 0) {
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
            onOpenChange(false);
            onSaved?.(); // callback to refresh data
            resetForm();
        } catch {
            setError("Failed to save purchase");
        }
    };

    const resetForm = () => {
        setForm({
            productId: "",
            quantity: 1,
            costPerItem: 0,
            dateOfPurchase: new Date().toISOString().split("T")[0],
        });
        setSelectedProduct(null);
        setError("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            <option value="" disabled>Select a product</option>
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
    );
}
