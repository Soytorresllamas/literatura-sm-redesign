"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./brand-logo";
import { FavoritesIndicator } from "./favorites-indicator";

const NAV_LINKS = [
  { href: "/seccion", label: "Explorar libros" },
  { href: "/planes-lectores", label: "Planes lectores" },
  { href: "/booktrailers", label: "Booktrailers" },
  { href: "/recursos", label: "Recursos" },
  { href: "/novedades", label: "Novedades" },
];

export function SectionHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand brand-header" href="/" aria-label="SM Literatura, inicio">
        <BrandLogo priority />
      </Link>
      <nav className="main-nav" aria-label="Navegación principal">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : undefined}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        className="mobile-menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        Menú <span>{open ? "×" : "＋"}</span>
      </button>
      <div className="header-actions">
        <Link className="text-button" href="/planes-lectores">Soy docente</Link>
        <FavoritesIndicator />
      </div>
      {open && (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Navegación móvil">
          {[...NAV_LINKS, { href: "/buscar", label: "Buscar" }].map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
