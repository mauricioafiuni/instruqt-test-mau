"use client";

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-3xl p-12 text-center shadow-glass">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">Add some amazing products to get started!</p>
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
          <h1 className="text-4xl font-black text-slate-900">Shopping Cart</h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white border-2 border-slate-800 rounded-2xl font-bold text-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-brutal"
          >
            ← CONTINUE SHOPPING
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-lg font-black text-slate-900 mb-2">{item.name}</h3>
                    <p className="text-2xl font-black text-brand-orange">${item.price}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-xl font-bold text-slate-800 hover:bg-brand-orange hover:text-white transition-all duration-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-xl font-bold text-slate-800 hover:bg-brand-orange hover:text-white transition-all duration-300"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 bg-red-100 rounded-xl font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-glass sticky top-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-4 flex justify-between">
                  <span className="text-xl font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-brand-orange">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-gradient-to-r from-brand-orange to-brand-coral text-white font-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-brutal uppercase tracking-wide"
              >
                Proceed to Checkout
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold">Secure Checkout with Vault</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
