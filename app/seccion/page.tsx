"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from "react";
import { BookCover } from "../components/book-cover";
import { sectionBooks } from "../components/book-data";
import { SectionHeader } from "../components/section-header";

export default function SectionPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("Todos");
  const [sort, setSort] = useState("Recomendados");
  const filtered = useMemo(() => sectionBooks.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase()) && (theme === "Todos" || book.theme === theme)), [query, theme]);

  return <main><SectionHeader /><section className="section-hero"><div className="breadcrumbs"><a href="/">Inicio</a><span>/</span><span>Explorar libros</span><span>/</span><strong>0–5 años</strong></div><p className="eyebrow">Explorar por edad</p><h1>Libros para <em>0–5 años</em></h1><p>Primeras historias para mirar, nombrar, sentir y compartir.</p></section><section className="section-layout"><aside className="filter-sidebar"><div className="filter-heading"><strong>Filtrar resultados</strong><button onClick={() => { setTheme("Todos"); setQuery(""); }}>Limpiar</button></div><label className="side-search">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en esta sección" /></label><fieldset><legend>Edad</legend><label><input type="checkbox" defaultChecked /> 0–5 años <span>{sectionBooks.length}</span></label></fieldset><fieldset><legend>Tema</legend>{["Todos", "Emociones", "Naturaleza", "Familia"].map((item) => <label key={item}><input type="radio" name="theme" checked={theme === item} onChange={() => setTheme(item)} /> {item}<span>{item === "Todos" ? sectionBooks.length : filtered.filter((book) => book.theme === item).length}</span></label>)}</fieldset><fieldset><legend>Formato</legend><label><input type="checkbox" /> Impreso <span>{sectionBooks.length}</span></label><label><input type="checkbox" /> Audiolibro <span>8</span></label><label><input type="checkbox" /> Ebook <span>5</span></label></fieldset></aside><div className="results-column"><div className="results-toolbar"><p><strong>{filtered.length}</strong> títulos encontrados</p><label>Ordenar <select value={sort} onChange={(e) => setSort(e.target.value)}><option>Recomendados</option><option>Más recientes</option><option>A–Z</option></select></label></div><div className="section-book-grid">{filtered.map((book) => <article className="book-card" key={book.slug}><button className="card-save" aria-label={`Guardar ${book.title}`}>♡</button><a href={`/libro?slug=${book.slug}`}><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></a><div className="book-card-info"><span className="book-tag">{book.theme}</span><h3>{book.title}</h3><p>{book.author}</p><div className="book-meta"><span>{book.age}</span><span>{book.level}</span></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-state">No encontramos libros en esta sección. Prueba con otro tema o limpia los filtros.</div>}</div></section></main>;
}
