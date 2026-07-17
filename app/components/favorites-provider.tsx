"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { catalogBooks, type BookRecord } from "./book-data";
import {
  isFavoriteId,
  normalizeFavoriteIds,
  removeFavoriteId,
  toggleFavoriteId,
} from "../lib/favorites-core";
import { SAVED_BOOKS_KEY, readStored } from "../lib/store";

export type FavoritesContextValue = {
  favoriteIds: readonly string[];
  count: number;
  ready: boolean;
  isFavorite: (book: Pick<BookRecord, "slug" | "title">) => boolean;
  toggleFavorite: (book: Pick<BookRecord, "slug" | "title">) => void;
  removeFavorite: (book: Pick<BookRecord, "slug" | "title">) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function persist(ids: readonly string[]) {
  try {
    window.localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(ids));
  } catch {
    // The in-memory session remains usable when browser storage is unavailable.
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const currentIds = useRef<string[]>([]);

  const apply = useCallback((next: string[]) => {
    currentIds.current = next;
    setFavoriteIds(next);
  }, []);

  useEffect(() => {
    const raw = readStored<unknown>(SAVED_BOOKS_KEY, []);
    const normalized = normalizeFavoriteIds(raw, catalogBooks);
    apply(normalized);
    if (JSON.stringify(raw) !== JSON.stringify(normalized)) persist(normalized);
    setReady(true);

    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== SAVED_BOOKS_KEY) return;
      let rawValue: unknown = [];
      try {
        rawValue = event.newValue ? JSON.parse(event.newValue) : [];
      } catch {
        rawValue = [];
      }
      apply(normalizeFavoriteIds(rawValue, catalogBooks));
    };

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, [apply]);

  const toggleFavorite = useCallback((book: Pick<BookRecord, "slug" | "title">) => {
    const next = toggleFavoriteId(currentIds.current, book);
    apply(next);
    persist(next);
  }, [apply]);

  const removeFavorite = useCallback((book: Pick<BookRecord, "slug" | "title">) => {
    const next = removeFavoriteId(currentIds.current, book);
    apply(next);
    persist(next);
  }, [apply]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteIds,
    count: favoriteIds.length,
    ready,
    isFavorite: (book) => isFavoriteId(favoriteIds, book),
    toggleFavorite,
    removeFavorite,
  }), [favoriteIds, ready, removeFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
