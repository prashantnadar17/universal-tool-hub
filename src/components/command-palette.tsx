import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Clock, Wrench } from "lucide-react";
import { tools, toolsByCategory } from "@/lib/tools";
import { fuzzySearchTools } from "@/lib/search";
import { getRecent } from "@/lib/usage";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();

  // Cmd+K / Ctrl+K toggle + global open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ut:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ut:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [] as typeof tools;
    return fuzzySearchTools(query).slice(0, 12);
  }, [query]);

  const recentTools = useMemo(
    () => recent.map((s) => tools.find((t) => t.slug === s)).filter(Boolean) as typeof tools,
    [recent],
  );

  const categories = Object.keys(toolsByCategory).sort(
    (a, b) => toolsByCategory[a][0].priority - toolsByCategory[b][0].priority,
  );

  function go(slug: string) {
    setOpen(false);
    setQuery("");
    navigate({ to: "/tools/$slug", params: { slug } });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search 100+ tools…" />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>

        {query.trim() ? (
          <CommandGroup heading="Results">
            {results.map((t) => (
              <CommandItem key={t.slug} value={`${t.name} ${t.category} ${t.keywords?.join(" ") ?? ""}`} onSelect={() => go(t.slug)}>
                <Wrench className="h-4 w-4 text-primary" />
                <span className="font-medium">{t.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <>
            {recentTools.length > 0 && (
              <CommandGroup heading="Recently used">
                {recentTools.slice(0, 5).map((t) => (
                  <CommandItem key={t.slug} value={`recent-${t.slug}`} onSelect={() => go(t.slug)}>
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{t.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{t.category}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {categories.map((cat) => (
              <CommandGroup key={cat} heading={cat}>
                {toolsByCategory[cat].slice(0, 6).map((t) => (
                  <CommandItem key={t.slug} value={`${cat}-${t.slug} ${t.name}`} onSelect={() => go(t.slug)}>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>{t.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
