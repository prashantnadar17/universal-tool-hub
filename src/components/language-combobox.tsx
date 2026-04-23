import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export const LANGUAGES: string[] = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani",
  "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Burmese",
  "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)",
  "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto",
  "Estonian", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian",
  "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew",
  "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish",
  "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda",
  "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian",
  "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese",
  "Maori", "Marathi", "Mongolian", "Nepali", "Norwegian", "Odia (Oriya)",
  "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian",
  "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala",
  "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish",
  "Tagalog", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen",
  "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa",
  "Yiddish", "Yoruba", "Zulu",
];

export const AUTO_DETECT = "Auto-detect";

export function LanguageCombobox({
  id,
  value,
  onChange,
  placeholder = "Select a language…",
  includeAutoDetect = false,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  includeAutoDetect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(
    () => (includeAutoDetect ? [AUTO_DETECT, ...LANGUAGES] : LANGUAGES),
    [includeAutoDetect],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((l) => l.toLowerCase().includes(q));
  }, [query, list]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  function select(lang: string) {
    onChange(lang);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus:ring-2 focus:ring-ring"
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="relative border-b border-border">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language…"
              className="h-9 w-full appearance-none bg-transparent pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No languages found.</li>
            ) : (
              filtered.map((lang) => {
                const selected = lang === value;
                return (
                  <li key={lang}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => select(lang)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                        selected ? "bg-accent/60 font-medium" : ""
                      }`}
                    >
                      <span>{lang}</span>
                      {selected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
