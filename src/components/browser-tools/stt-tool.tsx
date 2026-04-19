import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Copy } from "lucide-react";

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

export function SttTool() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const r: SpeechRecognitionInstance = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        chunk += e.results[i][0].transcript;
      }
      setText((prev) => prev + chunk + " ");
    };
    r.onerror = (e: any) => setError(`Mic error: ${e.error}`);
    r.onend = () => setListening(false);
    recRef.current = r;
    return () => r.stop();
  }, []);

  if (!supported) {
    return <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Speech recognition is not supported in this browser. Try Chrome or Edge.</p>;
  }

  const toggle = () => {
    if (!recRef.current) return;
    if (listening) recRef.current.stop();
    else {
      setError(null);
      recRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={toggle} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"} hover:opacity-90`}>
          {listening ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Start listening</>}
        </button>
        <button onClick={() => navigator.clipboard.writeText(text)} disabled={!text} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent disabled:opacity-50">
          <Copy className="h-4 w-4" /> Copy
        </button>
        {listening && <span aria-live="polite" className="text-xs text-muted-foreground">Listening…</span>}
      </div>
      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <textarea
        aria-label="Transcribed text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Your transcribed text will appear here…"
        className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
