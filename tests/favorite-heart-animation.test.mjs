import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentSource = await readFile(new URL("../app/components/favorite-heart.tsx", import.meta.url), "utf8");
const catalogCardSource = await readFile(new URL("../app/components/catalog-card.tsx", import.meta.url), "utf8");
const wishlistSource = await readFile(new URL("../app/lista/page.tsx", import.meta.url), "utf8");
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

test("wishlist cards mount with their known favorite state", () => {
  assert.match(catalogCardSource, /initiallySaved\s*=\s*false/);
  assert.match(catalogCardSource, /useState\(initiallySaved\)/);
  assert.match(wishlistSource, /<CatalogCard[^>]*initiallySaved/);
});

test("favorite icon keeps a compact size and subtle hover scale", () => {
  assert.match(stylesheetSource, /\.favorite-heart\s*\{[^}]*width:\s*34px;[^}]*height:\s*34px/);
  assert.match(stylesheetSource, /\.favorite-heart-header\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px/);
  assert.match(stylesheetSource, /\.card-save:hover \.favorite-heart\s*\{[^}]*scale\(1\.05\)/);
});
