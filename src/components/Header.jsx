'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Header() {
    const router = useRouter();

    const handleLogout = () => {
        // 1. Clear authentication-related data
        localStorage.removeItem("token");       // or sessionStorage
        localStorage.removeItem("user");        // if you stored user info

        // 2. Redirect to login page
        router.push("/login");
    };

    return (
        <header className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
                Logout
            </Button>
        </header>
    );
}
