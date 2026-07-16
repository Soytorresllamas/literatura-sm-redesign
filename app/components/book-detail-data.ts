import sourceDetails from "../../data/catalog/book-details.json";
import { getBookBySlug, type BookRecord } from "./book-data";

export type BookLinks = {
  amazonEbook: string | null;
  audiobook: string | null;
  bookTrailer: string | null;
  podcast: string | null;
  external: string | null;
};

export type BookDetails = {
  slug: string;
  description?: string;
  note?: string;
  illustrator?: string;
  illustratorNationality?: string;
  images?: string[];
  isbn?: string;
  pages?: number;
  format?: string;
  binding?: string;
  links: BookLinks;
};

export type DetailedBookRecord = BookRecord & BookDetails;

const details = sourceDetails as BookDetails[];
const detailsBySlug = new Map(details.map((detail) => [detail.slug, detail]));
const emptyLinks: BookLinks = { amazonEbook: null, audiobook: null, bookTrailer: null, podcast: null, external: null };

export function getDetailedBookBySlug(slug: string | null | undefined): DetailedBookRecord {
  const book = getBookBySlug(slug);
  const detail = detailsBySlug.get(book.slug);
  return { ...book, ...detail, links: detail?.links ?? emptyLinks };
}
