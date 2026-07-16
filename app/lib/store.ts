export const SAVED_BOOKS_KEY = "sm-literatura:saved-books";
export const CART_KEY = "sm-literatura:cart";

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}
