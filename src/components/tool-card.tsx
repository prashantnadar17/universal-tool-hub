import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {tool.category}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{tool.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
    </article>
  );
}
