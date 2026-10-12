import test from 'node:test';
import assert from 'node:assert/strict';
import { createVideoPublisher } from './post-job-videos.ts';
import { captions, instagramAccount } from './job-video-core.ts';
import type { Ledger, LiveJob, Video, Receipt } from './job-video-core.ts';

function fixture() {
  const snapshot: LiveJob = { id: 'source-1', slug: 'engineer1', title: 'Software Engineer', company: 'Example', link: 'https://careers.example.com/roles/engineer1', date: new Date(Date.now() - 86400000).toISOString() };
  const video: Video = { slug: snapshot.slug, company: snapshot.company, title: snapshot.title, snapshot, facts: ['Remote'], mode: 'catalog-source', videoUrl: 'https://cdn.example.com/engineer1.mp4', bytes: 10000, descriptionHash: null };
  const ledger: Ledger = { version: 1, slots: { '2026-10-13:morning': [snapshot.slug] }, jobs: { [snapshot.slug]: { slot: '2026-10-13:morning', selectedAt: new Date().toISOString(), verifiedAt: new Date().toISOString(), reservationId: 'keep-reservation', captions: captions(video), receipts: {} } } };
  return { video, ledger, current: new Map([[snapshot.slug, snapshot]]) };
}

test('new or rejected video deliveries reject expired and unknown source snapshots without any provider writes', async () => {
  for (const date of [undefined, '', 'invalid', new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() - 31 * 86400000).toISOString()]) {
    for (const rejected of [false, true]) {
      const f = fixture();
      f.video.snapshot.date = date;
      if (rejected) f.ledger.jobs.engineer1.receipts.youtube = { status: 'rejected', text: 'prior caption', startedAt: new Date().toISOString(), error: 'prior rejection' };
      const before = structuredClone(f.ledger);
      const publish = createVideoPublisher({ ...f, date: '2026-10-13', slot: 'morning', manual: true, save: async () => assert.fail('Invalid selection must not reserve') }, {
        assertPostingTime: () => {}, verifyFresh: async () => assert.fail('Age rejection must precede requests'),
        bufferCreate: async () => assert.fail('No Buffer creation'), meta: async () => assert.fail('No Instagram writes'),
      });
      await assert.rejects(publish('youtube', f.video), /publication blocked/);
      assert.deepEqual(f.ledger, before);
    }
  }
});

test('Instagram container resumes recheck original age, current live job and direct employer before media_publish', async t => {
  for (const failure of ['expired', 'missing-date', 'absent', '404', '410', '403', 'soft404', 'timeout']) {
    const f = fixture();
    const receipt: Receipt = { status: 'pending', text: f.ledger.jobs.engineer1.captions.instagram, startedAt: new Date().toISOString(), containerId: 'retained-container' };
    f.ledger.jobs.engineer1.receipts.instagram = receipt;
    if (failure === 'expired') f.video.snapshot.date = new Date(Date.now() - 31 * 86400000).toISOString();
    if (failure === 'missing-date') delete f.video.snapshot.date;
    let mutations = 0;
    t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      assert.ok(!init?.method || ['GET', 'HEAD'].includes(init.method));
      if (url.endsWith('/data/jobs-runtime.json')) return Response.json(failure === 'absent' ? [] : [f.video.snapshot]);
      if (url === f.video.videoUrl) return new Response(null, { headers: { 'content-type': 'video/mp4', 'content-length': '10000' } });
      if (url === f.video.snapshot.link) {
        if (failure === 'timeout') throw new Error('timeout');
        return new Response(failure === 'soft404' ? '<h1>This job is no longer available</h1>' : '', { status: Number(failure) || 200, headers: { 'content-type': 'text/html' } });
      }
      const response = new Response(`<html><body><h1>Software Engineer</h1><script type="application/ld+json">${JSON.stringify({ '@type': 'JobPosting', title: 'Software Engineer', hiringOrganization: { name: 'Example' } })}</script></body></html>`);
      Object.defineProperty(response, 'url', { value: url });
      return response;
    });
    const publish = createVideoPublisher({ ...f, date: '2026-10-13', slot: 'morning', manual: true, save: async () => {} }, {
      assertPostingTime: () => {}, instagramReady: async () => 'FINISHED', meta: async () => { mutations++; throw new Error('No mutation allowed'); },
    });
    await assert.rejects(publish('instagram', f.video), /blocked|closed|unverified/);
    assert.equal(mutations, 0, failure);
    assert.equal(receipt.status, 'pending');
    assert.equal(receipt.containerId, 'retained-container');
    assert.equal(f.ledger.jobs.engineer1.reservationId, 'keep-reservation');
    t.mock.restoreAll();
  }
});

test('a fresh Instagram resume checks again after saving its publish claim and retains the returned ID', async () => {
  const f = fixture();
  f.ledger.jobs.engineer1.receipts.instagram = { status: 'pending', text: captions(f.video).instagram, startedAt: new Date().toISOString(), containerId: 'container' };
  const events: string[] = [];
  const publish = createVideoPublisher({ ...f, date: '2026-10-13', slot: 'morning', manual: true, save: async () => { events.push('save'); } }, {
    assertPostingTime: () => {}, verifyFresh: async () => { events.push('fresh'); }, instagramReady: async () => 'FINISHED',
    meta: async <T>(route: string, body?: Record<string, string>) => {
      events.push('publish'); assert.equal(route, `${instagramAccount}/media_publish`); assert.deepEqual(body, { creation_id: 'container' });
      return { id: 'published-id' } as T;
    }, instagramVerify: async id => { assert.equal(id, 'published-id'); return 'https://www.instagram.com/reel/verified/'; },
  });
  await publish('instagram', f.video);
  assert.deepEqual(events.slice(0, 4), ['fresh', 'save', 'fresh', 'publish']);
  assert.equal(f.ledger.jobs.engineer1.receipts.instagram?.status, 'sent');
  await publish('instagram', f.video);
  assert.equal(events.filter(event => event === 'publish').length, 1);
});

test('pending Buffer IDs for expired jobs remain verification-only, without recreating or losing their reservation', async () => {
  const f = fixture();
  f.video.snapshot.date = '2024-03-09T05:33:00.298Z';
  f.ledger.jobs.engineer1.receipts.youtube = { status: 'pending', text: captions(f.video).youtube, startedAt: new Date().toISOString(), postId: 'existing-buffer-id' };
  const publish = createVideoPublisher({ ...f, date: '2026-10-13', slot: 'morning', manual: true, save: async () => {} }, {
    verifyFresh: async () => assert.fail('Verification does not authorize a new delivery'), bufferCreate: async () => assert.fail('Must not recreate'),
    bufferVerify: async (_platform, receipt) => { assert.equal(receipt.postId, 'existing-buffer-id'); return 'https://www.youtube.com/watch?v=existing'; },
  });
  await publish('youtube', f.video);
  assert.equal(f.ledger.jobs.engineer1.receipts.youtube?.postId, 'existing-buffer-id');
  assert.equal(f.ledger.jobs.engineer1.reservationId, 'keep-reservation');
});

test('a stored caption for a different job cannot be published from an otherwise fresh Instagram container', async () => {
  const f = fixture();
  f.ledger.jobs.engineer1.receipts.instagram = { status: 'pending', text: 'Harmony is hiring Marketing Lead', startedAt: new Date().toISOString(), containerId: 'keep-container' };
  const publish = createVideoPublisher({ ...f, date: '2026-10-13', slot: 'morning', manual: true, save: async () => assert.fail('Keep existing state') }, {
    assertPostingTime: () => {}, instagramReady: async () => 'FINISHED', meta: async () => assert.fail('No stale caption publication'),
  });
  await assert.rejects(publish('instagram', f.video), /Queued video caption/);
  assert.equal(f.ledger.jobs.engineer1.receipts.instagram?.containerId, 'keep-container');
});
