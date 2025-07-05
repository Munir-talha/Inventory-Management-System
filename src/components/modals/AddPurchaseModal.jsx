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
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

export default function AddSaleModal({ open, onOpenChange, onSaved }) {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        productId: "",
        quantity: 1,
        sellingPricePerItem: 0,
        dateOfSale: new Date().toISOString().split("T")[0],
        paymentMode: "cash",
        costPerItem: 0
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
            sellingPricePerItem: product?.sellingPrice || 0,
            costPerItem: product?.cost || 0,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!selectedProduct || form.quantity <= 0) {
            setError("Invalid form");
            return;
        }

        if (!selectedProduct.isActive || selectedProduct.availableStock === 0) {
            setError("Product is inactive or out of stock");
            return;
        }

        if (form.quantity > selectedProduct.availableStock) {
            setError(
                `Only ${selectedProduct.availableStock} item(s) in stock. Reduce quantity.`
            );
            return;
        }

        try {
            await axios.post("/api/sales", form);
            onOpenChange(false);
            onSaved?.(); // refresh table
            resetForm();
        } catch {
            setError("Failed to save sale");
        }
    };

    const resetForm = () => {
        setForm({
            productId: "",
            quantity: 1,
            sellingPricePerItem: 0,
            dateOfSale: new Date().toISOString().split("T")[0],
            isOnlinePayment: false,

        });
        setSelectedProduct(null);
        setError("");
    };

    const isOutOfStock =
        selectedProduct && (!selectedProduct.isActive || selectedProduct.availableStock === 0);

    const exceedsStock =
        selectedProduct && form.quantity > selectedProduct.availableStock;

    const total = form.quantity * form.sellingPricePerItem;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-white p-6 rounded-xl shadow-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">New Sale</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Select */}
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
                                <Input
                                    readOnly
                                    value={selectedProduct.availableStock}
                                    className="bg-gray-100 text-black"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Actual Cost</Label>
                                <Input
                                    readOnly
                                    value={selectedProduct.cost}
                                    className="bg-gray-100 text-black"
                                />
                            </div>
                        </div>
                    )}

                    {/* Quantity & Selling Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({ ...form, quantity: Number(e.target.value) })
                                }
                                required
                                className="bg-white text-black"
                            />
                            {exceedsStock && (
                                <p className="text-xs text-red-500">
                                    Only {selectedProduct.availableStock} available.
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Selling Price</Label>
                            <Input
                                type="number"
                                value={form.sellingPricePerItem}
                                onChange={(e) =>
                                    setForm({ ...form, sellingPricePerItem: Number(e.target.value) })
                                }
                                required
                                className="bg-white text-black"
                            />
                        </div>
                    </div>

                    {/* Date Picker */}
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

                    {/* Summary */}
                    <div className="p-4 border rounded-md bg-gray-50 text-sm">
                        <p>Total Items: {form.quantity}</p>
                        <p>Price per Item: Rs. {form.sellingPricePerItem}</p>
                        <p className="font-semibold text-base">Total: Rs. {total}</p>
                    </div>

                    {/* Easypaisa */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="easypaisa"
                            checked={form.paymentMode === "easypaisa"}
                            onCheckedChange={(checked) =>
                                setForm({
                                    ...form,
                                    paymentMode: checked ? "easypaisa" : "cash", // default to cash
                                })
                            }
                        />
                        <Label htmlFor="easypaisa">Paid via Easypaisa</Label>
                    </div>

                    {/* Errors */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        disabled={isOutOfStock || exceedsStock}
                        className={`w-full text-white ${isOutOfStock || exceedsStock
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isOutOfStock
                            ? "Product out of stock"
                            : exceedsStock
                                ? "Quantity too high"
                                : "Save Sale"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
