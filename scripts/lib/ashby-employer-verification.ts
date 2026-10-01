import identitiesJson from '../../content/ashby-employer-identities.json';
import { atsBoardKey } from '../../src/lib/ats-board-identity';
import { assertAtsSourceAllowed } from '../../src/lib/job-source-policy';

type EmployerIdentity = { companies: string[]; organizationId: string | null; owner: string | null; website: string | null };
export const ASHBY_EMPLOYER_IDENTITIES: Readonly<Record<string, EmployerIdentity>> = identitiesJson;

export function assertReviewedAshbyEmployer(board: string, company: string): EmployerIdentity {
  assertAtsSourceAllowed('ashby', board);
  const key = atsBoardKey('ashby', board);
  const identity = ASHBY_EMPLOYER_IDENTITIES[key];
  if (!identity || !identity.companies.some(name => name.toLowerCase().trim() === company.toLowerCase().trim())) {
    throw new Error(`Unreviewed Ashby employer mapping: ${board} → ${company}. Verify the official careers link and organization identity first.`);
  }
  return identity;
}

export function validateAshbyOrganization(board: string, company: string, organization: { organizationId?: string }): void {
  const identity = assertReviewedAshbyEmployer(board, company);
  if (!identity.organizationId || organization.organizationId !== identity.organizationId) {
    throw new Error(`Ashby employer identity unavailable or changed for ${board} → ${company}; preserving the previous snapshot.`);
  }
}

const verified = new Map<string, Promise<void>>();
export async function verifyAshbyEmployer(board: string, company: string): Promise<void> {
  assertReviewedAshbyEmployer(board, company);
  const key = `${atsBoardKey('ashby', board)}:${company.toLowerCase().trim()}`;
  let verification = verified.get(key);
  if (!verification) {
    verification = (async () => {
      const response = await fetch(`https://jobs.ashbyhq.com/${encodeURIComponent(decodeURIComponent(board))}`, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`Ashby identity HTTP ${response.status}: ${board}`);
      const match = (await response.text()).match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
      if (!match) throw new Error(`Missing Ashby employer identity: ${board}`);
      const data = JSON.parse(match[1]) as { organization?: { organizationId?: string } };
      validateAshbyOrganization(board, company, data.organization || {});
    })();
    verified.set(key, verification);
  }
  await verification;
}
