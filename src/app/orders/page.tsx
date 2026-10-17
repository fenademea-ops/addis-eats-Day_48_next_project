import React, { Suspense } from "react";
import Link from "next/link";
import { OrdersView } from "./OrdersView";
import OrdersLoading from "./loading";

export const metadata = {
  title: "Order History | Addis Eats",
  description: "View and track orders with live status updates and receipts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    page?: string;
    demo?: string;
  }>;
}) {
  const params = await searchParams;
  const sortKey = params?.sort === "total" ? "total" : "date";
  const sortDir = params?.dir === "asc" ? "asc" : "desc";
  const page = parseInt(params?.page || "1", 10) || 1;
  const demoFlag = params?.demo as "empty" | "error" | "slow" | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Header and Scope Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Track previous orders, inspect real-time progress, and export data records.
          </p>
        </div>

        {/* Demo State Forcing Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg p-1.5 text-[11px] text-stone-400">
          <span className="font-semibold text-stone-300 px-1">Force State:</span>
          <Link
            href="/orders?demo=empty"
            className={`px-2 py-1 rounded transition-colors ${
              demoFlag === "empty" ? "bg-amber-500 text-stone-950 font-bold" : "hover:text-stone-200"
            }`}
          >
            Empty
          </Link>
          <Link
            href="/orders?demo=error"
            className={`px-2 py-1 rounded transition-colors ${
              demoFlag === "error" ? "bg-red-700 text-white font-bold" : "hover:text-stone-200"
            }`}
          >
            Error
          </Link>
          <Link
            href="/orders?demo=slow"
            className={`px-2 py-1 rounded transition-colors ${
              demoFlag === "slow" ? "bg-purple-700 text-white font-bold" : "hover:text-stone-200"
            }`}
          >
            Slow (1.5s)
          </Link>
          {demoFlag && (
            <Link
              href="/orders"
              className="px-2 py-1 rounded bg-stone-800 text-stone-200 hover:text-white font-medium"
            >
              Reset
            </Link>
          )}
        </div>
      </div>

      {/* Main View wrapped in Suspense */}
      <Suspense fallback={<OrdersLoading />}>
        <OrdersView
          sortKey={sortKey}
          sortDir={sortDir}
          page={page}
          demoFlag={demoFlag}
        />
      </Suspense>
    </div>
  );
}
