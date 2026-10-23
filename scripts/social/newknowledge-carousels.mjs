import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ASSET_DIRECTORY, selectKnowledgeDate, verifyPostLinks } from './newknowledge-content.mjs';
import { providerImageVerifier } from './newknowledge-images.mjs';
import { CAROUSEL_START, CAROUSEL_END, CAROUSEL_PLATFORMS, assertCarouselDate, githubCarouselReceipt, localJournal } from './newknowledge-carousel-state.mjs';
import { carouselProviderClient } from './newknowledge-carousel-providers.mjs';
import { loadCarouselSources, validateCarouselManifest, inspectCarouselExport, carouselSpec, retainClaimedCarouselSpec, verifyPinnedCarouselAssets, providerDocumentVerifier, runCarouselPlatform } from './newknowledge-carousel-publisher.mjs';
import { createInstagramCarouselSpec, instagramCarouselClient, runInstagramCarousel } from './newknowledge-instagram-carousel.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

function redactor(env) {
  const secrets = [env.BUFFER_ACCESS_TOKEN, env.META_PAGE_TOKEN, env.GITHUB_TOKEN].filter(Boolean);
  return value => JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item !== 'string') return item;
    for (const secret of secrets) item = item.replaceAll(secret, '[redacted]').replaceAll(encodeURIComponent(secret), '[redacted]');
    return item;
  }));
}

export async function main(args = process.argv.slice(2), env = process.env, { root = ROOT, clock = Date.now, fetcher = fetch, output = console.log } = {}) {
  const { values } = parseArgs({ args, options: {
    mode: { type: 'string', default: 'preflight' },
    date: { type: 'string', default: env.KNOWLEDGE_CAROUSEL_DATE || '' },
    platform: { type: 'string', default: 'both' },
    slot: { type: 'string', default: env.KNOWLEDGE_SLOT || 'afternoon' },
    'post-id': { type: 'string' },
  } });
  const { mode, platform, slot } = values;
  assert.ok(['plan', 'validate', 'preflight', 'publish', 'reconcile', 'accounts'].includes(mode), 'Unknown carousel mode');
  assert.ok([...CAROUSEL_PLATFORMS, 'both'].includes(platform), 'Unknown carousel platform');
  const recovery = values['post-id'] !== undefined ? { postId: values['post-id'] } : undefined;
  if (recovery) {
    assert.equal(mode, 'reconcile', '--post-id is only allowed for reconcile');
    assert.notEqual(platform, 'both', 'Reconcile one carousel platform at a time');
    assert.match(recovery.postId, /^[\w-]+$/);
  }
  const date = values.date || new Date(clock()).toISOString().slice(0, 10);
  if (!['plan', 'validate', 'accounts'].includes(mode) || values.date) assertCarouselDate(date);
  const targets = platform === 'both' ? CAROUSEL_PLATFORMS : [platform];
  const instagramTransport = env.KNOWLEDGE_INSTAGRAM_TRANSPORT || 'buffer';
  assert.ok(['buffer', 'meta'].includes(instagramTransport), 'Unknown Instagram carousel transport');
  const directInstagram = target => target === 'instagram' && instagramTransport === 'meta';
  const redact = redactor(env);
  const emit = value => output(JSON.stringify(redact(value), null, 2));
  const makeJournal = async (target, folder = date) => {
    const record = await localJournal(path.join(root, '.cache/newknowledge-carousels', folder, target));
    return (value, event) => record(redact(value), event);
  };
  if (mode === 'plan') {
    const calendar = JSON.parse(await fs.readFile(path.join(root, ASSET_DIRECTORY, 'calendar.json'), 'utf8'));
    const plan = date < CAROUSEL_START || date > CAROUSEL_END ? { due: false, reason: 'outside-carousel-campaign' } : selectKnowledgeDate(calendar, { date, slot, now: clock() });
    for (const target of targets) await (await makeJournal(target, 'plan'))(plan, 'plan');
    emit(plan);
    if (env.GITHUB_OUTPUT) await fs.appendFile(env.GITHUB_OUTPUT, `due=${plan.due}\ndate=${plan.entry?.date || ''}\n`);
    return plan;
  }
  if (mode === 'accounts') {
    const results = [];
    for (const target of targets) {
      let journal;
      try {
        journal = await makeJournal(target, 'accounts');
        const client = directInstagram(target) ? instagramCarouselClient({ env, fetcher, readOnly: true }) : carouselProviderClient(target, { env, fetcher, readOnly: true });
        const account = await client.account();
        const result = { platform: target, transport: directInstagram(target) ? 'meta' : 'buffer', status: 'account-verified', account };
        await journal(result, 'account'); results.push(result);
      } catch (error) {
        const result = { platform: target, status: 'stopped', error: redact(error.message) };
        try { await journal?.(result, 'stopped'); } catch { result.journalError = 'Local journal unavailable'; }
        results.push(result);
      }
    }
    emit(results);
    assert.ok(results.every(result => result.status === 'account-verified'), 'Carousel account checks stopped; inspect per-platform journals');
    return results;
  }
  const bundle = await loadCarouselSources(root);
  const entries = validateCarouselManifest(bundle);
  if (mode === 'validate') {
    for (const entry of entries) for (const target of CAROUSEL_PLATFORMS) await inspectCarouselExport(root, bundle, entry, target);
    const result = { status: 'valid', dates: 27, documents: 27, instagramImages: 162, start: CAROUSEL_START, end: CAROUSEL_END };
    for (const target of CAROUSEL_PLATFORMS) await (await makeJournal(target, 'validate'))(result, 'validation');
    emit(result);
    return result;
  }
  const entry = entries.find(entry => entry.date === date);
  assert.ok(entry, 'Missing selected carousel export');
  const plan = selectKnowledgeDate(bundle.calendar, { date, slot, now: clock() });
  const results = [];
  for (const target of targets) {
    let journal;
    try {
      journal = await makeJournal(target);
      await journal({ mode, platform: target, date, threadId: entry.id }, 'run-start');
      const store = githubCarouselReceipt({ date, platform: target, token: env.GITHUB_TOKEN, record: journal, fetcher, readOnly: mode === 'preflight' });
      const state = await store.load();
      if (mode === 'publish' && !plan.due && !state) {
        const result = { platform: target, status: 'skipped', reason: plan.reason };
        await journal(result, 'result'); results.push(result); continue;
      }
      const inspected = await inspectCarouselExport(root, bundle, entry, target);
      const assetCommit = state?.spec.assetCommit || env.KNOWLEDGE_CAROUSEL_ASSET_COMMIT;
      const baseSpec = carouselSpec(bundle, entry, target, inspected, assetCommit);
      const spec = retainClaimedCarouselSpec(directInstagram(target) ? createInstagramCarouselSpec(baseSpec) : baseSpec, state?.spec);
      const events = inspected.sourceThread.freshness && mode !== 'reconcile'
        ? JSON.parse(await fs.readFile(path.join(root, 'content/events-runtime.json'), 'utf8')) : [];
      const runPlatform = directInstagram(target) ? runInstagramCarousel : runCarouselPlatform;
      const result = await runPlatform({
        spec, sourceThread: inspected.sourceThread, calendar: bundle.calendar, events, store, initialState: state, mode, recovery, clock, journal,
        client: directInstagram(target) ? instagramCarouselClient({ env, fetcher, readOnly: mode !== 'publish' }) : carouselProviderClient(target, { env, fetcher, readOnly: mode !== 'publish' || Boolean(state) }),
        verifyAssets: async current => {
          await verifyPinnedCarouselAssets(current, fetcher);
          await verifyPostLinks([{ text: current.caption }], fetcher);
        },
        verifyImage: providerImageVerifier(root, fetcher), verifyDocument: providerDocumentVerifier(fetcher),
      });
      const summary = { platform: target, status: result.status, postId: result.state?.postId, permalink: result.proof?.permalink, proof: result.proof };
      await journal(summary, 'result'); results.push(summary);
    } catch (error) {
      const result = { platform: target, status: 'stopped', error: redact(error.message) };
      results.push(result);
      try { await journal?.(result, 'stopped'); } catch { result.journalError = 'Local journal unavailable'; }
    }
  }
  emit(results);
  if (env.GITHUB_STEP_SUMMARY) await fs.appendFile(env.GITHUB_STEP_SUMMARY, `## Knowledge carousels ${date}\n${results.map(result => `- ${result.platform}: ${result.status}${result.permalink ? ` ${result.permalink}` : ''}`).join('\n')}\n`);
  assert.ok(results.every(result => result.status !== 'stopped'), 'Carousel checks stopped; inspect per-platform journals before reconciliation');
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(redactor(process.env)(error.message)); process.exitCode = 1; });
}
