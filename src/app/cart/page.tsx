"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatEtb } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-40 bg-stone-900 rounded-xl border border-stone-800" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl text-amber-500">
          🛒
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
            You haven&apos;t added any delicious Ethiopian dishes yet. Explore our menu to start your order!
          </p>
        </div>
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Browse Authentic Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Review your selected items before proceeding to checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-red-400 transition-colors p-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px] flex items-center"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-6">
        {/* Cart Item Rows */}
        <div className="space-y-3">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            return (
              <div
                key={item.dishId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-900 border border-stone-800 rounded-xl"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-950 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/menu/${item.dishId}`}
                      className="text-sm font-semibold text-stone-100 hover:text-amber-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Unit price: {formatEtb(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-800">
                  {/* Stepper */}
                  <div className="flex items-center border border-stone-700 bg-stone-950 rounded-lg min-h-[44px] p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                      className="min-h-[40px] min-w-[40px] rounded-md text-stone-300 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span
                      className="px-3 text-xs font-bold font-mono text-stone-100"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                      className="min-h-[40px] min-w-[40px] rounded-md text-stone-300 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-sm font-bold font-mono text-stone-200 min-w-[80px] text-right">
                    {formatEtb(lineTotal)}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.dishId)}
                    className="text-stone-400 hover:text-red-400 transition-colors p-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between text-base font-bold text-stone-100">
            <span>Subtotal</span>
            <span className="text-xl font-mono text-amber-400">{formatEtb(subtotal)}</span>
          </div>

          <p className="text-xs text-stone-400 leading-normal">
            No taxes, shipping fees, discounts, or minimum order requirements are added, as per the course specification.
          </p>

          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Link
              href="/menu"
              className="text-xs text-stone-300 hover:text-amber-400 transition-colors min-h-[44px] flex items-center justify-center"
            >
              ← Continue Browsing Menu
            </Link>

            <Link
              href="/checkout"
              className="min-h-[44px] px-8 py-3 rounded-lg text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors text-center shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center justify-center"
            >
              Proceed to Demo Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
