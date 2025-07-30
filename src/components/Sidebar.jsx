"use client";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Menu,
    Package,
    Plus,
    List,
    ChevronDown,
    ChevronRight,
    Folder,
    LayoutDashboard,
    ArrowLeftRight,
    ShoppingCart,
    PackageOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [openInventory, setOpenInventory] = useState(false);
    const [openCategories, setOpenCategories] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [openReports, setOpenReports] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto-expand inventory menu if user is on any inventory-related page
    useEffect(() => {
        if (pathname.includes('/dashboard/items') ||
            pathname.includes('/dashboard/purchases') ||
            pathname.includes('/dashboard/inventory')) {
            setOpenInventory(true);
        }
    }, [pathname]);

    const NavItem = ({ href, label, icon: Icon, isSubItem = false }) => (
        <Link
            href={href}
            className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-md transition hover:bg-gray-100",
                isSubItem && "ml-2 text-sm",
                pathname === href ? "bg-blue-50 font-medium text-blue-700 border-r-2 border-blue-600" : "text-gray-700"
            )}
        >
            <Icon className={clsx("w-4 h-4", pathname === href && "text-blue-600")} />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );

    const InventoryLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/inventory" label="Stock Overview" icon={PackageOpen} isSubItem />
            <NavItem href="/dashboard/items" label="Items Catalog" icon={Package} isSubItem />
            <NavItem href="/dashboard/purchases" label="Purchase Records" icon={ShoppingCart} isSubItem />
        </div>
    );

    const ReportsLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/daily-closing" label="Daily Closing" icon={List} isSubItem />
            <NavItem href="/dashboard/sales-report" label="Sales Report" icon={List} isSubItem />
        </div>
    );

    const CategoryLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/categories" label="All Categories" icon={List} isSubItem />
        </div>
    );

    const SidebarContent = (
        <nav className="flex flex-col gap-2 p-4">
            <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem href="/dashboard/sales" label="Sales" icon={Package} />

            {/* Inventory Management */}
            <div
                onMouseEnter={() => !isMobile && setOpenInventory(true)}
                onMouseLeave={() => !isMobile && setOpenInventory(false)}
                className="group"
            >
                <div
                    onClick={() => isMobile && setOpenInventory(!openInventory)}
                    className={clsx(
                        "flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition",
                        (pathname.includes('/dashboard/items') ||
                            pathname.includes('/dashboard/purchases') ||
                            pathname.includes('/dashboard/inventory')) && "bg-blue-50 text-blue-700"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {!isCollapsed && <span>Inventory Management</span>}
                    </div>
                    {!isCollapsed && (openInventory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {openInventory && InventoryLinks}
            </div>

            {/* Categories */}
            <div
                onMouseEnter={() => !isMobile && setOpenCategories(true)}
                onMouseLeave={() => !isMobile && setOpenCategories(false)}
                className="group"
            >
                <div
                    onClick={() => isMobile && setOpenCategories(!openCategories)}
                    className={clsx(
                        "flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition",
                        pathname.includes('/dashboard/categories') && "bg-blue-50 text-blue-700"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        {!isCollapsed && <span>Categories</span>}
                    </div>
                    {!isCollapsed && (openCategories ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {openCategories && CategoryLinks}
            </div>

            {/* Reports Dropdown */}
            <div
                onMouseEnter={() => !isMobile && setOpenReports(true)}
                onMouseLeave={() => !isMobile && setOpenReports(false)}
                className="group"
            >
                <div
                    onClick={() => isMobile && setOpenReports(!openReports)}
                    className={clsx(
                        "flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition",
                        (pathname.includes('/dashboard/daily-closing') ||
                            pathname.includes('/dashboard/sales-report')) && "bg-blue-50 text-blue-700"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        {!isCollapsed && <span>Reports</span>}
                    </div>
                    {!isCollapsed && (openReports ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {openReports && ReportsLinks}
            </div>

            {/* Daily Transfer - Standalone */}
            <NavItem href="/dashboard/transfer" label="Daily Transfer" icon={ArrowLeftRight} />
        </nav>
    );

    return (
        <>
            {/* Mobile Menu */}
            {isMobile ? (
                <div className="p-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-64 p-0 bg-white h-full z-50 shadow-lg"
                        >
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>Inventory System</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                                {SidebarContent}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            ) : (
                // Desktop Sidebar
                <aside className={clsx(
                    "flex flex-col transition-all duration-300 bg-white h-screen border-r shadow-sm",
                    isCollapsed ? "w-20" : "w-64"
                )}>
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                        {!isCollapsed && (
                            <h2 className="text-lg font-bold text-gray-800">
                                Inventory System
                            </h2>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hover:bg-gray-200"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                    {SidebarContent}
                </aside>
            )}
        </>
    );
}