"use client";

import { CatalogCard } from "../components/catalog-card";
import { catalogBooks } from "../components/book-data";
import { useFavorites } from "../components/favorites-provider";
import { CatalogPageSkeleton } from "../components/loading-skeletons";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function WishlistPage() {
  const { favoriteIds, ready } = useFavorites();
  const favoriteSet = new Set(favoriteIds);
  const books = catalogBooks.filter((book) => favoriteSet.has(book.slug));
  if (!ready) return <CatalogPageSkeleton />;
  return <ScreenShell><ScreenHero eyebrow="Tu biblioteca personal" title={<>Libros para <em>volver.</em></>} intro="Guarda títulos para leer después, compartir con tu equipo o preparar tus próximas lecturas." /><section className="screen-content"><div className="list-toolbar"><p><strong>{books.length}</strong> {books.length === 1 ? "libro guardado" : "libros guardados"}</p><button className="outline-action" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Compartir lista ↗</button></div>{books.length ? <div className="section-book-grid">{books.map((book) => <CatalogCard key={book.slug} book={book} />)}</div> : <div className="empty-state">Aún no tienes libros guardados. Explora el catálogo y añade tus próximos descubrimientos.</div>}</section></ScreenShell>;
}
