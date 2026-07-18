# Mejoras: favoritos sutiles, planes lectores, refactor, 404 y doc headless — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reactivar favoritos con un corazón sutil, extraer planes lectores (Loran/Trotamundos/Cosmos) de los datos de WordPress y mostrarlos como carruseles con enlace al catálogo filtrado, migrar la navegación a `next/link`, agregar una 404 divertida y documentar la migración headless a WordPress.

**Architecture:** App Next.js 16 (App Router, todo prerenderizado estático) desplegada en Vercel. Los datos del catálogo viven en `data/catalog/catalog-index.json`, generado por `scripts/build-catalog-assets.mjs` desde `data/wordpress/books.json` (privado, solo local). Los tests usan el runner nativo de Node contra `next start`.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind 4 (CSS artesanal en `app/globals.css`), `node --test`.

## Global Constraints

- Node `>=22.13.0`. No agregar dependencias nuevas.
- Todo el copy visible en español (es-MX). Mensajes de commit en español imperativo, estilo del repo ("Agrega…", "Corrige…"), sin prefijos convencionales.
- Las páginas deben seguir siendo prerenderizables estáticamente: nada de `Date.now()`/aleatoriedad en render, ni `searchParams` en Server Components (el patrón del repo lee `window.location.search` en cliente tras montar; ver `app/categoria/page.tsx`).
- Área táctil de controles de favoritos ≥ 48px (los tests lo verifican).
- `FAVORITES_UI_ENABLED` es la única bandera; los tests se parametrizan leyéndola del fuente.
- `data/wordpress/books.json` está gitignorado pero existe localmente; `data/catalog/catalog-index.json` SÍ se versiona y debe commitearse regenerado.
- Tras cada tarea: `npm test` (build + suite completa) y `npm run lint` en verde antes de commitear.

---

### Task 1: Pipeline de planes lectores (datos)

**Files:**
- Modify: `scripts/build-catalog-assets.mjs` (función nueva + campo en el mapeo de catálogo)
- Modify: `app/components/book-data.ts` (tipos y helpers de planes)
- Modify: `tests/catalog-data.test.mjs` (test nuevo)
- Regenerate: `data/catalog/catalog-index.json` (via `npm run catalog:build`)

**Interfaces:**
- Consumes: categorías crudas de WordPress con formas `"Loran > Primaria 1"`, `"Loran Preescolar"`, `"Trotamundos Primaria-5"`, `"Trotamundos > Multinivel"`, y `editorial.schoolLevel === "Bachillerato"` para Cosmos.
- Produces: en cada libro de `catalog-index.json`, campo opcional `plans: { plan: "loran"|"trotamundos"|"cosmos"; level: string }[]`. En `book-data.ts`: tipos `ReadingPlanId`, `BookPlanEntry`, `ReadingPlan`; constante `readingPlans: ReadingPlan[]` (con `id`, `name`, `tagline`, `books`, `levels`); función `getReadingPlan(id)`.

- [ ] **Step 1: Escribir el test que falla**

Agregar al final de `tests/catalog-data.test.mjs`:

```js
test("reading plans are extracted with structured plan and level", () => {
  const byPlan = (plan) => catalog.filter((book) => book.plans?.some((entry) => entry.plan === plan));
  assert.ok(byPlan("loran").length >= 190, `loran: ${byPlan("loran").length}`);
  assert.ok(byPlan("trotamundos").length >= 140, `trotamundos: ${byPlan("trotamundos").length}`);
  assert.equal(byPlan("cosmos").length, 17);
  for (const book of catalog) {
    for (const entry of book.plans ?? []) {
      assert.match(entry.plan, /^(loran|trotamundos|cosmos)$/);
      assert.ok(entry.level?.trim(), `nivel vacío en ${book.slug}`);
      assert.doesNotMatch(entry.level, /-/, `nivel sin normalizar en ${book.slug}: ${entry.level}`);
    }
  }
});
```

- [ ] **Step 2: Verificar que falla**

Run: `node --test tests/catalog-data.test.mjs`
Expected: FAIL — `loran: 0` (el campo `plans` no existe todavía).

- [ ] **Step 3: Implementar la extracción en el script**

En `scripts/build-catalog-assets.mjs`, después de la función `selectSeries` agregar:

```js
const PLAN_LEVEL_PATTERN = /^(Loran|Trotamundos)(?:\s*>\s*|\s+)(.+)$/;

function normalizeLevel(value) {
  const level = value.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (/^multinivel(?: multinivel)?$/i.test(level)) return "Multinivel";
  return titleCase(level.toLowerCase());
}

function extractPlans(book) {
  const plans = new Map();
  for (const category of book.categories) {
    const match = PLAN_LEVEL_PATTERN.exec(category);
    if (!match) continue;
    const plan = match[1].toLowerCase();
    const level = normalizeLevel(match[2]);
    plans.set(`${plan}|${level}`, { plan, level });
  }
  for (const plan of ["Loran", "Trotamundos"]) {
    const id = plan.toLowerCase();
    if (book.categories.includes(plan) && ![...plans.values()].some((entry) => entry.plan === id)) {
      plans.set(`${id}|Multinivel`, { plan: id, level: "Multinivel" });
    }
  }
  if (book.editorial.schoolLevel === "Bachillerato") {
    const level = titleCase((book.editorial.schoolGrade || "Bachillerato").toLowerCase());
    plans.set(`cosmos|${level}`, { plan: "cosmos", level });
  }
  return [...plans.values()].sort((a, b) => a.plan.localeCompare(b.plan) || a.level.localeCompare(b.level, "es"));
}
```

En el mapeo `const catalog = published.map((book) => { … })`, dentro del objeto
`optionalEntries({ … })`, agregar tras `format: book.editorial.format,`:

```js
    plans: extractPlans(book).length ? extractPlans(book) : undefined,
```

(Para no llamar dos veces, asignar antes `const plans = extractPlans(book);` al
inicio del callback y usar `plans: plans.length ? plans : undefined`.)

- [ ] **Step 4: Regenerar el catálogo y verificar el test**

Run: `npm run catalog:build && node --test tests/catalog-data.test.mjs`
Expected: PASS (4 tests de catálogo). Verificar en el diff de
`data/catalog/catalog-index.json` que hay libros con `"plans"`.

- [ ] **Step 5: Exponer tipos y helpers en `book-data.ts`**

En `app/components/book-data.ts`: agregar al tipo `BookRecord`, después de
`format?: string;`:

```ts
  plans?: BookPlanEntry[];
```

Antes de `export type BookRecord` agregar:

```ts
export type ReadingPlanId = "loran" | "trotamundos" | "cosmos";
export type BookPlanEntry = { plan: ReadingPlanId; level: string };
```

Al final del archivo agregar:

```ts
export type ReadingPlan = {
  id: ReadingPlanId;
  name: string;
  tagline: string;
  books: BookRecord[];
  levels: { name: string; count: number }[];
};

const planMeta: { id: ReadingPlanId; name: string; tagline: string }[] = [
  { id: "loran", name: "Loran", tagline: "Lecturas graduadas de preescolar a secundaria." },
  { id: "trotamundos", name: "Trotamundos", tagline: "Literatura que inspira a los lectores del futuro." },
  { id: "cosmos", name: "Cosmos", tagline: "Historias de bachillerato para lectores que despegan." },
];

export const readingPlans: ReadingPlan[] = planMeta.map((meta) => {
  const books = catalogBooks.filter((book) => book.plans?.some((entry) => entry.plan === meta.id));
  const levels = countFacet(books.flatMap((book) => (book.plans ?? [])
    .filter((entry) => entry.plan === meta.id)
    .map((entry) => entry.level)));
  return { ...meta, books, levels };
});

export function getReadingPlan(id: string | null | undefined) {
  return readingPlans.find((plan) => plan.id === id);
}
```

- [ ] **Step 6: Suite completa y commit**

Run: `npm test && npm run lint`
Expected: 34 tests PASS, lint sin errores.

```bash
git add scripts/build-catalog-assets.mjs app/components/book-data.ts tests/catalog-data.test.mjs data/catalog/catalog-index.json
git commit -m "Extrae planes lectores estructurados del catálogo"
```

---

### Task 2: Navegación con next/link y JSX legible

**Files:**
- Modify: `app/components/section-header.tsx` (Link + estado activo real con `usePathname`)
- Modify: `app/components/screen-components.tsx`, `app/components/catalog-card.tsx`, `app/components/novelty-carousel.tsx`, `app/components/favorites-indicator.tsx`, `app/components/site-footer.tsx`, `app/components/catalog-explorer.tsx`
- Modify: `app/page.tsx` y todas las páginas con `<a href="/...">` internos (localizarlas con grep, ver Step 3)

**Interfaces:**
- Consumes: nada nuevo.
- Produces: HTML renderizado idéntico (`Link` emite `<a href>`); los tests existentes de HTML son la red de seguridad. El estado activo del header pasa a depender de la ruta real.

- [ ] **Step 1: Migrar `section-header.tsx` (archivo completo)**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./brand-logo";
import { FavoritesIndicator } from "./favorites-indicator";

const NAV_LINKS = [
  { href: "/seccion", label: "Explorar libros" },
  { href: "/planes-lectores", label: "Planes lectores" },
  { href: "/recursos", label: "Recursos" },
  { href: "/novedades", label: "Novedades" },
];

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand brand-header" href="/" aria-label="SM Literatura, inicio">
        <BrandLogo priority />
      </Link>
      <nav className="main-nav" aria-label="Navegación principal">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : undefined}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        className="mobile-menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        Menú <span>{open ? "×" : "＋"}</span>
      </button>
      <div className="header-actions">
        <Link className="text-button" href="/planes-lectores">Soy docente</Link>
        <FavoritesIndicator />
      </div>
      {open && (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil">
          {[...NAV_LINKS, { href: "/buscar", label: "Buscar" }].map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
```

Nota: desaparece el comentario `/* eslint-disable @next/next/no-html-link-for-pages */`.

- [ ] **Step 2: Migrar los componentes compartidos**

`screen-components.tsx` (archivo completo, sin el eslint-disable):

```tsx
import Link from "next/link";
import { SectionHeader } from "./section-header";
import { SiteFooter } from "./site-footer";

export function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <SectionHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function ScreenHero({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro: string }) {
  return (
    <section className="screen-hero">
      <div className="breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <strong aria-current="page">{typeof title === "string" ? title : eyebrow}</strong>
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
  );
}

export function Notice({ children, tone = "yellow" }: { children: React.ReactNode; tone?: "yellow" | "green" }) {
  return <div className={`screen-notice screen-notice-${tone}`}>{children}</div>;
}
```

`catalog-card.tsx` (archivo completo):

```tsx
"use client";

import Link from "next/link";
import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";
import { FavoriteButton } from "./favorite-button";

export function CatalogCard({ book }: { book: BookRecord }) {
  return (
    <article className="book-card">
      <FavoriteButton book={book} />
      <Link href={`/libro?slug=${book.slug}`} className="card-main-link">
        <span className="book-click">
          <BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} />
        </span>
        <span className="book-card-info">
          <span className="book-tag">{book.theme}</span>
          <span className="book-card-title">{book.title}</span>
          <span className="book-card-author">{book.author}</span>
          <span className="book-meta">
            <span>{book.age}</span>
            <span>{book.level}</span>
          </span>
          <span className="card-detail-link">Ver ficha <span>↗</span></span>
        </span>
      </Link>
    </article>
  );
}
```

`novelty-carousel.tsx`: además de desminificar el JSX (multilínea, misma
estructura y clases), (a) importar `Link` de `next/link` y `useRouter` de
`next/navigation`, (b) sustituir `window.location.assign(\`/libro?slug=${book.slug}\`)`
por `router.push(\`/libro?slug=${book.slug}\`)` con `const router = useRouter();`
dentro del componente, y (c) convertir los `<a href="/novedades">` y
`<a href={\`/libro?slug=…\`}>` en `Link`. No cambiar clases, aria-* ni textos:
los tests de HTML los verifican.

`favorites-indicator.tsx`: convertir el `<a className="save-button" href="/lista">`
en `<Link className="save-button" href="/lista" …>` (mismo aria-label).

- [ ] **Step 3: Migrar el resto de páginas con grep**

Run: `grep -rln '<a href="/' app --include='*.tsx'`

Por cada archivo listado (esperados: `app/page.tsx`, `site-footer.tsx`,
páginas de `libro`, `autor`, `autores`, `buscar`, `novedades`, `mi-cuenta`,
`lista/wishlist-page-content`, etc.): agregar `import Link from "next/link";`
y transformar cada `<a href="/…">…</a>` interno en `<Link href="/…">…</Link>`.
Los enlaces externos (`https://…`) y los `mailto:` quedan como `<a>`.
Aprovechar para desminificar el JSX de los archivos tocados.

- [ ] **Step 4: Verificar que no queda ningún ancla interna**

Run: `grep -rn '<a href="/' app --include='*.tsx'`
Expected: sin resultados.

Run: `grep -rn "eslint-disable @next/next/no-html-link-for-pages" app`
Expected: sin resultados.

- [ ] **Step 5: Suite completa y commit**

Run: `npm test && npm run lint`
Expected: 34 tests PASS (el HTML renderizado no cambió), lint sin errores.

```bash
git add app
git commit -m "Migra la navegación interna a next/link"
```

---

### Task 3: Reactivar favoritos con corazón sutil

**Files:**
- Modify: `app/lib/features.ts` (bandera a `true`)
- Modify: `app/globals.css` (tamaños y colores del corazón)
- Modify: `app/components/favorite-heart.tsx` (trazo fino)
- Posible ajuste: `tests/favorite-heart-animation.test.mjs` si fija el grosor anterior

**Interfaces:**
- Consumes: `FavoriteButton`/`FavoritesIndicator` existentes (no cambian de API).
- Produces: favoritos visibles en toda la app; corazón discreto: neutro en reposo, coral en hover/foco/activo.

- [ ] **Step 1: Encender la bandera**

`app/lib/features.ts`:

```ts
export const FAVORITES_UI_ENABLED = true;
```

- [ ] **Step 2: Correr la suite para ver el estado real**

Run: `npm test`
Expected: PASS — los tests leen la bandera del fuente y verifican presencia.
Si algún assert falla por fijar comportamiento "oculto", anotarlo: no debe
haber ninguno (ya están parametrizados). El redirect `/lista → /seccion`
desaparece de `next.config.ts` automáticamente (es condicional a la bandera).

- [ ] **Step 3: Afinar el trazo del corazón**

En `app/components/favorite-heart.tsx`, cambiar `strokeWidth="6"` por
`strokeWidth="1.5"` (con `vector-effect: non-scaling-stroke` ya presente en
CSS, el valor equivale a píxeles de pantalla).

- [ ] **Step 4: Reducir tamaños y apagar el color en reposo**

En `app/globals.css` sustituir el bloque del corazón (líneas con
`.favorite-heart`, `.favorite-heart-icon`, `.favorite-heart-header`) por:

```css
.favorite-heart { position: relative; display: inline-grid; place-items: center; width: 20px; height: 20px; flex: 0 0 auto; transform-origin: center; transition: transform .18s ease; will-change: transform; }
.favorite-heart-icon { display: block; width: 100%; height: 100%; overflow: visible; color: var(--muted); transition: color .18s ease; }
.favorite-heart-icon.is-filled, .favorite-button:hover .favorite-heart-icon, .favorite-button:focus-visible .favorite-heart-icon, .save-button:hover .favorite-heart-icon { color: var(--coral); }
.favorite-heart-icon path { vector-effect: non-scaling-stroke; }
.favorite-heart-header { width: 18px; height: 18px; }
.favorite-heart-detail { width: 20px; height: 20px; }
```

Y en `.favorite-button-card`, bajar el protagonismo del chip conservando los
48px táctiles: sustituir la regla por

```css
.favorite-button-card { position: absolute; z-index: 4; top: 4px; right: 4px; display: grid; place-items: center; width: 48px; height: 48px; padding: 14px; border: 0; border-radius: 50%; background: transparent; pointer-events: auto; touch-action: manipulation; }
.favorite-button-card .favorite-heart-icon:not(.is-filled) { filter: drop-shadow(0 1px 2px #fffdf8); }
```

(El fondo blanco con sombra desaparece; el corazón fino con halo sutil basta.)

- [ ] **Step 5: Verificar y ajustar el test de animación si fija el grosor**

Run: `node --test tests/favorite-heart-animation.test.mjs`
Si un assert espera `strokeWidth="6"`, actualizarlo a `"1.5"` manteniendo los
asserts de SVG estable, hit target 48px y movimiento contenido.

- [ ] **Step 6: Verificación visual rápida**

Run: `npm run build && npm start` y revisar en el navegador `/seccion` (corazón
en tarjetas), `/libro?slug=casi-medio-ano-edicion-especial-30-aniversario`
(botón de detalle) y el contador del header. El corazón debe verse pequeño,
neutro, y colorearse solo al interactuar o estar activo.

- [ ] **Step 7: Suite completa y commit**

Run: `npm test && npm run lint`
Expected: PASS.

```bash
git add app tests
git commit -m "Reactiva favoritos con corazón sutil"
```

---

### Task 4: Sección de planes lectores con carruseles y faceta en el explorador

**Files:**
- Create: `app/components/plan-carousel.tsx`
- Modify: `app/planes-lectores/page.tsx` (sección nueva debajo del contenido actual)
- Modify: `app/components/catalog-explorer.tsx` (faceta "Plan lector" + lectura de `?plan=` al montar)
- Modify: `app/globals.css` (estilos de franjas y carrusel)
- Modify: `tests/rendered-html.test.mjs` (asserts de la sección)

**Interfaces:**
- Consumes: `readingPlans`, `ReadingPlan`, `ReadingPlanId` de `book-data.ts` (Task 1).
- Produces: componente `PlanCarousel({ books, ariaLabel })`; `CatalogExplorer` acepta `initialPlan?: string` y lee `?plan=` de la URL al montar (la página `/seccion` no cambia).

- [ ] **Step 1: Escribir los tests que fallan**

En `tests/rendered-html.test.mjs`, agregar:

```js
test("reading plans page presents the three plans with catalog links", async () => {
  const response = await render("/planes-lectores");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Conoce los planes lectores/);
  for (const plan of ["Loran", "Trotamundos", "Cosmos"]) {
    assert.match(html, new RegExp(plan));
  }
  for (const id of ["loran", "trotamundos", "cosmos"]) {
    assert.match(html, new RegExp(`href="/seccion\\?plan=${id}"`));
  }
});

test("catalog explorer offers the reading plan facet", async () => {
  const response = await render("/seccion");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Plan lector/);
});
```

- [ ] **Step 2: Verificar que fallan**

Run: `npm run build && node --test tests/rendered-html.test.mjs`
Expected: FAIL en los dos tests nuevos (los demás PASS).

- [ ] **Step 3: Crear `plan-carousel.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";

type PlanCarouselProps = {
  books: BookRecord[];
  ariaLabel: string;
};

export function PlanCarousel({ books, ariaLabel }: PlanCarouselProps) {
  const track = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: number) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="plan-carousel" role="region" aria-label={ariaLabel}>
      <button
        type="button"
        className="plan-carousel-arrow"
        onClick={() => scrollByPage(-1)}
        aria-label={`${ariaLabel}: anteriores`}
      >
        ←
      </button>
      <div className="plan-carousel-track" ref={track} tabIndex={0}>
        {books.map((book) => (
          <Link
            key={book.slug}
            href={`/libro?slug=${book.slug}`}
            className="plan-carousel-item"
            aria-label={`${book.title} — ${book.author}`}
          >
            <BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} />
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="plan-carousel-arrow"
        onClick={() => scrollByPage(1)}
        aria-label={`${ariaLabel}: siguientes`}
      >
        →
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Agregar la sección a `planes-lectores/page.tsx`**

Desminificar la página y, después de la sección `screen-content` existente,
agregar:

```tsx
<section className="plan-strips" aria-labelledby="plan-strips-title">
  <div className="plan-strips-heading">
    <p className="eyebrow">Colecciones editoriales</p>
    <h2 id="plan-strips-title">Conoce los planes lectores</h2>
    <p>Tres caminos con identidad propia, graduados por nivel escolar.</p>
  </div>
  {readingPlans.map((plan) => (
    <article key={plan.id} className="plan-strip">
      <div className="plan-strip-head">
        <h3>{plan.name}</h3>
        <p>{plan.tagline}</p>
        <p className="plan-strip-meta">
          {plan.books.length} títulos · {plan.levels.length} {plan.levels.length === 1 ? "nivel" : "niveles"}
        </p>
      </div>
      <PlanCarousel books={plan.books.slice(0, 14)} ariaLabel={`Títulos del plan ${plan.name}`} />
      <Link className="arrow-link plan-strip-link" href={`/seccion?plan=${plan.id}`}>
        Explorar catálogo {plan.name} <span>↗</span>
      </Link>
    </article>
  ))}
</section>
```

Imports necesarios en la página: `Link` de `next/link`, `readingPlans` de
`../components/book-data`, `PlanCarousel` de `../components/plan-carousel`.

- [ ] **Step 5: Estilos de franjas y carrusel**

Agregar a `app/globals.css`:

```css
.plan-strips { padding: 56px 5.5vw 24px; display: grid; gap: 36px; }
.plan-strips-heading h2 { margin: 4px 0 6px; font-size: 34px; letter-spacing: -0.03em; }
.plan-strips-heading p { margin: 0; color: var(--muted); }
.plan-strip { background: var(--paper); border: 1px solid var(--line); border-radius: 18px; padding: 26px 26px 20px; display: grid; gap: 16px; }
.plan-strip-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 16px; }
.plan-strip-head h3 { margin: 0; font-size: 24px; letter-spacing: -0.02em; }
.plan-strip-head p { margin: 0; color: var(--muted); }
.plan-strip-meta { font-size: 14px; }
.plan-carousel { position: relative; display: flex; align-items: center; gap: 8px; }
.plan-carousel-track { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 10px; scrollbar-width: thin; }
.plan-carousel-item { flex: 0 0 clamp(110px, 16vw, 150px); scroll-snap-align: start; }
.plan-carousel-arrow { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: var(--paper); cursor: pointer; }
.plan-carousel-arrow:hover { border-color: var(--coral); color: var(--coral); }
.plan-strip-link { justify-self: end; }
@media (max-width: 720px) { .plan-carousel-arrow { display: none; } }
```

- [ ] **Step 6: Faceta "Plan lector" en `catalog-explorer.tsx`**

Cambios en el componente (además de desminificar su JSX):

```tsx
import { useEffect, useMemo, useState } from "react";
import { readingPlans } from "./book-data";
// props: agregar initialPlan?: string
const PLAN_IDS = readingPlans.map((plan) => plan.id);

const [plan, setPlan] = useState(initialPlan && PLAN_IDS.includes(initialPlan as ReadingPlanId) ? initialPlan : "Todos");

useEffect(() => {
  const requested = new URLSearchParams(window.location.search).get("plan");
  if (requested && PLAN_IDS.includes(requested as ReadingPlanId)) {
    setPlan(requested);
    setVisible(pageSize);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const planOptions = useMemo(() => readingPlans.map((entry) => ({
  id: entry.id,
  name: entry.name,
  count: books.filter((book) => book.plans?.some((item) => item.plan === entry.id)).length,
})), [books]);
```

En el filtro `filtered`, agregar a las condiciones:

```tsx
const matchesPlan = plan === "Todos" || Boolean(book.plans?.some((item) => item.plan === plan));
```

En el sidebar, después del fieldset de Tema, agregar:

```tsx
<fieldset>
  <legend>Plan lector</legend>
  <label>
    <input type="radio" name="catalog-plan" checked={plan === "Todos"} onChange={() => { setPlan("Todos"); setVisible(pageSize); }} /> Todos <span>{books.length}</span>
  </label>
  {planOptions.map((item) => (
    <label key={item.id}>
      <input type="radio" name="catalog-plan" checked={plan === item.id} onChange={() => { setPlan(item.id); setVisible(pageSize); }} /> {item.name}<span>{item.count}</span>
    </label>
  ))}
</fieldset>
```

Incluir `plan` en las dependencias del `useMemo` de `filtered` y en `reset()`
(`setPlan("Todos")`). La página `/seccion` NO cambia: sigue estática y el
explorador aplica `?plan=` al montar (mismo patrón que `categoria`).

- [ ] **Step 7: Verificar tests y commit**

Run: `npm test && npm run lint`
Expected: 36 tests PASS.

```bash
git add app tests
git commit -m "Agrega carruseles de planes lectores y faceta de plan"
```

---

### Task 5: Página 404 divertida

**Files:**
- Create: `app/not-found.tsx`
- Modify: `app/globals.css` (estilos del 404)
- Modify: `tests/rendered-html.test.mjs` (test del 404)

**Interfaces:**
- Consumes: `ScreenShell` y `ScreenHero` NO (hero propio), `CatalogCard` y `newestBooks` de componentes existentes.
- Produces: ruta desconocida → estatus 404 con página ilustrada.

- [ ] **Step 1: Escribir el test que falla**

En `tests/rendered-html.test.mjs`:

```js
test("unknown routes render the playful 404", async () => {
  const response = await render("/este-capitulo-no-existe");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /Este capítulo no existe/);
  assert.match(html, /Estas historias sí existen/);
  assert.match(html, /href="\/seccion"/);
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npm run build && node --test tests/rendered-html.test.mjs`
Expected: FAIL — el 404 por defecto de Next no contiene ese copy.

- [ ] **Step 3: Crear `app/not-found.tsx`**

```tsx
import Link from "next/link";
import { CatalogCard } from "./components/catalog-card";
import { newestBooks } from "./components/book-data";
import { ScreenShell } from "./components/screen-components";

const SUGGESTED = newestBooks.slice(0, 3);

export default function NotFound() {
  return (
    <ScreenShell>
      <section className="not-found-hero">
        <svg className="not-found-shelf" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
          <rect x="10" y="120" width="300" height="8" rx="3" fill="var(--ink)" opacity="0.85" />
          <rect x="30" y="52" width="22" height="68" rx="3" fill="var(--coral)" />
          <rect x="56" y="44" width="20" height="76" rx="3" fill="var(--blue)" />
          <rect x="80" y="58" width="24" height="62" rx="3" fill="var(--yellow)" />
          <rect x="108" y="48" width="20" height="72" rx="3" fill="var(--ink)" opacity="0.8" />
          <g transform="rotate(9 160 116)">
            <rect x="132" y="60" width="22" height="60" rx="3" fill="var(--coral)" opacity="0.9" />
          </g>
          <text x="196" y="112" fontSize="52" fontFamily="inherit" fill="var(--muted)">?</text>
          <g transform="rotate(-74 258 128)">
            <rect x="246" y="70" width="20" height="58" rx="3" fill="var(--blue)" />
          </g>
        </svg>
        <p className="eyebrow">Error 404</p>
        <h1>Este capítulo no existe… <em>todavía.</em></h1>
        <p>
          Buscamos en todos los estantes y hasta debajo del librero, pero esta
          página se nos traspapeló. Mientras la encontramos, hay cientos de
          historias esperándote.
        </p>
        <div className="not-found-actions">
          <Link className="dark-button" href="/seccion">Explorar el catálogo</Link>
          <Link className="arrow-link" href="/novedades">Ver novedades <span>↗</span></Link>
          <Link className="arrow-link" href="/">Volver al inicio <span>↗</span></Link>
        </div>
      </section>
      <section className="not-found-suggestions" aria-labelledby="not-found-suggestions-title">
        <h2 id="not-found-suggestions-title">Estas historias sí existen</h2>
        <div className="section-book-grid">
          {SUGGESTED.map((book) => (
            <CatalogCard key={book.slug} book={book} />
          ))}
        </div>
      </section>
    </ScreenShell>
  );
}
```

- [ ] **Step 4: Estilos**

Agregar a `app/globals.css`:

```css
.not-found-hero { padding: 64px 5.5vw 24px; max-width: 760px; }
.not-found-shelf { width: min(320px, 70vw); height: auto; margin-bottom: 18px; }
.not-found-hero h1 { margin: 6px 0 12px; font-size: clamp(32px, 5vw, 44px); letter-spacing: -0.03em; }
.not-found-hero h1 em { color: var(--coral); }
.not-found-hero p { margin: 0 0 22px; color: var(--muted); max-width: 56ch; }
.not-found-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px 26px; }
.not-found-suggestions { padding: 24px 5.5vw 72px; }
.not-found-suggestions h2 { font-size: 26px; letter-spacing: -0.02em; margin-bottom: 18px; }
```

- [ ] **Step 5: Verificar tests y commit**

Run: `npm test && npm run lint`
Expected: 37 tests PASS (incluido el 404 con estatus real).

```bash
git add app tests
git commit -m "Agrega página 404 ilustrada con sugerencias"
```

---

### Task 6: Pulido UI/UX puntual

**Files:**
- Modify: `app/globals.css`

**Interfaces:** ninguna nueva; solo CSS.

- [ ] **Step 1: Scroll bajo el header pegajoso y detalles**

Agregar a `app/globals.css` (junto a las reglas de `html`):

```css
html { scroll-padding-top: 96px; }
```

Revisar visualmente (con `npm run build && npm start`): estados vacíos del
explorador y consistencia de `arrow-link` en las páginas tocadas. Corregir
solo si algo se rompió con los cambios anteriores; no rediseñar.

- [ ] **Step 2: Verificar y commit**

Run: `npm test && npm run lint`
Expected: PASS.

```bash
git add app/globals.css
git commit -m "Ajusta desplazamiento bajo el header pegajoso"
```

---

### Task 7: Documento de migración headless a WordPress

**Files:**
- Create: `docs/wordpress-headless-plan.md`

**Interfaces:** documento; sin código.

- [ ] **Step 1: Escribir el documento**

Contenido mínimo (desarrollar cada sección en prosa breve, con los datos ya
verificados en este repo):

```markdown
# Plan de migración headless: WordPress + Next.js

## Objetivo y arquitectura
- WP/WooCommerce actual (literatura.grupo-sm.com.mx) queda como CMS y fuente
  de catálogo; este Next.js en Vercel es el frente público; el dominio apunta
  a Vercel (CNAME) y WP pasa a un subdominio (p. ej. admin.…).

## Mapeo de datos (ya probado en este repo)
- Producto WooCommerce → `BookRecord` (el pipeline
  `scripts/build-catalog-assets.mjs` ya transforma el export real).
- Taxonomía `categoria-producto` → `plans` (Loran/Trotamundos/niveles) y
  facetas de edad/tema; Cosmos se deriva de nivel Bachillerato.
- Imágenes: ya se sirven del CDN de WP; `next.config.ts` ya lista
  `literatura.grupo-sm.com.mx/wp-content/uploads/**`.

## Fases de sincronización
1. **Hoy (estático):** export CSV → `books.json` → build. Manual.
2. **Corto plazo:** fetch en build a la REST de WooCommerce
   (`/wp-json/wc/v3/products`, credenciales de solo lectura en variables de
   entorno de Vercel) + Deploy Hook de Vercel disparado por webhook de
   WooCommerce al publicar/editar productos.
3. **Mediano plazo:** ISR con `revalidate` para frescura sin redeploys.

## Rutas y SEO
- Mapa 301 de URLs WP → rutas nuevas (categoria-producto/* → /seccion?plan=…,
  producto/* → /libro?slug=…); sitemap ya generado por `app/sitemap.ts`;
  conservar metadatos OG existentes.

## Comercio (fase posterior)
- Carrito/checkout contra WooCommerce Store API; bloqueado hoy por la
  auditoría de precios (`data/catalog/PRICING_AUDIT.md`): cobertura de
  precios insuficiente. Prerrequisito: lista maestra de precios por SKU.

## Esfuerzo estimado y riesgos
- Fase 2: 2-4 días (endpoint, credenciales, webhook, pruebas).
- Fase 3: 1-2 días. Comercio: por cotizar tras resolver precios.
- Riesgos: límites de la REST API, divergencia de slugs, DNS/SSL del dominio.
```

- [ ] **Step 2: Commit**

```bash
git add docs/wordpress-headless-plan.md
git commit -m "Documenta plan de migración headless a WordPress"
```

---

### Task 8: Verificación final y despliegue

**Files:** ninguno nuevo.

- [ ] **Step 1: Verificación completa local**

Run: `npm run catalog:check && npm test && npm run lint`
Expected: todo PASS (catálogo al día, 37 tests, lint limpio).

- [ ] **Step 2: Revisión visual final**

`npm run build && npm start` y recorrer: `/` (corazones sutiles en tarjetas),
`/planes-lectores` (tres franjas con carrusel y guiños), `/seccion?plan=cosmos`
(faceta preseleccionada, 17 títulos), `/lista` (página de favoritos activa),
`/ruta-inexistente` (404 divertida).

- [ ] **Step 3: Push a main (despliegue automático a producción)**

```bash
git push origin main
```

Esperar el deploy de Vercel y verificar en producción:
`curl -s -o /dev/null -w "%{http_code}" https://literatura-sm-redesign.vercel.app/planes-lectores` → 200
`curl -s -o /dev/null -w "%{http_code}" https://literatura-sm-redesign.vercel.app/ruta-inexistente` → 404
