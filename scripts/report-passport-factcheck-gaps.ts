import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import countries from '../content/nomads/countries.json';
import { factcheckCounts, validateFactchecks, type Factchecks } from './lib/passport-factchecks';

const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
const { values } = parseArgs({ options: { check: { type: 'boolean' } } });
validateFactchecks(audit, countries.map(country => country.iso!));
const totals = factcheckCounts(audit);
const names = new Map(countries.map(country => [country.iso, country.name]));
const escape = (text: string) => text.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
const rows = audit.reviews.map(review => {
  let checked = 0, historical = 0;
  for (const policy of audit.policies.filter(policy => policy.destinations.includes(review.destination))) {
    if (audit.sources[policy.s!].historical) historical += policy.passports.length;
    else checked += policy.passports.length;
  }
  assert.equal(checked + historical + review.unresolvedPassports.length, 198);
  return { ...review, name: names.get(review.destination)!, checked, historical };
}).sort((a, b) => b.unresolvedPassports.length - a.unresolvedPassports.length || a.name.localeCompare(b.name));
const checkedAt = Object.values(audit.sources).map(source => source.checkedAt).sort().at(-1)!;
const lines = [
  '# Passport fact-check coverage and gaps', '',
  `Audit evidence through ${checkedAt}. All ${totals.routes.toLocaleString('en-US')} routes are accounted for: ${totals.checked.toLocaleString('en-US')} government-backed baselines, ${totals.historical} historical official records and ${totals.unresolved.toLocaleString('en-US')} unresolved official reviews.`, '',
  'Government-backed baseline does not mean that every application method, stay allowance or individual eligibility condition has been established. Missing fields remain unspecified and qualifications remain in the route notes. Archives are dated historical evidence. This report does not certify every route as currently correct.', '',
  `Current evidence remains missing for ${(totals.unresolved + totals.historical).toLocaleString('en-US')} routes: the unresolved and historical groups together. Historical document reproductions may be hosted outside web.archive.org.`, '',
  'Each destination has 198 foreign passport origins. Counts are disjoint. Destinations with the largest evidence gaps appear first.', '',
  '| Destination | ISO | Government-backed | Historical | Unresolved |',
  '| --- | --- | ---: | ---: | ---: |',
  ...rows.map(row => `| ${escape(row.name)} | ${row.destination} | ${row.checked} | ${row.historical} | ${row.unresolvedPassports.length} |`), '',
  '## Unresolved origins and research findings', '',
  'The origin codes below identify the unresolved routes. Findings preserve successive research passes in order; earlier gap statements can be superseded by later findings and the final origin lists. A condition naming one nationality must not be applied to every listed origin. Exact source records, policy qualifications, replacements and withdrawals are in [the canonical audit](../content/nomads/entry-factchecks.json).', '',
];
for (const row of rows.filter(row => row.unresolvedPassports.length)) {
  lines.push(`### ${row.name} (${row.destination})`, '', `Unresolved origins (${row.unresolvedPassports.length}): ${row.unresolvedPassports.join(', ')}.`, '', ...row.findings.map(finding => `- ${escape(finding)}`), '');
}
const serialized = `${lines.join('\n').trimEnd()}\n`;
if (values.check) assert.equal(fs.readFileSync('docs/PASSPORT_FACTCHECK_GAPS.md', 'utf8'), serialized, 'Gap report differs from canonical audit');
else fs.writeFileSync('docs/PASSPORT_FACTCHECK_GAPS.md', serialized);
console.log({ ...totals, report: 'docs/PASSPORT_FACTCHECK_GAPS.md' });
