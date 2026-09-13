import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditArticles, repairArticles } from './lib/article-markdown';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'article-markdown-'));
const article = path.join(directory, 'nested', 'example.md');
fs.mkdirSync(path.dirname(article), { recursive: true });
fs.writeFileSync(article, `---
title: What is an example
description: Example description
publishedDate: '2026-01-01'
lastUpdated: '2026-01-02'
---

**Pros**

Text with an inline fence.\`\`\`ts
const example = true;
\`\`\`

Text with ** spaced emphasis **, **valid emphasis**, and ** unmatched

**Developer Track:**| Experience | Example |
| --- | --- |
| Junior | \`a|b\` |

| One | Two |
| --- | --- |
| one | two | three |
| only-one |

# Heading ** unmatched stays untouched
- List ** unmatched stays untouched
Link [** unmatched](https://example.com) stays untouched
Inline <span>** unmatched stays untouched</span>

+---------+
| diagram |
+---------+

\`\`\`text
+---------+
| diagram |
+---------+
\`\`\`

div class="caption">
svg viewBox="0 0 10 10">
rect width="10" height="10"/>
/svg>

“Typography”
`, 'utf8');
fs.writeFileSync(path.join(directory, 'unclosed.md'), `---
title: Complete fixture
description: Fixture with an unclosed fence
category: Educational
publishedDate: '2026-01-01'
lastUpdated: '2026-01-02'
---

\`\`\`sh
echo fixture
`, 'utf8');

const initial = auditArticles(directory);
assert.equal(initial.articles, 2);
assert.equal(initial.totals['missing-category'], 1);
assert.equal(initial.totals['inline-code-fence'], 1);
assert.equal(initial.totals['unterminated-code-fence'], 1);
assert.equal(initial.totals['unmatched-bold-delimiter'], 1);
assert.equal(initial.totals['malformed-table-row'], 3);
assert.equal(initial.totals['broken-raw-svg'], 1);
assert.equal(initial.totals['pseudo-heading'], 1);
assert.equal(initial.totals['non-ascii-typography'], 2);
assert.equal(initial.totals['malformed-bold-pair'], 1);
assert.equal(initial.totals['ascii-box-diagram'], 1);
assert.equal(initial.totals['unfenced-ascii-box-diagram'], 1);

const dryRun = repairArticles(directory, true);
assert.equal(dryRun.length, 2);
assert.match(fs.readFileSync(article, 'utf8'), /Text with an inline fence\.```ts/);

repairArticles(directory, false);
const repaired = fs.readFileSync(article, 'utf8');
assert.match(repaired, /category: Educational/);
assert.match(repaired, /## Pros/);
assert.match(repaired, /<svg viewBox/);
assert.match(repaired, /<rect width/);
assert.match(repaired, /<\/svg>/);
assert.doesNotMatch(repaired, /“|”/);
assert.match(repaired, /Text with \*\*spaced emphasis\*\*, \*\*valid emphasis\*\*, and  unmatched/);
assert.match(repaired, /\*\*Developer Track:\*\*\n\n\| Experience \| Example \|/);
assert.match(repaired, /\| Junior \| `a\|b` \|/);
assert.match(repaired, /\| One \| Two \|  \|/);
assert.match(repaired, /\| one \| two \| three \|/);
assert.match(repaired, /\| only-one \|  \|  \|/);
assert.match(repaired, /# Heading \*\* unmatched stays untouched/);
assert.match(repaired, /- List \*\* unmatched stays untouched/);
assert.match(repaired, /Link \[\*\* unmatched\]\(https:\/\/example\.com\) stays untouched/);
assert.match(repaired, /Inline <span>\*\* unmatched stays untouched<\/span>/);
assert.match(repaired, /```text\n\+---------\+\n\| diagram \|\n\+---------\+\n```/);
assert.match(fs.readFileSync(path.join(directory, 'unclosed.md'), 'utf8'), /echo fixture\n\s*```$/);
assert.deepEqual(repairArticles(directory, false), []);

const finalReport = auditArticles(directory);
assert.equal(finalReport.totals['missing-category'], undefined);
assert.equal(finalReport.totals['inline-code-fence'], undefined);
assert.equal(finalReport.totals['broken-raw-svg'], undefined);
assert.equal(finalReport.totals['pseudo-heading'], undefined);
assert.equal(finalReport.totals['non-ascii-typography'], undefined);
assert.equal(finalReport.totals['unterminated-code-fence'], undefined);
assert.equal(finalReport.totals['unmatched-bold-delimiter'], undefined);
assert.equal(finalReport.totals['malformed-bold-pair'], undefined);
assert.equal(finalReport.totals['malformed-table-row'], undefined);
assert.equal(finalReport.totals['unfenced-ascii-box-diagram'], undefined);
assert.equal(Object.keys(finalReport.errors).length, 0);
assert.equal(finalReport.warnings['ascii-box-diagram'], 2);

fs.rmSync(directory, { recursive: true, force: true });
console.log('Article markdown audit and repair tests passed.');
