export const PRODUCTION_DOMAIN = "https://addis-eats-day-48-next-project.vercel.app";

/**
 * Central site configuration for URLs and metadata defaults.
 * Prioritizes the publicly accessible production domain to ensure social media bots
 * (Telegram, WhatsApp, Twitter, etc.) can fetch metadata and preview images without
 * being intercepted by Vercel Preview Deployment Protection redirects.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : PRODUCTION_DOMAIN)
).trim().replace(/\/+$/, "");

