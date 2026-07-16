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
