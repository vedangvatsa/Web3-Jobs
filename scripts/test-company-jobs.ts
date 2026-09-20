import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCompaniesFromJobs, getCompanies, getCompanyBySlug } from '../src/lib/companies';
import { getJobs } from '../src/lib/jobs';
import { getJobContentKey } from '../src/lib/job-slugs';
import { classifySlug } from '../src/lib/slug-classifier';
import type { Job } from '../src/types';

async function main() {
  const jobs = await getJobs();
  const summaries = await getCompanies();
  const precomputed = JSON.parse(fs.readFileSync('content/companies-runtime.json', 'utf8')) as Record<string, { jobCount: number; jobIds: string[] }>;
  const covered = new Set<string>();
  for (const summary of summaries) {
    const company = await getCompanyBySlug(summary.slug);
    assert.equal(classifySlug(summary.slug), 'company', `${summary.slug}: company page must route correctly`);
    assert.ok(company, `${summary.slug}: missing detail page`);
    assert.equal(company.jobCount, company.jobs.length, `${summary.slug}: visible count differs from rendered cards`);
    assert.equal(summary.jobCount, company.jobs.length, `${summary.slug}: directory and detail count differ`);
    assert.ok(company.jobs.length > 0, `${summary.slug}: count without jobs`);
    const generated = precomputed[company.slug];
    assert.ok(generated, `${company.slug}: generated company missing`);
    assert.equal(generated.jobCount, company.jobs.length);
    assert.deepEqual(generated.jobIds, company.jobs.map(job => job.id || job.slug || job.link));
    for (const job of company.jobs) {
      assert.notEqual(job.active, false);
      assert.ok(job.slug, `${company.slug}: job has no URL`);
      const key = getJobContentKey(job);
      assert.ok(!covered.has(key), `${job.slug}: assigned to multiple companies`);
      covered.add(key);
    }
  }
  assert.equal(covered.size, jobs.length, 'Every current job must be linked from a company page');
  const sample: Job = { id: 'one', slug: 'one', title: 'Engineer', company: 'OP Labs', link: 'https://example.com/one', source: 'test', date: '2026-09-20' };
  const fixture = buildCompaniesFromJobs([sample, { ...sample, id: 'retired', active: false }], {});
  assert.equal(fixture[0].name, 'Optimism');
  assert.equal(fixture[0].jobCount, 1);
  assert.equal(fixture[0].jobs[0].slug, 'one');
  console.log(`Company pages passed: ${summaries.length} companies, ${covered.size} active jobs, zero count/list mismatches.`);
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
