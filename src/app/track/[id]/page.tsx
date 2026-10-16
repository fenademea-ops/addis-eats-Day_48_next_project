"use client";

import React, { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { getOrderById } from "@/lib/services/mock-order-service";
import { FIXTURE_ORDERS } from "@/lib/fixtures/orders";
import { MapPanel } from "@/components/track/MapPanel";

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isStaff, isHydrated } = useAuth();

  // Find seed data from fixtures for instant SSR/first-view when available
  const initialSeed = FIXTURE_ORDERS.find((o) => o.id === id);

  // SWR query key includes order ID and active demo user
  const swrKey = id ? ["track-order", id, user?.id || "anonymous"] : null;

  const fetcher = async () => {
    const res = await getOrderById(id, user);
    if (!res.success || !res.order) {
      throw new Error(res.error || "Order not found in this session.");
    }
    return res.order;
  };

  const { data: order, error, isLoading } = useSWR(swrKey, fetcher, {
    fallbackData: initialSeed && (isStaff || initialSeed.userId === user?.id) ? initialSeed : undefined,
    revalidateOnFocus: false,
  });

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-72 bg-stone-900 rounded-xl border border-stone-800" />
      </div>
    );
  }

  // Refusal or Not Found state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-xl text-red-300">
          🚫
        </div>
        <h1 className="text-xl font-bold text-stone-100">
          Tracking Not Found or Permission Denied
        </h1>
        <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
          {error.message}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/orders"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 min-h-[44px] flex items-center"
          >
            ← Back to Orders
          </Link>
          <Link
            href="/signin?next=/orders"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 min-h-[44px] flex items-center"
          >
            Switch Demo Account
          </Link>
        </div>
      </div>
    );
  }

  // Intentional lookup loading state for newly created local session orders
  if (isLoading && !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-60 bg-stone-900 rounded-lg" />
          <div className="h-4 w-96 bg-stone-900 rounded-md" />
        </div>
        <div className="w-full h-[320px] bg-stone-900 border border-stone-800 rounded-xl flex flex-col items-center justify-center gap-2 animate-pulse">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-400">Looking up simulated order dispatch telemetry…</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-stone-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/orders" className="hover:text-amber-400 transition-colors">
              Orders
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/orders/${order.id}`} className="hover:text-amber-400 transition-colors font-mono">
              {order.id}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-200 font-semibold" aria-current="page">
            Tracking
          </li>
        </ol>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
          Live Delivery Tracking
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Follow your simulated courier through Addis Ababa neighborhoods in real time.
        </p>
      </div>

      <MapPanel initialOrder={order} />
    </div>
  );
}
