# Plan de migración headless: WordPress + Next.js

Este documento describe cómo llevar el sitio actual (WordPress/WooCommerce en
`literatura.grupo-sm.com.mx`) a una arquitectura headless: WordPress se
conserva como panel de administración y fuente de catálogo, y este proyecto
Next.js desplegado en Vercel (`https://literatura-sm-redesign.vercel.app`)
pasa a ser el sitio público. Es una decisión ya aprobada por el dueño del
producto; lo que falta es ejecutarla por fases.

## Objetivo y arquitectura

- WordPress/WooCommerce deja de servir HTML al público y queda como back
  office: ahí se cargan productos, precios, imágenes y contenido editorial.
- Este repositorio (Next.js en Vercel) se convierte en el frente público.
  El dominio `literatura.grupo-sm.com.mx` se apunta a Vercel mediante un
  registro CNAME (o A/ALIAS según lo soporte el DNS actual), y WordPress se
  reubica en un subdominio dedicado, por ejemplo `admin.literatura.grupo-sm.com.mx`,
  para que el equipo editorial siga entrando a `/wp-admin` sin fricción.
- El repositorio ya tiene auto-deploy configurado desde `main` en GitHub
  hacia Vercel, por lo que el corte de dominio no requiere cambios de
  pipeline, solo de DNS y de las variables de entorno descritas más abajo.

## Mapeo de datos (ya probado en este repo)

El pipeline de este repo ya demuestra que el mapeo WooCommerce → catálogo
Next.js funciona con datos reales, no es un supuesto:

- **Producto WooCommerce → `BookRecord`.** `scripts/build-catalog-assets.mjs`
  toma el export normalizado en `data/wordpress/books.json` (360 productos
  publicados en la extracción vigente) y genera `data/catalog/catalog-index.json`
  y `data/catalog/book-details.json`, que son los archivos que consume la app.
  El proceso de origen está documentado en `data/wordpress/README.md`:
  `ruby scripts/import-wordpress-catalog.rb <csv> data/wordpress` seguido de
  `npm run catalog:build`.
- **Taxonomía `categoria-producto` → `plans` y facetas.** La función
  `extractPlans()` del script interpreta categorías con el patrón
  `Loran > <nivel>` o `Trotamundos <nivel>` y arma la lista de planes lectores
  por libro; también agrupa por edad/tema para las facetas de exploración.
  El plan **Cosmos** no viene de una categoría explícita: se deriva cuando
  `editorial.schoolLevel === "Bachillerato"`, usando el grado escolar como
  nivel. Esta regla ya está implementada y cubierta por el build actual.
- **Imágenes.** Ya se sirven directamente desde el CDN de WordPress sin
  reprocesarlas: `next.config.ts` declara
  `remotePatterns` para `literatura.grupo-sm.com.mx/wp-content/uploads/**`,
  así que las URLs de `wp-content/uploads` que trae el export funcionan sin
  cambios en `next/image`.

## Fases de sincronización

1. **Hoy (estático, manual).** El flujo vigente es
   export CSV de WooCommerce → `data/wordpress/books.json` →
   `npm run catalog:build` → build de Next.js. No hay automatización: alguien
   debe exportar el CSV desde el admin de WooCommerce y correr el script a
   mano cada vez que cambia el catálogo. Válido para el estado actual
   (sitio de solo lectura), pero no escala si el catálogo cambia seguido.
2. **Corto plazo: fetch en build time a la REST API.** Sustituir el CSV
   manual por una llamada en tiempo de build a
   `GET /wp-json/wc/v3/products` (WooCommerce REST API) usando credenciales
   de solo lectura (consumer key/secret) guardadas como variables de entorno
   en Vercel, nunca en el repo. El disparo del rebuild se automatiza con un
   **Deploy Hook de Vercel**: se crea una URL de hook en la configuración del
   proyecto y WordPress la llama vía un webhook nativo de WooCommerce
   (`woocommerce_update_product` / `woocommerce_new_product`) cada vez que se
   publica o edita un producto. Esto reemplaza el paso manual sin cambiar la
   forma en que la app consume los datos (sigue siendo JSON generado en
   build).
3. **Mediano plazo: ISR con `revalidate`.** Una vez que el fetch a la REST
   API esté estable, se puede pasar de "rebuild completo por webhook" a
   Incremental Static Regeneration con `revalidate` en las rutas de catálogo
   (`/seccion`, `/libro`, `/categoria`), de modo que los datos se refresquen
   solos cada N segundos sin depender de que el webhook dispare un deploy.
   Reduce la dependencia operativa del webhook y tolera mejor picos de
   publicación editorial.

## Rutas y SEO

- Se necesita un **mapa de redirecciones 301** de las URLs actuales de
  WordPress a las rutas nuevas de Next.js antes de mover el dominio, para no
  perder el posicionamiento existente. Los dos patrones principales:
  - `categoria-producto/*` (taxonomía de planes/niveles) → `/seccion?plan=…`
  - `producto/*` (ficha de producto WooCommerce) → `/libro?slug=…`
  Este mapa se implementa como reglas de `redirects()` en `next.config.ts`
  (ya existe un precedente ahí: la redirección de `/lista` a `/seccion`) o
  a nivel de Vercel si el volumen de reglas crece demasiado para el config.
- El sitemap ya está resuelto en código: `app/sitemap.ts` genera las páginas
  fijas del sitio (`/`, `/seccion`, `/buscar`, `/novedades`, `/recursos`,
  `/planes-lectores`, `/autores`, `/sobre-sm`, `/contacto`) más una entrada
  `/libro?slug=…` por cada libro del catálogo, con
  `https://literatura-sm-redesign.vercel.app` como base. `app/robots.ts` ya
  permite el rastreo completo y apunta a ese sitemap. No requieren cambios
  para el corte de dominio, salvo actualizar `baseUrl` si el dominio público
  final cambia respecto al de Vercel.
- Conservar los metadatos Open Graph existentes (título, descripción, imagen)
  al migrar cada tipo de página, para no degradar las vistas previas en
  redes sociales durante la transición.

## Comercio (fase posterior)

- El carrito y el checkout se implementarían contra la **WooCommerce Store
  API**, reutilizando WordPress como motor de pedidos e inventario.
- Esta fase está **bloqueada hoy** por la auditoría de precios documentada en
  `data/catalog/PRICING_AUDIT.md`: de 360 productos publicados, solo 1 tiene
  precio cargado (0.28% de cobertura, contra un mínimo interno de 95%), y ese
  único precio ($8,000 MXN, SKU 174853) supera el umbral de revisión manual
  de $5,000 MXN. La compuerta de comercio (`pricing-audit.json`) marca
  explícitamente `readyForCommerce: false`.
- Prerrequisitos antes de retomar esta fase:
  1. Lista maestra de precios vigentes en MXN por SKU o ISBN.
  2. Confirmación comercial del importe del producto con SKU 174853.
  3. Reglas de impuestos, envío, descuentos e inventario.
  4. Aprobación comercial documentada del catálogo final de precios.

## Esfuerzo estimado y riesgos

- **Fase 2 (fetch en build + Deploy Hook):** 2–4 días. Incluye construir el
  cliente de la REST API, gestionar credenciales en Vercel, configurar el
  webhook de WooCommerce y el Deploy Hook, y probar que el build tolere
  productos incompletos o la caída temporal del endpoint.
- **Fase 3 (ISR):** 1–2 días adicionales sobre la fase 2, principalmente
  ajustar `revalidate` por ruta y validar el comportamiento de caché.
- **Comercio:** por cotizar una vez resueltos los prerrequisitos de precios;
  depende de un insumo (lista maestra) que no controla este equipo técnico.
- **Riesgos:**
  - *Límites de la REST API de WooCommerce* (rate limiting o paginación) si
    el catálogo crece o el build se dispara con mucha frecuencia.
  - *Divergencia de slugs* entre WordPress y Next.js si alguien renombra un
    producto o una categoría sin actualizar el mapa de redirecciones 301.
  - *DNS/SSL del dominio* durante el corte: hay que coordinar el cambio de
    CNAME y la emisión de certificado en Vercel para minimizar el tiempo de
    indisponibilidad, e idealmente probar primero con el subdominio de
    WordPress ya reubicado.
