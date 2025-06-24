'use client';

import { Button } from "@/components/ui/button";

export default function Header() {
    const handleLogout = () => {
        // handle logout logic (e.g., clear auth, redirect)
        console.log("Logout clicked");
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
