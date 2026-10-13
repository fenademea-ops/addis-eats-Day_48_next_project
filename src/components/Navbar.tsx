"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export function Navbar() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { user, isStaff, isAuthenticated, isHydrated } = useAuth();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/favorites", label: "Favorites" },
    { href: "/orders", label: "Orders" },
  ];

  if (isHydrated && isStaff) {
    navLinks.push({ href: "/kitchen", label: "Kitchen Queue" });
    navLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      {/* Top Banner Notice for Educational Demo */}
      <div className="bg-amber-600/90 text-stone-950 text-xs py-1 px-4 text-center font-medium tracking-wide">
        Frontend-only educational demonstration • Fictitious sample data • No real payments
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm shadow-sm">
              AE
            </span>
            <span className="font-serif tracking-normal text-xl font-semibold">
              Addis <span className="text-amber-400">Eats</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center gap-1.5 ${
                    active
                      ? "bg-stone-800 text-amber-400 font-semibold"
                      : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label === "Favorites" && (
                    <span className="text-xs text-red-400">❤️</span>
                  )}
                  <span>{link.label}</span>
                  {link.label === "Favorites" && isHydrated && favoritesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-800/60 font-mono font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster: Favorites + Cart + Demo Auth Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Favorites Link */}
            <Link
              href="/favorites"
              className="relative p-2.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-stone-800/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={
                isHydrated && favoritesCount > 0
                  ? `Saved favorites with ${favoritesCount} items`
                  : "Saved favorites"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {isHydrated && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[11px] font-bold leading-none text-white bg-red-600 rounded-full animate-in zoom-in-50 duration-200">
                  {favoritesCount}
                </span>
              )}
            </Link>
            {/* Cart Link with Badge */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={
                isHydrated && totalCount > 0
                  ? `Shopping cart with ${totalCount} items`
                  : "Shopping cart"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isHydrated && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold leading-none text-stone-950 bg-amber-400 rounded-full animate-in zoom-in-50 duration-200">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Demo Identity Badge / Link to Signin */}
            <div className="hidden sm:flex items-center">
              {isHydrated && isAuthenticated ? (
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname)}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700 hover:border-amber-500/60 transition-colors text-xs text-stone-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[40px]"
                  title="Click to switch demo identity"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isStaff ? "bg-purple-400" : "bg-emerald-400"
                    }`}
                  />
                  <span className="max-w-[120px] truncate font-medium">{user?.name}</span>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded">
                    {user?.role}
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname)}`}
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[40px] flex items-center"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-stone-800 bg-stone-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-150"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-md text-base font-medium min-h-[44px] flex items-center ${
                  active
                    ? "bg-stone-800 text-amber-400 font-semibold"
                    : "text-stone-300 hover:bg-stone-800/80 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-stone-800">
            <Link
              href={`/signin?next=${encodeURIComponent(pathname)}`}
              className="block w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 min-h-[44px] flex items-center justify-center"
            >
              {isHydrated && isAuthenticated
                ? `Signed in as ${user?.name} (${user?.role}) — Switch`
                : "Demo Sign In"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
