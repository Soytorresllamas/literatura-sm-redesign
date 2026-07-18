import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

function zIndexOf(selector) {
  const rule = css.match(new RegExp(`${selector.replace(/[.\\-]/g, "\\$&")}\\s*{[^}]*}`));
  assert.ok(rule, `regla ${selector} no encontrada`);
  const z = rule[0].match(/z-index:\s*(\d+)/);
  assert.ok(z, `z-index ausente en ${selector}`);
  return Number(z[1]);
}

test("la etiqueta Novedad queda por encima de la portada en la ficha", () => {
  // .detail-label precede a la portada en el DOM (app/libro/page.tsx), así que
  // con z-index empatados la imagen pintaría encima y ocultaría la etiqueta.
  assert.ok(
    zIndexOf(".detail-label") > zIndexOf(".cover-image"),
    "detail-label debe tener z-index mayor que cover-image",
  );
});
