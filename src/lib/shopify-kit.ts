/**
 * Shopify Kit — shared state for the storefront app suite
 * (Wallet, Wishlist, Reviews). Demo mode persists to localStorage
 * so toggles and configs survive reloads without a backend.
 */

export type KitAppKey = "wallet" | "wishlist" | "reviews";

const LS_KEY = "thoth_shopify_kit";

export interface KitState {
  enabled: Record<KitAppKey, boolean>;
}

const DEFAULT_STATE: KitState = {
  enabled: { wallet: true, wishlist: true, reviews: true },
};

export function loadKitState(): KitState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<KitState>;
    return { enabled: { ...DEFAULT_STATE.enabled, ...(parsed.enabled ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveKitState(state: KitState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode) — state stays in memory */
  }
}

export function setAppEnabled(app: KitAppKey, on: boolean): KitState {
  const next = loadKitState();
  next.enabled[app] = on;
  saveKitState(next);
  return next;
}

/** Per-app config blobs, keyed so each app owns its own namespace. */
export function loadAppConfig<T>(app: KitAppKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_KEY}_${app}`);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function saveAppConfig<T>(app: KitAppKey, config: T) {
  try {
    localStorage.setItem(`${LS_KEY}_${app}`, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}
