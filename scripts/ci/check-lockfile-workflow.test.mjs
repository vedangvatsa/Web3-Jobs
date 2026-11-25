import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseDocument } from 'yaml';

const workflowUrl = new URL('../../.github/workflows/check-lockfile.yml', import.meta.url);
const publishUrl = new URL('../../.github/workflows/refresh-jobs-cache.yml', import.meta.url);

test('check-lockfile workflow runs on every pull request', async () => {
  const text = await fs.readFile(workflowUrl, 'utf8');
  const document = parseDocument(text, { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  assert.ok('pull_request' in workflow.on);
  const prTrigger = workflow.on.pull_request;
  assert.ok(prTrigger == null || prTrigger.paths == null);
  const job = workflow.jobs.lockfile;
  assert.equal(job.steps.at(-1).run, 'npm run check:lockfile');
});

test('publish workflow gate verifies the lockfile before ingest or Telegram', async () => {
  const text = await fs.readFile(publishUrl, 'utf8');
  const gate = text.slice(text.indexOf('jobs:'), text.indexOf('\n  ingest:'));
  assert.match(gate, /npm run check:lockfile/);
  const document = parseDocument(text, { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  assert.ok(workflow.jobs.gate);
  assert.ok(workflow.jobs.ingest.needs.includes('gate'));
  assert.ok(workflow.jobs['refresh-and-post'].needs.includes('gate'));
});