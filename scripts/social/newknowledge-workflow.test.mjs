import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = file => fs.readFile(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8');
const [parent, workflow] = await Promise.all([read('refresh-jobs-cache.yml'), read('newknowledge-threads.yml')]);

test('knowledge depends only on gate and retains independent completion and concurrency', () => {
  const job = parent.split('  knowledge-threads:\n')[1].split('\n  diagnose:')[0];
  assert.match(job, /needs: \[gate\]/);
  assert.match(job, /needs\.gate\.outputs\.knowledge_due == 'true'/);
  assert.ok(!job.includes('outputs.social'));
  assert.ok(!parent.split('  record-slot:\n')[1].includes('knowledge-threads'));
  assert.match(parent, /name: Check independent knowledge thread window\n        continue-on-error: true/);
  assert.match(workflow, /group: knowledge-threads-month\n  cancel-in-progress: false/);
  assert.ok(!workflow.includes('schedule:\n'));
});

test('all publish entry points use the window planner and preserve the journal on failure', () => {
  assert.match(workflow, /run: node scripts\/social\/newknowledge-plan\.mjs/);
  assert.match(workflow, /inputs.mode != 'publish' \|\| steps.plan.outputs.due == 'true'/);
  assert.match(workflow, /name: Preserve knowledge claims and provider receipts\n        if: always\(\)/);
  assert.match(workflow, /path: \.cache\/newknowledge\//);
  assert.match(workflow, /git rev-parse HEAD/);
  for (const flag of ['WEBSITE_RECOVERY', 'ONLY_NEWS', 'NEWS_DRY_RUN', 'DRY_RUN', 'DIAGNOSE_TELEGRAM', 'DIAGNOSE_CONTENT']) {
    assert.ok(parent.includes(`KNOWLEDGE_${flag}:`));
    assert.ok(workflow.includes(`KNOWLEDGE_${flag}:`));
  }
  for (const secret of ['BUFFER_ACCESS_TOKEN', 'THREADS_USER_ID', 'THREADS_ACCESS_TOKEN']) assert.ok(workflow.includes(`secrets.${secret}`));
  assert.match(workflow, /default: preflight/);
});
