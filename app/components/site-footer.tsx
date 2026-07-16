/* eslint-disable @next/next/no-html-link-for-pages */

import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="brand brand-footer"><BrandLogo /></div>
      <p>Historias para leer el mundo.</p>
      <div className="footer-links">
        <a href="/">Inicio</a><a href="/seccion">Catálogo</a><a href="/planes-lectores">Docentes</a><a href="/recursos">Recursos</a><a href="/contacto">Contacto</a>
      </div>
      <small>© SM México · Privacidad · Cookies</small>
    </footer>
  );
}
