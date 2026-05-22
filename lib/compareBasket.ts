/**
 * Comparison basket — an ordered list of saved-case ids (max 5) the user
 * wants to view side-by-side. Stored in localStorage; the case data itself
 * lives in IndexedDB (lib/persistence.ts) and is loaded on demand by the
 * compare view. Guarded for SSR / private-mode.
 */

export const COMPARE_BASKET_KEY = "proof_sleuth_compare_basket";
export const COMPARE_BASKET_MAX = 5;
// Dispatched on the window after any mutation so in-page indicators can
// refresh without prop-drilling.
export const COMPARE_BASKET_EVENT = "proof_sleuth_compare_basket_change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_BASKET_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPARE_BASKET_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(COMPARE_BASKET_EVENT));
  } catch {
    // ignore
  }
}

export function getBasket(): string[] {
  return read();
}

export function isInBasket(id: string): boolean {
  return read().includes(id);
}

/** Add an id (no-op if already present or basket is full). Returns the
 *  outcome so callers can surface the right message. */
export function addToBasket(id: string): "added" | "exists" | "full" {
  const ids = read();
  if (ids.includes(id)) return "exists";
  if (ids.length >= COMPARE_BASKET_MAX) return "full";
  ids.push(id);
  write(ids);
  return "added";
}

export function removeFromBasket(id: string): void {
  write(read().filter((x) => x !== id));
}

export function clearBasket(): void {
  write([]);
}
