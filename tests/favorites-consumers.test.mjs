import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const paths = [
  "../app/page.tsx",
  "../app/components/catalog-card.tsx",
  "../app/components/section-header.tsx",
  "../app/lista/page.tsx",
  "../app/libro/page.tsx",
];

const sources = await Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), "utf8")));
const combined = sources.join("\n");

test("favorite consumers contain no direct storage ownership", () => {
  assert.doesNotMatch(combined, /SAVED_BOOKS_KEY|STORAGE_SYNC_EVENT|readStored|writeStored/);
  assert.doesNotMatch(combined, /addEventListener\("storage"/);
  assert.doesNotMatch(combined, /initiallySaved/);
});

test("all favorite surfaces use shared controls", () => {
  assert.match(sources[0], /<FavoritesIndicator \/>/);
  assert.match(sources[0], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[1], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[2], /<FavoritesIndicator \/>/);
  assert.match(sources[3], /useFavorites/);
  assert.match(sources[4], /<FavoriteButton book=\{book\} variant="detail" \/>/);
});
