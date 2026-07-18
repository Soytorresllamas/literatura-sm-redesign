import Link from "next/link";
import { ScreenShell } from "../components/screen-components";
import { FAVORITES_UI_ENABLED } from "../lib/features";

export default function AccountPage() {
  return (
    <ScreenShell>
      <section className="account-page">
        <div className="account-heading">
          <p className="eyebrow">Tu espacio</p>
          <h1>Hola, <em>Mariana.</em></h1>
          <p>Guarda tus próximas lecturas y encuentra recursos para acompañarlas.</p>
        </div>
        <div className="account-layout">
          <aside className="account-nav">
            <Link className="selected" href="/mi-cuenta">Resumen</Link>
            {FAVORITES_UI_ENABLED && <Link href="/lista">Mi lista</Link>}
            <Link href="/recursos">Recursos</Link>
            <Link href="/contacto">Datos de cuenta</Link>
            <Link href="/">Cerrar sesión</Link>
          </aside>
          <div className="account-content">
            {FAVORITES_UI_ENABLED && (
              <div className="account-card">
                <span className="eyebrow">Tu lista</span>
                <strong>Lecturas guardadas</strong>
                <span>Organiza y comparte tus próximos descubrimientos.</span>
                <Link className="arrow-link" href="/lista">Ver lista ↗</Link>
              </div>
            )}
            <div className="account-card account-card-resources">
              <span className="eyebrow">Para acompañar</span>
              <strong>Recursos de lectura</strong>
              <span>Guías, audios y materiales para cada historia.</span>
              <Link className="arrow-link" href="/recursos">Explorar recursos ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
