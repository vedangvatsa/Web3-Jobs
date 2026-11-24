#!/usr/bin/env tsx
/**
 * High-confidence grammar / typography regression for all grant records.
 */
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { grammarIssuesInLine } from '../src/lib/grant-grammar';

type Finding = { id: string; kind: string; sample: string };

const findings: Finding[] = [];

for (const grant of grants as GrantProgram[]) {
  const lines: string[] = [];
  if (grant.description) lines.push(grant.description);
  for (const section of grant.sections || []) {
    lines.push(section.heading);
    lines.push(...(section.paragraphs || []));
    lines.push(...(section.bullets || []));
  }
  for (const line of lines) {
    for (const kind of grammarIssuesInLine(line)) {
      findings.push({ id: grant.id, kind, sample: line.replace(/\s+/g, ' ').slice(0, 140) });
    }
  }
}

if (findings.length > 0) {
  const byKind: Record<string, number> = {};
  for (const f of findings) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
  const lines = findings.slice(0, 35).map((f) => `  ${f.id} [${f.kind}]: ${f.sample}`);
  throw new Error(
    `${findings.length} grammar issue(s) across ${grants.length} grants:\n${JSON.stringify(byKind, null, 2)}\n${lines.join('\n')}${
      findings.length > 35 ? '\n  ...' : ''
    }`,
  );
}

console.log(`Grant grammar check passed for ${grants.length} programs.`);