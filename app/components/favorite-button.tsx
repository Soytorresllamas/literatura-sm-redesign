"use client";

import type { BookRecord } from "./book-data";
import { FavoriteHeart } from "./favorite-heart";
import { useFavorites } from "./favorites-provider";

type FavoriteButtonProps = {
  book: Pick<BookRecord, "slug" | "title">;
  variant?: "card" | "detail";
  className?: string;
};

export function FavoriteButton({ book, variant = "card", className = "" }: FavoriteButtonProps) {
  const { isFavorite, ready, toggleFavorite } = useFavorites();
  const active = isFavorite(book);
  const action = active ? "Quitar" : "Guardar";

  return (
    <button
      type="button"
      className={`favorite-button favorite-button-${variant} ${className}`.trim()}
      aria-label={`${action} ${book.title}`}
      aria-pressed={active}
      disabled={!ready}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(book);
      }}
    >
      <FavoriteHeart active={active} className={variant === "detail" ? "favorite-heart-detail" : ""} />
      {variant === "detail" && <span>{active ? "Guardado" : "Guardar en mi lista"}</span>}
    </button>
  );
}
