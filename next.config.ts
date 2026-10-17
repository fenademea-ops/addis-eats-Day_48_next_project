import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.14",
    "192.168.1.14:3000",
    "192.168.1.*",
    "192.168.*.*",
    "*.local",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [70, 75, 80],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/images/Home.jpg",
        destination: "/images/home.jpg",
      },
    ];
  },
};

export default nextConfig;
