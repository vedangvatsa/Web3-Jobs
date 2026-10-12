import { normalizeJobLink } from '../../src/lib/job-slugs.ts';

const greenhouseHosts = new Set(['boards.greenhouse.io', 'job-boards.greenhouse.io']);

export function trustedApplicationIdentity(url) {
  let id, tenant, detail = true;
  const pathname = url.pathname.replace(/\/$/, '');
  if (greenhouseHosts.has(url.hostname)) {
    const match = /^\/([a-zA-Z0-9_-]+)\/jobs\/(\d+)$/.exec(pathname);
    if (!match) return null;
    [, tenant, id] = match;
    tenant = `greenhouse-board:${tenant.toLowerCase()}`;
  } else if (url.hostname === 'stripe.com') {
    id = /^\/careers\/listing\/[a-z0-9-]+\/(\d+)$/.exec(pathname)?.[1];
    if (!id && ['/jobs/search', '/careers/search/redirect'].includes(pathname)) {
      id = url.searchParams.get('gh_jid'); detail = false;
    }
    tenant = 'stripe.com';
  } else if (url.hostname === 'www.coinbase.com') {
    id = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?careers\/positions\/(\d+)$/.exec(pathname)?.[1];
    tenant = 'www.coinbase.com';
  } else if (url.hostname === 'block.xyz') {
    id = /^\/careers\/jobs\/(\d+)$/.exec(pathname)?.[1];
    tenant = 'block.xyz';
  } else if (url.hostname === 'www.fireblocks.com') {
    id = /^\/careers\/positions\/(\d+)$/.exec(pathname)?.[1];
    if (!id && pathname === '/careers/position') { id = url.searchParams.get('gh_jid'); detail = false; }
    tenant = 'www.fireblocks.com';
  }
  if (!tenant || !/^\d+$/.test(id || '')) return null;
  const queries = url.searchParams.getAll('gh_jid');
  if (queries.length > 1 || queries.some(value => value !== id)) throw new Error('Employer application unverified: conflicting ATS identifiers');
  // The repository's deduplication normalizer accepts gh_jid on any host.
  // Publishing uses it only after the official host, route and tenant checks.
  const identity = normalizeJobLink(`https://boards.greenhouse.io/verified/jobs/${id}`);
  return { id, identity, tenant, detail };
}

export function sameApplicationIdentity(first, second) {
  return Boolean(first && second && first.identity === second.identity && first.tenant === second.tenant);
}

export function isGreenhouseBoardHost(url) {
  return greenhouseHosts.has(url.hostname);
}
