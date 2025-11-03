/**
 * MCP Registry - Centralized MCP Server Configuration
 *
 * All MCP servers are defined here and stored in Redis
 * This provides a single source of truth for MCP configurations
 */

export interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  authType: 'none' | 'api-key' | 'url' | 'bearer';
  apiKeyPlaceholder?: string;
  tools: string[];
  category: 'web' | 'ai' | 'productivity' | 'data' | 'automation';
  enabled: boolean;
  official: boolean;
  documentation?: string;
  headers?: Record<string, string>;
}

/**
 * Official MCP Servers
 */
export const officialMCPServers: MCPServerConfig[] = [
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    description: 'Web scraping, searching, crawling, and data extraction',
    url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
    authType: 'url',
    apiKeyPlaceholder: 'FIRECRAWL_API_KEY',
    tools: [
      'firecrawl_scrape',
      'firecrawl_search',
      'firecrawl_map',
      'firecrawl_crawl',
      'firecrawl_batch_scrape',
      'firecrawl_extract',
      'firecrawl_check_crawl_status',
    ],
    category: 'web',
    enabled: true,
    official: true,
    documentation: 'https://docs.firecrawl.dev/mcp',
  },
  {
    id: 'browserbase',
    name: 'Browserbase',
    description: 'Browser automation and headless browsing',
    url: 'https://mcp.browserbase.com',
    authType: 'api-key',
    apiKeyPlaceholder: 'BROWSERBASE_API_KEY',
    tools: [
      'create_session',
      'navigate',
      'screenshot',
      'get_content',
      'click',
      'fill_form',
    ],
    category: 'automation',
    enabled: true,
    official: true,
    documentation: 'https://docs.browserbase.com/mcp',
  },
  {
    id: 'e2b',
    name: 'E2B Code Interpreter',
    description: 'Execute code in secure sandboxes',
    url: 'https://mcp.e2b.dev',
    authType: 'api-key',
    apiKeyPlaceholder: 'E2B_API_KEY',
    tools: [
      'execute_python',
      'execute_javascript',
      'run_sandbox',
      'install_package',
    ],
    category: 'automation',
    enabled: true,
    official: true,
    documentation: 'https://e2b.dev/docs/mcp',
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search with Brave Search API',
    url: 'https://mcp.brave.com',
    authType: 'api-key',
    apiKeyPlaceholder: 'BRAVE_API_KEY',
    tools: [
      'web_search',
      'news_search',
      'image_search',
    ],
    category: 'web',
    enabled: true,
    official: true,
    documentation: 'https://brave.com/search/api/',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and manage Google Drive files',
    url: 'https://mcp.google.com/drive',
    authType: 'bearer',
    tools: [
      'list_files',
      'get_file',
      'create_file',
      'upload_file',
      'search_files',
    ],
    category: 'productivity',
    enabled: false,
    official: true,
    documentation: 'https://developers.google.com/drive',
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    description: 'Cryptocurrency prices and market data',
    url: 'https://mcp.api.coingecko.com/sse',
    authType: 'none',
    tools: [
      'get_coin_price',
      'get_coin_data',
      'search_coins',
      'get_trending',
      'get_market_chart',
    ],
    category: 'data',
    enabled: true,
    official: true,
    documentation: 'https://www.coingecko.com/api/documentation',
  },
  {
    id: 'finnhub',
    name: 'Finnhub',
    description: 'Real-time and historical financial market data for stocks, crypto, and forex.',
    url: 'https://finnhub.io/api/v1',
    authType: 'api-key',
    apiKeyPlaceholder: 'FINNHUB_API_KEY',
    headers: {
      'X-Finnhub-Token': '{FINNHUB_API_KEY}'
    },
    tools: [
      // All tools derived from the 'operationId' in the provided schema
      'symbol_search',
      'stock_symbols',
      'market_status',
      'market_holiday',
      'company_profile',
      'company_profile2',
      'company_executive',
      'market_news',
      'company_news',
      'press_releases',
      'news_sentiment',
      'company_peers',
      'company_basic_financials',
      'price_metrics',
      'symbol_change',
      'isin_change',
      'historical_market_cap',
      'historical_employee_count',
      'institutional_profile',
      'institutional_portfolio',
      'institutional_ownership',
      'ownership',
      'fund_ownership',
      'insider_transactions',
      'insider_sentiment',
      'financials',
      'financials_reported',
      'revenue_breakdown',
      'filings',
      'filings_sentiment',
      'similarity_index',
      'ipo_calendar',
      'stock_dividends',
      'sector_metric',
      'recommendation_trends',
      'price_target',
      'upgrade_downgrade',
      'company_revenue_estimates',
      'company_ebitda_estimates',
      'company_ebit_estimates',
      'company_eps_estimates',
      'company_earnings',
      'earnings_calendar',
      'quote',
      'stock_candles',
      'stock_tick',
      'stock_nbbo',
      'stock_bidask',
      'stock_splits',
      'stock_basic_dividends',
      'indices_constituents',
      'indices_historical_constituents',
      'etfs_profile',
      'etfs_holdings',
      'etfs_sector_exposure',
      'etfs_country_exposure',
      'mutual_fund_profile',
      'mutual_fund_holdings',
      'mutual_fund_sector_exposure',
      'mutual_fund_country_exposure',
      'mutual_fund_eet',
      'mutual_fund_eet_pai',
      'bond_profile',
      'bond_price',
      'bond_tick',
      'bond_yield_curve',
      'forex_exchanges',
      'forex_symbols',
      'forex_candles',
      'forex_rates',
      'crypto_exchanges',
      'crypto_symbols',
      'crypto_profile',
      'crypto_candles',
      'pattern_recognition',
      'support_resistance',
      'aggregate_indicator',
      'technical_indicator',
      'transcripts_list',
      'transcripts',
      'earnings_call_live',
      'stock_presentation',
      'social_sentiment',
      'investment_themes',
      'supply_chain_relationships',
      'company_esg_score',
      'company_historical_esg_score',
      'company_earnings_quality_score',
      'covid_19',
      'fda_committee_meeting_calendar',
      'stock_uspto_patent',
      'stock_visa_application',
      'stock_lobbying',
      'stock_usa_spending',
      'congressional_trading',
      'bank_branch',
      'airline_price_index',
      'ai_chat',
      'revenue_breakdown2',
      'international_filings',
      'global_filings_search',
      'search_in_filing',
      'global_filings_search_filter',
      'global_filings_download',
      'country',
      'economic_calendar',
      'economic_code',
      'economic_data',
    ],
    category: 'data',
    enabled: true,
    official: true,
    documentation: 'https://finnhub.io/docs/api',
  }
];

/**
 * Get all enabled MCP servers
 */
export function getEnabledMCPServers(): MCPServerConfig[] {
  return officialMCPServers.filter(s => s.enabled);
}

/**
 * Get MCP server by ID
 */
export function getMCPServerById(id: string): MCPServerConfig | null {
  return officialMCPServers.find(s => s.id === id) || null;
}

/**
 * Get MCP servers by category
 */
export function getMCPServersByCategory(category: string): MCPServerConfig[] {
  return officialMCPServers.filter(s => s.category === category && s.enabled);
}

/**
 * Format MCP server URL with API key
 */
export function formatMCPUrl(server: MCPServerConfig, apiKeys: Record<string, string>): string {
  let url = server.url;

  // Replace API key placeholders in URL
  if (server.authType === 'url' && server.apiKeyPlaceholder) {
    const keyValue = apiKeys[server.apiKeyPlaceholder] || process.env[server.apiKeyPlaceholder] || '';
    url = url.replace(`{${server.apiKeyPlaceholder}}`, keyValue);
  }

  // Replace API key placeholders in headers
  if (server.headers && server.apiKeyPlaceholder) {
    const keyValue = apiKeys[server.apiKeyPlaceholder] || process.env[server.apiKeyPlaceholder] || '';
    Object.entries(server.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        server.headers![key] = value.replace(`{${server.apiKeyPlaceholder}}`, keyValue);
      }
    });
  }

  return url;
}

/**
 * Check if MCP server is configured (has required API key)
 */
export function isMCPConfigured(server: MCPServerConfig): boolean {
  if (server.authType === 'none') return true;
  if (!server.apiKeyPlaceholder) return true;

  // Check if API key exists in environment
  if (typeof process !== 'undefined' && process.env) {
    return !!process.env[server.apiKeyPlaceholder];
  }

  return false;
}

/**
 * Get MCP server configuration for Agent nodes
 */
export function getMCPConfigForAgent(serverId: string, apiKeys: Record<string, string>) {
  const server = getMCPServerById(serverId);
  if (!server) return null;

  return {
    id: server.id,
    name: server.name,
    label: server.name,
    url: formatMCPUrl(server, apiKeys),
    authType: server.authType,
    description: server.description,
    availableTools: server.tools,
  };
}
