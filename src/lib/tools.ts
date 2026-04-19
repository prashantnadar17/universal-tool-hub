// Universal text-tools registry. Each tool is a metadata record;
// implementations are wired by `slug` later.

export type ToolCategory =
  | "Writing & AI"
  | "Text Analysis"
  | "Case & Formatting"
  | "Find & Compare"
  | "Cleaning"
  | "Lists"
  | "Extraction"
  | "Conversion"
  | "Encoding"
  | "Code Utilities"
  | "Data Conversion"
  | "Fancy Text"
  | "SEO & Marketing"
  | "Generators"
  | "AI & Modern"
  | "Niche";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  priority: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  keywords?: string[];
}

const t = (
  name: string,
  description: string,
  category: ToolCategory,
  priority: Tool["priority"],
  keywords: string[] = [],
): Tool => ({
  slug: name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  name,
  description,
  category,
  priority,
  keywords,
});

export const tools: Tool[] = [
  // P1 — Writing & AI
  t("Text Summarizer", "Condense long text into a clear summary.", "Writing & AI", 1, ["summary", "tldr"]),
  t("Paraphrasing Tool", "Rewrite sentences while keeping meaning.", "Writing & AI", 1, ["rephrase"]),
  t("Grammar Checker", "Detect and fix grammar mistakes.", "Writing & AI", 1),
  t("Spell Checker", "Catch spelling errors instantly.", "Writing & AI", 1),
  t("AI Content Generator", "Generate articles, posts, and copy with AI.", "Writing & AI", 1, ["ai writer"]),
  t("Essay Writer", "Draft essays from a topic or outline.", "Writing & AI", 1),
  t("Title Generator", "Create catchy titles for your content.", "Writing & AI", 1),
  t("Blog Idea Generator", "Brainstorm fresh blog post ideas.", "Writing & AI", 1),
  t("Sentence Rewriter", "Rewrite sentences in a different style.", "Writing & AI", 1),
  t("Readability Checker", "Score how easy your text is to read.", "Writing & AI", 1, ["flesch"]),
  // P1 — Text Analysis
  t("Word Counter", "Count words in any text.", "Text Analysis", 1),
  t("Character Counter", "Count characters with and without spaces.", "Text Analysis", 1),
  t("Sentence Counter", "Count the number of sentences.", "Text Analysis", 1),
  t("Paragraph Counter", "Count paragraphs in your document.", "Text Analysis", 1),
  t("Keyword Density Checker", "Analyze keyword frequency for SEO.", "Text Analysis", 1),
  t("Word Frequency Analyzer", "Find the most used words.", "Text Analysis", 1),
  // P1 — Case & Formatting
  t("Uppercase Converter", "Convert text to UPPERCASE.", "Case & Formatting", 1),
  t("Lowercase Converter", "Convert text to lowercase.", "Case & Formatting", 1),
  t("Title Case Converter", "Convert text to Title Case.", "Case & Formatting", 1),
  t("Sentence Case Converter", "Convert text to Sentence case.", "Case & Formatting", 1),
  t("Capitalize Each Word", "Capitalize the first letter of every word.", "Case & Formatting", 1),
  t("Remove Extra Spaces", "Strip duplicated spaces from text.", "Case & Formatting", 1),
  t("Remove Line Breaks", "Flatten text by removing line breaks.", "Case & Formatting", 1),
  t("Add Line Breaks", "Insert line breaks at custom intervals.", "Case & Formatting", 1),
  // P1 — Find / Compare
  t("Find and Replace Tool", "Search and replace text patterns.", "Find & Compare", 1),
  t("Text Diff Checker", "Compare two texts side by side.", "Find & Compare", 1),
  t("Duplicate Text Finder", "Find duplicate phrases in text.", "Find & Compare", 1),

  // P2 — Cleaning
  t("Remove Duplicate Lines", "Delete duplicate lines from text.", "Cleaning", 2),
  t("Remove Empty Lines", "Strip blank lines.", "Cleaning", 2),
  t("Trim Whitespace", "Trim leading and trailing spaces.", "Cleaning", 2),
  t("Clean Text", "Remove special symbols from text.", "Cleaning", 2),
  t("Remove Emojis", "Strip emojis from any text.", "Cleaning", 2),
  t("Normalize Text", "Normalize unicode and spacing.", "Cleaning", 2),
  // P2 — Lists
  t("Sort Lines A-Z", "Sort lines alphabetically.", "Lists", 2),
  t("Sort Lines Z-A", "Sort lines in reverse order.", "Lists", 2),
  t("Reverse Lines", "Reverse the order of lines.", "Lists", 2),
  t("Shuffle Text", "Randomly shuffle lines.", "Lists", 2),
  t("Filter Lines", "Filter lines by keyword or pattern.", "Lists", 2),
  t("Unique Lines Extractor", "Extract only unique lines.", "Lists", 2),
  // P2 — Extraction
  t("Extract Emails", "Pull email addresses from text.", "Extraction", 2),
  t("Extract URLs", "Pull URLs from any text.", "Extraction", 2),
  t("Extract Numbers", "Extract numeric values from text.", "Extraction", 2),
  t("Extract Hashtags", "Pull #hashtags from text.", "Extraction", 2),
  t("Extract Phone Numbers", "Find phone numbers in text.", "Extraction", 2),
  // P2 — Conversion
  t("CSV to JSON", "Convert CSV data to JSON.", "Conversion", 2),
  t("JSON to CSV", "Convert JSON arrays to CSV.", "Conversion", 2),
  t("Text to HTML", "Convert plain text to HTML.", "Conversion", 2),
  t("HTML to Text", "Strip HTML tags from text.", "Conversion", 2),
  t("Markdown to HTML", "Render markdown as HTML.", "Conversion", 2),
  t("HTML to Markdown", "Convert HTML back to markdown.", "Conversion", 2),

  // P3 — Encoding
  t("Base64 Encode", "Encode text to Base64.", "Encoding", 3),
  t("Base64 Decode", "Decode Base64 strings.", "Encoding", 3),
  t("URL Encode", "Percent-encode a URL.", "Encoding", 3),
  t("URL Decode", "Decode percent-encoded URLs.", "Encoding", 3),
  t("HTML Encode", "Escape HTML entities.", "Encoding", 3),
  t("HTML Decode", "Unescape HTML entities.", "Encoding", 3),
  // P3 — Code Utilities
  t("JSON Formatter", "Pretty-print and validate JSON.", "Code Utilities", 3),
  t("JSON Minifier", "Minify JSON for transport.", "Code Utilities", 3),
  t("XML Formatter", "Pretty-print XML.", "Code Utilities", 3),
  t("XML Minifier", "Minify XML output.", "Code Utilities", 3),
  t("SQL Formatter", "Format SQL queries.", "Code Utilities", 3),
  // P3 — Data Conversion
  t("Text to Binary", "Convert text to binary.", "Data Conversion", 3),
  t("Binary to Text", "Convert binary back to text.", "Data Conversion", 3),
  t("Text to Hex", "Convert text to hexadecimal.", "Data Conversion", 3),
  t("Hex to Text", "Convert hex back to text.", "Data Conversion", 3),
  t("ASCII Converter", "Convert between text and ASCII codes.", "Data Conversion", 3),

  // P4 — Fancy Text
  t("Fancy Text Generator", "Stylish unicode text variants.", "Fancy Text", 4),
  t("Bold Text Generator", "Generate bold unicode text.", "Fancy Text", 4),
  t("Italic Text Generator", "Generate italic unicode text.", "Fancy Text", 4),
  t("Cursive Text Generator", "Make cursive script text.", "Fancy Text", 4),
  t("Strikethrough Text", "Strike through text styles.", "Fancy Text", 4),
  t("Small Text Generator", "Tiny caps and superscript.", "Fancy Text", 4),
  t("Bubble Text Generator", "Bubble-letter text.", "Fancy Text", 4),
  t("Zalgo Text Generator", "Glitchy zalgo effect text.", "Fancy Text", 4),
  t("Upside Down Text", "Flip text upside down.", "Fancy Text", 4),
  t("Text Repeater", "Repeat text N times.", "Fancy Text", 4),
  t("Invisible Text Generator", "Generate invisible characters.", "Fancy Text", 4),

  // P5 — SEO & Marketing
  t("Slug Generator", "Create URL-friendly slugs.", "SEO & Marketing", 5),
  t("Meta Tag Generator", "Generate SEO meta tags.", "SEO & Marketing", 5),
  t("Keyword Extractor", "Extract keywords from content.", "SEO & Marketing", 5),
  t("Keyword Grouper", "Cluster related keywords.", "SEO & Marketing", 5),
  t("UTM Builder", "Build trackable UTM URLs.", "SEO & Marketing", 5),
  t("Title Capitalization", "Apply AP, APA, MLA title styles.", "SEO & Marketing", 5),

  // P6 — Generators
  t("Lorem Ipsum Generator", "Generate placeholder text.", "Generators", 6),
  t("Random Text Generator", "Generate random text content.", "Generators", 6),
  t("Random Name Generator", "Generate random names.", "Generators", 6),
  t("Random String Generator", "Generate random strings.", "Generators", 6),
  t("Password Generator", "Create strong passwords.", "Generators", 6),
  t("UUID Generator", "Generate UUID v4 identifiers.", "Generators", 6),

  // P7 — AI & Modern
  t("Text to Speech", "Convert text to spoken audio.", "AI & Modern", 7),
  t("Speech to Text", "Transcribe speech to text.", "AI & Modern", 7),
  t("Language Translator", "Translate between languages.", "AI & Modern", 7),
  t("Plagiarism Checker", "Detect duplicate content.", "AI & Modern", 7),
  t("AI Email Writer", "Draft emails with AI.", "AI & Modern", 7),
  t("Resume Summary Generator", "Generate resume summaries.", "AI & Modern", 7),

  // P8 — Niche
  t("Line Number Generator", "Add line numbers to text.", "Niche", 8),
  t("Remove Prefix Suffix", "Strip prefixes or suffixes from lines.", "Niche", 8),
  t("Add Prefix Suffix", "Add prefix or suffix to each line.", "Niche", 8),
  t("Column Extractor", "Extract a column from delimited text.", "Niche", 8),
  t("Text Splitter", "Split text by delimiter or length.", "Niche", 8),
  t("Text Joiner", "Join lines using a separator.", "Niche", 8),
  t("Word Scrambler", "Scramble letters within words.", "Niche", 8),
  t("Syllable Counter", "Count syllables in text.", "Niche", 8),
  t("Case Randomizer", "Randomly mix upper and lower case.", "Niche", 8),
  t("Text Justifier", "Justify text to a fixed width.", "Niche", 8),
];

export const totalTools = tools.length;

export const toolsByCategory = tools.reduce<Record<string, Tool[]>>((acc, tool) => {
  (acc[tool.category] ||= []).push(tool);
  return acc;
}, {});

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((tool) => {
    const haystack = `${tool.name} ${tool.description} ${tool.category} ${(tool.keywords ?? []).join(" ")}`.toLowerCase();
    return haystack.includes(q);
  });
}
