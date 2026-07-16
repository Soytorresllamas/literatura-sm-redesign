"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { BookCover } from "../components/book-cover";
import { getBookBySlug } from "../components/book-data";
import { SectionHeader } from "../components/section-header";
import { CART_KEY, readStored, writeStored } from "../lib/store";

export default function BookPage() {
  const [added, setAdded] = useState(false);
  const searchParams = useSearchParams();
  const featuredBook = getBookBySlug(searchParams.get("slug"));
  function addToCart() {
    const current = readStored<string[]>(CART_KEY, []);
    writeStored(CART_KEY, [...current, featuredBook.slug]);
    setAdded(true);
  }
  return <main><SectionHeader /><div className="book-breadcrumbs"><a href="/">Inicio</a><span>/</span><a href="/seccion">Explorar libros</a><span>/</span><strong>{featuredBook.title}</strong></div><section className="book-detail"><div className="detail-visual"><span className="detail-label">Novedad</span><BookCover title={featuredBook.title} author={featuredBook.author} color={featuredBook.color} accent={featuredBook.accent} image={featuredBook.image} large /><div className="detail-share">Compartir <button aria-label="Compartir en redes">↗</button></div></div><div className="detail-copy"><p className="eyebrow">{featuredBook.series} · {featuredBook.age}</p><h1>{featuredBook.title}</h1><p className="detail-author">{featuredBook.author}</p><p className="detail-description">{featuredBook.description}</p><div className="detail-price">${featuredBook.price?.toFixed(2)} <small>MXN · Impreso</small></div><div className="detail-actions"><button className="primary-action" onClick={addToCart}>{added ? "Agregado al carrito" : "Agregar al carrito"} <span>↗</span></button><a className="outline-action" href="/carrito">Ir al carrito</a><button className="outline-action">♡ <span>Guardar en mi lista</span></button></div><div className="detail-tags"><span>{featuredBook.age}</span><span>{featuredBook.school}</span><span>{featuredBook.level}</span><span>{featuredBook.theme.split(" · ")[0]}</span></div></div></section><section className="book-info-section"><div className="book-info-intro"><p className="eyebrow">Conoce el libro</p><h2>Una lectura para<br /><em>crecer juntos.</em></h2></div><div className="book-info-grid"><div><h3>Sobre la historia</h3><p>Una novela gráfica cercana y divertida sobre la escuela, la familia, la amistad y esos meses en los que todo parece cambiar.</p><a href="/recursos">Ver recursos de lectura ↗</a></div><div><h3>Datos editoriales</h3><dl><dt>Autor</dt><dd>{featuredBook.author}</dd><dt>Ilustrador</dt><dd>{featuredBook.illustrator}</dd><dt>ISBN</dt><dd>9786072454736</dd><dt>Páginas</dt><dd>160</dd></dl></div><div><h3>Recursos disponibles</h3><ul className="resource-list"><li><span>▶</span><strong>Booktrailer</strong><small>Conoce la historia en 60 segundos</small></li><li><span>↓</span><strong>Ficha de lectura</strong><small>Material para acompañar la conversación</small></li><li><span>◉</span><strong>Podcast</strong><small>Una charla con la autora</small></li></ul></div></div></section><section className="related-section"><div className="section-heading"><div><p className="eyebrow">También puede gustarte</p><h2>Más historias para 9+</h2></div><a className="arrow-link" href="/seccion">Ver catálogo <span>↗</span></a></div><div className="related-books"><div className="related-item"><a href="/libro?slug=xocolatl"><BookCover title="Xocolátl" color="#9c6bba" accent="#f7ce5b" image={getBookBySlug("xocolatl").image} /></a><strong>Xocolátl</strong><span>Enrique Escalona</span></div><div className="related-item"><a href="/libro?slug=grimorio"><BookCover title="Grimorio" color="#24566a" accent="#efb04d" image={getBookBySlug("grimorio").image} /></a><strong>Grimorio</strong><span>Ana Romero</span></div><div className="related-item"><BookCover title="Trío Malafama" color="#ef7365" accent="#fff2cf" /><strong>Trío Malafama</strong><span>Verónica Murguía</span></div></div></section><footer className="site-footer"><div className="brand"><span className="brand-symbol">sm</span><span>Historias para leer el mundo.</span></div><p>Compra segura y recursos para acompañar cada lectura.</p><div className="footer-links"><a href="/">Inicio</a><a href="/seccion">Catálogo</a><a href="/planes-lectores">Docentes</a><a href="/contacto">Contacto</a></div><small>© SM México · Privacidad · Cookies</small></footer></main>;
}
