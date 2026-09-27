import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { annualUsdRange, department, median, postingText, seniority } from './lib/hiring-report-analysis';

test('salary sample accepts explicit annual ranges and shared k notation', () => {
  assert.equal(annualUsdRange('Annual base salary: USD 150,000–$200,000.', 'Remote')?.midpoint, 175000);
  assert.equal(annualUsdRange('Salary range: $110-130k per year', 'San Francisco, California')?.midpoint, 120000);
  assert.equal(annualUsdRange('Annual base salary: $120,000 to $160,000.', 'New York')?.midpoint, 140000);
  assert.equal(annualUsdRange('Salary: USD 193,461 - USD 291,000 per year', 'Remote')?.midpoint, 242230.5);
});

test('salary sample excludes revenue, single amounts, ambiguous currencies and pay periods', () => {
  for (const [text, location] of [
    ['We raised $200,000,000. Competitive salary.', 'New York'],
    ['Annual salary is competitive. Equity grants range from $100k-$200k.', 'New York'],
    ['Annual salary: $150,000.', 'New York'],
    ['Salary range: $100k-$200k.', 'New York'],
    ['Base salary: $100k-$200k plus an annual target bonus.', 'New York'],
    ['Annual base salary: CAD $100k-$200k.', 'Toronto'],
    ['Annual base salary: $100k-$200k.', 'Singapore'],
    ['Annual base salary: $100k-$200k.', 'US and Canada'],
    ['Annual base salary: $100k-$200k.', 'Remote'],
    ['Base pay range: $100-$200 per hour, reviewed annually.', 'New York'],
    ['Annual total compensation salary range: USD $100k-$200k.', 'Remote'],
    ['Annual salary: USD 200k-100k.', 'Remote'],
    ['Annual salary: USD 100k-200k.\nAnnual salary: USD 150k-250k.', 'Remote'],
  ]) assert.equal(annualUsdRange(text, location), null, text);
});

test('text and classification do not manufacture missing evidence', () => {
  assert.equal(seniority('Software Engineer'), 'No matched seniority term');
  assert.equal(seniority('Sr. Software Engineer'), 'Senior / lead');
  assert.equal(seniority('Jr. Analyst'), 'Entry / internship');
  assert.equal(department('Senior Engineer', 'Compliance'), 'Compliance & Legal');
  assert.equal(department('Office Coordinator', ''), 'Other / unclassified');
  assert.equal(postingText('<style>Python</style><p>Java</p><p>SQL</p><script>Solidity</script>'), 'Java\nSQL');
  assert.equal(median([10, 20]), 15);
  assert.equal(median([]), null);
});

test('published figures reconcile with downloadable evidence', () => {
  const stats = JSON.parse(readFileSync('content/hiring-report-stats.json', 'utf8'));
  const published = JSON.parse(readFileSync('public/data/hiring-report-stats.json', 'utf8'));
  const evidence = JSON.parse(readFileSync('public/data/hiring-report-salary-sample.json', 'utf8'));
  assert.deepEqual(evidence, JSON.parse(readFileSync('content/hiring-report-salary-sample.json', 'utf8')));
  assert.deepEqual(stats, published);
  for (const rows of [stats.departments, stats.seniority]) {
    assert.equal(rows.reduce((sum: number, row: { count: number }) => sum + row.count, 0), stats.listings);
  }
  assert.equal(stats.salary.n, evidence.listings.length);
  assert.equal(stats.salary.medianMidpoint, median(evidence.listings.map((row: { midpoint: number }) => row.midpoint)));
  assert.equal(stats.salary.bands.reduce((sum: number, row: { count: number }) => sum + row.count, 0), stats.salary.n);
  assert.equal(evidence.generatedAt, stats.generatedAt);
  for (const row of evidence.listings) {
    assert.ok(row.url.startsWith('https://hashtagweb3.com/') && !row.url.endsWith('/undefined'));
    assert.equal(row.midpoint, (row.low + row.high) / 2);
    assert.equal(annualUsdRange(row.excerpt, row.location)?.midpoint, row.midpoint);
  }
});
