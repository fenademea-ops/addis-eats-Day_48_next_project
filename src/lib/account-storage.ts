/**
 * Browser Local Storage Account Management with Web Crypto API Password Hashing
 *
 * NOTE: As Addis Eats is a frontend-only application, client-side Web Crypto
 * derivation demonstrates interface state and prevents plain-text storage in
 * localStorage. It does not replace server-enforced authentication in production.
 */

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string; // normalized lowercase
  role: "customer"; // Newly registered accounts are always customers (no privilege escalation)
  phone: string;
  defaultAddress: string;
  createdAt: string;
  saltHex: string;
  hashHex: string;
}

const STORAGE_KEY_ACCOUNTS = "addis_eats_registered_accounts_v1";
const STORAGE_KEY_SESSION = "addis_eats_user_session_v1";

/**
 * Converts ArrayBuffer to hexadecimal string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Generates a random cryptographic salt
 */
function generateSalt(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return bufferToHex(array.buffer);
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Derives a cryptographic hash using SHA-256 via Web Crypto API with salt
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${saltHex}:${password}`);

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const digestBuffer = await window.crypto.subtle.digest("SHA-256", data);
      return bufferToHex(digestBuffer);
    } catch {
      // Fallback if subtle crypto is unavailable
    }
  }

  // Simple deterministic fallback hashing for environments where crypto.subtle is restricted
  let hash = 0;
  const str = `${saltHex}:${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Safely reads all registered accounts from local storage
 */
export function getStoredAccounts(): StoredUserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (a) => a && typeof a === "object" && typeof a.email === "string" && typeof a.id === "string"
      );
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Registers a new customer account
 */
export async function registerAccount(params: {
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  password: string;
}): Promise<{ success: boolean; error?: string; account?: StoredUserAccount }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Registration is only available in the browser." };
  }

  const normalizedEmail = params.email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  // Case-insensitive duplicate check
  const existing = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: "An account with this email address already exists. Please sign in instead.",
    };
  }

  const saltHex = generateSalt();
  const hashHex = await hashPassword(params.password, saltHex);
  const newId = `usr_reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newAccount: StoredUserAccount = {
    id: newId,
    name: params.name.trim(),
    email: normalizedEmail,
    role: "customer", // Guarantee customer role
    phone: params.phone.trim(),
    defaultAddress: `${params.neighborhood.trim()}, Addis Ababa`,
    createdAt: new Date().toISOString(),
    saltHex,
    hashHex,
  };

  try {
    accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    return { success: true, account: newAccount };
  } catch {
    return { success: false, error: "Failed to save account to browser storage." };
  }
}

/**
 * Verifies credentials for registered accounts
 */
export async function verifyRegisteredCredentials(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; error?: string; account?: StoredUserAccount }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Sign in is only available in the browser." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const found = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (!found) {
    return { success: false, error: "No account found matching this email address." };
  }

  const computedHash = await hashPassword(plainPassword, found.saltHex);
  if (computedHash !== found.hashHex) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  return { success: true, account: found };
}

/**
 * Active session persistence helpers
 */
export function getSavedSession(): { id: string; email: string; name: string; role: "customer" | "staff"; phone: string; defaultAddress: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.id && session.email && session.role) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(user: { id: string; email: string; name: string; role: "customer" | "staff"; phone: string; defaultAddress: string }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  } catch {
    // Ignore
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch {
    // Ignore
  }
}
