import type { GrantProgram } from '@/types';

export function normalizeGrantLabel(text: string): string {
  return text
    .replace(/\s+(for Startups|Grants? Program|Grants?|Foundation|Ecosystem Fund)$/i, '')
    .trim()
    .toLowerCase();
}

/** True when the title already carries the provider name (common on grant listings). */
export function isGrantProviderRedundant(name: string, provider: string): boolean {
  const providerText = provider.trim();
  if (!providerText) return true;

  const nameNorm = normalizeGrantLabel(name);
  const providerNorm = normalizeGrantLabel(providerText);
  return (
    providerNorm === nameNorm ||
    name.toLowerCase().includes(providerText.toLowerCase()) ||
    providerText.toLowerCase().includes(name.toLowerCase())
  );
}

function grantEcosystem(grant: GrantProgram): string {
  const eco = (grant.ecosystem || '').trim();
  if (!eco || eco === 'Other' || eco === 'Global') return '';
  return eco;
}

function dedupeMetaParts(parts: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const key = normalizeGrantLabel(part);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out;
}

/** One-line metadata under the grant title on detail pages. */
export function formatGrantDetailSubtitle(grant: GrantProgram): string {
  const name = grant.name.trim();
  const provider = (grant.provider || '').trim();
  const category = (grant.category || '').trim();
  const type = (grant.type || '').trim();
  const ecosystem = grantEcosystem(grant);

  const parts: string[] = [];
  if (provider && !isGrantProviderRedundant(name, provider)) {
    parts.push(provider);
  }
  if (category) parts.push(category);
  if (ecosystem) parts.push(ecosystem);
  if (type) parts.push(type);

  return dedupeMetaParts(parts).join(' · ');
}