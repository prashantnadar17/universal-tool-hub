import { useState, useTransition } from "react";
import { Copy, Download, Loader2, Play, RotateCcw, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { engines, type ToolField } from "@/lib/tool-engines";
import { runAiTool } from "@/lib/ai.functions";
import { TtsTool } from "./browser-tools/tts-tool";
import { SttTool } from "./browser-tools/stt-tool";
import { PasswordStrengthMeter } from "./password-strength-meter";

export function ToolRunner({ tool }: { tool: Tool }) {
  const engine = engines[tool.slug];

  if (!engine) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-base font-medium text-foreground">Coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">This tool is being wired up.</p>
      </div>
    );
  }

  if (engine.kind === "browser" && engine.browserComponent === "tts") return <TtsTool />;
  if (engine.kind === "browser" && engine.browserComponent === "stt") return <SttTool />;

  return <TransformOrAi tool={tool} />;
}

function TransformOrAi({ tool }: { tool: Tool }) {
  const engine = engines[tool.slug]!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [opts, setOpts] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    engine.fields?.forEach((f) => {
      if (f.defaultValue !== undefined) init[f.key] = f.defaultValue;
    });
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);

  const inputRequired = !engine.inputOptional;
  const isAi = engine.kind === "ai";

  async function run() {
    setError(null);
    if (inputRequired && !input.trim()) {
      setError("Please enter some text.");
      return;
    }

    if (isAi) {
      setAiLoading(true);
      try {
        const result = await runAiTool({
          data: {
            prompt: engine.aiPrompt!,
            text: input,
            options: Object.fromEntries(Object.entries(opts).map(([k, v]) => [k, String(v)])),
          },
        });
        if (result.ok) setOutput(result.content);
        else setError(result.error);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setAiLoading(false);
      }
      return;
    }

    startTransition(() => {
      try {
        const result = engine.run!(input, opts);
        setOutput(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not process input.");
      }
    });
  }

  function reset() {
    setInput("");
    setOutput("");
    setError(null);
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  }

  function download() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const loading = pending || aiLoading;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {/* Input */}
      <section aria-labelledby="input-label" className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <label id="input-label" htmlFor={`${tool.slug}-input`} className="text-sm font-medium text-foreground">
            {engine.inputLabel ?? "Input"}
          </label>
          <span className="text-xs text-muted-foreground">{input.length} chars</span>
        </div>
        <textarea
          id={`${tool.slug}-input`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={engine.inputPlaceholder ?? (engine.inputOptional ? "Optional input…" : "Paste your text here…")}
          rows={12}
          aria-required={inputRequired}
          className="w-full resize-y rounded-xl border border-border bg-card p-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
        />

        {engine.fields && engine.fields.length > 0 && (
          <div className="mt-3 grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2">
            {engine.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={opts[f.key]} onChange={(v) => setOpts((o) => ({ ...o, [f.key]: v }))} />
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            aria-label={`Run ${tool.name}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isAi ? <Sparkles className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isAi ? "Generate" : "Run"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </section>

      {/* Output */}
      <section aria-labelledby="output-label" className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span id="output-label" className="text-sm font-medium text-foreground">
            {engine.outputLabel ?? "Output"}
          </span>
          <span className="text-xs text-muted-foreground">{output.length} chars</span>
        </div>
        <div className="relative flex-1">
          <textarea
            value={output}
            readOnly
            rows={12}
            placeholder="Result will appear here…"
            aria-label="Result output"
            className="w-full resize-y rounded-xl border border-border bg-muted/40 p-4 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-card/60 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            disabled={!output}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!output}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
        {tool.slug === "password-generator" && output && (
          <PasswordStrengthMeter output={output} />
        )}
      </section>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: ToolField; value: unknown; onChange: (v: unknown) => void }) {
  const id = `field-${field.key}`;
  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-foreground">
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
        />
        {field.label}
      </label>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {field.label}
      </label>
      <input
        id={id}
        type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
        value={value as string ?? ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className="min-w-0 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
