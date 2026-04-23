import { Search } from "lucide-react";

export function ToolSearch({
  value,
  onChange,
  resultCount,
}: {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
}) {
  return (
    <div className="w-full min-w-0">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search 100+ text tools…"
          aria-label="Search tools"
          className="h-12 w-full min-w-0 appearance-none rounded-2xl border border-border bg-card pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring xsm:h-14 xsm:text-base sm:text-lg [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />
      </div>
      {value && (
        <p className="mt-2 px-1 text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      )}
    </div>
  );
}
