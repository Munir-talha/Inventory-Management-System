// app/dashboard/layout.js
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 p-6 overflow-auto bg-gray-50">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
