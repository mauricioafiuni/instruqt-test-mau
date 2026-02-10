"use client";

import { useEffect, useState } from 'react';
import ApplicationHealth from './ApplicationHealth';

interface InventoryEvent {
  id: number;
  product_id: string;
  event_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  location: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  onlineStock: number;
  inStoreStock: number;
  onlineInStock: boolean;
  inStoreInStock: boolean;
  lowStockThreshold: number;
}

export default function AdminDashboard() {
  const [inventoryEvents, setInventoryEvents] = useState<InventoryEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Only start fetching data after config is loaded and apiUrl is set
    if (!configLoaded || !apiUrl) return;

    const fetchData = async () => {
      try {
        const [eventsResponse, inventoryResponse] = await Promise.all([
          fetch(`${apiUrl}/inventory/events`),
          fetch(`${apiUrl}/inventory`)
        ]);

        const events = await eventsResponse.json();
        const inventory = await inventoryResponse.json();

        setInventoryEvents(events || []);
        setProducts(inventory || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl, configLoaded]);

  // Calculate stats
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => !p.onlineInStock || !p.inStoreInStock);
  const lowStockProducts = products.filter(p =>
    (p.onlineStock <= p.lowStockThreshold && p.onlineInStock) ||
    (p.inStoreStock <= p.lowStockThreshold && p.inStoreInStock)
  );
  const recentEvents = inventoryEvents.slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Invisimart admin panel</p>
      </div>

      {/* System Health Section */}
      <div className="mb-8">
        <ApplicationHealth />
      </div>

    </div>
  );
}
