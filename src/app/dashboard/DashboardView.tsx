"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { RevenueChart, NeighborhoodRevenueData } from "@/components/dashboard/RevenueChart";
import { OrdersPerDayChart, DayOrderCountData } from "@/components/dashboard/OrdersPerDayChart";
import { formatEtb } from "@/lib/format";

interface DashboardViewProps {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  neighborhoodData: NeighborhoodRevenueData[];
  daysData: DayOrderCountData[];
}

export function DashboardView({
  totalRevenue,
  totalOrders,
  avgOrderValue,
  neighborhoodData,
  daysData,
}: DashboardViewProps) {
  const { isStaff, isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-64 bg-stone-900 rounded-2xl border border-stone-800" />
      </div>
    );
  }

  // Access control guard: Staff role required for /dashboard
  if (!isAuthenticated || !isStaff) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-purple-950/70 border border-purple-800 flex items-center justify-center text-2xl text-purple-300">
          🔒
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">
            Staff Access Required
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto leading-relaxed">
            The Operations Dashboard is reserved for authorized Addis Eats kitchen managers and dispatch supervisors.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signin?next=%2Fdashboard"
            className="min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors flex items-center"
          >
            Sign In with Staff Account
          </Link>
          <Link
            href="/"
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-medium bg-stone-800 text-stone-200 hover:text-white transition-colors flex items-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Professional Admin Workspace Sidebar */}
        <AdminSidebar />

        {/* Right: Main Dashboard Content Area */}
        <main className="flex-1 w-full space-y-8">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                  Operations Overview
                </h1>
                <span className="text-xs bg-purple-950/80 text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-800/60 uppercase font-mono">
                  Live View
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Real-time performance metrics across Addis Ababa delivery zones.
              </p>
            </div>

            <Link
              href="/kitchen"
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-100 border border-purple-700/80 transition-colors flex items-center justify-center shrink-0"
            >
              Go to Kitchen Line →
            </Link>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-2 shadow-sm hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400">
                <span>Total Revenue</span>
                <span className="text-amber-400 text-sm">💰</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                {formatEtb(totalRevenue)}
              </p>
              <span className="text-[11px] text-stone-400 block">Across 5 Addis Ababa zones</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-2 shadow-sm hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400">
                <span>Orders Dispatched</span>
                <span className="text-stone-300 text-sm">📦</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-stone-100">
                {totalOrders}
              </p>
              <span className="text-[11px] text-stone-400 block">Orders successfully delivered</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-2 shadow-sm hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400">
                <span>Average Order Value</span>
                <span className="text-emerald-400 text-sm">📈</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
                {formatEtb(avgOrderValue)}
              </p>
              <span className="text-[11px] text-stone-400 block">Authoritative ETB per order</span>
            </div>
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Bar Chart Leaf: Revenue by Neighborhood */}
            <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md">
              <RevenueChart data={neighborhoodData} />
            </section>

            {/* Line Chart Leaf: Orders per Day */}
            <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md">
              <OrdersPerDayChart data={daysData} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
