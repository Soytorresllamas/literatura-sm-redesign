"use client";

import { FavoriteHeart } from "./favorite-heart";
import { useFavorites } from "./favorites-provider";

export function FavoritesIndicator() {
  const { count, ready } = useFavorites();
  const visibleCount = ready ? String(count) : "\u00a0";
  return (
    <a
      className="save-button"
      href="/lista"
      aria-label={ready ? `Lista de deseos, ${count} ${count === 1 ? "libro" : "libros"}` : "Lista de deseos"}
    >
      <FavoriteHeart active={ready && count > 0} className="favorite-heart-header" />
      <span className="save-count" aria-hidden={!ready}>{visibleCount}</span>
    </a>
  );
}
