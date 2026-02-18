import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, HF_MODELS, type HFMessage } from "@/lib/huggingface";
import { runTextGeneration, getCloudflareConfig, CF_TEXT_MODELS, type CFTextModelKey, type CloudflareMessage } from "@/lib/cloudflare";

const SYSTEM_PROMPT = `You are TriConnect AI, a powerful app builder assistant. You help users build web applications, mobile apps, and more.

Your capabilities:
- Generate code (React, Next.js, HTML, CSS, JavaScript, Python, etc.)
- Design UI components and layouts
- Explain technical concepts
- Debug code issues
- Suggest project architecture
- Generate images when asked (respond with [IMAGE: description] to trigger image generation)

Be concise, helpful, and provide working code examples. Use markdown formatting in your responses.
When writing code, always use proper syntax highlighting with \`\`\`language blocks.`;

/** All available models */
const AVAILABLE_MODELS = {
  // Hugging Face (free, no API key needed)
  "llama-3-8b": { provider: "huggingface", model: HF_MODELS.text, label: "Llama 3 8B (HF)" },
  "mixtral-8x7b": { provider: "huggingface", model: HF_MODELS.textPro, label: "Mixtral 8x7B (HF)" },
  // Cloudflare Workers AI (free, needs API key)
  "cf-llama-3.3-70b": { provider: "cloudflare", model: "llama-3.3-70b" as CFTextModelKey, label: "Llama 3.3 70B (CF)" },
  "cf-llama-3.1-8b": { provider: "cloudflare", model: "llama-3.1-8b" as CFTextModelKey, label: "Llama 3.1 8B (CF)" },
  "cf-deepseek-r1": { provider: "cloudflare", model: "deepseek-r1-distill" as CFTextModelKey, label: "DeepSeek R1 (CF)" },
  "cf-gemma-3-12b": { provider: "cloudflare", model: "gemma-3-12b" as CFTextModelKey, label: "Gemma 3 12B (CF)" },
  "cf-qwen-coder": { provider: "cloudflare", model: "qwen-2.5-coder" as CFTextModelKey, label: "Qwen 2.5 Coder (CF)" },
  "cf-mistral-7b": { provider: "cloudflare", model: "mistral-7b" as CFTextModelKey, label: "Mistral 7B (CF)" },
} as const;

type ModelId = keyof typeof AVAILABLE_MODELS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model: requestedModel } = body as {
      messages: Array<{ role: string; content: string }>;
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const modelId = (requestedModel || "llama-3-8b") as ModelId;
    const modelConfig = AVAILABLE_MODELS[modelId] || AVAILABLE_MODELS["llama-3-8b"];

    let response: string;

    if (modelConfig.provider === "cloudflare") {
      const cfConfig = getCloudflareConfig();
      if (!cfConfig) {
        // Fallback to Hugging Face if Cloudflare not configured
        const hfMessages: HFMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];
        response = await chatCompletion(hfMessages, {
          model: HF_MODELS.text,
          max_tokens: 2048,
          apiToken: process.env.HF_API_TOKEN,
        });
      } else {
        const cfMessages: CloudflareMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];
        response = await runTextGeneration(cfConfig, modelConfig.model as CFTextModelKey, cfMessages, {
          max_tokens: 2048,
          temperature: 0.7,
        });
      }
    } else {
      // Hugging Face
      const hfMessages: HFMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];
      response = await chatCompletion(hfMessages, {
        model: modelConfig.model as string,
        max_tokens: 2048,
        temperature: 0.7,
        apiToken: process.env.HF_API_TOKEN,
      });
    }

    return NextResponse.json({
      response,
      model: modelId,
      provider: modelConfig.provider,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET endpoint to list available models */
export async function GET() {
  const cfConfig = getCloudflareConfig();
  const models = Object.entries(AVAILABLE_MODELS).map(([id, config]) => ({
    id,
    label: config.label,
    provider: config.provider,
    available: config.provider === "huggingface" || !!cfConfig,
  }));

  return NextResponse.json({ models });
}
