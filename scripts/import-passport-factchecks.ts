import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import groups from '../content/nomads/factcheck-groups.json';
import countries from '../content/nomads/countries.json';
import { mergeCandidates, factcheckCounts, type Candidate } from './lib/passport-factchecks';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { serializeAudit, sha256 } from './lib/passport-gap-patches';

const { values } = parseArgs({ options: { check: { type: 'boolean' }, 'legacy-inputs': { type: 'boolean' } } });
let legacyRaw: string | undefined;
if (values['legacy-inputs']) {
  const inputs = Object.keys(groups).map(group => ({ group, raw: fs.readFileSync(`.cache/nomads/factcheck/${group}.json`, 'utf8') }));
  const candidates = inputs.map(({ group, raw }) => { const file = JSON.parse(raw) as Candidate; assert.equal(file.group, group); return file; });
  const data = mergeCandidates(candidates, groups, countries.map(country => country.iso!));
  legacyRaw = serializeAudit({ ...data, coverage: factcheckCounts(data), inputs: inputs.map(({ group, raw }) => ({ group, sha256: sha256(raw) })) });
}
const output = replayFactcheckPasses(legacyRaw);
const serialized = serializeAudit(output);
const target = 'content/nomads/entry-factchecks.json';
if (values.check) assert.equal(fs.readFileSync(target, 'utf8'), serialized, 'Canonical audit differs from manifest replay; rerun importer');
else { fs.writeFileSync(`${target}.tmp`, serialized); fs.renameSync(`${target}.tmp`, target); }
console.log({ coverage: output.coverage, passes: output.passes });
