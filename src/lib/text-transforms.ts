// Pure offline implementations for text tools.
// Each function: (input: string, opts?) => string | Promise<string>.

const ZERO_WIDTH = "\u200B";

export const transforms = {
  // ── Counters / analysis ───────────────────────────────────────────
  wordCount: (s: string) => String(s.trim() ? s.trim().split(/\s+/).length : 0),
  charCount: (s: string) =>
    `With spaces: ${s.length}\nWithout spaces: ${s.replace(/\s/g, "").length}`,
  sentenceCount: (s: string) =>
    String(s.trim() ? (s.match(/[^.!?]+[.!?]+/g) || [s]).length : 0),
  paragraphCount: (s: string) =>
    String(s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).length),
  keywordDensity: (s: string) => {
    const words = s.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const total = words.length || 1;
    const map = new Map<string, number>();
    words.forEach((w) => map.set(w, (map.get(w) || 0) + 1));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([w, n]) => `${w.padEnd(20)} ${n}  (${((n / total) * 100).toFixed(2)}%)`)
      .join("\n");
  },
  wordFrequency: (s: string) => {
    const words = s.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const map = new Map<string, number>();
    words.forEach((w) => map.set(w, (map.get(w) || 0) + 1));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([w, n]) => `${n}\t${w}`)
      .join("\n");
  },
  readability: (s: string) => {
    const sentences = (s.match(/[^.!?]+[.!?]+/g) || [s]).length;
    const words = (s.match(/\b\w+\b/g) || []).length || 1;
    const syllables = (s.toLowerCase().match(/[aeiouy]+/g) || []).length || 1;
    const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return `Words: ${words}\nSentences: ${sentences}\nSyllables: ${syllables}\nFlesch reading ease: ${flesch.toFixed(1)}\nGrade: ${
      flesch >= 90 ? "Very easy" : flesch >= 70 ? "Easy" : flesch >= 50 ? "Fairly difficult" : flesch >= 30 ? "Difficult" : "Very difficult"
    }`;
  },
  syllableCount: (s: string) =>
    String((s.toLowerCase().match(/[aeiouy]+/g) || []).length),

  // ── Case ──────────────────────────────────────────────────────────
  upper: (s: string) => s.toUpperCase(),
  lower: (s: string) => s.toLowerCase(),
  titleCase: (s: string) =>
    s.toLowerCase().replace(/\b([a-z])(\w*)/g, (_, a, b) => a.toUpperCase() + b),
  sentenceCase: (s: string) =>
    s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()),
  capitalizeWords: (s: string) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase()),
  caseRandomizer: (s: string) =>
    [...s].map((c) => (Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase())).join(""),

  // ── Cleaning / formatting ─────────────────────────────────────────
  removeExtraSpaces: (s: string) => s.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").trim(),
  removeLineBreaks: (s: string) => s.replace(/\r?\n+/g, " "),
  addLineBreaks: (s: string, opts?: { every?: number }) => {
    const n = Math.max(1, opts?.every ?? 80);
    return s.replace(new RegExp(`(.{1,${n}})(\\s+|$)`, "g"), "$1\n").trim();
  },
  trimWhitespace: (s: string) => s.split("\n").map((l) => l.trim()).join("\n").trim(),
  cleanText: (s: string) => s.replace(/[^\p{L}\p{N}\s.,?!'"-]/gu, ""),
  removeEmojis: (s: string) =>
    s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu, ""),
  normalizeText: (s: string) => s.normalize("NFKC").replace(/\s+/g, " ").trim(),

  // ── Lines ─────────────────────────────────────────────────────────
  removeDuplicateLines: (s: string) => [...new Set(s.split("\n"))].join("\n"),
  removeEmptyLines: (s: string) => s.split("\n").filter((l) => l.trim()).join("\n"),
  sortAZ: (s: string) => s.split("\n").sort((a, b) => a.localeCompare(b)).join("\n"),
  sortZA: (s: string) => s.split("\n").sort((a, b) => b.localeCompare(a)).join("\n"),
  reverseLines: (s: string) => s.split("\n").reverse().join("\n"),
  shuffleText: (s: string) => {
    const arr = s.split("\n");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("\n");
  },
  filterLines: (s: string, opts?: { pattern?: string; invert?: boolean }) => {
    const pat = opts?.pattern ?? "";
    if (!pat) return s;
    const re = new RegExp(pat, "i");
    return s
      .split("\n")
      .filter((l) => (opts?.invert ? !re.test(l) : re.test(l)))
      .join("\n");
  },
  uniqueLines: (s: string) => [...new Set(s.split("\n"))].join("\n"),
  lineNumbers: (s: string) =>
    s.split("\n").map((l, i) => `${String(i + 1).padStart(4, " ")}  ${l}`).join("\n"),
  reverseString: (s: string) => [...s].reverse().join(""),

  // ── Find / compare ────────────────────────────────────────────────
  findReplace: (s: string, opts?: { find?: string; replace?: string; regex?: boolean; ci?: boolean }) => {
    const find = opts?.find ?? "";
    if (!find) return s;
    const flags = `g${opts?.ci ? "i" : ""}`;
    const re = opts?.regex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    return s.replace(re, opts?.replace ?? "");
  },

  // ── Extraction ────────────────────────────────────────────────────
  extractEmails: (s: string) =>
    [...new Set(s.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [])].join("\n"),
  extractUrls: (s: string) =>
    [...new Set(s.match(/https?:\/\/[^\s<>"']+/g) || [])].join("\n"),
  extractNumbers: (s: string) => (s.match(/-?\d+(\.\d+)?/g) || []).join("\n"),
  extractHashtags: (s: string) => [...new Set(s.match(/#[\w-]+/g) || [])].join("\n"),
  extractPhones: (s: string) =>
    [...new Set(s.match(/\+?\d[\d\s().-]{7,}\d/g) || [])].join("\n"),
  keywordExtractor: (s: string) => {
    const stop = new Set("the a an of to for and or but on in at by with is are was were be been being it this that these those as if then so".split(" "));
    const words = (s.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter((w) => !stop.has(w));
    const map = new Map<string, number>();
    words.forEach((w) => map.set(w, (map.get(w) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w, n]) => `${w} (${n})`).join("\n");
  },

  // ── Conversion ────────────────────────────────────────────────────
  csvToJson: (s: string) => {
    const lines = s.trim().split(/\r?\n/);
    if (!lines.length) return "[]";
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((l) => {
      const cells = l.split(",");
      return Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? "").trim()]));
    });
    return JSON.stringify(rows, null, 2);
  },
  jsonToCsv: (s: string) => {
    const data = JSON.parse(s);
    if (!Array.isArray(data) || !data.length) return "";
    const headers = [...new Set(data.flatMap((r) => Object.keys(r)))];
    const esc = (v: unknown) => {
      const str = v == null ? "" : String(v);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    return [headers.join(","), ...data.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  },
  textToHtml: (s: string) =>
    "<p>" +
    s
      .split(/\n{2,}/)
      .map((p) => p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>"))
      .join("</p>\n<p>") +
    "</p>",
  htmlToText: (s: string) =>
    s.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
  markdownToHtml: (s: string) =>
    s
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
      .split(/\n{2,}/)
      .map((p) => (/^<(h\d|ul|ol|pre|blockquote)/.test(p) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
      .join("\n"),
  htmlToMarkdown: (s: string) =>
    s
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<\/?(ul|ol|p|br|div)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),

  // ── Encoding ──────────────────────────────────────────────────────
  base64Encode: (s: string) => btoa(unescape(encodeURIComponent(s))),
  base64Decode: (s: string) => decodeURIComponent(escape(atob(s.trim()))),
  urlEncode: (s: string) => encodeURIComponent(s),
  urlDecode: (s: string) => decodeURIComponent(s),
  htmlEncode: (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"),
  htmlDecode: (s: string) =>
    s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)),

  // ── Code utilities ────────────────────────────────────────────────
  jsonFormat: (s: string) => JSON.stringify(JSON.parse(s), null, 2),
  jsonMinify: (s: string) => JSON.stringify(JSON.parse(s)),
  xmlFormat: (s: string) => {
    let formatted = "";
    let pad = 0;
    s.replace(/></g, ">\n<").split("\n").forEach((line) => {
      if (line.match(/^<\/\w/)) pad--;
      formatted += "  ".repeat(Math.max(pad, 0)) + line + "\n";
      if (line.match(/^<\w[^>]*[^/]>.*$/) && !line.match(/<\/\w/)) pad++;
    });
    return formatted.trim();
  },
  xmlMinify: (s: string) => s.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim(),
  sqlFormat: (s: string) =>
    s
      .replace(/\s+/g, " ")
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE|UNION|UNION ALL)\b/gi, "\n$1")
      .trim(),

  // ── Data conversion ───────────────────────────────────────────────
  textToBinary: (s: string) => [...s].map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "),
  binaryToText: (s: string) =>
    s.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join(""),
  textToHex: (s: string) => [...s].map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "),
  hexToText: (s: string) =>
    s.trim().split(/\s+/).map((h) => String.fromCharCode(parseInt(h, 16))).join(""),
  asciiConvert: (s: string) => {
    if (/^[\d\s,]+$/.test(s.trim())) {
      return s.trim().split(/[\s,]+/).map((n) => String.fromCharCode(+n)).join("");
    }
    return [...s].map((c) => c.charCodeAt(0)).join(" ");
  },

  // ── Fancy text ────────────────────────────────────────────────────
  bold: (s: string) => mapCodepoints(s, { upperBase: 0x1d400, lowerBase: 0x1d41a, digitBase: 0x1d7ce }),
  italic: (s: string) => mapCodepoints(s, { upperBase: 0x1d434, lowerBase: 0x1d44e }),
  cursive: (s: string) => mapCodepoints(s, { upperBase: 0x1d4d0, lowerBase: 0x1d4ea }),
  small: (s: string) => {
    const map: Record<string, string> = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return s.toLowerCase().split("").map((c) => map[c] || c).join("");
  },
  bubble: (s: string) =>
    s.split("").map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97);
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
      return c;
    }).join(""),
  strikethrough: (s: string) => s.split("").map((c) => c + "\u0336").join(""),
  upsideDown: (s: string) => {
    const flip: Record<string, string> = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z", "?": "¿", "!": "¡", ".": "˙", ",": "'", "'": ",", "(": ")", ")": "(" };
    return s.toLowerCase().split("").reverse().map((c) => flip[c] || c).join("");
  },
  zalgo: (s: string) => {
    const marks = ["\u030d", "\u030e", "\u0304", "\u0305", "\u033f", "\u0311", "\u0306", "\u0310", "\u0352", "\u0357", "\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u031e", "\u031f", "\u0320", "\u0324"];
    return s.split("").map((c) => c + Array.from({ length: 5 }, () => marks[Math.floor(Math.random() * marks.length)]).join("")).join("");
  },
  fancy: (s: string) =>
    [transforms.bold(s), transforms.italic(s), transforms.cursive(s), transforms.bubble(s), transforms.small(s)].map((v, i) => `Style ${i + 1}: ${v}`).join("\n\n"),
  textRepeater: (s: string, opts?: { times?: number; sep?: string }) =>
    Array.from({ length: Math.max(1, opts?.times ?? 5) }, () => s).join(opts?.sep ?? "\n"),
  invisibleText: (s: string) => s.split("").map((c) => ZERO_WIDTH + c).join("") + ZERO_WIDTH,

  // ── SEO / marketing ───────────────────────────────────────────────
  slug: (s: string) =>
    s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  metaTags: (s: string, opts?: { url?: string; image?: string }) => {
    const lines = s.split("\n");
    const title = lines[0] || "Untitled";
    const desc = lines.slice(1).join(" ").slice(0, 160) || title;
    return `<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
${opts?.url ? `<meta property="og:url" content="${opts.url}" />` : ""}
${opts?.image ? `<meta property="og:image" content="${opts.image}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />`;
  },
  utmBuilder: (_s: string, opts?: { url?: string; source?: string; medium?: string; campaign?: string; term?: string; content?: string }) => {
    const url = opts?.url ?? "";
    if (!url) return "Enter a URL.";
    try {
      const u = new URL(url);
      if (opts?.source) u.searchParams.set("utm_source", opts.source);
      if (opts?.medium) u.searchParams.set("utm_medium", opts.medium);
      if (opts?.campaign) u.searchParams.set("utm_campaign", opts.campaign);
      if (opts?.term) u.searchParams.set("utm_term", opts.term);
      if (opts?.content) u.searchParams.set("utm_content", opts.content);
      return u.toString();
    } catch {
      return "Invalid URL.";
    }
  },
  titleCapitalization: (s: string) => {
    const minor = new Set("a an the and but or for nor on at to from by of in".split(" "));
    return s.split("\n").map((line) => {
      const words = line.split(" ");
      return words.map((w, i) => (i === 0 || i === words.length - 1 || !minor.has(w.toLowerCase()) ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join(" ");
    }).join("\n");
  },
  keywordGrouper: (s: string) => {
    const groups = new Map<string, string[]>();
    s.split("\n").map((l) => l.trim()).filter(Boolean).forEach((kw) => {
      const head = kw.split(" ")[0]?.toLowerCase() || "";
      if (!groups.has(head)) groups.set(head, []);
      groups.get(head)!.push(kw);
    });
    return [...groups.entries()].sort().map(([h, list]) => `[${h}]\n${list.join("\n")}`).join("\n\n");
  },

  // ── Generators ────────────────────────────────────────────────────
  loremIpsum: (_s: string, opts?: { paragraphs?: number }) => {
    const base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
    return Array.from({ length: Math.max(1, opts?.paragraphs ?? 3) }, () => base).join("\n\n");
  },
  randomText: (_s: string, opts?: { words?: number }) => {
    const pool = "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu".split(" ");
    return Array.from({ length: opts?.words ?? 50 }, () => pool[Math.floor(Math.random() * pool.length)]).join(" ");
  },
  randomNames: (_s: string, opts?: { count?: number }) => {
    const first = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Avery", "Quinn", "Sam", "Jamie"];
    const last = ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Lee"];
    return Array.from({ length: opts?.count ?? 10 }, () => `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`).join("\n");
  },
  randomString: (_s: string, opts?: { length?: number; charset?: string }) => {
    const chars = opts?.charset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: opts?.length ?? 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  },
  password: (_s: string, opts?: { length?: number; symbols?: boolean }) => {
    const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const sym = "!@#$%^&*()-_=+[]{};:,.<>?";
    const chars = base + (opts?.symbols ? sym : "");
    const len = Math.max(8, opts?.length ?? 16);
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    return [...arr].map((n) => chars[n % chars.length]).join("");
  },
  uuid: (_s: string, opts?: { count?: number }) =>
    Array.from({ length: Math.max(1, opts?.count ?? 1) }, () => crypto.randomUUID()).join("\n"),

  // ── Niche ─────────────────────────────────────────────────────────
  removePrefixSuffix: (s: string, opts?: { prefix?: string; suffix?: string }) =>
    s.split("\n").map((l) => {
      let r = l;
      if (opts?.prefix && r.startsWith(opts.prefix)) r = r.slice(opts.prefix.length);
      if (opts?.suffix && r.endsWith(opts.suffix)) r = r.slice(0, r.length - opts.suffix.length);
      return r;
    }).join("\n"),
  addPrefixSuffix: (s: string, opts?: { prefix?: string; suffix?: string }) =>
    s.split("\n").map((l) => `${opts?.prefix ?? ""}${l}${opts?.suffix ?? ""}`).join("\n"),
  columnExtractor: (s: string, opts?: { delimiter?: string; column?: number }) => {
    const d = opts?.delimiter || ",";
    const c = Math.max(0, (opts?.column ?? 1) - 1);
    return s.split("\n").map((l) => l.split(d)[c] ?? "").join("\n");
  },
  textSplitter: (s: string, opts?: { delimiter?: string }) =>
    s.split(opts?.delimiter ?? " ").join("\n"),
  textJoiner: (s: string, opts?: { separator?: string }) =>
    s.split("\n").join(opts?.separator ?? " "),
  wordScrambler: (s: string) =>
    s.replace(/\b\w+\b/g, (w) => {
      if (w.length <= 3) return w;
      const mid = w.slice(1, -1).split("").sort(() => Math.random() - 0.5).join("");
      return w[0] + mid + w[w.length - 1];
    }),
  textJustifier: (s: string, opts?: { width?: number }) => {
    const width = Math.max(20, opts?.width ?? 60);
    return s.split("\n").map((line) => {
      const words = line.split(/\s+/).filter(Boolean);
      if (words.length <= 1) return line;
      const totalChars = words.reduce((a, w) => a + w.length, 0);
      const gaps = words.length - 1;
      const spaces = Math.max(1, Math.floor((width - totalChars) / gaps));
      return words.join(" ".repeat(spaces));
    }).join("\n");
  },

  // ── Compare ───────────────────────────────────────────────────────
  duplicateFinder: (s: string) => {
    const seen = new Map<string, number>();
    s.split("\n").forEach((l) => {
      const k = l.trim();
      if (k) seen.set(k, (seen.get(k) || 0) + 1);
    });
    const dups = [...seen.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
    return dups.length ? dups.map(([k, n]) => `(${n}×) ${k}`).join("\n") : "No duplicates found.";
  },
};

function mapCodepoints(s: string, opts: { upperBase?: number; lowerBase?: number; digitBase?: number }): string {
  return [...s].map((c) => {
    const code = c.charCodeAt(0);
    if (opts.upperBase && code >= 65 && code <= 90) return String.fromCodePoint(opts.upperBase + code - 65);
    if (opts.lowerBase && code >= 97 && code <= 122) return String.fromCodePoint(opts.lowerBase + code - 97);
    if (opts.digitBase && code >= 48 && code <= 57) return String.fromCodePoint(opts.digitBase + code - 48);
    return c;
  }).join("");
}
