import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-stone-950 border-t border-stone-800 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
              AE
            </span>
            <span className="font-serif text-lg font-semibold text-stone-100">
              Addis <span className="text-amber-400">Eats</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Frontend-only Next.js application built for the CodeOps Module 3 course.
            Demonstrating App Router architecture, accessibility, state preservation, and mock services.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Exploration
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/menu" className="hover:text-amber-400 transition-colors">
                All Menu Dishes
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-amber-400 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-amber-400 transition-colors">
                Order History
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Staff & Demo
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                Staff Dashboard
              </Link>
            </li>
            <li>
              <Link href="/kitchen" className="hover:text-amber-400 transition-colors">
                Kitchen Queue
              </Link>
            </li>
            <li>
              <Link href="/signin" className="hover:text-amber-400 transition-colors">
                Account Sign In
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Academic Scope Note
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            All prices, customer orders, live streams, and credentials are intentionally simulated on the client.
            No live backend, database, or payment gateway is connected.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-stone-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
        <p>© 2026 Addis Eats Educational Project • Module 3 Capstone</p>
        <p>Built with Next.js App Router, Tailwind CSS & TypeScript</p>
      </div>
    </footer>
  );
}
