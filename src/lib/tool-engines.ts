// Single source of truth that binds every tool slug to either a pure
// transform (offline) or an AI prompt (server-side via Lovable AI).

import { transforms } from "./text-transforms";

export type ToolFieldType = "text" | "number" | "checkbox" | "select" | "url";

export interface ToolField {
  key: string;
  label: string;
  type: ToolFieldType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
}

export interface ToolEngine {
  // Type of tool
  kind: "transform" | "ai" | "browser";
  // For "transform": pure function applied to input + opts
  run?: (input: string, opts?: Record<string, unknown>) => string;
  // For "ai": prompt template (server adds it as system prompt). Input is the user content.
  aiPrompt?: string;
  aiTemperature?: number;
  // For "browser": uses Web APIs in the component itself (e.g. Speech)
  browserComponent?: "tts" | "stt";
  // Input affordance
  inputLabel?: string;
  inputPlaceholder?: string;
  // Optional secondary inputs (find/replace, repeater times, etc.)
  fields?: ToolField[];
  // Custom labelling
  outputLabel?: string;
  // Whether the input is meaningful (some generators ignore it)
  inputOptional?: boolean;
}

export const engines: Record<string, ToolEngine> = {
  // ── P1 Writing & AI (Lovable AI) ─────────────────────────────────
  "text-summarizer": { kind: "ai", aiPrompt: "Summarize the user's text into a concise, faithful summary in 3-6 bullet points. Preserve key facts. No preamble." },
  "paraphrasing-tool": { kind: "ai", aiPrompt: "Paraphrase the user's text in clear, natural English while preserving meaning. Return only the paraphrase." },
  "grammar-checker": { kind: "ai", aiPrompt: "Fix grammar, punctuation and clarity in the user's text. Return ONLY the corrected text — no commentary." },
  "spell-checker": { kind: "ai", aiPrompt: "Correct spelling errors in the user's text. Return ONLY the corrected text." },
  "ai-content-generator": { kind: "ai", aiPrompt: "You are a versatile content writer. Write polished content based on the user's brief. Use markdown headings and lists where appropriate." },
  "essay-writer": { kind: "ai", aiPrompt: "Write a well-structured essay (intro, 3 body paragraphs, conclusion) on the user's topic. Use clear, formal English." },
  "title-generator": { kind: "ai", aiPrompt: "Generate 10 catchy, SEO-friendly titles for the user's topic or text. Return as a numbered list." },
  "blog-idea-generator": { kind: "ai", aiPrompt: "Generate 10 fresh blog post ideas around the user's niche/topic. Each idea should be a clear, click-worthy title." },
  "sentence-rewriter": { kind: "ai", aiPrompt: "Rewrite each sentence the user provides in a different, equally clear style. Keep meaning intact." },
  "readability-checker": { kind: "transform", run: transforms.readability, outputLabel: "Readability report" },

  // ── P1 Text Analysis ─────────────────────────────────────────────
  "word-counter": { kind: "transform", run: transforms.wordCount, outputLabel: "Word count" },
  "character-counter": { kind: "transform", run: transforms.charCount, outputLabel: "Character count" },
  "sentence-counter": { kind: "transform", run: transforms.sentenceCount, outputLabel: "Sentence count" },
  "paragraph-counter": { kind: "transform", run: transforms.paragraphCount, outputLabel: "Paragraph count" },
  "keyword-density-checker": { kind: "transform", run: transforms.keywordDensity, outputLabel: "Keyword density" },
  "word-frequency-analyzer": { kind: "transform", run: transforms.wordFrequency, outputLabel: "Frequency table" },

  // ── P1 Case ──────────────────────────────────────────────────────
  "uppercase-converter": { kind: "transform", run: transforms.upper },
  "lowercase-converter": { kind: "transform", run: transforms.lower },
  "title-case-converter": { kind: "transform", run: transforms.titleCase },
  "sentence-case-converter": { kind: "transform", run: transforms.sentenceCase },
  "capitalize-each-word": { kind: "transform", run: transforms.capitalizeWords },
  "remove-extra-spaces": { kind: "transform", run: transforms.removeExtraSpaces },
  "remove-line-breaks": { kind: "transform", run: transforms.removeLineBreaks },
  "add-line-breaks": {
    kind: "transform",
    run: (s, o) => transforms.addLineBreaks(s, { every: Number(o?.every) || 80 }),
    fields: [{ key: "every", label: "Wrap width", type: "number", defaultValue: 80 }],
  },

  // ── P1 Find / Compare ────────────────────────────────────────────
  "find-and-replace-tool": {
    kind: "transform",
    run: (s, o) => transforms.findReplace(s, o as { find?: string; replace?: string; regex?: boolean; ci?: boolean }),
    fields: [
      { key: "find", label: "Find", type: "text", placeholder: "search text or regex" },
      { key: "replace", label: "Replace with", type: "text", placeholder: "replacement" },
      { key: "regex", label: "Treat 'find' as regex", type: "checkbox" },
      { key: "ci", label: "Case-insensitive", type: "checkbox" },
    ],
  },
  "text-diff-checker": {
    kind: "transform",
    run: (s, o) => simpleDiff(s, String(o?.compare ?? "")),
    fields: [{ key: "compare", label: "Compare against", type: "text", placeholder: "Paste second text…" }],
    outputLabel: "Diff",
  },
  "duplicate-text-finder": { kind: "transform", run: transforms.duplicateFinder, outputLabel: "Duplicates" },

  // ── P2 Cleaning ──────────────────────────────────────────────────
  "remove-duplicate-lines": { kind: "transform", run: transforms.removeDuplicateLines },
  "remove-empty-lines": { kind: "transform", run: transforms.removeEmptyLines },
  "trim-whitespace": { kind: "transform", run: transforms.trimWhitespace },
  "clean-text": { kind: "transform", run: transforms.cleanText },
  "remove-emojis": { kind: "transform", run: transforms.removeEmojis },
  "normalize-text": { kind: "transform", run: transforms.normalizeText },

  // ── P2 Lists ─────────────────────────────────────────────────────
  "sort-lines-a-z": { kind: "transform", run: transforms.sortAZ },
  "sort-lines-z-a": { kind: "transform", run: transforms.sortZA },
  "reverse-lines": { kind: "transform", run: transforms.reverseLines },
  "shuffle-text": { kind: "transform", run: transforms.shuffleText },
  "filter-lines": {
    kind: "transform",
    run: (s, o) => transforms.filterLines(s, { pattern: String(o?.pattern ?? ""), invert: !!o?.invert }),
    fields: [
      { key: "pattern", label: "Pattern (regex)", type: "text", placeholder: "e.g. ^TODO" },
      { key: "invert", label: "Invert (exclude matches)", type: "checkbox" },
    ],
  },
  "unique-lines-extractor": { kind: "transform", run: transforms.uniqueLines },

  // ── P2 Extraction ────────────────────────────────────────────────
  "extract-emails": { kind: "transform", run: transforms.extractEmails },
  "extract-urls": { kind: "transform", run: transforms.extractUrls },
  "extract-numbers": { kind: "transform", run: transforms.extractNumbers },
  "extract-hashtags": { kind: "transform", run: transforms.extractHashtags },
  "extract-phone-numbers": { kind: "transform", run: transforms.extractPhones },

  // ── P2 Conversion ────────────────────────────────────────────────
  "csv-to-json": { kind: "transform", run: transforms.csvToJson },
  "json-to-csv": { kind: "transform", run: transforms.jsonToCsv },
  "text-to-html": { kind: "transform", run: transforms.textToHtml },
  "html-to-text": { kind: "transform", run: transforms.htmlToText },
  "markdown-to-html": { kind: "transform", run: transforms.markdownToHtml },
  "html-to-markdown": { kind: "transform", run: transforms.htmlToMarkdown },

  // ── P3 Encoding ──────────────────────────────────────────────────
  "base64-encode": { kind: "transform", run: transforms.base64Encode },
  "base64-decode": { kind: "transform", run: transforms.base64Decode },
  "url-encode": { kind: "transform", run: transforms.urlEncode },
  "url-decode": { kind: "transform", run: transforms.urlDecode },
  "html-encode": { kind: "transform", run: transforms.htmlEncode },
  "html-decode": { kind: "transform", run: transforms.htmlDecode },

  // ── P3 Code ──────────────────────────────────────────────────────
  "json-formatter": { kind: "transform", run: transforms.jsonFormat },
  "json-minifier": { kind: "transform", run: transforms.jsonMinify },
  "xml-formatter": { kind: "transform", run: transforms.xmlFormat },
  "xml-minifier": { kind: "transform", run: transforms.xmlMinify },
  "sql-formatter": { kind: "transform", run: transforms.sqlFormat },

  // ── P3 Data conversion ───────────────────────────────────────────
  "text-to-binary": { kind: "transform", run: transforms.textToBinary },
  "binary-to-text": { kind: "transform", run: transforms.binaryToText },
  "text-to-hex": { kind: "transform", run: transforms.textToHex },
  "hex-to-text": { kind: "transform", run: transforms.hexToText },
  "ascii-converter": { kind: "transform", run: transforms.asciiConvert },

  // ── P4 Fancy text ────────────────────────────────────────────────
  "fancy-text-generator": { kind: "transform", run: transforms.fancy, outputLabel: "5 styles" },
  "bold-text-generator": { kind: "transform", run: transforms.bold },
  "italic-text-generator": { kind: "transform", run: transforms.italic },
  "cursive-text-generator": { kind: "transform", run: transforms.cursive },
  "strikethrough-text": { kind: "transform", run: transforms.strikethrough },
  "small-text-generator": { kind: "transform", run: transforms.small },
  "bubble-text-generator": { kind: "transform", run: transforms.bubble },
  "zalgo-text-generator": { kind: "transform", run: transforms.zalgo },
  "upside-down-text": { kind: "transform", run: transforms.upsideDown },
  "text-repeater": {
    kind: "transform",
    run: (s, o) => transforms.textRepeater(s, { times: Number(o?.times) || 5, sep: String(o?.sep ?? "\n") }),
    fields: [
      { key: "times", label: "Repeat count", type: "number", defaultValue: 5 },
      { key: "sep", label: "Separator", type: "text", defaultValue: "\\n" },
    ],
  },
  "invisible-text-generator": { kind: "transform", run: transforms.invisibleText },

  // ── P5 SEO ───────────────────────────────────────────────────────
  "slug-generator": { kind: "transform", run: transforms.slug },
  "meta-tag-generator": {
    kind: "transform",
    run: (s, o) => transforms.metaTags(s, { url: String(o?.url ?? ""), image: String(o?.image ?? "") }),
    inputPlaceholder: "Line 1: Title\nLines 2+: Description",
    fields: [
      { key: "url", label: "Canonical URL", type: "url" },
      { key: "image", label: "OG image URL", type: "url" },
    ],
    outputLabel: "Meta tags",
  },
  "keyword-extractor": { kind: "transform", run: transforms.keywordExtractor },
  "keyword-grouper": { kind: "transform", run: transforms.keywordGrouper },
  "utm-builder": {
    kind: "transform",
    run: (_s, o) => transforms.utmBuilder("", o as Record<string, string>),
    inputOptional: true,
    fields: [
      { key: "url", label: "Destination URL", type: "url", placeholder: "https://example.com/page" },
      { key: "source", label: "utm_source", type: "text", placeholder: "newsletter" },
      { key: "medium", label: "utm_medium", type: "text", placeholder: "email" },
      { key: "campaign", label: "utm_campaign", type: "text", placeholder: "spring_sale" },
      { key: "term", label: "utm_term", type: "text" },
      { key: "content", label: "utm_content", type: "text" },
    ],
    outputLabel: "Tracked URL",
  },
  "title-capitalization": { kind: "transform", run: transforms.titleCapitalization },

  // ── P6 Generators ────────────────────────────────────────────────
  "lorem-ipsum-generator": {
    kind: "transform", inputOptional: true,
    run: (_s, o) => transforms.loremIpsum("", { paragraphs: Number(o?.paragraphs) || 3 }),
    fields: [{ key: "paragraphs", label: "Paragraphs", type: "number", defaultValue: 3 }],
  },
  "random-text-generator": {
    kind: "transform", inputOptional: true,
    run: (_s, o) => transforms.randomText("", { words: Number(o?.words) || 50 }),
    fields: [{ key: "words", label: "Words", type: "number", defaultValue: 50 }],
  },
  "random-name-generator": {
    kind: "transform", inputOptional: true,
    run: (_s, o) => transforms.randomNames("", { count: Number(o?.count) || 10 }),
    fields: [{ key: "count", label: "Count", type: "number", defaultValue: 10 }],
  },
  "random-string-generator": {
    kind: "transform", inputOptional: true,
    run: (_s, o) => transforms.randomString("", { length: Number(o?.length) || 16, charset: String(o?.charset ?? "") }),
    fields: [
      { key: "length", label: "Length", type: "number", defaultValue: 16 },
      { key: "charset", label: "Custom charset (optional)", type: "text" },
    ],
  },
  "password-generator": {
    kind: "transform", inputOptional: true,
    inputLabel: "Seed word (optional)",
    inputPlaceholder: "e.g. summer, dragon, alex — leave empty for fully random passwords",
    outputLabel: "Generated passwords",
    run: (s, o) => transforms.password(s, {
      length: Number(o?.length) || 16,
      count: Number(o?.count) || 5,
      symbols: !!o?.symbols,
      numbers: o?.numbers !== false,
      mixedCase: o?.mixedCase !== false,
    }),
    fields: [
      { key: "length", label: "Length", type: "number", defaultValue: 16 },
      { key: "count", label: "How many", type: "number", defaultValue: 5 },
      { key: "mixedCase", label: "Mix uppercase & lowercase (random capitalization)", type: "checkbox", defaultValue: true },
      { key: "numbers", label: "Include numbers", type: "checkbox", defaultValue: true },
      { key: "symbols", label: "Include symbols", type: "checkbox", defaultValue: false },
    ],
  },
  "uuid-generator": {
    kind: "transform", inputOptional: true,
    run: (_s, o) => transforms.uuid("", { count: Number(o?.count) || 1 }),
    fields: [{ key: "count", label: "How many", type: "number", defaultValue: 5 }],
  },

  // ── P7 AI & modern ───────────────────────────────────────────────
  "text-to-speech": { kind: "browser", browserComponent: "tts" },
  "speech-to-text": { kind: "browser", browserComponent: "stt" },
  "language-translator": {
    kind: "ai",
    aiPrompt: "Translate the user's text to the target language specified in the options. Return ONLY the translation.",
    fields: [{ key: "target", label: "Target language", type: "text", placeholder: "e.g. Spanish, Japanese", defaultValue: "Spanish" }],
  },
  "plagiarism-checker": {
    kind: "ai",
    aiPrompt: "Analyze the user's text for likely originality. Identify clichés or generic phrases that may be unoriginal, suggest more unique phrasings, and give an originality score (0-100). Be brief.",
  },
  "ai-email-writer": {
    kind: "ai",
    aiPrompt: "Write a clear, professional email based on the user's brief. Include subject line on the first line prefixed with 'Subject:'.",
  },
  "resume-summary-generator": {
    kind: "ai",
    aiPrompt: "Write a strong 3-4 sentence professional summary for a resume based on the user's experience and skills.",
  },

  // ── P8 Niche ─────────────────────────────────────────────────────
  "line-number-generator": { kind: "transform", run: transforms.lineNumbers },
  "remove-prefix-suffix": {
    kind: "transform",
    run: (s, o) => transforms.removePrefixSuffix(s, { prefix: String(o?.prefix ?? ""), suffix: String(o?.suffix ?? "") }),
    fields: [
      { key: "prefix", label: "Prefix to remove", type: "text" },
      { key: "suffix", label: "Suffix to remove", type: "text" },
    ],
  },
  "add-prefix-suffix": {
    kind: "transform",
    run: (s, o) => transforms.addPrefixSuffix(s, { prefix: String(o?.prefix ?? ""), suffix: String(o?.suffix ?? "") }),
    fields: [
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "suffix", label: "Suffix", type: "text" },
    ],
  },
  "column-extractor": {
    kind: "transform",
    run: (s, o) => transforms.columnExtractor(s, { delimiter: String(o?.delimiter ?? ","), column: Number(o?.column) || 1 }),
    fields: [
      { key: "delimiter", label: "Delimiter", type: "text", defaultValue: "," },
      { key: "column", label: "Column number (1-based)", type: "number", defaultValue: 1 },
    ],
  },
  "text-splitter": {
    kind: "transform",
    run: (s, o) => transforms.textSplitter(s, { delimiter: String(o?.delimiter ?? " ") }),
    fields: [{ key: "delimiter", label: "Split on", type: "text", defaultValue: " " }],
  },
  "text-joiner": {
    kind: "transform",
    run: (s, o) => transforms.textJoiner(s, { separator: String(o?.separator ?? " ") }),
    fields: [{ key: "separator", label: "Join with", type: "text", defaultValue: " " }],
  },
  "word-scrambler": { kind: "transform", run: transforms.wordScrambler },
  "syllable-counter": { kind: "transform", run: transforms.syllableCount, outputLabel: "Syllables" },
  "case-randomizer": { kind: "transform", run: transforms.caseRandomizer },
  "text-justifier": {
    kind: "transform",
    run: (s, o) => transforms.textJustifier(s, { width: Number(o?.width) || 60 }),
    fields: [{ key: "width", label: "Line width", type: "number", defaultValue: 60 }],
  },
};

function simpleDiff(a: string, b: string): string {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const max = Math.max(aLines.length, bLines.length);
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    if (aLines[i] === bLines[i]) {
      if (aLines[i] !== undefined) out.push(`  ${aLines[i]}`);
    } else {
      if (aLines[i] !== undefined) out.push(`- ${aLines[i]}`);
      if (bLines[i] !== undefined) out.push(`+ ${bLines[i]}`);
    }
  }
  return out.join("\n");
}
