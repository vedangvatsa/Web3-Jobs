import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
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
  assert.match(workflow.jobs.deploy.if, /needs\.publish-news\.result == 'success'/);
  for (const name of ['post-videos', 'knowledge-threads', 'knowledge-carousels']) {
    assert.deepEqual(workflow.jobs[name].needs, ['gate']);
    assert.equal(workflow.jobs[name].with.slot, '${{ needs.gate.outputs.slot }}');
    assert.equal(workflow.jobs[name].with.date, '${{ needs.gate.outputs.date }}');
  }
});

test('daily research joins the single daily rollout and cannot override a completed deployment', () => {
  assert.match(workflow.jobs['publish-news'].if, /outputs.news == 'true'/);
  assert.match(workflow.jobs.deploy.if, /outputs.deploy == 'true'/);
  assert.doesNotMatch(workflow.jobs.deploy.if, /articles_changed|newsDeployPending/);
  for (const mode of ['only_news', 'news_dry_run', 'website_recovery']) assert.ok(workflow.jobs.deploy.if.includes(`github.event.inputs.${mode} != 'true'`));
  assert.equal(workflow.jobs['publish-news'].outputs.articles_changed, '${{ steps.publish.outputs.articles_changed }}');
  assert.equal(workflow.jobs['publish-news'].concurrency.group, 'publish-news');
  assert.equal(workflow.jobs['publish-news'].steps[0].with.ref, 'main');
  assert.equal(workflow.jobs['refresh-and-post'].steps[0].with.ref, 'main');
});

test('failed or cancelled daily work blocks deployment; completed work can use the one due rollout', () => {
  const expression = workflow.jobs.deploy.if.slice(3, -2).replace(/needs\.([\w-]+)/g, 'needs["$1"]');
  const evaluate = ({ ingest = 'success', news = 'success', morning = 'true', newsDue = 'true', deploy = 'true', inputs = {} } = {}) => runInNewContext(expression, {
    always: () => true, github: { event: { inputs } }, needs: {
      gate: { result: 'success', outputs: { skip: 'false', morning, news: newsDue, deploy } },
      ingest: { result: ingest }, 'publish-news': { result: news, outputs: { articles_changed: 'true' } },
    },
  });
  assert.equal(evaluate(), true);
  for (const result of ['failure', 'cancelled', 'skipped']) {
    assert.equal(evaluate({ news: result }), false);
    assert.equal(evaluate({ ingest: result }), false);
  }
  assert.equal(evaluate({ ingest: 'skipped', morning: 'false' }), true);
  assert.equal(evaluate({ news: 'skipped', newsDue: 'false' }), true);
  assert.equal(evaluate({ deploy: 'false' }), false);
  for (const mode of ['only_news', 'news_dry_run', 'website_recovery']) assert.equal(evaluate({ inputs: { [mode]: 'true' } }), false);
});

test('the serialized deploy workflow rechecks fresh main and records actual success before live verification', () => {
  const child = yaml.safeLoad(fs.readFileSync('.github/workflows/fah-fix-and-deploy.yml', 'utf8'));
  assert.deepEqual(child.concurrency, { group: 'fah-deploy', 'cancel-in-progress': false });
  assert.deepEqual(workflow.jobs.deploy.with, { date: '${{ needs.gate.outputs.date }}' });
  assert.equal(child.on.workflow_call.inputs.date.required, true);
  assert.equal(child.on.workflow_dispatch.inputs.date, undefined);
  for (const job of [workflow.jobs.deploy, child.jobs.deploy]) assert.equal(job.permissions.contents, 'write');
  const steps = child.jobs.deploy.steps;
  assert.equal(steps[0].with.ref, 'main');
  const plan = steps.findIndex(step => step.id === 'plan');
  const daily = steps.findIndex(step => step.id === 'daily');
  const verify = steps.findIndex(step => step.run === 'node scripts/verify-live-catalogs.mjs');
  assert.ok(plan > 0 && plan < daily && daily < verify);
  assert.equal(steps[plan].run, 'node scripts/daily-deploy.mjs plan');
  assert.match(steps[daily].run, /node scripts\/daily-deploy\.mjs deploy/);
  assert.equal(steps[daily].env.DAILY_DEPLOY_DATE, '${{ inputs.date }}');
  assert.match(steps[verify].if, /steps\.daily\.outputs\.deployed == 'true'/);
  assert.match(steps.find(step => step.id === 'manual').if, /outputs.mode == 'manual'/);
  assert.ok(steps.some(step => step.run === 'node --test scripts/lib/daily-deploy.test.mjs'));
  assert.ok(steps.some(step => step.uses === 'actions/upload-artifact@v4' && step.if === 'always()' && step.with.path === '.cache/daily-deploy/'));
  assert.doesNotMatch(workflow.jobs['record-slot'].steps.find(step => step.name === 'Record successful work independently').env.PUBLISH_RESULTS, /deploy|newsChanged/);
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

test('saved news recovery restores after a fresh queue and uses the state-aware daily policy', () => {
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
  assert.match(recovery, /node scripts\/social\/publish-slot-plan\.mjs recovery scripts\/social\/publish-slot-state\.json/);
  assert.doesNotMatch(recovery, /echo "deploy=true"|echo "morning=false"/);
  assert.match(workflow.jobs['job-alerts'].if, /outputs.slot != 'recovery'/);
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
