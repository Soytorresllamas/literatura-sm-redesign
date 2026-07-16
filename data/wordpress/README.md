# Catálogo WordPress

Este directorio conserva una extracción de solo lectura del catálogo de Literatura SM.

- `books.raw.csv`: exportación íntegra de WooCommerce, incluidos los metadatos personalizados.
- `books.json`: versión normalizada para consumo desde el desarrollo.
- `catalog-summary.json`: conteos y cobertura de los campos principales.

El archivo normalizado convierte las URLs de imágenes del dominio de Literatura SM a HTTPS. El CSV mantiene exactamente los valores de origen.

Para regenerar los JSON desde una exportación nueva:

```bash
ruby scripts/import-wordpress-catalog.rb ruta/al/catalogo.csv data/wordpress
npm run catalog:build
```

Los archivos optimizados para el sitio se generan en `data/catalog/`:

- `catalog-index.json`: índice ligero para home, búsqueda y listados.
- `book-details.json`: descripciones y metadatos usados únicamente en fichas.
- `pricing-audit.json`: cobertura y compuerta de comercio en formato estructurado.
- `PRICING_AUDIT.md`: reporte legible para validación editorial y comercial.
