"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCover } from "./components/book-cover";
import { ageFacets, catalogBooks, themeFacets, type BookRecord } from "./components/book-data";
import { CART_KEY, readStored, SAVED_BOOKS_KEY, STORAGE_SYNC_EVENT, writeStored } from "./lib/store";

const books = catalogBooks;

const ages = ["Todas", ...ageFacets.map((item) => item.name).filter((item) => item !== "Todas")];
const themes = themeFacets.slice(0, 12).map((item) => item.name);

function hasSaved(values: string[], book: BookRecord) {
  return values.includes(book.slug) || values.includes(book.title);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("Todas");
  const [theme, setTheme] = useState("Todos");
  const [selected, setSelected] = useState<BookRecord | null>(null);
  const [saved, setSaved] = useState<string[]>(() => readStored<string[]>(SAVED_BOOKS_KEY, []));
  const [cartCount, setCartCount] = useState(() => readStored<string[]>(CART_KEY, []).length);
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    const sync = () => { setSaved(readStored<string[]>(SAVED_BOOKS_KEY, [])); setCartCount(readStored<string[]>(CART_KEY, []).length); };
    window.addEventListener("storage", sync);
    window.addEventListener(STORAGE_SYNC_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(STORAGE_SYNC_EVENT, sync); };
  }, []);

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

  function toggleSave(book: BookRecord) {
    setSaved((current) => {
      const next = hasSaved(current, book)
        ? current.filter((item) => item !== book.slug && item !== book.title)
        : [...current, book.slug];
      writeStored(SAVED_BOOKS_KEY, next);
      return next;
    });
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="SM Literatura, inicio">
          <span className="brand-symbol">sm</span>
          <span>literatura</span>
        </a>
        <nav className="main-nav" aria-label="Navegación principal">
          <a className="active" href="/seccion">Explorar libros</a>
          <a href="/planes-lectores">Planes lectores</a>
          <a href="/recursos">Recursos</a>
          <a href="/novedades">Novedades</a>
        </nav>
        <details className="mobile-menu-details"><summary>Menú <span>＋</span></summary><nav aria-label="Navegación móvil"><a href="/seccion">Explorar libros</a><a href="/planes-lectores">Planes lectores</a><a href="/recursos">Recursos</a><a href="/novedades">Novedades</a><a href="/buscar">Buscar</a></nav></details>
        <div className="header-actions">
          <a className="text-button" href="/planes-lectores">Soy docente</a>
          <a className="cart-link" href="/carrito" aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? "libro" : "libros"}`}>▢ <span>{cartCount}</span></a>
          <a className="save-button" href="/lista" aria-label={`Lista de deseos, ${new Set(saved).size} ${new Set(saved).size === 1 ? "libro" : "libros"}`}>
            ♡ <span>{new Set(saved).size}</span>
          </a>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Literatura infantil y juvenil · México</p>
          <h1>Encuentra una historia para <em>cada momento.</em></h1>
          <p className="hero-intro">Libros para descubrir, conversar y leer juntos en casa o en la escuela.</p>
          <div className="hero-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(12); }} onKeyDown={(event) => { if (event.key === "Enter") window.location.href = `/buscar?q=${encodeURIComponent(query)}`; }} placeholder="Busca por título, autor o ISBN" aria-label="Buscar libros" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="hero-links">
            <a href="/seccion">Explorar el catálogo <span>↗</span></a>
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

      <section className="quick-paths" aria-label="Rutas rápidas">
        <div className="section-label">Empieza por aquí</div>
        <div className="path-grid">
          <a className="path-card path-coral" href="/seccion"><span className="path-icon">✺</span><span><strong>Para cada edad</strong><small>De primeros lectores a bachillerato</small></span><b>↗</b></a>
          <a className="path-card path-yellow" href="/categoria?tema=Emociones"><span className="path-icon">◒</span><span><strong>Por tema</strong><small>Aventura, emociones, misterio y más</small></span><b>↗</b></a>
          <a className="path-card path-blue" href="/planes-lectores"><span className="path-icon">▦</span><span><strong>Para la escuela</strong><small>Planes lectores y recursos docentes</small></span><b>↗</b></a>
        </div>
      </section>

      <section className="catalog-section" id="explorar">
        <div className="section-heading">
          <div><p className="eyebrow">Para descubrir hoy</p><h2>Historias que abren mundos</h2></div>
          <a className="arrow-link" href="/seccion">Ver todo el catálogo <span>↗</span></a>
        </div>
        <div className="filter-row">
          <div className="filter-group"><span>Edad</span>{ages.map((item) => <button key={item} className={age === item ? "filter-active" : ""} onClick={() => { setAge(item); setVisible(12); }}>{item}</button>)}</div>
          <label className="theme-select">Tema <select value={theme} onChange={(event) => { setTheme(event.target.value); setVisible(12); }}><option>Todos</option>{themes.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="catalog-grid">
          {filteredBooks.slice(0, visible).map((book) => <article className="book-card" key={book.slug}>
            <button className="card-save" onClick={() => toggleSave(book)} aria-label={`${hasSaved(saved, book) ? "Quitar" : "Añadir"} ${book.title} ${hasSaved(saved, book) ? "de" : "a"} favoritos`}>{hasSaved(saved, book) ? "♥" : "♡"}</button>
            <button className="book-click" onClick={() => setSelected(book)}><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></button>
            <div className="book-card-info"><span className="book-tag">{book.theme}</span><h3>{book.title}</h3><p>{book.author}</p><div className="book-meta"><span>{book.age}</span><span>{book.level}</span><span>{book.series}</span></div><a className="card-detail-link" href={`/libro?slug=${book.slug}`}>Ver ficha <span>↗</span></a></div>
          </article>)}
        </div>
        {visible < filteredBooks.length && <div className="load-more-row"><button className="load-more-button" onClick={() => setVisible((current) => current + 12)}>Mostrar más historias</button></div>}
        {filteredBooks.length === 0 && <div className="empty-state">No encontramos libros con esos filtros. Prueba con otra edad o tema.</div>}
      </section>

      <section className="school-section" id="escuela">
        <div className="school-stamp">para<br /><strong>la escuela</strong></div>
        <div className="school-copy"><p className="eyebrow">Una selección que sí hace sentido</p><h2>Arma tu plan lector<br /><em>con intención.</em></h2><p>Filtra por grado, nivel de dificultad y propósito. Compara títulos y comparte tu selección con tu equipo docente.</p><a className="dark-button" href="#explorar">Explorar planes lectores <span>↗</span></a></div>
        <div className="school-list"><div><span>01</span><strong>Elige el grado</strong><small>Preescolar · Primaria · Secundaria</small></div><div><span>02</span><strong>Encuentra el nivel</strong><small>Lecturas adecuadas para cada grupo</small></div><div><span>03</span><strong>Comparte tu selección</strong><small>Fichas y recursos para acompañar</small></div></div>
      </section>

      <section className="resource-section" id="recursos"><div><p className="eyebrow">Para acompañar la lectura</p><h2>Más que un libro.</h2></div><p>Guías, booktrailers, audiolibros y recursos para que cada historia encuentre su momento.</p><a className="arrow-link" href="/recursos">Ver recursos <span>↗</span></a></section>

      <footer className="site-footer"><div className="brand"><span className="brand-symbol">sm</span><span>literatura</span></div><p>Historias para leer el mundo.</p><div className="footer-links"><a href="#inicio">Inicio</a><a href="#explorar">Catálogo</a><a href="#escuela">Docentes</a><a href="#recursos">Contacto</a></div><small>© SM México · Privacidad · Cookies</small></footer>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="book-modal" role="dialog" aria-modal="true" aria-label={`Ficha de ${selected.title}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar ficha">×</button><BookCover title={selected.title} author={selected.author} color={selected.color} accent={selected.accent} image={selected.image} large /><div className="modal-copy"><span className="book-tag">{selected.theme} · {selected.series}</span><h2>{selected.title}</h2><p className="modal-author">{selected.author}</p><p>{selected.note || "Consulta la ficha completa para conocer esta historia."}</p><div className="modal-meta"><span><b>Edad</b>{selected.age}</span><span><b>Nivel</b>{selected.level}</span><span><b>Formato</b>{selected.format || "Impreso"}</span></div><a className="dark-button" href={`/libro?slug=${selected.slug}`}>Ver ficha completa <span>↗</span></a></div></section></div>}
    </main>
  );
}
