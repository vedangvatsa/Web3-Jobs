// Standard headers shared by all public /api routes (CORS + content type + versioning + rate limit).
// Implements RFC 6585 / draft-ietf-httpapi-ratelimit-headers and Sunset/Deprecation per RFC 8594.

const API_VERSION = '1.0.0';
const DEPRECATION_TS = '@1767225600'; // Dec 31 2026 deprecation declaration, 12mo notice per developers portal
const SUNSET_DATE = 'Wed, 31 Dec 2026 23:59:59 GMT';

export function getStandardApiHeaders(opts?: { remaining?: number; reset?: number }): Record<string, string> {
  const remaining = opts?.remaining ?? 119;
  const reset = opts?.reset ?? 60;
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, MCP-Protocol-Version',
    'Access-Control-Expose-Headers': 'RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Deprecation, Sunset',
    'Content-Type': 'application/json',
    'API-Version': API_VERSION,
    'Deprecation': DEPRECATION_TS,
    'Sunset': SUNSET_DATE,
    'RateLimit-Limit': '120',
    'RateLimit-Remaining': String(remaining),
    'RateLimit-Reset': String(reset),
    'RateLimit-Policy': '120;w=60',
  };
}

export function getRateLimitHeadersFor429(retryAfterSec = 60): Record<string, string> {
  return {
    ...getStandardApiHeaders({ remaining: 0, reset: retryAfterSec }),
    'Retry-After': String(retryAfterSec),
  };
}
