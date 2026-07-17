import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const provider = await readFile(new URL("../app/components/favorites-provider.tsx", import.meta.url), "utf8").catch(() => "");
const favoritesCore = await readFile(new URL("../app/lib/favorites-core.ts", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const savedBooksKey = "sm-literatura:saved-books";

function evaluateTypeScript(source, fileName, requireModule, globals = {}) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    ...globals,
    exports: module.exports,
    module,
    require: requireModule,
  }, { filename: fileName });
  return module.exports;
}

const core = evaluateTypeScript(favoritesCore, "favorites-core.ts", (specifier) => {
  throw new Error(`Unexpected core import: ${specifier}`);
});

function createProviderHarness(initialValue) {
  const effects = [];
  const listeners = new Map();
  const writes = [];
  let storedValue = initialValue;

  const window = {
    localStorage: {
      getItem(key) {
        assert.equal(key, savedBooksKey);
        return storedValue;
      },
      setItem(key, value) {
        storedValue = value;
        writes.push({ key, value });
      },
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  const react = {
    createContext: () => ({ Provider: () => null }),
    useCallback: (callback) => callback,
    useContext: () => null,
    useEffect: (effect) => effects.push(effect),
    useMemo: (factory) => factory(),
    useRef: (value) => ({ current: value }),
    useState: (value) => [value, () => {}],
  };
  const store = {
    SAVED_BOOKS_KEY: savedBooksKey,
    readStored(key, fallback) {
      try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
  };
  const providerModule = evaluateTypeScript(provider, "favorites-provider.tsx", (specifier) => {
    if (specifier === "react") return react;
    if (specifier === "react/jsx-runtime") return { jsx: () => null };
    if (specifier === "./book-data") {
      return { catalogBooks: [{ slug: "known-slug", title: "Legacy title" }] };
    }
    if (specifier === "../lib/favorites-core") return core;
    if (specifier === "../lib/store") return store;
    throw new Error(`Unexpected provider import: ${specifier}`);
  }, { window });

  return {
    listener(type) {
      return listeners.get(type);
    },
    mount() {
      providerModule.FavoritesProvider({ children: null });
      assert.equal(effects.length, 1);
      effects[0]();
    },
    writes,
  };
}

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

test("initial hydration replaces corrupt JSON with an empty persisted list", () => {
  const harness = createProviderHarness("{corrupt");

  harness.mount();

  assert.deepEqual(harness.writes, [{ key: savedBooksKey, value: "[]" }]);
});

test("storage synchronization persists normalized legacy and invalid values", () => {
  const harness = createProviderHarness("[]");
  harness.mount();

  const syncFromAnotherTab = harness.listener("storage");
  assert.equal(typeof syncFromAnotherTab, "function");
  syncFromAnotherTab({
    key: savedBooksKey,
    newValue: JSON.stringify(["Legacy title", "known-slug", "invalid-slug", "Legacy title"]),
  });

  assert.deepEqual(harness.writes, [{ key: savedBooksKey, value: '["known-slug"]' }]);
});
