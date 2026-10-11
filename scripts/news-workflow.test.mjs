import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const yaml = createRequire(require.resolve('gray-matter'))('js-yaml');
const workflow = yaml.safeLoad(fs.readFileSync('.github/workflows/refresh-jobs-cache.yml', 'utf8'));

test('one daily research batch feeds the existing single daily deployment gate', () => {
  assert.match(workflow.jobs['publish-news'].if, /outputs.news == 'true'/);
  assert.match(workflow.jobs.deploy.if, /outputs.deploy == 'true'/);
  assert.doesNotMatch(workflow.jobs.deploy.if, /articles_changed/);
  assert.equal(workflow.jobs['publish-news'].concurrency.group, 'publish-news');
  assert.equal(workflow.jobs['publish-news'].steps[0].with.ref, 'main');
  assert.equal(workflow.jobs['refresh-and-post'].steps[0].with.ref, 'main');
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
  assert.deepEqual(recorded(ingest.jobs.ingest.steps).sort(), ['companies-runtime', 'jobs-runtime', 'sitemap', 'slug-types']);
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
