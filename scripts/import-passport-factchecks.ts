import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import groups from '../content/nomads/factcheck-groups.json';
import countries from '../content/nomads/countries.json';
import { mergeCandidates, factcheckCounts, type Candidate } from './lib/passport-factchecks';

const { values } = parseArgs({ options: { check: { type: 'boolean' } } });
const inputs = Object.keys(groups).map(group => ({ group, raw: fs.readFileSync(`.cache/nomads/factcheck/${group}.json`, 'utf8') }));
const candidates = inputs.map(({ group, raw }) => { const file = JSON.parse(raw) as Candidate; assert.equal(file.group, group); return file; });
const data = mergeCandidates(candidates, groups, countries.map(country => country.iso!));
const output = { ...data, coverage: factcheckCounts(data), inputs: inputs.map(({ group, raw }) => ({ group, sha256: createHash('sha256').update(raw).digest('hex') })) };
const serialized = `${JSON.stringify(output, null, 2)}\n`;
const target = 'content/nomads/entry-factchecks.json';
if (values.check) assert.equal(fs.readFileSync(target, 'utf8'), serialized, 'Committed audit differs from candidates; rerun importer');
else { fs.writeFileSync(`${target}.tmp`, serialized); fs.renameSync(`${target}.tmp`, target); }
console.log(output.coverage);
