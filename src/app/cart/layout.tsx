import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart | Addis Eats",
  description: "Review and manage the items in your Addis Eats shopping cart.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Your Cart | Addis Eats",
    description: "Review your selected Ethiopian dishes before checkout.",
    url: "/cart",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
