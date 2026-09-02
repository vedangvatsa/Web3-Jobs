#!/usr/bin/env node

/**
 * Hashtag Web3 CLI
 * Usage: npx hashtagweb3 <command> [options]
 * Examples:
 *   npx hashtagweb3 jobs --search "Solidity"
 *   npx hashtagweb3 news --limit 5
 *   npx hashtagweb3 events --type conference
 *   npx hashtagweb3 glossary --search "Zero Knowledge"
 */

const API_BASE = process.env.HASHTAGWEB3_API_URL || 'https://hashtagweb3.com';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const params = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      params[key] = val;
    }
  }

  const query = new URLSearchParams(params).toString();

  switch (command) {
    case 'jobs': {
      const url = `${API_BASE}/api/jobs${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        console.error('Error:', json.error || json);
        process.exit(1);
      }
      console.log(`\nFound ${json.meta.total} jobs (showing ${json.data.length}):\n`);
      json.data.forEach((j, idx) => {
        console.log(`${idx + 1}. \x1b[36m${j.title}\x1b[0m at \x1b[32m${j.company}\x1b[0m`);
        if (j.salary) console.log(`   Salary: ${j.salary}`);
        console.log(`   Link: ${j.link}\n`);
      });
      break;
    }

    case 'news': {
      const url = `${API_BASE}/api/news${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        console.error('Error:', json.error || json);
        process.exit(1);
      }
      console.log(`\nLatest Web3 & Crypto News (${json.data.length} articles):\n`);
      json.data.forEach((n, idx) => {
        console.log(`${idx + 1}. \x1b[1m${n.title}\x1b[0m`);
        console.log(`   Source: ${n.source} | Link: ${n.link}\n`);
      });
      break;
    }

    case 'events': {
      const url = `${API_BASE}/api/events${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        console.error('Error:', json.error || json);
        process.exit(1);
      }
      console.log(`\nUpcoming Web3 Events & Conferences (${json.data.length} events):\n`);
      json.data.forEach((e, idx) => {
        console.log(`${idx + 1}. \x1b[36m${e.name}\x1b[0m (${e.startDate || 'Upcoming'})`);
        console.log(`   Location: ${e.location || 'Online'}`);
        console.log(`   Link: ${e.url}\n`);
      });
      break;
    }

    case 'glossary': {
      const url = `${API_BASE}/api/glossary${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        console.error('Error:', json.error || json);
        process.exit(1);
      }
      console.log(`\nWeb3 Glossary Terms (${json.data.length} matches):\n`);
      json.data.forEach((t, idx) => {
        console.log(`${idx + 1}. \x1b[33m${t.term}\x1b[0m [${t.category}]`);
        console.log(`   ${t.definition}`);
        console.log(`   Read more: ${t.url}\n`);
      });
      break;
    }

    case 'help':
    default:
      console.log(`
\x1b[1mHashtag Web3 Official CLI\x1b[0m
https://hashtagweb3.com

Commands:
  jobs      Search Web3 job listings (--search, --tag, --company, --limit, --offset)
  news      Fetch aggregated crypto industry news (--search, --limit)
  events    Browse Web3 conferences and hackathons (--search, --type, --country, --limit)
  glossary  Search 200+ blockchain glossary definitions (--search, --category, --limit)
  help      Display this help message

Examples:
  npx hashtagweb3 jobs --search "Solidity" --limit 10
  npx hashtagweb3 events --type conference --country "United States"
  npx hashtagweb3 glossary --search "Zero Knowledge"
`);
      break;
  }
}

main().catch((err) => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});
