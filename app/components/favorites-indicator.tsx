"use client";

import Link from "next/link";
import { FavoriteHeart } from "./favorite-heart";
import { useFavorites } from "./favorites-provider";
import { FAVORITES_UI_ENABLED } from "../lib/features";

export function FavoritesIndicator() {
  const { count, ready } = useFavorites();
  if (!FAVORITES_UI_ENABLED) return null;

  const visibleCount = ready ? String(count) : "\u00a0";
  return (
    <Link
      className="save-button"
      href="/lista"
      aria-label={ready ? `Lista de deseos, ${count} ${count === 1 ? "libro" : "libros"}` : "Lista de deseos"}
    >
      <FavoriteHeart active={ready && count > 0} className="favorite-heart-header" />
      <span className="save-count" aria-hidden={!ready}>{visibleCount}</span>
    </Link>
  );
}
