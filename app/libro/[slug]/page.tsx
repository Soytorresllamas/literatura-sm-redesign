import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "../../components/book-cover";
import { catalogBooks, getRelatedBooks } from "../../components/book-data";
import { findDetailedBookBySlug, type DetailedBookRecord } from "../../components/book-detail-data";
import { FavoriteButton } from "../../components/favorite-button";
import { SectionHeader } from "../../components/section-header";
import { ShareMenu } from "../../components/share-menu";
import { SiteFooter } from "../../components/site-footer";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogBooks.map((book) => ({ slug: book.slug }));
}

// El catálogo viaja con el build: fuera de los 388 slugs prerenderizados no
// hay libro que renderizar, y así el 404 llega con estatus real pese al
// streaming de loading.tsx y de los metadatos.
export const dynamicParams = false;

function shareDescription(book: DetailedBookRecord) {
  const text = book.description || book.note || "Consulta la ficha editorial de este título y descubre su propuesta de lectura.";
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = findDetailedBookBySlug(slug);
  // notFound() aquí y no solo en el cuerpo: loading.tsx hace stream del shell
  // con 200 antes de renderizar la página; los metadatos resuelven antes.
  if (!book) notFound();
  const description = shareDescription(book);
  const image = { url: `/og/libro/${book.slug}`, width: 1200, height: 630, alt: `${book.title}, de ${book.author}` };
  return {
    title: `${book.title} | SM Literatura`,
    description,
    alternates: { canonical: `/libro/${book.slug}` },
    openGraph: {
      title: book.title,
      description,
      type: "book",
      locale: "es_MX",
      url: `/libro/${book.slug}`,
      authors: [book.author],
      isbn: book.isbn,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: book.title, description, images: [image.url] },
  };
}

function bookJsonLd(book: DetailedBookRecord) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    publisher: { "@type": "Organization", name: "Ediciones SM" },
    inLanguage: "es",
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.pages ? { numberOfPages: book.pages } : {}),
    ...(book.image ? { image: book.image } : {}),
    ...(book.genre ? { genre: book.genre } : {}),
    ...(book.description || book.note ? { description: book.description || book.note } : {}),
  };
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const book = findDetailedBookBySlug(slug);
  if (!book) notFound();

  const related = getRelatedBooks(book);
  const resources = [
    { label: "Booktrailer", description: "Conoce la historia en video", icon: "▶", href: book.links.bookTrailer },
    { label: "Audiolibro", description: "Escucha una muestra o la edición disponible", icon: "◉", href: book.links.audiobook },
    { label: "Podcast", description: "Conversaciones alrededor del libro", icon: "◎", href: book.links.podcast },
    { label: "Ebook", description: "Consulta la edición digital", icon: "↗", href: book.links.amazonEbook },
  ].filter((resource) => resource.href);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd(book)) }} />
      <SectionHeader />
      <div className="book-breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/seccion">Explorar libros</Link>
        <span>/</span>
        <strong>{book.title}</strong>
      </div>
      <section className="book-detail">
        <div className="detail-visual">
          {book.novelty && <span className="detail-label">Novedad</span>}
          <BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} large />
          <ShareMenu title={`${book.title} | SM Literatura`} text={`«${book.title}», de ${book.author}. ${shareDescription(book)}`} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{book.series} · {book.age}</p>
          <h1>{book.title}</h1>
          <p className="detail-author"><Link href={`/autor?nombre=${encodeURIComponent(book.author)}`}>{book.author}</Link></p>
          <p className="detail-description">{book.description || book.note || "Consulta la ficha editorial de este título y descubre su propuesta de lectura."}</p>
          <div className="detail-actions">
            <FavoriteButton book={book} variant="detail" />
          </div>
          <div className="detail-tags">
            <span>{book.age}</span>
            {book.school && <span>{book.school}</span>}
            <span>{book.level}</span>
            <span>{book.theme}</span>
          </div>
        </div>
      </section>
      <section className="book-info-section">
        <div className="book-info-intro">
          <p className="eyebrow">Conoce el libro</p>
          <h2>Una lectura para<br /><em>crecer juntos.</em></h2>
        </div>
        <div className="book-info-grid">
          <div>
            <h3>Sobre la historia</h3>
            <p>{book.note || book.description || "Una propuesta de Literatura SM para acompañar el encuentro entre lectores e historias."}</p>
          </div>
          <div>
            <h3>Datos editoriales</h3>
            <dl>
              <dt>Autor</dt>
              <dd>{book.author}</dd>
              {book.illustrator && <><dt>Ilustrador</dt><dd>{book.illustrator}</dd></>}
              <dt>ISBN</dt>
              <dd>{book.isbn || "Por confirmar"}</dd>
              <dt>Páginas</dt>
              <dd>{book.pages || "Por confirmar"}</dd>
              {book.format && <><dt>Formato</dt><dd>{book.format}</dd></>}
              {book.binding && <><dt>Encuadernación</dt><dd>{book.binding}</dd></>}
            </dl>
          </div>
          <div>
            <h3>Recursos disponibles</h3>
            {resources.length ? (
              <ul className="resource-list">
                {resources.map((resource) => (
                  <li key={resource.label}>
                    <span>{resource.icon}</span>
                    <a href={resource.href || "#"} target="_blank" rel="noreferrer">
                      <strong>{resource.label}</strong>
                      <small>{resource.description}</small>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Los recursos complementarios se publicarán en esta ficha cuando estén disponibles.</p>
            )}
          </div>
        </div>
      </section>
      <section className="related-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">También puede gustarte</p>
            <h2>Más historias para {book.ageGroup}</h2>
          </div>
          <Link className="arrow-link" href="/seccion">Ver catálogo <span>↗</span></Link>
        </div>
        <div className="related-books">
          {related.map((item) => (
            <div className="related-item" key={item.slug}>
              <Link href={`/libro/${item.slug}`}>
                <BookCover title={item.title} author={item.author} color={item.color} accent={item.accent} image={item.image} />
              </Link>
              <strong>{item.title}</strong>
              <span>{item.author}</span>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
