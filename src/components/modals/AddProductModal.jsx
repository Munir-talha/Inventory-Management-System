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

export default function AddProductModal({ open, onOpenChange, onSaved }) {
    const [form, setForm] = useState({
        name: "",
        cost: 0,
        availableStock: 0,
        initialPurchaseQty: 0,
        isActive: true,
        categoryId: "",
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (open) {
            axios.get("/api/categories").then((res) => setCategories(res.data.data));
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            cost: Number(form.cost),
            availableStock: Number(form.availableStock),
            initialPurchaseQty: Number(form.initialPurchaseQty),
            isActive: form.isActive === true || form.isActive === "true",
        };

        await axios.post("/api/products", payload);
        onOpenChange(false);
        onSaved?.(); // optional callback
        resetForm();
    };

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold mb-4">Add Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="bg-white text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cost</Label>
                        <Input
                            type="number"
                            value={form.cost}
                            onChange={(e) => setForm({ ...form, cost: e.target.value })}
                            required
                            className="bg-white text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Available Stock</Label>
                        <Input
                            type="number"
                            value={form.availableStock}
                            onChange={(e) => setForm({ ...form, availableStock: e.target.value })}
                            className="bg-white text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Initial Purchase Qty</Label>
                        <Input
                            type="number"
                            value={form.initialPurchaseQty}
                            onChange={(e) => setForm({ ...form, initialPurchaseQty: e.target.value })}
                            className="bg-white text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Is Active</Label>
                        <select
                            value={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                            className="w-full border p-2 bg-white text-black"
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            className="w-full border p-2 bg-white text-black"
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Add Product
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
