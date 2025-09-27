import { Request } from 'express';

export function getClientIp(req: Request): string {
  // First check x-forwarded-for (if behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];

  const ip =
    typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

  // Normalize common localhost/IPv6 cases
  if (ip === '::1') return '127.0.0.1';
  if (ip?.startsWith('::ffff:')) return ip.substring(7); // ::ffff:127.0.0.1 → 127.0.0.1

  return ip ?? '-';
}
