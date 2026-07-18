"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import type { BookRecord, ReadingPlanId } from "./book-data";
import { readingPlans } from "./book-data";
import { CatalogCard } from "./catalog-card";

type CatalogExplorerProps = {
  books: BookRecord[];
  initialAge?: string;
  initialTheme?: string;
  initialPlan?: string;
  pageSize?: number;
};

function facets(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

const PLAN_IDS = readingPlans.map((plan) => plan.id);

export function CatalogExplorer({ books, initialAge = "Todas", initialTheme = "Todos", initialPlan, pageSize = 24 }: CatalogExplorerProps) {
  const [query, setQuery] = useState("");
  const [age, setAge] = useState(initialAge);
  const [theme, setTheme] = useState(initialTheme);
  const [plan, setPlan] = useState(initialPlan && PLAN_IDS.includes(initialPlan as ReadingPlanId) ? initialPlan : "Todos");
  const [sort, setSort] = useState("Recomendados");
  const [visible, setVisible] = useState(pageSize);
  const ageOptions = useMemo(() => facets(books.map((book) => book.ageGroup)), [books]);
  const themeOptions = useMemo(() => facets(books.flatMap((book) => book.themes.length ? book.themes : [book.theme])).slice(0, 10), [books]);
  const planOptions = useMemo(() => readingPlans.map((entry) => ({
    id: entry.id,
    name: entry.name,
    count: books.filter((book) => book.plans?.some((item) => item.plan === entry.id)).length,
  })), [books]);

  useLayoutEffect(() => {
    // Lee ?plan= antes del primer paint para evitar parpadeo del catálogo completo
    const requested = new URLSearchParams(window.location.search).get("plan");
    if (requested && PLAN_IDS.includes(requested as ReadingPlanId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincrónico a propósito: debe aplicarse antes del primer paint
      setPlan(requested);
      setVisible(pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const values = books.filter((book) => {
      const matchesQuery = !normalizedQuery || book.searchText.includes(normalizedQuery);
      const matchesAge = age === "Todas" || book.ageGroup === age;
      const matchesTheme = theme === "Todos" || book.themes.includes(theme) || book.theme === theme;
      const matchesPlan = plan === "Todos" || Boolean(book.plans?.some((item) => item.plan === plan));
      return matchesQuery && matchesAge && matchesTheme && matchesPlan;
    });
    return [...values].sort((a, b) => sort === "A–Z"
      ? a.title.localeCompare(b.title, "es")
      : b.id - a.id);
  }, [age, books, plan, query, sort, theme]);

  function reset() {
    setQuery("");
    setAge("Todas");
    setTheme("Todos");
    setPlan("Todos");
    setVisible(pageSize);
  }

  return (
    <section className="section-layout">
      <aside className="filter-sidebar">
        <div className="filter-heading">
          <strong>Filtrar resultados</strong>
          <button onClick={reset}>Limpiar</button>
        </div>
        <label className="side-search">
          ⌕
          <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(pageSize); }} placeholder="Buscar en el catálogo" />
        </label>
        <fieldset>
          <legend>Edad</legend>
          <label>
            <input type="radio" name="catalog-age" checked={age === "Todas"} onChange={() => { setAge("Todas"); setVisible(pageSize); }} /> Todas <span>{books.length}</span>
          </label>
          {ageOptions.map((item) => (
            <label key={item.name}>
              <input type="radio" name="catalog-age" checked={age === item.name} onChange={() => { setAge(item.name); setVisible(pageSize); }} /> {item.name}<span>{item.count}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Tema</legend>
          <label>
            <input type="radio" name="catalog-theme" checked={theme === "Todos"} onChange={() => { setTheme("Todos"); setVisible(pageSize); }} /> Todos <span>{books.length}</span>
          </label>
          {themeOptions.map((item) => (
            <label key={item.name}>
              <input type="radio" name="catalog-theme" checked={theme === item.name} onChange={() => { setTheme(item.name); setVisible(pageSize); }} /> {item.name}<span>{item.count}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Plan lector</legend>
          <label>
            <input type="radio" name="catalog-plan" checked={plan === "Todos"} onChange={() => { setPlan("Todos"); setVisible(pageSize); }} /> Todos <span>{books.length}</span>
          </label>
          {planOptions.map((item) => (
            <label key={item.id}>
              <input type="radio" name="catalog-plan" checked={plan === item.id} onChange={() => { setPlan(item.id); setVisible(pageSize); }} /> {item.name}<span>{item.count}</span>
            </label>
          ))}
        </fieldset>
      </aside>
      <div className="results-column">
        <div className="results-toolbar">
          <p><strong>{filtered.length}</strong> {filtered.length === 1 ? "título encontrado" : "títulos encontrados"}</p>
          <label>
            Ordenar{" "}
            <select value={sort} onChange={(event) => { setSort(event.target.value); setVisible(pageSize); }}>
              <option>Recomendados</option>
              <option>Más recientes</option>
              <option>A–Z</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <>
            <div className="section-book-grid">
              {filtered.slice(0, visible).map((book) => <CatalogCard key={book.slug} book={book} />)}
            </div>
            {visible < filtered.length && (
              <div className="load-more-row">
                <button className="load-more-button" onClick={() => setVisible((current) => current + pageSize)}>
                  Mostrar más <span>{Math.min(pageSize, filtered.length - visible)} títulos</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">No encontramos libros con estos filtros. Prueba con otra edad, tema o término.</div>
        )}
      </div>
    </section>
  );
}
