import { Request } from 'express';

export interface UrlAnalyticJob {
  ipAddress: string;
  userAgent: string;
  referrer: string;
  urlCode: string;
}
