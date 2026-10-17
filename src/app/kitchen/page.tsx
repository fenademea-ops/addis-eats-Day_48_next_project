import React from "react";
import { KitchenQueueView } from "./KitchenQueueView";

export const metadata = {
  title: "Kitchen Queue | Addis Eats",
  description: "Staff interface for real-time kitchen preparation and courier dispatch.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KitchenPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
          Kitchen Order Queue
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Real-time order line for kitchen cooks and courier dispatch staff.
        </p>
      </div>

      <KitchenQueueView />
    </div>
  );
}
