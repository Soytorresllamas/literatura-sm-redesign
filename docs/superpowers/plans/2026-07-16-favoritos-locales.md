# Local Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated favorites implementations with one stable, accessible, device-local system shared by every page.

**Architecture:** A pure TypeScript module will normalize and mutate favorite identifiers. A root `FavoritesProvider` will own hydration, React state, `localStorage`, and cross-tab synchronization. Reusable button and indicator components will consume that context; pages will contain no favorites storage logic.

**Tech Stack:** React 19, TypeScript 5.9, Next.js 16 compatibility through vinext, browser `localStorage`, Node test runner, CSS.

## Global Constraints

- Favorites remain local to the current browser device.
- Keep the storage key exactly `sm-literatura:saved-books`.
- Preserve recognizable existing favorites by migrating saved titles to current slugs.
- Store only unique current catalog slugs after normalization.
- Do not add Lottie or another animation dependency.
- Use one shared static SVG heart and one shared interaction component.
- Pointer, touch, Enter, and Space must produce the same single state change.
- The favorite action must never navigate to the book detail page.
- The minimum card-button hit target is exactly `48px × 48px`.
- Respect `prefers-reduced-motion: reduce`.
- Preserve all unrelated untracked files whose names end in ` 2`.

---

## File Map

- Create `app/lib/favorites-core.ts`: pure normalization, lookup, toggle, and removal functions.
- Create `app/components/favorites-provider.tsx`: sole owner of favorite state, persistence, hydration, and cross-tab synchronization.
- Create `app/components/favorite-button.tsx`: shared interactive control for cards and book detail.
- Create `app/components/favorites-indicator.tsx`: shared header link and count.
- Modify `app/layout.tsx`: mount the provider once around the application.
- Modify `app/page.tsx`: consume shared button and indicator; remove home-local storage state.
- Modify `app/components/catalog-card.tsx`: consume the shared button; remove subscriptions and `initiallySaved`.
- Modify `app/components/section-header.tsx`: consume the shared indicator; remove count subscriptions.
- Modify `app/lista/page.tsx`: consume provider state and readiness.
- Modify `app/libro/page.tsx`: consume the shared detail button.
- Modify `app/globals.css`: define the 48px hit target, stacking, focus, state, and reduced-motion rules.
- Create `tests/favorites-core.test.ts`: executable tests for normalization and mutation.
- Create `tests/favorites-provider.test.mjs`: structural guardrails for provider ownership.
- Create `tests/favorites-consumers.test.mjs`: structural guardrails against duplicated storage state.
- Modify `tests/favorite-heart-animation.test.mjs`: replace obsolete `initiallySaved` assertions with shared-control assertions.
- Modify `tests/rendered-html.test.mjs`: preserve static heart and accessible favorite output in server HTML.
- Modify `package.json`: include the TypeScript core test in `npm test`.

---

### Task 1: Pure Favorite-State Core

**Files:**
- Create: `app/lib/favorites-core.ts`
- Create: `tests/favorites-core.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: catalog entries shaped as `{ slug: string; title: string }`.
- Produces: `FavoriteBook`, `normalizeFavoriteIds(raw, books)`, `isFavoriteId(ids, book)`, `toggleFavoriteId(ids, book)`, and `removeFavoriteId(ids, book)`.

- [ ] **Step 1: Write the failing core tests**

Create `tests/favorites-core.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  isFavoriteId,
  normalizeFavoriteIds,
  removeFavoriteId,
  toggleFavoriteId,
} from "../app/lib/favorites-core.ts";

const books = [
  { slug: "xocolatl-1763", title: "Xocolátl" },
  { slug: "chiflagoras-1766", title: "Chiflágoras" },
] as const;

test("normalizes legacy titles and removes duplicates and unknown values", () => {
  assert.deepEqual(
    normalizeFavoriteIds(["Xocolátl", "xocolatl-1763", "", "Missing", 42], books),
    ["xocolatl-1763"],
  );
});

test("returns an empty list for invalid stored data", () => {
  assert.deepEqual(normalizeFavoriteIds(null, books), []);
  assert.deepEqual(normalizeFavoriteIds({ slug: "xocolatl-1763" }, books), []);
});

test("queries, adds, and removes one slug without duplication", () => {
  assert.equal(isFavoriteId([], books[0]), false);
  const added = toggleFavoriteId([], books[0]);
  assert.deepEqual(added, ["xocolatl-1763"]);
  assert.equal(isFavoriteId(added, books[0]), true);
  assert.deepEqual(toggleFavoriteId(added, books[0]), []);
  assert.deepEqual(removeFavoriteId(["xocolatl-1763", "chiflagoras-1766"], books[0]), ["chiflagoras-1766"]);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --experimental-strip-types --test tests/favorites-core.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `app/lib/favorites-core.ts`.

- [ ] **Step 3: Implement the pure state module**

Create `app/lib/favorites-core.ts`:

```ts
export type FavoriteBook = {
  slug: string;
  title: string;
};

export function normalizeFavoriteIds(raw: unknown, books: readonly FavoriteBook[]): string[] {
  if (!Array.isArray(raw)) return [];

  const slugByValue = new Map<string, string>();
  for (const book of books) {
    slugByValue.set(book.slug, book.slug);
    slugByValue.set(book.title, book.slug);
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const slug = slugByValue.get(value);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    normalized.push(slug);
  }
  return normalized;
}

export function isFavoriteId(ids: readonly string[], book: FavoriteBook): boolean {
  return ids.includes(book.slug);
}

export function toggleFavoriteId(ids: readonly string[], book: FavoriteBook): string[] {
  return isFavoriteId(ids, book)
    ? ids.filter((slug) => slug !== book.slug)
    : [...ids, book.slug];
}

export function removeFavoriteId(ids: readonly string[], book: FavoriteBook): string[] {
  return ids.filter((slug) => slug !== book.slug);
}
```

- [ ] **Step 4: Add the core test to the project test script**

Replace the `test` script in `package.json` with:

```json
"test": "npm run build && node --experimental-strip-types --test tests/favorites-core.test.ts && node --test tests/*.test.mjs"
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
node --experimental-strip-types --test tests/favorites-core.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit the core**

```bash
git add app/lib/favorites-core.ts tests/favorites-core.test.ts package.json
git commit -m "Centraliza la lógica de favoritos"
```

---

### Task 2: Root Favorites Provider and Persistence

**Files:**
- Create: `app/components/favorites-provider.tsx`
- Create: `tests/favorites-provider.test.mjs`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: core functions from Task 1, `catalogBooks`, and `SAVED_BOOKS_KEY`.
- Produces: `FavoritesProvider`, `useFavorites()`, and `FavoritesContextValue` with `favoriteIds`, `count`, `ready`, `isFavorite`, `toggleFavorite`, and `removeFavorite`.

- [ ] **Step 1: Write the failing provider ownership test**

Create `tests/favorites-provider.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const provider = await readFile(new URL("../app/components/favorites-provider.tsx", import.meta.url), "utf8").catch(() => "");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("root layout mounts one favorites provider", () => {
  assert.match(layout, /<FavoritesProvider>\{children\}<\/FavoritesProvider>/);
});

test("provider owns hydration, persistence, and cross-tab storage synchronization", () => {
  assert.match(provider, /createContext/);
  assert.match(provider, /normalizeFavoriteIds/);
  assert.match(provider, /window\.localStorage\.setItem\(SAVED_BOOKS_KEY/);
  assert.match(provider, /window\.addEventListener\("storage"/);
  assert.match(provider, /ready/);
  assert.doesNotMatch(provider, /STORAGE_SYNC_EVENT/);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --test tests/favorites-provider.test.mjs
```

Expected: FAIL because the provider file does not exist and the layout does not mount it.

- [ ] **Step 3: Implement the provider**

Create `app/components/favorites-provider.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { catalogBooks, type BookRecord } from "./book-data";
import {
  isFavoriteId,
  normalizeFavoriteIds,
  removeFavoriteId,
  toggleFavoriteId,
} from "../lib/favorites-core";
import { SAVED_BOOKS_KEY, readStored } from "../lib/store";

export type FavoritesContextValue = {
  favoriteIds: readonly string[];
  count: number;
  ready: boolean;
  isFavorite: (book: Pick<BookRecord, "slug" | "title">) => boolean;
  toggleFavorite: (book: Pick<BookRecord, "slug" | "title">) => void;
  removeFavorite: (book: Pick<BookRecord, "slug" | "title">) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function persist(ids: readonly string[]) {
  try {
    window.localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(ids));
  } catch {
    // The in-memory session remains usable when browser storage is unavailable.
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const currentIds = useRef<string[]>([]);

  const apply = useCallback((next: string[]) => {
    currentIds.current = next;
    setFavoriteIds(next);
  }, []);

  useEffect(() => {
    const raw = readStored<unknown>(SAVED_BOOKS_KEY, []);
    const normalized = normalizeFavoriteIds(raw, catalogBooks);
    apply(normalized);
    if (JSON.stringify(raw) !== JSON.stringify(normalized)) persist(normalized);
    setReady(true);

    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== SAVED_BOOKS_KEY) return;
      let rawValue: unknown = [];
      try {
        rawValue = event.newValue ? JSON.parse(event.newValue) : [];
      } catch {
        rawValue = [];
      }
      apply(normalizeFavoriteIds(rawValue, catalogBooks));
    };

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, [apply]);

  const toggleFavorite = useCallback((book: Pick<BookRecord, "slug" | "title">) => {
    const next = toggleFavoriteId(currentIds.current, book);
    apply(next);
    persist(next);
  }, [apply]);

  const removeFavorite = useCallback((book: Pick<BookRecord, "slug" | "title">) => {
    const next = removeFavoriteId(currentIds.current, book);
    apply(next);
    persist(next);
  }, [apply]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteIds,
    count: favoriteIds.length,
    ready,
    isFavorite: (book) => isFavoriteId(favoriteIds, book),
    toggleFavorite,
    removeFavorite,
  }), [favoriteIds, ready, removeFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
```

- [ ] **Step 4: Mount the provider in the root layout**

Add this import to `app/layout.tsx`:

```tsx
import { FavoritesProvider } from "./components/favorites-provider";
```

Replace the body with:

```tsx
<body className={sourceSerif.variable}>
  <FavoritesProvider>{children}</FavoritesProvider>
</body>
```

- [ ] **Step 5: Run the focused tests and type-producing build**

Run:

```bash
node --test tests/favorites-provider.test.mjs
npm run build
```

Expected: provider tests PASS and build exits 0.

- [ ] **Step 6: Commit the provider**

```bash
git add app/components/favorites-provider.tsx app/layout.tsx tests/favorites-provider.test.mjs
git commit -m "Agrega proveedor global de favoritos"
```

---

### Task 3: Shared Favorite Controls and Stable Hit Area

**Files:**
- Create: `app/components/favorite-button.tsx`
- Create: `app/components/favorites-indicator.tsx`
- Modify: `app/globals.css`
- Modify: `tests/favorite-heart-animation.test.mjs`

**Interfaces:**
- Consumes: `useFavorites()`, `FavoriteHeart`, and a `BookRecord` subset.
- Produces: `<FavoriteButton book variant />` and `<FavoritesIndicator />`.

- [ ] **Step 1: Replace obsolete source assertions with failing shared-control assertions**

In `tests/favorite-heart-animation.test.mjs`, remove the `catalogCardSource` and `wishlistSource` reads, add reads for the new files, and replace the `wishlist cards mount` test with:

```js
const favoriteButtonSource = await readFile(new URL("../app/components/favorite-button.tsx", import.meta.url), "utf8").catch(() => "");
const indicatorSource = await readFile(new URL("../app/components/favorites-indicator.tsx", import.meta.url), "utf8").catch(() => "");

test("favorite interactions use shared accessible controls", () => {
  assert.match(favoriteButtonSource, /type="button"/);
  assert.match(favoriteButtonSource, /aria-pressed=\{active\}/);
  assert.match(favoriteButtonSource, /event\.preventDefault\(\)/);
  assert.match(favoriteButtonSource, /event\.stopPropagation\(\)/);
  assert.match(indicatorSource, /useFavorites/);
});
```

Replace the compact-size test with:

```js
test("favorite button has a stable 48px hit target and restrained motion", () => {
  assert.match(stylesheetSource, /\.favorite-button-card\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px/);
  assert.match(stylesheetSource, /\.favorite-button-card:hover \.favorite-heart\s*\{[^}]*scale\(1\.04\)/);
  assert.match(stylesheetSource, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --test tests/favorite-heart-animation.test.mjs
```

Expected: FAIL because the shared controls and 48px CSS do not exist.

- [ ] **Step 3: Create the reusable favorite button**

Create `app/components/favorite-button.tsx`:

```tsx
"use client";

import type { BookRecord } from "./book-data";
import { FavoriteHeart } from "./favorite-heart";
import { useFavorites } from "./favorites-provider";

type FavoriteButtonProps = {
  book: Pick<BookRecord, "slug" | "title">;
  variant?: "card" | "detail";
  className?: string;
};

export function FavoriteButton({ book, variant = "card", className = "" }: FavoriteButtonProps) {
  const { isFavorite, ready, toggleFavorite } = useFavorites();
  const active = isFavorite(book);
  const action = active ? "Quitar" : "Guardar";

  return (
    <button
      type="button"
      className={`favorite-button favorite-button-${variant} ${className}`.trim()}
      aria-label={`${action} ${book.title}`}
      aria-pressed={active}
      disabled={!ready}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(book);
      }}
    >
      <FavoriteHeart active={active} className={variant === "detail" ? "favorite-heart-detail" : ""} />
      {variant === "detail" && <span>{active ? "Guardado" : "Guardar en mi lista"}</span>}
    </button>
  );
}
```

- [ ] **Step 4: Create the shared header indicator**

Create `app/components/favorites-indicator.tsx`:

```tsx
"use client";

import { FavoriteHeart } from "./favorite-heart";
import { useFavorites } from "./favorites-provider";

export function FavoritesIndicator() {
  const { count, ready } = useFavorites();
  const visibleCount = ready ? String(count) : "\u00a0";
  return (
    <a
      className="save-button"
      href="/lista"
      aria-label={ready ? `Lista de deseos, ${count} ${count === 1 ? "libro" : "libros"}` : "Lista de deseos"}
    >
      <FavoriteHeart active={ready && count > 0} className="favorite-heart-header" />
      <span className={`save-count ${ready ? "" : "is-loading"}`.trim()} aria-hidden={!ready}>{visibleCount}</span>
    </a>
  );
}
```

- [ ] **Step 5: Replace the favorite interaction CSS**

Replace the `.card-save` and detail favorite rules in `app/globals.css` with:

```css
.favorite-button { border: 0; cursor: pointer; color: var(--ink); font: inherit; }
.favorite-button:disabled { cursor: default; opacity: .65; }
.favorite-button-card { position: absolute; z-index: 4; top: 7px; right: 8px; display: grid; place-items: center; width: 48px; height: 48px; padding: 7px; border: 1px solid #ffffffc7; border-radius: 50%; background: #fffdf8f2; box-shadow: 0 8px 22px #1b2f3520; backdrop-filter: blur(6px); pointer-events: auto; touch-action: manipulation; }
.favorite-button-card:hover .favorite-heart { transform: scale(1.04); }
.favorite-button-card:active .favorite-heart { transform: scale(.96); }
.favorite-button:focus-visible { outline: 3px solid #175d62; outline-offset: 3px; }
.favorite-button-detail { display: inline-flex; align-items: center; gap: 5px; min-height: 48px; padding: 5px 16px 5px 8px; border: 1px solid #cfd8d2; background: transparent; }
.favorite-button-detail:hover .favorite-heart { transform: scale(1.04); }
.card-main-link { position: relative; z-index: 1; display: block; }
.save-count.is-loading { min-width: 13px; }
@media (prefers-reduced-motion: reduce) {
  .favorite-heart { transition: none; }
}
```

Keep `.favorite-heart`, `.favorite-heart-icon`, `.favorite-heart-header`, and `.favorite-heart-detail`; remove the old `.card-save`, `.favorite-detail-action`, and duplicate detail-hover declarations.

- [ ] **Step 6: Run the focused tests**

Run:

```bash
node --test tests/favorite-heart-animation.test.mjs
npm run lint
```

Expected: tests PASS and lint exits 0.

- [ ] **Step 7: Commit the controls**

```bash
git add app/components/favorite-button.tsx app/components/favorites-indicator.tsx app/globals.css tests/favorite-heart-animation.test.mjs
git commit -m "Reconstruye controles de favoritos"
```

---

### Task 4: Migrate Every Consumer to Shared State

**Files:**
- Create: `tests/favorites-consumers.test.mjs`
- Modify: `app/page.tsx`
- Modify: `app/components/catalog-card.tsx`
- Modify: `app/components/section-header.tsx`
- Modify: `app/lista/page.tsx`
- Modify: `app/libro/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `FavoriteButton`, `FavoritesIndicator`, and `useFavorites()`.
- Produces: all favorite-capable pages using one state owner with no direct storage reads or subscriptions.

- [ ] **Step 1: Write the failing consumer guardrail test**

Create `tests/favorites-consumers.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const paths = [
  "../app/page.tsx",
  "../app/components/catalog-card.tsx",
  "../app/components/section-header.tsx",
  "../app/lista/page.tsx",
  "../app/libro/page.tsx",
];

const sources = await Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), "utf8")));
const combined = sources.join("\n");

test("favorite consumers contain no direct storage ownership", () => {
  assert.doesNotMatch(combined, /SAVED_BOOKS_KEY|STORAGE_SYNC_EVENT|readStored|writeStored/);
  assert.doesNotMatch(combined, /addEventListener\("storage"/);
  assert.doesNotMatch(combined, /initiallySaved/);
});

test("all favorite surfaces use shared controls", () => {
  assert.match(sources[0], /<FavoritesIndicator \/>/);
  assert.match(sources[0], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[1], /<FavoriteButton book=\{book\} \/>/);
  assert.match(sources[2], /<FavoritesIndicator \/>/);
  assert.match(sources[3], /useFavorites/);
  assert.match(sources[4], /<FavoriteButton book=\{book\} variant="detail" \/>/);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --test tests/favorites-consumers.test.mjs
```

Expected: FAIL on direct storage imports and missing shared controls.

- [ ] **Step 3: Migrate `CatalogCard`**

Replace `app/components/catalog-card.tsx` with:

```tsx
"use client";

import { BookCover } from "./book-cover";
import type { BookRecord } from "./book-data";
import { FavoriteButton } from "./favorite-button";

export function CatalogCard({ book }: { book: BookRecord }) {
  return <article className="book-card">
    <FavoriteButton book={book} />
    <a href={`/libro?slug=${book.slug}`} className="card-main-link"><span className="book-click"><BookCover title={book.title} author={book.author} color={book.color} accent={book.accent} image={book.image} /></span><span className="book-card-info"><span className="book-tag">{book.theme}</span><span className="book-card-title">{book.title}</span><span className="book-card-author">{book.author}</span><span className="book-meta"><span>{book.age}</span><span>{book.level}</span></span><span className="card-detail-link">Ver ficha <span>↗</span></span></span></a>
  </article>;
}
```

- [ ] **Step 4: Migrate the shared section header**

In `app/components/section-header.tsx`, remove favorites storage imports, `savedCount`, and its effect. Keep the mobile-menu state, add:

```tsx
import { FavoritesIndicator } from "./favorites-indicator";
```

Replace the current wishlist anchor with:

```tsx
<FavoritesIndicator />
```

- [ ] **Step 5: Migrate the home page**

In `app/page.tsx`:

1. Keep `useEffect` only for the modal Escape listener.
2. Remove `BookRecord` from the catalog import when it is no longer otherwise needed.
3. Remove `FavoriteHeart`, all storage imports, `hasSaved`, the `saved` state, the storage effect, and `toggleSave`.
4. Add:

```tsx
import { FavoriteButton } from "./components/favorite-button";
import { FavoritesIndicator } from "./components/favorites-indicator";
```

Replace the header wishlist anchor with:

```tsx
<FavoritesIndicator />
```

Replace the card favorite button with:

```tsx
<FavoriteButton book={book} />
```

- [ ] **Step 6: Migrate the wishlist page**

Replace `app/lista/page.tsx` with:

```tsx
"use client";

import { CatalogCard } from "../components/catalog-card";
import { catalogBooks } from "../components/book-data";
import { useFavorites } from "../components/favorites-provider";
import { CatalogPageSkeleton } from "../components/loading-skeletons";
import { ScreenHero, ScreenShell } from "../components/screen-components";

export default function WishlistPage() {
  const { favoriteIds, ready } = useFavorites();
  const favoriteSet = new Set(favoriteIds);
  const books = catalogBooks.filter((book) => favoriteSet.has(book.slug));
  if (!ready) return <CatalogPageSkeleton />;
  return <ScreenShell><ScreenHero eyebrow="Tu biblioteca personal" title={<>Libros para <em>volver.</em></>} intro="Guarda títulos para leer después, compartir con tu equipo o preparar tus próximas lecturas." /><section className="screen-content"><div className="list-toolbar"><p><strong>{books.length}</strong> {books.length === 1 ? "libro guardado" : "libros guardados"}</p><button className="outline-action" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Compartir lista ↗</button></div>{books.length ? <div className="section-book-grid">{books.map((book) => <CatalogCard key={book.slug} book={book} />)}</div> : <div className="empty-state">Aún no tienes libros guardados. Explora el catálogo y añade tus próximos descubrimientos.</div>}</section></ScreenShell>;
}
```

- [ ] **Step 7: Migrate the book-detail page**

In `app/libro/page.tsx`, keep the URL-loading effect and remove `saved`, the favorites synchronization effect, `toggleSave`, `FavoriteHeart`, and storage imports. Add:

```tsx
import { FavoriteButton } from "../components/favorite-button";
```

Replace the detail favorite action with:

```tsx
<FavoriteButton book={book} variant="detail" />
```

- [ ] **Step 8: Strengthen rendered HTML expectations**

Add these assertions to the existing home and detail tests in `tests/rendered-html.test.mjs`:

```js
assert.match(html, /Lista de deseos/);
assert.match(html, /aria-pressed="false"/);
```

For the detail test, retain:

```js
assert.match(html, /Guardar en mi lista/);
assert.match(html, /data-favorite-heart="static"/);
```

- [ ] **Step 9: Run focused and full tests**

Run:

```bash
node --test tests/favorites-consumers.test.mjs tests/favorite-heart-animation.test.mjs
npm test
npm run lint
```

Expected: all tests PASS, build exits 0, and lint exits 0.

- [ ] **Step 10: Commit the consumer migration**

```bash
git add app/page.tsx app/components/catalog-card.tsx app/components/section-header.tsx app/lista/page.tsx app/libro/page.tsx tests/favorites-consumers.test.mjs tests/rendered-html.test.mjs
git commit -m "Conecta favoritos en todas las pantallas"
```

---

### Task 5: Browser Regression and Production Readiness

**Files:**
- Modify only files implicated by an observed regression.

**Interfaces:**
- Consumes: completed shared favorites system.
- Produces: browser evidence that pointer, keyboard, persistence, and navigation meet the acceptance criteria.

- [ ] **Step 1: Start the local application**

Run:

```bash
npm run dev
```

Expected: the local server reports a URL and remains running without compile errors.

- [ ] **Step 2: Verify pointer behavior on the catalog**

Open `/seccion`, activate `Guardar Xocolátl` with the pointer, and verify:

```text
button label: Quitar Xocolátl
aria-pressed: true
header label: Lista de deseos, 1 libro
URL remains: /seccion
```

Activate it again and verify the label returns to `Guardar Xocolátl`, the count returns to `0`, and the URL remains unchanged.

- [ ] **Step 3: Verify keyboard behavior**

Focus `Guardar Xocolátl`, press Enter, then remove it with Space. Expected: each key changes the state exactly once and the count follows each change.

- [ ] **Step 4: Verify persistence and cross-tab synchronization**

Save Xocolátl, reload `/seccion`, and verify it remains selected. Open `/lista` in a second tab, remove Xocolátl in the first tab, and verify the second tab converges to the empty state through the native `storage` event.

- [ ] **Step 5: Verify all consumer surfaces**

Repeat one save/remove cycle on:

```text
/
/seccion
/novedades
/libro?slug=xocolatl-1763
/lista
```

Expected: one shared count and one shared state across all routes, with no visible flash on `/lista`.

- [ ] **Step 6: Verify responsive interaction and console health**

Check desktop and mobile viewport widths. Expected: card buttons retain a 48px hit target, do not cover title content, show visible keyboard focus, and produce no console errors.

- [ ] **Step 7: Run the final quality gate**

Run:

```bash
git diff --check
npm run catalog:check
npm test
npm run lint
git status --short
```

Expected: all commands exit 0. Git status shows only the known unrelated ` 2` files plus any intentional favorites changes not yet committed.

- [ ] **Step 8: Commit any evidence-driven correction**

If browser verification required a correction, stage only the implicated favorites files and commit:

```bash
git add app tests package.json
git commit -m "Corrige regresión de favoritos"
```

If no correction was required, skip this commit.

- [ ] **Step 9: Prepare deployment handoff**

Record the final commit hash and confirm that the branch is ready to push. Deployment and published verification happen only after the implementation branch passes every previous step.
