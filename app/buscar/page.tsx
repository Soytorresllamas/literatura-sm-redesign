"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogCard } from "../components/catalog-card";
import { catalogBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Recomendados");
  const [visible, setVisible] = useState(24);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(new URLSearchParams(window.location.search).get("q") || ""), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = normalized ? catalogBooks.filter((book) => book.searchText.includes(normalized)) : catalogBooks;
    return [...matches].sort((a, b) => sort === "A–Z" ? a.title.localeCompare(b.title, "es") : b.id - a.id);
  }, [query, sort]);
  return <ScreenShell><ScreenHero eyebrow="Buscar en literatura" title={<>Encuentra tu próxima <em>historia.</em></>} intro="Busca por título, autor, ISBN, edad, tema o colección." /><section className="screen-content search-screen"><form className="wide-search" onSubmit={(event) => event.preventDefault()}>⌕<input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setVisible(24); }} placeholder="Escribe título, autor o ISBN" aria-label="Buscar en el catálogo" /><button type="submit">Buscar</button></form><div className="results-toolbar"><p><strong>{results.length}</strong> {query ? `${results.length === 1 ? "resultado" : "resultados"} para “${query}”` : "títulos disponibles"}</p><label>Ordenar <select value={sort} onChange={(event) => { setSort(event.target.value); setVisible(24); }}><option>Recomendados</option><option>A–Z</option></select></label></div>{results.length ? <><div className="section-book-grid">{results.slice(0, visible).map((book) => <CatalogCard key={book.slug} book={book} />)}</div>{visible < results.length && <div className="load-more-row"><button className="load-more-button" onClick={() => setVisible((current) => current + 24)}>Mostrar más resultados</button></div>}</> : <div className="empty-state">No encontramos resultados. Prueba con otro título, autor, ISBN o tema.</div>}</section></ScreenShell>;
}
