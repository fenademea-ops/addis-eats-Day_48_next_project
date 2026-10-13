import React from "react";
import Link from "next/link";
import { FIXTURE_ORDERS } from "@/lib/fixtures/orders";
import { RevenueChart, NeighborhoodRevenueData } from "@/components/dashboard/RevenueChart";
import { OrdersPerDayChart, DayOrderCountData } from "@/components/dashboard/OrdersPerDayChart";
import { formatEtb } from "@/lib/format";

export const metadata = {
  title: "Kitchen & Staff Dashboard | Addis Eats",
  description: "Visual analytics showing revenue by neighborhood and daily order velocity in Addis Ababa.",
};

export default function DashboardPage() {
  // SERVER COMPONENT AGGREGATION:
  // Aggregates raw fixture orders on the server into small, serializable plain objects
  // (no Date instances, no Map objects, only plain numbers and strings).

  // 1. Neighborhood aggregation
  const neighborhoodMap: Record<string, { revenue: number; orderCount: number }> = {
    Bole: { revenue: 0, orderCount: 0 },
    Kazanchis: { revenue: 0, orderCount: 0 },
    Megenagna: { revenue: 0, orderCount: 0 },
    Piassa: { revenue: 0, orderCount: 0 },
    Sarbet: { revenue: 0, orderCount: 0 },
  };

  // 2. Day aggregation (June 2026 dates)
  const dayMap: Record<string, number> = {
    "Jun 03": 0,
    "Jun 04": 0,
    "Jun 05": 0,
    "Jun 07": 0,
    "Jun 08": 0,
    "Jun 09": 0,
    "Jun 10": 0,
    "Jun 11": 0,
    "Jun 12": 0,
  };

  let totalRevenue = 0;
  let totalOrders = 0;

  for (const order of FIXTURE_ORDERS) {
    totalRevenue += order.subtotal;
    totalOrders += 1;

    // Neighborhood
    if (neighborhoodMap[order.neighborhood]) {
      neighborhoodMap[order.neighborhood].revenue += order.subtotal;
      neighborhoodMap[order.neighborhood].orderCount += 1;
    }

    // Day formatted as "Jun DD"
    try {
      const d = new Date(order.createdAt);
      const dayKey = `Jun ${d.getUTCDate().toString().padStart(2, "0")}`;
      if (dayMap[dayKey] !== undefined) {
        dayMap[dayKey] += 1;
      }
    } catch {
      // Ignore invalid date
    }
  }

  // Convert to plain serializable array for RevenueChart
  const neighborhoodData: NeighborhoodRevenueData[] = Object.keys(neighborhoodMap).map((name) => ({
    neighborhood: name,
    revenue: neighborhoodMap[name].revenue,
    orderCount: neighborhoodMap[name].orderCount,
  }));

  // Convert to plain serializable array for OrdersPerDayChart
  const daysData: DayOrderCountData[] = Object.keys(dayMap).map((date) => ({
    date,
    orderCount: dayMap[date],
  }));

  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Banner Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Operations Dashboard
            </h1>
            <span className="text-xs bg-purple-950/70 text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-800/60 uppercase">
              Staff View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Aggregated operational metrics for kitchen managers and logistics dispatch.
          </p>
        </div>

        <Link
          href="/kitchen"
          className="min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-semibold bg-stone-900 border border-stone-700 hover:border-amber-500/60 text-stone-200 hover:text-white transition-colors flex items-center justify-center shrink-0"
        >
          View Live Kitchen Queue →
        </Link>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-xs text-stone-400">
        <strong>Server Aggregation Note:</strong> This page is a Server Component.
        Order calculations are executed on the server, passing minimal serializable payloads to client chart leaves.
        All figures represent fictitious sample data (June 2026).
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Total Sample Revenue
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
            {formatEtb(totalRevenue)}
          </p>
          <span className="text-[11px] text-stone-400 block">Across 5 Addis neighborhoods</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Total Orders Logged
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-stone-100">
            {totalOrders}
          </p>
          <span className="text-[11px] text-stone-400 block">June 2026 test records</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Average Order Value
          </span>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatEtb(avgOrderValue)}
          </p>
          <span className="text-[11px] text-stone-400 block">Integer ETB per delivery</span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Bar Chart Leaf: Revenue by Neighborhood */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <RevenueChart data={neighborhoodData} />
        </section>

        {/* Line Chart Leaf: Orders per Day */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <OrdersPerDayChart data={daysData} />
        </section>
      </div>
    </div>
  );
}
