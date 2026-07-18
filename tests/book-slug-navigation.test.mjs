import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/libro/page.tsx", import.meta.url), "utf8");

test("la ficha deriva su slug de useSearchParams para navegaciones en la misma ruta", () => {
  // Los enlaces de "También puede gustarte" navegan /libro → /libro en cliente:
  // el componente no se remonta, así que un efecto de montaje que lee
  // window.location.search se queda con el slug viejo y la ficha no cambia.
  assert.match(source, /useSearchParams/, "el slug debe venir de useSearchParams (reactivo)");
  assert.doesNotMatch(
    source,
    /window\.location\.search/,
    "no leer el slug con window.location.search: no reacciona a navegaciones cliente",
  );
});
