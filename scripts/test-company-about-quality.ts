import assert from 'node:assert/strict';
import companies from '../content/companies-runtime.json';
import { COMPANY_ABOUT_MIN_CHARS } from '../src/lib/companies';

const failures: { slug: string; len: number; jobs: number }[] = [];
for (const [slug, row] of Object.entries(companies)) {
  if ((row as { jobCount?: number }).jobCount === 0) continue;
  const len = ((row as { description?: string }).description || '').length;
  if (len < COMPANY_ABOUT_MIN_CHARS) {
    failures.push({
      slug,
      len,
      jobs: (row as { jobCount?: number }).jobCount ?? 0,
    });
  }
}

assert.equal(
  failures.length,
  0,
  `Companies with active jobs need at least ${COMPANY_ABOUT_MIN_CHARS} characters of About copy:\n${failures
    .sort((a, b) => b.jobs - a.jobs)
    .map((row) => `- ${row.slug} (${row.len} chars, ${row.jobs} jobs)`)
    .join('\n')}`,
);

const injective = companies['injective-labs'] as { description: string } | undefined;
assert.ok(injective && injective.description.length >= COMPANY_ABOUT_MIN_CHARS, 'injective-labs About should be expanded');

console.log(
  `Company About checks passed for ${Object.values(companies).filter((c) => (c as { jobCount?: number }).jobCount > 0).length} employers with open roles.`,
);