/**
 * Server-side API configuration utilities
 * Use this for getting API keys in API routes and server components
 */

export interface APIKeys {
  anthropic?: string;
  groq?: string;
  openai?: string;
  firecrawl?: string;
  arcade?: string;
  e2b?: string;
  finnhub?: string;
}

/**
 * Get API keys from environment variables (server-side only)
 * Returns available keys even if some are missing
 */
export function getServerAPIKeys(): APIKeys {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const firecrawl = process.env.FIRECRAWL_API_KEY;
  const arcade = process.env.ARCADE_API_KEY;
  const e2b = process.env.E2B_API_KEY;
  const finnhub = process.env.FINNHUB_API_KEY;

  return {
    anthropic,
    groq,
    openai,
    firecrawl,
    arcade,
    e2b,
    finnhub,
  };
}

/**
 * Check if required API keys are configured
 */
export function hasServerAPIKeys(): boolean {
  const hasLLMKey = !!(process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
  return hasLLMKey && !!process.env.FIRECRAWL_API_KEY;
}
