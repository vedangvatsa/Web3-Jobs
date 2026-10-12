import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {assertCapacity, assertPostingTime, captions, diverseCompanies, matchesSnapshot, platforms, verifyFresh, instagramAccount} from './job-video-core.ts';
import type {Ledger, LiveJob, Video, Platform} from './job-video-core.ts';
import {bufferCreate, bufferRecover, bufferVerify, instagramFind, instagramReady, instagramVerify, meta, verifyAccounts} from './job-video-clients.ts';
import {loadState, saveState, receiptErrors, VideoStateError} from './job-video-state.ts';

const publisherDependencies = {assertPostingTime, verifyFresh, bufferCreate, bufferRecover, bufferVerify, instagramFind, instagramReady, instagramVerify, meta};
type PublishContext = {ledger: Ledger; date: string; slot: string; manual: boolean; current: Map<string, LiveJob>; save: () => Promise<void>};

export function createVideoPublisher(context: PublishContext, overrides: Partial<typeof publisherDependencies> = {}) {
  const {ledger, date, slot, manual, current, save} = context;
  const clients = {...publisherDependencies, ...overrides};
  return async function publish(platform: Platform, video: Video) {
    const delivery = ledger.jobs[video.slug];
    let receipt = delivery.receipts[platform];
    if (receipt?.status === 'sent') {console.log(`Already sent ${platform} ${video.slug} ${receipt.url}`); return;}
    if (!receipt || receipt.status === 'rejected') {
      clients.assertPostingTime(date, slot, manual);
      const job = current.get(video.slug);
      if (!job) throw new Error('Job is no longer active');
      await clients.verifyFresh(video, job);
      receipt = {status: 'creating', text: delivery.captions[platform], startedAt: new Date().toISOString(), attemptId: randomUUID()};
      delivery.receipts[platform] = receipt;
      await save();
      if (receipt.status === 'creating' && !receipt.postId && !receipt.containerId) {
        if (platform === 'instagram') {
          const result = await clients.meta<{id: string}>(`${instagramAccount}/media`, {media_type: 'REELS', video_url: video.videoUrl, caption: receipt.text, share_to_feed: 'true'});
          if (!result.id) throw new Error('Instagram returned no container ID');
          receipt.containerId = result.id;
        } else {
          const result = await clients.bufferCreate(platform, video, receipt.text, delivery.captions.youtubeTitle);
          if (!result.id) {
            if (result.error) {
              receipt.status = 'rejected'; receipt.error = receiptErrors(receipt.error, result.error);
              await save();
            }
            throw new Error(result.error || 'Buffer returned no post ID; creation needs reconciliation before retrying');
          }
          receipt.postId = result.id;
        }
        receipt.status = 'pending';
        await save();
      }
    }
    if (platform !== 'instagram') {
      if (!receipt.postId) {receipt.postId = await clients.bufferRecover(platform, receipt); receipt.status = 'pending'; await save();}
      receipt.url = await clients.bufferVerify(platform, receipt);
    } else {
      if (!receipt.postId && (receipt.status === 'publishing' || !receipt.containerId)) {
        const existing = await clients.instagramFind(receipt);
        if (!existing) throw new Error('Ambiguous Instagram mutation needs reconciliation before retrying');
        receipt.postId = existing.id;
        await save();
      }
      if (!receipt.postId) {
        if (!receipt.containerId) throw new Error('Missing Instagram container');
        const status = await clients.instagramReady(receipt.containerId);
        if (status === 'PUBLISHED') {
          const existing = await clients.instagramFind(receipt);
          if (!existing) throw new Error('Published Instagram container needs receipt recovery');
          receipt.postId = existing.id;
        } else {
          clients.assertPostingTime(date, slot, manual);
          receipt.status = 'publishing';
          receipt.publishAttemptId = randomUUID();
          await save();
          if (!receipt.postId) {
            const result = await clients.meta<{id: string}>(`${instagramAccount}/media_publish`, {creation_id: receipt.containerId});
            if (!result.id) throw new Error('Instagram returned no published media ID');
            receipt.postId = result.id;
          }
        }
        await save();
      }
      receipt.url = await clients.instagramVerify(receipt.postId);
    }
    receipt.status = 'sent';
    await save();
    console.log(`Published ${platform} ${video.slug} ${receipt.url}`);
  };
}

type BatchOptions = {
  ledger: Ledger; selected: string[];
  publish: (slug: string, platform: Platform) => Promise<void>;
  save: () => Promise<void>; retain: () => Promise<void>;
  summarize: (errors: Error[]) => Promise<void>;
};

export async function runVideoBatch({ledger, selected, publish, save, retain, summarize}: BatchOptions): Promise<void> {
  const errors: Error[] = [];
  deliveries: for (const slug of selected) {
    for (const platform of platforms) {
      try {await publish(slug, platform);}
      catch (cause) {
        const error = new Error(`${slug} ${platform}: ${String(cause)}`, {cause});
        errors.push(error); console.error(error.message);
        const receipt = ledger.jobs[slug].receipts[platform];
        if (receipt) receipt.error = receiptErrors(receipt.error, String(cause));
        let persistenceFailed = cause instanceof VideoStateError;
        if (!persistenceFailed) {
          try {await save();}
          catch (cause) {
            errors.push(new Error(`Saving ${slug} ${platform} failure: ${String(cause)}`, {cause}));
            persistenceFailed = true;
          }
        }
        if (persistenceFailed) {
          try {await retain();}
          catch (cause) {errors.push(new Error(`Retaining local video evidence: ${String(cause)}`, {cause}));}
          break deliveries;
        }
      }
    }
  }
  try {await summarize(errors);}
  catch (cause) {errors.push(new Error(`Writing video summary: ${String(cause)}`, {cause}));}
  if (errors.length) throw new AggregateError(errors, `${errors.length} video delivery/persistence errors; inspect the video receipt artifacts before recovery`);
}

export async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const manual = process.env.VIDEO_MANUAL === 'true';
  const slot = process.env.VIDEO_SLOT || 'evening';
  const date = process.env.VIDEO_DATE || new Date().toISOString().slice(0, 10);
  const key = `${date}:${slot}`;
  assertPostingTime(date, slot, manual);
  const remote = !dryRun && process.env.GITHUB_ACTIONS === 'true';
  if (!dryRun && !remote) throw new Error('Live video publishing must run in GitHub Actions with durable receipts');
  const ledger = await loadState(remote);
  if (remote) await saveState(ledger, true);
  const library = JSON.parse(await fs.readFile('scripts/social/job-video-library.json', 'utf8')) as Video[];
  const response = await fetch('https://hashtagweb3.com/data/jobs-runtime.json', {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error('Cannot load the published job catalog');
  const live = await response.json() as LiveJob[];
  if (!Array.isArray(live) || live.length < 100) throw new Error('Unexpected published catalog');
  const current = new Map(live.map(job => [job.slug, job]));
  const requested = (process.env.VIDEO_SLUGS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (requested.length > 2) throw new Error('At most two requested videos per run');
  const selected = [...(ledger.slots[key] || [])];
  if (!selected.length) {
    const ranked = library.filter(video => !ledger.jobs[video.slug] && current.has(video.slug) && matchesSnapshot(video, current.get(video.slug)!))
      .sort((a, b) => Date.parse(current.get(b.slug)?.date || '1970-01-01') - Date.parse(current.get(a.slug)?.date || '1970-01-01'));
    const candidates = requested.length ? requested.map(slug => library.find(video => video.slug === slug)).filter((v): v is Video => !!v) : diverseCompanies(ranked.slice(0, 150));
    for (const video of candidates.slice(0, 150)) {
      if (selected.length === 2) break;
      if (ledger.jobs[video.slug]) continue;
      try {
        const job = current.get(video.slug);
        if (!job) throw new Error('Job is absent from the live catalog');
        await verifyFresh(video, job);
        assertCapacity(ledger, key, selected.length + 1);
        selected.push(video.slug);
        console.log(`Verified ${video.slug}: ${video.company} / ${video.title}`);
      } catch (error) {console.log(`Skipped ${video.slug}: ${String(error)}`);}
    }
    if (selected.length !== 2) throw new Error(`Need two fresh hosted videos, found ${selected.length}`);
    if (dryRun) {
      console.log(JSON.stringify(selected.map(slug => ({slug, ...captions(library.find(v => v.slug === slug)!)})), null, 2));
      return;
    }
    await verifyAccounts();
    ledger.slots[key] = selected;
    for (const slug of selected) ledger.jobs[slug] = {slot: key, selectedAt: new Date().toISOString(), verifiedAt: new Date().toISOString(), reservationId: randomUUID(), captions: captions(library.find(v => v.slug === slug)!), receipts: {}};
    await saveState(ledger, remote);
  } else {
    if (dryRun) {console.log(`Existing batch ${key}: ${selected.join(', ')}`); return;}
    await verifyAccounts();
  }
  const save = () => saveState(ledger, remote);
  const publish = createVideoPublisher({ledger, date, slot, manual, current, save});
  await runVideoBatch({
    ledger, selected, save, retain: () => saveState(ledger, false),
    publish: (slug, platform) => {
      const video = library.find(v => v.slug === slug);
      if (!video) throw new Error(`Reserved video ${slug} is missing from the library`);
      return publish(platform, video);
    },
    summarize: async errors => {
      const rows = selected.flatMap(slug => platforms.map(platform => {
        const receipt = ledger.jobs[slug].receipts[platform];
        return `| ${slug} | ${platform} | ${receipt?.status || 'not sent'} | ${receipt?.postId || receipt?.containerId || ''} | ${receipt?.url || ''} |`;
      }));
      if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `## Job videos ${key}\n\n| Job | Platform | Status | Provider ID | Post |\n|---|---|---|---|---|\n${rows.join('\n')}\n\n${errors.map(error => `- ${error.message}`).join('\n')}\n`);
    },
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(await fs.realpath(process.argv[1])).href) await main();
