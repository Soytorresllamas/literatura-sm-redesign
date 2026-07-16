import { CatalogCard } from "../components/catalog-card";
import { sectionBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function WishlistPage() {
  return <ScreenShell><ScreenHero eyebrow="Tu biblioteca personal" title={<>Libros para <em>volver.</em></>} intro="Guarda títulos para leer después, compartir con tu equipo o convertir en tu próximo pedido." /><section className="screen-content"><div className="list-toolbar"><p><strong>8</strong> libros guardados</p><button className="outline-action">Compartir lista ↗</button></div><div className="section-book-grid">{sectionBooks.slice(0, 4).map((book) => <CatalogCard key={book.title} book={book} buy />)}</div></section></ScreenShell>;
}
