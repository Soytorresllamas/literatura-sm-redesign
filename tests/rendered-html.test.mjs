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

test("server-renders the literature catalog redesign", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /SM Literatura \| Historias para cada momento/);
  assert.match(html, /Encuentra una historia para/);
  assert.match(html, /sm-logo\.png/);
  assert.match(html, /favicon\.png/);
  assert.match(html, /Busca por título, autor o ISBN/);
  assert.match(html, /Historias que abren mundos/);
  assert.match(html, /¡Casi medio año! Edición especial 30 aniversario/);
  assert.match(html, /Arma tu plan lector/);
  assert.match(html, /Para la escuela/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is building the first version/);
});

test("book detail renders extended data while commerce remains gated", async () => {
  const response = await render("/libro?slug=casi-medio-ano-edicion-especial-30-aniversario");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /¡Casi medio año! Edición especial 30 aniversario/);
  assert.match(html, /La venta en línea está en preparación/);
  assert.doesNotMatch(html, /Agregar al carrito|detail-price/);
});

test("checkout route exposes the pricing review gate", async () => {
  const response = await render("/checkout");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Checkout en/);
  assert.match(html, /validando precios, inventario, envío y medios de pago/);
  assert.doesNotMatch(html, /Confirmar y pagar/);
});
