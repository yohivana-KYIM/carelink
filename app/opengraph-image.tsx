import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getIconDataUri() {
  const iconPath = join(process.cwd(), "public", "images", "ecotocare-icon.png");
  const base64 = readFileSync(iconPath).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export default function Image() {
  const iconDataUri = getIconDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #15355a 0%, #1e4d86 55%, #2e70be 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse requires a native <img>, not next/image */}
          <img
            src={iconDataUri}
            width={84}
            height={84}
            style={{ borderRadius: 22 }}
            alt=""
          />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "white" }}>
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "white",
            maxWidth: 920,
          }}
        >
          Ne manquez plus jamais un rendez-vous patient
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#dbe9f9",
            maxWidth: 820,
          }}
        >
          Rappels et relances patients automatiques par WhatsApp, pour cabinets dentaires.
        </div>
      </div>
    ),
    { ...size }
  );
}
