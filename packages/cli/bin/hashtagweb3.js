#!/usr/bin/env node

/**
 * Hashtag Web3 CLI — reads static /data/* catalogs (same as the website).
 */

const API_BASE = (process.env.HASHTAGWEB3_API_URL || 'https://hashtagweb3.com').replace(/\/+$/, '');

async function fetchCatalog(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`);
  }
  return res.json();
}

function parseArgs(argv) {
  const params = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      params[key] = val;
    }
  }
  return params;
}

function paginate(items, params) {
  const limit = Math.min(200, Math.max(1, parseInt(String(params.limit || '50'), 10) || 50));
  const offset = Math.max(0, parseInt(String(params.offset || '0'), 10) || 0);
  return { slice: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const params = parseArgs(args.slice(1));

  switch (command) {
    case 'jobs': {
      const raw = await fetchCatalog('/data/jobs-runtime.json');
      const all = Array.isArray(raw) ? raw : raw.jobs || [];
      let filtered = all.filter((j) => j.active !== false);
      const search = String(params.search || params.q || '').toLowerCase().trim();
      const tag = String(params.tag || '').toLowerCase().trim();
      const company = String(params.company || '').toLowerCase().trim();
      if (search) {
        filtered = filtered.filter(
          (j) =>
            j.title?.toLowerCase().includes(search) ||
            j.company?.toLowerCase().includes(search) ||
            j.location?.toLowerCase().includes(search),
        );
      }
      if (tag) {
        filtered = filtered.filter((j) =>
          (Array.isArray(j.tags) ? j.tags : []).some((t) => String(t).toLowerCase().includes(tag)),
        );
      }
      if (company) {
        filtered = filtered.filter((j) => j.company?.toLowerCase().includes(company));
      }
      const { slice, total } = paginate(filtered, params);
      console.log(`\nFound ${total} jobs (showing ${slice.length}):\n`);
      for (const [idx, j] of slice.entries()) {
        const link = j.slug ? `${API_BASE}/${j.slug}` : j.link;
        console.log(`${idx + 1}. \x1b[36m${j.title}\x1b[0m at \x1b[32m${j.company}\x1b[0m`);
        if (j.salary) console.log(`   Salary: ${j.salary}`);
        console.log(`   Link: ${link}\n`);
      }
      break;
    }

    case 'news': {
      const raw = await fetchCatalog('/data/news-cache.json');
      let items = Array.isArray(raw) ? raw : raw.items || [];
      const search = String(params.search || params.q || '').toLowerCase().trim();
      if (search) {
        items = items.filter(
          (n) =>
            n.title?.toLowerCase().includes(search) ||
            n.contentSnippet?.toLowerCase().includes(search),
        );
      }
      const { slice } = paginate(items, params);
      console.log(`\nLatest Web3 & Crypto News (${slice.length} articles):\n`);
      slice.forEach((n, idx) => {
        console.log(`${idx + 1}. \x1b[1m${n.title}\x1b[0m`);
        console.log(`   Source: ${n.source || 'News'} | Link: ${n.link}\n`);
      });
      break;
    }

    case 'events': {
      const raw = await fetchCatalog('/data/events-runtime.json');
      let items = Array.isArray(raw) ? raw : raw.events || [];
      const search = String(params.search || params.q || '').toLowerCase().trim();
      const type = String(params.type || '').toLowerCase().trim();
      const country = String(params.country || '').toLowerCase().trim();
      if (search) {
        items = items.filter(
          (e) =>
            e.name?.toLowerCase().includes(search) ||
            e.location?.toLowerCase().includes(search),
        );
      }
      if (type) {
        items = items.filter((e) => String(e.type || e.eventType || '').toLowerCase().includes(type));
      }
      if (country) {
        items = items.filter((e) => String(e.country || e.location || '').toLowerCase().includes(country));
      }
      const { slice } = paginate(items, params);
      console.log(`\nUpcoming Web3 Events (${slice.length} events):\n`);
      slice.forEach((e, idx) => {
        const url = e.slug ? `${API_BASE}/${e.slug}` : e.url || e.link;
        console.log(`${idx + 1}. \x1b[36m${e.name}\x1b[0m (${e.startDate || 'Upcoming'})`);
        console.log(`   Location: ${e.location || 'Online'}`);
        console.log(`   Link: ${url}\n`);
      });
      break;
    }

    case 'glossary': {
      const raw = await fetchCatalog('/data/glossary-runtime.json');
      let items = Array.isArray(raw) ? raw : [];
      const search = String(params.search || params.q || '').toLowerCase().trim();
      const category = String(params.category || '').toLowerCase().trim();
      if (search) {
        items = items.filter(
          (t) =>
            t.term?.toLowerCase().includes(search) ||
            t.description?.toLowerCase().includes(search) ||
            t.slug?.toLowerCase().includes(search),
        );
      }
      if (category) {
        items = items.filter((t) => String(t.category || '').toLowerCase().includes(category));
      }
      const { slice } = paginate(items, params);
      console.log(`\nWeb3 Glossary Terms (${slice.length} matches):\n`);
      slice.forEach((t, idx) => {
        const url = t.slug ? `${API_BASE}/${t.slug}` : `${API_BASE}/glossary/${t.slug}`;
        console.log(`${idx + 1}. \x1b[33m${t.term}\x1b[0m [${t.category}]`);
        console.log(`   ${t.description?.slice(0, 160) || ''}`);
        console.log(`   Read more: ${url}\n`);
      });
      break;
    }

    case 'help':
    default:
      console.log(`
\x1b[1mHashtag Web3 Official CLI\x1b[0m
https://hashtagweb3.com

Reads static catalogs under /data/* (filter client-side).

Commands:
  jobs      (--search, --tag, --company, --limit, --offset)
  news      (--search, --limit)
  events    (--search, --type, --country, --limit)
  glossary  (--search, --category, --limit)
  help

Examples:
  npx hashtagweb3 jobs --search "Solidity" --limit 10
  npx hashtagweb3 events --type conference
`);
      break;
  }
}

main().catch((err) => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});
