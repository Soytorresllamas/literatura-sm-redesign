"use client";

import { BookCover } from "./book-cover";
import { CART_KEY, readStored, writeStored } from "../lib/store";

type CatalogBook = { slug: string; title: string; author: string; age: string; level: string; theme: string; color: string; accent: string; image?: string };

export function CatalogCard({ book, buy = false }: { book: CatalogBook; buy?: boolean }) {
  return <article className="book-card">
    <button className="card-save" aria-label={`Guardar ${book.title}`}>♡</button>
    <a href={`/libro?slug=${book.slug}`} className="card-main-link"><span className="book-click"><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></span><span className="book-card-info"><span className="book-tag">{book.theme}</span><span className="book-card-title">{book.title}</span><span className="book-card-author">{book.author}</span><span className="book-meta"><span>{book.age}</span><span>{book.level}</span></span><span className="card-detail-link">Ver ficha <span>↗</span></span></span></a>
    {buy && <button className="mini-buy" onClick={() => writeStored(CART_KEY, [...readStored<string[]>(CART_KEY, []), book.slug])}>Agregar al carrito</button>}
  </article>;
}
