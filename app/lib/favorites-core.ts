export type FavoriteBook = {
  slug: string;
  title: string;
};

export function normalizeFavoriteIds(raw: unknown, books: readonly FavoriteBook[]): string[] {
  if (!Array.isArray(raw)) return [];

  const slugByValue = new Map<string, string>();
  for (const book of books) {
    slugByValue.set(book.slug, book.slug);
    slugByValue.set(book.title, book.slug);
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const slug = slugByValue.get(value);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    normalized.push(slug);
  }
  return normalized;
}

export function isFavoriteId(ids: readonly string[], book: FavoriteBook): boolean {
  return ids.includes(book.slug);
}

export function toggleFavoriteId(ids: readonly string[], book: FavoriteBook): string[] {
  return isFavoriteId(ids, book)
    ? ids.filter((slug) => slug !== book.slug)
    : [...ids, book.slug];
}

export function removeFavoriteId(ids: readonly string[], book: FavoriteBook): string[] {
  return ids.filter((slug) => slug !== book.slug);
}
