"use client";

import { useEffect, useMemo, useState } from "react";
import { CatalogExplorer } from "../components/catalog-explorer";
import { catalogBooks, themeFacets } from "../components/book-data";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function CategoryPage() {
  const [theme, setTheme] = useState("Emociones");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("tema");
      const match = themeFacets.find((item) => item.name.localeCompare(requested || "", "es", { sensitivity: "base" }) === 0);
      if (match) setTheme(match.name);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const count = useMemo(() => catalogBooks.filter((book) => book.theme === theme || book.themes.includes(theme)).length, [theme]);
  return <ScreenShell><ScreenHero eyebrow="Explorar por tema" title={<>Historias sobre <em>{theme.toLowerCase()}.</em></>} intro={`${count} ${count === 1 ? "título" : "títulos"} para descubrir este tema desde distintas edades, géneros y voces.`} /><CatalogExplorer key={theme} books={catalogBooks} initialTheme={theme} /></ScreenShell>;
}
