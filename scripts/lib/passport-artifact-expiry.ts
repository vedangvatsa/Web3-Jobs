import fs from 'node:fs';
import path from 'node:path';
import type { PassportRules } from '../../src/lib/nomads/types';

export function hasExpiredPassportArtifacts(outputs: string[], root: string, today: string): boolean {
  return outputs.filter(output => output.startsWith('public/data/nomads/passports/')).some(output => {
    const data = JSON.parse(fs.readFileSync(path.join(root, output), 'utf8')) as PassportRules;
    return data.destinations.some(({ rule }) => rule.t !== 'unknown' && Boolean(rule.until && rule.until < today));
  });
}
