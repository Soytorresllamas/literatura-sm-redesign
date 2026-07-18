import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("book covers keep a skeleton visible until the real image loads", async () => {
  const component = await source("app/components/book-cover.tsx");

  assert.match(component, /cover-skeleton/);
  assert.match(component, /onLoad=\{\(\) => setImageLoaded\(true\)\}/);
  assert.match(component, /aria-busy=\{showImage && !imageLoaded\}/);
});

test("route transitions provide catalog and book-detail skeletons", async () => {
  const [rootLoading, catalogLoading, bookLoading] = await Promise.all([
    source("app/loading.tsx"),
    source("app/seccion/loading.tsx"),
    source("app/libro/[slug]/loading.tsx"),
  ]);

  assert.match(rootLoading, /PageLoadingSkeleton/);
  assert.match(catalogLoading, /CatalogPageSkeleton/);
  assert.match(bookLoading, /BookDetailPageSkeleton/);
});

test("skeleton shimmer respects reduced-motion preferences", async () => {
  const css = await source("app/globals.css");

  assert.match(css, /@keyframes skeleton-shimmer/);
  assert.match(css, /prefers-reduced-motion:[^)]+\)[^{]*\{[^}]*\.skeleton::after[^}]*animation:\s*none/s);
});
