/**
 * Safe return-destination validation for demo authentication (Day 42 / Day 45)
 *
 * Attack 3 prevention:
 * Rejects external origins, protocol-relative URLs (//example.com),
 * backslash variants (/\example.com, \example.com), and non-allowed paths.
 * Returns only verified safe internal application routes, defaulting to "/".
 */

// Allowlisted prefixes of internal application routes
const ALLOWED_INTERNAL_PREFIXES = [
  "/",
  "/menu",
  "/cart",
  "/checkout",
  "/orders",
  "/kitchen",
  "/dashboard",
  "/track",
  "/signin",
];

export function isSafeRedirectPath(candidate: string | null | undefined): string {
  if (!candidate || typeof candidate !== "string") {
    return "/";
  }

  const trimmed = candidate.trim();

  // Must begin with a single slash, not a double slash (protocol-relative //)
  // and not a backslash or slash-backslash (/\ or \\)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\")) {
    return "/";
  }

  // Reject anything containing backslashes
  if (trimmed.includes("\\")) {
    return "/";
  }

  // Reject URL scheme indicators (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/";
  }

  // Reject control characters, newlines, or carriage returns
  if (/[\r\n\t]/.test(trimmed)) {
    return "/";
  }

  // Parse path component (strip query params and hashes for prefix checking)
  let pathname = trimmed;
  try {
    const fakeUrl = new URL(trimmed, "http://localhost");
    pathname = fakeUrl.pathname;
  } catch {
    return "/";
  }

  // Ensure pathname matches an allowed internal route or subpath
  const isAllowed = ALLOWED_INTERNAL_PREFIXES.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });

  if (!isAllowed) {
    return "/";
  }

  return trimmed;
}
