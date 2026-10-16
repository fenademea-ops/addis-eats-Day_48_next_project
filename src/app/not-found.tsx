import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl text-amber-500">
        404
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
          Page or Dish Not Found
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto">
          The requested page or dish does not exist on Addis Eats. It may have been removed or moved to a different category.
        </p>
      </div>
      <div>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
        >
          Return to All Dishes
        </Link>
      </div>
    </div>
  );
}
