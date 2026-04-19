import { useEffect, useState } from "react";
import { Play, Pause, Square } from "lucide-react";

export function TtsTool() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!voice && v[0]) setVoice(v[0].name);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voice]);

  if (!supported) {
    return <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Speech synthesis is not supported in this browser.</p>;
  }

  const speak = () => {
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voice);
    if (v) u.voice = v;
    u.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-4">
      <textarea
        aria-label="Text to speak"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to speak…"
        rows={10}
        className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tts-voice" className="mb-1 block text-xs font-medium text-muted-foreground">Voice</label>
          <select
            id="tts-voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tts-rate" className="mb-1 block text-xs font-medium text-muted-foreground">Rate ({rate.toFixed(1)}x)</label>
          <input
            id="tts-rate"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={speak} disabled={!text} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Play className="h-4 w-4" /> Speak
        </button>
        <button onClick={() => window.speechSynthesis.pause()} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <Pause className="h-4 w-4" /> Pause
        </button>
        <button onClick={() => window.speechSynthesis.cancel()} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <Square className="h-4 w-4" /> Stop
        </button>
      </div>
    </div>
  );
}
