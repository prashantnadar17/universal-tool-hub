import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, ListOrdered } from "lucide-react";
import { scorePassword, type PasswordStrength } from "@/lib/password-strength";

const TONE_BG: Record<PasswordStrength["tone"], string> = {
  destructive: "bg-destructive",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  primary: "bg-primary",
};

const TONE_TEXT: Record<PasswordStrength["tone"], string> = {
  destructive: "text-destructive",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  primary: "text-primary",
};

// Map raw reasons → clearer, action-oriented hints.
function toHint(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("too short")) return "Increase length to at least 12 characters";
  if (r.includes("consider 12")) return "Aim for 12+ characters for better security";
  if (r.includes("character types")) return "Enable mixed case, numbers, and symbols";
  if (r.includes("common password")) return "Avoid common passwords — use a unique seed";
  if (r.includes("common word")) return `Avoid common dictionary words (${reason.replace(/^Contains common word\s*/i, "")})`;
  if (r.includes("repeated")) return "Avoid repeating the same character (e.g. aaa, 111)";
  if (r.includes("sequence")) return "Avoid keyboard or alphabet sequences (abc, qwerty, 123)";
  if (r.includes("empty")) return "Generate a password to see strength";
  return reason;
}

function StrengthRow({ pwd, rank }: { pwd: string; rank?: number }) {
  const s = scorePassword(pwd);
  return (
    <li className="flex flex-col gap-1 rounded-md border border-border bg-background px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {rank !== undefined && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              #{rank}
            </span>
          )}
          <code className="truncate font-mono text-sm text-foreground">{pwd}</code>
        </div>
        <span className={`shrink-0 text-xs font-medium ${TONE_TEXT[s.tone]}`}>
          {s.label} · {s.score}/100 · {s.bits} bits
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={s.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${s.label}`}
      >
        <div
          className={`h-full rounded-full transition-all ${TONE_BG[s.tone]}`}
          style={{ width: `${s.score}%` }}
        />
      </div>
      {s.reasons.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
          {s.reasons.map((r, i) => (
            <li key={i} className="flex gap-1.5">
              <span aria-hidden className="text-muted-foreground/60">→</span>
              <span>{toHint(r)}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function PasswordStrengthMeter({ output }: { output: string }) {
  const [sortByStrength, setSortByStrength] = useState(false);

  const passwords = useMemo(
    () => output.split("\n").map((p) => p.trim()).filter(Boolean),
    [output],
  );

  const ordered = useMemo(() => {
    if (!sortByStrength) return passwords.map((p, i) => ({ p, original: i }));
    return passwords
      .map((p, i) => ({ p, original: i, score: scorePassword(p).score }))
      .sort((a, b) => b.score - a.score);
  }, [passwords, sortByStrength]);

  if (passwords.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Live strength meter
        </p>
        {passwords.length > 1 && (
          <button
            type="button"
            onClick={() => setSortByStrength((v) => !v)}
            aria-pressed={sortByStrength}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"
            title={sortByStrength ? "Show in original order" : "Sort strongest first"}
          >
            {sortByStrength ? <ArrowDownWideNarrow className="h-3 w-3" /> : <ListOrdered className="h-3 w-3" />}
            {sortByStrength ? "Strongest first" : "Sort by strength"}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {ordered.map((item, i) => (
          <StrengthRow
            key={`${item.p}-${item.original}`}
            pwd={item.p}
            rank={sortByStrength ? i + 1 : undefined}
          />
        ))}
      </ul>
    </div>
  );
}
