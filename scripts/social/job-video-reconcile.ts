import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {platforms} from './job-video-core.ts';
import type {Ledger, Platform, Receipt} from './job-video-core.ts';
import {bufferRecover, bufferVerify, instagramFind, instagramVerify} from './job-video-clients.ts';
import {loadState, saveState, validateLedger} from './job-video-state.ts';

export type ReconcileOptions = {slugs: string[]; dryRun: boolean};
export type ReconcileResult = {
  slug: string; platform: Platform;
  status: 'already_sent' | 'verified' | 'unconfirmed' | 'not_attempted';
  previousStatus?: Receipt['status']; previousError?: string;
  postId?: string; url?: string; persisted: boolean; detail?: string;
};
export type ReconcileReport = ReconcileOptions & {results: ReconcileResult[]};

export function parseReconcileOptions(args: string[], env: NodeJS.ProcessEnv): ReconcileOptions {
  let slugs = env.VIDEO_SLUGS || '';
  const dryRun = env.VIDEO_DRY_RUN || 'true';
  if (!['true', 'false'].includes(dryRun)) throw new Error('VIDEO_DRY_RUN must be true or false');
  let mode: boolean | undefined;
  let slugsFlag = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--dry-run' || arg === '--apply') {
      if (mode !== undefined) throw new Error('Choose only one of --dry-run or --apply');
      mode = arg === '--dry-run';
    } else if (arg === '--slugs' || arg.startsWith('--slugs=')) {
      if (slugsFlag) throw new Error('Supply --slugs once');
      slugsFlag = true;
      slugs = arg === '--slugs' ? args[++index] || '' : arg.slice('--slugs='.length);
    } else throw new Error(`Unknown reconciliation argument: ${arg}`);
  }
  const requested = slugs.split(',').map(slug => slug.trim());
  if (requested.length > 2 || requested.some(slug => !/^[\w-]+$/.test(slug) || ['__proto__', 'constructor', 'prototype'].includes(slug)) || new Set(requested).size !== requested.length) {
    throw new Error('Reconciliation requires one or two explicit, distinct existing job slugs (--slugs or VIDEO_SLUGS)');
  }
  return {slugs: requested, dryRun: mode ?? dryRun === 'true'};
}

function requireJobs(ledger: Ledger, slugs: string[]) {
  validateLedger(ledger);
  for (const slug of slugs) {
    if (!Object.hasOwn(ledger.jobs, slug)) throw new Error(`Unknown video job slug: ${slug}`);
  }
}

const clients = {bufferRecover, bufferVerify, instagramFind, instagramVerify};
type Dependencies = typeof clients & {loadState: typeof loadState; saveState: typeof saveState; report: (report: ReconcileReport) => Promise<void>};

async function verifyExisting(platform: Platform, receipt: Receipt, reads: typeof clients): Promise<Receipt> {
  if (receipt.status === 'rejected') throw new Error('Receipt records an explicit rejection; no accepted provider post to verify');
  const candidate = structuredClone(receipt);
  if (platform === 'instagram') {
    if (!candidate.postId) {
      const existing = await reads.instagramFind(candidate);
      if (!existing) throw new Error('No matching published Instagram Reel found; receipt remains unresolved');
      candidate.postId = existing.id;
    }
    if (typeof candidate.postId !== 'string' || !candidate.postId.trim()) throw new Error('Missing recovered Instagram post ID');
    candidate.url = await reads.instagramVerify(candidate.postId, candidate);
  } else {
    if (!candidate.postId) candidate.postId = await reads.bufferRecover(platform, candidate);
    if (typeof candidate.postId !== 'string' || !candidate.postId.trim()) throw new Error('Missing recovered Buffer post ID');
    candidate.url = await reads.bufferVerify(platform, candidate, 1);
  }
  candidate.status = 'sent';
  return candidate;
}

export async function main(args = process.argv.slice(2), env = process.env, overrides: Partial<Dependencies> = {}): Promise<ReconcileReport> {
  const options = parseReconcileOptions(args, env);
  if (!options.dryRun && env.GITHUB_ACTIONS !== 'true') throw new Error('Persisting reconciled video receipts must run in GitHub Actions');
  const deps = {loadState, saveState, ...clients, ...overrides};
  const local = await deps.loadState(false);
  requireJobs(local, options.slugs);
  const ledger = await deps.loadState(true, {readOnly: true});
  requireJobs(ledger, options.slugs);
  const report: ReconcileReport = {...options, results: []};
  const errors: Error[] = [];

  receipts: for (const slug of options.slugs) {
    for (const platform of platforms) {
      const receipt = ledger.jobs[slug].receipts[platform];
      const result: ReconcileResult = {
        slug, platform, status: receipt?.status === 'sent' ? 'already_sent' : 'not_attempted',
        previousStatus: receipt?.status, previousError: receipt?.error, postId: receipt?.postId, url: receipt?.url, persisted: false,
      };
      report.results.push(result);
      if (!receipt || receipt.status === 'sent') continue;
      let verified: Receipt;
      try {
        verified = await verifyExisting(platform, receipt, deps);
        const proposed = structuredClone(ledger);
        proposed.jobs[slug].receipts[platform] = verified;
        validateLedger(proposed);
      } catch (cause) {
        result.status = 'unconfirmed'; result.detail = String(cause);
        errors.push(new Error(`${slug} ${platform} remains unconfirmed: ${String(cause)}`, {cause}));
        continue;
      }
      result.status = 'verified'; result.postId = verified.postId; result.url = verified.url;
      if (options.dryRun) continue;
      ledger.jobs[slug].receipts[platform] = verified;
      try {
        await deps.saveState(ledger, true);
        result.persisted = true;
      } catch (cause) {
        result.detail = `Verified by provider, but ledger persistence failed: ${String(cause)}`;
        errors.push(new Error(`${slug} ${platform}: ${result.detail}`, {cause}));
        try {await deps.saveState(ledger, false);}
        catch (cause) {errors.push(new Error(`Retaining verified local evidence: ${String(cause)}`, {cause}));}
        break receipts;
      }
    }
  }
  try {
    if (deps.report) await deps.report(report);
    else {
      const json = JSON.stringify(report, null, 2);
      console.log(json);
      if (env.GITHUB_STEP_SUMMARY) await fs.appendFile(env.GITHUB_STEP_SUMMARY, `## Job video reconciliation (${options.dryRun ? 'report only' : 'persist verified receipts'})\n\n\`\`\`json\n${json}\n\`\`\`\n`);
    }
  } catch (cause) {errors.push(new Error(`Writing reconciliation report: ${String(cause)}`, {cause}));}
  if (errors.length) throw new AggregateError(errors, `${errors.length} video reconciliation errors; inspect the report and receipt artifacts`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(await fs.realpath(process.argv[1])).href) await main();
