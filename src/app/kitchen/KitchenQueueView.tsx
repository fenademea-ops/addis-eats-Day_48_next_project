"use client";

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { updateKitchenStatus, listOrders } from "@/lib/services/mock-order-service";
import { OrderStatus } from "@/lib/fixtures/orders";
import { formatEtb, formatWhen } from "@/lib/format";
import { KitchenMenuManager } from "@/components/kitchen/KitchenMenuManager";

export function KitchenQueueView() {
  const { user, isStaff, isAuthenticated, isHydrated } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "menu">("queue");

  const swrKey = ["kitchen-queue", user?.id || "anonymous"];

  const fetcher = async () => {
    // Staff can list all orders
    return listOrders({
      role: "staff",
      sort: "date",
      dir: "desc",
      pageSize: 30,
    });
  };

  const { data, mutate, isLoading } = useSWR(isStaff ? swrKey : null, fetcher);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateKitchenStatus(orderId, nextStatus, user);
      if (res.success && res.order) {
        mutate();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-800 rounded" />
        <div className="h-40 bg-stone-950 rounded" />
      </div>
    );
  }

  // Interface Guard Check
  if (!isAuthenticated || !isStaff) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-purple-950/70 border border-purple-800 flex items-center justify-center text-2xl text-purple-300">
          🔒
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            Kitchen Staff Permission Required
          </h2>
          <p className="text-xs text-stone-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            The Kitchen Queue is restricted to staff members.
            {isAuthenticated ? (
              <span> You are currently signed in as <strong>{user?.name} (Customer)</strong>.</span>
            ) : (
              <span> You are currently in the demo signed-out state.</span>
            )}
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signin?next=/kitchen"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
          >
            Switch to Kitchen Staff Identity
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-300 hover:text-white"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const activeOrdersCount = orders.filter(
    (o) => o.status === "received" || o.status === "preparing"
  ).length;

  return (
    <div className="space-y-6">
      {/* Subsystem Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
            activeTab === "queue"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10"
              : "bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
          }`}
          aria-selected={activeTab === "queue"}
          role="tab"
        >
          <span>🍳 Live Order Queue</span>
          {activeOrdersCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                activeTab === "queue"
                  ? "bg-stone-950 text-amber-300"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {activeOrdersCount} Active
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("menu")}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
            activeTab === "menu"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10"
              : "bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
          }`}
          aria-selected={activeTab === "menu"}
          role="tab"
        >
          <span>📋 Menu & Inventory (CRUD / 86 Items)</span>
        </button>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-xs text-stone-400">
        <strong>Kitchen Access Control:</strong> You are viewing as <strong>{user?.name} (Staff)</strong>.
        Changes to dish pricing and availability immediately propagate to all customer views in real time.
      </div>

      {activeTab === "menu" ? (
        <KitchenMenuManager />
      ) : isLoading && !data ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-stone-900 rounded-xl border border-stone-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-xs text-stone-400">
          No orders currently in the kitchen queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4 hover:border-stone-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400 block">
                    {order.id}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatWhen(order.createdAt)}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Items List */}
              <div className="text-xs bg-stone-950/60 border border-stone-800/80 rounded-lg p-3 space-y-1.5">
                <strong className="block text-stone-300 text-[11px] uppercase tracking-wider mb-1">
                  Cook Order:
                </strong>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-stone-200">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-mono text-stone-400">
                      {formatEtb(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination */}
              <div className="text-xs text-stone-400">
                <span className="text-stone-300 font-medium">Deliver to: </span>
                {order.customerName} ({order.neighborhood}) — {order.phone}
              </div>

              {/* Status Advancement Controls */}
              <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-stone-100">
                  Total: {formatEtb(order.subtotal)}
                </div>

                <div className="flex items-center gap-1.5">
                  {order.status === "received" && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, "preparing")}
                      className="min-h-[36px] px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
                    >
                      Start Cooking 🍳
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, "out_for_delivery")}
                      className="min-h-[36px] px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                    >
                      Dispatch Courier 🛵
                    </button>
                  )}
                  {order.status === "out_for_delivery" && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, "delivered")}
                      className="min-h-[36px] px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      Mark Delivered ✅
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <span className="text-xs font-semibold text-emerald-400">
                      Completed Order
                    </span>
                  )}
                  {order.status === "cancelled" && (
                    <span className="text-xs font-semibold text-red-400">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
