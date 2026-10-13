import { ImageResponse } from "next/og";
import { getDishById } from "@/lib/services/mock-dish-service";
import { FIXTURE_DISHES } from "@/lib/fixtures/dishes";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export async function generateStaticParams() {
  return FIXTURE_DISHES.map((dish) => ({
    id: dish.id,
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dish = await getDishById(id);

  const title = dish?.name || "Authentic Ethiopian Dish";
  const category = dish?.category || "Addis Eats Special";
  const price = dish ? `ETB ${dish.price}` : "ETB 450";
  const desc = dish?.description || "Authentic Ethiopian culinary experience in Addis Ababa.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#1c1917",
          color: "#fafaf9",
          fontFamily: "sans-serif",
          backgroundImage: "radial-gradient(circle at 80% 20%, #451a03 0%, #1c1917 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "22px",
              color: "#0c0a09",
            }}
          >
            AE
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "#f59e0b" }}>
            Addis Eats
          </span>
          <span
            style={{
              marginLeft: "auto",
              backgroundColor: "#292524",
              border: "1px solid #44403c",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "18px",
              color: "#fbbf24",
              fontWeight: "600",
            }}
          >
            {category}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#fafaf9",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#a8a29e",
              lineHeight: 1.4,
              maxWidth: "850px",
            }}
          >
            {desc}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #44403c",
            paddingTop: "24px",
          }}
        >
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>
            {price}
          </div>
          <div style={{ fontSize: "18px", color: "#78716c" }}>
            Freshly prepared in Addis Ababa • Educational Demo
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
