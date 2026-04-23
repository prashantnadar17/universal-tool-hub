import { Fragment, type ReactNode } from "react";

/**
 * Highlight matching tokens from `query` inside `text`.
 * Case-insensitive, splits the query on whitespace, and wraps each
 * match in a <mark> styled with theme tokens.
 */
export function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;

  const tokens = Array.from(
    new Set(
      q
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    ),
  ).sort((a, b) => b.length - a.length);

  if (tokens.length === 0) return text;

  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);

  return parts.map((part, i) =>
    re.test(part) ? (
      <mark
        key={i}
        className="rounded-sm bg-primary/20 px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
