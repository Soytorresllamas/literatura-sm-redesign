import assert from "node:assert/strict";
import test from "node:test";
import {
  isFavoriteId,
  normalizeFavoriteIds,
  removeFavoriteId,
  toggleFavoriteId,
} from "../app/lib/favorites-core.ts";

const books = [
  { slug: "xocolatl-1763", title: "Xocolátl" },
  { slug: "chiflagoras-1766", title: "Chiflágoras" },
] as const;

test("normalizes legacy titles and removes duplicates and unknown values", () => {
  assert.deepEqual(
    normalizeFavoriteIds(["Xocolátl", "xocolatl-1763", "", "Missing", 42], books),
    ["xocolatl-1763"],
  );
});

test("returns an empty list for invalid stored data", () => {
  assert.deepEqual(normalizeFavoriteIds(null, books), []);
  assert.deepEqual(normalizeFavoriteIds({ slug: "xocolatl-1763" }, books), []);
});

test("queries, adds, and removes one slug without duplication", () => {
  assert.equal(isFavoriteId([], books[0]), false);
  const added = toggleFavoriteId([], books[0]);
  assert.deepEqual(added, ["xocolatl-1763"]);
  assert.equal(isFavoriteId(added, books[0]), true);
  assert.deepEqual(toggleFavoriteId(added, books[0]), []);
  assert.deepEqual(removeFavoriteId(["xocolatl-1763", "chiflagoras-1766"], books[0]), ["chiflagoras-1766"]);
});
