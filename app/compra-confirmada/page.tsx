import { ScreenHero, ScreenShell } from "../components/screen-components";
import { commerceEnabled } from "../lib/commerce";

export default function OrderConfirmationPage() {
  if (!commerceEnabled) return <ScreenShell><ScreenHero eyebrow="Compra en línea" title={<>Pedidos en <em>preparación.</em></>} intro="Esta pantalla se habilitará cuando precios, inventario y pagos hayan sido aprobados." /><section className="screen-content"><a className="dark-button" href="/seccion">Volver al catálogo ↗</a></section></ScreenShell>;
  return <ScreenShell><section className="confirmation"><div className="confirmation-mark">✓</div><p className="eyebrow">Pedido confirmado</p><h1>Tu pedido ya está <em>en camino.</em></h1><p>Recibirás un correo con los detalles de tu compra y el seguimiento del envío.</p><div className="confirmation-actions"><a className="dark-button" href="/seccion">Seguir explorando ↗</a></div></section></ScreenShell>;
}
