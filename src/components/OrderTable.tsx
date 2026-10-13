"use client";

import React from "react";
import Link from "next/link";
import { Order } from "@/lib/fixtures/orders";
import { formatEtb, formatWhen } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";

interface OrderTableProps {
  orders: Order[];
  total: number;
  currentPage: number;
  totalPages: number;
  sortKey: "date" | "total";
  sortDir: "asc" | "desc";
  demoFlag?: string;
}

export function OrderTable({
  orders,
  total,
  currentPage,
  totalPages,
  sortKey,
  sortDir,
  demoFlag,
}: OrderTableProps) {
  // Helper to build URL for sort links
  const createSortUrl = (column: "date" | "total") => {
    const nextDir = sortKey === column && sortDir === "desc" ? "asc" : "desc";
    const params = new URLSearchParams();
    params.set("sort", column);
    params.set("dir", nextDir);
    params.set("page", "1"); // Reset to page 1 on sort change
    if (demoFlag) params.set("demo", demoFlag);
    return `/orders?${params.toString()}`;
  };

  // Helper to build URL for pagination links
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("sort", sortKey);
    params.set("dir", sortDir);
    params.set("page", page.toString());
    if (demoFlag) params.set("demo", demoFlag);
    return `/orders?${params.toString()}`;
  };

  // CSV Export handler
  const handleExportCsv = () => {
    const exportRows = orders.map((o) => ({
      "Order ID": o.id,
      Date: o.createdAt,
      Customer: o.customerName,
      Neighborhood: o.neighborhood,
      Address: o.address,
      Items: o.items.map((i) => `${i.name} (x${i.quantity})`).join("; "),
      "Total ETB": o.subtotal,
      Status: o.status,
    }));

    const csvString = toCsv(exportRows);
    downloadCsv(csvString, `addis-eats-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "received":
        return "bg-blue-950/70 text-blue-300 border-blue-800/60";
      case "preparing":
        return "bg-amber-950/70 text-amber-300 border-amber-800/60";
      case "out_for_delivery":
        return "bg-purple-950/70 text-purple-300 border-purple-800/60";
      case "delivered":
        return "bg-emerald-950/70 text-emerald-300 border-emerald-800/60";
      case "cancelled":
        return "bg-stone-800 text-stone-400 border-stone-700";
      default:
        return "bg-stone-800 text-stone-300 border-stone-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Count + CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <p className="text-xs text-stone-400">
          Showing <span className="font-semibold text-stone-200">{orders.length}</span> of{" "}
          <span className="font-semibold text-stone-200">{total}</span> total orders
        </p>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 border border-stone-700 hover:border-amber-500/50 hover:bg-stone-800 rounded-lg text-xs font-semibold text-stone-200 transition-colors min-h-[44px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Export current orders to CSV"
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Real Semantic Table with Accessible Markup */}
      <div
        tabIndex={0}
        aria-label="Order history table, scroll horizontally on narrow screens"
        className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-900/90 shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <table className="w-full text-left text-xs border-collapse">
          <caption className="sr-only">
            Customer order history including order IDs, dates, status, neighborhood, and total prices in ETB.
          </caption>
          <thead>
            <tr className="border-b border-stone-800 bg-stone-950/70 text-stone-300">
              {/* Order ID */}
              <th scope="col" className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                Order ID
              </th>

              {/* Date with Sort Link */}
              <th
                scope="col"
                className="py-3.5 px-4 font-semibold uppercase tracking-wider"
                aria-sort={
                  sortKey === "date"
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <Link
                  href={createSortUrl("date")}
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
                  aria-label={`Sort by date, currently ${sortKey === "date" ? sortDir : "unsorted"}`}
                >
                  <span>Date</span>
                  <span className="font-mono text-stone-400">
                    {sortKey === "date" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </Link>
              </th>

              {/* Neighborhood */}
              <th scope="col" className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                Neighborhood
              </th>

              {/* Status */}
              <th scope="col" className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                Status
              </th>

              {/* Items Summary */}
              <th scope="col" className="py-3.5 px-4 font-semibold uppercase tracking-wider">
                Items
              </th>

              {/* Total with Sort Link (Right Aligned) */}
              <th
                scope="col"
                className="py-3.5 px-4 font-semibold uppercase tracking-wider text-right"
                aria-sort={
                  sortKey === "total"
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <Link
                  href={createSortUrl("total")}
                  className="inline-flex items-center gap-1.5 justify-end hover:text-amber-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
                  aria-label={`Sort by total amount, currently ${sortKey === "total" ? sortDir : "unsorted"}`}
                >
                  <span>Total (ETB)</span>
                  <span className="font-mono text-stone-400">
                    {sortKey === "total" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </Link>
              </th>

              {/* Action Link */}
              <th scope="col" className="py-3.5 px-4 font-semibold uppercase tracking-wider text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-stone-800/40 transition-colors"
              >
                {/* Order ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                  <Link
                    href={`/orders/${order.id}`}
                    className="hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                  >
                    {order.id}
                  </Link>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-stone-300 whitespace-nowrap font-mono tabular-nums">
                  {formatWhen(order.createdAt)}
                </td>

                {/* Neighborhood */}
                <td className="py-3.5 px-4 text-stone-300 whitespace-nowrap">
                  {order.neighborhood}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </td>

                {/* Items Summary */}
                <td className="py-3.5 px-4 text-stone-400 max-w-xs truncate">
                  {order.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                </td>

                {/* Total (Right-aligned with tabular numbers) */}
                <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-100 tabular-nums whitespace-nowrap">
                  {formatEtb(order.subtotal)}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-2.5 py-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[36px] flex items-center"
                    >
                      Status
                    </Link>
                    <Link
                      href={`/track/${order.id}`}
                      className="px-2.5 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[36px] flex items-center"
                    >
                      Track 🗺️
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Numbered Pagination (Real Links matching URL query parameters) */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-1.5 pt-4"
          aria-label="Order table pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Go to previous orders page"
            >
              ← Prev
            </Link>
          ) : (
            <span
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900/50 border border-stone-800/40 text-stone-600 cursor-not-allowed flex items-center justify-center"
              aria-disabled="true"
            >
              ← Prev
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isCurrent = p === currentPage;
            return (
              <Link
                key={p}
                href={createPageUrl(p)}
                className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isCurrent
                    ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                    : "bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </Link>
            );
          })}

          {currentPage < totalPages ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Go to next orders page"
            >
              Next →
            </Link>
          ) : (
            <span
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900/50 border border-stone-800/40 text-stone-600 cursor-not-allowed flex items-center justify-center"
              aria-disabled="true"
            >
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
