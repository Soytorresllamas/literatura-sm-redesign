# Literatura SM — rediseño

Rediseño del sitio de **Literatura SM** (catálogo de Literatura Infantil y
Juvenil). Aplicación **Next.js 16** (App Router) desplegada en **Vercel**.

## Requisitos

- Node.js `>=22.13.0`

## Comandos

```bash
npm install
npm run dev     # desarrollo local (next dev)
npm run build   # build de producción (next build --webpack)
npm start       # sirve el build (next start)
npm test        # build + suite de pruebas (node --test)
npm run lint    # eslint
```

### Catálogo

El catálogo se genera a partir de exportaciones de WordPress:

```bash
npm run catalog:build   # regenera los assets del catálogo en data/catalog
npm run catalog:check   # valida que los assets estén al día
```

## Estructura

- `app/` — código del sitio (App Router: home, `seccion`, `libro`, `autores`,
  `buscar`, carrito/checkout, `mi-cuenta`, etc.)
- `app/lib/features.ts` — banderas de funcionalidad (p. ej. `FAVORITES_UI_ENABLED`)
- `app/components/` — componentes y datos del catálogo
- `data/` — datos del catálogo (las exportaciones crudas de WordPress se ignoran en git)
- `scripts/` — utilidades de importación y build del catálogo
- `tests/` — pruebas con el runner nativo de Node

## Despliegue

Cada push a `main` despliega a producción en Vercel automáticamente. Los pushes
a otras ramas generan despliegues de vista previa.

## Autenticación de workspace (opcional)

`app/chatgpt-auth.ts` incluye helpers para Sign in with ChatGPT
(`getChatGPTUser`, `requireChatGPTUser`). El contenido público permanece
anónimo; usa estos helpers solo para páginas de cuenta o acciones por usuario.
