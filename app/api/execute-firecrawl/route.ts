import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import { getServerAPIKeys } from '@/lib/api/config';
import { 
  scrapeWithJina, 
  searchWithJina, 
  mapWithJina, 
  crawlWithJina, 
  batchScrapeWithJina 
} from '@/lib/scraping/jina';
import { scrapeWithBrowserless } from '@/lib/scraping/browserless';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params, jsonSchema, extractPrompt, useBrowserless } = body;

    // Determine which scraping service to use
    const useFirecrawl = !!process.env.FIRECRAWL_API_KEY;
    const useBrowserlessForce = useBrowserless === true;

    let result;

    switch (action) {
      case 'scrape':
        if (useBrowserlessForce) {
          // Use Browserless for JavaScript-heavy sites
          const browserlessResult = await scrapeWithBrowserless(params.url, {
            waitForSelector: params.waitForSelector,
            screenshot: params.screenshot,
          });
          
          if (browserlessResult.success) {
            result = {
              markdown: browserlessResult.markdown,
              html: browserlessResult.html,
              title: browserlessResult.title,
              screenshot: browserlessResult.screenshot,
            };
          } else {
            throw new Error(browserlessResult.error);
          }
        } else if (useFirecrawl) {
          // Use Firecrawl if available (legacy support)
          const apiKeys = getServerAPIKeys();
          const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl! });
          
          if (jsonSchema && extractPrompt) {
            result = await firecrawl.scrape(params.url, {
              formats: [{
                type: 'json',
                schema: JSON.parse(jsonSchema),
                prompt: extractPrompt,
              }],
            });
          } else {
            result = await firecrawl.scrape(params.url, {
              formats: params.formats || ['markdown'],
            });
          }
        } else {
          // Use Jina.ai (default, free)
          const jinaResult = await scrapeWithJina(params.url);
          
          if (jinaResult.success) {
            result = {
              markdown: jinaResult.markdown,
              title: jinaResult.title,
            };
          } else {
            throw new Error(jinaResult.error);
          }
        }
        break;

      case 'search':
        if (useFirecrawl) {
          const apiKeys = getServerAPIKeys();
          const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl! });
          result = await firecrawl.search(params.query, {
            limit: params.limit || 5,
          });
        } else {
          // Use Jina.ai search
          const searchResult = await searchWithJina(params.query, params.limit || 5);
          
          if (searchResult.success) {
            result = {
              results: searchResult.results,
            };
          } else {
            throw new Error(searchResult.error);
          }
        }
        break;

      case 'map':
        if (useFirecrawl) {
          const apiKeys = getServerAPIKeys();
          const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl! });
          result = await firecrawl.map(params.url);
        } else {
          // Use Jina.ai map
          const mapResult = await mapWithJina(params.url);
          
          if (mapResult.success) {
            result = {
              urls: mapResult.urls,
            };
          } else {
            throw new Error(mapResult.error);
          }
        }
        break;

      case 'crawl':
        if (useFirecrawl) {
          const apiKeys = getServerAPIKeys();
          const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl! });
          
          if (jsonSchema && extractPrompt) {
            result = await firecrawl.crawl(params.url, {
              limit: params.limit || 10,
              scrapeOptions: {
                formats: [{
                  type: 'json',
                  schema: JSON.parse(jsonSchema),
                  prompt: extractPrompt,
                }],
              },
            });
          } else {
            result = await firecrawl.crawl(params.url, {
              limit: params.limit || 10,
              scrapeOptions: {
                formats: params.formats || ['markdown'],
              },
            });
          }
        } else {
          // Use Jina.ai crawl
          const crawlResult = await crawlWithJina(params.url, params.limit || 10);
          
          if (crawlResult.success) {
            result = {
              pages: crawlResult.pages?.map(page => ({
                markdown: page.markdown,
                title: page.title,
              })),
            };
          } else {
            throw new Error(crawlResult.error);
          }
        }
        break;

      case 'batch_scrape':
        if (useFirecrawl) {
          const apiKeys = getServerAPIKeys();
          const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl! });
          result = await firecrawl.batchScrape(params.urls);
        } else {
          // Use Jina.ai batch scrape
          const batchResults = await batchScrapeWithJina(params.urls);
          result = {
            results: batchResults.map(r => ({
              success: r.success,
              markdown: r.markdown,
              title: r.title,
              error: r.error,
            })),
          };
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported: scrape, search, map, crawl, batch_scrape` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
    });
  } catch (error) {
    console.error('Scraping execution error:', error);
    return NextResponse.json(
      {
        error: 'Scraping execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        tip: 'Using Jina.ai (free) + Browserless (local). Firecrawl is optional fallback.',
      },
      { status: 500 }
    );
  }
}
