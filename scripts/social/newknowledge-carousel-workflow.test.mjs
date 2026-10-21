import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseDocument } from 'yaml';
import { selectKnowledgeDate } from './newknowledge-content.mjs';

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
  const publisher = job.steps.find(step => step.run?.includes('node scripts/social/newknowledge-carousels.mjs'));
  assert.equal(publisher.env.KNOWLEDGE_INSTAGRAM_TRANSPORT, 'meta');
  assert.equal(publisher.env.META_PAGE_TOKEN, '${{ secrets.META_PAGE_TOKEN }}');
  assert.equal(publisher.env.BUFFER_ACCESS_TOKEN, '${{ secrets.BUFFER_ACCESS_TOKEN }}');
});

test('daily native carousels use the independent knowledge gate, not other publishers or completion stamps', async () => {
  const document = parseDocument(await fs.readFile(new URL('../../.github/workflows/refresh-jobs-cache.yml', import.meta.url), 'utf8'), { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const parent = document.toJS(), job = parent.jobs['knowledge-carousels'];
  assert.deepEqual(job.needs, ['gate']);
  assert.equal(job.if, "${{ needs.gate.outputs.knowledge_due == 'true' }}");
  assert.equal(job.uses, './.github/workflows/newknowledge-carousels.yml');
  assert.deepEqual(job.with, { date: '${{ needs.gate.outputs.date }}', slot: '${{ needs.gate.outputs.slot }}', mode: 'publish', platform: 'both' });
  assert.equal(job.permissions.contents, 'write');
  assert.equal(job.secrets, 'inherit');
  assert.equal(parent.jobs.gate.outputs.knowledge_due, '${{ steps.knowledge.outputs.due }}');
  assert.ok(!JSON.stringify(parent.jobs['record-slot']).includes('knowledge-carousels'));
  assert.ok(!JSON.stringify(parent.jobs['knowledge-threads']).includes('knowledge-carousels'));

  const gate = parent.jobs.gate.steps.find(step => step.id === 'knowledge');
  assert.equal(gate.run, 'node scripts/social/newknowledge-plan.mjs');
  assert.equal(gate['continue-on-error'], true);
  const calendar = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/calendar.json', import.meta.url)));
  const date = '2026-10-22', now = Date.parse(`${date}T11:30:00Z`);
  assert.equal(selectKnowledgeDate(calendar, { date, now }).due, true);
  for (const flag of ['website_recovery', 'only_news', 'news_dry_run', 'dry_run', 'diagnose_telegram', 'diagnose_content']) {
    assert.equal(gate.env[`KNOWLEDGE_${flag.toUpperCase()}`], `\${{ github.event.inputs.${flag} }}`);
    assert.equal(selectKnowledgeDate(calendar, { date, now, flags: { [flag]: 'true' } }).due, false);
  }
  for (const options of [
    { date, now: Date.parse(`${date}T11:29:59.999Z`) },
    { date, now: Date.parse(`${date}T12:30:00Z`) },
    { date: '2026-10-21', now }, { date: '2026-10-23', now },
    { date, now, slot: 'morning' }, { date, now, slot: 'evening' },
    { date: '2026-11-17', now: Date.parse('2026-11-17T11:30:00Z') },
  ]) assert.equal(selectKnowledgeDate(calendar, options).due, false);
});
