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
import { SAVED_BOOKS_KEY } from "../lib/store";

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

function normalizeSerializedFavoriteIds(serialized: string | null) {
  let raw: unknown = [];
  if (serialized !== null) {
    try {
      raw = JSON.parse(serialized);
    } catch {
      raw = [];
    }
  }

  const normalized = normalizeFavoriteIds(raw, catalogBooks);
  return {
    normalized,
    needsRepair: serialized !== null && serialized !== JSON.stringify(normalized),
  };
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
    let active = true;

    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== SAVED_BOOKS_KEY) return;
      const synced = normalizeSerializedFavoriteIds(event.newValue);
      apply(synced.normalized);
      if (synced.needsRepair) persist(synced.normalized);
    };

    window.addEventListener("storage", syncFromAnotherTab);
    queueMicrotask(() => {
      if (!active) return;
      let serialized: string | null = null;
      try {
        serialized = window.localStorage.getItem(SAVED_BOOKS_KEY);
      } catch {
        // Hydration falls back to an empty in-memory list when storage cannot be read.
      }
      const { normalized, needsRepair } = normalizeSerializedFavoriteIds(serialized);
      apply(normalized);
      if (needsRepair) persist(normalized);
      setReady(true);
    });

    return () => {
      active = false;
      window.removeEventListener("storage", syncFromAnotherTab);
    };
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
