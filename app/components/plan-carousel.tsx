"use client";

import Link from "next/link";
import { useRef } from "react";
import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";

type PlanCarouselProps = {
  books: BookRecord[];
  ariaLabel: string;
};

export function PlanCarousel({ books, ariaLabel }: PlanCarouselProps) {
  const track = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: number) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="plan-carousel" role="region" aria-label={ariaLabel}>
      <button
        type="button"
        className="plan-carousel-arrow"
        onClick={() => scrollByPage(-1)}
        aria-label={`${ariaLabel}: anteriores`}
      >
        ←
      </button>
      <div className="plan-carousel-track" ref={track} tabIndex={0}>
        {books.map((book) => (
          <Link
            key={book.slug}
            href={`/libro/${book.slug}`}
            className="plan-carousel-item"
            aria-label={`${book.title} — ${book.author}`}
          >
            <BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} />
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="plan-carousel-arrow"
        onClick={() => scrollByPage(1)}
        aria-label={`${ariaLabel}: siguientes`}
      >
        →
      </button>
    </div>
  );
}
