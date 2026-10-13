"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { listOrders } from "@/lib/services/mock-order-service";
import { OrderTable } from "@/components/OrderTable";

interface OrdersViewProps {
  sortKey?: "date" | "total";
  sortDir?: "asc" | "desc";
  page?: number;
  demoFlag?: "empty" | "error" | "slow";
}

export function OrdersView({
  sortKey = "date",
  sortDir = "desc",
  page = 1,
  demoFlag,
}: OrdersViewProps) {
  const { user, isAuthenticated, isStaff, isHydrated } = useAuth();

  // SWR query key depends on user identity, sort params, page, and demo flag
  const swrKey = [
    "orders",
    user?.id || "anonymous",
    isStaff ? "staff" : "customer",
    sortKey,
    sortDir,
    page,
    demoFlag || "standard",
  ];

  const fetcher = async () => {
    return listOrders({
      userId: user?.id,
      role: user?.role,
      sort: sortKey,
      dir: sortDir,
      page,
      pageSize: 20,
      demo: demoFlag,
    });
  };

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    keepPreviousData: true,
  });

  if (!isHydrated) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-8 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-800 rounded" />
        <div className="h-40 bg-stone-950 rounded" />
      </div>
    );
  }

  // Signed out state
  if (!isAuthenticated) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-xl text-amber-400">
          🔒
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-100">
          Demo Authentication Required
        </h2>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          You are currently in the demo signed-out state. Sign in as Customer (Abebe Bikila) or Staff to view order records.
        </p>
        <Link
          href="/signin?next=/orders"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
        >
          Sign In to Demo Account
        </Link>
      </div>
    );
  }

  // Error State (can be forced with ?demo=error)
  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-8 text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full bg-red-900/60 flex items-center justify-center text-red-200">
          ⚠️
        </div>
        <h2 className="text-base font-bold text-red-200">Order Service Error</h2>
        <p className="text-xs text-stone-300 max-w-md mx-auto">
          {error.message || "Failed to retrieve order history from the mock service layer."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => mutate()}
            className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold bg-red-700 hover:bg-red-600 text-white transition-colors"
          >
            Retry Service Call
          </button>
          {demoFlag && (
            <Link
              href="/orders"
              className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:text-white flex items-center"
            >
              Clear Demo Flag
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-stone-800 rounded-md" />
        ))}
      </div>
    );
  }

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Empty State (can be forced with ?demo=empty)
  if (orders.length === 0) {
    return (
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-12 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-2xl text-amber-500">
          🧾
        </div>
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-100">
            No Orders Yet
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Browse our menu to place your first authentic Ethiopian meal, or switch to another demo identity.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
          >
            Browse The Menu
          </Link>
          {demoFlag && (
            <Link
              href="/orders"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:text-white"
            >
              Clear Demo Flag
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Loaded State
  return (
    <OrderTable
      orders={orders}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      sortKey={sortKey}
      sortDir={sortDir}
      demoFlag={demoFlag}
    />
  );
}
