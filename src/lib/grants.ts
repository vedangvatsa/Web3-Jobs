import fs from 'fs';
import path from 'path';
import type { GrantProgram } from '@/types';

const GRANTS_FILE_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');

let cachedGrants: GrantProgram[] | null = null;

export function getGrantsSync(): GrantProgram[] {
  if (cachedGrants) {
    return cachedGrants;
  }

  try {
    const fileContents = fs.readFileSync(GRANTS_FILE_PATH, 'utf-8');
    const data: GrantProgram[] = JSON.parse(fileContents);
    cachedGrants = data;
    return data;
  } catch (err) {
    console.error('Error reading grants file:', err);
    return [];
  }
}

export async function getGrants(): Promise<GrantProgram[]> {
  return getGrantsSync();
}

export {
  getGrantsCount,
  getGrantsCountPlusLabel,
  getGrantsOgDiscoverDescription,
  getGrantsPageDiscoverDescription,
  getGrantsSitelinkDescription,
} from '@/lib/grant-count';

import legacySlugsJson from '../../content/grants/legacy-slugs.json';

const legacySlugs = legacySlugsJson as Record<string, string>;

export function getGrantById(id: string): GrantProgram | undefined {
  const all = getGrantsSync();
  const direct = all.find((g) => g.id.toLowerCase() === id.toLowerCase());
  if (direct) return direct;

  const target = legacySlugs[id.toLowerCase()];
  if (target) {
    return all.find((g) => g.id.toLowerCase() === target.toLowerCase());
  }

  return undefined;
}

export function getRelatedGrants(current: GrantProgram, count = 3): GrantProgram[] {
  const all = getGrantsSync();
  const others = all.filter((g) => g.id !== current.id);

  // 1. Same ecosystem matches
  const sameEcosystem = current.ecosystem && current.ecosystem !== 'Other' && current.ecosystem !== 'Global'
    ? others.filter((g) => g.ecosystem === current.ecosystem)
    : [];

  // 2. Same category matches
  const sameCategory = others.filter((g) => g.category === current.category && !sameEcosystem.includes(g));

  // 3. Fallbacks
  const combined = [...sameEcosystem, ...sameCategory, ...others];
  const unique = Array.from(new Set(combined));
  return unique.slice(0, count);
}

export function getGrantStats(grants: GrantProgram[]) {
  const total = grants.length;
  let web3Count = 0;
  let creditsCount = 0;
  let globalCount = 0;
  let regionalCount = 0;
  let toolingCount = 0;

  for (const g of grants) {
    if (g.category === 'Web3 Ecosystem') web3Count++;
    else if (g.category === 'Cloud & AI Credits') creditsCount++;
    else if (g.category === 'Global Tech & Open Source') globalCount++;
    else if (g.category === 'Regional & Govt Grants') regionalCount++;
    else if (g.category === 'Developer Infra & Tooling') toolingCount++;
  }

  return {
    total,
    web3Count,
    creditsCount,
    globalCount,
    regionalCount,
    toolingCount,
  };
}
