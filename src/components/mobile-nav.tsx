import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Wrench, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { tools, toolsByCategory } from "@/lib/tools";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const categories = Object.keys(toolsByCategory).sort(
    (a, b) => toolsByCategory[a][0].priority - toolsByCategory[b][0].priority,
  );

  // Auto-close the drawer when the route changes (Radix Dialog handles focus
  // trap while open and restores focus to the trigger on close).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-accent lg:hidden"
        aria-label="Open categories menu"
      >
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm overflow-x-hidden overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-primary" /> Categories
          </SheetTitle>
        </SheetHeader>
        <nav className="min-w-0 p-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="mb-2 flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            All tools
            <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{tools.length}</span>
          </Link>
          <ul className="space-y-0.5">
            {categories.map((cat) => {
              const isOpen = expanded[cat] ?? false;
              const items = toolsByCategory[cat];
              return (
                <li key={cat}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded((e) => ({ ...e, [cat]: !e[cat] }))}
                    className="flex w-full items-center gap-1 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
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
                            onClick={() => setOpen(false)}
                            className="block break-words rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
      </SheetContent>
    </Sheet>
  );
}
