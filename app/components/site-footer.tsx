/* eslint-disable @next/next/no-html-link-for-pages */

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="brand"><span className="brand-symbol">sm</span><span>literatura</span></div>
      <p>Historias para leer el mundo.</p>
      <div className="footer-links">
        <a href="/">Inicio</a><a href="/seccion">Catálogo</a><a href="/planes-lectores">Docentes</a><a href="/recursos">Recursos</a><a href="/contacto">Contacto</a>
      </div>
      <small>© SM México · Privacidad · Cookies</small>
    </footer>
  );
}
