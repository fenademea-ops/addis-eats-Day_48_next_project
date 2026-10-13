"use client";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/services/mock-order-service";
import { formatEtb } from "@/lib/format";

type Neighborhood = "Bole" | "Kazanchis" | "Megenagna" | "Piassa" | "Sarbet";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || "Abebe Bikila");
  const [phone, setPhone] = useState(user?.phone || "+251911223344");
  const [address, setAddress] = useState(user?.defaultAddress || "Bole Atlas, Cameroon St, House 412");
  const [neighborhood, setNeighborhood] = useState<Neighborhood>("Bole");

  // Client-generated idempotency key (stable across double-taps for the same submission attempt)
  const defaultKey = useId();
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`idem_${defaultKey.replace(/:/g, "")}`);

  // Validation and submission state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field blur validation helper
  const handlePhoneBlur = () => {
    const phonePattern = /^\+?[0-9\s-]{9,15}$/;
    if (!phone || !phonePattern.test(phone.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: "Enter a valid phone number (e.g., +251 91 122 3344).",
      }));
    } else {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }
  };

  const handleNameBlur = () => {
    if (!customerName || customerName.trim().length < 2) {
      setFieldErrors((prev) => ({
        ...prev,
        customerName: "Name must be at least 2 characters.",
      }));
    } else {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.customerName;
        return copy;
      });
    }
  };

  const handleAddressBlur = () => {
    if (!address || address.trim().length < 5) {
      setFieldErrors((prev) => ({
        ...prev,
        address: "Address must be at least 5 characters.",
      }));
    } else {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.address;
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent duplicate submission

    // Validate on submit
    const errors: Record<string, string> = {};
    if (!customerName || customerName.trim().length < 2) {
      errors.customerName = "Name must be at least 2 characters.";
    }
    const phonePattern = /^\+?[0-9\s-]{9,15}$/;
    if (!phone || !phonePattern.test(phone.trim())) {
      errors.phone = "Enter a valid phone number (e.g., +251 91 122 3344).";
    }
    if (!address || address.trim().length < 5) {
      errors.address = "Address must be at least 5 characters.";
    }

    if (items.length === 0) {
      errors.cart = "Your cart is empty. Please add items before checking out.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Simulate network roundtrip
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await createOrder(
        {
          customerName,
          phone,
          address,
          neighborhood,
          items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
          idempotencyKey,
        },
        user
      );

      if (!result.success || !result.order) {
        setSubmitError(result.error || "Failed to place simulated order.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      clearCart();
      // Generate a new idempotency key for any future orders
      setIdempotencyKey(`idem_${Date.now()}_${Math.random()}`);
      router.push(`/orders/${result.order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected service error occurred.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-64 bg-stone-900 rounded-xl border border-stone-800" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold text-stone-100">
          Cannot Checkout with Empty Cart
        </h1>
        <p className="text-sm text-stone-400">
          Please add dishes from our menu before checking out.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Scope Disclaimer */}
      <div className="mb-6 bg-stone-900 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs text-stone-300">
        <p className="font-semibold text-amber-400 mb-0.5">Educational Demo Checkout</p>
        <p>
          This is a simulated order submission. No real payments, cards, or delivery riders are dispatched.
          The order will be created in your current browser session and available on the order tracking view.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Checkout Form */}
        <div className="md:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-100">
              Delivery Details
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Please enter your delivery details. Provisional course fields applied.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 text-xs text-amber-200">
              <span>You are currently in a demo signed-out state. </span>
              <Link href="/signin?next=/checkout" className="underline font-bold text-white">
                Sign in with a demo identity
              </Link>
              <span> to complete order creation.</span>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="bg-red-950/40 border border-red-800/80 rounded-xl p-4 text-xs text-red-200 space-y-1"
            >
              <strong className="block font-semibold">Order Submission Notice:</strong>
              <p>{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Customer Name */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5"
              >
                Customer Full Name <span className="text-amber-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                autoComplete="name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={handleNameBlur}
                aria-invalid={!!fieldErrors.customerName}
                aria-describedby={fieldErrors.customerName ? "name-error" : undefined}
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                  fieldErrors.customerName ? "border-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.customerName && (
                <p id="name-error" className="text-xs text-red-400 mt-1.5" role="alert">
                  {fieldErrors.customerName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5"
              >
                Phone Number <span className="text-amber-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="+251 91 122 3344"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                  fieldErrors.phone ? "border-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.phone && (
                <p id="phone-error" className="text-xs text-red-400 mt-1.5" role="alert">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Neighborhood Selection */}
            <div>
              <label
                htmlFor="neighborhood"
                className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5"
              >
                Neighborhood / Sub-City
              </label>
              <select
                id="neighborhood"
                name="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value as Neighborhood)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
              >
                <option value="Bole">Bole (Atlas, Medhanealem, Brass)</option>
                <option value="Kazanchis">Kazanchis (ECA, Guinea Conakry)</option>
                <option value="Megenagna">Megenagna (Ring Road Plaza)</option>
                <option value="Piassa">Piassa (Churchill, Historic Quarter)</option>
                <option value="Sarbet">Sarbet (Old Airport, Pushkin Sq)</option>
              </select>
            </div>

            {/* Street Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-xs font-semibold text-stone-200 uppercase tracking-wider mb-1.5"
              >
                Delivery Address / Landmark <span className="text-amber-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={handleAddressBlur}
                aria-invalid={!!fieldErrors.address}
                aria-describedby={fieldErrors.address ? "address-error" : undefined}
                placeholder="House or apartment number, street name, nearest landmark"
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  fieldErrors.address ? "border-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.address && (
                <p id="address-error" className="text-xs text-red-400 mt-1.5" role="alert">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  `Place Simulated Order (${formatEtb(subtotal)})`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider pb-3 border-b border-stone-800">
            Order Items ({items.length})
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.dishId} className="flex items-center justify-between text-xs gap-2">
                <div className="truncate flex-1">
                  <span className="font-medium text-stone-200">{i.name}</span>
                  <span className="text-stone-400 ml-1.5">× {i.quantity}</span>
                </div>
                <span className="font-mono text-stone-300 shrink-0">
                  {formatEtb(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-stone-100">
              <span>Total ETB</span>
              <span className="text-lg font-mono text-amber-400">{formatEtb(subtotal)}</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Simulated price computed authoritatively by mock order service.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
