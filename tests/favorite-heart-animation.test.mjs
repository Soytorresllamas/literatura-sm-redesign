import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentSource = await readFile(new URL("../app/components/favorite-heart.tsx", import.meta.url), "utf8");
const favoriteButtonSource = await readFile(new URL("../app/components/favorite-button.tsx", import.meta.url), "utf8").catch(() => "");
const indicatorSource = await readFile(new URL("../app/components/favorites-indicator.tsx", import.meta.url), "utf8").catch(() => "");
const stylesheetSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("favorite heart uses a stable inline SVG without Lottie", () => {
  assert.doesNotMatch(componentSource, /lottie/i);
  assert.equal(packageJson.dependencies?.["lottie-web"], undefined);
  assert.match(componentSource, /data-favorite-heart="static"/);
  assert.match(componentSource, /<svg[^>]*viewBox="0 0 100 100"/);
  assert.match(componentSource, /<path/);
});

test("favorite heart switches between outline and filled states", () => {
  assert.match(componentSource, /fill=\{active \? "currentColor" : "none"\}/);
  assert.match(componentSource, /className=\{`favorite-heart-icon/);
});

test("favorite interactions use shared accessible controls", () => {
  assert.match(favoriteButtonSource, /type="button"/);
  assert.match(favoriteButtonSource, /aria-pressed=\{active\}/);
  assert.match(favoriteButtonSource, /event\.preventDefault\(\)/);
  assert.match(favoriteButtonSource, /event\.stopPropagation\(\)/);
  assert.match(indicatorSource, /useFavorites/);
});

test("favorite keyboard activation toggles once and suppresses default navigation", () => {
  const keyboardHandler = favoriteButtonSource.match(/onKeyDown=\{\(event\) => \{([\s\S]*?)\}\}\s*onClick=/)?.[1] ?? "";
  assert.match(keyboardHandler, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(keyboardHandler, /event\.preventDefault\(\)/);
  assert.match(keyboardHandler, /event\.stopPropagation\(\)/);
  assert.match(keyboardHandler, /if \(!event\.repeat\) toggleFavorite\(book\)/);
});

test("favorite button has a stable 48px hit target and restrained motion", () => {
  assert.match(stylesheetSource, /\.favorite-button-card\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px/);
  assert.match(stylesheetSource, /\.favorite-button-card:hover \.favorite-heart\s*\{[^}]*scale\(1\.04\)/);
  assert.match(stylesheetSource, /prefers-reduced-motion:\s*reduce/);
});

test("header count reserves a fixed three-digit width through 360", () => {
  assert.match(indicatorSource, /const visibleCount = ready \? String\(count\)/);
  assert.match(stylesheetSource, /\.save-count\s*\{[^}]*width:\s*3ch;[^}]*font-variant-numeric:\s*tabular-nums/);
  assert.doesNotMatch(stylesheetSource, /\.save-count\.is-loading/);
});
