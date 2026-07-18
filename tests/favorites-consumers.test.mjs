import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const paths = [
  "../app/page.tsx",
  "../app/components/catalog-card.tsx",
  "../app/components/section-header.tsx",
  "../app/lista/page.tsx",
  "../app/lista/wishlist-page-content.tsx",
  "../app/libro/[slug]/page.tsx",
];

const sources = await Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), "utf8")));
const combined = sources.join("\n");

test("favorite consumers contain no direct storage ownership", () => {
  assert.doesNotMatch(combined, /SAVED_BOOKS_KEY|STORAGE_SYNC_EVENT|readStored|writeStored/);
  assert.doesNotMatch(combined, /addEventListener\("storage"/);
  assert.doesNotMatch(combined, /initiallySaved/);
});

test("all favorite surfaces use shared controls", () => {
  // El home monta el indicador a través del header compartido.
  assert.match(sources[0], /<SectionHeader \/>/);
  assert.match(sources[0], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[1], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[2], /<FavoritesIndicator \/>/);
  assert.match(sources[3], /redirect\("\/seccion"\)/);
  assert.match(sources[4], /useFavorites/);
  assert.match(sources[5], /<FavoriteButton book=\{book\} variant="detail" \/>/);
});
