"use client";

import { useEffect, useState } from 'react';

interface ComponentHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  lastChecked: Date;
  description: string;
}

export default function ApplicationHealth() {
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const checkComponentHealth = async (endpoint: string): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const checkAllComponents = async () => {
    setIsRefreshing(true);

    // Set all components to checking state
    const checkingComponents: ComponentHealth[] = [
      { name: 'API Service', status: 'checking', lastChecked: new Date(), description: 'Core API service' },
      { name: 'Database', status: 'checking', lastChecked: new Date(), description: 'Product, inventory & order data' },
      { name: 'Product Catalog', status: 'checking', lastChecked: new Date(), description: 'Product listings' },
      { name: 'Inventory System', status: 'checking', lastChecked: new Date(), description: 'Stock management' }
    ];
    setComponents(checkingComponents);

    try {
      const [apiHealth, dbHealth, productsHealth, inventoryHealth] = await Promise.all([
        checkComponentHealth('/health'),
        checkComponentHealth('/health/db'),
        checkComponentHealth('/products'),
        checkComponentHealth('/inventory')
      ]);

      const healthResults: ComponentHealth[] = [
        {
          name: 'API Service',
          status: apiHealth ? 'healthy' : 'unhealthy',
          lastChecked: new Date(),
          description: 'Core API service'
        },
        {
          name: 'Database',
          status: dbHealth ? 'healthy' : 'unhealthy',
          lastChecked: new Date(),
          description: 'Product, inventory & order data'
        },
        {
          name: 'Product Catalog',
          status: productsHealth ? 'healthy' : 'unhealthy',
          lastChecked: new Date(),
          description: 'Product listings'
        },
        {
          name: 'Inventory System',
          status: inventoryHealth ? 'healthy' : 'unhealthy',
          lastChecked: new Date(),
          description: 'Stock management'
        }
      ];      setComponents(healthResults);
    } catch (error) {
      console.error('Error checking component health:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Only start checking components after config is loaded and apiUrl is set
    if (!configLoaded || !apiUrl) return;

    checkAllComponents();

    // Check health every 30 seconds
    const interval = setInterval(checkAllComponents, 30000);
    return () => clearInterval(interval);
  }, [apiUrl, configLoaded]);

  const getStatusIndicator = (status: ComponentHealth['status']) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'unhealthy':
        return '🔴';
      case 'checking':
        return '�';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: ComponentHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'unhealthy':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const overallHealthy = components.filter(c => c.status === 'healthy').length;
  const totalComponents = components.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <p className="text-sm text-gray-600">
            {overallHealthy}/{totalComponents} components healthy
          </p>
        </div>
        <button
          onClick={checkAllComponents}
          disabled={isRefreshing}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? '🔄 Checking...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Architecture Diagram */}
      <div className="mb-6">
        {/* Top Layer - Frontend */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-sm font-bold text-blue-900">Frontend</div>
            <div className="text-xs text-blue-600">React / Next.js</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center mb-4">
          <div className="text-gray-400">↓</div>
        </div>

        {/* Middle Layer - API Service */}
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-lg border-2 text-center ${getStatusColor(components.find(c => c.name === 'API Service')?.status || 'checking')}`}>
            <div className="text-2xl mb-2">
              {getStatusIndicator(components.find(c => c.name === 'API Service')?.status || 'checking')}
            </div>
            <div className="text-sm font-bold text-gray-900">API Service</div>
            <div className="text-xs text-gray-600">Go / Gorilla Mux</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center mb-4">
          <div className="text-gray-400">↓</div>
        </div>

        {/* Services Layer - Horizontal */}
        <div className="flex justify-center gap-6 mb-4">
          <div className={`p-3 rounded border text-center ${getStatusColor(components.find(c => c.name === 'Product Catalog')?.status || 'checking')}`}>
            <div className="text-lg mb-1">
              {getStatusIndicator(components.find(c => c.name === 'Product Catalog')?.status || 'checking')}
            </div>
            <div className="text-xs font-bold">Endpoint</div>
            <div className="text-xs text-gray-600">/products</div>
          </div>
          <div className={`p-3 rounded border text-center ${getStatusColor(components.find(c => c.name === 'Inventory System')?.status || 'checking')}`}>
            <div className="text-lg mb-1">
              {getStatusIndicator(components.find(c => c.name === 'Inventory System')?.status || 'checking')}
            </div>
            <div className="text-xs font-bold">Endpoint</div>
            <div className="text-xs text-gray-600">/inventory</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center mb-4">
          <div className="text-gray-400">↓</div>
        </div>

        {/* Database Layer */}
        <div className="flex justify-center">
          <div className={`p-4 rounded-lg border-2 text-center ${getStatusColor(components.find(c => c.name === 'Database')?.status || 'checking')}`}>
            <div className="text-xl mb-1">
              {getStatusIndicator(components.find(c => c.name === 'Database')?.status || 'checking')}
            </div>
            <div className="text-sm font-bold text-gray-900">Database</div>
            <div className="text-xs text-gray-600">PostgreSQL</div>
            <div className="text-xs text-gray-500 mt-1">Products • Inventory • Events</div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 border-t pt-4">
        <div className="flex items-center space-x-1">
          <span>🟢</span>
          <span>Healthy</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🔴</span>
          <span>Unhealthy</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🟡</span>
          <span>Checking</span>
        </div>
        <div className="text-gray-500">
          Last check: {components.length > 0 ? components[0].lastChecked.toLocaleTimeString() : 'Never'}
        </div>
      </div>
    </div>
  );
}
