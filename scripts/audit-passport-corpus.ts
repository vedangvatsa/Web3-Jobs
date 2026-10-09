import fs from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import countries from '../content/nomads/countries.json';
import legacy from '../content/nomads/entry-policies.json';
import { factcheckCounts, validateFactchecks, type Factchecks } from './lib/passport-factchecks';
import type { PassportIndexSnapshot } from './lib/passport-index';
import type { PassportRules } from '../src/lib/nomads/types';

const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
const { values } = parseArgs({ options: { write: { type: 'boolean' }, check: { type: 'boolean' }, summary: { type: 'boolean' } } });
validateFactchecks(audit, countries.map(country => country.iso!));
const referenceRaw = fs.readFileSync('content/nomads/passport-index.json');
const reference = JSON.parse(referenceRaw.toString()) as PassportIndexSnapshot;
const totals = { checked: 0, historical: 0, unresolved: 0, government: 0, reference: 0, unknown: 0, changedCategory: 0, changedDays: 0, changedStayOrMethods: 0, retainedLegacyUnresolved: 0, withdrawalWithoutReplacement: 0 };
const sizes: { passport: string; bytes: number; gzipBytes: number }[] = [];
const examples: Record<string, unknown> = {};
for (const country of countries) {
  const raw = fs.readFileSync(`public/data/nomads/passports/${country.id}.json`);
  sizes.push({ passport: country.iso!, bytes: raw.length, gzipBytes: gzipSync(raw).length });
  const data = JSON.parse(raw.toString()) as PassportRules;
  for (const destination of data.destinations) {
    const { rule, review } = destination;
    totals[review]++;
    if (rule.t === 'unknown') totals.unknown++;
    else totals[data.sources[rule.s!].kind]++;
    const previous = reference.passports[country.iso!].rules[destination.iso!];
    if (previous.t !== rule.t) totals.changedCategory++;
    if (previous.d !== rule.d) totals.changedDays++;
    if (previous.stay !== rule.stay || JSON.stringify(previous.a) !== JSON.stringify(rule.a)) totals.changedStayOrMethods++;
    if (review === 'unresolved' && rule.t !== 'unknown' && Object.hasOwn(legacy.sources, rule.s!)) totals.retainedLegacyUnresolved++;
    if (rule.t === 'unknown' && rule.evidence) totals.withdrawalWithoutReplacement++;
    if (['US/GE', 'US/TH', 'RU/TH', 'CN/KH', 'NG/PW', 'US/PW', 'HK/LK', 'IN/MY', 'FR/IN', 'US/PK', 'AF/FR', 'BH/AZ', 'CN/KW', 'VA/BD', 'IS/SZ', 'PA/TJ', 'IN/KR', 'GB/PS', 'CZ/ST', 'TW/NR', 'FJ/NR', 'CN/NR', 'CN/BJ', 'SO/ES', 'RU/NO', 'ML/NE', 'BF/NE', 'SE/NE', 'MR/NE', 'MU/NE', 'RW/NE', 'CM/CF', 'MA/BF', 'RW/BF', 'AU/BF'].includes(`${country.iso}/${destination.iso}`)) examples[`${country.iso}/${destination.iso}`] = destination;
  }
}
sizes.sort((a, b) => b.gzipBytes - a.gzipBytes);
const report = { audit: factcheckCounts(audit), rendered: totals, reference: { version: reference.version, passports: Object.keys(reference.passports).length, sha256: createHash('sha256').update(referenceRaw).digest('hex') }, policies: audit.policies.length, sources: Object.keys(audit.sources).length, payload: { totalBytes: sizes.reduce((sum, item) => sum + item.bytes, 0), totalGzipBytes: sizes.reduce((sum, item) => sum + item.gzipBytes, 0), largest: sizes.slice(0, 5), largestRaw: [...sizes].sort((a, b) => b.bytes - a.bytes).slice(0, 5), budget: { bytes: 185000, gzipBytes: 50000 } }, examples };
assert.equal(totals.checked + totals.historical + totals.unresolved, countries.length * (countries.length - 1));
assert.ok(sizes.every(size => size.bytes < report.payload.budget.bytes && size.gzipBytes < report.payload.budget.gzipBytes), `Selected-shard payload budget exceeded: ${JSON.stringify(report.payload)}`);
const serialized = `${JSON.stringify(report, null, 2)}\n`;
const target = 'docs/PASSPORT_CORPUS_AUDIT.json';
if (values.check) assert.equal(fs.readFileSync(target, 'utf8'), serialized, 'Corpus report differs from current shards');
else if (values.write) fs.writeFileSync(target, serialized);
console.log(values.summary ? JSON.stringify({ ...report, examples: undefined }, null, 2) : serialized);
