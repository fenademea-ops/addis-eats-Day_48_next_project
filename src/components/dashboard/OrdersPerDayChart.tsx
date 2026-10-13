"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface DayOrderCountData {
  date: string; // e.g. "Jun 03"
  orderCount: number;
}

interface OrdersPerDayChartProps {
  data: DayOrderCountData[];
}

export function OrdersPerDayChart({ data }: OrdersPerDayChartProps) {
  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div>
        <h3 className="text-sm font-semibold text-stone-200">
          Orders per Day (Sample Data, June 2026)
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Daily delivery transaction velocity over the recorded billing period.
        </p>
      </div>

      {/* Fixed Height Container (h-72 = 288px) to prevent layout shifts */}
      <div className="h-72 w-full bg-stone-950/60 border border-stone-800/80 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#a8a29e"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#44403c" }}
            />
            <YAxis
              domain={[0, "auto"]}
              width={40}
              stroke="#a8a29e"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#44403c" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DayOrderCountData;
                  return (
                    <div className="bg-stone-900 border border-stone-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <strong className="block text-stone-100 font-semibold">
                        {item.date}, 2026
                      </strong>
                      <div className="text-amber-400 font-mono font-bold">
                        {item.orderCount} Orders Dispatched
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              name="Orders Dispatched"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981" }}
              activeDot={{ r: 6, fill: "#34d399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Table Equivalent beneath the line chart */}
      <div className="overflow-x-auto rounded-lg border border-stone-800 bg-stone-900/40">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">
            Orders per day in June 2026 (tabular equivalent of line chart)
          </caption>
          <thead>
            <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400">
              <th scope="col" className="py-2.5 px-3 font-semibold">Date (June 2026)</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Orders Dispatched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 font-mono">
            {data.map((row) => (
              <tr key={row.date} className="hover:bg-stone-800/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-200">{row.date}</td>
                <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                  {row.orderCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
