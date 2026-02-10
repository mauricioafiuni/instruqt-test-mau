"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function fetchOrderDetails() {
      try {
        // Get API URL from config endpoint
        let apiUrl: string;
        try {
          const configRes = await fetch('/api/config');
          if (configRes.ok) {
            const config = await configRes.json();
            // Use the API URL from config, which points to the frontend's own URL
            // Next.js rewrites will proxy API requests to the backend
            apiUrl = config.apiUrl || `${window.location.protocol}//${window.location.host}`;
            console.log('API URL from config:', apiUrl);
          } else {
            throw new Error('Config endpoint failed');
          }
        } catch {
          // Fallback: use current browser location (same origin)
          // Requests will be proxied by Next.js rewrites to the backend
          apiUrl = `${window.location.protocol}//${window.location.host}`;
          console.log('Using fallback API URL (same origin):', apiUrl);
        }

        const response = await fetch(`${apiUrl}/purchase?orderId=${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-700 font-semibold text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center shadow-glass">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Unable to Load Order</h2>
            <p className="text-slate-600 mb-8">{error || 'Order not found'}</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-brutal"
            >
              RETURN HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-3xl p-12 text-center shadow-glass mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Purchase Complete!</h1>
          <p className="text-xl text-slate-600 mb-6">
            Thank you for your order, <strong>{orderDetails.customerName}</strong>!
          </p>
          
          <div className="inline-block bg-gradient-to-r from-brand-orange to-brand-coral text-white px-8 py-4 rounded-2xl shadow-brutal">
            <p className="text-sm font-bold mb-1">Order Number</p>
            <p className="text-2xl font-black">{orderDetails.orderId}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl p-8 shadow-glass mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="font-bold text-slate-700">Email</span>
              <span className="text-slate-900">{orderDetails.customerEmail}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="font-bold text-slate-700">Billing Address</span>
              <span className="text-slate-900 text-right">{orderDetails.billingAddress}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="font-bold text-slate-700">Order Date</span>
              <span className="text-slate-900">
                {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-bold text-slate-700">Status</span>
              <span className="px-4 py-1 bg-green-100 text-green-800 font-bold rounded-full uppercase text-sm">
                {orderDetails.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl p-8 shadow-glass mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Items Ordered</h2>
          
          <div className="space-y-4">
            {orderDetails.items && orderDetails.items.map((item: OrderItem) => (
              <div key={item.productId} className="flex justify-between items-center py-4 border-b border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-orange">${item.unitPrice.toFixed(2)} each</p>
                  <p className="text-sm text-slate-600">
                    Subtotal: ${(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-slate-900">Total Paid</span>
              <span className="text-4xl font-black text-brand-orange">
                ${orderDetails.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-black text-blue-900 mb-2">Your Data is Secure</h3>
              <p className="text-blue-800 text-sm">
                All sensitive payment information was encrypted using <strong>HashiCorp Vault Transit engine</strong> before storage. 
                Your credit card and phone number are protected with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-brutal uppercase"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-700 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
