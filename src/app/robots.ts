import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;

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
