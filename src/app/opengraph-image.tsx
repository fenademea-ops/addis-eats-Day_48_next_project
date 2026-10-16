import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
          backgroundColor: "#0c0a09",
          color: "#fafaf9",
          fontFamily: "sans-serif",
          backgroundImage: "radial-gradient(circle at 85% 15%, #78350f 0%, #0c0a09 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "24px",
              color: "#0c0a09",
            }}
          >
            AE
          </div>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "#f59e0b" }}>
            Addis Eats
          </span>
          <span
            style={{
              marginLeft: "auto",
              backgroundColor: "#1c1917",
              border: "1px solid #44403c",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "16px",
              color: "#fbbf24",
              fontWeight: "600",
            }}
          >
            Ethiopian Cuisine
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "900",
              color: "#fafaf9",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Authentic Flavors of Addis Ababa
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a8a29e",
              lineHeight: 1.4,
              maxWidth: "850px",
            }}
          >
            Slow-cooked Doro Wot, spiced Kitfo, sizzling Tibs, fasting Beyaynetu, and Buna coffee ceremonies.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #292524",
            paddingTop: "24px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#f59e0b" }}>
            Next.js App Router Architecture Demonstration
          </div>
          <div style={{ fontSize: "16px", color: "#78716c" }}>
            CodeOps Module 3 Capstone
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
