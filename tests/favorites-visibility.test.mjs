import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("favorites UI is disabled by one shared feature flag", async () => {
  const [features, button, indicator] = await Promise.all([
    read("../app/lib/features.ts"),
    read("../app/components/favorite-button.tsx"),
    read("../app/components/favorites-indicator.tsx"),
  ]);

  assert.match(features, /export const FAVORITES_UI_ENABLED = false/);
  assert.match(button, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(button, /if \(!FAVORITES_UI_ENABLED\) return null/);
  assert.match(indicator, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(indicator, /if \(!FAVORITES_UI_ENABLED\) return null/);
});
