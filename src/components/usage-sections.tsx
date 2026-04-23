import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Flame, ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools";
import { getRecent, getTopPopular } from "@/lib/usage";

const bySlug = new Map(tools.map((t) => [t.slug, t]));

function useUsage() {
  const [recent, setRecent] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => {
      setRecent(getRecent());
      setPopular(getTopPopular(6));
    };
    refresh();
    window.addEventListener("ut:usage-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ut:usage-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { recent, popular };
}

function ToolPill({ slug }: { slug: string }) {
  const tool = bySlug.get(slug);
  if (!tool) return null;
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      aria-label={`Open ${tool.name}`}
      className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
    >
      <span className="truncate font-medium text-foreground">{tool.name}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function UsageSections() {
  const { recent, popular } = useUsage();
  if (recent.length === 0 && popular.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="min-w-0 rounded-xl border border-border bg-card/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            <h2 id="recent-heading" className="text-sm font-semibold tracking-tight text-foreground">
              Recently used
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2 xsm:grid-cols-1 sm:grid-cols-2">
            {recent.slice(0, 6).map((slug) => (
              <ToolPill key={slug} slug={slug} />
            ))}
          </div>
        </section>
      )}
      {popular.length > 0 && (
        <section aria-labelledby="popular-heading" className="min-w-0 rounded-xl border border-border bg-card/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" aria-hidden />
            <h2 id="popular-heading" className="text-sm font-semibold tracking-tight text-foreground">
              Popular with you
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2 xsm:grid-cols-1 sm:grid-cols-2">
            {popular.map((slug) => (
              <ToolPill key={slug} slug={slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
