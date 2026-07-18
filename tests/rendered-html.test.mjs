import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import test, { before, after } from "node:test";

const featuresSource = await readFile(new URL("../app/lib/features.ts", import.meta.url), "utf8");
const flagMatch = featuresSource.match(/export const FAVORITES_UI_ENABLED\s*=\s*(true|false)\s*;/);
assert.ok(flagMatch, "FAVORITES_UI_ENABLED must be exported as one boolean literal");
const favoritesUiEnabled = flagMatch[1] === "true";

// Rendered against the native Next.js production server (`next start`), which is
// exactly what Vercel serves. The catalog is fully static, so a single booted
// server answers every route below.
const PORT = Number(process.env.TEST_PORT ?? 3987);
const BASE = `http://localhost:${PORT}`;
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

let server;

before(async () => {
  // Invoke the local Next binary directly with Node instead of `npx`, which is
  // not resolvable on PATH under `node --test`.
  server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
    detached: true,
  });

  const deadline = Date.now() + 90_000;
  for (;;) {
    try {
      const probe = await fetch(BASE, { redirect: "manual" });
      await probe.arrayBuffer();
      break;
    } catch {
      if (Date.now() > deadline) throw new Error("next start no respondió a tiempo");
      await sleep(500);
    }
  }
});

after(() => {
  if (server?.pid) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }
});

async function render(path = "/") {
  return fetch(`${BASE}${path}`, {
    redirect: "manual",
    headers: { accept: "text/html" },
  });
}

function visibleMarkup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

const favoritesDomMarkers = /\bclass="[^"]*\b(?:favorite-button|save-button)\b[^"]*"|\bdata-favorite-heart=/;

function assertFavoritesVisibility(html, textMarkers = /Lista de deseos/) {
  const visibleHtml = visibleMarkup(html);
  if (favoritesUiEnabled) {
    assert.match(visibleHtml, favoritesDomMarkers);
    assert.match(visibleHtml, textMarkers);
  } else {
    assert.doesNotMatch(visibleHtml, favoritesDomMarkers);
    assert.doesNotMatch(visibleHtml, textMarkers);
  }
  return visibleHtml;
}

test("server-renders the literature catalog redesign", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /SM Literatura \| Historias para cada momento/);
  assert.match(html, /Encuentra una historia para/);
  assert.match(html, /sm-logo\.png/);
  assert.ok((html.match(/sm-logo\.png/g) ?? []).length >= 2);
  assert.match(html, /favicon\.png/);
  assert.match(html, /Busca por título, autor o ISBN/);
  assert.match(html, /Historias que abren mundos/);
  assert.match(html, /Elige una lectura para cada etapa/);
  assert.match(html, /historias disponibles/);
  assert.match(html, /Lo más reciente de Literatura SM/);
  assert.match(html, /Novedades editoriales/);
  assert.match(html, /¡Casi medio año! Edición especial 30 aniversario/);
  assert.match(html, /Arma tu plan lector/);
  assert.match(html, /Para la escuela/);
  assertFavoritesVisibility(html);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is building the first version/);
  assert.doesNotMatch(html, /href="\/carrito"|Agregar al carrito|Checkout|Confirmar y pagar/);
  assert.ok(html.indexOf("Novedades editoriales") < html.indexOf("Empieza por aquí"));
});

test("book detail renders extended data without commerce controls", async () => {
  const response = await render("/libro?slug=casi-medio-ano-edicion-especial-30-aniversario");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /¡Casi medio año! Edición especial 30 aniversario/);
  assertFavoritesVisibility(html, /Guardar en mi lista|Lista de deseos/);
  assert.doesNotMatch(html, /venta en línea|Agregar al carrito|Ir al carrito|detail-price|detail-availability/);
});

test("catalog retains its content and follows favorites visibility", async () => {
  const response = await render("/seccion");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Catálogo completo/);
  assert.match(html, /Historias para <em>cada lector\.<\/em>/);
  assert.match(html, /Explora \d+ títulos por edad, tema, autor, colección o ISBN/);
  assertFavoritesVisibility(html);
});

test("new releases retain their content and follow favorites visibility", async () => {
  const response = await render("/novedades");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Lo más reciente/);
  assert.match(html, /Novedades para <em>descubrir\.<\/em>/);
  assert.match(html, /Acaba de llegar/);
  assert.match(html, /Ver todo el catálogo/);
  assertFavoritesVisibility(html);
});

test("checkout route redirects to the catalog while commerce is hidden", async () => {
  // The checkout page calls redirect("/seccion"). Next statically prerenders it,
  // so production (next start / Vercel) serves a 200 with a meta-refresh to the
  // catalog rather than an HTTP 307.
  const response = await render("/checkout");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /http-equiv="refresh"[^>]*content="[^"]*url=\/seccion"/);
});

test("account retains its navigation and follows favorites visibility", async () => {
  const response = await render("/mi-cuenta");
  assert.equal(response.status, 200);
  const visibleHtml = visibleMarkup(await response.text());
  assert.match(visibleHtml, /Hola, <em>Mariana\.<\/em>/);
  assert.match(visibleHtml, /href="\/mi-cuenta"[^>]*>Resumen/);
  assert.match(visibleHtml, /href="\/recursos"[^>]*>Recursos/);
  assert.match(visibleHtml, /Datos de cuenta/);
  assert.match(visibleHtml, /Recursos de lectura/);
  assert.match(visibleHtml, /Explorar recursos/);
  if (favoritesUiEnabled) {
    assert.match(visibleHtml, /href="\/lista"/);
    assert.match(visibleHtml, /Mi lista|Ver lista|Lecturas guardadas/);
  } else {
    assert.doesNotMatch(visibleHtml, /href="\/lista"/);
    assert.doesNotMatch(visibleHtml, /Mi lista|Ver lista|Lecturas guardadas/);
  }
});

test("wishlist route follows the configured favorites visibility", async () => {
  const response = await render("/lista");
  if (favoritesUiEnabled) {
    assert.equal(response.status, 200);
  } else {
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), BASE).pathname, "/seccion");
  }
});
