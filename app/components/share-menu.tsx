"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { facebookShareUrl, mailtoShareUrl, whatsAppShareUrl } from "../lib/share-links";

// La URL de la página solo existe en cliente; el snapshot de servidor vacío
// mantiene el HTML estático y la hidratación sin desajustes.
const noopSubscribe = () => () => {};
function usePageUrl() {
  return useSyncExternalStore(noopSubscribe, () => window.location.href, () => "");
}

type Props = { title: string; text: string };

const icons = {
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8ZM8.9 7.3c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5L10 7.6c-.2-.4-.4-.3-.5-.3h-.6Z"/></svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.3H8.1V14h2.5v7h2.9Z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.6c2.4 0 2.7 0 3.7.1 1 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.5.6.7 1.1.1.3.3.8.3 1.8.1 1 .1 1.3.1 3.7s0 2.7-.1 3.7c0 1-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.3.1-.8.3-1.8.3-1 .1-1.3.1-3.7.1s-2.7 0-3.7-.1c-1 0-1.5-.2-1.8-.3a3 3 0 0 1-1.1-.7 3 3 0 0 1-.7-1.1c-.1-.3-.3-.8-.3-1.8-.1-1-.1-1.3-.1-3.7s0-2.7.1-3.7c0-1 .2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.3-.1.8-.3 1.8-.3 1-.1 1.3-.1 3.7-.1ZM12 3c-2.4 0-2.7 0-3.7.1-1 0-1.6.2-2.2.4-.6.2-1.1.6-1.6 1-.5.5-.8 1-1 1.6-.2.6-.4 1.2-.4 2.2C3 9.3 3 9.6 3 12s0 2.7.1 3.7c0 1 .2 1.6.4 2.2.2.6.6 1.1 1 1.6.5.5 1 .8 1.6 1 .6.2 1.2.4 2.2.4 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c1 0 1.6-.2 2.2-.4a4.4 4.4 0 0 0 2.6-2.6c.2-.6.4-1.2.4-2.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c0-1-.2-1.6-.4-2.2a4.4 4.4 0 0 0-2.6-2.6c-.6-.2-1.2-.4-2.2-.4C14.7 3 14.4 3 12 3Zm0 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/></svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 7.4L4.8 6.8v10.4h14.4V6.8L12 12.4Zm0-2L18.6 6H5.4L12 10.4Z"/></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 0 1.4 0l4.3-4.3a2.5 2.5 0 0 0-3.5-3.5l-2 2a1 1 0 1 0 1.4 1.5l2-2a.5.5 0 0 1 .7.7l-4.3 4.2a1 1 0 0 0 0 1.4Zm2.8-2.8a1 1 0 0 0-1.4 0l-4.3 4.3a2.5 2.5 0 0 0 3.5 3.5l2-2a1 1 0 1 0-1.4-1.5l-2 2a.5.5 0 0 1-.7-.7l4.3-4.2a1 1 0 0 0 0-1.4Z"/></svg>
  ),
};

export function ShareMenu({ title, text }: Props) {
  const url = usePageUrl();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const copyLink = async (message: string) => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setNotice(message);
    } catch {
      setNotice("No se pudo copiar el enlace");
    }
  };

  const shareToInstagram = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: url || window.location.href });
      } catch {
        // El usuario cerró la hoja de compartir: no es un error.
      }
      return;
    }
    await copyLink("Enlace copiado — pégalo en tu historia o mensaje");
  };

  return (
    <div className="share-menu">
      <span className="share-label">Compartir</span>
      <div className="share-buttons">
        <a className="share-button" aria-label="Compartir por WhatsApp" href={url ? whatsAppShareUrl(text, url) : undefined} target="_blank" rel="noreferrer">{icons.whatsapp}</a>
        <a className="share-button" aria-label="Compartir en Facebook" href={url ? facebookShareUrl(url) : undefined} target="_blank" rel="noreferrer">{icons.facebook}</a>
        <button className="share-button" aria-label="Compartir en Instagram" type="button" onClick={shareToInstagram}>{icons.instagram}</button>
        <a className="share-button" aria-label="Compartir por correo" href={url ? mailtoShareUrl(title, `${text}\n\n${url}`) : undefined}>{icons.mail}</a>
        <button className="share-button" aria-label="Copiar enlace" type="button" onClick={() => copyLink("Enlace copiado ✓")}>{icons.link}</button>
      </div>
      <span className="share-notice" role="status" aria-live="polite">{notice}</span>
    </div>
  );
}
