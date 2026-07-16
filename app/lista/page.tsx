"use client";

import { useEffect, useState } from "react";
import { CatalogCard } from "../components/catalog-card";
import { catalogBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";
import { SAVED_BOOKS_KEY, STORAGE_SYNC_EVENT, readStored } from "../lib/store";

export default function WishlistPage() {
  const [saved, setSaved] = useState<string[]>(() => readStored<string[]>(SAVED_BOOKS_KEY, []));
  useEffect(() => {
    const sync = () => setSaved(readStored<string[]>(SAVED_BOOKS_KEY, []));
    window.addEventListener("storage", sync);
    window.addEventListener(STORAGE_SYNC_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(STORAGE_SYNC_EVENT, sync); };
  }, []);
  const books = catalogBooks.filter((book) => saved.includes(book.slug) || saved.includes(book.title));
  return <ScreenShell><ScreenHero eyebrow="Tu biblioteca personal" title={<>Libros para <em>volver.</em></>} intro="Guarda títulos para leer después, compartir con tu equipo o convertir en tu próximo pedido." /><section className="screen-content"><div className="list-toolbar"><p><strong>{books.length}</strong> {books.length === 1 ? "libro guardado" : "libros guardados"}</p><button className="outline-action" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Compartir lista ↗</button></div>{books.length ? <div className="section-book-grid">{books.map((book) => <CatalogCard key={book.slug} book={book} buy />)}</div> : <div className="empty-state">Aún no tienes libros guardados. Explora el catálogo y añade tus próximos descubrimientos.</div>}</section></ScreenShell>;
}
