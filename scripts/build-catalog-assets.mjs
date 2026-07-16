#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data/wordpress/books.json");
const summaryPath = path.join(root, "data/wordpress/catalog-summary.json");
const outputDir = path.join(root, "data/catalog");
const checkOnly = process.argv.includes("--check");
const books = JSON.parse(await readFile(sourcePath, "utf8"));
const summary = JSON.parse(await readFile(summaryPath, "utf8"));

const palettes = [
  ["#f6b94b", "#145f63"],
  ["#ef6f61", "#fff2cf"],
  ["#9c6bba", "#f7ce5b"],
  ["#7aaed6", "#fff2cf"],
  ["#24566a", "#efb04d"],
  ["#37334f", "#ed7d70"],
];

const entities = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": "\"", "&#039;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">",
  "&aacute;": "á", "&eacute;": "é", "&iacute;": "í", "&oacute;": "ó", "&uacute;": "ú", "&ntilde;": "ñ",
  "&Aacute;": "Á", "&Eacute;": "É", "&Iacute;": "Í", "&Oacute;": "Ó", "&Uacute;": "Ú", "&Ntilde;": "Ñ",
};

function plainText(value) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#039|apos|lt|gt|aacute|eacute|iacute|oacute|uacute|ntilde|Aacute|Eacute|Iacute|Oacute|Uacute|Ntilde);/g, (entity) => entities[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return value.replace(/(^|[\s/])-?\p{L}/gu, (match) => match.toUpperCase());
}

function normalizeAge(value) {
  if (!value) return "Para todas las edades";
  return titleCase(value.replace(/\s*\+/, "+").replace(/0\s+a\s+5(?:\s+años)?/i, "0–5 años"));
}

function ageGroup(value, schoolLevel) {
  const age = value?.toLowerCase().replace(/\s/g, "") ?? "";
  if (age.includes("docente")) return "Docentes";
  if (schoolLevel?.toLowerCase().includes("bachillerato")) return "Bachillerato";
  if (age.includes("0a5") || age.startsWith("3+") || age.startsWith("5+")) return "0–5";
  if (age.startsWith("6+") || age.startsWith("7+")) return "6–8";
  if (age.startsWith("9+")) return "9–11";
  if (age.startsWith("12+") || age.startsWith("13+") || age.startsWith("14+")) return "12–14";
  if (schoolLevel && !/^todas$/i.test(schoolLevel)) return schoolLevel;
  return "Todas las edades";
}

function selectSeries(book) {
  if (book.editorial.collection) return titleCase(book.editorial.collection);
  const ignored = /^(LIJ|Novedad|\d+\s*\+|Primaria|Secundaria|Bachillerato|Preescolar|0 a 5)/i;
  return book.categories.find((category) => !ignored.test(category)) ?? "Literatura SM";
}

function optionalEntries(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

const published = books.filter((book) => book.status === "published");
const catalog = published.map((book) => {
  const palette = palettes[Math.abs(book.id) % palettes.length];
  const description = plainText(book.description);
  const note = plainText(book.shortDescription) || description.slice(0, 220);
  const themes = book.editorial.themes.map(titleCase);
  const genre = titleCase(book.editorial.genre || "Literatura");
  const author = book.editorial.author || "Autor por confirmar";
  const level = book.editorial.schoolGrade || book.editorial.schoolLevel || book.editorial.planLevel || "Lectura libre";
  const searchText = [book.title, author, book.editorial.isbn, book.editorial.collection, book.editorial.genre, ...themes, ...book.categories, ...book.tags].filter(Boolean).join(" ").toLowerCase();
  return optionalEntries({
    id: book.id,
    slug: book.slug,
    title: book.title,
    author,
    authorNationality: book.editorial.authorNationality,
    age: normalizeAge(book.editorial.age),
    ageGroup: ageGroup(book.editorial.age, book.editorial.schoolLevel),
    school: book.editorial.schoolLevel,
    level: titleCase(level),
    series: selectSeries(book),
    genre,
    theme: themes[0] || genre,
    themes,
    color: palette[0],
    accent: palette[1],
    image: book.images[0],
    novelty: book.editorial.novelty,
    featured: book.featured,
    note,
    format: book.editorial.format,
    searchText,
  });
}).sort((a, b) => b.id - a.id);

const details = published.map((book) => optionalEntries({
  slug: book.slug,
  description: plainText(book.description) || plainText(book.shortDescription),
  note: plainText(book.shortDescription),
  illustrator: book.editorial.illustrator,
  illustratorNationality: book.editorial.illustratorNationality,
  images: book.images,
  isbn: book.editorial.isbn || book.gtin,
  pages: book.editorial.pages,
  format: book.editorial.format,
  binding: book.editorial.binding,
  links: book.links,
})).sort((a, b) => a.slug.localeCompare(b.slug, "es"));

const pricedProducts = published
  .filter((book) => (book.pricing.sale ?? book.pricing.regular) != null)
  .map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    sku: book.sku,
    gtin: book.gtin,
    regularPrice: book.pricing.regular,
    salePrice: book.pricing.sale,
    inStock: book.inventory.inStock,
    manualReview: (book.pricing.sale ?? book.pricing.regular) >= 5000,
  }));
const missingPrice = published.length - pricedProducts.length;
const pricingAudit = {
  generatedAt: summary.generatedAt,
  source: "WooCommerce product CSV export",
  currency: "MXN",
  scope: { publishedProducts: published.length },
  coverage: {
    withPrice: pricedProducts.length,
    missingPrice,
    percentWithPrice: Number(((pricedProducts.length / published.length) * 100).toFixed(2)),
  },
  pricedProducts,
  rules: {
    minimumCoveragePercent: 95,
    manualReviewAtOrAbove: 5000,
  },
  findings: [
    { code: "PRICE_COVERAGE_BLOCKER", severity: "blocker", count: missingPrice, message: "Productos publicados sin precio." },
    { code: "HIGH_VALUE_MANUAL_REVIEW", severity: "review", count: pricedProducts.filter((product) => product.manualReview).length, message: "Importes que requieren confirmación comercial según el umbral interno del proyecto." },
  ],
  decision: {
    readyForCommerce: false,
    reason: "La cobertura de precios está por debajo del mínimo y el único importe disponible requiere revisión manual.",
  },
};

const pricingMarkdown = `# Auditoría de precios\n\n` +
  `Fecha de la extracción: ${summary.generatedAt}\n\n` +
  `## Hechos verificados\n\n` +
  `- Productos publicados: ${published.length}.\n` +
  `- Productos con precio: ${pricedProducts.length} (${pricingAudit.coverage.percentWithPrice}%).\n` +
  `- Productos sin precio: ${missingPrice}.\n` +
  `- Único importe disponible: $${pricedProducts[0]?.regularPrice?.toLocaleString("es-MX") ?? "0"} MXN para \`${pricedProducts[0]?.title ?? "Sin producto"}\`.\n\n` +
  `## Decisión aplicada\n\n` +
  `La compra en línea permanece desactivada. La cobertura está por debajo del mínimo interno de ${pricingAudit.rules.minimumCoveragePercent}% y el único importe supera el umbral de revisión manual de $${pricingAudit.rules.manualReviewAtOrAbove.toLocaleString("es-MX")} MXN.\n\n` +
  `## Información necesaria para habilitar comercio\n\n` +
  `1. Lista maestra de precios vigentes en MXN, identificada por SKU o ISBN.\n` +
  `2. Confirmación del importe del producto con SKU ${pricedProducts[0]?.sku ?? "sin SKU"}.\n` +
  `3. Reglas de impuestos, envío, descuentos e inventario.\n` +
  `4. Aprobación comercial documentada del catálogo final.\n`;

const outputs = new Map([
  ["catalog-index.json", `${JSON.stringify(catalog, null, 2)}\n`],
  ["book-details.json", `${JSON.stringify(details, null, 2)}\n`],
  ["pricing-audit.json", `${JSON.stringify(pricingAudit, null, 2)}\n`],
  ["PRICING_AUDIT.md", pricingMarkdown],
]);

await mkdir(outputDir, { recursive: true });
for (const [filename, content] of outputs) {
  const destination = path.join(outputDir, filename);
  if (checkOnly) {
    const current = await readFile(destination, "utf8").catch(() => "");
    if (current !== content) throw new Error(`${filename} is stale. Run npm run catalog:build.`);
  } else {
    await writeFile(destination, content);
  }
}

console.log(JSON.stringify({ mode: checkOnly ? "check" : "write", catalog: catalog.length, details: details.length, pricingReady: pricingAudit.decision.readyForCommerce }, null, 2));
