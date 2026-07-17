"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useState } from "react";
import { BrandLogo } from "./brand-logo";
import { FavoritesIndicator } from "./favorites-indicator";

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand brand-header" href="/" aria-label="SM Literatura, inicio"><BrandLogo priority /></a>
      <nav className="main-nav" aria-label="Navegación principal">
        <a className="active" href="/seccion">Explorar libros</a><a href="/planes-lectores">Planes lectores</a><a href="/recursos">Recursos</a><a href="/novedades">Novedades</a>
      </nav>
      <button className="mobile-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>Menú <span>{open ? "×" : "＋"}</span></button>
      <div className="header-actions"><a className="text-button" href="/planes-lectores">Soy docente</a><FavoritesIndicator /></div>
      {open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil"><a href="/seccion" onClick={() => setOpen(false)}>Explorar libros</a><a href="/planes-lectores" onClick={() => setOpen(false)}>Planes lectores</a><a href="/recursos" onClick={() => setOpen(false)}>Recursos</a><a href="/novedades" onClick={() => setOpen(false)}>Novedades</a><a href="/buscar" onClick={() => setOpen(false)}>Buscar</a></nav>}
    </header>
  );
}
