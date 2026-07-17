import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function visibleMarkup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

const favoritesDomMarkers = /\bclass="[^"]*\b(?:favorite-button|save-button)\b[^"]*"|\bdata-favorite-heart=/;

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
  const visibleHtml = visibleMarkup(html);
  assert.doesNotMatch(visibleHtml, /Lista de deseos/);
  assert.doesNotMatch(visibleHtml, favoritesDomMarkers);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is building the first version/);
  assert.doesNotMatch(html, /href="\/carrito"|Agregar al carrito|Checkout|Confirmar y pagar/);
  assert.ok(html.indexOf("Novedades editoriales") < html.indexOf("Empieza por aquí"));
});

test("book detail renders extended data without commerce controls", async () => {
  const response = await render("/libro?slug=casi-medio-ano-edicion-especial-30-aniversario");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /¡Casi medio año! Edición especial 30 aniversario/);
  const visibleHtml = visibleMarkup(html);
  assert.doesNotMatch(visibleHtml, /Guardar en mi lista|Lista de deseos/);
  assert.doesNotMatch(visibleHtml, favoritesDomMarkers);
  assert.doesNotMatch(html, /venta en línea|Agregar al carrito|Ir al carrito|detail-price|detail-availability/);
});

test("checkout route redirects to the catalog while commerce is hidden", async () => {
  const response = await render("/checkout");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/seccion");
});

test("account omits every favorites entry point", async () => {
  const response = await render("/mi-cuenta");
  assert.equal(response.status, 200);
  const visibleHtml = visibleMarkup(await response.text());
  assert.doesNotMatch(visibleHtml, /href="\/lista"/);
  assert.doesNotMatch(visibleHtml, /Mi lista|Ver lista|Lecturas guardadas/);
});

test("wishlist route redirects to the catalog while favorites are hidden", async () => {
  const response = await render("/lista");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/seccion");
});
