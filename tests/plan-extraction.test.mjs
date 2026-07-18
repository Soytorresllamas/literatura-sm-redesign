import assert from "node:assert/strict";
import test from "node:test";
import { extractPlans } from "../scripts/build-catalog-assets.mjs";

const bookWith = (categories, editorial = {}) => ({ categories, editorial });

test("extracts plan levels regardless of category casing", () => {
  assert.deepEqual(extractPlans(bookWith(["LORAN > Aventura"])), [{ plan: "loran", level: "Aventura" }]);
  assert.deepEqual(extractPlans(bookWith(["trotamundos > Nivel 3"])), [{ plan: "trotamundos", level: "Nivel 3" }]);
});

test("recognizes bare plan categories regardless of casing and stray spaces", () => {
  assert.deepEqual(extractPlans(bookWith(["LORAN"])), [{ plan: "loran", level: "Multinivel" }]);
  assert.deepEqual(extractPlans(bookWith([" trotamundos "])), [{ plan: "trotamundos", level: "Multinivel" }]);
});

test("keeps the canonical casing working as before", () => {
  assert.deepEqual(extractPlans(bookWith(["Loran > Nivel 1", "Trotamundos"])), [
    { plan: "loran", level: "Nivel 1" },
    { plan: "trotamundos", level: "Multinivel" },
  ]);
  assert.deepEqual(extractPlans(bookWith(["Otra categoría"])), []);
});
