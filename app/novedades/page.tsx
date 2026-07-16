import { CatalogCard } from "../components/catalog-card";
import { sectionBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function NovedadesPage() {
  return <ScreenShell><ScreenHero eyebrow="Lo más reciente" title={<>Novedades para <em>descubrir.</em></>} intro="Nuevas historias, ediciones especiales y lecturas que llegan para acompañar cada etapa." /><section className="screen-content"><div className="section-heading"><div><p className="eyebrow">Selección editorial</p><h2>Acaba de llegar</h2></div><a className="arrow-link" href="/seccion">Ver todo el catálogo ↗</a></div><div className="section-book-grid">{sectionBooks.map((book) => <CatalogCard key={book.title} book={book} buy />)}</div></section></ScreenShell>;
}
