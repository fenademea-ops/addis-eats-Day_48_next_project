"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Order } from "@/lib/fixtures/orders";
import { subscribeToOrderStatus } from "@/lib/services/mock-order-service";

// Dynamically import Leaflet DeliveryMap to avoid SSR 'window is not defined' errors
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-[320px] rounded-xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center gap-2 animate-pulse"
      aria-label="Loading interactive delivery map"
    >
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-stone-400">Loading OpenStreetMap tiles…</span>
    </div>
  ),
});

interface MapPanelProps {
  initialOrder: Order;
}

export function MapPanel({ initialOrder }: MapPanelProps) {
  const [currentOrder, setCurrentOrder] = useState<Order>(initialOrder);
  const [connectionStatus, setConnectionStatus] = useState<"Live" | "Reconnecting" | "Closed">("Live");

  useEffect(() => {
    // Subscribe to simulated real-time mock EventSource stream
    const unsubscribe = subscribeToOrderStatus(
      initialOrder.id,
      (updated) => {
        setCurrentOrder(updated);
        setConnectionStatus(
          updated.status === "delivered" || updated.status === "cancelled" ? "Closed" : "Live"
        );
      },
      (err) => {
        console.warn("Mock stream warning:", err.message);
        setConnectionStatus("Reconnecting");
      }
    );

    return () => {
      unsubscribe();
    };
  }, [initialOrder.id]);

  const courierLat = currentOrder.courier?.lat || 9.0010;
  const courierLng = currentOrder.courier?.lng || 38.7850;
  const destLat = currentOrder.deliveryLocation?.lat || 8.9950;
  const destLng = currentOrder.deliveryLocation?.lng || 38.7896;

  const courierName = currentOrder.courier?.name || "Mulugeta Tadesse";
  const courierPhone = currentOrder.courier?.phone || "+251911998877";

  return (
    <div className="space-y-6">
      {/* Live Stream Connection Indicator */}
      <div className="flex items-center justify-between bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === "Live"
                ? "bg-emerald-400 animate-pulse"
                : connectionStatus === "Reconnecting"
                ? "bg-amber-400"
                : "bg-stone-500"
            }`}
          />
          <span className="font-semibold text-stone-200">
            Stream Status: <span className="font-mono">{connectionStatus}</span>
          </span>
          <span className="text-stone-400 hidden sm:inline">
            (EventSource simulation)
          </span>
        </div>

        <span className="text-stone-400 text-[11px]">
          Fulfilling Order: <strong className="text-amber-400 font-mono">{currentOrder.id}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Dynamic Leaflet Map Container */}
        <div className="lg:col-span-2">
          <DeliveryMap
            courierPos={[courierLat, courierLng]}
            destinationPos={[destLat, destLng]}
            courierName={courierName}
            destinationAddress={currentOrder.address}
          />
          <p className="text-[11px] text-stone-400 mt-2">
            * Map tiles rendered via OpenStreetMap contributors for coursework demonstration.
          </p>
        </div>

        {/* Text Equivalent Panel (Essential for Accessibility) */}
        <aside
          className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5"
          aria-label="Accessible Delivery Status Summary"
        >
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
              Accessible Dispatch Details
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Textual alternative to map coordinates
            </p>
          </div>

          {/* Status */}
          <div>
            <span className="text-xs text-stone-400 block">Current Status</span>
            <span className="text-sm font-bold uppercase tracking-wide text-amber-400 font-mono">
              {currentOrder.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Courier Info */}
          <div>
            <span className="text-xs text-stone-400 block">Assigned Courier</span>
            <p className="text-sm font-semibold text-stone-100">{courierName}</p>
            <p className="text-xs text-stone-400 font-mono">{courierPhone}</p>
          </div>

          {/* Destination */}
          <div>
            <span className="text-xs text-stone-400 block">Destination Area</span>
            <p className="text-sm font-semibold text-stone-100">
              {currentOrder.neighborhood}, Addis Ababa
            </p>
            <p className="text-xs text-stone-400">{currentOrder.address}</p>
          </div>

          {/* Estimated Arrival */}
          <div>
            <span className="text-xs text-stone-400 block">Estimated Delivery Window</span>
            <p className="text-sm font-bold text-emerald-400">
              {currentOrder.status === "delivered"
                ? "Delivered to Customer"
                : `~${currentOrder.estimatedDeliveryMinutes || 25} minutes`}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
