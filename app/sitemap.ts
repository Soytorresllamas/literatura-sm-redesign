import type { MetadataRoute } from "next";
import { catalogBooks } from "./components/book-data";

const baseUrl = "https://literatura-sm-redesign.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/seccion", "/buscar", "/novedades", "/recursos", "/planes-lectores", "/autores", "/sobre-sm", "/contacto"];
  return [
    ...pages.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() })),
    ...catalogBooks.map((book) => ({ url: `${baseUrl}/libro?slug=${book.slug}`, lastModified: new Date() })),
  ];
}
