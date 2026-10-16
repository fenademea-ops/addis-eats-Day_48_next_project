import React from "react";
import { FIXTURE_ORDERS } from "@/lib/fixtures/orders";
import { DashboardView } from "./DashboardView";
import { NeighborhoodRevenueData } from "@/components/dashboard/RevenueChart";
import { DayOrderCountData } from "@/components/dashboard/OrdersPerDayChart";

export const metadata = {
  title: "Operations Dashboard | Addis Eats",
  description: "Visual analytics showing revenue by neighborhood and daily order velocity in Addis Ababa.",
};

export default function DashboardPage() {
  // SERVER COMPONENT AGGREGATION:
  // Aggregates raw fixture orders on the server into serializable plain objects
  const neighborhoodMap: Record<string, { revenue: number; orderCount: number }> = {
    Bole: { revenue: 0, orderCount: 0 },
    Kazanchis: { revenue: 0, orderCount: 0 },
    Megenagna: { revenue: 0, orderCount: 0 },
    Piassa: { revenue: 0, orderCount: 0 },
    Sarbet: { revenue: 0, orderCount: 0 },
  };

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

    if (neighborhoodMap[order.neighborhood]) {
      neighborhoodMap[order.neighborhood].revenue += order.subtotal;
      neighborhoodMap[order.neighborhood].orderCount += 1;
    }

    try {
      const d = new Date(order.createdAt);
      const dayKey = `Jun ${d.getUTCDate().toString().padStart(2, "0")}`;
      if (dayMap[dayKey] !== undefined) {
        dayMap[dayKey] += 1;
      }
    } catch {
      // Ignore
    }
  }

  const neighborhoodData: NeighborhoodRevenueData[] = Object.keys(neighborhoodMap).map((name) => ({
    neighborhood: name,
    revenue: neighborhoodMap[name].revenue,
    orderCount: neighborhoodMap[name].orderCount,
  }));

  const daysData: DayOrderCountData[] = Object.keys(dayMap).map((date) => ({
    date,
    orderCount: dayMap[date],
  }));

  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <DashboardView
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      avgOrderValue={avgOrderValue}
      neighborhoodData={neighborhoodData}
      daysData={daysData}
    />
  );
}
