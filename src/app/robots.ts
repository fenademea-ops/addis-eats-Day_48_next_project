import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/menu", "/menu/*", "/cart"],
      disallow: [
        "/checkout",
        "/orders",
        "/orders/*",
        "/track/*",
        "/kitchen",
        "/dashboard",
        "/signin",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
