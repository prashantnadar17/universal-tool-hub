// Persists the homepage's last query + active category in localStorage so
// returning users land back exactly where they left off.

const KEY = "ut:home-prefs:v1";

export type HomePrefs = {
  query: string;
  activeCat: string | null;
};

const DEFAULTS: HomePrefs = { query: "", activeCat: null };

export function loadHomePrefs(): HomePrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<HomePrefs>;
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      activeCat: typeof parsed.activeCat === "string" ? parsed.activeCat : null,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveHomePrefs(prefs: HomePrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* quota or disabled — ignore */
  }
}
