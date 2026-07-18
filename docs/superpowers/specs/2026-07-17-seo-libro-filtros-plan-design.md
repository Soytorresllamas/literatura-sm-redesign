# Diseño: SEO por libro, filtros móviles, query reactiva y plan compartible

**Fecha:** 2026-07-17
**Estado:** aprobado por Marcelo (diseño general de los 4 bloques)

## Objetivo

Cuatro mejoras: (1) páginas reales por libro con rutas `/libro/[slug]` y
metadatos completos, (2) filtros del catálogo usables en móvil, (3) páginas
con query string reactivas a navegación cliente, (4) convertir favoritos en un
plan lector compartible e imprimible.

## Bloque 1 — Rutas `/libro/[slug]` con SEO real

**Problema:** `/libro` es una única página estática rellenada en cliente: los
360 libros comparten HTML, título y metadatos; los previews sociales y Google
ven siempre el libro destacado.

**Diseño:**
- Nueva ruta `app/libro/[slug]/page.tsx` como **Server Component**:
  - `generateStaticParams()` con los 360 slugs de `catalogBooks`.
  - `generateMetadata()` por libro: `title` («Título» | SM Literatura),
    `description` (note o descripción recortada), `openGraph` con la portada
    (`book.image`, URL absoluta del CDN de WP) y `alt`.
  - JSON-LD `schema.org/Book` inline (`name`, `author` como `Person`, `isbn`,
    `numberOfPages`, `publisher` Ediciones SM, `image`, `inLanguage: "es"`),
    con los campos opcionales presentes solo si existen en los datos.
  - Slug desconocido → `notFound()` (404 divertida con estatus real).
  - El contenido es el actual de la ficha (hero, datos editoriales, recursos,
    relacionados); `FavoriteButton` y el botón de compartir siguen siendo
    islas cliente.
- `app/libro/page.tsx` (versión query) **se elimina**, junto con el puente
  `BookSlugSync`: entre libros ahora cambian rutas y la página se remonta.
- Redirecciones en `next.config.ts`:
  - `/libro?slug=X` → `/libro/X` con `permanent: true` (308) usando
    `has: [{ type: "query", key: "slug", value: "(?<slug>.+)" }]`.
  - `/libro` sin slug → `/seccion` (temporal 307).
- Call sites actualizados a `` `/libro/${slug}` ``: `app/page.tsx`,
  `catalog-card.tsx`, `novelty-carousel.tsx`, `plan-carousel.tsx`.
- `app/sitemap.ts`: URLs de libro pasan a `/libro/${slug}`.

**Descartado:** renderizado dinámico leyendo `searchParams` en el servidor
(perdería el prerender estático).

## Bloque 2 — Filtros del catálogo en móvil

**Problema:** bajo 560px el CSS oculta los fieldsets del sidebar
(`.filter-sidebar fieldset { display: none }`): en teléfono no se puede
filtrar por edad, tema ni plan.

**Diseño:** en `CatalogExplorer`, estado local `filtersOpen` y un botón
"Filtrar resultados" que solo se muestra en móvil (CSS), con el conteo de
filtros activos distintos de "Todos"/"Todas" (ej. "Filtrar resultados · 2").
El sidebar gana la clase `is-open`; el CSS móvil muestra los fieldsets solo
con esa clase. Desktop no cambia. Sin dependencias nuevas.

**Descartado:** `<details>` nativo (no se puede forzar abierto en desktop sin
duplicar los grupos de radios).

## Bloque 3 — Query reactiva en autor, categoría y buscar

**Problema:** `/autor?nombre=`, `/categoria?tema=` y `/buscar?q=` leen la URL
una sola vez al montar (patrón `setTimeout`): una navegación cliente en la
misma ruta o el botón atrás/adelante no actualizan el contenido (la clase de
bug de "También puede gustarte").

**Diseño:** componente compartido `app/components/search-param-sync.tsx`:

```tsx
<SearchParamSync param="nombre" onValue={handleValue} />
```

usa `useSearchParams` y notifica en un efecto con `[value]`; se monta bajo
`<Suspense fallback={null}>` para no alterar el prerender. Las tres páginas
sustituyen su `useEffect`+`setTimeout` por el sync (conservan su gating de
skeleton en el primer render marcando `ready` al primer valor recibido).
`/libro` ya no lo necesita (Bloque 1). Un test estructural prohíbe
`window.location.search` en `app/**/page.tsx`.

## Bloque 4 — Mi plan lector compartible e imprimible

**Problema:** el botón "Compartir lista" actual copia `/lista`, que para el
receptor muestra su propia lista (o vacío): no comparte nada.

**Diseño:**
- `app/lib/plan-share.ts` (funciones puras, testeables):
  - `buildPlanPath(ids: number[]): string` → `/plan?ids=119,156` (ordenados,
    sin duplicados).
  - `parsePlanIds(value: string | null): number[]` → valida enteros
    positivos, descarta basura, tope de 360.
- `/lista`:
  - "Compartir mi plan": copia `origin + buildPlanPath(idsDeFavoritos)` al
    portapapeles con confirmación visual temporal ("Enlace copiado ✓");
    deshabilitado con lista vacía.
  - "Imprimir mi plan": `window.print()`.
- Nueva ruta `app/plan/page.tsx` (cliente, reactiva vía `SearchParamSync`):
  vista de solo lectura — "Plan lector compartido · N títulos" — con la
  cuadrícula de libros, botón "Guardar todos en mis favoritos" (merge al
  provider; visible solo con `FAVORITES_UI_ENABLED`), enlace al catálogo e
  impresión. IDs vacíos o inválidos → estado vacío amable con CTA al
  catálogo. La vista funciona aunque favoritos esté apagado.
- Estilos `@media print` en `globals.css`: ocultan header, footer, botones y
  corazones; formatean título del plan, fecha no (nada de `Date` en render:
  el encabezado impreso es estático), y por libro título/autor/edad/nivel.

## Pruebas

- **Rendered-html:** `/libro/<slug-real>` 200 con título, autor y JSON-LD
  (`"@type":"Book"`); `/libro?slug=<slug>` → 308 con `location: /libro/<slug>`;
  `/libro/slug-inexistente` → 404 divertida; `/plan?ids=<id-real>` 200 con
  "Plan lector compartido"; `/seccion` contiene el botón "Filtrar resultados".
- **Sitemap:** aserción de que contiene `/libro/<slug>` y ninguna URL
  `libro?slug=`.
- **Unit:** `plan-share` (build/parse, casos inválidos) con `node --test`.
- **Estructural:** ningún `window.location.search` en `app/**/page.tsx`;
  los call sites no contienen `libro?slug=`.
- Los tests existentes de la ficha se actualizan a la nueva ruta.

## Coordinación

La sesión paralela de pulidos trabaja en un worktree y toca `app/page.tsx` y
`scripts/build-catalog-assets.mjs`. Antes de arrancar y antes del merge final
se fusiona `main` a la rama de trabajo para integrar sus cambios si ya
aterrizaron.

## Orden de implementación

1. Bloque 1 (rutas por libro; el más grande e independiente).
2. Bloque 3 (`SearchParamSync` + tres páginas).
3. Bloque 2 (filtros móviles).
4. Bloque 4 (plan compartible/imprimible).
5. Verificación final, revisión de rama completa y deploy con aprobación.
