"use client";

import { useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";

interface InventoryEvent {
  product_id: string;
  event_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  location: string;
  created_at: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<InventoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "purchase" | "restock">("all");
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
    // Only start fetching events after config is loaded and apiUrl is set
    if (!configLoaded || !apiUrl) return;

    fetchEvents();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [apiUrl, configLoaded]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${apiUrl}/inventory/events`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory events:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch inventory events");
      setLoading(false);
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "purchase": return "bg-red-100 text-red-800";
      case "restock": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "purchase": return "🛒";
      case "restock": return "📦";
      default: return "📝";
    }
  };

  const getQuantityDisplay = (eventType: string, quantityChange: number) => {
    if (eventType === "purchase") {
      return `${Math.abs(quantityChange)} sold`;
    } else if (eventType === "restock") {
      return `+${quantityChange} added`;
    }
    return `${quantityChange}`;
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    return event.event_type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <h3 className="font-bold">Error loading events</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header and Filters */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Events</h1>
              <p className="text-gray-600 mt-1">Real-time inventory change log</p>
            </div>
            <div className="flex space-x-2">
              {["all", "purchase", "restock"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as "all" | "purchase" | "restock")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filter === filterOption
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOption === "all" ? "All Events" :
                   filterOption === "purchase" ? "Purchases" : "Restocks"}
                </button>
              ))}
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Levels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event, index) => (
                  <tr key={`${event.product_id}-${event.created_at}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getEventIcon(event.event_type)}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event.event_type)}`}>
                          {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Product {event.product_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {getQuantityDisplay(event.event_type, event.quantity_change)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.previous_stock} → {event.new_stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-red-600 text-xl">🛒</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Purchases</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {events.filter(event => event.event_type === "purchase").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Restocks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {events.filter(event => event.event_type === "restock").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
