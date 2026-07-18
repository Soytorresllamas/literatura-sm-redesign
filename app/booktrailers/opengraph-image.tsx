import { ImageResponse } from "next/og";
import { loadOgFonts, ogPalette, OG_HEIGHT, OG_WIDTH } from "../og/shared";

export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";
export const alt = "Booktrailers de SM Literatura — Dale play a tu próxima lectura";

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
          background: ogPalette.ink,
          fontFamily: '"Instrument Serif"',
        }}
      >
        <div style={{ display: "flex", color: ogPalette.coral, fontSize: 26, letterSpacing: 6, textTransform: "uppercase" }}>
          Booktrailers · SM Literatura
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 118,
              height: 118,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 118,
              background: ogPalette.coral,
              paddingLeft: 10,
            }}
          >
            <svg width="44" height="50" viewBox="0 0 44 50">
              <path d="M2 2 42 25 2 48Z" fill={ogPalette.cream} />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 44, fontSize: 84, lineHeight: 1.04, letterSpacing: -2 }}>
            <div style={{ display: "flex", color: ogPalette.cream }}>Dale play a tu</div>
            <div style={{ display: "flex", color: ogPalette.coral, fontStyle: "italic" }}>próxima lectura.</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: ogPalette.cream, fontSize: 30 }}>SM Literatura</div>
          <div style={{ display: "flex", color: "#9db0ac", fontSize: 26 }}>Videos del catálogo, organizados por edad</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
