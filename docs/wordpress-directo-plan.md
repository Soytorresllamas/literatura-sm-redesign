# Plan de WordPress directo: tema clásico `literatura-sm`

Este documento es el plan B del rediseño: si el área de tecnología de SM no
autoriza la arquitectura headless (descrita en `docs/wordpress-headless-plan.md`),
el rediseño puede implementarse como **tema clásico de WordPress en PHP**,
instalado directamente sobre el WordPress + WooCommerce que ya corre en
`literatura.grupo-sm.com.mx`. Sin Node, sin build, sin servicios nuevos.

El tema vive en `wordpress-theme/literatura-sm/` de este repositorio y se
instala tal cual (carpeta o ZIP). El CSS proviene de `app/globals.css` del
rediseño —misma paleta, misma tipografía, mismos componentes— y el JS es
vanilla, encolado como un archivo plano.

## Decisión central: single de producto WooCommerce, no CPT `libro`

La ficha de libro se implementa como **plantilla del single de producto de
WooCommerce** (`single-product.php` en la raíz del tema), no como un custom
post type nuevo.

| Criterio | Single de producto (elegido) | CPT `libro` |
| --- | --- | --- |
| Migración de datos | Ninguna: los 388 productos ya existen con sus metadatos (`autor`, `edad`, `isbn`…) | Habría que migrar 388 productos con sus metas, imágenes y categorías |
| URLs | Se conservan las actuales (`/producto/<slug>/`): cero riesgo SEO, cero redirecciones | URLs nuevas: mapa de redirecciones 301 obligatorio |
| Flujo editorial | El equipo sigue cargando libros donde siempre | Doble captura o abandono del flujo conocido |
| Comercio futuro | La puerta queda abierta: si algún día se habilita compra, el producto ya es producto | Habría que volver a WooCommerce o duplicar |
| Dependencia | El tema depende del tipo `product` | Independiente de WooCommerce |

La única desventaja real (depender de WooCommerce) se mitiga en el propio
tema: si WooCommerce no está activo, `inc/registro-datos.php` registra un
tipo `product` mínimo con las mismas taxonomías, de modo que el tema puede
evaluarse en un WordPress limpio de pruebas sin instalar nada.

Importante: el tema **no imprime botones de compra ni precios**, igual que el
rediseño Next (la auditoría de `data/catalog/PRICING_AUDIT.md` mantiene el
comercio bloqueado: 1 de 360 productos con precio). WooCommerce queda como
contenedor de catálogo, no como tienda.

## Mapeo campo a campo

El archivo `data/wordpress/books.json` de este repo es una proyección del
CSV exportado de WooCommerce (`books.raw.csv`). En WordPress directo no hay
proyección: el tema lee los mismos campos de origen. Mapeo completo:

| Campo del JSON exportado | Origen real en WordPress | Uso en el tema clásico |
| --- | --- | --- |
| `id` | `ID` del post | Paleta de portada conceptual (`literatura_sm_paleta`), orden «más recientes» |
| `slug` | `post_name` | Permalink del producto |
| `title` | `post_title` | Título en tarjetas, ficha, OG y JSON-LD |
| `status` | `post_status` | Solo se consultan `publish` |
| `sku` | meta `_sku` (WooCommerce) | No se muestra (comercio desactivado) |
| `gtin` | columna GTIN/EAN de WooCommerce | Respaldo de ISBN si `isbn` está vacío (pendiente: hoy el tema solo lee `isbn`) |
| `shortDescription` | `post_excerpt` | «Sobre la historia», descripciones de compartir |
| `description` | `post_content` | Descripción de la ficha (`wp_kses_post`) |
| `pricing.*` | `_regular_price`, `_sale_price` | No se usa (comercio bloqueado) |
| `categories` | taxonomía `product_cat` | Novedades (`Novedad(es)`), colección de respaldo, derivación de planes |
| `tags` | taxonomía `product_tag` | No se muestra directamente |
| `images` | imagen destacada + galería del producto | Portada real; sin imagen se dibuja la portada conceptual con paleta |
| `editorial.sap` | meta `SAP` | No se usa |
| `editorial.collection` | meta `coleccion` | Sello de colección en tarjetas y eyebrow de la ficha |
| `editorial.author` | meta `autor` | Autor en todo el sitio |
| `editorial.authorNationality` | meta `nacionalidad_del_autor` (histórico: `nacionalidad`) | No se muestra (igual que el rediseño) |
| `editorial.illustrator` | meta `ilustrador` | Datos editoriales de la ficha |
| `editorial.illustratorNationality` | meta `nacionalidad_del_ilustrador` | No se muestra |
| `editorial.genre` | meta `genero` | Tema de respaldo, `genre` del JSON-LD |
| `editorial.themes` | meta `temas` (lista separada por comas) | Se vuelca a la taxonomía nueva `tema`; sellos y filtro por tema |
| `editorial.keywords` | meta `palabras_claves` | No se usa |
| `editorial.age` | meta `edad` | Edad legible («9 +» → «9+»); insumo del grupo de edad |
| `editorial.schoolLevel` | meta `nivel_escolar` | Grupo de edad, plan Cosmos, etiquetas de la ficha |
| `editorial.schoolGrade` | meta `grado_escolar` | Chips de nivel en tarjetas y ficha |
| `editorial.model` | meta `modelo` | No se usa |
| `editorial.isbn` | meta `isbn` | Datos editoriales, JSON-LD, `book:isbn` |
| `editorial.format` | meta `formato` | Datos editoriales |
| `editorial.pages` | meta `paginas` | Datos editoriales, `numberOfPages` |
| `editorial.binding` | meta `encuadernacion` | Datos editoriales |
| `editorial.novelty` | meta `novedad` | Respaldo de la categoría Novedades |
| `editorial.difficulty` | meta `dificultad` | No se muestra (igual que el rediseño) |
| `editorial.planLevel` | meta `nivel_plan` | No se muestra |
| `editorial.educationalBooks` | meta `libros_pedagogicos` | No se usa |
| `links.bookTrailer` | meta `liga_de_booktrailer` | Página de booktrailers, recurso de la ficha |
| `links.audiobook` | meta `liga_audiolibros` | Recurso de la ficha |
| `links.podcast` | meta `liga_podcast` | Recurso de la ficha |
| `links.amazonEbook` | meta `liga_ebook_amazon` | Recurso de la ficha |
| `seo.*` | metas `_aioseo_*` | Los respeta AIOSEO si sigue activo (ver Plugins) |

### Campos derivados del build de Next y su equivalente en el tema

El pipeline `scripts/build-catalog-assets.mjs` calcula campos que no existen
en WordPress. El tema los recalcula con PHP puro (en `inc/datos-libro.php`)
con la misma lógica:

| Derivado en Next | Equivalente en el tema |
| --- | --- |
| `ageGroup` (0–5, 6–8, 9–11, 12–14, Secundaria, Bachillerato, Docentes) | `literatura_sm_grupo_edad()` + taxonomía `edad_lectora` poblada por sincronización |
| `series` (colección o primera categoría no estructural) | `literatura_sm_coleccion()` |
| `theme` / `themes` normalizados | Taxonomía `tema` + `literatura_sm_tema_principal()` |
| `plans` (Loran / Trotamundos por patrón de categorías; Cosmos por Bachillerato) | `literatura_sm_planes_del_libro()` + taxonomía `plan_lector` |
| `color` / `accent` (paleta por `id % 6`) | `literatura_sm_paleta()` — mismos hex, mismo módulo |
| `novelty` (categoría Novedad/Novedades) | `literatura_sm_es_novedad()` |
| `searchText` (título+autor+ISBN+temas…) | **Se degrada**: la búsqueda nativa de WP solo cubre título/contenido/extracto (ver «Qué se degrada») |

### Taxonomías nuevas y sincronización

El tema registra tres taxonomías de exploración sobre `product`:

- `edad_lectora` — grupos de edad (los 7 cortes del rediseño), slug `edad`.
- `tema` — temas normalizados desde el meta `temas`, slug `tema`.
- `plan_lector` — Loran, Trotamundos, Cosmos, slug `plan`.

Se pueblan de dos maneras:

1. **Arranque**: `wp literatura-sm sincronizar-taxonomias` (comando WP-CLI
   incluido en el tema, idempotente) recorre los productos publicados y
   asigna términos desde los metadatos y categorías existentes.
2. **Día a día**: un gancho en `save_post_product` resincroniza cada libro
   al guardarlo en el admin, así el equipo editorial no cambia su flujo.

Con las taxonomías pobladas, los filtros del catálogo son consultas
`tax_query` normales, con conteos por término gratis para las facetas.

## Qué se conserva y qué se degrada respecto a la versión Next

### Se conserva con fidelidad

- **Diseño completo**: paleta (`--cream #f7f3eb`, `--paper #fffdf8`,
  `--coral #ec6f60`, `--ink #1b2f35`, `--yellow #f5d36a`), tipografía
  Source Serif 4/Georgia, header sticky con nav de escritorio >850 px y
  menú móvil ≤850 px, hero con composición de libros, carrusel de
  novedades (misma lógica circular, teclado y swipe), rutas rápidas,
  bloque escuela, banda amarilla, footer.
- **Ficha por libro** con datos editoriales, JSON-LD `schema.org/Book`
  (mismos campos opcionales), relacionados y recursos (booktrailer,
  audiolibro, podcast, ebook).
- **Menú de compartir idéntico**: WhatsApp, Facebook, Instagram (hoja
  nativa con `navigator.share` o copiar con aviso), correo y copiar
  enlace; los cinco íconos SVG son los mismos.
- **Booktrailers tipo Netflix**: banda tinta `#16272c`, hero-reproductor
  que no carga nada de YouTube hasta el clic (miniaturas `i.ytimg.com`,
  embed `youtube-nocookie` bajo demanda), filas por edad con scroll
  horizontal. Sin JS, el póster abre YouTube y las tarjetas llevan a la
  ficha.
- **404 juguetona** con el librero SVG y sugerencias reales.
- **Mejora progresiva real**: todos los filtros y formularios funcionan
  sin JavaScript (botón «Aplicar filtros», parámetros GET); el JS solo
  añade auto-envío, carrusel, compartir y teatro.

### Se degrada (y cómo se mitiga)

| Qué | En Next | En WordPress directo | Mitigación |
| --- | --- | --- | --- |
| Tarjeta OG compuesta 1200×630 | `ImageResponse` por libro (portada + título + autor sobre crema) | `og:image` = portada del libro + `twitter:card summary` (la portada vertical se muestra completa como miniatura cuadrada; `summary_large_image` la recortaría) | Si se quiere la tarjeta compuesta: mu-plugin con GD/Imagick que componga y cachee un PNG por libro en `uploads/`, o servicio externo tipo Cloudinary/Bannerbear. Está diseñado el fallback para que no sea urgente |
| Tarjeta OG general del sitio | `opengraph-image.tsx` en build | Imagen subida a mano en Personalizador → «Tarjeta para redes sociales» | Exportar un PNG 1200×630 del rediseño y subirlo una vez |
| Redirects 308 de `/libro?slug=` | Reglas en `next.config.ts` | **No aplican**: las URLs canónicas siguen siendo `/producto/<slug>/`, nada cambia ni se redirige | Ventaja, no degradación: cero riesgo SEO en el corte |
| Sitemap | `app/sitemap.ts` | `wp-sitemap.xml` nativo de WordPress (o el de AIOSEO si sigue activo) | Elegir uno y verificar que los productos estén incluidos |
| Filtros instantáneos | Client-side, sin recarga | Parámetros GET con recarga de página | Con caché de página la recarga es barata; el auto-envío por JS conserva la sensación de inmediatez |
| «Mostrar más» acumulativo | Estado en cliente | Paginación real (24 por página) | Es incluso mejor para SEO y para compartir URLs de página |
| Búsqueda por autor/ISBN/tema | `searchText` compuesto | `s` nativo de WP: solo título, contenido y extracto | Pendiente decidir: filtro `posts_search` que sume metas, o plugin Relevanssi (ver Preguntas abiertas) |
| Rendimiento | Páginas estáticas en CDN de Vercel | PHP dinámico en cada petición | **Obligatorio** un caché de página (del hosting o plugin) para acercarse al rendimiento actual; el tema no carga jQuery ni bloques, solo 1 CSS + 1 JS |
| Favoritos locales (corazones) | localStorage en el cliente | No incluido en el tema | Decisión de alcance: es una isla de cliente pura y podría añadirse después al JS del tema sin tocar PHP |
| Tarjeta OG por página general (booktrailers, etc.) | Variantes por ruta | La imagen general del Personalizador | Aceptable; puede añadirse una imagen por página con AIOSEO |

## Plugins: mínimos recomendados y cuáles evitar

**Necesarios / ya presentes**

- **WooCommerce** — ya activo; es la fuente del catálogo. No se usa su
  frontend (el tema retira sus hojas de estilo y envoltorios).
- **Un caché de página** — el del hosting si existe (Varnish/LiteSpeed) o
  WP Super Cache / Cache Enabler. Único requisito serio de rendimiento.

**Opcionales, según decisión**

- **All in One SEO** — ya está en el sitio actual (los productos tienen
  metas `_aioseo_*`). El tema detecta si está activo: si lo está, no
  duplica etiquetas OG y solo aporta el JSON-LD de libro; si se
  desinstala, el tema emite las etiquetas OG/Twitter completas por sí
  mismo. Cualquiera de los dos caminos funciona; hay que elegir uno.
- **Relevanssi** (o un filtro propio) — solo si se decide recuperar la
  búsqueda por autor/ISBN.

**Evitar**

- Page builders (Elementor, Divi, WPBakery): el tema ya es el diseño; un
  builder lo pelearía y arruinaría el rendimiento.
- El tema **Astra** actual y sus plantillas: este tema lo sustituye por
  completo (las metas `site-sidebar-layout`, `ast-*` del export quedan
  huérfanas e inofensivas).
- Plugins de sliders/carruseles: el carrusel de novedades ya viene en el
  tema con 3 KB de JS.
- Plugins de filtros facetados (FacetWP, etc.): los filtros ya están
  resueltos con taxonomías + query vars.
- Plugins de tarjetas sociales adicionales: chocarían con AIOSEO o con el
  tema.

## Instalación (pasos para el área de tecnología)

Probar primero en staging. Con WP-CLI:

```bash
# 1. Copiar el tema (o subir el ZIP de wordpress-theme/literatura-sm)
cp -r wordpress-theme/literatura-sm wp-content/themes/

# 2. Activarlo
wp theme activate literatura-sm

# 3. Poblar las taxonomías de exploración desde los metadatos existentes
wp literatura-sm sincronizar-taxonomias

# 4. Refrescar permalinks (necesario tras registrar taxonomías)
wp rewrite flush
```

Después, en el admin:

1. **Permalinks**: verificar que estén en modo «bonito» (el sitio actual ya
   los usa: `/producto/<slug>/`).
2. **Página de booktrailers**: crear una página con slug `booktrailers` y
   asignarle la plantilla **«Booktrailers»**. El nav la enlaza por slug.
3. **Páginas de contenido**: crear (o conservar) páginas con slugs
   `planes-lectores`, `recursos`, `novedades` y `contacto`; el tema las
   enlaza por slug y, si no existen, esos enlaces caen al catálogo.
4. **Menús**: opcionalmente configurar los menús «Navegación principal» y
   «Enlaces del pie de página»; sin menús configurados el tema pinta la
   navegación por defecto del rediseño.
5. **Logo**: subir el logotipo en Apariencia → Personalizar → Identidad del
   sitio (con fallback al monograma coral «sm»).
6. **Tarjeta social general**: subir un PNG de 1200×630 en Apariencia →
   Personalizar → «Tarjeta para redes sociales».
7. **Categoría Novedades**: confirmar que los títulos nuevos tengan la
   categoría de producto `Novedades` (alimenta carrusel, 404 y sello).
8. **Caché**: activar el caché de página y verificar que excluya `wp-admin`.

Verificación sugerida: portada, `/producto/horriblemente-hermoso-119/`
(ficha con booktrailer, compartir y JSON-LD en el código fuente), catálogo
con `?edad=`, `?tema=`, `?plan=` y su combinación, búsqueda desde el hero,
`/booktrailers/`, una URL inexistente (404), y las vistas previas de
compartir con el [depurador de Meta](https://developers.facebook.com/tools/debug/).

## Riesgos y preguntas abiertas

1. **Tipografía por Google Fonts.** El tema encola Source Serif 4 desde
   `fonts.googleapis.com`. Si la política de datos exige autoalojarla
   (GDPR-like), hay que descargar los WOFF2 a `assets/fonts/` y cambiar el
   encolado por un `@font-face` local; está anotado en `functions.php`.
2. **Búsqueda por autor/ISBN.** Decidir si basta la búsqueda nativa o se
   añade Relevanssi / un filtro `posts_search` sobre las metas `autor` e
   `isbn`. El buscador del hero lo promete («título, autor o ISBN»), así
   que hoy la promesa se cumple a medias.
3. **Convivencia con AIOSEO.** ¿Se conserva (y se configuran sus tarjetas
   sociales por producto) o se retira y el tema toma el control? Ambas
   rutas están soportadas; mantener las dos a medias duplicaría etiquetas.
4. **Contenido de las páginas fijas.** `planes-lectores`, `recursos`,
   `novedades`, `sobre-sm` y `contacto` existen en el rediseño Next con
   diseño propio; en WordPress directo nacen como páginas de editor con la
   plantilla genérica. Si se quieren idénticas, cada una necesita su
   plantilla PHP (trabajo acotado, no incluido en esta primera entrega).
5. **Compra en línea.** Sigue bloqueada por la auditoría de precios
   (`data/catalog/PRICING_AUDIT.md`). Si algún día se habilita, hay que
   diseñar carrito/checkout sobre las plantillas de WooCommerce, que este
   tema hoy no estiliza.
6. **Imágenes de portada.** Se usan los adjuntos del propio WordPress (sin
   CDN externo). Con el caché de página y `loading="lazy"` alcanza, pero
   conviene revisar que las portadas tengan tamaños intermedios generados
   (`wp media regenerate` si hace falta).
7. **Módulo de favoritos.** Quedó fuera a propósito (isla puramente de
   cliente). Si el equipo lo quiere, se añade al JS del tema con
   localStorage sin tocar el servidor.
8. **Entorno mínimo.** PHP 8.0+ (el tema usa `str_starts_with` y arrow
   functions). Confirmar la versión del hosting actual.
