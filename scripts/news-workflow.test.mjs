import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const yaml = createRequire(require.resolve('gray-matter'))('js-yaml');
const workflow = yaml.safeLoad(fs.readFileSync('.github/workflows/refresh-jobs-cache.yml', 'utf8'));

test('on-time social fan-out retains one daily rollout after ingestion and news', () => {
  assert.deepEqual(workflow.jobs['post-openings'].needs, ['gate']);
  assert.deepEqual(workflow.jobs['refresh-and-post'].needs, ['gate']);
  assert.deepEqual(workflow.jobs.ingest.needs, ['gate']);
  assert.deepEqual(workflow.jobs.deploy.needs, ['gate', 'ingest', 'publish-news']);
  assert.deepEqual(workflow.jobs['job-alerts'].needs, ['gate', 'ingest', 'deploy']);
  const rollouts = Object.entries(workflow.jobs).filter(([, job]) => job.uses === './.github/workflows/fah-fix-and-deploy.yml');
  assert.deepEqual(rollouts.map(([name]) => name), ['deploy']);
  assert.match(workflow.jobs.deploy.if, /needs\.ingest\.result == 'success'/);
  assert.match(workflow.jobs.deploy.if, /needs\.publish-news\.result != 'cancelled'/);
  for (const name of ['post-videos', 'knowledge-threads', 'knowledge-carousels']) {
    assert.deepEqual(workflow.jobs[name].needs, ['gate']);
    assert.equal(workflow.jobs[name].with.slot, '${{ needs.gate.outputs.slot }}');
    assert.equal(workflow.jobs[name].with.date, '${{ needs.gate.outputs.date }}');
  }
});

test('daily research deploys recovered articles even after the jobs rollout', () => {
  assert.match(workflow.jobs['publish-news'].if, /outputs.news == 'true'/);
  assert.match(workflow.jobs.deploy.if, /outputs.deploy == 'true'/);
  assert.match(workflow.jobs.deploy.if, /outputs.deploy == 'true' \|\| needs.publish-news.outputs.articles_changed == 'true'/);
  for (const mode of ['only_news', 'news_dry_run', 'website_recovery']) assert.ok(workflow.jobs.deploy.if.includes(`github.event.inputs.${mode} != 'true'`));
  assert.equal(workflow.jobs['publish-news'].outputs.articles_changed, '${{ steps.publish.outputs.articles_changed }}');
  assert.equal(workflow.jobs['publish-news'].concurrency.group, 'publish-news');
  assert.equal(workflow.jobs['publish-news'].steps[0].with.ref, 'main');
  assert.equal(workflow.jobs['refresh-and-post'].steps[0].with.ref, 'main');
});

test('news uses the verified OpenCode release rather than upgrading each day', () => {
  const news = workflow.jobs['publish-news'];
  assert.match(news.env.NEWS_OPENCODE_VERSION, /^v\d+\.\d+\.\d+$/);
  const install = news.steps.find(step => step.name === 'Install opencode').run;
  assert.doesNotMatch(install, /releases\/latest/);
  assert.match(install, /VERSION="\$NEWS_OPENCODE_VERSION"/);
  assert.match(install, /test .*--version/);
});

test('research coverage and audits own publication, not a raw article-count increase', () => {
  const news = workflow.jobs['publish-news'];
  assert.ok(news.steps.find(step => step.id === 'research').run.includes('news-research.mjs prepare'));
  assert.ok(news.steps.find(step => step.id === 'publish').run.includes('publish-news-run.mjs'));
  assert.match(news.steps.find(step => step.id === 'publish').if, /always\(\)/);
  assert.ok(news.steps.some(step => step.uses === 'actions/upload-artifact@v4' && step.if === 'always()'));
  assert.ok(news.steps.some(step => /Fail incomplete/.test(step.name || '') && step.if.includes("outputs.complete != 'true'")));
  assert.ok(news.steps.every(step => !/ARTICLES_BEFORE|git reset --hard|git pull --rebase/.test(step.run || '')));
});

test('news dry runs use a news-only gate and pass --dry-run to the publisher', () => {
  const gate = workflow.jobs.gate.steps.find(step => step.id === 'set').run;
  assert.match(gate, /only_news.*news_dry_run/);
  assert.match(gate, /echo "deploy=false"/);
  assert.match(gate, /echo "videos=false"/);
  const publish = workflow.jobs['publish-news'].steps.find(step => step.id === 'publish').run;
  assert.match(publish, /NEWS_DRY_RUN.*true/);
  assert.match(publish, /--dry-run/);
});

test('job and event workflows acknowledge only generators they ran, leaving article invalidation intact', () => {
  const ingest = yaml.safeLoad(fs.readFileSync('.github/workflows/refresh-jobs-ingest.yml', 'utf8'));
  const recorded = steps => steps.filter(step => step.run?.includes('update:prebuild-hashes')).flatMap(step => {
    const ids = [...step.run.matchAll(/--step=([a-z-]+)/g)].map(match => match[1]);
    assert.ok(ids.length, 'Hash refreshes need an explicit completed-step list');
    return ids;
  });
  assert.deepEqual(recorded(ingest.jobs.ingest.steps).sort(), ['companies-runtime', 'company-profiles', 'jobs-runtime', 'sitemap', 'slug-types']);
  const profileGeneration = ingest.jobs.ingest.steps.findIndex(step => step.run?.includes('scripts/precompute-company-profiles.ts'));
  const profileHash = ingest.jobs.ingest.steps.findIndex(step => step.run?.includes('--step=company-profiles'));
  assert.ok(profileGeneration >= 0 && profileGeneration < profileHash);
  assert.notEqual(ingest.jobs.ingest.steps[profileGeneration]['continue-on-error'], true);
  assert.deepEqual(recorded(workflow.jobs['refresh-events'].steps), ['events-runtime']);
});

test('website recovery refreshes content without social, email or an overlapping deployment', () => {
  const gate = workflow.jobs.gate.steps.find(step => step.id === 'set').run;
  const recovery = gate.slice(gate.indexOf('if [ "${{ github.event.inputs.website_recovery }}'), gate.indexOf('if [ "${{ github.event.inputs.only_news }}'));
  assert.match(recovery, /morning=true/); assert.match(recovery, /news=true/);
  for (const flag of ['social', 'videos', 'deploy']) assert.match(recovery, new RegExp(`${flag}=false`));
  assert.match(workflow.jobs['job-alerts'].if, /website_recovery != 'true'/);
  assert.deepEqual(workflow.jobs['refresh-events'].needs, ['gate']);
});

test('saved news recovery restores only after preparing a fresh queue and deploys without social', () => {
  const news = workflow.jobs['publish-news'];
  assert.equal(news.permissions.actions, 'read');
  assert.match(workflow.concurrency.group, /news_recovery_run != '' && 'publish-news-recovery'/);
  assert.match(workflow.jobs['refresh-events'].if, /outputs.slot != 'recovery'/);
  const prepare = news.steps.findIndex(step => step.id === 'research');
  const restore = news.steps.findIndex(step => step.run === 'node scripts/restore-news-drafts.mjs');
  const writer = news.steps.findIndex(step => step.id === 'draft');
  assert.ok(prepare < restore && restore < writer);
  const gate = workflow.jobs.gate.steps.find(step => step.id === 'set').run;
  const recovery = gate.slice(gate.indexOf('if [ -n "$NEWS_RECOVERY_RUN" ]'), gate.indexOf('if [ "${{ github.event.inputs.only_news }}" ='));
  for (const flag of ['morning=false', 'news=true', 'deploy=true', 'social=false', 'videos=false', 'slot=recovery']) assert.ok(recovery.includes(flag));
  assert.ok(recovery.includes('inputs.news_dry_run }}" != "true"'));
});

test('automatic same-day recovery selects an authenticated exact artifact before restoration and fresh review', () => {
  const news = workflow.jobs['publish-news'], steps = news.steps;
  const prepare = steps.findIndex(step => step.id === 'research');
  const select = steps.findIndex(step => step.id === 'recovery');
  const download = steps.findIndex(step => step.name === 'Download unpublished news recovery');
  const restore = steps.findIndex(step => step.run === 'node scripts/restore-news-drafts.mjs');
  const writer = steps.findIndex(step => step.id === 'draft');
  const publish = steps.findIndex(step => step.id === 'publish');
  assert.ok(prepare >= 0 && prepare < select && select < download && download < restore && restore < writer && writer < publish);
  assert.equal(steps[select].run, 'node scripts/select-news-recovery.mjs');
  assert.equal(steps[select].if, "${{ steps.research.outputs.needs_writer == 'true' }}");
  assert.equal(steps[select].env.GITHUB_TOKEN, '${{ github.token }}');
  assert.equal(steps[select].env.NEWS_RECOVERY_RUN, '${{ inputs.news_recovery_run }}');
  assert.equal(steps[download].uses, 'actions/download-artifact@v4');
  assert.deepEqual(steps[download].with, {
    'github-token': '${{ github.token }}', repository: '${{ github.repository }}',
    'run-id': '${{ steps.recovery.outputs.run_id }}', name: '${{ steps.recovery.outputs.artifact_name }}',
    path: '.cache/news-research-restore',
  });
  for (const index of [select, download, restore]) assert.notEqual(steps[index]['continue-on-error'], true);
  for (const index of [download, restore]) {
    assert.equal(steps[index].if, "${{ steps.recovery.outputs.run_id != '' && steps.research.outputs.needs_writer == 'true' }}");
  }
  assert.equal(steps[writer].if, "${{ steps.research.outputs.needs_writer == 'true' }}");
  assert.equal(steps[writer].run, 'node scripts/run-news-research.mjs');
  const upload = steps.find(step => step.uses === 'actions/upload-artifact@v4');
  assert.equal(upload.if, 'always()');
  assert.equal(upload.with.name, 'news-research-${{ github.run_id }}-${{ github.run_attempt }}');
  assert.equal(upload.with['include-hidden-files'], true);
  assert.ok(upload.with.path.split('\n').includes('.cache/news-research/'));
});

test('daily news offline checks include recovery selection and existing restore safety tests', () => {
  const steps = workflow.jobs['publish-news'].steps;
  const checks = steps.findIndex(step => step.name === 'Test daily news discovery and publication');
  assert.ok(checks >= 0 && checks < steps.findIndex(step => step.id === 'research'));
  assert.match(steps[checks].run, /^node --test /);
  for (const file of ['select-news-recovery.test.mjs', 'restore-news-drafts.test.mjs', 'news-workflow.test.mjs', 'run-news-research.test.mjs']) {
    assert.ok(steps[checks].run.split(/\s+/).includes(`scripts/${file}`));
  }
});
