import { Request } from 'express';

export function getClientIp(req: Request): string {
  // X-Forwarded-For may contain multiple IPs (client, proxy1, proxy2)
  let ip = req.headers['x-forwarded-for'] as string | undefined;

  if (ip) {
    ip = ip.split(',')[0].trim();
  } else {
    ip = req.ip || req.socket.remoteAddress || '-';
  }

  // Normalize localhost / IPv4-mapped IPv6
  if (ip === '::1') ip = '127.0.0.1';
  else if (ip.startsWith('::ffff:')) ip = ip.substring(7);

  return ip;
}
