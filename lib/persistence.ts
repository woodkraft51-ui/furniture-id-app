/**
 * Persistence layer — IndexedDB-backed write-through for case data.
 *
 * Stage 1 of the persistence rollout. Provides the data layer only;
 * UI (My Scans browser, view-past-scan flow) is built in Stage 2.
 *
 * Why IndexedDB rather than localStorage:
 *   - Photos are data_urls (base64) and can be large; localStorage's
 *     ~5-10MB per-origin cap fills quickly across multi-scan sessions
 *     (especially the 50-scan Wednesday stress test).
 *   - Async API doesn't block the main thread on large writes.
 *   - Per-object-store transactions allow safe concurrent writes.
 *
 * Schema (version 1):
 *   Database: "proof_sleuth"
 *   Object store: "cases"
 *     keyPath: "id"  (matches case.id from store.ts, e.g. "case-1001")
 *     Indexes:
 *       - by_timestamp (case.persisted_at, descending in queries)
 *       - by_status    (case.status — "complete" most useful for browser)
 *
 * Error handling: all writes/reads catch and return null/empty rather
 * than throwing — the app must continue working when storage fails
 * (private browsing, quota exceeded, browser disabled, etc.). Failures
 * are logged via console.warn so dev can spot persistence issues but
 * users never see a crash from a save failure.
 */

const DB_NAME = "proof_sleuth";
const DB_VERSION = 1;
const STORE_CASES = "cases";

type AnyCase = Record<string, any> & { id: string };

let dbPromise: Promise<IDBDatabase | null> | null = null;

/**
 * Lazy-initializes and caches the IndexedDB connection. Returns null
 * (rather than throwing) if IndexedDB is unavailable — caller paths
 * treat null as "persistence disabled" and continue.
 */
function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      // SSR or browser without IDB support
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CASES)) {
        const store = db.createObjectStore(STORE_CASES, { keyPath: "id" });
        store.createIndex("by_timestamp", "persisted_at", { unique: false });
        store.createIndex("by_status", "status", { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn(
        "[persistence] Failed to open IndexedDB; persistence disabled this session.",
        request.error
      );
      resolve(null);
    };

    request.onblocked = () => {
      console.warn("[persistence] IndexedDB upgrade blocked by another tab.");
      resolve(null);
    };
  });

  return dbPromise;
}

/**
 * Save (write-through put) a case to IndexedDB. Adds a persisted_at
 * timestamp so the browser can order by recency. Idempotent — saving
 * the same id twice overwrites (which is the desired behavior for
 * a re-analyzed or re-run case).
 *
 * Returns true on success, false on any failure. Never throws.
 */
export async function saveCase(caseObj: AnyCase): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  const stamped = { ...caseObj, persisted_at: new Date().toISOString() };

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CASES, "readwrite");
      const store = tx.objectStore(STORE_CASES);
      store.put(stamped);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.warn("[persistence] saveCase failed", tx.error);
        resolve(false);
      };
      tx.onabort = () => {
        console.warn("[persistence] saveCase aborted (likely quota)", tx.error);
        resolve(false);
      };
    } catch (e) {
      console.warn("[persistence] saveCase exception", e);
      resolve(false);
    }
  });
}

/**
 * Load a single case by id. Returns null if not found, IndexedDB
 * unavailable, or any read failure.
 */
export async function getCase(id: string): Promise<AnyCase | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CASES, "readonly");
      const req = tx.objectStore(STORE_CASES).get(id);
      req.onsuccess = () => resolve((req.result as AnyCase) || null);
      req.onerror = () => {
        console.warn("[persistence] getCase failed", req.error);
        resolve(null);
      };
    } catch (e) {
      console.warn("[persistence] getCase exception", e);
      resolve(null);
    }
  });
}

/**
 * List all persisted cases. Returns empty array on any failure.
 *
 * Note: returns FULL case objects (including images). For the
 * eventual My Scans browser UI (Stage 2), consider a separate
 * listCaseSummaries() that projects only id/timestamp/form/mode/
 * status — full image data is heavy when iterating 50+ cases.
 * Stage 1 keeps it simple; optimize if browser perf demands it.
 */
export async function listCases(): Promise<AnyCase[]> {
  const db = await openDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CASES, "readonly");
      const req = tx.objectStore(STORE_CASES).getAll();
      req.onsuccess = () => resolve((req.result as AnyCase[]) || []);
      req.onerror = () => {
        console.warn("[persistence] listCases failed", req.error);
        resolve([]);
      };
    } catch (e) {
      console.warn("[persistence] listCases exception", e);
      resolve([]);
    }
  });
}

/**
 * Delete a case by id. Returns true if the request succeeded
 * (idempotent — deleting a missing id is not an error).
 */
export async function deleteCase(id: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CASES, "readwrite");
      tx.objectStore(STORE_CASES).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.warn("[persistence] deleteCase failed", tx.error);
        resolve(false);
      };
    } catch (e) {
      console.warn("[persistence] deleteCase exception", e);
      resolve(false);
    }
  });
}
