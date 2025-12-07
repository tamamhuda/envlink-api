import { chromium, errors } from 'playwright';
import type { Browser, BrowserContext, Page, Route, Request } from 'playwright';
import { Injectable } from '@nestjs/common';
import { UrlMetadata } from 'src/queue/interfaces/url-metadata.interface';
import LoggerService from 'src/common/logger/logger.service';

interface ScraperOptions {
  enableJavaScript?: boolean;
  timeout?: number;
  waitForDynamic?: boolean;
  allowCrossOrigin?: boolean; // opt-in (default false)
}

/**
 * Secure UrlMetadataService
 * - Minimal, deterministic outgoing headers (route-level override)
 * - Blocks cross-origin resources by default
 * - Disables client hints, speculation, HTTP/2/QUIC where possible
 * - Provides per-request JS toggle (use JS only when necessary)
 */
@Injectable()
export default class UrlMetadataService {
  private static sharedBrowser: Browser | null = null;

  // Keep a consistent UA; avoid embedding environment-specific details
  private readonly userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

  constructor(private readonly logger: LoggerService) {}

  /** Launch or return a shared hardened browser instance */
  private async getOrCreateBrowser(): Promise<Browser> {
    if (
      UrlMetadataService.sharedBrowser &&
      UrlMetadataService.sharedBrowser.isConnected()
    ) {
      return UrlMetadataService.sharedBrowser;
    }

    try {
      UrlMetadataService.sharedBrowser = await chromium.launch({
        headless: true,
        args: [
          // Isolation / safety
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-zygote',
          '--no-startup-window',

          // Disable client hints, speculation, prefetch, HTTP/2, QUIC
          '--disable-features=UserAgentClientHint,ClientHints,SecClientHintHeader,AcceptCHFrame,PreloadMediaEngagementData,SpeculationRules,InterestFeedContentSuggestions,Translate',
          '--disable-speculation-rules',
          '--disable-prefetch',
          '--disable-http2',
          '--disable-quic',
          '--no-pings',

          // Disable features that increase fingerprint surface
          '--disable-blink-features=AutomationControlled',
          '--disable-plugins',
          '--disable-extensions',
          '--disable-sync',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-remote-fonts',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',

          // Resource optimization
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--blink-settings=imagesEnabled=false',
          '--mute-audio',
          '--hide-scrollbars',

          // Telemetry / metrics
          '--metrics-recording-only',
          '--password-store=basic',
          '--use-mock-keychain',
        ],
      });

      return UrlMetadataService.sharedBrowser;
    } catch (err) {
      UrlMetadataService.sharedBrowser = null;
      this.logger.error(
        'Failed to launch hardened browser',
        (err as Error).message,
      );
      throw new Error(`Failed to launch browser: ${(err as Error).message}`);
    }
  }

  /** Create a hardened, single-origin context */
  private async createHardenedContext(
    browser: Browser,
    options: ScraperOptions = {},
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      userAgent: this.userAgent,
      locale: 'en-US',
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      isMobile: false,
      serviceWorkers: 'block',
      javaScriptEnabled: options.enableJavaScript !== false,
      bypassCSP: true,
      permissions: [],
    });

    // Minimal navigator/evidence masking
    await context.addInitScript(() => {
      // Hide webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Minimal plugins to avoid empty-array fingerprint
      Object.defineProperty(navigator, 'plugins', {
        get: () => [{}, {}],
      });

      // Prevent revealing referrer via document.referrer
      try {
        Object.defineProperty(document, 'referrer', {
          get: () => '',
          configurable: true,
        });
      } catch (e) {}

      // Return denied for notifications queries
      try {
        const originalQuery = navigator.permissions?.query?.bind(
          navigator.permissions,
        );
        if (originalQuery) {
          // @ts-ignore
          navigator.permissions.query = (params: any) =>
            params?.name === 'notifications'
              ? Promise.resolve({ state: 'denied' })
              : originalQuery(params);
        }
      } catch (e) {}
    });

    return context;
  }

  /**
   * Build a deterministic minimal header set for navigation/document requests
   * NOTE: we explicitly do NOT include Authorization, cookies, or any secret values here.
   */
  private buildSafeHeaders(): Record<string, string> {
    return {
      // Minimal Accept to indicate a document
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      // keep UA consistent; route handler will set it
      'User-Agent': this.userAgent,
      // Client hints explicitly omitted; use Sec-Fetch to indicate top-level nav
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      DNT: '1',
      // No Referer to avoid leaking upstream
      Referer: '',
    };
  }

  /**
   * Create new page which:
   * - blocks non-document cross-origin requests by default
   * - enforces header override per-request so chromium can't inject extras
   */
  private async newPage(options: ScraperOptions = {}): Promise<Page> {
    const browser = await this.getOrCreateBrowser();
    const context = await this.createHardenedContext(browser, options);
    const page = await context.newPage();

    // Base origin will be set once we navigate; use closure var to check same-origin
    let baseOrigin: string | null = null;
    const safeHeaders = this.buildSafeHeaders();

    // Central route: block cross-origin by default and force headers
    await page.route('**/*', async (route: Route, request: Request) => {
      try {
        const url = new URL(request.url());
        const resourceType = request.resourceType();

        // Allow document navigations always (document can be cross-origin if allowCrossOrigin true)
        if (resourceType === 'document') {
          // On first document request, set baseOrigin
          if (!baseOrigin) {
            baseOrigin = url.origin;
          }

          // If cross-origin blocking is enabled (default), abort cross-origin document navigations
          if (
            !options.allowCrossOrigin &&
            baseOrigin &&
            url.origin !== baseOrigin
          ) {
            return route.abort();
          }

          // Continue document request with safe headers (strict override)
          return route.continue({
            headers: safeHeaders,
          });
        }

        // Allow same-origin favicon/manifest only
        const isFavicon = /\/favicon\.(ico|png|svg|jpg|jpeg|gif)$/i.test(
          url.pathname,
        );
        const isManifest = /manifest(\.json)?$/i.test(url.pathname);

        if (
          (isFavicon || isManifest) &&
          baseOrigin &&
          url.origin === baseOrigin
        ) {
          return route.continue({ headers: safeHeaders });
        }

        // Abort everything else (images, scripts, styles, fetch/xhr, fonts, media, websockets)
        return route.abort();
      } catch (e) {
        // On any parsing error, abort to be safe
        return route.abort();
      }
    });

    // Additional page-level init: ensure no Referer header leaks
    await page.addInitScript(() => {
      try {
        Object.defineProperty(document, 'referrer', { get: () => '' });
      } catch (e) {}
    });

    return page;
  }

  /* ---------------------------
     Extraction helpers (kept lean)
     --------------------------- */

  private async extractFavicon(
    page: Page,
    baseUrl: string,
  ): Promise<string | null> {
    try {
      return await page.evaluate((base) => {
        const rels = [
          'icon',
          'shortcut icon',
          'apple-touch-icon',
          'apple-touch-icon-precomposed',
          'mask-icon',
        ];
        for (const rel of rels) {
          const el = document.querySelector<HTMLLinkElement>(
            `link[rel='${rel}'], link[rel*='${rel}']`,
          );
          if (el?.href) return el.href;
        }
        try {
          const u = new URL(base);
          return `${u.origin}/favicon.ico`;
        } catch {
          return null;
        }
      }, baseUrl);
    } catch (e) {
      this.logger.warn('extractFavicon failed', (e as Error).message);
      return null;
    }
  }

  private async extractJsonLd(page: Page): Promise<Record<string, any>[]> {
    try {
      return await page.evaluate(() => {
        const list: Record<string, any>[] = [];
        document
          .querySelectorAll('script[type="application/ld+json"]')
          .forEach((s) => {
            try {
              const parsed = JSON.parse(s.textContent || '');
              if (Array.isArray(parsed)) list.push(...parsed);
              else list.push(parsed);
            } catch {}
          });
        return list;
      });
    } catch (e) {
      this.logger.warn('extractJsonLd failed', (e as Error).message);
      return [];
    }
  }

  private async extractLanguageInfo(page: Page): Promise<{
    lang: string;
    locale: string;
    alternates: Array<{ lang: string; url: string }>;
  }> {
    try {
      return await page.evaluate(() => {
        const html = document.documentElement;
        const lang =
          html.getAttribute('lang') ||
          html.getAttribute('xml:lang') ||
          'unknown';
        const locale =
          document
            .querySelector('meta[property="og:locale"]')
            ?.getAttribute('content') || 'unknown';
        const alternates: Array<{ lang: string; url: string }> = [];
        document
          .querySelectorAll('link[rel="alternate"][hreflang]')
          .forEach((l) => {
            const hreflang = l.getAttribute('hreflang');
            const href = l.getAttribute('href');
            if (hreflang && href)
              alternates.push({ lang: hreflang, url: href });
          });
        return { lang, locale, alternates };
      });
    } catch (e) {
      this.logger.warn('extractLanguageInfo failed', (e as Error).message);
      return { lang: 'unknown', locale: 'unknown', alternates: [] };
    }
  }

  private async extractMetaTags(page: Page, url: string): Promise<UrlMetadata> {
    const metaTags = await page.evaluate(() => {
      const tags: Record<string, any> = {};
      const normalize = (s: string | null) =>
        (s || '').replace(/\s+/g, ' ').trim();

      document.querySelectorAll('meta').forEach((m) => {
        const name = (m.getAttribute('name') || '').toLowerCase();
        const prop = (m.getAttribute('property') || '').toLowerCase();
        const content = normalize(m.getAttribute('content'));
        if (!content) return;

        if (prop.startsWith('og:')) tags[prop] = content;
        else if (name.startsWith('twitter:')) tags[name] = content;
        else if (name.includes('keyword') || name === 'news_keywords') {
          tags['keywords'] =
            (tags['keywords'] ? `${tags['keywords']}, ` : '') + content;
        } else if (
          [
            'description',
            'author',
            'robots',
            'copyright',
            'publisher',
            'theme-color',
            'generator',
            'referrer',
          ].includes(name)
        ) {
          tags[name] = content;
        } else if (prop.startsWith('article:') || prop.startsWith('profile:')) {
          tags[prop] = content;
        }
      });

      // Title fallback
      if (!tags['og:title']) {
        const t = document.querySelector('title')?.textContent;
        if (t) tags['og:title'] = normalize(t);
      }

      // Canonical fallback
      const canonical = document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      )?.href;
      if (canonical) tags['canonical'] = canonical;

      return tags;
    });

    // run parallel extraction that may fail independently
    const [favicon, jsonLd, langInfo] = await Promise.allSettled([
      this.extractFavicon(page, url),
      this.extractJsonLd(page),
      this.extractLanguageInfo(page),
    ]);

    return {
      title: metaTags['og:title'] || metaTags['twitter:title'] || url,
      url: metaTags['canonical'] || metaTags['og:url'] || url,
      description:
        metaTags['og:description'] ||
        metaTags['twitter:description'] ||
        metaTags['description'] ||
        'unknown',
      image: metaTags['og:image'] || metaTags['twitter:image'] || null,
      images: {
        og: metaTags['og:image'] || null,
        twitter: metaTags['twitter:image'] || null,
        width: metaTags['og:image:width'] || null,
        height: metaTags['og:image:height'] || null,
        alt: metaTags['og:image:alt'] || null,
        type: metaTags['og:image:type'] || null,
      },
      favicon: favicon.status === 'fulfilled' ? favicon.value : null,
      site_name: metaTags['og:site_name'] || 'unknown',
      type: metaTags['og:type'] || 'website',
      keywords: metaTags['keywords'] || 'unknown',
      author: metaTags['author'] || 'unknown',
      publisher: metaTags['publisher'] || 'unknown',
      copyright: metaTags['copyright'] || 'unknown',
      robots: metaTags['robots'] || 'unknown',
      canonical: metaTags['canonical'] || url,
      generator: metaTags['generator'] || 'unknown',
      language:
        langInfo.status === 'fulfilled' ? langInfo.value.lang : 'unknown',
      locale:
        metaTags['og:locale'] ||
        (langInfo.status === 'fulfilled' ? langInfo.value.locale : 'unknown'),
      locale_alternates:
        metaTags['og:locale:alternate'] ||
        (langInfo.status === 'fulfilled' ? langInfo.value.alternates : []),
      published_time: metaTags['article:published_time'] || null,
      modified_time: metaTags['article:modified_time'] || null,
      twitter_card: metaTags['twitter:card'] || null,
      twitter_site: metaTags['twitter:site'] || null,
      twitter_creator: metaTags['twitter:creator'] || null,
      article_section: metaTags['article:section'] || null,
      article_tag: metaTags['article:tag'] || null,
      video: metaTags['video'] || null,
      audio: metaTags['audio'] || null,
      feeds: metaTags['feeds'] || null,
      jsonLd: jsonLd.status === 'fulfilled' ? jsonLd.value : null,
      theme_color: metaTags['theme-color'] || null,
      mobile_capable: metaTags['mobile-web-app-capable'] || null,
      rating: metaTags['rating'] || null,
      referrer: metaTags['referrer'] || null,
    } as UrlMetadata;
  }

  /* ---------------------------
     Public API
     --------------------------- */

  public async fetchMetadata(
    url: string,
    options: ScraperOptions = {},
  ): Promise<UrlMetadata> {
    let page: Page | null = null;
    try {
      page = await this.newPage(options);

      const timeout = options.timeout ?? 15000;

      // Navigate
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

      // Optional small wait for SPA hydration if JS enabled
      if (
        options.enableJavaScript !== false &&
        options.waitForDynamic !== false
      ) {
        await page.waitForTimeout(800);
      }

      const metadata = await this.extractMetaTags(page, url);
      this.logger.log(`Scraped metadata: ${url}`);
      return metadata;
    } catch (err) {
      if (err instanceof errors.TimeoutError) {
        this.logger.warn(`Timeout scraping ${url}: ${(err as Error).message}`);
        throw new Error(`Timeout: ${(err as Error).message}`);
      }
      this.logger.error(`Error scraping ${url}: ${(err as Error).message}`);
      throw err;
    } finally {
      if (page) {
        const context = page.context();
        try {
          await context.close();
        } catch {}
      }
    }
  }

  public async fetchMetadataBatch(
    urls: string[],
    concurrency = 3,
    options: ScraperOptions = {},
  ) {
    const results: Array<{
      url: string;
      metadata?: UrlMetadata;
      error?: string;
    }> = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const settled = await Promise.allSettled(
        batch.map((u) => this.fetchMetadata(u, options)),
      );
      settled.forEach((s, idx) => {
        if (s.status === 'fulfilled')
          results.push({ url: batch[idx], metadata: s.value });
        else
          results.push({
            url: batch[idx],
            error: (s.reason as Error).message || 'unknown',
          });
      });
      if (i + concurrency < urls.length)
        await new Promise((r) => setTimeout(r, 100));
    }
    return results;
  }

  public static async closeSharedBrowser(): Promise<void> {
    if (UrlMetadataService.sharedBrowser) {
      await UrlMetadataService.sharedBrowser.close().catch(() => {});
      UrlMetadataService.sharedBrowser = null;
    }
  }
}
