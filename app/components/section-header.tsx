"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { readStored, SAVED_BOOKS_KEY, STORAGE_SYNC_EVENT } from "../lib/store";
import { BrandLogo } from "./brand-logo";
import { FavoriteHeart } from "./favorite-heart";

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(() => readStored<string[]>(SAVED_BOOKS_KEY, []).length);
  useEffect(() => {
    const sync = () => {
      setSavedCount(new Set(readStored<string[]>(SAVED_BOOKS_KEY, [])).size);
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
      <a className="brand brand-header" href="/" aria-label="SM Literatura, inicio"><BrandLogo priority /></a>
      <nav className="main-nav" aria-label="Navegación principal">
        <a className="active" href="/seccion">Explorar libros</a><a href="/planes-lectores">Planes lectores</a><a href="/recursos">Recursos</a><a href="/novedades">Novedades</a>
      </nav>
      <button className="mobile-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>Menú <span>{open ? "×" : "＋"}</span></button>
      <div className="header-actions"><a className="text-button" href="/planes-lectores">Soy docente</a><a className="save-button" href="/lista" aria-label={`Lista de deseos, ${savedCount} ${savedCount === 1 ? "libro" : "libros"}`}><FavoriteHeart active={savedCount > 0} className="favorite-heart-header" /><span className="save-count">{savedCount}</span></a></div>
      {open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil"><a href="/seccion" onClick={() => setOpen(false)}>Explorar libros</a><a href="/planes-lectores" onClick={() => setOpen(false)}>Planes lectores</a><a href="/recursos" onClick={() => setOpen(false)}>Recursos</a><a href="/novedades" onClick={() => setOpen(false)}>Novedades</a><a href="/buscar" onClick={() => setOpen(false)}>Buscar</a></nav>}
    </header>
  );
}
