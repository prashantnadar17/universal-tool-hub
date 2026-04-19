// Tracks recently used + popular tools in localStorage. SSR-safe.
const RECENT_KEY = "ut:recent";
const POPULAR_KEY = "ut:popular";
const MAX_RECENT = 8;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ut:usage-change"));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function getRecent(): string[] {
  return read<string[]>(RECENT_KEY, []);
}

export function getPopular(): Record<string, number> {
  return read<Record<string, number>>(POPULAR_KEY, {});
}

export function recordToolUsage(slug: string) {
  if (!slug) return;
  const recent = getRecent().filter((s) => s !== slug);
  recent.unshift(slug);
  write(RECENT_KEY, recent.slice(0, MAX_RECENT));

  const popular = getPopular();
  popular[slug] = (popular[slug] ?? 0) + 1;
  write(POPULAR_KEY, popular);
}

export function getTopPopular(limit = 6): string[] {
  const pop = getPopular();
  return Object.entries(pop)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}

export function clearUsage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_KEY);
  window.localStorage.removeItem(POPULAR_KEY);
  window.dispatchEvent(new CustomEvent("ut:usage-change"));
}
