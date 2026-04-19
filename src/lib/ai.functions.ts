import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  prompt: z.string().min(1).max(20000),
  text: z.string().max(20000).default(""),
  options: z.record(z.string(), z.string()).optional(),
});

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI gateway is not configured." };
    }

    const optsLine = data.options && Object.keys(data.options).length
      ? `\n\nOptions: ${JSON.stringify(data.options)}`
      : "";

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: data.prompt + optsLine },
            { role: "user", content: data.text },
          ],
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, error: "Rate limit exceeded. Please try again in a moment." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits exhausted. Top up at Settings → Workspace → Usage." };
      }
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error", res.status, t);
        return { ok: false as const, error: "AI request failed." };
      }

      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content?.trim() ?? "";
      return { ok: true as const, content };
    } catch (e) {
      console.error("AI exception", e);
      return { ok: false as const, error: "Network error contacting AI service." };
    }
  });
