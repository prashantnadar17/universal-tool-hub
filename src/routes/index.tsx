import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ToolSearch } from "@/components/tool-search";
import { CategoryChips } from "@/components/category-nav";
import { UsageSections } from "@/components/usage-sections";
import { FeaturedSkeleton, PopularSkeleton, ResultsSkeleton } from "@/components/home-skeletons";
import { fuzzySearchTools } from "@/lib/search";
import { tools, toolsByCategory, totalTools, type ToolCategory } from "@/lib/tools";
import {
  FileText,
  Image as ImageIcon,
  Calculator,
  Ruler,
  Code2,
  Sparkles,
  Type,
  Wand2,
  Flame,
  ArrowRight,
} from "lucide-react";

const ToolsGrid = lazy(() => import("@/components/tools-grid"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Universal Tools Hub — ${totalTools}+ Free Online Tools` },
      { name: "description", content: `All your everyday tools in one place — ${totalTools}+ free tools for text, writing, conversion, encoding, generators, SEO and more. No signup, no installs.` },
      { name: "keywords", content: "online tools, free tools, text tools, pdf tools, image tools, calculators, unit converters, developer tools, word counter, json formatter" },
      { property: "og:title", content: `Universal Tools Hub — ${totalTools}+ Free Online Tools` },
      { property: "og:description", content: `All your everyday tools in one place. ${totalTools}+ free, fast, browser-based tools.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

// Featured category tiles inspired by the reference design.
// Each maps to one or more existing categories from src/lib/tools.ts.
type Feature = {
  title: string;
  description: string;
  icon: typeof FileText;
  cats: ToolCategory[];
  accent: string; // tailwind classes for the icon tile
  ring: string;   // tailwind classes for the card border accent
};

const FEATURES: Feature[] = [
  {
    title: "Writing & AI",
    description: "Summarize, paraphrase, generate and rewrite with AI.",
    icon: Sparkles,
    cats: ["Writing & AI", "AI & Modern"],
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    ring: "hover:border-blue-400/60",
  },
  {
    title: "Text & Analysis",
    description: "Counters, frequency, readability and analyzers.",
    icon: Type,
    cats: ["Text Analysis", "Case & Formatting"],
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    ring: "hover:border-emerald-400/60",
  },
  {
    title: "Generators",
    description: "Passwords, lorem ipsum, names, slugs and IDs.",
    icon: Wand2,
    cats: ["Generators"],
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "hover:border-amber-400/60",
  },
  {
    title: "Conversion",
    description: "Cases, units of text, encodings and number bases.",
    icon: Ruler,
    cats: ["Conversion", "Encoding"],
    accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    ring: "hover:border-cyan-400/60",
  },
  {
    title: "Data & Code",
    description: "JSON, CSV, YAML formatters and developer utilities.",
    icon: Code2,
    cats: ["Data Conversion", "Code Utilities"],
    accent: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    ring: "hover:border-violet-400/60",
  },
  {
    title: "SEO & Marketing",
    description: "Slugs, meta, keywords and content helpers.",
    icon: Calculator,
    cats: ["SEO & Marketing", "Fancy Text", "Niche", "Find & Compare", "Cleaning", "Lists", "Extraction"],
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    ring: "hover:border-rose-400/60",
  },
];

// Decorative coming-soon tiles to communicate that the hub spans many tool types.
const COMING_SOON: { title: string; description: string; icon: typeof FileText; accent: string }[] = [
  {
    title: "PDF Tools",
    description: "Merge, split, compress and convert PDFs.",
    icon: FileText,
    accent: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  {
    title: "Image Tools",
    description: "Resize, compress, convert and edit images.",
    icon: ImageIcon,
    accent: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  },
  {
    title: "Calculators",
    description: "Currency, units, finance and math calculators.",
    icon: Calculator,
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
];

function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const categoryCount = Object.keys(toolsByCategory).length;
  const isSearching = deferredQuery.trim().length > 0 || activeCat !== null;
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setHydrated(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const base = deferredQuery ? fuzzySearchTools(deferredQuery) : Object.values(toolsByCategory).flat();
    return activeCat ? base.filter((t) => t.category === activeCat) : base;
  }, [deferredQuery, activeCat]);

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selectCategory = useCallback(
    (cat: string | null) => {
      setActiveCat(cat);
      scrollToResults();
    },
    [scrollToResults],
  );

  // "Most popular" — pick a curated set of high-priority, well-known tools.
  const popular = useMemo(() => {
    const wanted = [
      "word-counter",
      "json-formatter",
      "password-generator",
      "qr-code-generator",
      "text-summarizer",
      "base64-encoder-decoder",
    ];
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    return wanted.map((s) => bySlug.get(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Universal Tools Hub",
    description: `${totalTools}+ free online tools across ${categoryCount} categories.`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "/?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="min-w-0 px-3 pb-16 pt-6 xsm:px-4 sm:px-6 mg:pt-8 lg:px-8 2xl:px-10 3xl:px-12">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-10 text-center sm:px-8 sm:py-14">
        <span className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          Universal Tools Hub
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground xsm:text-4xl sm:text-5xl xl:text-6xl">
          All your everyday tools,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            in one place.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground xsm:text-base sm:text-lg">
          Access <strong className="text-foreground">{totalTools}+ free online tools</strong> across {categoryCount} categories — writing, conversion, generators, developer utilities and more. No signup. Works in your browser.
        </p>
        <div className="mx-auto mt-8 max-w-2xl">
          <ToolSearch value={query} onChange={setQuery} resultCount={results.length} />
        </div>
      </section>

      {/* Recently used + Popular (localStorage-backed) */}
      <div className="mt-8 sm:mt-10">
        <UsageSections />
      </div>

      {!isSearching && (
        <>
          {/* Featured categories */}
          <section aria-labelledby="featured-heading" className="mt-10 sm:mt-12">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="featured-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Featured tool categories
              </h2>
              <span className="text-xs text-muted-foreground">{categoryCount} categories · {totalTools}+ tools</span>
            </div>
            <div className="grid grid-cols-1 gap-4 xsm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const count = f.cats.reduce((n, c) => n + (toolsByCategory[c]?.length ?? 0), 0);
                const Icon = f.icon;
                return (
                  <button
                    key={f.title}
                    type="button"
                    onClick={() => setActiveCat(f.cats[0])}
                    aria-label={`Browse ${f.title}`}
                    className={`group flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${f.ring}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.accent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                        {count} tools
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">{f.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{f.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Coming soon tiles — communicates broader scope */}
          <section aria-labelledby="more-heading" className="mt-10 sm:mt-12">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="more-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                More tools coming soon
              </h2>
              <span className="text-xs text-muted-foreground">Expanding the hub</span>
            </div>
            <div className="grid grid-cols-1 gap-4 xsm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {COMING_SOON.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="relative flex h-full min-w-0 flex-col rounded-2xl border border-dashed border-border bg-card/60 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Most popular strip */}
          <section aria-labelledby="popular-heading" className="mt-10 sm:mt-12">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" aria-hidden />
                <h2 id="popular-heading" className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Most popular tools
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2.5 xsm:grid-cols-2 lg:grid-cols-3">
                {popular.map((tool, i) => (
                  <Link
                    key={tool.slug}
                    to="/tools/$slug"
                    params={{ slug: tool.slug }}
                    aria-label={`Open ${tool.name}`}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium text-foreground">{tool.name}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Filter chips + grid (visible always, prominent during search) */}
      <section aria-label="Filter tools by category" className="mt-10 sm:mt-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {isSearching ? `Results (${results.length})` : "Browse all tools"}
          </h2>
          {activeCat && (
            <button
              type="button"
              onClick={() => setActiveCat(null)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <CategoryChips active={activeCat} onChange={setActiveCat} />
      </section>

      <section className="mt-5 sm:mt-6">
        <Suspense fallback={<LoadingSpinner label="Loading tools…" />}>
          <ToolsGrid items={results} />
        </Suspense>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
