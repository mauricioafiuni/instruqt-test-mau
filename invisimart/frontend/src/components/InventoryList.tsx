"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types/product";

interface InventoryItem extends Product {
  onlineStock: number;
  inStoreStock: number;
  lowStockThreshold: number;
  lastUpdated: string;
}

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "low-stock" | "out-of-stock">("all");
  const [apiUrl, setApiUrl] = useState<string>(''); // Start with empty string
  const [configLoaded, setConfigLoaded] = useState(false); // Add this flag

  useEffect(() => {
    // Fetch API URL from config endpoint
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        // Use the API URL from config, which points to the frontend's own URL
        // Next.js rewrites will proxy API requests to the backend
        const apiUrl = config.apiUrl || `${window.location.protocol}//${window.location.host}`;
        setApiUrl(apiUrl);
        console.log('API URL from config:', apiUrl);
      } catch (error) {
        console.error('Error fetching config:', error);
        // Fallback: use current browser location (same origin)
        // Requests will be proxied by Next.js rewrites to the backend
        const apiUrl = `${window.location.protocol}//${window.location.host}`;
        setApiUrl(apiUrl);
        console.log('Using fallback API URL (same origin):', apiUrl);
      } finally {
        setConfigLoaded(true); // Mark config as loaded regardless of success/failure
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    // Only start fetching inventory after config is loaded and apiUrl is set
    if (!configLoaded || !apiUrl) return;

    fetchInventory();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchInventory, 10000);
    return () => clearInterval(interval);
  }, [apiUrl, configLoaded]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${apiUrl}/inventory`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setInventory(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const totalStock = item.onlineStock + item.inStoreStock;
    if (totalStock === 0) return "out-of-stock";
    if (totalStock <= item.lowStockThreshold) return "low-stock";
    return "in-stock";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out-of-stock": return "bg-red-100 text-red-800";
      case "low-stock": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "out-of-stock": return "Out of Stock";
      case "low-stock": return "Low Stock";
      default: return "In Stock";
    }
  };

  const filteredInventory = inventory.filter(item => {
    const status = getStockStatus(item);
    if (filter === "all") return true;
    return status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h3 className="font-bold">Error loading inventory</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <div className="flex space-x-2">
          {["all", "low-stock", "out-of-stock"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as "all" | "low-stock" | "out-of-stock")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === filterOption
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption === "all" ? "All Items" :
               filterOption === "low-stock" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(item => getStockStatus(item) === "in-stock").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(item => getStockStatus(item) === "low-stock").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory.filter(item => getStockStatus(item) === "out-of-stock").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Online Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In-Store Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        <Image
                          className="h-full w-full object-contain"
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Math.round(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.onlineStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.inStoreStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
