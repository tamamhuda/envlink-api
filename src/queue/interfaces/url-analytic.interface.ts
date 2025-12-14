export interface UrlAnalyticJob {
  eventType: 'CLICK' | 'IMPRESSION';
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  urlCode: string;
}
