"use client";

import { useMemo, useState } from "react";
import { CatalogCard } from "../components/catalog-card";
import { sectionBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function SearchPage() {
  const [query, setQuery] = useState("aventura");
  const results = useMemo(() => sectionBooks.filter((book) => `${book.title} ${book.author} ${book.theme}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <ScreenShell><ScreenHero eyebrow="Buscar en literatura" title={<>Encuentra tu próxima <em>historia.</em></>} intro="Busca por título, autor, ISBN, edad o colección." /><section className="screen-content search-screen"><form className="wide-search" onSubmit={(event) => event.preventDefault()}>⌕<input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe título, autor o ISBN" aria-label="Buscar en el catálogo" /><button type="submit">Buscar</button></form><div className="results-toolbar"><p><strong>{results.length}</strong> resultados para “{query || "todos"}”</p><label>Ordenar <select><option>Recomendados</option><option>A–Z</option></select></label></div>{results.length ? <div className="section-book-grid">{results.map((book) => <CatalogCard key={book.title} book={book} />)}</div> : <div className="empty-state">No encontramos resultados. Prueba con otro título, autor o tema.</div>}</section></ScreenShell>;
}
