import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#111112",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Top: badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "#2D7D46",
              color: "#fff",
              fontSize: 18,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: 100,
              letterSpacing: "0.02em",
            }}
          >
            Review attribution SaaS
          </div>
        </div>

        {/* Center: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Atribuya
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#86868B",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 780,
            }}
          >
            Every Google review attributed to the sales rep who earned it.{" "}
            <span style={{ color: "#AEAEB2" }}>
              Automatically. No spreadsheets. No disputes.
            </span>
          </div>
        </div>

        {/* Bottom: stats + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 48,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {[
              { n: "100%", label: "automated" },
              { n: "0", label: "spreadsheets" },
              { n: "24h", label: "from review to credit" },
            ].map(({ n, label }) => (
              <div
                key={label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {n}
                </span>
                <span style={{ fontSize: 18, color: "#515154" }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              color: "#515154",
              fontSize: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            atribuya.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
