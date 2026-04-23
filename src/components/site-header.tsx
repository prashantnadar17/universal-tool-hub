import { Link } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen, Wrench, Command as CommandIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { totalTools } from "@/lib/tools";

export function SiteHeader({ onOpenPalette }: { onOpenPalette?: () => void } = {}) {
  const openPalette = onOpenPalette ?? (() => window.dispatchEvent(new CustomEvent("ut:open-palette")));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refresh = () => setSidebarCollapsed(document.documentElement.dataset.sidebarCollapsed === "true");
    refresh();
    window.addEventListener("ut:sidebar-change", refresh);

    return () => window.removeEventListener("ut:sidebar-change", refresh);
  }, []);

  function toggleSidebar() {
    const next = !sidebarCollapsed;
    document.documentElement.dataset.sidebarCollapsed = String(next);
    window.dispatchEvent(new CustomEvent("ut:sidebar-change", { detail: { collapsed: next } }));
    setSidebarCollapsed(next);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-7xl min-w-0 items-center justify-between gap-2 px-3 xsm:px-4 sm:h-16 sm:px-6 lg:px-8 2xl:px-10 3xl:px-12">
        <div className="flex min-w-0 items-center gap-2">
          {/* Sidebar toggle — top-left on desktop */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={sidebarCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:inline-flex"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          {/* Hamburger — top-left on mobile/tablet */}
          <MobileNav />
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="max-w-[10rem] truncate text-sm font-semibold tracking-tight text-foreground xsm:max-w-none xsm:text-base sm:text-lg">
              Universal Tools
            </span>
            <span className="ml-1 hidden rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground md:inline">
              {totalTools}+ tools
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette (Cmd+K)"
            className="hidden items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground mg:inline-flex"
          >
            <CommandIcon className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
