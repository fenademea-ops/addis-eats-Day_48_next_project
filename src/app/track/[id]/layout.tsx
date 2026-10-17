import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order | Addis Eats",
  description: "Live order tracking and courier dispatch status for your Addis Eats delivery.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
