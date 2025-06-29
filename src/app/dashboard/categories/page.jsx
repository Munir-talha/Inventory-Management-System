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
import { Trash2, Pencil } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const resetForm = () => {
        setForm({ name: "", description: "" });
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/categories");
            setCategories(res.data.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`/api/categories/${editingCategory._id}`, form);
            } else {
                await axios.post("/api/categories", form);
            }
            setOpen(false);
            setEditingCategory(null);
            resetForm();
            fetchCategories();
        } catch (err) {
            console.error("Error saving category:", err);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            description: category.description || "",
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await axios.delete(`/api/categories/${id}`);
                fetchCategories();
            } catch (err) {
                console.error("Error deleting category:", err);
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingCategory(null);
                                resetForm();
                            }}
                        >
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold mb-4">
                                {editingCategory ? "Edit" : "Add"} Category
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Category name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Optional description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {editingCategory ? "Update" : "Add"} Category
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">
                        Loading categories...
                    </span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category._id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.description || "-"}</TableCell>
                                <TableCell>
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-red-600 hover:bg-red-100"
                                                        onClick={() => handleDelete(category._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default CategoriesPage;
