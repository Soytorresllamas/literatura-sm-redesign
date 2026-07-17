# Ocultar temporalmente favoritos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ocultar todos los puntos de entrada de favoritos con una bandera central, conservar la implementación y los datos locales, y redirigir `/lista` al catálogo.

**Architecture:** `app/lib/features.ts` será la única fuente de disponibilidad visual. Los controles compartidos devolverán `null` con favoritos desactivado, la cuenta omitirá sus accesos y `/lista` será una ruta de servidor que redirige mientras conserva su interfaz cliente en un archivo separado.

**Tech Stack:** TypeScript, React 19, Next.js 16, vinext, Node Test Runner, ESLint.

## Global Constraints

- Conservar `FavoritesProvider`, `useFavorites()` y todas las funciones de persistencia.
- Conservar la clave `sm-literatura:saved-books` y sus datos en `localStorage`.
- Ocultar botones, indicador, contador, enlaces de cuenta y acceso directo a `/lista`.
- Mantener los controles ocultos fuera del árbol HTML y del orden de foco.
- Permitir la reactivación cambiando una sola bandera.
- Excluir de commits todos los archivos duplicados sin seguimiento cuyo nombre termina en ` 2`.

---

### Task 1: Bandera central y controles compartidos

**Files:**
- Create: `app/lib/features.ts`
- Create: `tests/favorites-visibility.test.mjs`
- Modify: `app/components/favorite-button.tsx:3-18`
- Modify: `app/components/favorites-indicator.tsx:3-9`

**Interfaces:**
- Produces: `FAVORITES_UI_ENABLED: false`, constante compartida por componentes y rutas.
- Consumes: `useFavorites()` permanece montado y conserva sus efectos actuales.

- [ ] **Step 1: Escribir la prueba fallida de la bandera y los controles**

Crear `tests/favorites-visibility.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("favorites UI is disabled by one shared feature flag", async () => {
  const [features, button, indicator] = await Promise.all([
    read("../app/lib/features.ts"),
    read("../app/components/favorite-button.tsx"),
    read("../app/components/favorites-indicator.tsx"),
  ]);

  assert.match(features, /export const FAVORITES_UI_ENABLED = false/);
  assert.match(button, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(button, /if \(!FAVORITES_UI_ENABLED\) return null/);
  assert.match(indicator, /import \{ FAVORITES_UI_ENABLED \} from "\.\.\/lib\/features"/);
  assert.match(indicator, /if \(!FAVORITES_UI_ENABLED\) return null/);
});
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo**

Run: `node --test tests/favorites-visibility.test.mjs`

Expected: FAIL con `ENOENT` para `app/lib/features.ts`.

- [ ] **Step 3: Crear la bandera central**

Crear `app/lib/features.ts`:

```ts
export const FAVORITES_UI_ENABLED = false;
```

- [ ] **Step 4: Aplicar la bandera a los controles compartidos**

En `app/components/favorite-button.tsx`, importar la bandera y conservar la llamada al hook antes de la salida vacía:

```tsx
import { FAVORITES_UI_ENABLED } from "../lib/features";

export function FavoriteButton({ book, variant = "card", className = "" }: FavoriteButtonProps) {
  const { isFavorite, ready, toggleFavorite } = useFavorites();
  if (!FAVORITES_UI_ENABLED) return null;

  const active = isFavorite(book);
```

En `app/components/favorites-indicator.tsx`, aplicar el mismo patrón:

```tsx
import { FAVORITES_UI_ENABLED } from "../lib/features";

export function FavoritesIndicator() {
  const { count, ready } = useFavorites();
  if (!FAVORITES_UI_ENABLED) return null;

  const visibleCount = ready ? String(count) : "\u00a0";
```

- [ ] **Step 5: Ejecutar la prueba y confirmar que pasa**

Run: `node --test tests/favorites-visibility.test.mjs`

Expected: PASS, 1 test.

- [ ] **Step 6: Confirmar que el proveedor y la persistencia siguen conectados**

Run: `node --test tests/favorites-provider.test.mjs`

Expected: PASS en todas las pruebas del proveedor.

- [ ] **Step 7: Commit de la bandera y controles**

```bash
git add app/lib/features.ts app/components/favorite-button.tsx app/components/favorites-indicator.tsx tests/favorites-visibility.test.mjs
git commit -m "Oculta controles de favoritos con bandera central"
```

### Task 2: Cuenta y ruta de lista

**Files:**
- Create: `app/lista/wishlist-page-content.tsx`
- Modify: `app/lista/page.tsx:1-15`
- Modify: `app/mi-cuenta/page.tsx:1-6`
- Modify: `tests/favorites-consumers.test.mjs:5-29`
- Modify: `tests/favorites-visibility.test.mjs`

**Interfaces:**
- Consumes: `FAVORITES_UI_ENABLED` de `app/lib/features.ts`.
- Produces: `WishlistPageContent(): JSX.Element`, interfaz cliente preservada para una reactivación posterior.
- Produces: `/lista` responde con redirección 307 hacia `/seccion` cuando la bandera está desactivada.

- [ ] **Step 1: Ampliar la prueba con cuenta y ruta**

Añadir a `tests/favorites-visibility.test.mjs`:

```js
test("account and wishlist route honor the favorites flag", async () => {
  const [account, wishlistRoute, wishlistContent] = await Promise.all([
    read("../app/mi-cuenta/page.tsx"),
    read("../app/lista/page.tsx"),
    read("../app/lista/wishlist-page-content.tsx"),
  ]);

  assert.match(account, /FAVORITES_UI_ENABLED &&/);
  assert.match(wishlistRoute, /if \(!FAVORITES_UI_ENABLED\) redirect\("\/seccion"\)/);
  assert.match(wishlistRoute, /<WishlistPageContent \/>/);
  assert.match(wishlistContent, /useFavorites/);
  assert.match(wishlistContent, /sm-literatura|favoriteIds/);
});
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo**

Run: `node --test tests/favorites-visibility.test.mjs`

Expected: FAIL con `ENOENT` para `app/lista/wishlist-page-content.tsx`.

- [ ] **Step 3: Preservar la interfaz cliente de la lista**

Mover el contenido actual de `app/lista/page.tsx` a `app/lista/wishlist-page-content.tsx` y cambiar la exportación:

```tsx
"use client";

import { CatalogCard } from "../components/catalog-card";
import { catalogBooks } from "../components/book-data";
import { useFavorites } from "../components/favorites-provider";
import { CatalogPageSkeleton } from "../components/loading-skeletons";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export function WishlistPageContent() {
  const { favoriteIds, ready } = useFavorites();
  const favoriteSet = new Set(favoriteIds);
  const books = catalogBooks.filter((book) => favoriteSet.has(book.slug));
  if (!ready) return <CatalogPageSkeleton />;

  return (
    <ScreenShell>
      <ScreenHero
        eyebrow="Tu biblioteca personal"
        title={<>Libros para <em>volver.</em></>}
        intro="Guarda títulos para leer después, compartir con tu equipo o preparar tus próximas lecturas."
      />
      <section className="screen-content">
        <div className="list-toolbar">
          <p><strong>{books.length}</strong> {books.length === 1 ? "libro guardado" : "libros guardados"}</p>
          <button className="outline-action" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Compartir lista ↗</button>
        </div>
        {books.length ? (
          <div className="section-book-grid">
            {books.map((book) => <CatalogCard key={book.slug} book={book} />)}
          </div>
        ) : (
          <div className="empty-state">Aún no tienes libros guardados. Explora el catálogo y añade tus próximos descubrimientos.</div>
        )}
      </section>
    </ScreenShell>
  );
}
```

- [ ] **Step 4: Convertir `/lista` en una envoltura de servidor**

Reemplazar `app/lista/page.tsx` por:

```tsx
import { redirect } from "next/navigation";
import { FAVORITES_UI_ENABLED } from "../lib/features";
import { WishlistPageContent } from "./wishlist-page-content";

export default function WishlistPage() {
  if (!FAVORITES_UI_ENABLED) redirect("/seccion");
  return <WishlistPageContent />;
}
```

- [ ] **Step 5: Condicionar los dos accesos de la cuenta**

Importar `FAVORITES_UI_ENABLED` en `app/mi-cuenta/page.tsx` y envolver por separado el enlace de navegación y la tarjeta:

```tsx
import { FAVORITES_UI_ENABLED } from "../lib/features";
```

```tsx
{FAVORITES_UI_ENABLED && <a href="/lista">Mi lista</a>}
```

```tsx
{FAVORITES_UI_ENABLED && (
  <div className="account-card">
    <span className="eyebrow">Tu lista</span>
    <strong>Lecturas guardadas</strong>
    <span>Organiza y comparte tus próximos descubrimientos.</span>
    <a className="arrow-link" href="/lista">Ver lista ↗</a>
  </div>
)}
```

- [ ] **Step 6: Actualizar la prueba de consumidores preservados**

En `tests/favorites-consumers.test.mjs`, añadir `../app/lista/wishlist-page-content.tsx` a `paths`, mantener `app/lista/page.tsx`, y cambiar las aserciones de la lista por:

```js
assert.match(sources[3], /redirect\("\/seccion"\)/);
assert.match(sources[4], /useFavorites/);
assert.match(sources[5], /<FavoriteButton book=\{book\} variant="detail" \/>/);
```

La ruta de libro pasa a ser `sources[5]` después de insertar el contenido de lista antes de ella.

- [ ] **Step 7: Ejecutar las pruebas de visibilidad y consumidores**

Run: `node --test tests/favorites-visibility.test.mjs tests/favorites-consumers.test.mjs`

Expected: PASS en todas las pruebas.

- [ ] **Step 8: Commit de cuenta y ruta**

```bash
git add app/lista/page.tsx app/lista/wishlist-page-content.tsx app/mi-cuenta/page.tsx tests/favorites-consumers.test.mjs tests/favorites-visibility.test.mjs
git commit -m "Oculta accesos y ruta de favoritos"
```

### Task 3: Verificación renderizada y publicación

**Files:**
- Modify: `tests/rendered-html.test.mjs:12-66`

**Interfaces:**
- Consumes: build de vinext en `dist/server/index.js`.
- Produces: evidencia automatizada de que la interfaz publicada carece de puntos visibles de favoritos.

- [ ] **Step 1: Cambiar las expectativas renderizadas a ausencia de favoritos**

En la prueba del home de `tests/rendered-html.test.mjs`, reemplazar las aserciones positivas de favoritos por:

```js
assert.doesNotMatch(html, /Lista de deseos/);
assert.doesNotMatch(html, /aria-pressed=/);
assert.doesNotMatch(html, /favorite-button|save-button/);
```

En la prueba de ficha, reemplazar las aserciones positivas por:

```js
assert.doesNotMatch(html, /Guardar en mi lista|Lista de deseos/);
assert.doesNotMatch(html, /aria-pressed=/);
assert.doesNotMatch(html, /favorite-button|save-button/);
```

Añadir pruebas para cuenta y lista:

```js
test("account omits every favorites entry point", async () => {
  const response = await render("/mi-cuenta");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /href="\/lista"/);
  assert.doesNotMatch(html, /Mi lista|Ver lista|Lecturas guardadas/);
});

test("wishlist route redirects to the catalog while favorites are hidden", async () => {
  const response = await render("/lista");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/seccion");
});
```

- [ ] **Step 2: Construir y ejecutar las pruebas renderizadas**

Run: `npm run build && node --test tests/rendered-html.test.mjs`

Expected: build correcto y todas las pruebas renderizadas en PASS.

- [ ] **Step 3: Ejecutar lint y suite completa**

Run: `npm run lint`

Expected: exit 0.

Run: `npm test`

Expected: build correcto y todas las pruebas en PASS.

- [ ] **Step 4: Revisar el alcance del diff**

Run: `git diff --check && git status --short`

Expected: sin errores de espacios; únicamente archivos del plan modificados, además de los duplicados ` 2` sin seguimiento ya existentes.

- [ ] **Step 5: Commit de verificación renderizada**

```bash
git add tests/rendered-html.test.mjs
git commit -m "Verifica favoritos ocultos en HTML"
```

- [ ] **Step 6: Push y despliegue**

Run: `git push origin main`

Expected: `main` actualizado en GitHub.

Crear un worktree limpio desde el nuevo `HEAD`, copiar únicamente `.vercel/project.json` y ejecutar `vercel deploy --prod --yes` desde ese worktree para excluir los duplicados ` 2`.

Expected: despliegue `Ready` en `https://literatura-sm-redesign.vercel.app`.

- [ ] **Step 7: Smoke test público**

Comprobar en producción:

- home sin corazones ni contador;
- `/seccion` sin botones de favoritos;
- una ficha de libro sin “Guardar en mi lista”;
- `/mi-cuenta` sin enlaces a `/lista`;
- `/lista` redirige a `/seccion`;
- consola del navegador sin errores durante estos recorridos.

Expected: todos los recorridos cumplen el estado oculto y la navegación restante funciona.
