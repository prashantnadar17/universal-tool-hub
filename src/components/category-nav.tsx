import { Link } from "@tanstack/react-router";
import { Wrench, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { tools, toolsByCategory } from "@/lib/tools";
import { useEffect, useState } from "react";

export function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const categories = Object.keys(toolsByCategory).sort(
    (a, b) => toolsByCategory[a][0].priority - toolsByCategory[b][0].priority,
  );
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c, !!toolsByCategory[c].some((t) => t.slug === activeSlug)])),
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refresh = () => setCollapsed(document.documentElement.dataset.sidebarCollapsed === "true");
    refresh();
    window.addEventListener("ut:sidebar-change", refresh);

    return () => window.removeEventListener("ut:sidebar-change", refresh);
  }, []);

  return (
    <aside
      aria-label="Tool categories"
      className={`hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block ${collapsed ? "w-0 overflow-hidden border-r-0" : "w-64"}`}
    >
      <nav className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-x-hidden overflow-y-auto p-4 sm:top-16 sm:max-h-[calc(100vh-4rem)]">
        <Link
          to="/"
          className="mb-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Wrench className="h-4 w-4 text-primary" />
          All tools
          <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
            {tools.length}
          </span>
        </Link>
        <ul className="space-y-0.5">
          {categories.map((cat) => {
            const isOpen = open[cat] ?? false;
            const items = toolsByCategory[cat];
            return (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [cat]: !o[cat] }))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground hover:bg-accent"
                >
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="flex-1">{cat}</span>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </button>
                {isOpen && (
                  <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {items.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          to="/tools/$slug"
                          params={{ slug: tool.slug }}
                          className="block truncate rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          activeProps={{ className: "block truncate rounded-md px-2 py-1 text-xs bg-accent text-accent-foreground font-medium" }}
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function CategoryChips({ active, onChange }: { active: string | null; onChange: (cat: string | null) => void }) {
  const categories = Object.keys(toolsByCategory).sort(
    (a, b) => toolsByCategory[a][0].priority - toolsByCategory[b][0].priority,
  );
  return (
    <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2 pb-2">
      <Chip active={active === null} onClick={() => onChange(null)} label="All" />
      {categories.map((c) => (
        <Chip key={c} active={active === c} onClick={() => onChange(c)} label={`${c} (${toolsByCategory[c].length})`} />
      ))}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`max-w-full rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span className="block break-words">{label}</span>
    </button>
  );
}
