import { chromium, errors } from 'playwright';
import type { Browser, Page } from 'playwright';
import { Injectable } from '@nestjs/common';
import { UrlMetadata } from 'src/queue/interfaces/url-metadata.interface';
import LoggerService from 'src/logger/logger.service';

@Injectable()
export default class UrlMetadataService {
  private static sharedBrowser: Browser | null = null;
  private readonly userAgent: string =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
  private readonly imageNotFound: string = 'https://www.google.com/blank.html';

  constructor(private readonly logger: LoggerService) {}
  /**  Auto-recovering browser launcher */
  private async getOrCreateBrowser(): Promise<Browser> {
    if (
      !UrlMetadataService.sharedBrowser ||
      !UrlMetadataService.sharedBrowser.isConnected()
    ) {
      try {
        UrlMetadataService.sharedBrowser = await chromium.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-sync',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-client-side-phishing-detection',
            '--no-first-run',
            '--no-zygote',
            '--no-startup-window',
            '--mute-audio',
            '--blink-settings=imagesEnabled=false',
            '--disable-features=Translate,PaintHolding,BackForwardCache,InterestFeedContentSuggestions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--password-store=basic',
            '--use-mock-keychain',
          ],
        });
      } catch (err) {
        UrlMetadataService.sharedBrowser = null;
        throw new Error(`Failed to launch browser: ${(err as Error).message}`);
      }
    }
    return UrlMetadataService.sharedBrowser;
  }

  private async newPage(): Promise<Page> {
    const browser = await this.getOrCreateBrowser();
    const context = await browser.newContext({
      locale: 'en-US',
      userAgent: this.userAgent,
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });

    const page = await context.newPage();

    // 🚀 Block unnecessary resources but allow favicons
    await page.route('**/*', (route) => {
      const req = route.request();
      const type = req.resourceType();
      const url = req.url();

      // Allow favicons (even if they're images)
      const isFavicon = /favicon\.(ico|png|svg)/i.test(url);

      if (
        ['image', 'stylesheet', 'font', 'media', 'script'].includes(type) &&
        !isFavicon
      ) {
        return route.abort();
      }

      return route.continue();
    });

    return page;
  }

  private async extractFavicon(page: Page): Promise<string> {
    const faviconUrl = await page.evaluate(() => {
      const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
      for (const rel of rels) {
        const link = document.querySelector<HTMLLinkElement>(
          `link[rel='${rel}']`,
        );
        if (link?.href) return link.href;
      }
      return null;
    });
    return faviconUrl || this.imageNotFound;
  }

  private async extractMetaTags(page: Page, url: string): Promise<UrlMetadata> {
    const metaTags = await page.evaluate(() => {
      const tags: Record<string, string> = {};
      const keywords: string[] = [];

      const normalizeText = (text: string | null) =>
        (text || '').replace(/\s+/g, ' ').trim();

      document.querySelectorAll('meta').forEach((tag) => {
        const name = tag.getAttribute('name')?.toLowerCase() || '';
        const property = tag.getAttribute('property')?.toLowerCase() || '';
        const content = normalizeText(tag.getAttribute('content'));

        if (property.startsWith('og:')) tags[property] = content;
        else if (name.startsWith('twitter:')) tags[name] = content;
        else if (name.includes('keyword')) keywords.push(content);
        else if (['description', 'author', 'robots'].includes(name))
          tags[name] = content;
      });

      if (keywords.length > 0)
        tags['keywords'] = keywords.filter(Boolean).join(', ');
      if (!tags['og:title']) {
        const title = document.querySelector('title')?.textContent;
        if (title) tags['og:title'] = normalizeText(title);
      }

      return tags;
    });

    const favicon = await this.extractFavicon(page);

    return {
      title: metaTags['og:title'] || metaTags['twitter:title'] || url,
      url: metaTags['og:url'] || url,
      description:
        metaTags['og:description'] ||
        metaTags['twitter:description'] ||
        metaTags['description'] ||
        'unknown',
      image:
        metaTags['og:image'] ||
        metaTags['twitter:image:src'] ||
        this.imageNotFound,
      favicon,
      site_name: metaTags['og:site_name'] || metaTags['og:site'] || 'unknown',
      keywords: metaTags['keywords'] || 'unknown',
      type: metaTags['og:type'] || 'unknown',
      robots: metaTags['robots'] || 'unknown',
      author: metaTags['author'] || 'unknown',
    };
  }

  /**  Fetch metadata for one URL safely */
  public async fetchMetadata(url: string): Promise<UrlMetadata> {
    let page: Page | null = null;
    try {
      page = await this.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const metadata = await this.extractMetaTags(page, url);
      return metadata;
    } catch (error) {
      if (error instanceof errors.TimeoutError)
        throw new Error(`Timeout: ${error.message}`);

      if (error instanceof Error) throw new Error(`Error: ${error.message}`);

      throw error;
    } finally {
      if (page) {
        const context = page.context();
        if (context && context.browser()?.isConnected()) await context.close();
      }
    }
  }

  /** Optional cleanup on shutdown */
  public static async closeSharedBrowser(): Promise<void> {
    if (UrlMetadataService.sharedBrowser) {
      await UrlMetadataService.sharedBrowser.close().catch(() => {});
      UrlMetadataService.sharedBrowser = null;
    }
  }
}
