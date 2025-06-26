'use client';

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Menu,
    Package,
    Plus,
    List,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const NavItem = ({ href, label, icon: Icon }) => (
        <Link
            href={href}
            className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-md transition hover:bg-gray-100",
                pathname === href ? "bg-gray-100 font-medium" : "text-gray-700"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </Link>
    );

    const ProductLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/products" label="Add Product" icon={Plus} />
            <NavItem href="/dashboard/products" label="All Products" icon={List} />
        </div>
    );

    return (
        <>
            {/* Mobile Menu */}
            <div className="md:hidden p-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-4">
                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center justify-between w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Products
                                </div>
                                {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {open && ProductLinks}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 border-r p-4 bg-white h-screen">
                <h2 className="text-lg font-bold mb-4">Menu</h2>
                <nav className="flex flex-col gap-2">
                    <div
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                        className="group"
                    >
                        <div className="flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Products
                            </div>
                            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        {open && ProductLinks}
                    </div>
                </nav>
            </aside>
        </>
    );
}
