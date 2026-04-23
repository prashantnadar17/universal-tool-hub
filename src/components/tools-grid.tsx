import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { useGridKeyboardNav } from "@/hooks/use-grid-keyboard-nav";

export default function ToolsGrid({ items }: { items: Tool[] }) {
  const { containerRef } = useGridKeyboardNav<HTMLDivElement>();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <p className="text-base font-medium text-foreground">No tools match your search.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p>
      </div>
    );
  }

  // Group by category, ordered by priority.
  const grouped = items.reduce<Record<string, Tool[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort((a, b) => grouped[a][0].priority - grouped[b][0].priority);

  return (
    <div ref={containerRef} className="space-y-8 sm:space-y-10">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`cat-${category}`} className="break-words text-lg font-semibold tracking-tight text-foreground xsm:text-xl">
              {category}
            </h2>
            <span className="text-xs text-muted-foreground">{grouped[category].length} tools</span>
          </div>
          <div className="grid grid-cols-1 gap-3 xsm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {grouped[category].map((tool) => (
              <Link
                key={tool.slug}
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                data-grid-item
                aria-label={`Open ${tool.name}`}
                className="group flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                    {tool.category}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h3 className="break-words text-base font-semibold text-foreground">{tool.name}</h3>
                <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
