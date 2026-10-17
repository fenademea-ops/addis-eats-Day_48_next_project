import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Orders | Addis Eats",
  description: "View and track your previous food orders with Addis Eats.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
