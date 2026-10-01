const RETIRED_API = /^\/api\/(?:jobs|events|companies|glossary|news|v1|mcp|og|auth|sandbox|session)(?:\/|$)/;
const PROBE_PATH = /(?:^|\/)\.env(?:[./]|$)|^\/(?:wp-admin|wp-content|wp-includes|wp-json)(?:\/|$)|\.(?:php|asp|aspx)(?:\/|$)/i;

export function isRetiredOrProbePath(pathname: string): boolean {
  return RETIRED_API.test(pathname) || PROBE_PATH.test(pathname);
}
