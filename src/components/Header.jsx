"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import AddPurchaseModal from "@/components/modals/AddPurchaseModal";
import AddProductModal from "@/components/modals/AddProductModal";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    // Route flags
    const isDashboard = pathname === "/dashboard";
    const isProducts = pathname === "/dashboard/products";
    const isPurchases = pathname === "/dashboard/purchases";

    return (
        <header className="bg-white border-b p-4 flex justify-between items-center">
            <button
                onClick={() => router.push("/dashboard")}
                className="text-lg font-semibold text-blac-600 transition-all"
            >
                Dashboard
            </button>

            <div className="flex items-center gap-3">
                {(isDashboard || isPurchases) && (
                    <Button
                        onClick={() => setShowPurchaseModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm shadow"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Purchase
                    </Button>
                )}

                {(isDashboard || isProducts) && (
                    <Button
                        onClick={() => setShowProductModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm shadow"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Item
                    </Button>
                )}

                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2 text-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {/* Modals */}
            <AddPurchaseModal open={showPurchaseModal} onOpenChange={setShowPurchaseModal} />
            <AddProductModal open={showProductModal} onOpenChange={setShowProductModal} />
        </header>
    );
}
