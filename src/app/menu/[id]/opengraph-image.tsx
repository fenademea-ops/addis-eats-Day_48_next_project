import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/**
 * Reads a public image file and returns an ArrayBuffer for Satori.
 * Using ArrayBuffer avoids the DataView decoding issues that occur
 * with base64 data URIs in certain JPEG formats.
 */
function getImageSrc(imagePath: string): string {
  try {
    const ext = imagePath.split(".").pop()?.toLowerCase() || "png";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    const mime = mimeMap[ext] || "image/png";
    const absolutePath = join(process.cwd(), "public", imagePath);
    const buffer = readFileSync(absolutePath);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return "";
  }
}

import { SITE_URL } from "@/lib/site-config";

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

  // Load the food image; fall back to the site URL for the static image
  const siteUrl = SITE_URL;
  let imageSrc = "";
  if (dish) {
    imageSrc = getImageSrc(dish.image);
  }

  // If local file reading failed, use the public URL
  if (!imageSrc && dish) {
    imageSrc = `${siteUrl}${dish.image}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#1c1917",
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: Food Photo (takes ~55% of width) */}
        <div
          style={{
            width: "55%",
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt=""
              width={660}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#292524",
                fontSize: "64px",
              }}
            >
              🍽️
            </div>
          )}
          {/* Gradient overlay blending image into details panel */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "120px",
              height: "100%",
              display: "flex",
              backgroundImage:
                "linear-gradient(to right, transparent, #1c1917)",
            }}
          />
        </div>

        {/* Right: Details Panel */}
        <div
          style={{
            width: "45%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 48px 48px 24px",
          }}
        >
          {/* Top: Logo + Category */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                  fontSize: "20px",
                  color: "#0c0a09",
                }}
              >
                AE
              </div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                Addis Eats
              </span>
            </div>
            <span
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#292524",
                border: "1px solid #44403c",
                padding: "6px 16px",
                borderRadius: "16px",
                fontSize: "16px",
                color: "#fbbf24",
                fontWeight: "600",
              }}
            >
              {category}
            </span>
          </div>

          {/* Middle: Dish Name + Price */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "44px",
                fontWeight: "800",
                color: "#fafaf9",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#f59e0b",
              }}
            >
              {price}
            </div>
          </div>

          {/* Bottom: Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #44403c",
              paddingTop: "16px",
              fontSize: "15px",
              color: "#78716c",
            }}
          >
            Authentic Ethiopian Cuisine • Addis Ababa
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
