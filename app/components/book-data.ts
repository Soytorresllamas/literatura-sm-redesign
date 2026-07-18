import sourceCatalog from "../../data/catalog/catalog-index.json";

export type ReadingPlanId = "loran" | "trotamundos" | "cosmos";
export type BookPlanEntry = { plan: ReadingPlanId; level: string };

export type BookRecord = {
  id: number;
  slug: string;
  title: string;
  author: string;
  authorNationality?: string;
  age: string;
  ageGroup: string;
  school?: string;
  level: string;
  series: string;
  genre: string;
  theme: string;
  themes: string[];
  color: string;
  accent: string;
  image?: string;
  price?: number;
  novelty: boolean;
  featured: boolean;
  note?: string;
  format?: string;
  plans?: BookPlanEntry[];
  searchText: string;
};

export type AuthorRecord = {
  name: string;
  slug: string;
  nationality?: string;
  count: number;
  bookSlugs: string[];
};

export const catalogBooks = sourceCatalog as BookRecord[];
export const sectionBooks = catalogBooks;
export const newestBooks = catalogBooks.filter((book) => book.novelty).sort((a, b) => b.id - a.id);
export const featuredBook = newestBooks[0] ?? catalogBooks[0];

function countFacet(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

export const ageFacets = countFacet(catalogBooks.map((book) => book.ageGroup));
export const themeFacets = countFacet(catalogBooks.flatMap((book) => book.themes.length ? book.themes : [book.theme]));
export const levelFacets = countFacet(catalogBooks.map((book) => book.school || book.level));

const authorMap = new Map<string, AuthorRecord>();
for (const book of catalogBooks) {
  const current = authorMap.get(book.author);
  if (current) {
    current.count += 1;
    current.bookSlugs.push(book.slug);
  } else {
    authorMap.set(book.author, {
      name: book.author,
      slug: encodeURIComponent(book.author),
      nationality: book.authorNationality,
      count: 1,
      bookSlugs: [book.slug],
    });
  }
}
export const catalogAuthors = [...authorMap.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));

export const catalogStats = {
  total: catalogBooks.length,
  authors: catalogAuthors.length,
  novelties: newestBooks.length,
};

export function findBookBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  return catalogBooks.find((book) => book.slug === slug)
    ?? catalogBooks.find((book) => book.slug.startsWith(`${slug}-`));
}

export function getBookBySlug(slug: string | null | undefined) {
  return findBookBySlug(slug) ?? featuredBook;
}

export function getBooksByAuthor(name: string | null | undefined) {
  if (!name) return [];
  return catalogBooks.filter((book) => book.author.localeCompare(name, "es", { sensitivity: "base" }) === 0);
}

export function getRelatedBooks(book: BookRecord, limit = 3) {
  return catalogBooks
    .filter((candidate) => candidate.id !== book.id)
    .map((candidate) => ({
      candidate,
      score: (candidate.series === book.series ? 4 : 0)
        + (candidate.theme === book.theme ? 3 : 0)
        + (candidate.ageGroup === book.ageGroup ? 2 : 0)
        + (candidate.genre === book.genre ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.candidate.id - a.candidate.id)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export type ReadingPlan = {
  id: ReadingPlanId;
  name: string;
  tagline: string;
  books: BookRecord[];
  levels: { name: string; count: number }[];
};

const planMeta: { id: ReadingPlanId; name: string; tagline: string }[] = [
  { id: "loran", name: "Loran", tagline: "Lecturas graduadas de preescolar a secundaria." },
  { id: "trotamundos", name: "Trotamundos", tagline: "Literatura que inspira a los lectores del futuro." },
  { id: "cosmos", name: "Cosmos", tagline: "Historias de bachillerato para lectores que despegan." },
];

export const readingPlans: ReadingPlan[] = planMeta.map((meta) => {
  const books = catalogBooks.filter((book) => book.plans?.some((entry) => entry.plan === meta.id));
  const levels = countFacet(books.flatMap((book) => (book.plans ?? [])
    .filter((entry) => entry.plan === meta.id)
    .map((entry) => entry.level)));
  return { ...meta, books, levels };
});

export function getReadingPlan(id: string | null | undefined) {
  return readingPlans.find((plan) => plan.id === id);
}
