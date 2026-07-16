"use client";

import { useMemo, useState } from "react";
import { BookCover } from "../components/book-cover";
import { catalogBooks } from "../components/book-data";
import { Notice, ScreenShell } from "../components/screen-components";
import { CART_KEY, readStored, writeStored } from "../lib/store";

export default function CartPage() {
  const [cart, setCart] = useState<string[]>(() => readStored<string[]>(CART_KEY, []));
  const lines = useMemo(() => [...new Set(cart)].map((slug) => {
    const book = catalogBooks.find((item) => item.slug === slug);
    return book ? { book, quantity: cart.filter((item) => item === slug).length } : null;
  }).filter(Boolean), [cart]);
  const subtotal = lines.reduce((total, line) => total + (line?.book.price ?? 0) * (line?.quantity ?? 0), 0);
  function remove(slug: string) {
    const next = cart.filter((item) => item !== slug);
    setCart(next);
    writeStored(CART_KEY, next);
  }
  return <ScreenShell><section className="commerce-page"><div className="commerce-heading"><p className="eyebrow">Tu selección</p><h1>Carrito de <em>compra.</em></h1><div className="checkout-steps"><span className="current">01 Carrito</span><span>02 Datos</span><span>03 Confirmación</span></div></div><Notice>Envío gratis en pedidos mayores a $699 MXN.</Notice><div className="cart-layout"><div className="cart-items">{lines.length ? lines.map((line) => line && <article className="cart-item" key={line.book.slug}><BookCover title={line.book.title} author={line.book.author} color={line.book.color} accent={line.book.accent} image={line.book.image} /><div><span className="book-tag">{line.book.series}</span><h3>{line.book.title}</h3><p>{line.book.author} · Impreso</p><label>Cantidad <span>{line.quantity}</span></label></div><strong>${((line.book.price ?? 0) * line.quantity).toFixed(2)}</strong><button aria-label={`Eliminar ${line.book.title}`} onClick={() => remove(line.book.slug)}>×</button></article>) : <div className="empty-state">Tu carrito está vacío. Encuentra una historia para empezar.</div>}<a className="arrow-link" href="/seccion">Seguir explorando ↗</a></div><aside className="order-summary"><h2>Resumen</h2><div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div><span>Envío</span><strong>Calculado en checkout</strong></div><hr /><div className="summary-total"><span>Total estimado</span><strong>${subtotal.toFixed(2)}</strong></div><a className="dark-button" href={lines.length ? "/checkout" : "/seccion"}>{lines.length ? "Continuar compra ↗" : "Explorar catálogo ↗"}</a></aside></div></section></ScreenShell>;
}
