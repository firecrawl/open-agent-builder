/**
 * Browserless Integration
 * Full browser automation for complex scraping needs
 * Requires Browserless container running
 */

import { launch, Browser, Page } from 'puppeteer-core';

const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'http://browserless:3000';

interface BrowserlessScrapResult {
  success: boolean;
  markdown?: string;
  html?: string;
  title?: string;
  screenshot?: string;
  error?: string;
}

/**
 * Get browser connection
 */
async function getBrowser(): Promise<Browser> {
  try {
    const browser = await launch({
      browser

WSEndpoint: `${BROWSERLESS_URL}?blockAds=true&stealth=true`,
    });
    return browser;
  } catch (error) {
    throw new Error(`Failed to connect to Browserless: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert HTML to Markdown (simple conversion)
 */
function htmlToMarkdown(html: string): string {
  // Remove scripts and styles
  let markdown = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Convert common HTML elements to markdown
  markdown = markdown
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
    // Lists
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n')
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

/**
 * Scrape a URL with full JavaScript rendering
 */
export async function scrapeWithBrowserless(
  url: string,
  options?: {
    waitForSelector?: string;
    screenshot?: boolean;
    fullPage?: boolean;
  }
): Promise<BrowserlessScrapResult> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for specific selector if provided
    if (options?.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }

    // Get page content
    const title = await page.title();
    const html = await page.content();
    const markdown = htmlToMarkdown(html);

    // Take screenshot if requested
    let screenshot: string | undefined;
    if (options?.screenshot) {
      const buffer = await page.screenshot({
        fullPage: options.fullPage || false,
        encoding: 'base64',
      });
      screenshot = `data:image/png;base64,${buffer}`;
    }

    await browser.close();

    return {
      success: true,
      markdown,
      html,
      title,
      screenshot,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    console.error('Browserless scraping error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract structured data from a page using JavaScript
 */
export async function extractWithBrowserless(
  url: string,
  extractScript: string
): Promise<any> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Execute extraction script
    const result = await page.evaluate(extractScript);

    await browser.close();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    throw new Error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fill and submit a form
 */
export async function submitFormWithBrowserless(
  url: string,
  formData: Record<string, string>,
  submitSelector?: string
): Promise<BrowserlessScrapResult> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Fill form fields
    for (const [selector, value] of Object.entries(formData)) {
      await page.type(selector, value);
    }

    // Submit form
    if (submitSelector) {
      await page.click(submitSelector);
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

    // Get result
    const title = await page.title();
    const html = await page.content();
    const markdown = htmlToMarkdown(html);

    await browser.close();

    return {
      success: true,
      markdown,
      html,
      title,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    console.error('Form submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Take a screenshot of a page
 */
export async function screenshotWithBrowserless(
  url: string,
  options?: {
    fullPage?: boolean;
    selector?: string;
  }
): Promise<{ success: boolean; screenshot?: string; error?: string }> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    let buffer;
    if (options?.selector) {
      const element = await page.$(options.selector);
      if (!element) {
        throw new Error(`Element not found: ${options.selector}`);
      }
      buffer = await element.screenshot({ encoding: 'base64' });
    } else {
      buffer = await page.screenshot({
        fullPage: options?.fullPage || false,
        encoding: 'base64',
      });
    }

    await browser.close();

    return {
      success: true,
      screenshot: `data:image/png;base64,${buffer}`,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    console.error('Screenshot error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate PDF from a page
 */
export async function pdfWithBrowserless(
  url: string,
  options?: {
    format?: 'A4' | 'Letter';
    landscape?: boolean;
  }
): Promise<{ success: boolean; pdf?: string; error?: string }> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const pdf = await page.pdf({
      format: options?.format || 'A4',
      landscape: options?.landscape || false,
      printBackground: true,
    });

    await browser.close();

    return {
      success: true,
      pdf: pdf.toString('base64'),
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

