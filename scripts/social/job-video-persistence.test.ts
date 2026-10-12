import test from 'node:test';
import type {TestContext} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStateStore, mergeLedgers, validateLedger, VideoStateError} from './job-video-state.ts';
import {createVideoPublisher, runVideoBatch} from './post-job-videos.ts';
import type {Ledger, Receipt, Video} from './job-video-core.ts';

const slot = '2026-10-12:afternoon';
const at = '2026-10-12T11:31:00.000Z';
const empty = (): Ledger => ({version: 1, slots: {}, jobs: {}});
function fixture(): Ledger {
  const ledger = empty();
  ledger.slots[slot] = ['first', 'second'];
  for (const slug of ledger.slots[slot]) ledger.jobs[slug] = {
    slot, selectedAt: at, verifiedAt: at, reservationId: `reservation-${slug}`,
    captions: {instagram: 'Job caption', youtube: 'Job caption', tiktok: 'Job caption', youtubeTitle: 'Job title'}, receipts: {},
  };
  return ledger;
}
const pending = (changes: Partial<Receipt> = {}): Receipt => ({status: 'pending', text: 'Job caption', startedAt: at, attemptId: 'attempt-first', postId: 'post-1', ...changes});
const sent = (changes: Partial<Receipt> = {}): Receipt => pending({status: 'sent', url: 'https://www.youtube.com/watch?v=video-1', ...changes});
const video: Video = {slug: 'first', company: 'Example', title: 'Engineer', facts: [], mode: 'catalog-source', videoUrl: 'https://example.com/video.mp4', bytes: 10, descriptionHash: null, snapshot: {slug: 'first', id: '1', company: 'Example', title: 'Engineer', link: 'https://example.com/job', date: new Date(Date.now() - 86400000).toISOString()}};
const conflict = () => Response.json({message: 'Conflict'}, {status: 409});

class ContentsServer {
  state: Ledger;
  sha = 'sha-1';
  revision = 1;
  gets = 0;
  puts: {sha: string; state: Ledger}[] = [];
  onPut?: (state: Ledger, sha: string, attempt: number) => Response | undefined;
  onGet?: (attempt: number) => Response | undefined;
  constructor(state: Ledger) {this.state = structuredClone(state);}
  change(state: Ledger) {this.state = structuredClone(state); this.sha = `sha-${++this.revision}`;}
  contents(state = this.state, sha = this.sha) {return Response.json({sha, content: Buffer.from(JSON.stringify(state)).toString('base64'), encoding: 'base64'});}
  request: typeof fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/api\.github\.com\/repos\/vedangvatsa\/Web3-Jobs\/contents\/scripts\/social\/job-video-state\.json/);
    if (options?.method === 'GET') {
      assert.equal(new URL(String(url)).searchParams.get('ref'), 'main');
      this.gets++;
      return this.onGet?.(this.gets) || this.contents();
    }
    assert.equal(options?.method, 'PUT');
    const body: unknown = JSON.parse(String(options.body));
    assert.ok(body && typeof body === 'object' && 'sha' in body && 'content' in body && 'branch' in body);
    assert.equal(typeof body.sha, 'string'); assert.equal(body.branch, 'main');
    const state: unknown = JSON.parse(Buffer.from(String(body.content), 'base64').toString());
    validateLedger(state);
    const sha = String(body.sha);
    this.puts.push({sha, state});
    const response = this.onPut?.(state, sha, this.puts.length);
    if (response) return response;
    if (sha !== this.sha) return Response.json({message: 'sha does not match current blob'}, {status: 409});
    this.change(state);
    return Response.json({content: {sha: this.sha}});
  };
}

async function harness(t: TestContext, remote = fixture(), disk = remote, shared?: ContentsServer) {
  const directory = await fs.mkdtemp(join(tmpdir(), 'job-video-persistence-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const file = join(directory, 'state.json');
  await fs.writeFile(file, JSON.stringify(disk));
  const server = shared || new ContentsServer(remote);
  const sleeps: number[] = [];
  const store = createStateStore({file, request: server.request, token: 'offline-test', sleep: async ms => {sleeps.push(ms);}});
  const read = async () => {
    const value: unknown = JSON.parse(await fs.readFile(file, 'utf8'));
    validateLedger(value); return value;
  };
  const journal = async () => (await fs.readFile(join(directory, 'state.recovery.jsonl'), 'utf8')).trim().split('\n').map(line => {
    const entry: unknown = JSON.parse(line);
    assert.ok(entry && typeof entry === 'object' && 'state' in entry);
    validateLedger(entry.state); return entry.state;
  });
  return {store, server, sleeps, read, journal, file};
}

function publisher(ledger: Ledger, store: ReturnType<typeof createStateStore>, overrides: Parameters<typeof createVideoPublisher>[1] = {}) {
  return createVideoPublisher({ledger, date: '2026-10-12', slot: 'afternoon', manual: true, current: new Map([['first', video.snapshot]]), save: () => store.saveState(ledger, true)}, {
    assertPostingTime: () => {}, assertVideoCaption: () => {}, verifyFresh: async () => {},
    bufferCreate: async () => {throw new Error('Unexpected provider creation');},
    bufferRecover: async () => {throw new Error('Unexpected provider recovery');},
    bufferVerify: async () => {throw new Error('Unexpected provider verification');},
    instagramFind: async () => {throw new Error('Unexpected Instagram lookup');},
    instagramReady: async () => {throw new Error('Unexpected Instagram readiness check');},
    instagramVerify: async () => {throw new Error('Unexpected Instagram verification');},
    meta: async () => {throw new Error('Unexpected Instagram mutation');},
    ...overrides,
  });
}

test('validates the existing historical ledger and rejects malformed histories without PUTs', async t => {
  validateLedger(JSON.parse(await fs.readFile(new URL('./job-video-state.json', import.meta.url), 'utf8')));
  const bad: unknown[] = [null, {version: 2, slots: {}, jobs: {}}, {...fixture(), jobs: {}}];
  const excess = fixture(); excess.slots[slot].push('third'); bad.push(excess);
  const status = fixture(); bad.push({...status, jobs: {...status.jobs, first: {...status.jobs.first, receipts: {youtube: {...pending(), status: 'unknown'}}}}});
  bad.push({...status, jobs: {...status.jobs, first: {...status.jobs.first, receipts: {youtube: {...pending(), status: ['pending']}}}}});
  const noEvidence = fixture(); noEvidence.jobs.first.receipts.youtube = pending({status: 'sent'}); bad.push(noEvidence);
  const rejectedWithId = fixture(); rejectedWithId.jobs.first.receipts.youtube = pending({status: 'rejected'}); bad.push(rejectedWithId);
  const duplicate = fixture(); duplicate.slots['2026-10-12:evening'] = ['first']; bad.push(duplicate);
  const unknownField = {...fixture(), futureHistory: {receipt: 'must not be discarded'}}; bad.push(unknownField);
  for (const value of bad) assert.throws(() => validateLedger(value), /Invalid video ledger/);
  const h = await harness(t);
  h.server.onGet = () => Response.json({sha: 'unknown', encoding: 'base64', content: Buffer.from(JSON.stringify(bad[1])).toString('base64')});
  await assert.rejects(h.store.loadState(true), /Invalid video ledger/);
  assert.equal(h.server.puts.length, 0);
  assert.deepEqual(await h.read(), fixture());
});

test('the initial checkpoint restores local sent evidence and remote pending IDs before publishing or skipping', async t => {
  const disk = fixture(), remote = fixture();
  disk.jobs.first.receipts.youtube = sent();
  remote.jobs.second.receipts.tiktok = pending({postId: 'remote-tiktok'});
  const h = await harness(t, remote, disk);
  const state = await h.store.loadState(true);
  assert.equal(state.jobs.first.receipts.youtube?.status, 'sent');
  assert.equal(state.jobs.second.receipts.tiktok?.postId, 'remote-tiktok');
  assert.deepEqual(await h.read(), state);
  assert.equal(h.server.puts.length, 0);
  await h.store.saveState(state, true);
  await publisher(state, h.store)('youtube', video);
  assert.deepEqual(h.server.state.jobs.first.receipts.youtube, sent());
  assert.equal(h.server.state.jobs.second.receipts.tiktok?.postId, 'remote-tiktok');
});

test('a conflicting remote load preserves the local artifact and journals both receipt identities', async t => {
  const disk = fixture(), remote = fixture();
  disk.jobs.first.receipts.youtube = sent();
  remote.jobs.first.receipts.youtube = pending({postId: 'other-provider-id'});
  const h = await harness(t, remote, disk);
  await assert.rejects(h.store.loadState(true), /conflict.*postId/);
  assert.deepEqual(await h.read(), disk);
  assert.equal(h.server.puts.length, 0);
  const journal = await h.journal();
  assert.ok(journal.some(entry => entry.jobs.first.receipts.youtube?.postId === 'post-1'));
  assert.ok(journal.some(entry => entry.jobs.first.receipts.youtube?.postId === 'other-provider-id'));
});

test('retries four generic branch-head 409s with the same payload before succeeding on PUT five', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.tiktok = pending();
  h.server.onPut = (_state, _sha, attempt) => attempt <= 4 ? conflict() : undefined;
  await h.store.saveState(state, true);
  assert.equal(h.server.puts.length, 5);
  assert.deepEqual(h.sleeps, [250, 500, 1000, 2000]);
  for (const put of h.server.puts) assert.deepEqual(put, h.server.puts[0]);
  assert.equal(h.server.state.jobs.first.receipts.tiktok?.postId, 'post-1');
});

test('retries a known SHA 422, but never retries validation, auth, policy, server or network errors', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  h.server.onPut = (_state, _sha, attempt) => attempt === 1 ? Response.json({message: 'sha does not match current blob'}, {status: 422}) : undefined;
  await h.store.saveState(state, true);
  assert.equal(h.server.puts.length, 2);
  for (const [status, message] of [[422, 'Validation Failed'], [422, 'sha was not supplied'], [401, 'Bad credentials'], [403, 'Forbidden'], [409, 'Repository policy prevents update'], [500, 'Server error']] as const) {
    await t.test(`HTTP ${status} ${message}`, async t => {
      const h = await harness(t);
      const state = await h.store.loadState(true);
      state.jobs.first.receipts.youtube = pending();
      h.server.onPut = () => Response.json({message}, {status});
      await assert.rejects(h.store.saveState(state, true), error => {
        assert.ok(error instanceof VideoStateError);
        assert.match(error.message, new RegExp(`HTTP ${status}`));
        assert.ok(error.message.includes(message));
        return true;
      });
      assert.equal(h.server.puts.length, 1);
      assert.deepEqual(h.sleeps, []);
      assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'post-1');
    });
  }
  await t.test('ambiguous PUT response loss', async t => {
    const h = await harness(t);
    const state = await h.store.loadState(true);
    state.jobs.first.receipts.youtube = pending();
    const failure = new TypeError('connection lost after write');
    h.server.onPut = saved => {h.server.change(saved); throw failure;};
    await assert.rejects(h.store.saveState(state, true), error => error instanceof VideoStateError && error.cause === failure);
    assert.equal(h.server.puts.length, 1);
    assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'post-1');
  });
});

test('bounds conflicts at eight attempts and keeps local pending evidence and the response error', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.tiktok = pending();
  h.server.onPut = conflict;
  await assert.rejects(h.store.saveState(state, true), /HTTP 409.*Conflict/);
  assert.equal(h.server.puts.length, 8);
  assert.equal(h.sleeps.length, 7);
  assert.deepEqual(await h.read(), state);
  assert.ok((await h.journal()).some(entry => entry.jobs.first.receipts.tiktok?.postId === 'post-1'));
});

test('merges disjoint same-file receipts and reservations without detaching publisher references', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  const delivery = state.jobs.first;
  const receipt = delivery.receipts.youtube = pending();
  const other = fixture();
  other.jobs.first.receipts.instagram = sent({url: 'https://www.instagram.com/reel/one/', postId: 'instagram-id', containerId: 'container-id'});
  other.slots['2026-10-12:evening'] = ['third'];
  other.jobs.third = {...structuredClone(other.jobs.second), slot: '2026-10-12:evening', reservationId: 'third-reservation'};
  h.server.change(other);
  await h.store.saveState(state, true);
  assert.equal(state.jobs.first, delivery);
  assert.equal(state.jobs.first.receipts.youtube, receipt);
  receipt.status = 'sent'; receipt.url = 'https://www.youtube.com/watch?v=video-1';
  await h.store.saveState(state, true);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.url, receipt.url);
  assert.equal(h.server.state.jobs.first.receipts.instagram?.containerId, 'container-id');
  assert.equal(h.server.state.jobs.third.reservationId, 'third-reservation');
  assert.deepEqual(h.server.state.slots, other.slots);
});

test('a stale read after an acknowledged write cannot drop its receipt on the next CAS retry', async t => {
  const initial = fixture();
  const h = await harness(t, initial);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = sent();
  await h.store.saveState(state, true);
  const acknowledgedSha = h.server.sha;
  state.jobs.second.receipts.tiktok = pending({postId: 'tiktok-id'});
  h.server.onPut = (_state, _sha, attempt) => attempt === 2 ? conflict() : undefined;
  h.server.onGet = attempt => attempt === 2 ? h.server.contents(initial, 'sha-1') : undefined;
  await h.store.saveState(state, true);
  assert.deepEqual(h.server.puts.map(put => put.sha), ['sha-1', acknowledgedSha, 'sha-1', acknowledgedSha]);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.status, 'sent');
  assert.equal(h.server.state.jobs.second.receipts.tiktok?.postId, 'tiktok-id');
});

test('repairs a dropped receipt from retained acknowledged history even when caller and remote both lost it', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = sent();
  await h.store.saveState(state, true);
  delete state.jobs.first.receipts.youtube;
  h.server.change(fixture());
  await h.store.saveState(state, true);
  assert.deepEqual(h.server.state.jobs.first.receipts.youtube, sent());
  assert.deepEqual(state.jobs.first.receipts.youtube, sent());
  assert.deepEqual((await h.read()).jobs.first.receipts.youtube, sent());
});

test('conflicting post IDs fail closed and retain both sides in the recovery journal', async t => {
  const initial = fixture(); initial.jobs.first.receipts.youtube = pending();
  const h = await harness(t, initial);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = sent();
  const competing = structuredClone(initial); competing.jobs.first.receipts.youtube = pending({postId: 'competing-post'});
  h.server.change(competing);
  await assert.rejects(h.store.saveState(state, true), /conflict: first youtube postId/);
  assert.equal(h.server.puts.length, 1);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.postId, 'competing-post');
  assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'post-1');
  const journal = await h.journal();
  for (const id of ['post-1', 'competing-post']) assert.ok(journal.some(entry => entry.jobs.first.receipts.youtube?.postId === id));
});

test('competing reservations for the same slot cannot become an authorized batch', async t => {
  for (const differentSelection of [false, true]) {
    const h = await harness(t, empty());
    const state = await h.store.loadState(true);
    Object.assign(state, fixture());
    const competing = fixture();
    if (differentSelection) {
      competing.slots[slot] = ['other'];
      competing.jobs = {other: {...competing.jobs.first, reservationId: 'other'}};
    } else competing.jobs.first.reservationId = 'other-owner';
    h.server.change(competing);
    await assert.rejects(h.store.saveState(state, true), /conflict/);
    assert.equal(h.server.puts.length, 1);
    assert.deepEqual(h.server.state, competing);
    assert.ok((await h.journal()).some(entry => entry.jobs.first?.reservationId === 'reservation-first'));
  }
});

test('monotonic receipt merges preserve IDs, errors and sent state and reject identity changes', () => {
  const left = fixture(), right = fixture();
  left.jobs.first.receipts.youtube = sent({error: 'Earlier persistence failure'});
  right.jobs.first.receipts.youtube = pending({status: 'creating', postId: undefined, error: 'Later verification failure'});
  const merged = mergeLedgers(left, right);
  assert.equal(merged.jobs.first.receipts.youtube?.status, 'sent');
  assert.equal(merged.jobs.first.receipts.youtube?.postId, 'post-1');
  assert.equal(merged.jobs.first.receipts.youtube?.error, 'Earlier persistence failure\nLater verification failure');
  for (const changes of [{startedAt: '2026-10-12T11:32:00.000Z'}, {attemptId: 'another-attempt'}, {postId: 'another-id'}, {url: 'https://www.youtube.com/watch?v=another'}]) {
    const conflicting = fixture(); conflicting.jobs.first.receipts.youtube = sent(changes);
    assert.throws(() => mergeLedgers(left, conflicting), /conflict/);
  }
});

test('refresh failure retains the original PUT conflict as well as the GET failure', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = pending();
  h.server.onPut = conflict;
  h.server.onGet = () => Response.json({message: 'Forbidden'}, {status: 403});
  await assert.rejects(h.store.saveState(state, true), error => {
    assert.ok(error instanceof VideoStateError && error.cause instanceof AggregateError);
    assert.match(String(error.cause.errors[0]), /HTTP 409/);
    assert.match(String(error.cause.errors[1]), /HTTP 403/);
    return true;
  });
  assert.equal(h.server.puts.length, 1);
  assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'post-1');
});

test('invalid refreshed state cannot replace the local pending receipt or reach a second PUT', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = pending();
  h.server.onPut = conflict;
  h.server.onGet = () => Response.json({sha: 'sha-invalid', content: Buffer.from('{"version":1,"slots":{},"jobs":[]}').toString('base64'), encoding: 'base64'});
  await assert.rejects(h.store.saveState(state, true), /Invalid video ledger/);
  assert.equal(h.server.puts.length, 1);
  assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'post-1');
});

test('simultaneous legacy creation claims with identical timestamps still conflict', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  state.jobs.first.receipts.youtube = {status: 'creating', text: 'Job caption', startedAt: at};
  h.server.change(state);
  await assert.rejects(h.store.saveState(state, true), /competing creation/);
  assert.equal(h.server.puts.length, 1);
});

test('Buffer creation is called once while saving its returned pending ID retries more than three times', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  let conflicts = 0, creates = 0, verifies = 0;
  h.server.onPut = saved => saved.jobs.first.receipts.tiktok?.status === 'pending' && conflicts++ < 4 ? conflict() : undefined;
  const publish = publisher(state, h.store, {
    bufferCreate: async () => {creates++; return {id: 'buffer-accepted'};},
    bufferVerify: async (_platform, receipt) => {verifies++; assert.equal(receipt.postId, 'buffer-accepted'); return 'https://tiktok.com/@hashtagweb3/video/1';},
  });
  await publish('tiktok', video);
  assert.equal(creates, 1); assert.equal(verifies, 1); assert.equal(h.sleeps.length, 4);
  assert.equal(h.server.state.jobs.first.receipts.tiktok?.status, 'sent');
  assert.equal(h.server.state.jobs.first.receipts.tiktok?.postId, 'buffer-accepted');
  assert.equal((await h.read()).jobs.first.receipts.tiktok?.status, 'sent');
});

test('a competing creation claim never invokes a second provider mutation', async t => {
  const h = await harness(t);
  const other = await harness(t, fixture(), fixture(), h.server);
  const state = await h.store.loadState(true), stale = await other.store.loadState(true);
  let creates = 0;
  const overrides = {
    bufferCreate: async () => {creates++; return {id: 'accepted-once'};},
    bufferVerify: async () => 'https://www.youtube.com/watch?v=only-once',
  };
  await publisher(state, h.store, overrides)('youtube', video);
  await assert.rejects(publisher(stale, other.store, overrides)('youtube', video), /competing creation/);
  assert.equal(creates, 1);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.postId, 'accepted-once');
});

test('competing Instagram publish claims fail before media_publish even with the same container', async t => {
  const initial = fixture(); initial.jobs.first.receipts.instagram = pending({postId: undefined, containerId: 'same-container'});
  const h = await harness(t, initial);
  const state = await h.store.loadState(true);
  const competing = structuredClone(initial);
  competing.jobs.first.receipts.instagram = {...initial.jobs.first.receipts.instagram!, status: 'publishing', publishAttemptId: 'other-publisher'};
  h.server.change(competing);
  let mutations = 0;
  await assert.rejects(publisher(state, h.store, {
    instagramReady: async () => 'FINISHED',
    meta: async () => {mutations++; throw new Error('Must not publish');},
  })('instagram', video), /competing publication/);
  assert.equal(mutations, 0);
  assert.equal(h.server.state.jobs.first.receipts.instagram?.publishAttemptId, 'other-publisher');
});

test('ambiguous Buffer mutations resume by lookup and verification rather than another creation', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  let creates = 0, lookups = 0;
  const overrides = {
    bufferCreate: async () => {creates++; throw new TypeError('provider response lost');},
    bufferRecover: async () => {lookups++; return 'recovered-id';},
    bufferVerify: async () => 'https://www.youtube.com/watch?v=recovered',
  };
  await assert.rejects(publisher(state, h.store, overrides)('youtube', video), /provider response lost/);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.status, 'creating');
  const reloaded = await h.store.loadState(true);
  await publisher(reloaded, h.store, overrides)('youtube', video);
  assert.equal(creates, 1); assert.equal(lookups, 1);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.postId, 'recovered-id');
});

test('a Buffer response without an ID or explicit rejection cannot authorize another creation', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  let creates = 0;
  const publish = publisher(state, h.store, {
    bufferCreate: async () => {creates++; return {};},
    bufferRecover: async () => 'recovered-id',
    bufferVerify: async () => 'https://www.youtube.com/watch?v=recovered',
  });
  await assert.rejects(publish('youtube', video), /creation needs reconciliation/);
  assert.equal(state.jobs.first.receipts.youtube?.status, 'creating');
  await publish('youtube', video);
  assert.equal(creates, 1);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.postId, 'recovered-id');
});

test('an explicit rejected creation can start a new attempt while a sent receipt skips all provider calls', async t => {
  const initial = fixture();
  initial.jobs.first.receipts.youtube = {status: 'rejected', text: 'Job caption', startedAt: '2026-01-01T00:00:00Z', attemptId: 'rejected-attempt', error: 'Provider rejected the request'};
  initial.jobs.first.receipts.tiktok = sent({url: 'https://tiktok.com/@hashtagweb3/video/existing'});
  const h = await harness(t, initial);
  const state = await h.store.loadState(true);
  let creates = 0;
  const publish = publisher(state, h.store, {
    bufferCreate: async () => {creates++; return {id: 'new-accepted-id'};},
    bufferVerify: async () => 'https://www.youtube.com/watch?v=new',
  });
  await publish('youtube', video);
  await publish('tiktok', video);
  assert.equal(creates, 1);
  assert.equal(h.server.state.jobs.first.receipts.youtube?.status, 'sent');
  assert.notEqual(h.server.state.jobs.first.receipts.youtube?.attemptId, 'rejected-attempt');
  assert.match(h.server.state.jobs.first.receipts.youtube?.error || '', /Provider rejected/);
  assert.deepEqual(h.server.state.jobs.first.receipts.tiktok, initial.jobs.first.receipts.tiktok);
});

test('importing the live publisher module does not execute its CLI or make requests', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = async () => {requests++; throw new Error('Unexpected network request on import');};
    const moduleUrl = new URL('./post-job-videos.ts?import-safety', import.meta.url).href;
    const imported = await import(moduleUrl);
    assert.equal(typeof imported.main, 'function');
    assert.equal(typeof imported.createVideoPublisher, 'function');
    assert.equal(requests, 0);
  } finally {globalThis.fetch = originalFetch;}
});

test('a failed error-handler save preserves the provider error and ID, writes the summary, and stops mutations', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  let publishes = 0, summaries = 0;
  const providerError = new Error('Provider verification is still pending');
  h.server.onPut = () => Response.json({message: 'Forbidden'}, {status: 403});
  await assert.rejects(runVideoBatch({
    ledger: state, selected: ['first', 'second'],
    publish: async () => {
      publishes++;
      state.jobs.first.receipts.instagram = pending({postId: undefined, containerId: 'accepted-container'});
      throw providerError;
    },
    save: () => h.store.saveState(state, true), retain: () => h.store.saveState(state, false),
    summarize: async errors => {summaries++; assert.equal(errors.length, 2);},
  }), error => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.errors[0].cause, providerError);
    assert.match(error.errors[1].message, /HTTP 403/);
    return true;
  });
  assert.equal(publishes, 1); assert.equal(summaries, 1);
  const receipt = (await h.read()).jobs.first.receipts.instagram;
  assert.equal(receipt?.containerId, 'accepted-container');
  assert.match(receipt?.error || '', /Provider verification is still pending/);
});

test('exhausted receipt persistence stops the batch, keeps sent evidence and never reports success', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  let publishes = 0, summaries = 0;
  h.server.onPut = conflict;
  await assert.rejects(runVideoBatch({
    ledger: state, selected: ['first', 'second'],
    publish: async () => {
      publishes++;
      state.jobs.first.receipts.instagram = sent({url: 'https://www.instagram.com/reel/sent/', containerId: 'container'});
      await h.store.saveState(state, true);
    },
    save: async () => {throw new Error('Must not restart exhausted remote retry budget');},
    retain: () => h.store.saveState(state, false),
    summarize: async errors => {summaries++; assert.equal(errors.length, 1);},
  }), /video delivery\/persistence errors/);
  assert.equal(publishes, 1); assert.equal(summaries, 1); assert.equal(h.server.puts.length, 8);
  const receipt = (await h.read()).jobs.first.receipts.instagram;
  assert.equal(receipt?.status, 'sent'); assert.equal(receipt?.postId, 'post-1');
  assert.match(receipt?.error || '', /HTTP 409/);
});

test('a broken recovery journal does not prevent the ledger file from retaining a newly accepted ID', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  const journal = h.file.replace(/\.json$/, '.recovery.jsonl');
  await fs.unlink(journal);
  await fs.mkdir(journal);
  state.jobs.first.receipts.youtube = pending({postId: 'accepted-before-disk-error'});
  await assert.rejects(h.store.saveState(state, true), /recovery journal failed/);
  assert.equal(h.server.puts.length, 0);
  assert.equal((await h.read()).jobs.first.receipts.youtube?.postId, 'accepted-before-disk-error');
});

test('an atomic ledger rename failure leaves the accepted ID in the uploadable recovery journal', async t => {
  const h = await harness(t);
  const state = await h.store.loadState(true);
  await fs.unlink(h.file);
  await fs.mkdir(h.file);
  state.jobs.first.receipts.youtube = pending({postId: 'accepted-before-rename-error'});
  await assert.rejects(h.store.saveState(state, true), /local checkpoint failed/);
  assert.equal(h.server.puts.length, 0);
  assert.ok((await h.journal()).some(entry => entry.jobs.first.receipts.youtube?.postId === 'accepted-before-rename-error'));
});

test('even a failed local fallback reaches the summary and preserves all failure causes', async () => {
  const state = fixture();
  const providerError = new Error('provider failed'), saveError = new Error('remote failed'), diskError = new Error('disk failed');
  let summaries = 0;
  await assert.rejects(runVideoBatch({
    ledger: state, selected: ['first'], publish: async () => {throw providerError;},
    save: async () => {throw saveError;}, retain: async () => {throw diskError;},
    summarize: async errors => {summaries++; assert.equal(errors.length, 3);},
  }), error => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(error.errors.map(error => error.cause), [providerError, saveError, diskError]);
    return true;
  });
  assert.equal(summaries, 1);
});
