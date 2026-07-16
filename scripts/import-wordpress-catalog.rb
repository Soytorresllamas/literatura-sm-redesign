#!/usr/bin/env ruby

require "csv"
require "json"
require "fileutils"
require "time"

source_path = ARGV.fetch(0)
output_dir = ARGV.fetch(1, File.expand_path("../data/wordpress", __dir__))

FileUtils.mkdir_p(output_dir)
rows = CSV.read(source_path, headers: true, encoding: "bom|utf-8")

def present(value)
  text = value.to_s.strip
  text.empty? ? nil : text
end

def number(value)
  text = present(value)
  return nil unless text

  text.include?(".") ? text.to_f : text.to_i
end

def truthy(value)
  %w[1 yes si sí true].include?(value.to_s.strip.downcase)
end

def list(value)
  value.to_s.split(/,\s*/).map(&:strip).reject(&:empty?)
end

def secure_urls(value)
  list(value).map { |url| url.sub(%r{\Ahttp://literatura\.grupo-sm\.com\.mx}, "https://literatura.grupo-sm.com.mx") }
end

def slugify(value, id)
  slug = value.to_s.unicode_normalize(:nfkd).encode("ASCII", invalid: :replace, undef: :replace, replace: "")
    .downcase
    .gsub(/[^a-z0-9]+/, "-")
    .gsub(/\A-+|-+\z/, "")
  slug.empty? ? "libro-#{id}" : "#{slug}-#{id}"
end

books = rows.map do |row|
  id = row["ID"].to_i
  isbn = present(row["Meta: isbn"]) || present(row["GTIN, UPC, EAN o ISBN"])

  {
    id: id,
    slug: slugify(row["Nombre"], id),
    status: row["Publicado"] == "1" ? "published" : "draft",
    type: present(row["Tipo"]),
    sku: present(row["SKU"]),
    gtin: present(row["GTIN, UPC, EAN o ISBN"]),
    title: present(row["Nombre"]),
    featured: truthy(row["¿Está destacado?"]),
    catalogVisibility: present(row["Visibilidad en el catálogo"]),
    shortDescription: present(row["Descripción corta"]),
    description: present(row["Descripción"]),
    pricing: {
      regular: number(row["Precio normal"]),
      sale: number(row["Precio rebajado"]),
      saleStartsAt: present(row["Día en que empieza el precio rebajado"]),
      saleEndsAt: present(row["Día en que termina el precio rebajado"])
    },
    inventory: {
      inStock: truthy(row["¿Existencias?"]),
      quantity: number(row["Inventario"]),
      lowStockThreshold: number(row["Cantidad de bajo inventario"]),
      backorders: present(row["¿Permitir reservas de productos agotados?"]),
      soldIndividually: truthy(row["¿Vendido individualmente?"])
    },
    dimensions: {
      weightKg: number(row["Peso (kg)"]),
      lengthCm: number(row["Longitud (cm)"]),
      widthCm: number(row["Anchura (cm)"]),
      heightCm: number(row["Altura (cm)"])
    },
    categories: list(row["Categorías"]),
    tags: list(row["Etiquetas"]),
    images: secure_urls(row["Imágenes"]),
    editorial: {
      sap: present(row["Meta: SAP"]),
      collection: present(row["Meta: coleccion"]),
      author: present(row["Meta: autor"]),
      authorNationality: present(row["Meta: nacionalidad_del_autor"]) || present(row["Meta: nacionalidad"]),
      illustrator: present(row["Meta: ilustrador"]),
      illustratorNationality: present(row["Meta: nacionalidad_del_ilustrador"]),
      genre: present(row["Meta: genero"]),
      themes: list(row["Meta: temas"]),
      keywords: list(row["Meta: palabras_claves"]),
      age: present(row["Meta: edad"]),
      schoolLevel: present(row["Meta: nivel_escolar"]),
      schoolGrade: present(row["Meta: grado_escolar"]),
      model: present(row["Meta: modelo"]),
      isbn: isbn,
      format: present(row["Meta: formato"]),
      pages: number(row["Meta: paginas"]),
      binding: present(row["Meta: encuadernacion"]),
      novelty: truthy(row["Meta: novedad"]),
      difficulty: present(row["Meta: dificultad"]),
      planLevel: present(row["Meta: nivel_plan"]),
      educationalBooks: present(row["Meta: libros_pedagogicos"])
    },
    links: {
      amazonEbook: present(row["Meta: liga_ebook_amazon"]),
      audiobook: present(row["Meta: liga_audiolibros"]),
      bookTrailer: present(row["Meta: liga_de_booktrailer"]),
      podcast: present(row["Meta: liga_podcast"]),
      external: present(row["URL externa"])
    },
    seo: {
      openGraphTitle: present(row["Meta: _aioseo_og_title"]),
      openGraphDescription: present(row["Meta: _aioseo_og_description"]),
      articleSection: present(row["Meta: _aioseo_og_article_section"]),
      twitterTitle: present(row["Meta: _aioseo_twitter_title"]),
      twitterDescription: present(row["Meta: _aioseo_twitter_description"])
    },
    reviewsAllowed: truthy(row["¿Permitir valoraciones de clientes?"]),
    purchaseNote: present(row["Nota de compra"]),
    position: number(row["Posición"])
  }
end

coverage = {
  images: books.count { |book| book[:images].any? },
  author: books.count { |book| book.dig(:editorial, :author) },
  isbn: books.count { |book| book.dig(:editorial, :isbn) },
  description: books.count { |book| book[:description] },
  shortDescription: books.count { |book| book[:shortDescription] }
}

summary = {
  generatedAt: Time.now.utc.iso8601,
  source: "WooCommerce product CSV export with custom metadata",
  total: books.length,
  published: books.count { |book| book[:status] == "published" },
  drafts: books.count { |book| book[:status] == "draft" },
  sourceColumns: rows.headers.length,
  coverage: coverage
}

File.write(File.join(output_dir, "books.json"), JSON.pretty_generate(books) + "\n")
File.write(File.join(output_dir, "catalog-summary.json"), JSON.pretty_generate(summary) + "\n")

puts JSON.pretty_generate(summary)
