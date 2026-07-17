import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

function parseFavoritesFlag(source) {
  const match = source.match(/export const FAVORITES_UI_ENABLED\s*=\s*(true|false)\s*;/);
  assert.ok(match, "FAVORITES_UI_ENABLED must be exported as one boolean literal");
  return match[1] === "true";
}

test("favorites UI uses one shared boolean feature flag", async () => {
  const [features, button, indicator] = await Promise.all([
    read("../app/lib/features.ts"),
    read("../app/components/favorite-button.tsx"),
    read("../app/components/favorites-indicator.tsx"),
  ]);

  assert.equal(typeof parseFavoritesFlag(features), "boolean");
  assert.match(button, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(button, /if \(!FAVORITES_UI_ENABLED\) return null/);
  assert.match(indicator, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(indicator, /if \(!FAVORITES_UI_ENABLED\) return null/);
});

test("account and wishlist route honor the favorites flag", async () => {
  const [account, wishlistRoute] = await Promise.all([
    read("../app/mi-cuenta/page.tsx"),
    read("../app/lista/page.tsx"),
  ]);

  assert.match(account, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(account, /FAVORITES_UI_ENABLED &&/);
  assert.match(wishlistRoute, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(wishlistRoute, /if \(!FAVORITES_UI_ENABLED\) redirect\("\/seccion"\)/);
  assert.match(wishlistRoute, /<WishlistPageContent \/>/);
});

test("hidden favorite controls leave detail and account layouts intact", async () => {
  const [account, styles] = await Promise.all([
    read("../app/mi-cuenta/page.tsx"),
    read("../app/globals.css"),
  ]);

  assert.match(account, /className="account-card account-card-resources"/);
  assert.match(styles, /\.detail-actions:empty\s*\{[^}]*display:\s*none\s*;?[^}]*\}/);
  assert.match(styles, /\.account-card-resources\s*\{[^}]*background:\s*#d7e9d9\s*;?[^}]*\}/);
  assert.match(styles, /\.account-card:only-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1\s*;?[^}]*\}/);
});
