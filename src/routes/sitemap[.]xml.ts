import { createFileRoute } from "@tanstack/react-router";
import { tools } from "@/lib/tools";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const origin = "https://universal-tools.app";
        const urls = [
          `<url><loc>${origin}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
          ...tools.map((t) =>
            `<url><loc>${origin}/tools/${t.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
          ),
        ].join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
