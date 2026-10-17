"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export function Navbar() {
  const pathname = usePathname();
  const { totalCount, isHydrated: cartHydrated } = useCart();
  const { user, isStaff, isAuthenticated, isHydrated: authHydrated, switchUser, signOut } = useAuth();
  const { favoritesCount, isHydrated: favHydrated } = useFavorites();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setUserDropdownOpen(false);
  }

  // Close on Escape or click outside and restore focus to trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && userDropdownOpen) {
        setUserDropdownOpen(false);
        dropdownTriggerRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownOpen &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target as Node) &&
        dropdownTriggerRef.current &&
        !dropdownTriggerRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Auto-focus the first item in the dropdown when it opens via keyboard
  useEffect(() => {
    if (userDropdownOpen && dropdownMenuRef.current) {
      // Small delay to let React render the menu before focusing
      const timer = setTimeout(() => {
        const firstFocusable = dropdownMenuRef.current?.querySelector<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [userDropdownOpen]);

  // Handle arrow key navigation inside dropdown menu
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dropdownMenuRef.current) return;
    const focusableItems = Array.from(
      dropdownMenuRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));

    const activeEl = document.activeElement as HTMLElement;
    const currentIndex = focusableItems.indexOf(activeEl);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      // If nothing focused yet, go to first; otherwise next (wraps)
      const nextIndex = currentIndex < 0 ? 0 : currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
      focusableItems[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // If nothing focused yet, go to last; otherwise prev (wraps)
      const prevIndex = currentIndex < 0 ? focusableItems.length - 1 : currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
      focusableItems[prevIndex]?.focus();
    } else if (e.key === "Tab") {
      // If tabbing out from the last item, close dropdown
      if (!e.shiftKey && currentIndex === focusableItems.length - 1) {
        setUserDropdownOpen(false);
      } else if (e.shiftKey && currentIndex === 0) {
        setUserDropdownOpen(false);
      }
    }
  };

  // Desktop navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/orders", label: "Orders" },
  ];

  // Admin link conditionally shown on desktop navbar for staff/kitchen roles
  if (authHydrated && isStaff) {
    navLinks.push({ href: "/dashboard", label: "Admin" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-3 text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 group"
          >
            <span className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform" aria-hidden="true">
              AE
            </span>
            <div className="flex flex-col">
              <span className="font-serif tracking-normal text-xl font-bold leading-none">
                Addis <span className="text-amber-400">Eats</span>
              </span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-sans mt-0.5 hidden sm:inline">
                Ethiopian Flavors
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (hidden on mobile/tablet < 1024px) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center gap-1.5 ${
                    active
                      ? "bg-stone-800 text-amber-400 font-semibold shadow-xs"
                      : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label === "Admin" && (
                    <span className="w-2 h-2 rounded-full bg-purple-400" aria-hidden="true" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Favorites Icon Button */}
            <Link
              href="/favorites"
              prefetch={false}
              className="relative p-2.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-stone-800/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={
                favHydrated && favoritesCount > 0
                  ? `Saved favorites, ${favoritesCount} items saved`
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
              {favHydrated && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[11px] font-bold leading-none text-white bg-red-600 rounded-full animate-in zoom-in-50 duration-200" aria-hidden="true">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              prefetch={false}
              className="relative p-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={
                cartHydrated && totalCount > 0
                  ? `Shopping cart, ${totalCount} items`
                  : "Shopping cart, empty"
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
              {cartHydrated && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold leading-none text-stone-950 bg-amber-400 rounded-full animate-in zoom-in-50 duration-200" aria-hidden="true">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Desktop User / Auth Actions */}
            <div className="hidden lg:relative lg:block">
              {authHydrated && isAuthenticated ? (
                <div className="relative">
                  <button
                    ref={dropdownTriggerRef}
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700 hover:border-amber-500/60 transition-colors text-xs text-stone-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[40px] cursor-pointer"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-controls="user-profile-menu"
                    aria-label={`User profile for ${user?.name}, role ${user?.role}. Click or press Enter to open persona switcher.`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isStaff ? "bg-purple-400" : "bg-emerald-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="max-w-[120px] truncate font-medium">{user?.name}</span>
                    <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded">
                      {user?.role}
                    </span>
                    <span className="text-stone-400 text-[10px]" aria-hidden="true">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      id="user-profile-menu"
                      ref={dropdownMenuRef}
                      onKeyDown={handleDropdownKeyDown}
                      className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-150"
                      role="menu"
                      aria-label="User account and persona switcher"
                    >
                      <div className="px-2 py-1.5 border-b border-stone-800">
                        <p className="text-xs font-bold text-stone-100">{user?.name}</p>
                        <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                      </div>

                      {/* Staff Quick Admin Links */}
                      {isStaff && (
                        <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-2 space-y-1" role="group" aria-label="Staff links">
                          <Link
                            href="/dashboard"
                            role="menuitem"
                            className="block px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-900/60 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            📊 Admin Dashboard
                          </Link>
                          <Link
                            href="/kitchen"
                            role="menuitem"
                            className="block px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-900/60 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            🍳 Kitchen Queue
                          </Link>
                        </div>
                      )}

                      <div className="pt-1">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2">
                          Switch Persona
                        </span>
                        <div className="mt-1 space-y-0.5" role="group" aria-label="Demo personas">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              switchUser("customer");
                              setUserDropdownOpen(false);
                              dropdownTriggerRef.current?.focus();
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            <span>Abebe Bikila (Customer A)</span>
                            {user?.id === "usr_cust_01" && <span className="text-amber-400 text-[10px]" aria-label="Currently active">✓</span>}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              switchUser("customerB");
                              setUserDropdownOpen(false);
                              dropdownTriggerRef.current?.focus();
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            <span>Sara Haile (Customer B)</span>
                            {user?.id === "usr_cust_02" && <span className="text-blue-400 text-[10px]" aria-label="Currently active">✓</span>}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              switchUser("staff");
                              setUserDropdownOpen(false);
                              dropdownTriggerRef.current?.focus();
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            <span>Kitchen Head Chef (Staff)</span>
                            {user?.id === "usr_staff_01" && <span className="text-purple-400 text-[10px]" aria-label="Currently active">✓</span>}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-800">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            signOut();
                            setUserDropdownOpen(false);
                            dropdownTriggerRef.current?.focus();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/signin?next=${encodeURIComponent(pathname)}`}
                    prefetch={false}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/80 transition-colors min-h-[40px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(pathname)}`}
                    prefetch={false}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-sm min-h-[40px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
