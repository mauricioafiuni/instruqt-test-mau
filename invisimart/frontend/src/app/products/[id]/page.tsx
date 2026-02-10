"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types/product';
import AddToCartButton from '@/components/AddToCartButton';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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

  const fetchProduct = useCallback(async (id: string) => {
    try {
      // First try to get inventory data for this specific product
      try {
        const inventoryRes = await fetch(`${apiUrl}/inventory`);
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json();
          const inventoryProduct = inventoryData.find((item: Product) => item.id === id);

          if (inventoryProduct) {
            setProduct(inventoryProduct);
            return;
          }
        } else {
          throw new Error('Inventory service unavailable');
        }
      } catch (inventoryError) {
        console.log('Inventory fetch failed, falling back to products API:', inventoryError);

        // Fallback to regular product API if inventory fails
        const res = await fetch(`${apiUrl}/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();

        // Add mock availability data to indicate inventory unavailability
        const productWithMockInventory = {
          ...data,
          onlineStock: null,
          inStoreStock: null,
          onlineInStock: false,
          inStoreInStock: false,
          inventoryUnavailable: true,
        };

        setProduct(productWithMockInventory);
        return;
      }

      // This fallback is for when inventory API works but specific product not found
      const res = await fetch(`${apiUrl}/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();

      // Add mock availability data for fallback
      const productWithAvailability = {
        ...data,
        onlineStock: 0,
        inStoreStock: 0,
        onlineInStock: false,
        inStoreInStock: false,
      };

      setProduct(productWithAvailability);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Only start fetching product after config is loaded and apiUrl is set
    if (!configLoaded || !apiUrl || !params.id) return;

    fetchProduct(params.id as string);

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchProduct(params.id as string);
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id, apiUrl, configLoaded, fetchProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-blue-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-700 font-semibold text-xl">Loading product details...</p>
          <div className="mt-2 flex space-x-1">
            <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-brand-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-12 shadow-glass">
          <div className="w-16 h-16 bg-danger-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-6">Product not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black rounded-2xl hover:from-brand-coral hover:to-brand-orange transition-all duration-300 transform hover:scale-105 shadow-brutal hover:shadow-brutal-lg uppercase tracking-wide"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-blue-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-40 h-40 bg-brand-orange rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-brand-blue rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-brand-coral rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-brand-orange/50 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-brand-blue/50 rounded-full blur-xl"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-glass-lg sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-white hover:text-brand-orange transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-2xl font-black tracking-tight">
              🛒 <span className="bg-gradient-to-r from-brand-orange to-brand-coral bg-clip-text text-transparent">INVISIMART</span>
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Product Detail Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">
          {/* Image Section */}
          <div className="flex flex-col">
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-glass-lg">
              <div className="relative w-full h-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="space-y-8 bg-white/60 backdrop-blur-sm border border-white/30 rounded-3xl p-8 shadow-glass">
              {/* Product Name */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-none">
                  {product.name}
                </h1>
              </div>

              {/* Price and Availability */}
              <div className="space-y-6">
                <div className="flex items-baseline space-x-4">
                  <p className="text-5xl font-black text-brand-orange">
                    ${Math.round(product.price)}
                  </p>
                  <p className="text-sm text-slate-600 font-semibold bg-success-100 px-3 py-1 rounded-full">
                    FREE SHIPPING
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Online Availability */}
                  <div className="bg-glass-200 backdrop-blur-sm border border-glass-300 rounded-2xl p-4">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${product.inventoryUnavailable ? 'bg-gray-500' : product.onlineInStock ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">ONLINE</p>
                        <p className={`text-sm font-black ${product.inventoryUnavailable ? 'text-gray-500' : product.onlineInStock ? 'text-success-700' : 'text-danger-700'}`}>
                          {product.inventoryUnavailable ? 'INVENTORY NOT AVAILABLE' : product.onlineInStock ? `${product.onlineStock} in stock` : 'OUT OF STOCK'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* In-Store Availability */}
                  <div className="bg-glass-200 backdrop-blur-sm border border-glass-300 rounded-2xl p-4">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${product.inventoryUnavailable ? 'bg-gray-500' : product.inStoreInStock ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">IN-STORE</p>
                        <p className={`text-sm font-black ${product.inventoryUnavailable ? 'text-gray-500' : product.inStoreInStock ? 'text-success-700' : 'text-danger-700'}`}>
                          {product.inventoryUnavailable ? 'INVENTORY NOT AVAILABLE' : product.inStoreInStock ? `${product.inStoreStock} in stock` : 'OUT OF STOCK'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg text-slate-700">
                <p className="text-lg leading-relaxed font-medium">
                  {product.description || "Experience the quality and craftsmanship of this exceptional product. Perfect for everyday use and built to last with premium materials and attention to detail."}
                </p>
              </div>

              {/* Product Features */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Features:</h3>
                <div className="grid gap-3">
                  <div className="flex items-center bg-glass-100 rounded-2xl p-3">
                    <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-slate-800">High-quality materials</span>
                  </div>
                  <div className="flex items-center bg-glass-100 rounded-2xl p-3">
                    <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-slate-800">Fast shipping available</span>
                  </div>
                  <div className="flex items-center bg-glass-100 rounded-2xl p-3">
                    <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-slate-800">30-day return policy</span>
                  </div>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-glass-200 backdrop-blur-sm border-2 border-slate-800 rounded-2xl px-4 py-3 text-lg font-bold focus:outline-none transition-all duration-300 shadow-brutal focus:bg-slate-800 focus:text-white"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {!product.inventoryUnavailable && product.onlineStock && product.onlineStock <= 10 && (
                    <span className="text-sm text-orange-600 font-bold">
                      Only {product.onlineStock} left!
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    productPrice={product.price}
                    productImage={product.image}
                    onlineInStock={true}
                    quantity={quantity}
                    size="large"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t-2 border-glass-300 pt-6 space-y-4">
                <div className="flex items-center text-slate-700 bg-glass-100 rounded-2xl p-3">
                  <svg className="w-6 h-6 mr-3 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-bold">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center text-slate-700 bg-glass-100 rounded-2xl p-3">
                  <svg className="w-6 h-6 mr-3 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
