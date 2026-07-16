/* eslint-disable @next/next/no-html-link-for-pages */
import { SectionHeader } from "./section-header";
import { SiteFooter } from "./site-footer";

export function ScreenShell({ children }: { children: React.ReactNode }) {
  return <main><SectionHeader />{children}<SiteFooter /></main>;
}

export function ScreenHero({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro: string }) {
  return <section className="screen-hero"><div className="breadcrumbs"><a href="/">Inicio</a><span>/</span><strong>{typeof title === "string" ? title : eyebrow}</strong></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></section>;
}

export function Notice({ children, tone = "yellow" }: { children: React.ReactNode; tone?: "yellow" | "green" }) {
  return <div className={`screen-notice screen-notice-${tone}`}>{children}</div>;
}
