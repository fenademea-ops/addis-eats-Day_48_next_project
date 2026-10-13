import { MetadataRoute } from "next";
import { FIXTURE_DISHES } from "@/lib/fixtures/dishes";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Public indexable routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Dynamic public dish routes
  const dishRoutes: MetadataRoute.Sitemap = FIXTURE_DISHES.map((dish) => ({
    url: `${siteUrl}/menu/${dish.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Note: Private demo routes (/checkout, /orders, /kitchen, /dashboard, /signin, /track)
  // are deliberately excluded from this sitemap per Day 44 / Day 45 requirements.
  return [...staticRoutes, ...dishRoutes];
}
