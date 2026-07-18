import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Paleta del sitio (globals.css :root) para las tarjetas sociales.
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const ogPalette = {
  ink: "#1b2f35",
  cream: "#f7f3eb",
  paper: "#fffdf8",
  coral: "#ec6f60",
  yellow: "#f5d36a",
  muted: "#6c7777",
};

export type OgFont = { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 };

// Satori no ve fuentes del sistema: Instrument Serif (OFL) viaja en el repo.
let fontsPromise: Promise<OgFont[]> | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

export function loadOgFonts(): Promise<OgFont[]> {
  // Ruta por process.cwd(): webpack reescribe new URL(import.meta.url) y rompe
  // readFile; outputFileTracingIncludes garantiza las TTF en el deploy.
  const fontsDir = join(process.cwd(), "app", "og", "fonts");
  fontsPromise ??= Promise.all([
    readFile(join(fontsDir, "InstrumentSerif-Regular.ttf")),
    readFile(join(fontsDir, "InstrumentSerif-Italic.ttf")),
  ]).then(([regular, italic]) => [
    { name: "Instrument Serif", data: toArrayBuffer(regular), style: "normal", weight: 400 },
    { name: "Instrument Serif", data: toArrayBuffer(italic), style: "italic", weight: 400 },
  ]);
  return fontsPromise;
}
