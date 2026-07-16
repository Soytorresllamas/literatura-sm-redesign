"use client";

import { useMemo, useState } from "react";
import { catalogAuthors } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export default function AuthorsPage() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(30);
  const authors = useMemo(() => catalogAuthors.filter((author) => author.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return <ScreenShell><ScreenHero eyebrow="Voces detrás de las historias" title={<>Conoce a nuestros <em>autores.</em></>} intro={`${catalogAuthors.length} voces presentes en el catálogo de Literatura SM.`} /><section className="screen-content"><label className="wide-search">⌕<input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(30); }} placeholder="Buscar autor" aria-label="Buscar autor" /></label><div className="results-toolbar"><p><strong>{authors.length}</strong> autores encontrados</p></div><div className="author-grid">{authors.slice(0, visible).map((author, index) => <a className="author-card" href={`/autor?nombre=${encodeURIComponent(author.name)}`} key={author.name}><span className={`author-avatar author-avatar-${index % 4}`}>{initials(author.name)}</span><span><strong>{author.name}</strong><small>{author.nationality || "Literatura infantil y juvenil"} · {author.count} {author.count === 1 ? "libro" : "libros"}</small></span><b>↗</b></a>)}</div>{visible < authors.length && <div className="load-more-row"><button className="load-more-button" onClick={() => setVisible((current) => current + 30)}>Mostrar más autores</button></div>}</section></ScreenShell>;
}
