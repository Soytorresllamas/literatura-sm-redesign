import { ImageResponse } from "next/og";
import { findDetailedBookBySlug } from "../../../components/book-detail-data";
import { loadOgFonts, ogPalette, OG_HEIGHT, OG_WIDTH } from "../../shared";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const book = findDetailedBookBySlug(slug);
  if (!book) return new Response("Libro no encontrado", { status: 404 });

  const fonts = await loadOgFonts();
  const titleSize = book.title.length > 46 ? 52 : book.title.length > 26 ? 62 : 74;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: ogPalette.cream,
          fontFamily: '"Instrument Serif"',
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "68px 24px 60px 72px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: ogPalette.coral, fontSize: 25, letterSpacing: 5, textTransform: "uppercase" }}>
              {`${book.series} · ${book.age}`}
            </div>
            <div style={{ display: "flex", marginTop: 22, color: ogPalette.ink, fontSize: titleSize, lineHeight: 1.04, letterSpacing: -1 }}>
              {book.title}
            </div>
            <div style={{ display: "flex", marginTop: 20, color: ogPalette.coral, fontSize: 36, fontStyle: "italic" }}>
              {book.author}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill={ogPalette.coral}>
              <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z" />
            </svg>
            <div style={{ display: "flex", marginLeft: 16, color: ogPalette.muted, fontSize: 26 }}>
              SM Literatura · Historias para cada momento
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "0 64px 0 24px" }}>
          {book.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- JSX de satori, no llega al DOM
            <img
              alt=""
              src={book.image}
              width={330}
              height={472}
              style={{ borderRadius: 16, objectFit: "cover", boxShadow: "0 30px 70px rgba(27, 47, 53, 0.38)" }}
            />
          ) : (
            <div
              style={{
                width: 330,
                height: 472,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 16,
                background: book.color,
                color: book.accent,
                boxShadow: "0 30px 70px rgba(27, 47, 53, 0.38)",
              }}
            >
              <div style={{ display: "flex", fontSize: 44 }}>SM</div>
              <div style={{ display: "flex", padding: "0 30px", marginTop: 12, fontSize: 30, textAlign: "center" }}>{book.title}</div>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
