"use client";

import { useEffect, useState } from "react";
import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";
import { FavoriteHeart } from "./favorite-heart";
import { readStored, SAVED_BOOKS_KEY, STORAGE_SYNC_EVENT, writeStored } from "../lib/store";

function isSaved(values: string[], book: BookRecord) {
  return values.includes(book.slug) || values.includes(book.title);
}

export function CatalogCard({ book }: { book: BookRecord }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isSaved(readStored<string[]>(SAVED_BOOKS_KEY, []), book));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(STORAGE_SYNC_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STORAGE_SYNC_EVENT, sync);
    };
  }, [book]);

  function toggleSave() {
    const current = readStored<string[]>(SAVED_BOOKS_KEY, []);
    const next = isSaved(current, book)
      ? current.filter((item) => item !== book.slug && item !== book.title)
      : [...current, book.slug];
    writeStored(SAVED_BOOKS_KEY, [...new Set(next)]);
  }

  return <article className="book-card">
    <button className="card-save" onClick={toggleSave} aria-label={`${saved ? "Quitar" : "Guardar"} ${book.title}`} aria-pressed={saved}><FavoriteHeart active={saved} /></button>
    <a href={`/libro?slug=${book.slug}`} className="card-main-link"><span className="book-click"><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></span><span className="book-card-info"><span className="book-tag">{book.theme}</span><span className="book-card-title">{book.title}</span><span className="book-card-author">{book.author}</span><span className="book-meta"><span>{book.age}</span><span>{book.level}</span></span><span className="card-detail-link">Ver ficha <span>↗</span></span></span></a>
  </article>;
}
