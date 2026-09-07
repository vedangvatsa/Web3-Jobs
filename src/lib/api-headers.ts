// Standard headers shared by all public /api routes (CORS + content type + versioning + rate limit).
// Implements RFC 6585 / draft-ietf-httpapi-ratelimit-headers and Sunset/Deprecation per RFC 8594.

const API_VERSION = '1.0.0';
const DEPRECATION_TS = '@1767225600'; // Dec 31 2026 deprecation declaration, 12mo notice per developers portal
const SUNSET_DATE = 'Wed, 31 Dec 2026 23:59:59 GMT';

export function getStandardApiHeaders(opts?: { remaining?: number; reset?: number }): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, MCP-Protocol-Version, Idempotency-Key',
    'Content-Type': 'application/json',
    'API-Version': API_VERSION,
    'Deprecation': DEPRECATION_TS,
    'Sunset': SUNSET_DATE,
  };

  if (opts && opts.remaining !== undefined) {
    const remaining = opts.remaining;
    const reset = opts.reset ?? 60;
    headers['RateLimit'] = `limit=120, remaining=${remaining}, reset=${reset}`;
    headers['RateLimit-Limit'] = '120';
    headers['RateLimit-Remaining'] = String(remaining);
    headers['RateLimit-Reset'] = String(reset);
    headers['RateLimit-Policy'] = '120;w=60';
    headers['X-RateLimit-Limit'] = '120';
    headers['X-RateLimit-Remaining'] = String(remaining);
    headers['X-RateLimit-Reset'] = String(reset);
  }

  return headers;
}

export function getRateLimitHeadersFor429(retryAfterSec = 60): Record<string, string> {
  return {
    ...getStandardApiHeaders({ remaining: 0, reset: retryAfterSec }),
    'Retry-After': String(retryAfterSec),
  };
}
