import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Centralized MCP Server Registry Operations
 * Single source of truth for all MCP configurations
 */

// Get all MCP servers for a user
export const listUserMCPs = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    const servers = await db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return servers;
  },
});

// Get enabled MCP servers for a user
export const getEnabledMCPs = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    const servers = await db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();
    return servers;
  },
});

// Get a single MCP server by ID
export const getMCPServer = query({
  args: {
    id: v.id("mcpServers"),
  },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

// Get multiple MCP servers by IDs
export const getMCPServersByIds = query({
  args: {
    ids: v.array(v.id("mcpServers")),
  },
  handler: async ({ db }, { ids }) => {
    const servers = await Promise.all(
      ids.map(id => db.get(id))
    );
    return servers.filter(Boolean);
  },
});

// Add a new MCP server
export const addMCPServer = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    authType: v.string(),
    accessToken: v.optional(v.string()),
    tools: v.optional(v.array(v.string())),
    headers: v.optional(v.any()),
  },
  handler: async ({ db }, args) => {
    const serverId = await db.insert("mcpServers", {
      ...args,
      connectionStatus: "untested",
      enabled: true,
      isOfficial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return serverId;
  },
});

// Update MCP server
export const updateMCPServer = mutation({
  args: {
    id: v.id("mcpServers"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    authType: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    tools: v.optional(v.array(v.string())),
    connectionStatus: v.optional(v.string()),
    lastTested: v.optional(v.string()),
    lastError: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    headers: v.optional(v.any()),
  },
  handler: async ({ db }, { id, ...updates }) => {
    await db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

// Delete MCP server
export const deleteMCPServer = mutation({
  args: {
    id: v.id("mcpServers"),
  },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return { success: true };
  },
});

// Test MCP connection and discover tools
export const testConnection = action({
  args: {
    id: v.id("mcpServers"),
  },
  handler: async ({ runMutation, runQuery }, { id }) => {
    const server = await runQuery(api.mcpServers.getMCPServer, { id });

    if (!server) {
      throw new Error("MCP server not found");
    }

    try {
      // This will be called from the frontend which will do the actual connection test
      // The frontend will then update the server with the results
      return {
        serverId: id,
        needsTest: true,
        server
      };
    } catch (error) {
      await runMutation(api.mcpServers.updateMCPServer, {
        id,
        connectionStatus: "error",
        lastTested: new Date().toISOString(),
        lastError: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
});

// Seed official MCP servers (run once on first user setup)
export const seedOfficialMCPs = mutation({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    // Check if user already has official MCPs
    const existing = await db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isOfficial"), true))
      .first();

    if (existing) {
      return { message: "Official MCPs already seeded" };
    }

    // Official MCP configuration
    const officialMCPs = [
      {
        name: "Firecrawl",
        url: "https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp",
        description: "Web scraping, searching, and data extraction (API key required)",
        category: "web",
        authType: "api-key",
        tools: [
          "firecrawl_scrape",
          "firecrawl_search",
          "firecrawl_crawl",
          "firecrawl_map",
          "firecrawl_batch_scrape",
          "firecrawl_extract",
          "firecrawl_check_crawl_status"
        ],
      },
      // --- ADDED FINNHUB SERVER ---
      {
        name: "Finnhub",
        url: "https://finnhub.io/api/v1",
        description: "Real-time and historical financial market data for stocks, crypto, and forex.",
        category: "data",
        authType: "api-key",
        headers: {
          "X-Finnhub-Token": "${FINNHUB_API_KEY}"
        },
        tools: [
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
      },
    ];

    // Insert official MCPs for the user
    const insertedIds = await Promise.all(
      officialMCPs.map(mcp =>
        db.insert("mcpServers", {
          userId,
          ...mcp,
          connectionStatus: "untested",
          enabled: true, // Enable all official servers by default
          isOfficial: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      )
    );

    return { message: "Official MCPs seeded", count: insertedIds.length };
  },
});

// Toggle MCP enabled status
export const toggleMCPEnabled = mutation({
  args: {
    id: v.id("mcpServers"),
  },
  handler: async ({ db }, { id }) => {
    const server = await db.get(id);
    if (!server) {
      throw new Error("MCP server not found");
    }

    await db.patch(id, {
      enabled: !server.enabled,
      updatedAt: new Date().toISOString(),
    });

    return { enabled: !server.enabled };
  },
});

// Update connection status after testing
export const updateConnectionStatus = mutation({
  args: {
    id: v.id("mcpServers"),
    status: v.string(),
    tools: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
  },
  handler: async ({ db }, { id, status, tools, error }) => {
    await db.patch(id, {
      connectionStatus: status,
      tools,
      lastTested: new Date().toISOString(),
      lastError: error,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  },
});

// Clean up non-Firecrawl official MCPs
export const cleanupOfficialMCPs = mutation({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    // Find all official MCPs for the user
    const officialMCPs = await db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isOfficial"), true))
      .collect();

    // --- MODIFIED LOGIC ---
    // Define the official servers that should be kept
    const allowedOfficialNames = ["Firecrawl", "Finnhub"];
    
    // Delete any that are not in the allowed list
    let deletedCount = 0;
    for (const mcp of officialMCPs) {
      if (!allowedOfficialNames.includes(mcp.name)) {
        await db.delete(mcp._id);
        deletedCount++;
      }
    }

    return { message: `Cleaned up ${deletedCount} old official MCPs` };
  },
});