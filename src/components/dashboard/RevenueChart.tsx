"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatEtb } from "@/lib/format";

export interface NeighborhoodRevenueData {
  neighborhood: string;
  revenue: number; // Integer ETB
  orderCount: number;
}

interface RevenueChartProps {
  data: NeighborhoodRevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200">
          Revenue by Neighborhood (ETB, Sample Data, June 2026)
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Aggregated order volume across Addis Ababa service zones.
        </p>
      </div>

      {/* Fixed Height Container (h-72 = 288px) to prevent layout shifts */}
      <div className="h-72 w-full bg-stone-950/60 border border-stone-800/80 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis
              dataKey="neighborhood"
              stroke="#a8a29e"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#44403c" }}
            />
            {/* Y axis starts at zero with explicit width and formatEtb */}
            <YAxis
              domain={[0, "auto"]}
              width={90}
              stroke="#a8a29e"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#44403c" }}
              tickFormatter={(val: number) => formatEtb(val)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as NeighborhoodRevenueData;
                  return (
                    <div className="bg-stone-900 border border-stone-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                      <strong className="block text-stone-100 font-semibold">
                        {item.neighborhood}
                      </strong>
                      <div className="text-amber-400 font-mono font-bold">
                        Revenue: {formatEtb(item.revenue)}
                      </div>
                      <div className="text-stone-400">
                        Orders: {item.orderCount} deliveries
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="revenue"
              name="Neighborhood Revenue (ETB)"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Table Equivalent beneath the chart */}
      <div className="overflow-x-auto rounded-lg border border-stone-800 bg-stone-900/40">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">
            Revenue breakdown by neighborhood in Addis Ababa (tabular equivalent of bar chart)
          </caption>
          <thead>
            <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400">
              <th scope="col" className="py-2.5 px-3 font-semibold">Neighborhood</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Orders</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Revenue (ETB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 font-mono">
            {data.map((row) => (
              <tr key={row.neighborhood} className="hover:bg-stone-800/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-200">{row.neighborhood}</td>
                <td className="py-2 px-3 text-right text-stone-400 tabular-nums">{row.orderCount}</td>
                <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">
                  {formatEtb(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
