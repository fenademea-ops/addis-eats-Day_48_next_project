"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Accessible custom pin icons using L.divIcon (guarantees zero missing asset 404s)
const courierIcon = L.divIcon({
  className: "custom-courier-pin",
  html: `<div style="background-color: #f59e0b; color: #0c0a09; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🛵</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = L.divIcon({
  className: "custom-dest-pin",
  html: `<div style="background-color: #ef4444; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

interface DeliveryMapProps {
  courierPos: [number, number];
  destinationPos: [number, number];
  courierName: string;
  destinationAddress: string;
}

// Inner component to fit bounds cleanly
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, bounds]);
  return null;
}

export default function DeliveryMap({
  courierPos,
  destinationPos,
  courierName,
  destinationAddress,
}: DeliveryMapProps) {
  const bounds = L.latLngBounds([courierPos, destinationPos]);

  return (
    <div className="w-full h-[320px] rounded-xl overflow-hidden border border-stone-800 shadow-md">
      <MapContainer
        bounds={bounds}
        style={{ height: "100%", width: "100%", backgroundColor: "#1c1917" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />

        {/* Courier Marker */}
        <Marker position={courierPos} icon={courierIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong className="block text-stone-900">Courier: {courierName}</strong>
              <span className="text-stone-600">On the way with your Addis Eats order</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destinationPos} icon={destinationIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong className="block text-stone-900">Delivery Address</strong>
              <span className="text-stone-600">{destinationAddress}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
