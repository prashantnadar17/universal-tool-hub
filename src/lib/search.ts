import Fuse from "fuse.js";
import { tools, type Tool } from "./tools";

// Global Fuse instance — built once, shared across the app.
let fuseInstance: Fuse<Tool> | null = null;

function getFuse(): Fuse<Tool> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(tools, {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "keywords", weight: 0.25 },
        { name: "description", weight: 0.1 },
        { name: "category", weight: 0.05 },
      ],
      threshold: 0.38, // typo-tolerance
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

export function fuzzySearchTools(query: string): Tool[] {
  const q = query.trim();
  if (!q) return tools;
  return getFuse()
    .search(q)
    .map((r) => r.item);
}
