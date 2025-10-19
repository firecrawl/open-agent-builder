/**
 * Jina.ai Reader Integration
 * Free web scraping service that converts any URL to clean markdown
 * No API key required
 */

interface JinaScrapResult {
  success: boolean;
  markdown?: string;
  title?: string;
  error?: string;
}

interface JinaSearchResult {
  success: boolean;
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

/**
 * Scrape a single URL and return markdown content
 */
export async function scrapeWithJina(url: string): Promise<JinaScrapResult> {
  try {
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
      },
    });

    if (!response.ok) {
      throw new Error(`Jina.ai returned ${response.status}: ${response.statusText}`);
    }

    const markdown = await response.text();

    // Extract title from markdown (first # heading)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : url;

    return {
      success: true,
      markdown,
      title,
    };
  } catch (error) {
    console.error('Jina.ai scraping error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Search the web using Jina.ai Search
 */
export async function searchWithJina(query: string, limit: number = 5): Promise<JinaSearchResult> {
  try {
    // Jina.ai Search endpoint
    const searchUrl = `https://s.jina.ai/${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Jina.ai search returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse search results
    const results = (data.data || []).slice(0, limit).map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.url || '',
      snippet: item.content || item.description || '',
    }));

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Jina.ai search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract structured JSON data from a URL using LLM
 * This requires an LLM to parse the markdown and extract according to schema
 */
export async function extractJSONWithJina(
  url: string,
  schema: Record<string, any>,
  prompt?: string
): Promise<any> {
  // First scrape the content
  const scrapeResult = await scrapeWithJina(url);
  
  if (!scrapeResult.success || !scrapeResult.markdown) {
    throw new Error(scrapeResult.error || 'Failed to scrape URL');
  }

  // Return the markdown with instructions for LLM to extract
  // The actual extraction will be done by the agent node
  return {
    markdown: scrapeResult.markdown,
    schema,
    prompt: prompt || `Extract structured data from this content according to the provided schema`,
    _note: 'LLM extraction required',
  };
}

/**
 * Batch scrape multiple URLs
 */
export async function batchScrapeWithJina(urls: string[]): Promise<JinaScrapResult[]> {
  const results = await Promise.allSettled(
    urls.map(url => scrapeWithJina(url))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: `Failed to scrape ${urls[index]}: ${result.reason}`,
      };
    }
  });
}

/**
 * Crawl a website (scrape multiple pages from same domain)
 * Since Jina.ai doesn't have native crawl, we'll scrape the main page
 * and extract links, then scrape those
 */
export async function crawlWithJina(
  startUrl: string,
  limit: number = 10
): Promise<{
  success: boolean;
  pages?: JinaScrapResult[];
  error?: string;
}> {
  try {
    // Scrape the starting page
    const mainPage = await scrapeWithJina(startUrl);
    
    if (!mainPage.success || !mainPage.markdown) {
      return {
        success: false,
        error: mainPage.error || 'Failed to scrape starting URL',
      };
    }

    // Extract links from markdown
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(mainPage.markdown)) !== null) {
      const linkUrl = match[2];
      // Only include links from same domain
      try {
        const startDomain = new URL(startUrl).hostname;
        const linkDomain = new URL(linkUrl, startUrl).hostname;
        
        if (linkDomain === startDomain) {
          const fullUrl = new URL(linkUrl, startUrl).href;
          if (!links.includes(fullUrl) && fullUrl !== startUrl) {
            links.push(fullUrl);
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // Scrape up to limit additional pages
    const urlsToScrape = links.slice(0, Math.max(0, limit - 1));
    const additionalPages = await batchScrapeWithJina(urlsToScrape);

    return {
      success: true,
      pages: [mainPage, ...additionalPages],
    };
  } catch (error) {
    console.error('Jina.ai crawl error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Map a website's structure (get all URLs)
 */
export async function mapWithJina(url: string): Promise<{
  success: boolean;
  urls?: string[];
  error?: string;
}> {
  try {
    const scrapeResult = await scrapeWithJina(url);
    
    if (!scrapeResult.success || !scrapeResult.markdown) {
      return {
        success: false,
        error: scrapeResult.error || 'Failed to scrape URL',
      };
    }

    // Extract all links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = linkRegex.exec(scrapeResult.markdown)) !== null) {
      try {
        const fullUrl = new URL(match[2], url).href;
        if (!urls.includes(fullUrl)) {
          urls.push(fullUrl);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    return {
      success: true,
      urls,
    };
  } catch (error) {
    console.error('Jina.ai map error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

