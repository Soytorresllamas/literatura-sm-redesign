"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookCover } from "./components/book-cover";
import { ageFacets, catalogBooks, newestBooks, themeFacets, type BookRecord } from "./components/book-data";
import { trailerEntries } from "./components/trailer-data";
import { FavoriteButton } from "./components/favorite-button";
import { NoveltyCarousel } from "./components/novelty-carousel";
import { SectionHeader } from "./components/section-header";
import { SiteFooter } from "./components/site-footer";

const books = catalogBooks;

const ageOrder = ["0–5", "6–8", "9–11", "12–14", "Secundaria", "Bachillerato", "Docentes", "Todas las edades"];
const ages = ["Todas", ...ageFacets.map((item) => item.name).filter((item) => item !== "Todas").sort((a, b) => {
  const aIndex = ageOrder.indexOf(a);
  const bIndex = ageOrder.indexOf(b);
  return (aIndex === -1 ? ageOrder.length : aIndex) - (bIndex === -1 ? ageOrder.length : bIndex) || a.localeCompare(b, "es");
})];
const themes = themeFacets.slice(0, 12).map((item) => item.name);

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("Todas");
  const [theme, setTheme] = useState("Todos");
  const [selected, setSelected] = useState<BookRecord | null>(null);
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesQuery = book.searchText.includes(query.toLowerCase());
    const matchesAge = age === "Todas" || book.ageGroup === age;
    const matchesTheme = theme === "Todos" || book.theme === theme || book.themes.includes(theme);
    return matchesQuery && matchesAge && matchesTheme;
  }), [age, query, theme]);

  return (
    <main>
      <SectionHeader />

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Literatura infantil y juvenil · México</p>
          <h1>Encuentra una historia para <em>cada momento.</em></h1>
          <p className="hero-intro">Libros para descubrir, conversar y leer juntos en casa o en la escuela.</p>
          <div className="hero-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(12); }} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/buscar?q=${encodeURIComponent(query)}`); }} placeholder="Busca por título, autor o ISBN" aria-label="Buscar libros" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="hero-links">
            <Link href="/seccion">Explorar el catálogo <span>↗</span></Link>
            <a href="#escuela">Elegir para mi grupo <span>↗</span></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Composición de libros de colores">
          <div className="tape tape-one" />
          <div className="hero-book hero-book-back"><span>historias<br />que dejan<br />huella</span></div>
          <div className="hero-book hero-book-front"><span>leer<br /><strong>juntos</strong></span><small>SM literatura</small></div>
          <div className="hero-sparkle">✦</div>
          <div className="hero-note">Una buena historia<br /><strong>siempre encuentra</strong><br />a su lector.</div>
        </div>
      </section>

      <NoveltyCarousel books={newestBooks} />

      <section className="quick-paths" aria-label="Rutas rápidas">
        <div className="section-label">Empieza por aquí</div>
        <div className="path-grid">
          <Link className="path-card path-coral" href="/seccion">
            <span className="path-icon">✺</span>
            <span><strong>Para cada edad</strong><small>De primeros lectores a bachillerato</small></span>
            <b>↗</b>
          </Link>
          <Link className="path-card path-yellow" href="/categoria?tema=Emociones">
            <span className="path-icon">◒</span>
            <span><strong>Por tema</strong><small>Aventura, emociones, misterio y más</small></span>
            <b>↗</b>
          </Link>
          <Link className="path-card path-blue" href="/planes-lectores">
            <span className="path-icon">▦</span>
            <span><strong>Para la escuela</strong><small>Planes lectores y recursos docentes</small></span>
            <b>↗</b>
          </Link>
        </div>
      </section>

      <section className="catalog-section" id="explorar">
        <div className="section-heading">
          <div><p className="eyebrow">Para descubrir hoy</p><h2>Historias que abren mundos</h2></div>
          <Link className="arrow-link" href="/seccion">Ver todo el catálogo <span>↗</span></Link>
        </div>
        <div className="catalog-filter-panel">
          <div className="filter-panel-heading">
            <div><p className="eyebrow">Encuentra más rápido</p><h3>Elige una lectura para cada etapa.</h3></div>
            <div className="filter-result-count" aria-live="polite"><strong>{filteredBooks.length}</strong><span>{filteredBooks.length === 1 ? "historia disponible" : "historias disponibles"}</span></div>
          </div>
          <div className="filter-row">
            <div className="filter-block">
              <span className="filter-label">¿Para quién es la lectura?</span>
              <div className="filter-group">
                {ages.map((item) => (
                  <button key={item} className={age === item ? "filter-active" : ""} aria-pressed={age === item} onClick={() => { setAge(item); setVisible(12); }}>{item}</button>
                ))}
              </div>
            </div>
            <label className="theme-select">
              <span className="filter-label">Explora por tema</span>
              <select value={theme} onChange={(event) => { setTheme(event.target.value); setVisible(12); }}>
                <option value="Todos">Todos los temas</option>
                {themes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="catalog-grid">
          {filteredBooks.slice(0, visible).map((book) => (
            <article className="book-card" key={book.slug}>
              <FavoriteButton book={book} />
              <button className="book-click" onClick={() => setSelected(book)}><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></button>
              <div className="book-card-info">
                <span className="book-tag">{book.theme}</span>
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <div className="book-meta"><span>{book.age}</span><span>{book.level}</span><span>{book.series}</span></div>
                <Link className="card-detail-link" href={`/libro/${book.slug}`}>Ver ficha <span>↗</span></Link>
              </div>
            </article>
          ))}
        </div>
        {visible < filteredBooks.length && <div className="load-more-row"><button className="load-more-button" onClick={() => setVisible((current) => current + 12)}>Mostrar más historias</button></div>}
        {filteredBooks.length === 0 && <div className="empty-state">No encontramos libros con esos filtros. Prueba con otra edad o tema.</div>}
      </section>

      <section className="school-section" id="escuela">
        <div className="school-stamp">para<br /><strong>la escuela</strong></div>
        <div className="school-copy">
          <p className="eyebrow">Una selección que sí hace sentido</p>
          <h2>Arma tu plan lector<br /><em>con intención.</em></h2>
          <p>Filtra por grado, nivel de dificultad y propósito. Compara títulos y comparte tu selección con tu equipo docente.</p>
          <a className="dark-button" href="#explorar">Explorar planes lectores <span>↗</span></a>
        </div>
        <div className="school-list">
          <div><span>01</span><strong>Elige el grado</strong><small>Preescolar · Primaria · Secundaria</small></div>
          <div><span>02</span><strong>Encuentra el nivel</strong><small>Lecturas adecuadas para cada grupo</small></div>
          <div><span>03</span><strong>Comparte tu selección</strong><small>Fichas y recursos para acompañar</small></div>
        </div>
      </section>

      <section className="resource-section" id="recursos">
        <div><p className="eyebrow">Para acompañar la lectura</p><h2>Más que un libro.</h2></div>
        <p>Guías, booktrailers, audiolibros y recursos para que cada historia encuentre su momento.</p>
        <Link className="arrow-link" href="/recursos">Ver recursos <span>↗</span></Link>
      </section>

      <section className="trailer-teaser" aria-label="Booktrailers">
        <div className="trailer-teaser-copy">
          <p className="eyebrow">Booktrailers</p>
          <h2>Mira la historia<br /><em>antes de leerla.</em></h2>
          <p>Videos del catálogo para elegir la siguiente lectura en familia o con tu grupo.</p>
          <Link className="dark-button" href="/booktrailers">Ver todos los booktrailers <span>↗</span></Link>
        </div>
        <div className="trailer-teaser-strip">
          {trailerEntries.slice(0, 5).map((trailer) => (
            <Link className="trailer-teaser-card" key={trailer.slug} href="/booktrailers">
              <span className="trailer-thumb">
                <Image src={trailer.thumbnail} alt="" fill sizes="250px" />
                <span className="trailer-card-play" aria-hidden="true">▶</span>
              </span>
              <strong>{trailer.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="book-modal" role="dialog" aria-modal="true" aria-label={`Ficha de ${selected.title}`} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar ficha">×</button>
            <BookCover title={selected.title} author={selected.author} color={selected.color} accent={selected.accent} image={selected.image} large />
            <div className="modal-copy">
              <span className="book-tag">{selected.theme} · {selected.series}</span>
              <h2>{selected.title}</h2>
              <p className="modal-author">{selected.author}</p>
              <p>{selected.note || "Consulta la ficha completa para conocer esta historia."}</p>
              <div className="modal-meta">
                <span><b>Edad</b>{selected.age}</span>
                <span><b>Nivel</b>{selected.level}</span>
                <span><b>Formato</b>{selected.format || "Impreso"}</span>
              </div>
              <Link className="dark-button" href={`/libro/${selected.slug}`}>Ver ficha completa <span>↗</span></Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
