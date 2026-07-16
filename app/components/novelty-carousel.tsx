"use client";

import { useRef, useState } from "react";
import type { BookRecord } from "./book-data";
import { BookCover } from "./book-cover";

type NoveltyCarouselProps = {
  books: BookRecord[];
};

function relativePosition(index: number, active: number, total: number) {
  let distance = index - active;
  if (distance > total / 2) distance -= total;
  if (distance < -total / 2) distance += total;
  return distance;
}

function positionClass(position: number) {
  if (position === 0) return "is-active";
  if (position === -1) return "is-previous";
  if (position === 1) return "is-next";
  if (position === -2) return "is-far-previous";
  if (position === 2) return "is-far-next";
  return "is-hidden";
}

export function NoveltyCarousel({ books }: NoveltyCarouselProps) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const current = books[active];

  if (!current) return null;

  function move(direction: number) {
    setActive((index) => (index + direction + books.length) % books.length);
  }

  function finishSwipe(clientX: number) {
    if (touchStart.current == null) return;
    const distance = clientX - touchStart.current;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
    touchStart.current = null;
  }

  return <section className="novelty-section" aria-labelledby="novelty-title"><div className="novelty-heading"><div><p className="eyebrow">Lo más reciente de Literatura SM</p><h2 id="novelty-title">Novedades</h2></div><div><span>{books.length} libros nuevos</span><a className="arrow-link" href="/novedades">Ver todas las novedades <span>↗</span></a></div></div><div className="novelty-carousel" role="region" aria-roledescription="carrusel" aria-label="Novedades editoriales" tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}><div className="novelty-stage">{books.map((book, index) => { const position = relativePosition(index, active, books.length); return <button key={book.slug} type="button" className={`novelty-slide ${positionClass(position)}`} onClick={() => position === 0 ? window.location.assign(`/libro?slug=${book.slug}`) : setActive(index)} aria-label={position === 0 ? `Ver ficha de ${book.title}` : `${book.title} — ${book.author}`} aria-current={position === 0 ? "true" : undefined} tabIndex={position === 0 ? 0 : -1}><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></button>; })}<button className="novelty-arrow novelty-arrow-previous" type="button" onClick={() => move(-1)} aria-label="Libro anterior">←</button><button className="novelty-arrow novelty-arrow-next" type="button" onClick={() => move(1)} aria-label="Libro siguiente">→</button></div><div className="novelty-copy" key={current.slug} aria-live="polite"><span className="novelty-counter">{String(active + 1).padStart(2, "0")} / {String(books.length).padStart(2, "0")}</span><h3><a href={`/libro?slug=${current.slug}`}>{current.title}</a></h3><p className="novelty-author">{current.author}</p><p className="novelty-note">{current.note || `${current.theme} · ${current.age}`}</p><a className="novelty-link" href={`/libro?slug=${current.slug}`}>Ver libro →</a></div><div className="novelty-controls"><button type="button" onClick={() => move(-1)} aria-label="Libro anterior">←</button><div className="novelty-dots" aria-label="Seleccionar novedad">{books.map((book, index) => <button key={book.slug} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={book.title} aria-current={index === active ? "true" : undefined} />)}</div><button type="button" onClick={() => move(1)} aria-label="Libro siguiente">→</button></div></div></section>;
}
