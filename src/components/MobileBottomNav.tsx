"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { DEMO_USERS } from "@/lib/fixtures/users";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount, isHydrated: cartHydrated } = useCart();
  const { user, isAuthenticated, isStaff, isHydrated: authHydrated, switchUser, signOut } = useAuth();
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close drawer on path change
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setProfileDrawerOpen(false);
  }

  // Handle escape key and focus trap inside modal drawer
  useEffect(() => {
    if (!profileDrawerOpen) return;

    // Focus close button on open
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDrawerOpen(false);
        drawerTriggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profileDrawerOpen]);

  const closeDrawer = () => {
    setProfileDrawerOpen(false);
    drawerTriggerRef.current?.focus();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isProfileActive = profileDrawerOpen || pathname.startsWith("/signin") || pathname.startsWith("/signup");

  return (
    <>
      {/* Profile/Persona Modal Drawer for Mobile */}
      {profileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDrawer}
        >
          <div
            ref={drawerRef}
            className="w-full max-w-md mx-auto bg-stone-900 border-t border-stone-800 rounded-t-3xl p-6 space-y-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-profile-title"
          >
            {/* Header / Handle */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm" aria-hidden="true">
                  {authHydrated && isAuthenticated ? user?.name.slice(0, 1) : "👤"}
                </span>
                <div>
                  <h2 id="mobile-profile-title" className="text-sm font-bold text-stone-100">
                    {authHydrated && isAuthenticated ? user?.name : "Account & Profile"}
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    {authHydrated && isAuthenticated ? user?.email : "Sign in or switch demo persona"}
                  </p>
                </div>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Close profile menu"
              >
                ✕
              </button>
            </div>

            {/* Quick Links for signed in / staff */}
            {authHydrated && isAuthenticated && isStaff && (
              <div className="bg-purple-950/30 border border-purple-800/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-purple-300">Staff Portal</span>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold tracking-wider">STAFF</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    onClick={closeDrawer}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-100 text-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/kitchen"
                    prefetch={false}
                    onClick={closeDrawer}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-100 text-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Kitchen Queue
                  </Link>
                </div>
              </div>
            )}

            {/* Persona Switcher Options */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Switch Demo Persona
              </span>
              <div className="space-y-1.5">
                {/* Abebe */}
                <button
                  type="button"
                  onClick={() => {
                    switchUser("customer");
                    closeDrawer();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    authHydrated && user?.id === DEMO_USERS.customer.id
                      ? "bg-stone-800 border-amber-500 text-amber-300"
                      : "bg-stone-950/70 border-stone-800 text-stone-200 hover:bg-stone-800/80"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-stone-100">Abebe Bikila</p>
                    <p className="text-[11px] text-stone-400">Customer • Bole neighborhood</p>
                  </div>
                  {authHydrated && user?.id === DEMO_USERS.customer.id && (
                    <span className="text-xs text-amber-400 font-bold" aria-label="Currently active">Active ✓</span>
                  )}
                </button>

                {/* Sara */}
                <button
                  type="button"
                  onClick={() => {
                    switchUser("customerB");
                    closeDrawer();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    authHydrated && user?.id === DEMO_USERS.customerB.id
                      ? "bg-stone-800 border-blue-500 text-blue-300"
                      : "bg-stone-950/70 border-stone-800 text-stone-200 hover:bg-stone-800/80"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-stone-100">Sara Haile</p>
                    <p className="text-[11px] text-stone-400">Customer B • Kazanchis neighborhood</p>
                  </div>
                  {authHydrated && user?.id === DEMO_USERS.customerB.id && (
                    <span className="text-xs text-blue-400 font-bold" aria-label="Currently active">Active ✓</span>
                  )}
                </button>

                {/* Staff */}
                <button
                  type="button"
                  onClick={() => {
                    switchUser("staff");
                    closeDrawer();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    authHydrated && user?.id === DEMO_USERS.staff.id
                      ? "bg-stone-800 border-purple-500 text-purple-300"
                      : "bg-stone-950/70 border-stone-800 text-stone-200 hover:bg-stone-800/80"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-stone-100">Kitchen Head Chef</p>
                    <p className="text-[11px] text-stone-400">Staff • Admin access enabled</p>
                  </div>
                  {authHydrated && user?.id === DEMO_USERS.staff.id && (
                    <span className="text-xs text-purple-400 font-bold" aria-label="Currently active">Active ✓</span>
                  )}
                </button>
              </div>
            </div>

            {/* Auth Actions (Sign In / Sign Up / Sign Out) */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
              {authHydrated && isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    closeDrawer();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-800 text-red-300 hover:bg-stone-700 transition-colors border border-stone-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/signin?next=${encodeURIComponent(pathname)}`}
                    prefetch={false}
                    onClick={closeDrawer}
                    className="min-h-[44px] flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors border border-stone-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(pathname)}`}
                    prefetch={false}
                    onClick={closeDrawer}
                    className="min-h-[44px] flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed 5-Item Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 text-stone-300 shadow-2xl pb-safe"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
          {/* 1. Home */}
          <Link
            href="/"
            prefetch={false}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg ${
              isActive("/") && pathname === "/" ? "text-amber-400 font-semibold" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 mb-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-[10px] tracking-tight">Home</span>
          </Link>

          {/* 2. Menu */}
          <Link
            href="/menu"
            prefetch={false}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg ${
              isActive("/menu") ? "text-amber-400 font-semibold" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-current={isActive("/menu") ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 mb-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-[10px] tracking-tight">Menu</span>
          </Link>

          {/* 3. Orders */}
          <Link
            href="/orders"
            prefetch={false}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg ${
              isActive("/orders") ? "text-amber-400 font-semibold" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-current={isActive("/orders") ? "page" : undefined}
          >
            <svg
              className="w-5 h-5 mb-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span className="text-[10px] tracking-tight">Orders</span>
          </Link>

          {/* 4. Cart with live badge */}
          <Link
            href="/cart"
            prefetch={false}
            className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg ${
              isActive("/cart") ? "text-amber-400 font-semibold" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-label={cartHydrated && totalCount > 0 ? `Shopping cart, ${totalCount} items` : "Shopping cart"}
            aria-current={isActive("/cart") ? "page" : undefined}
          >
            <div className="relative">
              <svg
                className="w-5 h-5 mb-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartHydrated && totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-4 px-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center leading-none" aria-hidden="true">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Cart</span>
          </Link>

          {/* 5. Profile */}
          <button
            ref={drawerTriggerRef}
            type="button"
            onClick={() => setProfileDrawerOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg cursor-pointer ${
              isProfileActive ? "text-amber-400 font-semibold" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-expanded={profileDrawerOpen}
            aria-haspopup="dialog"
            aria-label="Account and Profile persona menu"
          >
            <svg
              className="w-5 h-5 mb-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
