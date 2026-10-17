import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Addis Eats",
  description: "Securely complete your Addis Eats order for delivery across Addis Ababa.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Checkout | Addis Eats",
    description: "Complete your order with Addis Eats.",
    url: "/checkout",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
