import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const appDir = fileURLToPath(new URL("../app", import.meta.url));
const pageSource = await readFile(path.join(appDir, "libro", "[slug]", "page.tsx"), "utf8");

test("la ficha es un Server Component por slug con SEO propio", () => {
  // La ruta /libro/[slug] existe para que crawlers y previews sociales vean
  // metadatos por libro: nada de rellenar la ficha en cliente.
  assert.doesNotMatch(pageSource, /"use client"/);
  assert.match(pageSource, /generateStaticParams/);
  assert.match(pageSource, /generateMetadata/);
  assert.match(pageSource, /application\/ld\+json/);
  assert.match(pageSource, /notFound\(\)/);
});

test("ningún call site conserva la URL vieja libro?slug=", async () => {
  const files = await readdir(appDir, { recursive: true });
  for (const file of files) {
    if (!/\.(tsx?|mjs)$/.test(file)) continue;
    const content = await readFile(path.join(appDir, file), "utf8");
    assert.doesNotMatch(content, /libro\?slug=/, `${file} usa libro?slug= en vez de /libro/[slug]`);
  }
});
