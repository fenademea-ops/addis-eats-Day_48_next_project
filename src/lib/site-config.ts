/**
 * Central site configuration for URLs and metadata defaults.
 * Provides fallback to production Vercel URL when NEXT_PUBLIC_SITE_URL is unset.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://addis-eats-day-48-next-project.vercel.app")
).trim().replace(/\/+$/, "");
