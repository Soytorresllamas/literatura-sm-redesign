"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { CART_KEY, readStored, SAVED_BOOKS_KEY, STORAGE_SYNC_EVENT } from "../lib/store";
import { BrandLogo } from "./brand-logo";

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(() => readStored<string[]>(SAVED_BOOKS_KEY, []).length);
  const [cartCount, setCartCount] = useState(() => readStored<string[]>(CART_KEY, []).length);
  useEffect(() => {
    const sync = () => {
      setSavedCount(new Set(readStored<string[]>(SAVED_BOOKS_KEY, [])).size);
      setCartCount(readStored<string[]>(CART_KEY, []).length);
    };
    window.addEventListener("storage", sync);
    window.addEventListener(STORAGE_SYNC_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STORAGE_SYNC_EVENT, sync);
    };
  }, []);
  return (
    <header className="site-header">
      <a className="brand brand-header" href="/" aria-label="SM Literatura, inicio"><BrandLogo /></a>
      <nav className="main-nav" aria-label="Navegación principal">
        <a className="active" href="/seccion">Explorar libros</a><a href="/planes-lectores">Planes lectores</a><a href="/recursos">Recursos</a><a href="/novedades">Novedades</a>
      </nav>
      <button className="mobile-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>Menú <span>{open ? "×" : "＋"}</span></button>
      <div className="header-actions"><a className="text-button" href="/planes-lectores">Soy docente</a><a className="save-button" href="/lista" aria-label={`Lista de deseos, ${savedCount} ${savedCount === 1 ? "libro" : "libros"}`}>♡ <span>{savedCount}</span></a><a className="cart-link" href="/carrito" aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? "libro" : "libros"}`}>▢ <span>{cartCount}</span></a></div>
      {open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil"><a href="/seccion" onClick={() => setOpen(false)}>Explorar libros</a><a href="/planes-lectores" onClick={() => setOpen(false)}>Planes lectores</a><a href="/recursos" onClick={() => setOpen(false)}>Recursos</a><a href="/novedades" onClick={() => setOpen(false)}>Novedades</a><a href="/buscar" onClick={() => setOpen(false)}>Buscar</a></nav>}
    </header>
  );
}
