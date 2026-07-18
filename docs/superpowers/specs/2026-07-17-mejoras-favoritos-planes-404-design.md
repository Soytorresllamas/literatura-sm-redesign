# Diseño: favoritos sutiles, planes lectores, refactor, 404 y ruta WordPress

**Fecha:** 2026-07-17
**Estado:** aprobado por Marcelo (diseño general y ruta headless para WP)

## Objetivo

Seis mejoras acordadas: (1) reactivar favoritos con un corazón pequeño y sutil,
(2) refactor dirigido a eficiencia real, (3) carruseles de planes lectores
(Loran, Trotamundos, Cosmos) nutridos con los datos de WordPress, (4) mejoras
UI/UX puntuales, (5) página 404 divertida, (6) documento de plan para migrar a
WordPress en modalidad headless.

## Decisiones tomadas

- **Favoritos se reactivan por completo** (`FAVORITES_UI_ENABLED = true`).
- **Cosmos = Bachillerato**: los libros con nivel Bachillerato (~17) alimentan
  el plan Cosmos. Loran (~203) y Trotamundos (~167) vienen de las categorías
  estructuradas de WordPress (`Loran > Primaria 1`, etc.).
- **Ruta WordPress: headless.** WP sigue siendo CMS/catálogo; Next.js es el
  frente. El bloque 6 es un documento, no código.

## Bloque 1 — Corazón sutil

**Problema:** el corazón actual mide 34px con trazo de 6px (`vector-effect:
non-scaling-stroke`), demasiado protagonista.

**Diseño:**
- Tarjetas (`variant="card"`): icono ~18px, trazo ~1.5px, color tinta apagado
  (`--muted`); coral solo en hover, foco y estado activo (relleno coral).
- Detalle (`variant="detail"`): icono ~20px con la etiqueta existente.
- Header (`favorites-indicator`): icono ~20px, mismo lenguaje.
- El botón conserva el área táctil ≥48px (exigida por tests) vía padding; el
  SVG interior se encoge, no el control.
- Se mantienen: SVG inline estable (sin Lottie), animación contenida de
  escala, `prefers-reduced-motion`.

**Cambios:** `app/globals.css` (tamaños/colores), `favorite-heart.tsx` (solo si
hace falta clase nueva), `app/lib/features.ts` (bandera a `true`).

## Bloque 2 — Refactor dirigido

1. **`next/link` en toda la navegación interna.** Hoy no hay un solo `Link`:
   cada clic recarga la página. Migrar todos los `<a href="/...">` internos y
   sustituir `window.location.assign` del carrusel por `useRouter().push`.
   Los externos (`literatura.grupo-sm.com.mx`) quedan como `<a>`.
2. **Desminificar JSX.** `novelty-carousel.tsx`, `catalog-explorer.tsx`,
   `planes-lectores/page.tsx` y demás componentes de una sola línea pasan a
   JSX multilínea legible. Cero cambio de comportamiento (los tests de HTML
   renderizado lo garantizan).
3. **Pipeline de planes.** `scripts/build-catalog-assets.mjs` extrae de las
   categorías crudas un campo estructurado por libro:
   `plans: { plan: "loran" | "trotamundos" | "cosmos"; level: string }[]`.
   Cosmos se deriva de `school/level === "Bachillerato"`. Se regenera
   `data/catalog/catalog-index.json` y `BookRecord` gana el campo tipado.

Fuera de alcance: reorganización de carpetas, cambio de framework de estilos,
tocar el pipeline de precios.

## Bloque 3 — Planes lectores con carruseles

**Datos:** el campo `plans` del bloque 2.

**UI en `/planes-lectores`:** la página actual (hero + planificador + 3 pasos)
se conserva. Debajo se agrega la sección **"Conoce los planes lectores"** con
tres franjas, una por plan:

- Cabecera de franja: nombre del plan, lema corto de una línea, conteo de
  títulos y niveles cubiertos.
- Carrusel horizontal de portadas (scroll nativo con `scroll-snap`, flechas
  accesibles; NO se reutiliza el escenario 3D de novedades — es otro patrón,
  más ligero, un nuevo componente `PlanCarousel`).
- Cierre-guiño: enlace "Explorar catálogo {Plan} →" hacia
  `/seccion?plan={plan}`.

**Explorador:** `CatalogExplorer` gana la faceta "Plan lector" (radio, como
Edad/Tema) y acepta `initialPlan`; `/seccion` lee `searchParams.plan`.

**Flujo ideal de la sección (narrativa de producto):**
1. La persona docente entra a Planes Lectores y elige su camino: *armar un
   plan propio* (planificador por grado/propósito) o *partir de un plan
   editorial* (franjas Loran/Trotamundos/Cosmos).
2. Ambos caminos convergen en el catálogo filtrado (`/seccion`), donde explora
   títulos con las facetas.
3. Con favoritos reactivados, guarda candidatos con el corazón; su lista
   (`/lista`) se vuelve el borrador del plan.
4. Fase futura (no en este trabajo): exportar/imprimir la lista como "Mi plan
   lector" y, con Sign in with ChatGPT, guardar planes por grupo escolar y
   compartirlos con el equipo docente.

## Bloque 4 — UI/UX puntual

- `aria-current="page"` + estado activo en la navegación del header.
- `scroll-margin-top` global para anclas bajo el header pegajoso.
- Revisión de estados vacíos y consistencia de flechas/enlaces (`arrow-link`).
- Lo que ya está bien (skeletons, foco visible, reduced-motion) no se toca.

## Bloque 5 — Página 404

`app/not-found.tsx` (server component, estática):
- Ilustración SVG propia: estantería con un hueco y un libro caído.
- Copy juguetón: "Este capítulo no existe… todavía" + subtítulo breve.
- Acciones: enlace al catálogo, a novedades y al inicio; y 3 libros reales
  sugeridos ("Estas historias sí existen") tomados de forma determinista del
  catálogo (sin aleatoriedad en build para no romper el prerender).
- Next la sirve con estatus 404 real.

## Bloque 6 — Documento de migración headless

Entregable: `docs/wordpress-headless-plan.md` con:
- Arquitectura: WP/WooCommerce actual como fuente de datos (REST o WPGraphQL),
  Next.js en Vercel como frente; dominio apunta a Vercel.
- Mapeo de datos: productos WooCommerce → `BookRecord`; taxonomía
  `categoria-producto` (que ya codifica Loran/Trotamundos/niveles) → `plans`;
  imágenes ya servidas desde el CDN de WP (`remotePatterns` ya configurado).
- Estrategia de sincronización: fases — (a) export estático actual (ya
  existe), (b) build-time fetch con revalidación programada, (c) ISR/webhooks
  de WooCommerce para frescura.
- Rutas: qué páginas WP se retiran, cuáles redirigen (mapa 301), SEO
  (sitemap, metadatos, hreflang si aplica).
- Comercio: alcance para reactivar carrito/checkout contra WooCommerce
  (Store API) como fase posterior.
- Esfuerzo estimado por fase y riesgos.

## Pruebas

- **Datos:** test de que `plans` existe, con conteos > 0 por plan y Cosmos
  derivado de Bachillerato (`catalog-data.test.mjs`).
- **Favoritos:** los tests existentes son sensibles a la bandera; con
  `true` verifican presencia. El test de hit target de 48px sigue vigente.
- **Renderizado:** `rendered-html.test.mjs` suma asserts para la sección de
  planes (franjas y guiños) y un test de 404 (ruta inexistente → estatus 404 +
  copy divertido).
- **Regresión:** la migración a `next/link` no cambia el HTML de `<a href>`
  renderizado, los tests actuales lo confirman.

## Orden de implementación sugerido

1. Pipeline de planes (datos primero; habilita todo lo demás).
2. Refactor `next/link` + desminificado (base limpia).
3. Favoritos sutiles (bandera + estilos).
4. Sección de planes lectores + faceta en explorador.
5. UI/UX puntual + 404.
6. Documento headless (en paralelo, no depende del código).
