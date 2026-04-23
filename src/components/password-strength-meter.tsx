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

function StrengthRow({ pwd }: { pwd: string }) {
  const s = scorePassword(pwd);
  return (
    <li className="flex flex-col gap-1 rounded-md border border-border bg-background px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <code className="truncate font-mono text-sm text-foreground">{pwd}</code>
        <span className={`shrink-0 text-xs font-medium ${TONE_TEXT[s.tone]}`}>
          {s.label} · {s.bits} bits
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
        <p className="text-[11px] text-muted-foreground">{s.reasons.join(" · ")}</p>
      )}
    </li>
  );
}

export function PasswordStrengthMeter({ output }: { output: string }) {
  const passwords = output.split("\n").map((p) => p.trim()).filter(Boolean);
  if (passwords.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Strength meter
      </p>
      <ul className="flex flex-col gap-2">
        {passwords.map((p, i) => (
          <StrengthRow key={`${p}-${i}`} pwd={p} />
        ))}
      </ul>
    </div>
  );
}
