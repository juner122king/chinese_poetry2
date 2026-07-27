/** 本地诗笺（收藏）——无账号，localStorage */

export const SHELF_STORAGE_KEY = "moyun-shelf";
export const SHELF_EVENT = "moyun-shelf-change";

export type ShelfState = {
  /** 收藏顺序：新加入靠前 */
  ids: string[];
};

const EMPTY: ShelfState = { ids: [] };

/** useSyncExternalStore 缓存：同 raw 复用引用，避免无限重渲 */
let snapshotCache: ShelfState = EMPTY;
let snapshotRaw: string | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseShelf(raw: string | null): ShelfState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as ShelfState).ids)
    ) {
      return EMPTY;
    }
    const ids = (parsed as ShelfState).ids.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
    return ids.length === 0 ? EMPTY : { ids };
  } catch {
    return EMPTY;
  }
}

export function readShelf(): ShelfState {
  if (!canUseStorage()) return EMPTY;
  return parseShelf(localStorage.getItem(SHELF_STORAGE_KEY));
}

export function getShelfSnapshot(): ShelfState {
  if (!canUseStorage()) return EMPTY;
  const raw = localStorage.getItem(SHELF_STORAGE_KEY);
  if (raw === snapshotRaw) return snapshotCache;
  snapshotRaw = raw;
  snapshotCache = parseShelf(raw);
  return snapshotCache;
}

export function getShelfServerSnapshot(): ShelfState {
  return EMPTY;
}

export function subscribeShelf(onStoreChange: () => void): () => void {
  if (!canUseStorage()) return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(SHELF_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SHELF_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function writeShelf(state: ShelfState): void {
  if (!canUseStorage()) return;
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(SHELF_STORAGE_KEY, raw);
    snapshotRaw = raw;
    snapshotCache = state.ids.length === 0 ? EMPTY : state;
    window.dispatchEvent(new CustomEvent(SHELF_EVENT, { detail: state }));
  } catch {
    /* quota / private mode */
  }
}

export function isOnShelf(id: string, state?: ShelfState): boolean {
  const s = state ?? getShelfSnapshot();
  return s.ids.includes(id);
}

export function toggleShelf(id: string): ShelfState {
  const current = getShelfSnapshot();
  const next: ShelfState = current.ids.includes(id)
    ? { ids: current.ids.filter((x) => x !== id) }
    : { ids: [id, ...current.ids] };
  writeShelf(next);
  return next;
}

export function removeFromShelf(id: string): ShelfState {
  const current = getShelfSnapshot();
  if (!current.ids.includes(id)) return current;
  const next = { ids: current.ids.filter((x) => x !== id) };
  writeShelf(next);
  return next;
}

export function clearShelf(): ShelfState {
  writeShelf(EMPTY);
  return EMPTY;
}
