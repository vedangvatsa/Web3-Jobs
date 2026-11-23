/**
 * Wide ATS discovery: probes slug list, fetches employer metadata, filters likely Web3.
 * Output: .cache/web3-ats-discovery-report.json (human review before adding feeds).
 */
import fs from 'node:fs';

const SRC = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');
const configuredBoards = new Set(
  [...SRC.matchAll(/\{\s*board:\s*['"]([^'"]+)['"]/g)].map((m) => m[1].toLowerCase()),
);

const SLUGS = fs.existsSync('scripts/social/probe-new-ats.py')
  ? [
      ...new Set(
        fs
          .readFileSync('scripts/social/probe-new-ats.py', 'utf8')
          .match(/"([a-z0-9][a-z0-9-]{1,40})"/g)
          ?.map((m) => m.slice(1, -1)) || [],
      ),
    ]
  : [];

const WEB3_HOST_HINTS =
  /crypto|blockchain|web3|defi|bitcoin|ethereum|solana|wallet|token|nft|dao|chain|staking|validator|solidity|layer|rollup|zk|protocol|labs|foundation|digital asset|stablecoin/i;

type Row = {
  provider: string;
  board: string;
  jobs: number;
  employer?: string;
  website?: string;
  web3Hint: boolean;
  alreadyConfigured: boolean;
};

async function ashbyMeta(board: string): Promise<{ jobs: number; employer?: string; website?: string } | null> {
  try {
    const api = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`);
    if (!api.ok) return null;
    const data = (await api.json()) as { jobs?: unknown[] };
    const jobs = data.jobs?.length ?? 0;
    if (!jobs) return { jobs: 0 };
    const page = await fetch(`https://jobs.ashbyhq.com/${encodeURIComponent(board)}`);
    if (!page.ok) return { jobs };
    const match = (await page.text()).match(/window\.__appData\s*=\s*(\{[\s\S]*?\});/);
    if (!match) return { jobs };
    const app = JSON.parse(match[1]) as { organization?: { name?: string; publicWebsite?: string } };
    return {
      jobs,
      employer: app.organization?.name,
      website: app.organization?.publicWebsite,
    };
  } catch {
    return null;
  }
}

async function greenhouseMeta(board: string): Promise<{ jobs: number; employer?: string } | null> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=false`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { name?: string; jobs?: unknown[] };
    return { jobs: data.jobs?.length ?? 0, employer: data.name };
  } catch {
    return null;
  }
}

async function leverMeta(board: string): Promise<{ jobs: number; employer?: string } | null> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(board)}?mode=json`);
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !data.length) return { jobs: 0 };
    const hosted = data[0] as { hostedUrl?: string };
    return { jobs: data.length, website: hosted.hostedUrl, employer: board };
  } catch {
    return null;
  }
}

async function main() {
  const rows: Row[] = [];
  const list = SLUGS.length ? SLUGS : ['nousresearch', 'initia', 'berachain'];

  for (const slug of list) {
    if (configuredBoards.has(slug.toLowerCase())) continue;

    const probes: Array<{
      provider: string;
      run: () => Promise<{ jobs: number; employer?: string; website?: string } | null>;
    }> = [
      { provider: 'ashby', run: () => ashbyMeta(slug) },
      { provider: 'greenhouse', run: () => greenhouseMeta(slug) },
      { provider: 'lever', run: () => leverMeta(slug) },
    ];

    for (const { provider, run } of probes) {
      const meta = await run();
      if (!meta || !meta.jobs) continue;
      const hay = `${meta.employer || ''} ${meta.website || ''} ${slug}`;
      rows.push({
        provider,
        board: slug,
        jobs: meta.jobs,
        employer: meta.employer,
        website: meta.website,
        web3Hint: WEB3_HOST_HINTS.test(hay),
        alreadyConfigured: false,
      });
    }
  }

  const interesting = rows.filter((r) => r.jobs > 0).sort((a, b) => b.jobs - a.jobs);
  fs.mkdirSync('.cache', { recursive: true });
  fs.writeFileSync('.cache/web3-ats-discovery-report.json', JSON.stringify(interesting, null, 2));
  console.log(`Boards with jobs (not in refresh-jobs-cache board strings): ${interesting.length}`);
  for (const r of interesting.filter((x) => x.web3Hint).slice(0, 40)) {
    console.log(
      `  ${r.provider}/${r.board}: ${r.jobs} | ${r.employer || '?'} | ${r.website || ''}`,
    );
  }
}

main();