import { ScreenShell } from "../components/screen-components";

export default function OrderConfirmationPage() {
  return <ScreenShell><section className="confirmation"><div className="confirmation-mark">✓</div><p className="eyebrow">Pedido confirmado</p><h1>Tu pedido ya está <em>en camino.</em></h1><p>Recibirás un correo con los detalles de tu compra y el seguimiento del envío.</p><div className="confirmation-number">Número de pedido <strong>#SM-10428</strong></div><div className="confirmation-actions"><a className="dark-button" href="/seccion">Seguir explorando ↗</a><a className="arrow-link" href="/mi-cuenta">Ver mis pedidos</a></div></section></ScreenShell>;
}
