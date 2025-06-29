"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";

export default function Home() {
  return (
    <main className="p-6">
      <DashboardStats />
      {/* In future, maybe add charts here too */}
    </main>
  );
}