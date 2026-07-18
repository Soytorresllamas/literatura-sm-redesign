"use client";

import Link from "next/link";
import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";
import { FavoriteButton } from "./favorite-button";

export function CatalogCard({ book }: { book: BookRecord }) {
  return (
    <article className="book-card">
      <FavoriteButton book={book} />
      <Link href={`/libro?slug=${book.slug}`} className="card-main-link">
        <span className="book-click">
          <BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} />
        </span>
        <span className="book-card-info">
          <span className="book-tag">{book.theme}</span>
          <span className="book-card-title">{book.title}</span>
          <span className="book-card-author">{book.author}</span>
          <span className="book-meta">
            <span>{book.age}</span>
            <span>{book.level}</span>
          </span>
          <span className="card-detail-link">Ver ficha <span>↗</span></span>
        </span>
      </Link>
    </article>
  );
}
