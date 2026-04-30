import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141126",
          borderRadius: 40,
        }}
      >
        {/* Journal pages shadow */}
        <div
          style={{
            position: "absolute",
            left: 54,
            top: 43,
            width: 90,
            height: 112,
            background: "#ddd5f0",
            borderRadius: 10,
          }}
        />

        {/* Journal body */}
        <div
          style={{
            position: "absolute",
            left: 49,
            top: 38,
            width: 90,
            height: 112,
            background: "#f2eeff",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
          }}
        />

        {/* Spine */}
        <div
          style={{
            position: "absolute",
            left: 49,
            top: 38,
            width: 22,
            height: 112,
            background: "#7c5cbf",
            borderRadius: 10,
          }}
        />

        {/* Writing lines */}
        {[68, 88, 108, 128].map((y, i) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: 80,
              top: y,
              width: i === 3 ? 44 : 56,
              height: 6,
              background: "#c0aee0",
              borderRadius: 3,
            }}
          />
        ))}

        {/* Golden bookmark */}
        <div
          style={{
            position: "absolute",
            left: 117,
            top: 38,
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: "60px solid #f5c842",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 117,
            top: 38,
            width: 22,
            height: 48,
            background: "#f5c842",
          }}
        />

        {/* Sparkle */}
        <div
          style={{
            position: "absolute",
            right: 30,
            top: 25,
            width: 12,
            height: 12,
            background: "#f5c842",
            borderRadius: 6,
            opacity: 0.9,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
