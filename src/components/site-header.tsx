import { Link } from "@tanstack/react-router";
import { Wrench, Command as CommandIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { totalTools } from "@/lib/tools";

export function SiteHeader({ onOpenPalette }: { onOpenPalette?: () => void } = {}) {
  const openPalette = onOpenPalette ?? (() => window.dispatchEvent(new CustomEvent("ut:open-palette")));
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Universal Tools
            </span>
            <span className="ml-2 hidden rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground sm:inline">
              {totalTools}+ tools
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette (Cmd+K)"
            className="hidden items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
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
