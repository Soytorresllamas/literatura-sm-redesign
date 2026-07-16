"use client";

import { useMemo, useState } from "react";
import { BookCover } from "../components/book-cover";
import { findBookBySlug } from "../components/book-data";
import { Notice, ScreenShell } from "../components/screen-components";
import { CART_KEY, readStored, writeStored } from "../lib/store";
import { commerceEnabled } from "../lib/commerce";

export default function CartPage() {
  const [cart, setCart] = useState<string[]>(() => readStored<string[]>(CART_KEY, []));
  const lines = useMemo(() => [...new Set(cart)].map((slug) => {
    const book = findBookBySlug(slug);
    return book ? { book, quantity: cart.filter((item) => item === slug).length } : null;
  }).filter(Boolean), [cart]);
  const sellableLines = commerceEnabled ? lines : [];
  const subtotal = sellableLines.reduce((total, line) => total + (line?.book.price ?? 0) * (line?.quantity ?? 0), 0);
  function remove(slug: string) {
    const next = cart.filter((item) => item !== slug);
    setCart(next);
    writeStored(CART_KEY, next);
  }
  return <ScreenShell><section className="commerce-page"><div className="commerce-heading"><p className="eyebrow">Tu selección</p><h1>Carrito de <em>compra.</em></h1><div className="checkout-steps"><span className="current">01 Carrito</span><span>02 Datos</span><span>03 Confirmación</span></div></div><Notice>{commerceEnabled ? "Envío gratis en pedidos mayores a $699 MXN." : "La venta en línea se habilitará después de validar precios y disponibilidad."}</Notice><div className="cart-layout"><div className="cart-items">{sellableLines.length ? sellableLines.map((line) => line && <article className="cart-item" key={line.book.slug}><BookCover title={line.book.title} author={line.book.author} color={line.book.color} accent={line.book.accent} image={line.book.image} /><div><span className="book-tag">{line.book.series}</span><h3>{line.book.title}</h3><p>{line.book.author} · Impreso</p><label>Cantidad <span>{line.quantity}</span></label></div><strong>${((line.book.price ?? 0) * line.quantity).toFixed(2)}</strong><button aria-label={`Eliminar ${line.book.title}`} onClick={() => remove(line.book.slug)}>×</button></article>) : <div className="empty-state">{commerceEnabled ? "Tu carrito está vacío. Encuentra una historia para empezar." : "El catálogo puede explorarse y guardarse mientras preparamos la compra en línea."}</div>}<a className="arrow-link" href="/seccion">Seguir explorando ↗</a></div><aside className="order-summary"><h2>Resumen</h2>{commerceEnabled ? <><div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div><span>Envío</span><strong>Calculado en checkout</strong></div><hr /><div className="summary-total"><span>Total estimado</span><strong>${subtotal.toFixed(2)}</strong></div></> : <p className="summary-note">Precios, inventario, envío y pago permanecen pendientes de aprobación comercial.</p>}<a className="dark-button" href={commerceEnabled && sellableLines.length ? "/checkout" : "/seccion"}>{commerceEnabled && sellableLines.length ? "Continuar compra ↗" : "Explorar catálogo ↗"}</a></aside></div></section></ScreenShell>;
}
