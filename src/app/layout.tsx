import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClientProviders } from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Addis Eats | Authentic Ethiopian Food Delivery in Addis Ababa",
    template: "%s | Addis Eats",
  },
  description: "Order authentic Ethiopian dishes, traditional wots, sizzling tibs, and Buna coffee online in Addis Ababa. Educational frontend demonstration.",
  keywords: [
    "Addis Eats",
    "Ethiopian Food",
    "Addis Ababa Food Delivery",
    "Kitfo",
    "Doro Wot",
    "Tibs",
    "Shiro",
    "Buna Coffee",
  ],
  authors: [{ name: "Addis Eats Team" }],
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: siteUrl,
    siteName: "Addis Eats",
    title: "Addis Eats | Authentic Ethiopian Cuisine",
    description: "Order authentic Ethiopian cuisine delivered across Addis Ababa. Frontend-only Next.js educational project.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Addis Eats Ethiopian Cuisine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats | Authentic Ethiopian Cuisine",
    description: "Order authentic Ethiopian cuisine delivered across Addis Ababa.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
        <ClientProviders>
          <Navbar />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
