"use client";

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  creditCard: string;
  billingAddress: string;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    creditCard: '',
    billingAddress: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCreditCard = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCreditCard(e.target.value);
    setFormData((prev) => ({ ...prev, creditCard: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, customerPhone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

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

      // Prepare purchase data
      const purchaseData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone.replace(/\D/g, ''),
        creditCard: formData.creditCard.replace(/\s/g, ''),
        billingAddress: formData.billingAddress,
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      // Submit purchase
      const response = await fetch(`${apiUrl}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process purchase');
      }

      const result = await response.json();
      
      // Clear cart
      clearCart();
      
      // Redirect to confirmation page
      router.push(`/confirmation?orderId=${result.orderId}`);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center shadow-glass">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">Add some products before checking out!</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-brutal"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-slate-900">Checkout</h1>
          <Link
            href="/cart"
            className="px-6 py-3 bg-white border-2 border-slate-800 rounded-2xl font-bold text-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-brutal"
          >
            ← BACK TO CART
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-glass">
              <div className="flex items-center gap-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-orange" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-black text-slate-900">Secure Payment Information</h2>
              </div>

              <p className="text-slate-600 mb-8 bg-blue-50 p-4 rounded-2xl">
                <strong className="text-blue-800">🔐 Protected by HashiCorp Vault:</strong> Your sensitive data is encrypted using industry-standard encryption before storage.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-red-800 font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-bold text-slate-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-brand-orange focus:outline-none font-semibold"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-bold text-slate-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-brand-orange focus:outline-none font-semibold"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-bold text-slate-900 mb-2">
                    Phone Number * 
                    <span className="text-xs text-slate-500 ml-2">(Encrypted with Vault Transit)</span>
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handlePhoneChange}
                    required
                    maxLength={14}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-brand-orange focus:outline-none font-semibold"
                    placeholder="(123) 456-7890"
                  />
                </div>

                {/* Credit Card */}
                <div>
                  <label htmlFor="creditCard" className="block text-sm font-bold text-slate-900 mb-2">
                    Credit Card Number * 
                    <span className="text-xs text-slate-500 ml-2">(Encrypted with Vault Transit)</span>
                  </label>
                  <input
                    type="text"
                    id="creditCard"
                    name="creditCard"
                    value={formData.creditCard}
                    onChange={handleCreditCardChange}
                    required
                    maxLength={19}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-brand-orange focus:outline-none font-semibold"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <label htmlFor="billingAddress" className="block text-sm font-bold text-slate-900 mb-2">
                    Billing Address *
                  </label>
                  <textarea
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-brand-orange focus:outline-none font-semibold resize-none"
                    placeholder="123 Main St, Apt 4, City, State 12345"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full mt-8 py-4 font-black rounded-2xl uppercase tracking-wide transition-all duration-300 ${
                  isProcessing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-orange to-brand-coral text-white hover:scale-105 shadow-brutal'
                }`}
              >
                {isProcessing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-glass sticky top-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-3 flex justify-between">
                  <span className="text-xl font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-brand-orange">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
