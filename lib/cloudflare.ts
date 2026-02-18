/**
 * Cloudflare Workers AI client — Full Model Suite
 * Uses the Cloudflare Workers AI REST API to run inference on models
 * at the edge with zero cold starts.
 * 
 * Supports: Text generation, Image generation, Vision, Embeddings, Speech
 * Docs: https://developers.cloudflare.com/workers-ai/
 */

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4/accounts";

export interface CloudflareAIConfig {
  accountId: string;
  apiToken: string;
}

export interface CloudflareMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CloudflareAIResponse {
  result: {
    response?: string;
    [key: string]: unknown;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

// ===== Full Model Catalog =====

/** Text generation models (free on Cloudflare Workers AI) */
export const CF_TEXT_MODELS = {
  "llama-3.3-70b": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "llama-3.1-8b": "@cf/meta/llama-3.1-8b-instruct-fast",
  "deepseek-r1-distill": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
  "gemma-2-27b": "@cf/google/gemma-2-27b-it",
  "gemma-3-12b": "@cf/google/gemma-3-12b-it",
  "mistral-7b": "@cf/mistral/mistral-7b-instruct-v0.2-lora",
  "qwen-2.5-coder": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "phi-2": "@cf/microsoft/phi-2",
  "hermes-2-pro": "@hf/nousresearch/hermes-2-pro-mistral-7b",
} as const;

/** Image generation models */
export const CF_IMAGE_MODELS = {
  "stable-diffusion-xl": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "dreamshaper": "@cf/lykon/dreamshaper-8-lcm",
  "flux-1-schnell": "@cf/black-forest-labs/flux-1-schnell",
} as const;

/** Vision / Multimodal models */
export const CF_VISION_MODELS = {
  "llava-1.5": "@cf/llava-hf/llava-1.5-7b-hf",
} as const;

/** Embedding models */
export const CF_EMBEDDING_MODELS = {
  "bge-base-en": "@cf/baai/bge-base-en-v1.5",
  "bge-large-en": "@cf/baai/bge-large-en-v1.5",
  "bge-small-en": "@cf/baai/bge-small-en-v1.5",
} as const;

/** Speech models */
export const CF_SPEECH_MODELS = {
  "whisper": "@cf/openai/whisper",
  "whisper-tiny": "@cf/openai/whisper-tiny-en",
} as const;

/** Translation models */
export const CF_TRANSLATION_MODELS = {
  "m2m100": "@cf/meta/m2m100-1.2b",
} as const;

// Combine all text model keys for the chat API
export type CFTextModelKey = keyof typeof CF_TEXT_MODELS;
export type CFImageModelKey = keyof typeof CF_IMAGE_MODELS;
export type CFVisionModelKey = keyof typeof CF_VISION_MODELS;

/**
 * Run text generation on Cloudflare Workers AI
 */
export async function runTextGeneration(
  config: CloudflareAIConfig,
  modelKey: CFTextModelKey,
  messages: CloudflareMessage[],
  options?: {
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
  }
): Promise<string> {
  const modelId = CF_TEXT_MODELS[modelKey];
  const url = `${CLOUDFLARE_API_BASE}/${config.accountId}/ai/run/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      max_tokens: options?.max_tokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
      stream: options?.stream ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CF AI error (${response.status}): ${errorText}`);
  }

  const data: CloudflareAIResponse = await response.json();
  if (!data.success) {
    throw new Error(`CF AI failed: ${data.errors.map(e => e.message).join(", ")}`);
  }
  return data.result.response || "";
}

/**
 * Generate an image using Cloudflare Workers AI
 * Returns a Uint8Array of the image bytes (PNG)
 */
export async function generateCFImage(
  config: CloudflareAIConfig,
  prompt: string,
  options?: {
    model?: CFImageModelKey;
    width?: number;
    height?: number;
    num_steps?: number;
  }
): Promise<Uint8Array> {
  const modelId = CF_IMAGE_MODELS[options?.model || "flux-1-schnell"];
  const url = `${CLOUDFLARE_API_BASE}/${config.accountId}/ai/run/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      width: options?.width || 512,
      height: options?.height || 512,
      num_steps: options?.num_steps || 4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CF Image error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Run vision model — analyze an image with a question
 */
export async function analyzeImage(
  config: CloudflareAIConfig,
  imageBase64: string,
  question: string,
  modelKey: CFVisionModelKey = "llava-1.5"
): Promise<string> {
  const modelId = CF_VISION_MODELS[modelKey];
  const url = `${CLOUDFLARE_API_BASE}/${config.accountId}/ai/run/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBase64,
      prompt: question,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CF Vision error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.result?.description || data.result?.response || "";
}

/**
 * Generate text embeddings
 */
export async function generateEmbeddings(
  config: CloudflareAIConfig,
  texts: string[],
  model: keyof typeof CF_EMBEDDING_MODELS = "bge-base-en"
): Promise<number[][]> {
  const modelId = CF_EMBEDDING_MODELS[model];
  const url = `${CLOUDFLARE_API_BASE}/${config.accountId}/ai/run/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texts }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CF Embedding error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.result?.data || [];
}

/**
 * Translate text using M2M100
 */
export async function translateText(
  config: CloudflareAIConfig,
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const url = `${CLOUDFLARE_API_BASE}/${config.accountId}/ai/run/${CF_TRANSLATION_MODELS.m2m100}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CF Translate error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.result?.translated_text || "";
}

/**
 * Simple chat completion with a Cloudflare Workers AI model
 */
export async function chatWithCloudflare(
  config: CloudflareAIConfig,
  modelKey: CFTextModelKey,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: CloudflareMessage[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });
  return runTextGeneration(config, modelKey, messages);
}

/**
 * Get the Cloudflare AI config from environment variables
 */
export function getCloudflareConfig(): CloudflareAIConfig | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken || accountId === "your-cloudflare-account-id") {
    return null;
  }

  return { accountId, apiToken };
}

/**
 * List all available model categories
 */
export function listAvailableModels() {
  return {
    text: Object.keys(CF_TEXT_MODELS),
    image: Object.keys(CF_IMAGE_MODELS),
    vision: Object.keys(CF_VISION_MODELS),
    embedding: Object.keys(CF_EMBEDDING_MODELS),
    speech: Object.keys(CF_SPEECH_MODELS),
    translation: Object.keys(CF_TRANSLATION_MODELS),
  };
}
