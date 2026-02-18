/**
 * Hugging Face Inference API client
 * Uses free models for text generation and image generation
 * 
 * Text: meta-llama/Meta-Llama-3-8B-Instruct (free, fast)
 * Image: black-forest-labs/FLUX.1-schnell (free, fast image gen)
 * Vision: meta-llama/Llama-3.2-11B-Vision-Instruct (understands images)
 */

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const HF_CHAT_BASE = "https://api-inference.huggingface.co/v1/chat/completions";

export interface HFConfig {
  apiToken: string;
}

export interface HFMessage {
  role: "system" | "user" | "assistant";
  content: string | HFContentPart[];
}

export interface HFContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

/** Free Hugging Face models */
export const HF_MODELS = {
  // Text generation (free, no API key needed for low rate)
  text: "meta-llama/Meta-Llama-3-8B-Instruct",
  // Better text model
  textPro: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  // Image generation (free)
  image: "black-forest-labs/FLUX.1-schnell",
  // Vision model (understands images)
  vision: "meta-llama/Llama-3.2-11B-Vision-Instruct",
} as const;

/**
 * Chat completion using HF Inference API (OpenAI-compatible endpoint)
 */
export async function chatCompletion(
  messages: HFMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
    apiToken?: string;
  }
): Promise<string> {
  const model = options?.model || HF_MODELS.text;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // API token is optional for free tier (rate limited)
  if (options?.apiToken) {
    headers["Authorization"] = `Bearer ${options.apiToken}`;
  }

  const response = await fetch(HF_CHAT_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.max_tokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Generate an image using Hugging Face FLUX model
 */
export async function generateImage(
  prompt: string,
  options?: {
    apiToken?: string;
    width?: number;
    height?: number;
  }
): Promise<Blob> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.apiToken) {
    headers["Authorization"] = `Bearer ${options.apiToken}`;
  }

  const response = await fetch(`${HF_API_BASE}/${HF_MODELS.image}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        width: options?.width || 512,
        height: options?.height || 512,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF Image API error (${response.status}): ${errorText}`);
  }

  return response.blob();
}

/**
 * Stream chat completion (returns async iterator of chunks)
 */
export async function* streamChatCompletion(
  messages: HFMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    apiToken?: string;
  }
): AsyncGenerator<string> {
  const model = options?.model || HF_MODELS.text;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.apiToken) {
    headers["Authorization"] = `Bearer ${options.apiToken}`;
  }

  const response = await fetch(HF_CHAT_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.max_tokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip invalid JSON
        }
      }
    }
  }
}
