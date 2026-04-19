import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { totalTools } from "@/lib/tools";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Universal Tools
          </span>
          <span className="ml-2 hidden rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground sm:inline">
            {totalTools}+ tools
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
