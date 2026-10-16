/**
 * Formatting utilities for Addis Eats
 * Built once at module level with explicit locale ("en-ET") and timezone ("Africa/Addis_Ababa")
 * Stores money as integer whole Birr (ETB).
 */

// Module-level Intl singletons
export const etbFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export const dateTimeFormatter = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

export const timeOnlyFormatter = new Intl.DateTimeFormat("en-ET", {
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

export const dateOnlyFormatter = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});

export const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export const numberFormatter = new Intl.NumberFormat("en-ET");

export const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/**
 * Formats an integer amount in ETB
 */
export function formatEtb(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "ETB 0";
  }
  return etbFormatter.format(Math.round(amount));
}

/**
 * Formats a UTC ISO string or Date to Addis Ababa local time
 */
export function formatWhen(input: string | Date | number): string {
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return "Unknown date";
    return dateTimeFormatter.format(d);
  } catch {
    return "Invalid date";
  }
}

/**
 * Formats only the date portion (Addis Ababa timezone)
 */
export function formatDateOnly(input: string | Date | number): string {
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return "Unknown date";
    return dateOnlyFormatter.format(d);
  } catch {
    return "Invalid date";
  }
}

/**
 * Formats only the time portion (Addis Ababa timezone)
 */
export function formatTimeOnly(input: string | Date | number): string {
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(d.getTime())) return "Unknown time";
    return timeOnlyFormatter.format(d);
  } catch {
    return "Invalid date";
  }
}

/**
 * Computes human-friendly relative time ("12 minutes ago")
 * Note: When rendering relative times on the client, render after mount
 * or provide a fixed reference date to avoid hydration mismatches.
 */
export function formatRelative(input: string | Date | number, referenceDate: Date = new Date()): string {
  try {
    const target = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (isNaN(target.getTime())) return "just now";

    const diffSeconds = Math.round((target.getTime() - referenceDate.getTime()) / 1000);

    if (Math.abs(diffSeconds) < 60) {
      return diffSeconds <= 0 ? "just now" : "in a few seconds";
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
      return relativeTimeFormatter.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return relativeTimeFormatter.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) {
      return relativeTimeFormatter.format(diffDays, "day");
    }

    const diffMonths = Math.round(diffDays / 30);
    return relativeTimeFormatter.format(diffMonths, "month");
  } catch {
    return "just now";
  }
}

/**
 * Format a list of strings: ["Kitfo", "Shiro", "Injera"] -> "Kitfo, Shiro, and Injera"
 */
export function formatList(items: string[]): string {
  if (!items || items.length === 0) return "";
  return listFormatter.format(items);
}
