import fs from 'node:fs/promises';
import {assertCapacity, assertPostingTime, captions, matchesSnapshot, platforms, verifyFresh, instagramAccount} from './job-video-core.ts';
import type {LiveJob, Video, Receipt, Platform} from './job-video-core.ts';
import {bufferCreate, bufferRecover, bufferVerify, instagramFind, instagramReady, instagramVerify, meta, verifyAccounts} from './job-video-clients.ts';
import {loadState, saveState} from './job-video-state.ts';

const dryRun = process.argv.includes('--dry-run');
const manual = process.env.VIDEO_MANUAL === 'true';
const slot = process.env.VIDEO_SLOT || 'evening';
const date = process.env.VIDEO_DATE || new Date().toISOString().slice(0, 10);
const key = `${date}:${slot}`;
assertPostingTime(date, slot, manual);
const remote = !dryRun && process.env.GITHUB_ACTIONS === 'true';
if (!dryRun && !remote) throw new Error('Live video publishing must run in GitHub Actions with durable receipts');
const ledger = await loadState(remote);
const library = JSON.parse(await fs.readFile('scripts/social/job-video-library.json', 'utf8')) as Video[];
const response = await fetch('https://hashtagweb3.com/data/jobs-runtime.json', {signal: AbortSignal.timeout(30000)});
if (!response.ok) throw new Error('Cannot load the published job catalog');
const live = await response.json() as LiveJob[];
if (!Array.isArray(live) || live.length < 100) throw new Error('Unexpected published catalog');
const current = new Map(live.map(job => [job.slug, job]));
const requested = (process.env.VIDEO_SLUGS || '').split(',').map(s => s.trim()).filter(Boolean);
if (requested.length > 2) throw new Error('At most two requested videos per run');
let selected = [...(ledger.slots[key] || [])];
if (!selected.length) {
  const ranked = library.filter(video => !ledger.jobs[video.slug] && current.has(video.slug) && matchesSnapshot(video, current.get(video.slug)!))
    .sort((a, b) => Date.parse(current.get(b.slug)?.date || '1970-01-01') - Date.parse(current.get(a.slug)?.date || '1970-01-01'));
  const candidates = requested.length ? requested.map(slug => library.find(video => video.slug === slug)).filter((v): v is Video => !!v) : ranked;
  for (const video of candidates.slice(0, 150)) {
    if (selected.length === 2) break;
    if (ledger.jobs[video.slug]) continue;
    try {
      const job = current.get(video.slug);
      if (!job) throw new Error('Job is absent from the live catalog');
      await verifyFresh(video, job);
      assertCapacity(ledger, key, selected.length + 1);
      selected.push(video.slug);
      console.log(`Verified ${video.slug} — ${video.company} / ${video.title}`);
    } catch (error) {console.log(`Skipped ${video.slug} — ${String(error)}`);}
  }
  if (selected.length !== 2) throw new Error(`Need two fresh hosted videos, found ${selected.length}`);
  if (dryRun) {
    console.log(JSON.stringify(selected.map(slug => ({slug, ...captions(library.find(v => v.slug === slug)!)})), null, 2));
    process.exit(0);
  }
  await verifyAccounts();
  ledger.slots[key] = selected;
  for (const slug of selected) ledger.jobs[slug] = {slot: key, selectedAt: new Date().toISOString(), verifiedAt: new Date().toISOString(), captions: captions(library.find(v => v.slug === slug)!), receipts: {}};
  await saveState(ledger, remote);
} else {
  if (dryRun) {console.log(`Existing batch ${key}: ${selected.join(', ')}`); process.exit(0);}
  await verifyAccounts();
}

async function publish(platform: Platform, video: Video) {
  const delivery = ledger.jobs[video.slug];
  let receipt = delivery.receipts[platform];
  if (receipt?.status === 'sent') {console.log(`Already sent ${platform} ${video.slug} ${receipt.url}`); return;}
  if (!receipt || receipt.status === 'rejected') {
    assertPostingTime(date, slot, manual);
    const job = current.get(video.slug);
    if (!job) throw new Error('Job is no longer active');
    await verifyFresh(video, job);
    receipt = {status: 'creating', text: delivery.captions[platform], startedAt: new Date().toISOString()};
    delivery.receipts[platform] = receipt;
    await saveState(ledger, remote);
    if (platform === 'instagram') {
      const result = await meta<{id: string}>(`${instagramAccount}/media`, {media_type: 'REELS', video_url: video.videoUrl, caption: receipt.text, share_to_feed: 'true'});
      if (!result.id) throw new Error('Instagram returned no container ID');
      receipt.containerId = result.id;
    } else {
      const result = await bufferCreate(platform, video, receipt.text, delivery.captions.youtubeTitle);
      if (!result.id) {
        receipt.status = 'rejected'; receipt.error = result.error || 'Buffer returned no post ID';
        await saveState(ledger, remote);
        throw new Error(receipt.error);
      }
      receipt.postId = result.id;
    }
    receipt.status = 'pending';
    await saveState(ledger, remote);
  }
  if (platform !== 'instagram') {
    if (!receipt.postId) {receipt.postId = await bufferRecover(platform, receipt); receipt.status = 'pending'; await saveState(ledger, remote);}
    receipt.url = await bufferVerify(platform, receipt);
  } else {
    if (!receipt.postId && (receipt.status === 'publishing' || !receipt.containerId)) {
      const existing = await instagramFind(receipt);
      if (!existing) throw new Error('Ambiguous Instagram mutation needs reconciliation before retrying');
      receipt.postId = existing.id;
      await saveState(ledger, remote);
    }
    if (!receipt.postId) {
      if (!receipt.containerId) throw new Error('Missing Instagram container');
      const status = await instagramReady(receipt.containerId);
      if (status === 'PUBLISHED') {
        const existing = await instagramFind(receipt);
        if (!existing) throw new Error('Published Instagram container needs receipt recovery');
        receipt.postId = existing.id;
      } else {
        assertPostingTime(date, slot, manual);
        receipt.status = 'publishing';
        await saveState(ledger, remote);
        const result = await meta<{id: string}>(`${instagramAccount}/media_publish`, {creation_id: receipt.containerId});
        if (!result.id) throw new Error('Instagram returned no published media ID');
        receipt.postId = result.id;
      }
      await saveState(ledger, remote);
    }
    receipt.url = await instagramVerify(receipt.postId);
  }
  receipt.status = 'sent'; delete receipt.error;
  await saveState(ledger, remote);
  console.log(`Published ${platform} ${video.slug} ${receipt.url}`);
}

const errors: string[] = [];
for (const slug of selected) {
  const video = library.find(v => v.slug === slug)!;
  for (const platform of platforms) {
    try {await publish(platform, video);}
    catch (error) {
      const message = `${slug} ${platform} — ${String(error)}`;
      errors.push(message); console.error(message);
      const receipt = ledger.jobs[slug].receipts[platform];
      if (receipt) {receipt.error = String(error); await saveState(ledger, remote);}
    }
  }
}
const summary = selected.flatMap(slug => platforms.map(platform => {
  const receipt = ledger.jobs[slug].receipts[platform];
  return `| ${slug} | ${platform} | ${receipt?.status || 'not sent'} | ${receipt?.url || ''} |`;
}));
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `## Job videos ${key}\n\n| Job | Platform | Status | Post |\n|---|---|---|---|\n${summary.join('\n')}\n`);
if (errors.length) throw new Error(`${errors.length} deliveries require attention; all receipts retained`);
