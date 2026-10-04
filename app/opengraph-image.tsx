import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The Eclipse and the name: the same first frame as the site.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#050507",
          color: "#edebe6",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 95,
            width: 440,
            height: 440,
            borderRadius: 440,
            background: "#020203",
            border: "2px solid #d6cdff",
            boxShadow: "0 0 60px 8px rgba(143,102,255,0.45), 0 0 200px 40px rgba(143,102,255,0.16)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: 90 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#a3a1a9", textTransform: "uppercase" }}>
            {profile.role}
          </div>
          <div style={{ fontSize: 92, fontWeight: 300, letterSpacing: -2, marginTop: 18 }}>{profile.name}</div>
        </div>
      </div>
    ),
    size,
  );
}
