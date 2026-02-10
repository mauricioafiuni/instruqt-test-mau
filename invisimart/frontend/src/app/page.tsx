"use client";

import ProductList from "@/components/ProductList";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Navigation */}
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-glass-lg sticky top-0 z-50 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-20 w-16 h-16 bg-brand-orange rounded-full blur-xl"></div>
          <div className="absolute top-0 right-20 w-12 h-12 bg-brand-blue rounded-full blur-lg"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-black tracking-tight cursor-pointer">
                  🛒 <span className="bg-gradient-to-r from-brand-orange to-brand-coral bg-clip-text text-transparent">INVISIMART</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-glass-200 backdrop-blur-sm border border-glass-300 rounded-2xl px-4 py-2 text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:bg-white focus:border-brand-orange transition-all duration-200 w-64 font-medium"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <Link href="/cart">
                <button className="relative p-3 rounded-2xl hover:bg-glass-200 transition-all duration-200 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:text-brand-orange transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </Link>
              <a
                href="/admin"
                className="text-sm text-white/80 hover:text-brand-orange transition-colors duration-200 px-4 py-2 rounded-2xl hover:bg-glass-200 font-semibold border border-glass-300 hover:border-brand-orange"
              >
                ADMIN
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div id="products-section" className="relative bg-gradient-to-br from-orange-100 via-orange-50 to-blue-100 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-40 h-40 bg-brand-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-brand-blue rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-brand-coral rounded-full blur-2xl"></div>
          <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-brand-orange/50 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-brand-blue/50 rounded-full blur-xl"></div>
        </div>

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 via-white/50 to-blue-200/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-none">
                <span className="block">INVISIBLE</span>
                <span className="bg-gradient-to-r from-brand-orange via-brand-coral to-brand-blue bg-clip-text text-transparent">
                  PRODUCTS
                </span>
              </h2>
            </div>
            <p className="text-xl text-slate-700 font-semibold max-w-3xl mx-auto leading-relaxed">
              <span className="font-black">&quot;I can&apos;t see it, but I love it!&quot;</span>
            </p>

            {/* Decorative Line */}
            <div className="flex items-center justify-center mt-8">
              <div className="h-1 w-20 bg-gradient-to-r from-brand-orange to-brand-coral rounded-full"></div>
              <div className="w-4 h-4 bg-brand-orange rounded-full mx-4"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-brand-coral to-brand-blue rounded-full"></div>
            </div>
          </div>

          <main>
            <ProductList />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-32 h-32 bg-brand-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-40 h-40 bg-brand-blue rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight">
                🛒 <span className="bg-gradient-to-r from-brand-orange to-brand-coral bg-clip-text text-transparent">INVISIMART</span>
              </h3>
              <p className="text-slate-300 font-medium max-w-md mx-auto">
                The best products aren&apos;t seen, they&apos;re <span className="font-black text-brand-orange">felt</span>. Shop smart, shop invisible.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-8 text-slate-300">
              <a href="#" className="font-semibold hover:text-brand-orange transition-colors duration-300 transform hover:scale-105">About us</a>
              <a href="#" className="font-semibold hover:text-brand-orange transition-colors duration-300 transform hover:scale-105">Contact</a>
              <a href="#" className="font-semibold hover:text-brand-orange transition-colors duration-300 transform hover:scale-105">Privacy Policy</a>
              <a href="#" className="font-semibold hover:text-brand-orange transition-colors duration-300 transform hover:scale-105">Terms of Service</a>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center justify-center">
              <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-brand-orange to-transparent"></div>
            </div>

            {/* Copyright */}
            <p className="text-slate-400 font-medium">
              Copyright © 2025 - All rights reserved by <span className="text-brand-orange font-bold">Invisimart</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
