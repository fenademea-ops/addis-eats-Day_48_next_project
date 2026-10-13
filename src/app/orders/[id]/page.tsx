"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder } from "@/lib/services/mock-order-service";
import { Order, OrderStatus } from "@/lib/fixtures/orders";
import { FIXTURE_ORDERS } from "@/lib/fixtures/orders";
import { formatEtb, formatWhen } from "@/lib/format";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isStaff, isHydrated } = useAuth();

  // Find seed data from fixtures to avoid first-load spinner
  const initialSeed = FIXTURE_ORDERS.find((o) => o.id === id);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // SWR query key includes order ID and mock user ID
  const swrKey = id ? ["order", id, user?.id || "anonymous"] : null;

  const fetcher = async () => {
    const res = await getOrderById(id, user);
    if (!res.success || !res.order) {
      throw new Error(res.error || "Order not found or permission denied.");
    }
    return res.order;
  };

  const { data: order, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: initialSeed && (isStaff || initialSeed.userId === user?.id) ? initialSeed : undefined,
    // Day 41: Poll every 5 seconds until terminal state (delivered or cancelled)
    refreshInterval: (latestData?: Order) => {
      const currentStatus = latestData?.status;
      if (currentStatus === "delivered" || currentStatus === "cancelled") {
        return 0; // Stop polling on terminal state
      }
      return 5000; // 5000ms = 5 seconds
    },
    revalidateOnFocus: false,
  });

  // Handle Order Cancellation (triggers Attack 1 & 2 checks inside the service)
  const handleCancel = async () => {
    if (!order) return;
    setActionError(null);
    setActionSuccess(null);
    setIsCancelling(true);

    try {
      const res = await cancelOrder(order.id, user);
      if (!res.success) {
        setActionError(res.error || "Failed to cancel order.");
      } else {
        setActionSuccess("Order has been successfully cancelled.");
        if (res.order) {
          mutate(res.order, false);
        } else {
          mutate();
        }
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-64 bg-stone-900 rounded-xl border border-stone-800" />
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
          Order Access Refused or Not Found
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

  // Loading state (only for locally created orders not yet in memory or initial fetch)
  if (isLoading && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 w-60 bg-stone-900 rounded-lg" />
        <div className="h-48 bg-stone-900 rounded-xl border border-stone-800" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isTerminal = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Scope Notice */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-xs text-stone-300 flex items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-amber-400">Day 41 SWR Polling Demo: </span>
          <span>Status refreshes every 5 seconds. </span>
          {isTerminal ? (
            <span className="text-stone-400 font-mono">(Polling stopped: terminal state reached)</span>
          ) : (
            <span className="text-emerald-400 font-mono animate-pulse">● Active (5s interval)</span>
          )}
        </div>
        <Link
          href={`/track/${order.id}`}
          className="text-amber-400 hover:underline font-semibold shrink-0"
        >
          View Map & Live Stream →
        </Link>
      </div>

      {actionError && (
        <div role="alert" className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200">
          <strong>Action Refused: </strong> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div role="status" className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200">
          {actionSuccess}
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                Order <span className="font-mono text-amber-400">{order.id}</span>
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Placed on {formatWhen(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 block">Total Amount</span>
            <span className="text-2xl font-mono font-bold text-amber-400">
              {formatEtb(order.subtotal)}
            </span>
          </div>
        </div>

        {/* Stepper Status Progress */}
        <div>
          <h2 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-4">
            Simulated Fulfillment Progress
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            {(["received", "preparing", "out_for_delivery", "delivered"] as OrderStatus[]).map(
              (step, index) => {
                const statusOrder = ["received", "preparing", "out_for_delivery", "delivered"];
                const isCurrent = order.status === step;
                const isPassed = statusOrder.indexOf(order.status) >= index;

                return (
                  <div
                    key={step}
                    className={`p-3 rounded-xl border transition-colors ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                        : isPassed
                        ? "bg-stone-800/80 border-stone-700 text-stone-200"
                        : "bg-stone-950/40 border-stone-800/60 text-stone-500"
                    }`}
                  >
                    <div className="font-mono text-[10px] uppercase mb-1">Step {index + 1}</div>
                    <div>{step.replace(/_/g, " ")}</div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="pt-4 border-t border-stone-800">
          <h2 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3">
            Dishes in Order
          </h2>
          <div className="divide-y divide-stone-800/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-stone-200">{item.name}</span>
                  <span className="text-stone-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-mono text-stone-300">
                  {formatEtb(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="pt-4 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300">
          <div>
            <strong className="block text-stone-400 mb-1">Customer & Contact:</strong>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-stone-400 font-mono">{order.phone}</p>
          </div>
          <div>
            <strong className="block text-stone-400 mb-1">Delivery Destination:</strong>
            <p className="font-medium">{order.neighborhood}</p>
            <p className="text-stone-400">{order.address}</p>
          </div>
        </div>

        {/* Actions Cluster */}
        <div className="pt-6 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/orders"
            className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium text-stone-300 hover:text-white flex items-center"
          >
            ← Back to Order History
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/track/${order.id}`}
              className="min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors flex items-center shadow-xs"
            >
              Interactive Map Tracking 🗺️
            </Link>

            {/* Cancel Button (demonstrates Attacks 1 & 2) */}
            {order.status === "received" && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-red-300 hover:bg-red-950/80 hover:text-red-200 border border-red-900/40 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
