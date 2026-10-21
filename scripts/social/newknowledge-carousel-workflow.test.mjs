import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseDocument } from 'yaml';

test('standalone workflow is read-only by default, reusable, SHA-pinned and retains separate platform journals', async () => {
  const text = await fs.readFile(new URL('../../.github/workflows/newknowledge-carousels.yml', import.meta.url), 'utf8');
  const document = parseDocument(text, { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  assert.equal(workflow.on.schedule, undefined);
  assert.equal(workflow.on.workflow_call.inputs.mode.default, 'preflight');
  assert.equal(workflow.on.workflow_dispatch.inputs.mode.default, 'preflight');
  assert.ok(!workflow.on.workflow_dispatch.inputs.mode.options.includes('publish'));
  assert.deepEqual(Object.keys(workflow.on.workflow_call.secrets), ['BUFFER_ACCESS_TOKEN', 'META_PAGE_TOKEN']);
  assert.equal(workflow.on.workflow_call.secrets.META_PAGE_TOKEN.required, false);
  assert.deepEqual(workflow.concurrency, { group: 'knowledge-carousels-month', 'cancel-in-progress': false });
  const job = workflow.jobs.carousels;
  assert.equal(job.permissions.contents, 'write');
  assert.equal(job.steps.find(step => step.uses === 'actions/checkout@v4').with.ref, '${{ github.sha }}');
  assert.equal(job.steps.find(step => step.uses === 'actions/setup-node@v4').with['node-version'], '24');
  assert.ok(job.steps.some(step => step.run?.startsWith('npm ci')));
  const probe = job.steps.find(step => step.run === 'node scripts/social/inspect-carousel-accounts.mjs');
  assert.equal(probe.if, "${{ inputs.mode == 'accounts' }}");
  assert.ok(job.steps.some(step => step.run?.includes('newknowledge-state.test.mjs') && step.run.includes('newknowledge-carousel-*.test.mjs')));
  const uploads = job.steps.filter(step => step.uses === 'actions/upload-artifact@v4');
  assert.equal(uploads.length, 2);
  for (const platform of ['linkedin', 'instagram']) {
    const upload = uploads.find(step => step.with.path.endsWith(`/${platform}/`));
    assert.equal(upload.if, 'always()');
    assert.equal(upload.with['retention-days'], 90);
    assert.equal(upload.with['include-hidden-files'], true);
  }
  assert.ok(!/wrangler|supabase|newknowledge\.mjs/.test(text));
});
