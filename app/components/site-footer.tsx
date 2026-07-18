import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="brand brand-footer"><BrandLogo /></div>
      <p>Historias para leer el mundo.</p>
      <div className="footer-links">
        <Link href="/">Inicio</Link>
        <Link href="/seccion">Catálogo</Link>
        <Link href="/planes-lectores">Docentes</Link>
        <Link href="/recursos">Recursos</Link>
        <Link href="/contacto">Contacto</Link>
      </div>
      <small>© SM México · Privacidad · Cookies</small>
    </footer>
  );
}
