import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {mergeSocialStates, validateSocialState, type SocialHistoryEntry, type SocialState} from './job-social-state';

type Snapshot = Record<string, unknown> & {slug: string; company: string; title: string; id: string; link: string; date: string};
type EvidenceSource = {runId: string; jobId: string; sourceCommit: string};
const suffixes: Record<string, string> = {x: 'x', threads: 'th', bluesky: 'bsky', farcaster: 'fc', linkedin: 'li', facebook: 'fb'};

export function recoverSocialLog(log: string, snapshots: Snapshot[], source: EvidenceSource): SocialState {
  const recovery: SocialState = {lastIndex: 0, postedSlugs: [], pendingSlugs: [], history: []};
  const digest = createHash('sha256').update(log).digest('hex');
  let company = '', title = '', job: Snapshot | undefined;
  const previewLines: string[] = [];
  const seen = new Set<string>();
  for (const line of log.split('\n')) {
    const parsed = line.match(/^post-openings \/ post-opening\t[^\t]+\t(\d{4}-\d\d-\d\dT[\d:.]+Z) (.*)$/);
    if (!parsed) continue;
    const [, at, message] = parsed;
    if (message.startsWith('Selected Job:')) {company = ''; title = ''; job = undefined; previewLines.length = 0;}
    if (message.startsWith('  Company : ')) company = message.slice('  Company : '.length);
    if (message.startsWith('  Role    : ')) title = message.slice('  Role    : '.length);
    if (message.startsWith('  Slug    : ')) {
      const slug = message.slice('  Slug    : '.length);
      const matches = snapshots.filter(snapshot => snapshot.slug === slug && snapshot.company === company && snapshot.title === title);
      if (matches.length !== 1) throw new Error(`Recovery source identity mismatch for ${slug}`);
      job = matches[0];
      if (!job.id || !job.link || !Number.isFinite(Date.parse(job.date))) throw new Error(`Recovery lacks original source identity for ${slug}`);
    }
    if (!job) continue;
    previewLines.push(message);
    let fields: Partial<SocialHistoryEntry> | undefined;
    let match: RegExpMatchArray | null;
    if ((match = message.match(/^✓ Published to X via Buffer: (https:\/\/twitter\.com\/hashtag_web3\/status\/\d+)$/))) {
      fields = {platform: 'x', permalink: match[1], account: 'hashtag_web3', verification: 'verified'};
    } else if ((match = message.match(/^✓ Successfully published to Threads! (https:\/\/www\.threads\.com\/@hashtagweb3\/post\/[\w-]+)$/))) {
      fields = {platform: 'threads', permalink: match[1], account: 'hashtagweb3', verification: 'verified'};
    } else if ((match = message.match(/^✓ Successfully published to Bluesky! Post URI: (at:\/\/did:plc:[a-z0-9]+\/app\.bsky\.feed\.post\/[a-z0-9]+)$/))) {
      fields = {platform: 'bluesky', postId: match[1], verification: 'verified'};
    } else if ((match = message.match(/^✓ Farcaster (main profile|\/[a-z0-9-]+) cast hash: (0x[0-9a-f]{40})$/))) {
      fields = {platform: 'farcaster', postId: match[2], account: match[1] === 'main profile' ? 'profile' : `channel:${match[1].slice(1)}`, verification: 'verified'};
    } else if ((match = message.match(/^LinkedIn (#Web3|CVin\.Bio|Easton Augustine \(personal\)): submitted$/))) {
      fields = {platform: 'linkedin', target: `recovered-label:${match[1]}`, verification: 'quarantined', error: 'Log confirms submission but omits the provider post ID and exact account ID; manual read-only reconciliation required'};
    } else if ((match = message.match(/^✓ Successfully published to Facebook! Post ID: (\*\*\*_\d+)$/))) {
      fields = {platform: 'facebook', verification: 'quarantined', error: 'Log confirms publication but masks the page-ID prefix; full provider receipt requires read-only reconciliation'};
    } else if ((match = message.match(/^✓ Successfully published to Facebook! Post ID: (\d+_\d+)$/))) {
      fields = {platform: 'facebook', postId: match[1], verification: 'verified'};
    }
    if (!fields?.platform) continue;
    const platform = fields.platform;
    const url = `https://hashtagweb3.com/${job.slug}/${suffixes[platform]}?og=7`;
    const prefix = `${job.company} is hiring ${job.title}`;
    const expectedText = ['x', 'farcaster'].includes(platform) ? `${prefix}\n\n${url}` : `${prefix}: ${url}`;
    if (['x', 'farcaster'].includes(platform)
      ? !previewLines.join('\n').includes(expectedText)
      : !previewLines.includes(expectedText)) throw new Error(`Missing exact ${platform} preview text for ${job.slug}`);
    const key = JSON.stringify([job.slug, platform, fields.account || fields.target || platform]);
    if (seen.has(key)) throw new Error(`Ambiguous duplicate log receipt ${key}`);
    seen.add(key);
    recovery.history.push({
      slug: job.slug, company: job.company, title: job.title, platform,
      postedAt: new Date(at).toISOString(), expectedText, snapshot: structuredClone(job),
      evidence: {...source, logSha256: digest, logTimestamp: at, logMessage: message, snapshotPath: 'content/jobs-runtime.json'},
      ...fields,
    });
  }
  for (const job of snapshots) {
    const entries = recovery.history.filter(entry => entry.slug === job.slug);
    if (entries.length !== 24 || entries.filter(entry => entry.platform === 'farcaster').length !== 17
      || entries.filter(entry => entry.platform === 'linkedin').length !== 3) throw new Error(`Incomplete log evidence for ${job.slug}: ${entries.length}/24 targets`);
    recovery.pendingSlugs.push(job.slug);
  }
  validateSocialState(recovery);
  return recovery;
}

export function mergeRecoveredSocialLog(state: SocialState, recovery: SocialState): SocialState {
  return mergeSocialStates(state, recovery);
}

export async function recoverLocalSocialState(options: {log: string; snapshots: string; ledger: string; runId: string; jobId: string; applyLocal?: boolean}) {
  if (!/^\d+$/.test(options.runId) || !/^\d+$/.test(options.jobId)) throw new Error('Expected exact Actions run and job IDs');
  const source = JSON.parse(await fs.readFile(options.snapshots, 'utf8'));
  if (!/^[a-f0-9]{40}$/.test(source.sourceCommit) || !Array.isArray(source.jobs) || !source.jobs.length) throw new Error('Expected pinned source snapshots');
  const log = await fs.readFile(options.log, 'utf8');
  const recovery = recoverSocialLog(log, source.jobs, {runId: options.runId, jobId: options.jobId, sourceCommit: source.sourceCommit});
  const state = JSON.parse(await fs.readFile(options.ledger, 'utf8'));
  const merged = mergeRecoveredSocialLog(state, recovery);
  if (options.applyLocal) {
    const temporary = `${options.ledger}.recovery.tmp`;
    await fs.writeFile(temporary, JSON.stringify(merged, null, 2) + '\n');
    await fs.rename(temporary, options.ledger);
  }
  return {verified: recovery.history.filter(entry => entry.verification === 'verified').length,
    quarantined: recovery.history.filter(entry => entry.verification === 'quarantined').length,
    appliedLocally: !!options.applyLocal, outboundMutations: 0};
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const value = (name: string) => {const index = args.indexOf(name); if (index < 0 || !args[index + 1]) throw new Error(`Missing ${name}`); return args[index + 1];};
  Promise.resolve().then(() => recoverLocalSocialState({log: value('--log'), snapshots: value('--snapshots'),
    ledger: value('--ledger'), runId: value('--run'), jobId: value('--job'), applyLocal: args.includes('--apply-local'),
  })).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {console.error(error.message); process.exitCode = 1;});
}
