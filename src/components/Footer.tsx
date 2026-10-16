import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-stone-950 border-t border-stone-800 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
              AE
            </span>
            <span className="font-serif text-lg font-semibold text-stone-100">
              Addis <span className="text-amber-400">Eats</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Delivering authentic Ethiopian culinary staples, sizzling tibs, aromatic wots, and buna heritage across Addis Ababa neighborhoods.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Explore
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/menu" prefetch={false} className="hover:text-amber-400 transition-colors">
                All Menu Dishes
              </Link>
            </li>
            <li>
              <Link href="/cart" prefetch={false} className="hover:text-amber-400 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/orders" prefetch={false} className="hover:text-amber-400 transition-colors">
                Order History
              </Link>
            </li>
            <li>
              <Link href="/favorites" prefetch={false} className="hover:text-amber-400 transition-colors">
                Saved Favorites
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Account & Support
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/signin" prefetch={false} className="hover:text-amber-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" prefetch={false} className="hover:text-amber-400 transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
            Delivery Areas
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Serving Bole, Kazanchis, Megenagna, Piassa, and Sarbet daily with fast delivery and authentic recipes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-stone-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
        <p>© 2026 Addis Eats. All rights reserved.</p>
        <p>Authentic Ethiopian Cuisine & Fresh Delivery</p>
      </div>
    </footer>
  );
}
