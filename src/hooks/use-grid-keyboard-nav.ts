import { useCallback, useEffect, useRef } from "react";

/**
 * Roving keyboard navigation for a grid/list of focusable items.
 *
 * Attach the returned `containerRef` to the wrapper element and mark each
 * navigable child with `data-grid-item` (and ensure they are focusable —
 * `<a>`, `<button>`, or `tabIndex={0}`).
 *
 * Arrow keys move focus across the grid (auto-detects columns from layout).
 * Home/End jump to first/last. Enter/Space activate the focused item.
 */
export function useGridKeyboardNav<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  const items = useCallback((): HTMLElement[] => {
    const root = containerRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>("[data-grid-item]"));
  }, []);

  const focusIndex = useCallback(
    (i: number) => {
      const list = items();
      if (list.length === 0) return;
      const clamped = Math.max(0, Math.min(list.length - 1, i));
      list[clamped].focus();
    },
    [items],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.matches("[data-grid-item]")) return;
      const list = items();
      if (list.length === 0) return;
      const idx = list.indexOf(target);
      if (idx === -1) return;

      // Detect columns from the actual layout (top offset of each item).
      const firstTop = list[0].offsetTop;
      const cols = Math.max(
        1,
        list.findIndex((el) => el.offsetTop > firstTop),
      );
      const columns = cols === -1 ? list.length : cols;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          focusIndex(idx + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          focusIndex(idx - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          focusIndex(idx + columns);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusIndex(idx - columns);
          break;
        case "Home":
          e.preventDefault();
          focusIndex(0);
          break;
        case "End":
          e.preventDefault();
          focusIndex(list.length - 1);
          break;
        case "Enter":
        case " ":
          // Native <a>/<button> already activate on Enter; trigger click for
          // Space on links and any non-button focusable elements.
          if (target.tagName !== "BUTTON") {
            e.preventDefault();
            target.click();
          }
          break;
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [items, focusIndex]);

  return { containerRef };
}
