import assert from 'node:assert/strict';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ASSET_DIRECTORY, CAMPAIGN, sha256, renderThread, validateCampaign, selectKnowledgeDate, verifyPostLinks, assertThreadResourceFreshness } from './newknowledge-content.mjs';
import { githubReceipt, localJournal } from './newknowledge-state.mjs';
import { inspectImages, pinnedImages, verifyPinnedImages, providerImageVerifier } from './newknowledge-images.mjs';
import { providerClient } from './newknowledge-providers.mjs';
import { runKnowledgePlatform } from './newknowledge-publisher.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const WORK = path.join(ROOT, '.cache/newknowledge');

export async function main(args = process.argv.slice(2), env = process.env) {
  const { values } = parseArgs({ args, options: {
    mode: { type: 'string', default: 'validate' },
    date: { type: 'string', default: env.KNOWLEDGE_DATE || '' },
    slot: { type: 'string', default: env.KNOWLEDGE_SLOT || 'afternoon' },
    platform: { type: 'string', default: 'both' },
    'content-only': { type: 'boolean', default: false },
    'post-id': { type: 'string' },
    'post-number': { type: 'string' },
  } });
  const { mode, platform, slot } = values;
  assert.ok(['plan', 'validate', 'preflight', 'publish', 'reconcile'].includes(mode), 'Unknown mode');
  assert.ok(['x', 'threads', 'both'].includes(platform), 'Unknown platform');
  if (values['content-only']) assert.equal(mode, 'validate', '--content-only is offline validation only');
  const recovery = values['post-id'] ? { postId: values['post-id'], index: Number(values['post-number'] || 1) } : undefined;
  if (recovery) {
    assert.equal(mode, 'reconcile', 'IDs can only be supplied for read-only provider reconciliation');
    assert.notEqual(platform, 'both', 'Reconcile one platform at a time');
    assert.match(recovery.postId, /^[\w-]+$/);
    assert.ok(Number.isInteger(recovery.index) && recovery.index >= 1 && recovery.index <= 6);
  }
  const journal = await localJournal(WORK);
  await journal({ mode, platform, date: values.date || null }, 'run-start');
  const content = JSON.parse(await fs.readFile(path.join(ROOT, ASSET_DIRECTORY, 'content.json'), 'utf8'));
  const calendar = JSON.parse(await fs.readFile(path.join(ROOT, ASSET_DIRECTORY, 'calendar.json'), 'utf8'));
  const threads = validateCampaign(content, calendar);
  const flags = Object.fromEntries(['website_recovery', 'only_news', 'news_dry_run', 'dry_run', 'diagnose_telegram', 'diagnose_content', 'diagnose'].map(key => [key, env[`KNOWLEDGE_${key.toUpperCase()}`]]));
  const plan = selectKnowledgeDate(calendar, { date: values.date || undefined, slot, flags });
  if (mode === 'plan' || (mode === 'publish' && !plan.due)) {
    await journal(plan, 'plan');
    console.log(JSON.stringify(plan));
    if (env.GITHUB_OUTPUT) await fs.appendFile(env.GITHUB_OUTPUT, `due=${plan.due}\ndate=${plan.entry?.date || ''}\n`);
    return plan;
  }
  if (mode === 'validate') {
    for (const thread of threads) if (!values['content-only']) await inspectImages(ROOT, renderThread(thread, 'x'), { thread });
    const result = { status: 'valid', dates: 30, posts: 180, start: calendar.start, end: calendar.end, imagesChecked: !values['content-only'] };
    await journal(result, 'validation');
    console.log(JSON.stringify(result));
    return result;
  }
  const date = values.date || new Date().toISOString().slice(0, 10);
  const entry = calendar.dates.find(item => item.date === date);
  assert.ok(entry, 'Choose a date in the campaign calendar');
  const thread = threads.find(item => item.id === entry.id);

  // If a Matrix visual is scheduled for this date (2026-10-29 onwards),
  // supersede legacy thread and publish across X, LinkedIn, and Threads!
  const matrixManifestPath = path.join(ROOT, 'social-assets/matrices-campaign/manifest.json');
  if (fsSync.existsSync(matrixManifestPath) && mode !== 'validate' && date >= '2026-10-29') {
    const { getPostForDate, publishMatrixPost } = await import('./publish-matrix-social.mjs');
    const matrixPost = getPostForDate(date);
    if (matrixPost) {
      console.log(`[newknowledge] Superseding legacy thread with Matrix Visual #${matrixPost.index}: "${matrixPost.title}" (${date}) across X, LinkedIn, and Threads`);
      const matrixResult = await publishMatrixPost({ post: matrixPost, mode, env });
      return matrixResult;
    }
  }

  const results = [], failures = [];
  for (const target of platform === 'both' ? ['x', 'threads'] : [platform]) {
    const record = await localJournal(path.join(WORK, date, target));
    try {
      const store = githubReceipt({ date, platform: target, token: env.GITHUB_TOKEN, record });
      const state = await store.load();
      if (thread.freshness && mode !== 'reconcile') {
        const events = JSON.parse(await fs.readFile(path.join(ROOT, 'content/events-runtime.json'), 'utf8'));
        const reviewAt = Math.max(Date.now(), Date.parse(`${date}T11:30:00Z`));
        assertThreadResourceFreshness(thread, events, reviewAt);
        await record({ threadId: thread.id, eventIds: thread.freshness.eventIds, reviewedAt: new Date(reviewAt).toISOString() }, 'resource-freshness');
      }
      const posts = renderThread(thread, target);
      const assets = await inspectImages(ROOT, posts, { thread });
      const assetCommit = state?.spec.assetCommit || env.KNOWLEDGE_ASSET_COMMIT;
      const spec = { campaign: CAMPAIGN, date, threadId: thread.id, sequence: thread.sequence, platform: target, assetCommit, contentDigest: sha256(JSON.stringify({ thread, posts, assets })), posts, assets: pinnedImages(assets, assetCommit) };
      if (state) assert.deepEqual(state.spec, spec, 'Content or images changed after claim');
      await record({ spec, mode }, 'preflight');
      await verifyPinnedImages(spec.assets);
      await verifyPostLinks(posts);
      const result = await runKnowledgePlatform({
        spec, store, initialState: state, mode, recovery,
        client: providerClient(target, { env, readOnly: mode !== 'publish' }),
        verifyImage: providerImageVerifier(ROOT),
        journal: async (data, event) => record(data, event),
      });
      results.push({ platform: target, status: result.status, permalink: result.state?.permalink });
      await record(result, 'result');
    } catch (error) {
      failures.push(target);
      results.push({ platform: target, status: 'stopped', error: error.message });
      await record({ error: error.message }, 'stopped');
    }
  }
  console.log(JSON.stringify(results, null, 2));
  await journal(results, 'results');
  if (env.GITHUB_STEP_SUMMARY) await fs.appendFile(env.GITHUB_STEP_SUMMARY, `## Knowledge thread ${date}\n${results.map(result => `- ${result.platform}: ${result.status}${result.permalink ? ` ${result.permalink}` : ''}${result.error ? ` (${result.error})` : ''}`).join('\n')}\n`);
  assert.equal(failures.length, 0, `Knowledge publishing stopped for ${failures.join(', ')}; inspect the journal before reconciliation`);
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
