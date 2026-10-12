import assert from 'node:assert/strict';
import test from 'node:test';
import { correctVerifiedJobs, preserveVerifiedJobAliases, AXIOM_FULLSTACK_ID, AXIOM_FULLSTACK_LINK, AXIOM_TRADING_COMPANY } from '../src/lib/verified-job-corrections';
import { getJobContentKey, type LegacySlugRecord } from '../src/lib/job-slugs';
import { findLiveJobForArchived } from '../src/lib/job-guides';
import { buildCompaniesFromJobs } from '../src/lib/companies';
import { buildCompanyLogoMapSync } from '../src/lib/job-logo-map';
import type { Job } from '../src/types';

const canonical: Job = { id: AXIOM_FULLSTACK_ID, title: 'Fullstack Engineer', company: 'Axiom', link: AXIOM_FULLSTACK_LINK, slug: 'fullstack26', date: new Date(Date.now() - 86400000).toISOString(), source: 'Superteam: Axiom [superteam]' };
const duplicate: Job = { ...canonical, title: 'Fullstack Engineerv', slug: 'fs4', link: AXIOM_FULLSTACK_LINK.replace('engineer-at', 'engineerv-at') };

test('verified duplicate correction is deterministic and preserves the canonical URL and description key', () => {
  const first = correctVerifiedJobs([canonical, duplicate]);
  assert.deepEqual(correctVerifiedJobs([duplicate, canonical]), first);
  assert.deepEqual(correctVerifiedJobs(first), first);
  assert.equal(first.length, 1); assert.equal(first[0].slug, 'fullstack26');
  assert.equal(first[0].company, AXIOM_TRADING_COMPANY);
  assert.equal(getJobContentKey(first[0]), getJobContentKey(canonical));
  const unrelated = { ...canonical, link: 'https://example.com/jobs/other' };
  assert.deepEqual(correctVerifiedJobs([unrelated]), [unrelated]);
});

test('fs4 remains an alias without overwriting the unrelated historical fullstack26 record', () => {
  const historical: LegacySlugRecord = { id: 'another-id', company: 'GoMining', title: 'Historical role', link: 'https://apply.workable.com/j/B1EB54CF65' };
  const archive = { fullstack26: historical } as Record<string, LegacySlugRecord>;
  const jobs = correctVerifiedJobs([canonical, duplicate]);
  assert.equal(preserveVerifiedJobAliases(jobs, archive), true);
  assert.equal(preserveVerifiedJobAliases(jobs, archive), false);
  assert.deepEqual(archive.fullstack26, historical);
  assert.equal(findLiveJobForArchived(archive.fs4, jobs), jobs[0]);
  assert.equal(archive.fs4.newSlug, 'fullstack26');
});

test('trading roles cannot inherit the unrelated coprocessor website, description or guessed favicon', () => {
  const jobs = correctVerifiedJobs([canonical, duplicate]);
  const [company] = buildCompaniesFromJobs(jobs, { axiom: { website: 'https://axiom.xyz', description: 'Ethereum coprocessor' } });
  assert.equal(company.slug, 'axiom-onchain-trading'); assert.equal(company.website, '');
  assert.doesNotMatch(company.description, /coprocessor/);
  assert.deepEqual(buildCompanyLogoMapSync(jobs)['axiom-onchain-trading'], { logo: null, favicon: null });
});
