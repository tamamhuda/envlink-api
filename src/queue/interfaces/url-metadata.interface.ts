export interface UrlMetadata {
  title?: string;
  url: string;
  description?: string;
  image?: string;
  favicon?: string;
  site_name?: string;
  keywords?: string;
  type?: string;
  robots?: string;
  author?: string;
  [metadata: string]: any;
}

export interface UrlMetadataJob {
  urlId: string;
}

export interface UrlMetadataV2 {
  // Core identity
  url: string;
  canonical: string | null;

  // SEO + preview
  title: string | null;
  description: string | null;
  siteName: string | null;

  // Media
  image: string | null;
  favicon: string | null;

  // Classification
  type: string | null; // article, website, video, product, etc.
  language: string | null; // en_US

  // Author + Time
  author: string | null;
  publishedAt: string | null;
  modifiedAt: string | null;

  // Social
  twitterCard: string | null;
  twitterSite: string | null;

  // SEO directives
  robots: string | null;

  // Tags
  keywords: string[] | null;

  // System attributes
  fetchedAt: string; // timestamp when metadata was last extracted
  source: 'og' | 'twitter' | 'jsonld' | 'mixed';
}
