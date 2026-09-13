type EventUrlFields = {
  registrationUrl?: string;
  website?: string | null;
  url: string;
};

const EVENT_AGGREGATOR_HOSTS = [
  'conferenceindex.org',
  'web3voyager.com',
  'marketacross.com',
  'deeptechtimes.com',
  'coinmarketcap.com',
  'dev.events',
  'cloud.google.com',
] as const;

const URL_SHORTENER_HOSTS = [
  'bit.ly', 'bitly.com', 't.co', 'tinyurl.com', 'tiny.cc', 'ow.ly', 'buff.ly', 'is.gd',
  'v.gd', 'trib.al', 'shorturl.at', 'rebrand.ly', 'rb.gy', 'cutt.ly', 'cutt.us', 'tiny.one',
  'lnkd.in', 'goo.gl', 'adf.ly', 'bc.vc', 'clck.ru', 'shorte.st', 'qrco.de', 'short.cm',
  'shrtco.de', '1url.com', 's.id', 'short.io', 'bl.ink',
] as const;

function normalizeUrlHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.+$/, '').replace(/^www\./, '');
}

function isHostOrSubdomain(hostname: string, candidate: string): boolean {
  return hostname === candidate || hostname.endsWith(`.${candidate}`);
}

function isEthereumCommunityIndex(hostname: string, pathname: string): boolean {
  return isHostOrSubdomain(hostname, 'ethereum.org')
    && pathname.toLowerCase().startsWith('/community/events');
}

/** Returns the preferred direct event destination, never an index or URL shortener. */
export function getEventExternalUrl(event: EventUrlFields): string | undefined {
  for (const candidate of [event.registrationUrl, event.website, event.url]) {
    if (!candidate || !candidate.trim()) continue;

    try {
      const parsed = new URL(candidate.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue;

      const hostname = normalizeUrlHostname(parsed.hostname);
      if (
        EVENT_AGGREGATOR_HOSTS.some((host) => isHostOrSubdomain(hostname, host))
        || URL_SHORTENER_HOSTS.some((host) => isHostOrSubdomain(hostname, host))
        || isEthereumCommunityIndex(hostname, parsed.pathname)
      ) {
        continue;
      }

      return parsed.toString();
    } catch {
      continue;
    }
  }

  return undefined;
}
