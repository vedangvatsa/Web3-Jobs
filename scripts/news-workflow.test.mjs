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
