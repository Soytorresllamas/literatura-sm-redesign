import Link from "next/link";
import { CatalogCard } from "../components/catalog-card";
import { newestBooks } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function NovedadesPage() {
  return (
    <ScreenShell>
      <ScreenHero
        eyebrow="Lo más reciente"
        title={<>Novedades para <em>descubrir.</em></>}
        intro={`${newestBooks.length} historias y ediciones recientes para acompañar cada etapa.`}
      />
      <section className="screen-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selección editorial</p>
            <h2>Acaba de llegar</h2>
          </div>
          <Link className="arrow-link" href="/seccion">Ver todo el catálogo ↗</Link>
        </div>
        <div className="section-book-grid">
          {newestBooks.map((book) => <CatalogCard key={book.slug} book={book} />)}
        </div>
      </section>
    </ScreenShell>
  );
}
