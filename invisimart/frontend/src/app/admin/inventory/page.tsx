"use client";

import AdminNav from "@/components/AdminNav";
import InventoryList from "@/components/InventoryList";

export default function AdminInventory() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryList />
      </div>
    </div>
  );
}
