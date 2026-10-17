import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseDocument } from 'yaml';

const read = async file => {
  const doc = parseDocument(await fs.readFile(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8'), { uniqueKeys: true });
  assert.deepEqual(doc.errors, [], `Invalid workflow YAML: ${file}`);
  return doc.toJS();
};

test('both workflow documents parse with unique YAML keys and compatible reusable inputs', async () => {
  const parent = await read('refresh-jobs-cache.yml');
  const child = await read('newknowledge-threads.yml');
  const caller = parent.jobs['knowledge-threads'];
  assert.deepEqual(caller.needs, ['gate']);
  assert.equal(caller.uses, './.github/workflows/newknowledge-threads.yml');
  for (const key of Object.keys(caller.with)) assert.ok(child.on.workflow_call.inputs[key], `Missing reusable input ${key}`);
  assert.equal(child.on.workflow_dispatch.inputs.mode.default, 'preflight');
  assert.equal(child.on.workflow_call.inputs.mode.default, 'publish');
  assert.deepEqual(parent.on.schedule.map(item => item.cron), ['30 3 * * *', '30 11 * * *', '30 19 * * *']);
  assert.ok(!parent.jobs['record-slot'].needs.includes('knowledge-threads'));
  assert.equal(parent.jobs.gate.steps.find(step => step.id === 'knowledge')['continue-on-error'], true);
  assert.equal(child.jobs.knowledge.steps.at(-1).if, 'always()');
});
