#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..", "..");

for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

function getHfToken() {
  return (
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACEHUB_API_TOKEN ||
    process.env.HUGGING_FACE_HUB_TOKEN ||
    ""
  );
}

function getHfBaseUrl() {
  return process.env.HF_BASE_URL || "https://router.huggingface.co/v1";
}

function getDefaultModel() {
  return process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
}

function parseJsonSafe(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function makeHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getHfToken().trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function extractAssistantText(choice) {
  const content = choice?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return "";
}

async function callHfChat({ prompt, system, model, temperature, max_tokens }) {
  const token = getHfToken().trim();
  if (!token) {
    throw new Error(
      "HF token is missing. Set HF_TOKEN (or HUGGINGFACEHUB_API_TOKEN) before launching Claude."
    );
  }

  const messages = [];
  if (system?.trim()) {
    messages.push({ role: "system", content: system.trim() });
  }
  messages.push({ role: "user", content: prompt });

  const payload = {
    model: model || getDefaultModel(),
    messages,
    temperature,
    max_tokens,
  };

  const response = await fetch(`${getHfBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  const parsed = parseJsonSafe(rawText);

  if (!response.ok) {
    const detail = parsed?.error?.message || parsed?.error || rawText || "Unknown error";
    throw new Error(`Hugging Face API error ${response.status}: ${String(detail).slice(0, 800)}`);
  }

  const answer = extractAssistantText(parsed?.choices?.[0]);

  return {
    model: parsed?.model || payload.model,
    answer,
    usage: parsed?.usage || null,
    id: parsed?.id || null,
  };
}

async function listHfModels({ limit, search }) {
  if (!getHfToken().trim()) {
    throw new Error(
      "HF token is missing. Set HF_TOKEN (or HUGGINGFACEHUB_API_TOKEN) before launching Claude."
    );
  }

  const response = await fetch(`${getHfBaseUrl()}/models`, {
    method: "GET",
    headers: makeHeaders(),
  });

  const rawText = await response.text();
  const parsed = parseJsonSafe(rawText);

  if (!response.ok) {
    const detail = parsed?.error?.message || parsed?.error || rawText || "Unknown error";
    throw new Error(`Hugging Face API error ${response.status}: ${String(detail).slice(0, 800)}`);
  }

  let items = Array.isArray(parsed?.data) ? parsed.data : Array.isArray(parsed) ? parsed : [];

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((m) => String(m?.id || "").toLowerCase().includes(q));
  }

  const sliced = items.slice(0, Math.max(1, Math.min(limit, 100))).map((m) => ({
    id: m?.id || "",
    provider: m?.provider || "",
    context_length: m?.context_length ?? null,
  }));

  return {
    total: items.length,
    returned: sliced.length,
    models: sliced,
  };
}

const server = new McpServer({
  name: "huggingface-free-mcp",
  version: "1.0.0",
});

server.registerTool(
  "hf_chat",
  {
    title: "Hugging Face Chat",
    description: "Call a Hugging Face chat model through router.huggingface.co.",
    inputSchema: {
      prompt: z.string().min(1),
      system: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).default(0.3),
      max_tokens: z.number().int().min(32).max(4096).default(512),
    },
    outputSchema: {
      model: z.string(),
      answer: z.string(),
      usage: z
        .object({
          prompt_tokens: z.number().optional(),
          completion_tokens: z.number().optional(),
          total_tokens: z.number().optional(),
        })
        .nullable(),
      id: z.string().nullable(),
    },
  },
  async ({ prompt, system, model, temperature = 0.3, max_tokens = 512 }) => {
    const output = await callHfChat({ prompt, system, model, temperature, max_tokens });
    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

server.registerTool(
  "hf_list_models",
  {
    title: "Hugging Face Model List",
    description: "List models available from your Hugging Face router account.",
    inputSchema: {
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
    },
    outputSchema: {
      total: z.number(),
      returned: z.number(),
      models: z.array(
        z.object({
          id: z.string(),
          provider: z.string(),
          context_length: z.number().nullable(),
        })
      ),
    },
  },
  async ({ limit = 20, search }) => {
    const output = await listHfModels({ limit, search });
    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("[hf-free-mcp] startup error:", error?.message || error);
  process.exit(1);
});
