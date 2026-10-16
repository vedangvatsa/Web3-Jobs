import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {recoverSocialLog, recoverLocalSocialState, mergeRecoveredSocialLog} from './job-social-recovery';
import {deliverSocialPost, hasVerifiedPostReceipt, type SocialState} from './job-social-state';

const job = {slug: 'cmp101', id: 'source-id', company: 'Lightspark', title: 'Regulatory Compliance Officer, EU',
  link: 'https://jobs.ashbyhq.com/lightspark/source-id', date: '2026-10-07T20:39:58.850+00:00', dateVerified: true, source: 'Ashby: Lightspark [lightspark]'};
const source = {runId: '38845857095', jobId: '116808941178', sourceCommit: '8e06e755f7b7da08a0a7b124f33a698be092be22'};
const empty = (): SocialState => ({lastIndex: 424, postedSlugs: [], pendingSlugs: [], history: []});
function fixture() {
  const messages = ['Selected Job:', `  Company : ${job.company}`, `  Role    : ${job.title}`, `  Slug    : ${job.slug}`];
  for (const suffix of ['x', 'th', 'bsky', 'fc', 'li', 'fb']) {
    const prefix = `${job.company} is hiring ${job.title}`, url = `https://hashtagweb3.com/${job.slug}/${suffix}?og=7`;
    messages.push(...(['x', 'fc'].includes(suffix) ? [prefix, '', url] : [`${prefix}: ${url}`]));
  }
  messages.push('✓ Published to X via Buffer: https://twitter.com/hashtag_web3/status/2110949086517956611',
    '✓ Successfully published to Threads! https://www.threads.com/@hashtagweb3/post/DeiqX8TlAgR',
    '✓ Successfully published to Bluesky! Post URI: at://did:plc:bqovopfvzkltgp4cmxvq72uh/app.bsky.feed.post/3mxxpz7i6ow2g');
  for (const [index, target] of ['main profile', '/jobs', '/web3', '/bounties', '/crypto', '/dev', '/developers', '/build', '/founders', '/base', '/ethereum', '/solana', '/defi', '/ai', '/product', '/design', '/growth'].entries()) {
    messages.push(`✓ Farcaster ${target} cast hash: 0x${(index + 1).toString(16).padStart(40, '0')}`);
  }
  messages.push('LinkedIn #Web3: submitted', 'LinkedIn CVin.Bio: submitted', 'LinkedIn Easton Augustine (personal): submitted',
    '✓ Successfully published to Facebook! Post ID: ***_1116928077581093');
  return messages.map(message => `post-openings / post-opening\tUNKNOWN STEP\t2026-10-16T04:21:42.6046370Z ${message}`).join('\n');
}

test('log recovery preserves exact identity, original dates, URLs and source text without inventing missing IDs', () => {
  const recovered = recoverSocialLog(fixture(), [job], source);
  assert.equal(recovered.history.length, 24);
  assert.equal(recovered.history.filter(hasVerifiedPostReceipt).length, 20);
  assert.equal(recovered.history.filter(entry => entry.verification === 'quarantined').length, 4);
  for (const entry of recovered.history) {
    assert.deepEqual(entry.snapshot, job);
    assert.equal(entry.evidence?.sourceCommit, source.sourceCommit);
    assert.match(entry.expectedText!, /https:\/\/hashtagweb3\.com\/cmp101\/(?:x|th|bsky|fc|li|fb)\?og=7$/);
    if (['x', 'threads', 'linkedin', 'facebook'].includes(entry.platform)) assert.equal(entry.postId, undefined);
  }
  const state = empty();
  state.postedSlugs.push('older-job'); state.lastIndex = 91;
  const merged = mergeRecoveredSocialLog(state, recovered);
  assert.deepEqual(merged.postedSlugs, ['older-job']);
  assert.deepEqual(merged.pendingSlugs, ['cmp101']);
  assert.equal(merged.lastIndex, 91);
  assert.deepEqual(mergeRecoveredSocialLog(merged, recovered), merged);
});

test('changed source identity, preview text, malformed IDs, incomplete and duplicate evidence cannot recover', () => {
  for (const change of [{company: 'Other'}, {title: 'Other'}, {slug: 'other'}, {date: 'invalid'}, {id: ''}]) {
    assert.throws(() => recoverSocialLog(fixture(), [{...job, ...change}], source), /identity|evidence/);
  }
  for (const log of [fixture().replace('/cmp101/th?og=7', '/other/th?og=7'), fixture().replace('Post URI: at://', 'Post URI: unknown://'),
    fixture().replace('LinkedIn CVin.Bio: submitted', 'LinkedIn CVin.Bio: failed'), fixture() + '\n' + fixture().split('\n').at(-1)]) {
    assert.throws(() => recoverSocialLog(log, [job], source), /preview|Incomplete|duplicate/);
  }
});

test('all recovered targets, including quarantine, block duplicate POSTs independently of job age', async () => {
  const state = recoverSocialLog(fixture(), [{...job, date: '2024-01-01T00:00:00Z'}], source);
  let mutations = 0, checks = 0;
  for (const entry of state.history) {
    const attempt = deliverSocialPost({state, entry, beforeSend: async () => {checks++;}, save: async () => {}, send: async () => {mutations++; return 'duplicate';}});
    if (entry.verification === 'quarantined') await assert.rejects(attempt, /read-only reconciliation/);
    else await attempt;
  }
  const ambiguous = state.history.find(entry => entry.platform === 'linkedin')!;
  await assert.rejects(deliverSocialPost({state, entry: {...ambiguous, target: undefined, account: 'actual-buffer-channel'},
    beforeSend: async () => {checks++;}, save: async () => {}, send: async () => {mutations++; return 'duplicate';}}), /read-only reconciliation/);
  assert.equal(mutations, 0); assert.equal(checks, 0);
});

test('recovery defaults to report-only and explicit local apply is idempotent with zero network requests', async t => {
  const directory = await fs.mkdtemp(join(tmpdir(), 'social-recovery-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  t.mock.method(globalThis, 'fetch', async () => {throw new Error('Recovery must not contact any provider or GitHub');});
  const log = join(directory, 'evidence.log'), snapshots = join(directory, 'sources.json'), ledger = join(directory, 'ledger.json');
  await fs.writeFile(log, fixture());
  await fs.writeFile(snapshots, JSON.stringify({sourceCommit: source.sourceCommit, jobs: [job]}));
  const before = JSON.stringify(empty()); await fs.writeFile(ledger, before);
  const options = {log, snapshots, ledger, runId: source.runId, jobId: source.jobId};
  assert.deepEqual(await recoverLocalSocialState(options), {verified: 20, quarantined: 4, appliedLocally: false, outboundMutations: 0});
  assert.equal(await fs.readFile(ledger, 'utf8'), before);
  await recoverLocalSocialState({...options, applyLocal: true});
  const once = await fs.readFile(ledger, 'utf8');
  await recoverLocalSocialState({...options, applyLocal: true});
  assert.equal(await fs.readFile(ledger, 'utf8'), once);
  assert.equal(JSON.parse(once).history.length, 24);
});
