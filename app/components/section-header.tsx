"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useState } from "react";

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="SM Literatura, inicio"><span className="brand-symbol">sm</span><span>literatura</span></a>
      <nav className="main-nav" aria-label="Navegación principal">
        <a className="active" href="/seccion">Explorar libros</a><a href="/planes-lectores">Planes lectores</a><a href="/recursos">Recursos</a><a href="/novedades">Novedades</a>
      </nav>
      <button className="mobile-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>Menú <span>{open ? "×" : "＋"}</span></button>
      <div className="header-actions"><a className="text-button" href="/planes-lectores">Soy docente</a><a className="save-button" href="/lista" aria-label="Lista de deseos">♡ <span>0</span></a><a className="cart-link" href="/carrito" aria-label="Carrito">▢ <span>0</span></a></div>
      {open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil"><a href="/seccion" onClick={() => setOpen(false)}>Explorar libros</a><a href="/planes-lectores" onClick={() => setOpen(false)}>Planes lectores</a><a href="/recursos" onClick={() => setOpen(false)}>Recursos</a><a href="/novedades" onClick={() => setOpen(false)}>Novedades</a><a href="/buscar" onClick={() => setOpen(false)}>Buscar</a></nav>}
    </header>
  );
}
