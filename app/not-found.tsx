import Link from "next/link";
import { CatalogCard } from "./components/catalog-card";
import { newestBooks } from "./components/book-data";
import { ScreenShell } from "./components/screen-components";

const SUGGESTED = newestBooks.slice(0, 3);

export default function NotFound() {
  return (
    <ScreenShell>
      <section className="not-found-hero">
        <svg className="not-found-shelf" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
          <rect x="10" y="120" width="300" height="8" rx="3" fill="var(--ink)" opacity="0.85" />
          <rect x="30" y="52" width="22" height="68" rx="3" fill="var(--coral)" />
          <rect x="56" y="44" width="20" height="76" rx="3" fill="var(--blue)" />
          <rect x="80" y="58" width="24" height="62" rx="3" fill="var(--yellow)" />
          <rect x="108" y="48" width="20" height="72" rx="3" fill="var(--ink)" opacity="0.8" />
          <g transform="rotate(9 160 116)">
            <rect x="132" y="60" width="22" height="60" rx="3" fill="var(--coral)" opacity="0.9" />
          </g>
          <text x="196" y="112" fontSize="52" fontFamily="inherit" fill="var(--muted)">?</text>
          <g transform="rotate(-74 258 128)">
            <rect x="246" y="70" width="20" height="58" rx="3" fill="var(--blue)" />
          </g>
        </svg>
        <p className="eyebrow">Error 404</p>
        <h1>Este capítulo no existe… <em>todavía.</em></h1>
        <p>
          Buscamos en todos los estantes y hasta debajo del librero, pero esta
          página se nos traspapeló. Mientras la encontramos, hay cientos de
          historias esperándote.
        </p>
        <div className="not-found-actions">
          <Link className="dark-button" href="/seccion">Explorar el catálogo</Link>
          <Link className="arrow-link" href="/novedades">Ver novedades <span>↗</span></Link>
          <Link className="arrow-link" href="/">Volver al inicio <span>↗</span></Link>
        </div>
      </section>
      <section className="not-found-suggestions" aria-labelledby="not-found-suggestions-title">
        <h2 id="not-found-suggestions-title">Estas historias sí existen</h2>
        <div className="section-book-grid">
          {SUGGESTED.map((book) => (
            <CatalogCard key={book.slug} book={book} />
          ))}
        </div>
      </section>
    </ScreenShell>
  );
}
