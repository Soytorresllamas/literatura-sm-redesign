import { ImageResponse } from "next/og";
import { loadOgFonts, ogPalette, OG_HEIGHT, OG_WIDTH } from "./og/shared";

export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";
export const alt = "SM Literatura — Encuentra una historia para cada momento";

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px 64px",
          background: ogPalette.cream,
          fontFamily: '"Instrument Serif"',
        }}
      >
        <div style={{ display: "flex", color: ogPalette.coral, fontSize: 26, letterSpacing: 6, textTransform: "uppercase" }}>
          Literatura infantil y juvenil · México
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 1.04, letterSpacing: -2 }}>
          <div style={{ display: "flex", color: ogPalette.ink }}>Encuentra una historia</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: ogPalette.ink }}>para</span>
            <span style={{ color: ogPalette.coral, fontStyle: "italic", marginLeft: 26 }}>cada momento.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill={ogPalette.coral}>
              <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z" />
            </svg>
            <div style={{ display: "flex", marginLeft: 18, color: ogPalette.ink, fontSize: 32 }}>SM Literatura</div>
          </div>
          <div style={{ display: "flex", color: ogPalette.muted, fontSize: 26 }}>
            Libros para leer juntos en casa o en la escuela
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
