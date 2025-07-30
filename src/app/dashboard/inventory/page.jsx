//app/dashboard/inventory/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    ShoppingCart,
    AlertTriangle,
    TrendingUp,
    Plus,
    Search,
    Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all"); // all, lowStock, outOfStock
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const router = useRouter();

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/inventory");
            setInventory(res.data.data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            alert("Failed to fetch inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Filter inventory based on search and filter type
    const filteredInventory = inventory.filter((item) => {
        const matchesSearch =
            item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        switch (filterType) {
            case "lowStock":
                return item.isLowStock && item.currentStock > 0;
            case "outOfStock":
                return item.currentStock === 0;
            default:
                return true;
        }
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

    // Calculate summary stats
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const lowStockItems = inventory.filter(item => item.isLowStock && item.currentStock > 0).length;
    const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Inventory Overview</h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push('/dashboard/items')}
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard/purchases')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Record Purchase
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Items</p>
                            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            placeholder="Search items..."
                            className="pl-10 max-w-sm border-gray-300 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">All Items</option>
                            <option value="lowStock">Low Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    Showing {filteredInventory.length} of {totalItems} items
                </div>
            </div>

            {/* Inventory Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full" />
                    <span className="ml-3 text-gray-600">Loading inventory...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">Item Name</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Current Stock</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Min Level</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Last Cost</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Total Value</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Last Purchase</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedInventory.map((item) => (
                                    <TableRow key={item.itemId} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                        <TableCell>{item.categoryName}</TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${item.currentStock === 0
                                                    ? 'text-red-600'
                                                    : item.isLowStock
                                                        ? 'text-orange-600'
                                                        : 'text-green-600'
                                                }`}>
                                                {item.currentStock}
                                            </span>
                                        </TableCell>
                                        <TableCell>{item.minStockLevel}</TableCell>
                                        <TableCell>{formatCurrency(item.lastCostPerUnit)}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(item.totalValue)}
                                        </TableCell>
                                        <TableCell>
                                            {item.lastPurchaseDate
                                                ? new Date(item.lastPurchaseDate).toLocaleDateString()
                                                : "Never"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {item.currentStock === 0 ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Out of Stock
                                                </span>
                                            ) : item.isLowStock ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length} items
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="border-gray-300"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={endIndex >= filteredInventory.length}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="border-gray-300"
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