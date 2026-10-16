"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  onTabChange?: (tab: string) => void;
}

export function AdminSidebar({ onTabChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "kitchen",
      label: "Kitchen Queue",
      href: "/kitchen",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Order Records",
      href: "/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "menu",
      label: "Menu Management",
      href: "/kitchen?tab=menu",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (item.href === "/dashboard") return pathname === "/dashboard";
    if (item.href === "/kitchen") return pathname === "/kitchen" && !pathname.includes("tab=menu");
    if (item.href === "/orders") return pathname.startsWith("/orders");
    return pathname === item.href;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800 text-stone-200">
      {/* Workspace Brand Header */}
      <div className="p-6 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            AE
          </div>
          <div>
            <h2 className="font-serif font-bold text-stone-100 text-base leading-tight">
              Staff Portal
            </h2>
            <p className="text-[11px] text-purple-400 font-mono font-medium">
              Operations & Kitchen
            </p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close admin menu"
        >
          ✕
        </button>
      </div>

      {/* User Context Strip */}
      <div className="px-6 py-4 border-b border-stone-800/80 bg-stone-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-400 text-stone-950 font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name?.slice(0, 2).toUpperCase() || "ST"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-200 truncate">{user?.name || "Staff User"}</p>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
              {user?.role || "staff"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Admin Workspace Navigation">
        <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider px-3 mb-2">
          Management
        </div>
        {navItems.map((item) => {
          const active = isCurrentActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (onTabChange) onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                active
                  ? "bg-purple-950/80 text-purple-300 font-bold border border-purple-800/80 shadow-xs"
                  : "text-stone-300 hover:bg-stone-800/70 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? "text-purple-400" : "text-stone-400"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer & Actions */}
      <div className="p-4 border-t border-stone-800 space-y-2 bg-stone-950/20">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800/70 hover:bg-stone-800 transition-colors border border-stone-700/60 min-h-[44px]"
        >
          <span>← Back to Storefront</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-red-300 hover:text-red-200 bg-red-950/30 hover:bg-red-950/60 transition-colors border border-red-900/50 min-h-[44px] cursor-pointer"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Trigger Header for Tablets & Phones (< 1024px) */}
      <div className="lg:hidden w-full bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between mb-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
            AE
          </span>
          <span className="font-serif font-bold text-sm text-stone-100">
            Operations Workspace
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 flex items-center gap-1.5 min-h-[44px] border border-stone-700/80 cursor-pointer"
          aria-expanded={mobileOpen}
          aria-label="Open administration sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Admin Menu</span>
        </button>
      </div>

      {/* Desktop Static Sidebar (lg: 1024px and up) */}
      <aside className="hidden lg:block w-64 shrink-0 rounded-2xl overflow-hidden shadow-xl sticky top-24 h-[calc(100vh-8rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Modal Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
