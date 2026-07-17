import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const provider = await readFile(new URL("../app/components/favorites-provider.tsx", import.meta.url), "utf8").catch(() => "");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("root layout mounts one favorites provider", () => {
  assert.match(layout, /<FavoritesProvider>\{children\}<\/FavoritesProvider>/);
});

test("provider owns hydration, persistence, and cross-tab storage synchronization", () => {
  assert.match(provider, /createContext/);
  assert.match(provider, /normalizeFavoriteIds/);
  assert.match(provider, /window\.localStorage\.setItem\(SAVED_BOOKS_KEY/);
  assert.match(provider, /window\.addEventListener\("storage"/);
  assert.match(provider, /ready/);
  assert.doesNotMatch(provider, /STORAGE_SYNC_EVENT/);
});
