export interface CompanySocialLinks {
  linkedin?: string;
  twitter?: string;
  crunchbase?: string;
}

export type CompanySocialsMap = Record<string, CompanySocialLinks>;

function normalizeHost(domainOrUrl: string): string {
  const raw = domainOrUrl.trim().toLowerCase();
  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return raw.replace(/^www\./, '').split('/')[0];
  }
}

function isLinkedInCompanyUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    if (!hostname.includes('linkedin.com')) return false;
    if (pathname.includes('/jobs/')) return false;
    return pathname.includes('/company/') || pathname.startsWith('/school/');
  } catch {
    return false;
  }
}

function isTwitterProfileUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    if (!(hostname.includes('twitter.com') || hostname === 'x.com' || hostname.endsWith('.x.com'))) {
      return false;
    }
    const segment = pathname.split('/').filter(Boolean)[0];
    return Boolean(segment && !['intent', 'share', 'jobs', 'i'].includes(segment));
  } catch {
    return false;
  }
}

function isCrunchbaseOrgUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.includes('crunchbase.com') && pathname.includes('/organization/');
  } catch {
    return false;
  }
}

export function normalizeTwitterUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('twitter.com')) {
      parsed.hostname = 'x.com';
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function pickSocialLinksFromGetro(socials: Record<string, string[] | undefined> | undefined): CompanySocialLinks | undefined {
  if (!socials) return undefined;
  const out: CompanySocialLinks = {};

  for (const raw of socials.linkedin || []) {
    if (typeof raw === 'string' && isLinkedInCompanyUrl(raw)) {
      out.linkedin = raw.split('?')[0];
      break;
    }
  }
  for (const raw of socials.twitter || []) {
    if (typeof raw === 'string' && isTwitterProfileUrl(raw)) {
      out.twitter = normalizeTwitterUrl(raw.split('?')[0]);
      break;
    }
  }
  for (const raw of socials.crunchbase || []) {
    if (typeof raw === 'string' && isCrunchbaseOrgUrl(raw)) {
      out.crunchbase = raw.split('?')[0];
      break;
    }
  }

  return out.linkedin || out.twitter || out.crunchbase ? out : undefined;
}

export function mergeSocialLinks(
  existing: CompanySocialLinks | undefined,
  incoming: CompanySocialLinks | undefined,
): CompanySocialLinks | undefined {
  if (!incoming) return existing;
  if (!existing) return incoming;
  return {
    linkedin: existing.linkedin || incoming.linkedin,
    twitter: existing.twitter || incoming.twitter,
    crunchbase: existing.crunchbase || incoming.crunchbase,
  };
}

export { normalizeHost };
