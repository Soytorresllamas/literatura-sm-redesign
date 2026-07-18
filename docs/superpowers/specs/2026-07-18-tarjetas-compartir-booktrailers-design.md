# Diseño: tarjetas sociales, compartir real y sección de booktrailers

**Fecha:** 2026-07-18
**Estado:** aprobado por Marcelo (bloques A–D, opciones recomendadas)

## Objetivo

Tres mejoras: (1) tarjetas sociales por libro y para la página general,
(2) funcionalidad real de compartir (WhatsApp, Facebook, Correo, Instagram),
(3) sección de booktrailers con la misma lógica visual del sitio y un guiño a
una interfaz tipo Netflix.

## Contexto

- El Bloque 1 del spec `2026-07-17-seo-libro-filtros-plan-design.md` (rutas
  `/libro/[slug]`) estaba aprobado pero sin implementar; es prerrequisito de
  las tarjetas por libro y se implementa aquí. Los Bloques 2–4 de ese spec
  siguen pendientes y fuera de alcance.
- `layout.tsx` define OpenGraph sin imagen: la página general no tiene
  tarjeta visual.
- 35 de 388 libros traen `links.bookTrailer` (todos `youtu.be`), ya
  expuestos por `book-detail-data.ts`.

## Bloque A — Rutas `/libro/[slug]` + tarjeta por libro

- `app/libro/[slug]/page.tsx` como Server Component:
  - `generateStaticParams()` con los slugs de `catalogBooks`.
  - `generateMetadata()` por libro: título «Título | SM Literatura»,
    descripción (note o descripción recortada ~160), `openGraph` y `twitter`
    apuntando a la tarjeta compuesta `/og/libro/<slug>`.
  - JSON-LD `schema.org/Book` inline (campos opcionales solo si existen).
  - Slug desconocido → `notFound()`.
  - El contenido es la ficha actual; `FavoriteButton` y el nuevo `ShareMenu`
    son islas cliente. Relacionados enlazan a `/libro/<slug>`.
- **Tarjeta compuesta** en `app/og/libro/[slug]/route.tsx` con
  `ImageResponse` (1200×630): portada a la derecha, título/autor/edad en
  serif (Lora, TTF commiteada en el repo — satori no ve fuentes del sistema),
  fondo crema, acento coral, marca SM Literatura. Se genera **bajo demanda**
  con `Cache-Control` (s-maxage + stale-while-revalidate); generar 388
  imágenes en build alargaría el deploy sin beneficio.
- Redirecciones en `next.config.ts`: `/libro?slug=X` → `/libro/X`
  (`permanent: true`, 308, con captura por query); `/libro` sin slug →
  `/seccion` (307).
- Call sites actualizados a `` `/libro/${slug}` `` y `app/sitemap.ts` con las
  URLs nuevas. `app/libro/page.tsx` (versión query) se elimina junto con
  `BookSlugSync`.

**Descartado:** OG estáticas en build (build lento); usar la portada tal
cual como og:image (vertical, la recortan las plataformas).

## Bloque B — Tarjeta de la página general

- `app/opengraph-image.tsx` (1200×630) con la identidad del sitio: fondo
  crema, «Encuentra una historia para cada momento.» en serif con «cada
  momento» en coral, estrella coral y marca SM Literatura ·
  Literatura infantil y juvenil. Una sola imagen prerenderizada en build.
- `layout.tsx` conserva `metadataBase`; `twitter.card` sigue
  `summary_large_image` y hereda la imagen.

## Bloque C — Compartir real

- `app/lib/share-links.ts` (funciones puras, testeables):
  `whatsAppShareUrl(text, url)`, `facebookShareUrl(url)`,
  `mailtoShareUrl(subject, body)` — encoding correcto en cada una.
- `app/components/share-menu.tsx` (isla cliente) sustituye el botón «↗» de
  la ficha: WhatsApp, Facebook, Correo, Instagram y Copiar enlace.
  - Instagram no tiene URL de share web: en dispositivos con
    `navigator.share` abre la hoja nativa (ahí aparece Instagram); si no,
    copia el enlace y muestra «Enlace copiado — pégalo en tu historia o
    mensaje».
  - Copiar enlace confirma con «✓» temporal.
  - Enlaces externos con `target="_blank" rel="noreferrer"`.

## Bloque D — Booktrailers tipo Netflix

- `app/lib/youtube.ts` (puro): `getYouTubeId(url)` (`youtu.be/<id>?si=…` y
  `watch?v=`), `youTubeThumbnail(id)` (`i.ytimg.com`), `youTubeEmbedUrl(id)`
  (`youtube-nocookie.com`, autoplay).
- `getBooksWithTrailers()` en `book-detail-data.ts`: libros del catálogo con
  `links.bookTrailer` válido.
- `app/booktrailers/page.tsx` (Server Component + isla `TrailerTheater`):
  - Sección oscura (tinta, como el bloque escolar del home) con tipografía y
    acentos del sitio — el guiño Netflix es de estructura, no de marca.
  - Hero con el trailer destacado (miniatura grande + ▶); al dar play se
    sustituye por el iframe `youtube-nocookie` (nada de YouTube se carga
    antes del clic).
  - Filas con scroll horizontal por grupo de edad; tarjetas apaisadas con
    miniatura, hover con escala y overlay ▶, título y enlace «Ver ficha».
  - Metadatos propios y `opengraph-image.tsx` en variante oscura.
- Nav: «Booktrailers» se suma a `NAV_LINKS` (el menú móvil lo hereda).
- Home: fila teaser oscura con 4–5 miniaturas (scroll horizontal) y CTA
  «Ver todos los booktrailers».

## Pruebas

- **Rendered-html:** `/libro/<slug-real>` 200 con título y JSON-LD
  (`"@type":"Book"`); `/libro?slug=<slug>` → 308 a `/libro/<slug>`;
  `/libro/slug-inexistente` → 404; `/booktrailers` 200 con un título con
  trailer y su miniatura; el home contiene el teaser.
- **Unit:** `share-links` y `youtube` con `node --test` (casos válidos e
  inválidos).
- **Sitemap:** contiene `/libro/<slug>` y `/booktrailers`; ninguna URL
  `libro?slug=`.
- **Estructural:** ningún `libro?slug=` en `app/**`.
- Los tests existentes de la ficha se actualizan a la nueva ruta.

## Orden de implementación

1. Bloque A (rutas por libro; el más grande e independiente).
2. Bloque B (tarjeta general).
3. Bloque C (compartir).
4. Bloque D (booktrailers).
5. Verificación final (suite + navegador, incl. 600–840 px) y deploy con
   aprobación.
