/* eslint-disable @next/next/no-html-link-for-pages */
import { ScreenShell } from "../components/screen-components";

export default function AccountPage() {
  return <ScreenShell><section className="account-page"><div className="account-heading"><p className="eyebrow">Tu espacio</p><h1>Hola, <em>Mariana.</em></h1><p>Consulta tus pedidos y guarda tus próximas lecturas.</p></div><div className="account-layout"><aside className="account-nav"><a className="selected" href="/mi-cuenta">Resumen</a><a href="/lista">Mi lista</a><a href="/mi-cuenta">Mis pedidos</a><a href="/contacto">Datos de cuenta</a><a href="/">Cerrar sesión</a></aside><div className="account-content"><div className="account-card"><span className="eyebrow">Último pedido</span><strong>#SM-10428</strong><span>2 artículos · En preparación</span><a className="arrow-link" href="/compra-confirmada">Ver detalle ↗</a></div><div className="account-card"><span className="eyebrow">Tu lista</span><strong>8 libros guardados</strong><span>3 novedades desde tu última visita</span><a className="arrow-link" href="/lista">Ver lista ↗</a></div></div></div></section></ScreenShell>;
}
