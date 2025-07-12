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
    ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [openProducts, setOpenProducts] = useState(false);
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

    const NavItem = ({ href, label, icon: Icon }) => (
        <Link
            href={href}
            className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-md transition hover:bg-gray-100",
                pathname === href ? "bg-gray-100 font-medium" : "text-gray-700"
            )}
        >
            <Icon className="w-4 h-4" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );

    const ProductLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            {/* <NavItem href="/dashboard/products" label="Add Product" icon={Plus} /> */}
            <NavItem href="/dashboard/products" label="All Items" icon={List} />
        </div>
    );

    const ReportsLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/daily-closing" label="Daily Closing" icon={List} />
            <NavItem href="/dashboard/sales-report" label="Sales Report" icon={List} />
        </div>
    );

    const CategoryLinks = (
        <div className="ml-6 mt-1 flex flex-col gap-1">
            <NavItem href="/dashboard/categories" label="All Categories" icon={List} />
        </div>
    );

    const SidebarContent = (
        <nav className="flex flex-col gap-2">
            <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem href="/dashboard/sales" label="Sales" icon={Package} />

            {/* Products */}
            <div
                onMouseEnter={() => !isMobile && setOpenProducts(true)}
                onMouseLeave={() => !isMobile && setOpenProducts(false)}
                className="group"
            >
                <div
                    onClick={() => isMobile && setOpenProducts(!openProducts)}
                    className="flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {!isCollapsed && <span>Inventory</span>}
                    </div>
                    {!isCollapsed && (openProducts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {openProducts && ProductLinks}
            </div>

            {/* Categories */}
            <div
                onMouseEnter={() => !isMobile && setOpenCategories(true)}
                onMouseLeave={() => !isMobile && setOpenCategories(false)}
                className="group"
            >
                <div
                    onClick={() => isMobile && setOpenCategories(!openCategories)}
                    className="flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
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
                    className="flex items-center justify-between text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        {!isCollapsed && <span>Reports</span>}
                    </div>
                    {!isCollapsed && (openReports ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {openReports && ReportsLinks}
            </div>

            {/* ✅ New Separate Menu Item */}
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
                            className="w-64 p-4 bg-white h-full z-50 shadow-lg"
                        >
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                                {SidebarContent}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            ) : (
                // Desktop Sidebar
                <aside className={clsx("flex flex-col transition-all duration-300 bg-white h-screen border-r", isCollapsed ? "w-20" : "w-64")}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        {!isCollapsed && <h2 className="text-lg font-bold">Inverntory System</h2>}
                        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                    {SidebarContent}
                </aside>
            )}
        </>
    );
}
