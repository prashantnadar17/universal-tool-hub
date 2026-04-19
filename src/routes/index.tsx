import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useDeferredValue, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ToolSearch } from "@/components/tool-search";
import { searchTools, toolsByCategory, totalTools } from "@/lib/tools";

// Lazy-loaded grid demonstrates the per-component spinner pattern.
const ToolsGrid = lazy(() => import("@/components/tools-grid"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Universal Tools — 100+ Free Text Tools" },
      {
        name: "description",
        content:
          "A fast, universal collection of 100+ free text tools: writing, conversion, encoding, SEO, generators and more.",
      },
      { property: "og:title", content: "Universal Tools — 100+ Free Text Tools" },
      {
        property: "og:description",
        content: "Search and use 100+ powerful text tools instantly. Fast, scalable, and free.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = useMemo(() => searchTools(deferred), [deferred]);
  const categoryCount = Object.keys(toolsByCategory).length;

  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground antialiased">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Universal Tools App · Text Edition
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Every text tool you need,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              in one place.
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Search across <strong className="text-foreground">{totalTools}+ tools</strong> in{" "}
            {categoryCount} categories. Fast, free, and built to scale worldwide.
          </p>

          <div className="mt-8">
            <ToolSearch value={query} onChange={setQuery} resultCount={results.length} />
          </div>

          <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4 sm:gap-6">
            <Stat label="Tools" value={`${totalTools}+`} />
            <Stat label="Categories" value={String(categoryCount)} />
            <Stat label="Cost" value="Free" />
          </dl>
        </section>

        {/* Tools grid */}
        <section className="mt-14">
          <Suspense fallback={<LoadingSpinner label="Loading tools…" />}>
            <ToolsGrid query={deferred} />
          </Suspense>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Universal Tools</p>
          <p>{totalTools}+ tools and growing</p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{value}</dd>
    </div>
  );
}
