import { CatalogCard } from "../components/catalog-card";
import { sectionBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function AuthorPage() {
  return <ScreenShell><ScreenHero eyebrow="Autor" title={<>M. B. <em>Brozon.</em></>} intro="Escritora mexicana de literatura infantil y juvenil. Sus historias mezclan humor, amistad y crecimiento." /><section className="author-profile"><div className="author-profile-mark">MB</div><div><p className="eyebrow">Sobre la autora</p><h2>Historias para crecer<br /><em>sin dejar de jugar.</em></h2><p>Conoce una selección de libros, entrevistas y recursos para acompañar la lectura.</p><a className="arrow-link" href="/recursos">Ver recursos de autora ↗</a></div></section><section className="screen-content"><div className="section-heading"><div><p className="eyebrow">Bibliografía</p><h2>Sus libros</h2></div></div><div className="section-book-grid">{sectionBooks.slice(0, 3).map((book) => <CatalogCard key={book.title} book={book} />)}</div></section></ScreenShell>;
}
