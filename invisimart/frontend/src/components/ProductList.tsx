"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import AddToCartButton from "./AddToCartButton";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setError(null);

        // Get API URL from runtime config endpoint
        let apiUrl: string;
        try {
          const configRes = await fetch('/api/config');
          if (configRes.ok) {
            const config = await configRes.json();
            // Use the API URL from config, which points to the frontend's own URL
            // Next.js rewrites will proxy API requests to the backend
            apiUrl = config.apiUrl || `${window.location.protocol}//${window.location.host}`;
            console.log('API URL from config endpoint:', apiUrl);
          } else {
            throw new Error('Config endpoint failed');
          }
        } catch {
          // Fallback: use current browser location (same origin)
          // Requests will be proxied by Next.js rewrites to the backend
          apiUrl = `${window.location.protocol}//${window.location.host}`;
          console.log('Using fallback API URL (same origin):', apiUrl);
        }

        // First try to get inventory data
        try {
          console.log('Trying inventory endpoint:', `${apiUrl}/inventory`);
          const inventoryRes = await fetch(`${apiUrl}/inventory`);
          if (inventoryRes.ok) {
            const inventoryData = await inventoryRes.json();
            setProducts(inventoryData);
            console.log('Successfully fetched inventory data');
            return;
          } else {
            console.log('Inventory endpoint failed with status:', inventoryRes.status);
            throw new Error('Inventory not available');
          }
        } catch (inventoryError) {
          console.log('Inventory fetch failed:', inventoryError);

          // Fall back to products endpoint
          console.log('Falling back to products endpoint:', `${apiUrl}/products`);
          const productsRes = await fetch(`${apiUrl}/products`);
          if (!productsRes.ok) {
            throw new Error("Failed to fetch products: " + productsRes.statusText);
          }
          const productsData = await productsRes.json();

          // Add mock inventory data to indicate unavailability
          const productsWithMockInventory = productsData.map((product: Product) => ({
            ...product,
            onlineStock: null,
            inStoreStock: null,
            onlineInStock: false,
            inStoreInStock: false,
            inventoryUnavailable: true
          }));

          setProducts(productsWithMockInventory);
          console.log('Successfully fetched products data with mock inventory');
        }
      } catch (err) {
        console.error('All fetch attempts failed:', err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-700 font-semibold text-lg">Loading amazing products...</p>
        <div className="mt-2 flex space-x-1">
          <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-brand-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-brand-orange/20 rounded-3xl p-8 max-w-md mx-auto shadow-glass">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Check back soon to see more amazing products!</h3>
            <div className="text-slate-700 font-medium mt-1">We&apos;re always adding new items to our collection.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden hover:shadow-glass-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 shadow-glass"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-glass-50 to-glass-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <Link href={`/products/${product.id}`} className="block relative z-10">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill={true}
                className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />

              {/* Floating Action Button */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button className="w-12 h-12 bg-glass-400 backdrop-blur-sm border border-glass-500 rounded-2xl flex items-center justify-center shadow-glass hover:bg-glass-500 transition-all duration-300 hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Stock Status Badge */}
              {!product.inventoryUnavailable && (
                <div className="absolute top-4 left-4">
                  {product.onlineInStock ? (
                    <div className="bg-success-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {product.onlineStock! > 10 ? 'IN STOCK' : `LOW STOCK (${product.onlineStock})`}
                    </div>
                  ) : (
                    <div className="bg-danger-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Product Name */}
              <h2 className="text-lg font-black text-slate-900 line-clamp-2 group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                {product.name}
              </h2>

              {/* Price and Availability */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-brand-orange">
                    ${Math.round(product.price)}
                  </p>
                  <p className="text-xs text-slate-600 font-semibold">Free Shipping</p>
                </div>

                {/* Availability Indicators */}
                <div className="flex flex-col space-y-2 text-right">
                  {product.inventoryUnavailable ? (
                    <div className="text-center">
                      <span className="text-xs font-bold text-gray-500">
                        INVENTORY NOT AVAILABLE
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-end">
                        <span className={`text-xs font-bold mr-2 ${product.onlineInStock ? 'text-success-700' : 'text-danger-700'}`}>
                          ONLINE: {product.onlineStock || 0}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${product.onlineInStock ? 'bg-success-500 shadow-glow-blue' : 'bg-danger-500'}`}></div>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className={`text-xs font-bold mr-2 ${product.inStoreInStock ? 'text-success-700' : 'text-danger-700'}`}>
                          STORE: {product.inStoreStock || 0}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${product.inStoreInStock ? 'bg-success-500 shadow-glow-blue' : 'bg-danger-500'}`}></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3 relative z-10">
            <div className="flex gap-3">
              <Link
                href={`/products/${product.id}`}
                className="flex-1 px-4 py-3 bg-glass-200 backdrop-blur-sm border-2 border-slate-800 rounded-2xl font-bold text-slate-800 text-center hover:bg-slate-800 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-brutal"
              >
                VIEW DETAILS
              </Link>
            </div>

            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.image}
              onlineInStock={product.onlineInStock || false}
              className="w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
