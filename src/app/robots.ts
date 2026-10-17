import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/menu", "/menu/*", "/images/*", "/og-image.jpg", "/opengraph-image*"],
      disallow: [
        "/cart",
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
