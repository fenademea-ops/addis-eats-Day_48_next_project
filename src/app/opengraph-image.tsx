import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function getImageSrc(imagePath: string): string {
  try {
    const ext = imagePath.split(".").pop()?.toLowerCase() || "jpg";
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const absolutePath = join(process.cwd(), "public", imagePath);
    const buffer = readFileSync(absolutePath);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return "";
  }
}

export default function Image() {
  const foodSrc = getImageSrc("images/home.jpg");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0c0a09",
          color: "#fafaf9",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Right side background food image with overlay */}
        {foodSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={foodSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.38,
            }}
          />
        ) : null}

        {/* Gradient dark scrim */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(to right, #0c0a09 0%, rgba(12,10,9,0.92) 55%, rgba(12,10,9,0.7) 100%)",
          }}
        />

        {/* Content container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 72px",
          }}
        >
          {/* Top Brand Header */}
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
                fontSize: "26px",
                color: "#0c0a09",
              }}
            >
              AE
            </div>
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#f59e0b", letterSpacing: "-0.01em" }}>
              Addis Eats
            </span>
            <span
              style={{
                marginLeft: "auto",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                border: "1px solid #b45309",
                padding: "8px 22px",
                borderRadius: "9999px",
                fontSize: "17px",
                color: "#fbbf24",
                fontWeight: "700",
                letterSpacing: "0.02em",
              }}
            >
              Authentic Ethiopian Cuisine
            </span>
          </div>

          {/* Middle Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "860px" }}>
            <div
              style={{
                fontSize: "64px",
                fontWeight: "900",
                color: "#fafaf9",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Authentic Flavors of Addis Ababa
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#d6d3d1",
                lineHeight: 1.45,
                fontWeight: "400",
              }}
            >
              Special Kitfo, slow-cooked Doro Wot, sizzling Tibs, fasting Beyaynetu, and traditional Buna coffee.
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(120, 113, 108, 0.35)",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "700", color: "#f59e0b" }}>
              <span>Fast Food Delivery</span>
              <span style={{ color: "#78716c" }}>•</span>
              <span style={{ color: "#fafaf9" }}>Fresh Injera Daily</span>
              <span style={{ color: "#78716c" }}>•</span>
              <span style={{ color: "#fafaf9" }}>Bole &amp; Beyond</span>
            </div>
            <div style={{ fontSize: "16px", color: "#a8a29e", fontWeight: "600" }}>
              Addis Ababa, Ethiopia
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
