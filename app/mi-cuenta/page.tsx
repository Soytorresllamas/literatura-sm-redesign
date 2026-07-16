/* eslint-disable @next/next/no-html-link-for-pages */
import { ScreenShell } from "../components/screen-components";

export default function AccountPage() {
  return <ScreenShell><section className="account-page"><div className="account-heading"><p className="eyebrow">Tu espacio</p><h1>Hola, <em>Mariana.</em></h1><p>Guarda tus próximas lecturas y encuentra recursos para acompañarlas.</p></div><div className="account-layout"><aside className="account-nav"><a className="selected" href="/mi-cuenta">Resumen</a><a href="/lista">Mi lista</a><a href="/recursos">Recursos</a><a href="/contacto">Datos de cuenta</a><a href="/">Cerrar sesión</a></aside><div className="account-content"><div className="account-card"><span className="eyebrow">Tu lista</span><strong>Lecturas guardadas</strong><span>Organiza y comparte tus próximos descubrimientos.</span><a className="arrow-link" href="/lista">Ver lista ↗</a></div><div className="account-card"><span className="eyebrow">Para acompañar</span><strong>Recursos de lectura</strong><span>Guías, audios y materiales para cada historia.</span><a className="arrow-link" href="/recursos">Explorar recursos ↗</a></div></div></div></section></ScreenShell>;
}
