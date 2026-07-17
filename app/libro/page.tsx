"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import { BookCover } from "../components/book-cover";
import { getRelatedBooks } from "../components/book-data";
import { getDetailedBookBySlug } from "../components/book-detail-data";
import { FavoriteButton } from "../components/favorite-button";
import { SectionHeader } from "../components/section-header";
import { SiteFooter } from "../components/site-footer";

export default function BookPage() {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlug(new URLSearchParams(window.location.search).get("slug")), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const book = getDetailedBookBySlug(slug);
  const related = useMemo(() => getRelatedBooks(book), [book]);
  const resources = [
    { label: "Booktrailer", description: "Conoce la historia en video", icon: "▶", href: book.links.bookTrailer },
    { label: "Audiolibro", description: "Escucha una muestra o la edición disponible", icon: "◉", href: book.links.audiobook },
    { label: "Podcast", description: "Conversaciones alrededor del libro", icon: "◎", href: book.links.podcast },
    { label: "Ebook", description: "Consulta la edición digital", icon: "↗", href: book.links.amazonEbook },
  ].filter((resource) => resource.href);

  return <main><SectionHeader /><div className="book-breadcrumbs"><a href="/">Inicio</a><span>/</span><a href="/seccion">Explorar libros</a><span>/</span><strong>{book.title}</strong></div><section className="book-detail"><div className="detail-visual">{book.novelty && <span className="detail-label">Novedad</span>}<BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} large /><div className="detail-share">Compartir <button aria-label="Copiar enlace" onClick={() => navigator.clipboard?.writeText(window.location.href)}>↗</button></div></div><div className="detail-copy"><p className="eyebrow">{book.series} · {book.age}</p><h1>{book.title}</h1><p className="detail-author"><a href={`/autor?nombre=${encodeURIComponent(book.author)}`}>{book.author}</a></p><p className="detail-description">{book.description || book.note || "Consulta la ficha editorial de este título y descubre su propuesta de lectura."}</p><div className="detail-actions"><FavoriteButton book={book} variant="detail" /></div><div className="detail-tags"><span>{book.age}</span>{book.school && <span>{book.school}</span>}<span>{book.level}</span><span>{book.theme}</span></div></div></section><section className="book-info-section"><div className="book-info-intro"><p className="eyebrow">Conoce el libro</p><h2>Una lectura para<br /><em>crecer juntos.</em></h2></div><div className="book-info-grid"><div><h3>Sobre la historia</h3><p>{book.note || book.description || "Una propuesta de Literatura SM para acompañar el encuentro entre lectores e historias."}</p></div><div><h3>Datos editoriales</h3><dl><dt>Autor</dt><dd>{book.author}</dd>{book.illustrator && <><dt>Ilustrador</dt><dd>{book.illustrator}</dd></>}<dt>ISBN</dt><dd>{book.isbn || "Por confirmar"}</dd><dt>Páginas</dt><dd>{book.pages || "Por confirmar"}</dd>{book.format && <><dt>Formato</dt><dd>{book.format}</dd></>}{book.binding && <><dt>Encuadernación</dt><dd>{book.binding}</dd></>}</dl></div><div><h3>Recursos disponibles</h3>{resources.length ? <ul className="resource-list">{resources.map((resource) => <li key={resource.label}><span>{resource.icon}</span><a href={resource.href || "#"} target="_blank" rel="noreferrer"><strong>{resource.label}</strong><small>{resource.description}</small></a></li>)}</ul> : <p>Los recursos complementarios se publicarán en esta ficha cuando estén disponibles.</p>}</div></div></section><section className="related-section"><div className="section-heading"><div><p className="eyebrow">También puede gustarte</p><h2>Más historias para {book.ageGroup}</h2></div><a className="arrow-link" href="/seccion">Ver catálogo <span>↗</span></a></div><div className="related-books">{related.map((item) => <div className="related-item" key={item.slug}><a href={`/libro?slug=${item.slug}`}><BookCover title={item.title} author={item.author} color={item.color} accent={item.accent} image={item.image} /></a><strong>{item.title}</strong><span>{item.author}</span></div>)}</div></section><SiteFooter /></main>;
}
