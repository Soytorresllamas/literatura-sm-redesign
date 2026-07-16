import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("keeps supporting text at a legible minimum size", () => {
  const declaredSizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map((match) => Number(match[1]));
  const undersized = declaredSizes.filter((size) => size < 12);

  assert.deepEqual(undersized, [], `Found undersized text declarations: ${undersized.join(", ")}px`);
});

test("sets a comfortable reading baseline for the site", () => {
  assert.match(css, /body\s*\{[^}]*font-size:\s*17px;/);
  assert.match(css, /body\s*\{[^}]*line-height:\s*1\.55;/);
});
