import { BookCover } from "./book-cover";

type CatalogBook = { title: string; author: string; age: string; level: string; theme: string; color: string; accent: string };

export function CatalogCard({ book, buy = false }: { book: CatalogBook; buy?: boolean }) {
  return <article className="book-card">
    <button className="card-save" aria-label={`Guardar ${book.title}`}>♡</button>
    <a href="/libro" className="card-main-link"><span className="book-click"><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} /></span><span className="book-card-info"><span className="book-tag">{book.theme}</span><span className="book-card-title">{book.title}</span><span className="book-card-author">{book.author}</span><span className="book-meta"><span>{book.age}</span><span>{book.level}</span></span><span className="card-detail-link">Ver ficha <span>↗</span></span></span></a>
    {buy && <button className="mini-buy">Agregar al carrito</button>}
  </article>;
}
