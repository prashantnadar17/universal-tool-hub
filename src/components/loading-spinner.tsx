import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)} role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
