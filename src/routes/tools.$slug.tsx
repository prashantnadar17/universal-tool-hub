import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BackToTop } from "@/components/back-to-top";
import { CategorySidebar } from "@/components/category-nav";
import { ToolRunner } from "@/components/tool-runner";
import { tools } from "@/lib/tools";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = tools.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => {
    const tool = loaderData?.tool;
    if (!tool) return { meta: [{ title: "Tool not found" }] };
    const title = `${tool.name} — Free Online Tool | Universal Tools`;
    const description = `${tool.description} Free, fast, no signup. Part of 100+ text tools.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: [tool.name, tool.category, "online tool", "free", ...(tool.keywords ?? [])].join(", ") },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: `/tools/${tool.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tool not found</h1>
        <p className="mt-2 text-muted-foreground">The tool you're looking for doesn't exist.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Browse all tools
        </Link>
      </div>
    </div>
  ),
  component: ToolPage,
});

function ToolPage() {
  const { tool } = Route.useLoaderData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl">
        <CategorySidebar activeSlug={tool.slug} />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
            <ol className="flex items-center gap-1">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden>/</li>
              <li>{tool.category}</li>
              <li aria-hidden>/</li>
              <li className="text-foreground">{tool.name}</li>
            </ol>
          </nav>

          <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All tools
          </Link>

          <header className="mb-6">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {tool.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {tool.name}
            </h1>
            <p className="mt-2 max-w-3xl text-base text-muted-foreground">{tool.description}</p>
          </header>

          <ToolRunner tool={tool} />

          <section className="mt-12 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">About {tool.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tool.name} is a free online tool in the <strong className="text-foreground">{tool.category}</strong> category. It runs entirely in your browser whenever possible, so your data stays private. No sign-up, no installs, no limits.
            </p>
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </main>
      </div>
      <BackToTop />
    </div>
  );
}
