import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../data/catalog/catalog-index.json", import.meta.url), "utf8"));
const details = JSON.parse(await readFile(new URL("../data/catalog/book-details.json", import.meta.url), "utf8"));

test("optimized catalog assets preserve every published book without duplicating long details", () => {
  assert.equal(catalog.length, 360);
  assert.equal(details.length, 360);
  assert.deepEqual(new Set(catalog.map((book) => book.slug)), new Set(details.map((book) => book.slug)));
  assert.ok(catalog.every((book) => !("description" in book) && !("links" in book)));
  assert.ok(details.some((book) => book.description?.length > 300));
  assert.equal(catalog.filter((book) => book.novelty).length, 33);
});

test("catalog identifiers are unique and required display fields are present", () => {
  assert.equal(new Set(catalog.map((book) => book.id)).size, catalog.length);
  assert.equal(new Set(catalog.map((book) => book.slug)).size, catalog.length);
  for (const book of catalog) {
    assert.ok(book.title?.trim(), `missing title on product ${book.id}`);
    assert.ok(book.author?.trim(), `missing author on product ${book.id}`);
    assert.ok(book.image?.startsWith("https://"), `invalid cover on product ${book.id}`);
    assert.equal("price" in book, false, `public price leaked on product ${book.id}`);
  }
});

test("reading plans are extracted with structured plan and level", () => {
  const byPlan = (plan) => catalog.filter((book) => book.plans?.some((entry) => entry.plan === plan));
  assert.ok(byPlan("loran").length >= 190, `loran: ${byPlan("loran").length}`);
  assert.ok(byPlan("trotamundos").length >= 140, `trotamundos: ${byPlan("trotamundos").length}`);
  assert.equal(byPlan("cosmos").length, 17);
  for (const book of catalog) {
    for (const entry of book.plans ?? []) {
      assert.match(entry.plan, /^(loran|trotamundos|cosmos)$/);
      assert.ok(entry.level?.trim(), `nivel vacío en ${book.slug}`);
      assert.doesNotMatch(entry.level, /-/, `nivel sin normalizar en ${book.slug}: ${entry.level}`);
    }
  }
});
