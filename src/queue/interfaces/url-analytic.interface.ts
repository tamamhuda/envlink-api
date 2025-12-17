import { AnalyticType } from 'src/common/enums/analytic-type.enum';

export interface UrlAnalyticJob {
  type: AnalyticType;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  slug: string;
}
