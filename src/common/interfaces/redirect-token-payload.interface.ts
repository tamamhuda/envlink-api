export interface RedirectTokenPayload {
  slug: string;
  event: 'IMPRESSION' | 'CLICK';
  redirectUrl: string;
  iat: number;
  exp: number;
}
