import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useDeferredValue, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ToolSearch } from "@/components/tool-search";
import { CategorySidebar, CategoryChips } from "@/components/category-nav";
import { UsageSections } from "@/components/usage-sections";
import { fuzzySearchTools } from "@/lib/search";
import { toolsByCategory, totalTools } from "@/lib/tools";

const ToolsGrid = lazy(() => import("@/components/tools-grid"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Universal Tools — ${totalTools}+ Free Online Text Tools` },
      { name: "description", content: `Search across ${totalTools}+ free, fast text tools — writing, conversion, encoding, SEO, generators and more. No signup, no installs.` },
      { name: "keywords", content: "text tools, online tools, word counter, base64, json formatter, summarizer, paraphraser, slug generator, free tools" },
      { property: "og:title", content: `Universal Tools — ${totalTools}+ Free Online Text Tools` },
      { property: "og:description", content: `Search across ${totalTools}+ free text tools. Fast, scalable, free.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const categoryCount = Object.keys(toolsByCategory).length;

  const results = useMemo(() => {
    const base = deferredQuery ? fuzzySearchTools(deferredQuery) : Object.values(toolsByCategory).flat();
    return activeCat ? base.filter((t) => t.category === activeCat) : base;
  }, [deferredQuery, activeCat]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Universal Tools",
    description: `${totalTools}+ free online text tools.`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "/?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl min-w-0">
        <CategorySidebar />
        <main className="min-w-0 flex-1 px-3 pb-16 pt-6 xsm:px-4 sm:px-6 mg:pt-8 lg:px-8 2xl:px-10 3xl:px-12">
          {/* Hero */}
          <section className="mx-auto max-w-3xl px-1 text-center">
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Universal Tools · Text Edition
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground xsm:text-4xl sm:text-5xl xl:text-6xl">
              Every text tool you need,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                in one place.
              </span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground xsm:text-base sm:text-lg">
              <strong className="text-foreground">{totalTools}+ tools</strong> across {categoryCount} categories. Typo-tolerant search. Free, fast, scalable.
            </p>
            <div className="mt-8">
              <ToolSearch value={query} onChange={setQuery} resultCount={results.length} />
            </div>
          </section>

          {/* Recently used + Popular (localStorage-backed) */}
          <div className="mt-8 sm:mt-10">
            <UsageSections />
          </div>

          {/* Filter chips */}
          <section aria-label="Filter tools by category" className="mt-6 sm:mt-8">
            <CategoryChips active={activeCat} onChange={setActiveCat} />
          </section>

          {/* Tools grid */}
          <section className="mt-5 sm:mt-6">
            <Suspense fallback={<LoadingSpinner label="Loading tools…" />}>
              <ToolsGrid items={results} />
            </Suspense>
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </main>
      </div>
      <BackToTop />
    </div>
  );
}
