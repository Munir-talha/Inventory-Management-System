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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function SalesPage() {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [form, setForm] = useState({
        productId: "",
        quantity: 1,
        sellingPricePerItem: 0,
        dateOfSale: new Date().toISOString().split("T")[0],
        // isOnlinePayment: false,
        costPerItem: 0,
        paymentMode: "cash",
        total: 0
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Combobox states
    const [productOpen, setProductOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        axios.get("/api/products").then((res) => setProducts(res.data.data));
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/sales");
            setSales(res.data.data);
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
            // paymentMode: form.isOnlinePayment ? "easypaisa" : "cash",
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
                // isOnlinePayment: false,
                costPerItem: 0,
                paymentMode: "cash",
                total: 0
            });
            setSelectedProduct(null);
            setSearchValue("");
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

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const filteredSales = sales.filter((sale) =>
        sale.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

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
                                <Popover open={productOpen} onOpenChange={setProductOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={productOpen}
                                            className="w-full justify-between text-black bg-white hover:bg-gray-50"
                                        >
                                            {form.productId
                                                ? products.find((product) => product._id === form.productId)?.name
                                                : "Select a product..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border border-gray-200 shadow-lg">
                                        <Command className="bg-white">
                                            <CommandInput
                                                placeholder="Search products..."
                                                value={searchValue}
                                                onInput={(e) => setSearchValue(e.currentTarget.value)}
                                                className="border-b border-gray-200 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                                                No product found.
                                            </CommandEmpty>
                                            <CommandGroup className="max-h-60 overflow-auto bg-white">
                                                {filteredProducts.map((product) => (
                                                    <CommandItem
                                                        key={product._id}
                                                        onSelect={() => {
                                                            handleProductSelect(product._id);
                                                            setProductOpen(false);
                                                            setSearchValue("");
                                                        }}
                                                        className="cursor-pointer hover:bg-gray-50 px-3 py-2 bg-white text-black"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                form.productId === product._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {product.name} {product.isActive ? "" : "(Inactive)"}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
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

                            {/* <div className="flex items-center gap-2">
                                <Checkbox
                                    id="easypaisa"
                                    checked={form.isOnlinePayment}
                                    onCheckedChange={(checked) => setForm({ ...form, isOnlinePayment: checked })}
                                />
                                <Label htmlFor="easypaisa">Paid via Easypaisa</Label>
                            </div> */}

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

            {/* Search + Table */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-black rounded-full" />
                    <span className="ml-2 text-muted-foreground text-sm">Loading Sales...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search Filter */}
                    <div className="flex justify-between items-center">
                        <Input
                            placeholder="Search by product name..."
                            className="max-w-sm"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-auto rounded-lg border border-gray-200">
                        <Table className="min-w-[800px]">
                            <TableHeader className="sticky top-0 bg-white shadow z-10">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    {/* <TableHead>Online Payment</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSales.map((sale) => (
                                    <TableRow key={sale._id} className="hover:bg-gray-50">
                                        <TableCell>{new Date(sale.dateOfSale).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.productId?.name || "-"}</TableCell>
                                        <TableCell>{sale.quantity}</TableCell>
                                        <TableCell>Rs. {sale.costPerItem}</TableCell>
                                        <TableCell>Rs. {sale.sellingPricePerItem}</TableCell>
                                        {/* <TableCell>
                                            {sale.paymentMode !== "cash" ? (
                                                <span className="text-green-600 font-bold">✔</span>
                                            ) : (
                                                <span className="text-red-500 font-bold">✘</span>
                                            )}
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} of {filteredSales.length}
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
                                disabled={endIndex >= filteredSales.length}
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