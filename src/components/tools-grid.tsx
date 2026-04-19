import { useMemo } from "react";
import { ToolCard } from "./tool-card";
import { searchTools, type Tool } from "@/lib/tools";

export default function ToolsGrid({ query }: { query: string }) {
  const results = useMemo(() => searchTools(query), [query]);

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <p className="text-base font-medium text-foreground">No tools match “{query}”.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p>
      </div>
    );
  }

  // Group by category, but keep a flat ordering by priority.
  const grouped = results.reduce<Record<string, Tool[]>>((acc, tool) => {
    (acc[tool.category] ||= []).push(tool);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort(
    (a, b) => grouped[a][0].priority - grouped[b][0].priority,
  );

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {category}
            </h2>
            <span className="text-sm text-muted-foreground">{grouped[category].length} tools</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grouped[category].map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
