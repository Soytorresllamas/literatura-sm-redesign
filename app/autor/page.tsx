"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogCard } from "../components/catalog-card";
import { catalogAuthors, getBooksByAuthor } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export default function AuthorPage() {
  const [name, setName] = useState(catalogAuthors[0]?.name || "Autor");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("nombre");
      const match = catalogAuthors.find((author) => author.name.localeCompare(requested || "", "es", { sensitivity: "base" }) === 0);
      if (match) setName(match.name);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const author = useMemo(() => catalogAuthors.find((item) => item.name === name) || catalogAuthors[0], [name]);
  const books = useMemo(() => getBooksByAuthor(author?.name), [author]);
  return <ScreenShell><ScreenHero eyebrow="Autor" title={<>{author?.name || "Autor"}</>} intro={`${author?.nationality ? `${author.nationality}. ` : ""}${books.length} ${books.length === 1 ? "título publicado" : "títulos publicados"} en Literatura SM.`} /><section className="author-profile"><div className="author-profile-mark">{initials(author?.name || "A")}</div><div><p className="eyebrow">Trayectoria en el catálogo</p><h2>Historias para descubrir<br /><em>nuevas miradas.</em></h2><p>Explora sus títulos, colecciones, edades recomendadas y recursos disponibles.</p><a className="arrow-link" href="/recursos">Ver recursos de lectura ↗</a></div></section><section className="screen-content"><div className="section-heading"><div><p className="eyebrow">Bibliografía</p><h2>Sus libros</h2></div></div><div className="section-book-grid">{books.map((book) => <CatalogCard key={book.slug} book={book} />)}</div></section></ScreenShell>;
}
