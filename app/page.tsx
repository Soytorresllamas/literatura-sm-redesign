"use client";

import { useMemo, useState } from "react";
import { BookCover } from "./components/book-cover";

type Book = {
  title: string;
  author: string;
  age: string;
  level: string;
  series: string;
  tag: string;
  color: string;
  accent: string;
  note: string;
  image?: string;
};

const books: Book[] = [
  {
    title: "¡Casi medio año!",
    author: "M. B. Brozon",
    age: "9+",
    level: "Nivel 3",
    series: "Trotamundos",
    tag: "Aventura",
    color: "#f6b94b",
    accent: "#145f63",
    note: "Una historia sobre crecer, hacer amigos y encontrar la propia voz.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/416iKU4NpnL._SY445_SX342_ML2_.jpg",
  },
  {
    title: "Chiflágoras",
    author: "Irma Ibarra",
    age: "6+",
    level: "Nivel 2",
    series: "El Barco de Vapor",
    tag: "Imaginación",
    color: "#ef6f61",
    accent: "#f9e6b8",
    note: "Palabras juguetonas para leer en voz alta y dejar volar la imaginación.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/228697-Chiflagoras-600x913.webp",
  },
  {
    title: "Xocolátl",
    author: "Enrique Escalona",
    age: "9+",
    level: "Nivel 4",
    series: "Trotamundos",
    tag: "Identidad",
    color: "#9c6bba",
    accent: "#f7ce5b",
    note: "Una aventura de identidad, memoria y pertenencia con sabor mexicano.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2026/06/227928-XOCOLATL-600x950.webp",
  },
  {
    title: "¿Cómo se siente Osito?",
    author: "Carles Ballesteros",
    age: "0–5",
    level: "Primeros lectores",
    series: "Álbumes",
    tag: "Emociones",
    color: "#7aaed6",
    accent: "#fff2cf",
    note: "Una primera conversación sobre las emociones cotidianas.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/175652-197x300.jpg",
  },
  {
    title: "Grimorio",
    author: "Ana Romero",
    age: "9+",
    level: "Nivel 4",
    series: "Loran",
    tag: "Fantasía",
    color: "#24566a",
    accent: "#efb04d",
    note: "Fórmulas mágicas, secretos y una lectura para conversar en grupo.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/196633-189x300.jpg",
  },
  {
    title: "Donde surgen las sombras",
    author: "David Lozano",
    age: "Bachillerato",
    level: "Juvenil",
    series: "Gran Angular",
    tag: "Misterio",
    color: "#37334f",
    accent: "#ed7d70",
    note: "Suspenso juvenil para lectores que buscan una historia intensa.",
    image: "https://literatura.grupo-sm.com.mx/wp-content/uploads/2025/01/174103-197x300.jpg",
  },
];

const ages = ["Todas", "0–5", "6–8", "9–11", "12–14", "Bachillerato"];
const themes = ["Aventura", "Emociones", "Fantasía", "Identidad", "Imaginación", "Misterio"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("Todas");
  const [theme, setTheme] = useState("Todos");
  const [selected, setSelected] = useState<Book | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author} ${book.series}`.toLowerCase().includes(query.toLowerCase());
    const matchesAge = age === "Todas" || book.age === age || (age === "9–11" && book.age === "9+") || (age === "6–8" && book.age === "6+");
    const matchesTheme = theme === "Todos" || book.tag === theme;
    return matchesQuery && matchesAge && matchesTheme;
  }), [age, query, theme]);

  function toggleSave(title: string) {
    setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
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
          <a className="cart-link" href="/carrito" aria-label="Carrito">▢ <span>0</span></a>
          <button className="save-button" aria-label={`Lista de deseos, ${saved.length} libros`} onClick={() => alert(`${saved.length} ${saved.length === 1 ? "libro guardado" : "libros guardados"}`)}>
            ♡ <span>{saved.length}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Literatura infantil y juvenil · México</p>
          <h1>Encuentra una historia para <em>cada momento.</em></h1>
          <p className="hero-intro">Libros para descubrir, conversar y leer juntos en casa o en la escuela.</p>
          <div className="hero-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") window.location.href = `/buscar?q=${encodeURIComponent(query)}`; }} placeholder="Busca por título, autor o ISBN" aria-label="Buscar libros" />
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
          <a className="path-card path-coral" href="#explorar"><span className="path-icon">✺</span><span><strong>Para cada edad</strong><small>De primeros lectores a bachillerato</small></span><b>↗</b></a>
          <a className="path-card path-yellow" href="#explorar"><span className="path-icon">◒</span><span><strong>Por tema</strong><small>Aventura, emociones, misterio y más</small></span><b>↗</b></a>
          <a className="path-card path-blue" href="#escuela"><span className="path-icon">▦</span><span><strong>Para la escuela</strong><small>Planes lectores y recursos docentes</small></span><b>↗</b></a>
        </div>
      </section>

      <section className="catalog-section" id="explorar">
        <div className="section-heading">
          <div><p className="eyebrow">Para descubrir hoy</p><h2>Historias que abren mundos</h2></div>
          <a className="arrow-link" href="/seccion">Ver todo el catálogo <span>↗</span></a>
        </div>
        <div className="filter-row">
          <div className="filter-group"><span>Edad</span>{ages.map((item) => <button key={item} className={age === item ? "filter-active" : ""} onClick={() => setAge(item)}>{item}</button>)}</div>
          <label className="theme-select">Tema <select value={theme} onChange={(event) => setTheme(event.target.value)}><option>Todos</option>{themes.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="catalog-grid">
          {filteredBooks.map((book) => <article className="book-card" key={book.title}>
            <button className="card-save" onClick={() => toggleSave(book.title)} aria-label={`${saved.includes(book.title) ? "Quitar" : "Añadir"} ${book.title} ${saved.includes(book.title) ? "de" : "a"} favoritos`}>{saved.includes(book.title) ? "♥" : "♡"}</button>
            <button className="book-click" onClick={() => setSelected(book)}><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></button>
            <div className="book-card-info"><span className="book-tag">{book.tag}</span><h3>{book.title}</h3><p>{book.author}</p><div className="book-meta"><span>{book.age}</span><span>{book.level}</span><span>{book.series}</span></div><a className="card-detail-link" href="/libro">Ver ficha <span>↗</span></a></div>
          </article>)}
        </div>
        {filteredBooks.length === 0 && <div className="empty-state">No encontramos libros con esos filtros. Prueba con otra edad o tema.</div>}
      </section>

      <section className="school-section" id="escuela">
        <div className="school-stamp">para<br /><strong>la escuela</strong></div>
        <div className="school-copy"><p className="eyebrow">Una selección que sí hace sentido</p><h2>Arma tu plan lector<br /><em>con intención.</em></h2><p>Filtra por grado, nivel de dificultad y propósito. Compara títulos y comparte tu selección con tu equipo docente.</p><a className="dark-button" href="#explorar">Explorar planes lectores <span>↗</span></a></div>
        <div className="school-list"><div><span>01</span><strong>Elige el grado</strong><small>Preescolar · Primaria · Secundaria</small></div><div><span>02</span><strong>Encuentra el nivel</strong><small>Lecturas adecuadas para cada grupo</small></div><div><span>03</span><strong>Comparte tu selección</strong><small>Fichas y recursos para acompañar</small></div></div>
      </section>

      <section className="resource-section" id="recursos"><div><p className="eyebrow">Para acompañar la lectura</p><h2>Más que un libro.</h2></div><p>Guías, booktrailers, audiolibros y recursos para que cada historia encuentre su momento.</p><a className="arrow-link" href="/recursos">Ver recursos <span>↗</span></a></section>

      <footer className="site-footer"><div className="brand"><span className="brand-symbol">sm</span><span>literatura</span></div><p>Historias para leer el mundo.</p><div className="footer-links"><a href="#inicio">Inicio</a><a href="#explorar">Catálogo</a><a href="#escuela">Docentes</a><a href="#recursos">Contacto</a></div><small>© SM México · Privacidad · Cookies</small></footer>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="book-modal" role="dialog" aria-modal="true" aria-label={`Ficha de ${selected.title}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar ficha">×</button><BookCover title={selected.title} author={selected.author} color={selected.color} accent={selected.accent} image={selected.image} large /><div className="modal-copy"><span className="book-tag">{selected.tag} · {selected.series}</span><h2>{selected.title}</h2><p className="modal-author">{selected.author}</p><p>{selected.note}</p><div className="modal-meta"><span><b>Edad</b>{selected.age}</span><span><b>Nivel</b>{selected.level}</span><span><b>Formato</b>Impreso</span></div><button className="dark-button" onClick={() => toggleSave(selected.title)}>{saved.includes(selected.title) ? "En tu lista" : "Añadir a mi lista"} <span>{saved.includes(selected.title) ? "♥" : "♡"}</span></button></div></section></div>}
    </main>
  );
}
