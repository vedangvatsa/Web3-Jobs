import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { jsPDF } from 'jspdf';
import { CAMPAIGN, ASSET_DIRECTORY, sha256 } from './newknowledge-content.mjs';
import { providerImageVerifier } from './newknowledge-images.mjs';
import { CAROUSEL_ACCOUNTS } from './newknowledge-carousel-providers.mjs';
import { CAROUSEL_EXPORT_DIRECTORY, loadCarouselSources, validateCarouselManifest, inspectCarouselExport, carouselSpec, assertCarouselAssetPath, assertCarouselPDF, verifyPinnedCarouselAssets, providerDocumentVerifier } from './newknowledge-carousel-publisher.mjs';
import { main } from './newknowledge-carousels.mjs';

const commit = 'a'.repeat(40), date = '2026-10-21', now = Date.parse(`${date}T11:30:00Z`);
const repositoryRoot = new URL('../../', import.meta.url);
const env = { GITHUB_TOKEN: 'mock-github-secret', BUFFER_ACCESS_TOKEN: 'mock-buffer-secret', KNOWLEDGE_CAROUSEL_ASSET_COMMIT: commit };
let root, bundle, manifest, files;

function pdfBytes(height = 750) {
  const pdf = new jsPDF({ unit: 'pt', format: [600, height], compress: true });
  for (let page = 1; page <= 6; page++) {
    if (page > 1) pdf.addPage([600, height]);
    pdf.text(`Offline carousel fixture page ${page}`, 30, 30);
  }
  return Buffer.from(pdf.output('arraybuffer'));
}

before(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'knowledge-carousel-test-'));
  files = new Map();
  const write = async (file, bytes) => {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), bytes); files.set(file, bytes);
  };
  const contentBytes = await fs.readFile(new URL(`${ASSET_DIRECTORY}/content.json`, repositoryRoot));
  const calendarBytes = await fs.readFile(new URL(`${ASSET_DIRECTORY}/calendar.json`, repositoryRoot));
  const content = JSON.parse(contentBytes), calendar = JSON.parse(calendarBytes);
  await write(`${ASSET_DIRECTORY}/content.json`, contentBytes);
  await write(`${ASSET_DIRECTORY}/calendar.json`, calendarBytes);
  const colors = ['#a82020', '#20a820', '#2020a8', '#a8a820', '#a820a8', '#20a8a8'];
  const sourceBytes = await Promise.all(colors.map(background => sharp({ create: { width: 1200, height: 1500, channels: 3, background } }).jpeg().toBuffer()));
  const instagramBytes = await Promise.all(sourceBytes.map(bytes => sharp(bytes).resize(1080, 1350).jpeg().toBuffer()));
  const pdf = pdfBytes();
  const imageManifest = { contentSha256: sha256(contentBytes), calendarSha256: sha256(calendarBytes), images: [] };
  manifest = { schemaVersion: 1, campaign: CAMPAIGN, sourceContentSha256: sha256(contentBytes), threads: [] };
  for (const thread of content.threads.filter(thread => thread.sequence > 3)) {
    const selected = calendar.dates.find(entry => entry.id === thread.id);
    const entry = { ...selected, sourcePostHashes: thread.posts.map(post => sha256(JSON.stringify(post))), sourceImages: [] };
    const images = [];
    for (let index = 0; index < 6; index++) {
      const alt = `Approved ${thread.id} image ${index + 1} description`;
      const source = { path: `${ASSET_DIRECTORY}/images/${thread.id}-0${index + 1}.jpg`, sha256: sha256(sourceBytes[index]), bytes: sourceBytes[index].length, width: 1200, height: 1500, alt };
      await write(source.path, sourceBytes[index]); entry.sourceImages.push(source);
      imageManifest.images.push({ ...source, repoPath: source.path, threadId: thread.id, postNumber: index + 1, contentPostSha256: entry.sourcePostHashes[index] });
      const image = { path: `${CAROUSEL_EXPORT_DIRECTORY}/instagram/${thread.id}-0${index + 1}.jpg`, sha256: sha256(instagramBytes[index]), bytes: instagramBytes[index].length, width: 1080, height: 1350, alt };
      await write(image.path, instagramBytes[index]); images.push(image);
    }
    const document = { path: `${CAROUSEL_EXPORT_DIRECTORY}/linkedin/${thread.id}.pdf`, sha256: sha256(pdf), bytes: pdf.length, pageCount: 6, widthPt: 600, heightPt: 750 };
    const thumbnail = { ...entry.sourceImages[0], path: `${CAROUSEL_EXPORT_DIRECTORY}/linkedin/${thread.id}-cover.jpg` };
    await write(document.path, pdf); await write(thumbnail.path, sourceBytes[0]);
    entry.linkedin = { caption: `Approved ${thread.id} LinkedIn caption`, title: thread.title, pdf: document, thumbnail };
    entry.instagram = { caption: `Approved ${thread.id} Instagram caption`, images };
    manifest.threads.push(entry);
  }
  await write(`${ASSET_DIRECTORY}/image-manifest.json`, Buffer.from(JSON.stringify(imageManifest)));
  await write(`${CAROUSEL_EXPORT_DIRECTORY}/manifest.json`, Buffer.from(JSON.stringify(manifest)));
  bundle = await loadCarouselSources(root);
});

after(async () => { if (root) await fs.rm(root, { recursive: true, force: true }); });

function network(options = {}) {
  const requests = [];
  const fetcher = async (url, init = {}) => {
    requests.push({ url, method: init.method || 'GET' });
    if (url.startsWith('https://api.github.com/')) {
      assert.ok(!init.method, 'Read-only CLI must not PUT receipts');
      return new Response('', { status: 404 });
    }
    if (url.startsWith('https://raw.githubusercontent.com/vedangvatsa/Web3-Jobs/')) {
      const file = url.split('/').slice(6).join('/');
      assert.ok(files.has(file), 'Unexpected public asset path');
      return new Response(files.get(file), { status: 200, headers: { 'Content-Type': file.endsWith('.pdf') ? 'application/octet-stream' : 'image/jpeg' } });
    }
    assert.equal(url, 'https://api.buffer.com');
    const { query, variables } = JSON.parse(init.body);
    assert.match(query, /^query /, 'Read-only CLI must not mutate Buffer');
    if (query.includes('CarouselChannel')) {
      const platform = Object.keys(CAROUSEL_ACCOUNTS).find(platform => CAROUSEL_ACCOUNTS[platform].channelId === variables.id);
      const target = CAROUSEL_ACCOUNTS[platform];
      const channel = { id: target.channelId, name: 'hashtagweb3', service: target.service, serviceId: target.serviceId, externalLink: target.profile, type: platform === 'linkedin' ? 'page' : 'business', organizationId: 'org', isDisconnected: false, isLocked: false, isQueuePaused: false, allowedActions: ['readUpdates', 'scheduleUpdates'] };
      if (platform === 'linkedin' && options.wrongLinkedin) channel.serviceId = env.BUFFER_ACCESS_TOKEN;
      return new Response(JSON.stringify({ data: { channel } }), { status: 200 });
    }
    assert.ok(query.includes('CarouselHistory'));
    return new Response(JSON.stringify({ data: { posts: { edges: [], pageInfo: { hasNextPage: false } } } }), { status: 200 });
  };
  return { requests, fetcher };
}

test('explicit Meta selection uses the brand Instagram account without touching its obsolete Buffer channel', async () => {
  const buffer = network();
  const metaRequests = [];
  const output = [];
  const metaEnv = { ...env, META_PAGE_TOKEN: 'mock-meta-secret', KNOWLEDGE_INSTAGRAM_TRANSPORT: 'meta' };
  const fetcher = async (url, init = {}) => {
    if (!url.startsWith('https://graph.facebook.com/')) return buffer.fetcher(url, init);
    assert.equal(init.method, 'GET');
    assert.equal(init.headers.Authorization, `Bearer ${metaEnv.META_PAGE_TOKEN}`);
    assert.equal(init.body, undefined);
    metaRequests.push(url);
    const pathname = new URL(url).pathname;
    const result = pathname.endsWith('/content_publishing_limit')
      ? { data: [{ quota_usage: 2, config: { quota_total: 100, quota_duration: 86400 } }] }
      : pathname.endsWith('/media') ? { data: [] } : { id: '17841473830256790', username: 'hashtagweb3' };
    return new Response(JSON.stringify(result), { status: 200 });
  };
  const results = await main(['--mode=preflight', `--date=${date}`], metaEnv, { root, clock: () => now, fetcher, output: text => output.push(text) });
  assert.deepEqual(results.map(result => result.status), ['ready', 'ready']);
  assert.ok(metaRequests.some(url => url.includes('/content_publishing_limit')));
  assert.ok(metaRequests.some(url => new URL(url).pathname.endsWith('/media')));
  assert.ok(!output.join('').includes(metaEnv.META_PAGE_TOKEN));
});

test('offline validation checks all 27 exports even when --platform selects one', async () => {
  let calls = 0;
  const result = await main(['--mode=validate', '--platform=linkedin'], {}, { root, clock: () => now, output: () => {}, fetcher: async () => { calls++; throw new Error('offline only'); } });
  assert.equal(result.dates, 27); assert.equal(result.documents, 27); assert.equal(result.instagramImages, 162);
  assert.equal(calls, 0);
});

test('source hashes, six post hashes, calendar selections and 27 IDs are required', async () => {
  assert.equal(validateCarouselManifest(bundle).length, 27);
  for (const change of [
    copy => { copy.manifest.sourceContentSha256 = '0'.repeat(64); },
    copy => { copy.imageManifest.calendarSha256 = '0'.repeat(64); },
    copy => { copy.manifest.threads.pop(); },
    copy => { copy.manifest.threads[0].date = '2026-10-22'; },
    copy => { copy.manifest.threads[0].id = 'C01'; },
  ]) {
    const copy = { ...bundle, manifest: structuredClone(bundle.manifest), imageManifest: structuredClone(bundle.imageManifest) };
    change(copy); assert.throws(() => validateCarouselManifest(copy));
  }
  const entry = structuredClone(bundle.manifest.threads.find(entry => entry.id === 'C02'));
  entry.sourcePostHashes.reverse();
  await assert.rejects(inspectCarouselExport(root, bundle, entry, 'instagram'), /source post hashes/);
});

test('export source order, Instagram labels and document page metadata are checked offline', async () => {
  for (const change of [
    entry => entry.sourceImages.reverse(),
    entry => entry.instagram.images.reverse(),
    entry => { entry.linkedin.pdf.pageCount = 5; },
    entry => { entry.linkedin.thumbnail.alt = 'Wrong cover label for this document'; },
  ]) {
    const entry = structuredClone(bundle.manifest.threads.find(entry => entry.id === 'C02'));
    change(entry);
    await assert.rejects(async () => {
      await inspectCarouselExport(root, bundle, entry, 'linkedin');
      await inspectCarouselExport(root, bundle, entry, 'instagram');
    });
  }
});

test('exports reject prefix tricks, traversal, signed URLs, absolute paths and source substitutions', () => {
  for (const file of [
    `${CAROUSEL_EXPORT_DIRECTORY}-other/image.jpg`, `${CAROUSEL_EXPORT_DIRECTORY}/../image.jpg`,
    `${CAROUSEL_EXPORT_DIRECTORY}/%2e%2e/image.jpg`, `${CAROUSEL_EXPORT_DIRECTORY}//image.jpg`,
    `${CAROUSEL_EXPORT_DIRECTORY}/image.jpg?signature=secret`, `${CAROUSEL_EXPORT_DIRECTORY}/image.jpg#fragment`,
    '/etc/passwd', '../image.jpg', `${CAROUSEL_EXPORT_DIRECTORY}/nested\\image.jpg`,
  ]) assert.throws(() => assertCarouselAssetPath(file));
  assert.throws(() => assertCarouselAssetPath(`${ASSET_DIRECTORY}/images/C03-01.jpg`, { sourceId: 'C02', number: 1 }));
});

test('symlinked assets cannot read through to arbitrary repository or external files', async () => {
  const entry = structuredClone(bundle.manifest.threads.find(entry => entry.id === 'C02'));
  const relative = `${CAROUSEL_EXPORT_DIRECTORY}/linkedin/symlink.jpg`;
  await fs.symlink(path.join(root, entry.sourceImages[0].path), path.join(root, relative));
  entry.linkedin.thumbnail.path = relative;
  await assert.rejects(inspectCarouselExport(root, bundle, entry, 'linkedin'), /Symlinked/);
});

test('PDF bytes require magic, hash, six page dictionaries and 600x750 point pages', () => {
  const expected = bundle.manifest.threads[0].linkedin.pdf, valid = files.get(expected.path);
  assert.doesNotThrow(() => assertCarouselPDF(valid, expected));
  const html = Buffer.from('<html>not a PDF</html>');
  assert.throws(() => assertCarouselPDF(html, { ...expected, bytes: html.length, sha256: sha256(html) }), /PDF header/);
  const altered = Buffer.from(valid); altered[altered.length - 10] ^= 1;
  assert.throws(() => assertCarouselPDF(altered, expected), /source hash/);
  const five = Buffer.from(valid.toString('latin1').replace('/Type /Page\n', '/Type /Note\n'), 'latin1');
  assert.throws(() => assertCarouselPDF(five, { ...expected, sha256: sha256(five) }), /page count/);
  const wrongSize = pdfBytes(760);
  assert.throws(() => assertCarouselPDF(wrongSize, { ...expected, sha256: sha256(wrongSize), bytes: wrongSize.length }), /dimensions/);
});

test('all public assets are byte-verified at exact full-SHA URLs; PDF octet-stream is accepted', async () => {
  const entry = bundle.manifest.threads.find(entry => entry.id === 'C02');
  for (const platform of ['linkedin', 'instagram']) {
    const inspected = await inspectCarouselExport(root, bundle, entry, platform);
    const spec = carouselSpec(bundle, entry, platform, inspected, commit);
    const net = network();
    await verifyPinnedCarouselAssets(spec, net.fetcher);
    assert.equal(net.requests.length, platform === 'linkedin' ? 2 : 6);
    assert.ok(net.requests.every(request => request.url.includes(`/${commit}/`) && request.method === 'GET'));
    assert.throws(() => carouselSpec(bundle, entry, platform, inspected, 'main'), /full Git commit/);
    const wrong = structuredClone(spec);
    if (platform === 'linkedin') wrong.pdf.url += '?signature=secret';
    else wrong.images[0].url = wrong.images[0].url.replace(commit, 'main');
    await assert.rejects(verifyPinnedCarouselAssets(wrong, net.fetcher), /full-SHA-pinned/);
  }
});

test('public PDF HTML, wrong PDF bytes, PNG thumbnails and changed image bytes fail closed', async () => {
  const entry = bundle.manifest.threads.find(entry => entry.id === 'C02');
  const inspected = await inspectCarouselExport(root, bundle, entry, 'linkedin');
  const spec = carouselSpec(bundle, entry, 'linkedin', inspected, commit);
  for (const contentType of ['text/html', 'image/jpeg']) {
    await assert.rejects(verifyPinnedCarouselAssets(spec, async () => new Response(files.get(spec.pdf.path), { headers: { 'Content-Type': contentType } })), /MIME/);
  }
  await assert.rejects(verifyPinnedCarouselAssets(spec, async url => new Response(files.get(url.endsWith('.pdf') ? spec.pdf.path : spec.thumbnail.path), { headers: { 'Content-Type': url.endsWith('.pdf') ? 'application/pdf' : 'image/png' } })), /MIME/);
  const corrupted = Buffer.from(files.get(spec.pdf.path)); corrupted[corrupted.length - 10] ^= 1;
  await assert.rejects(providerDocumentVerifier(async () => new Response(corrupted, { headers: { 'Content-Type': 'application/pdf' } }))('https://cdn.example.test/document.pdf', spec.pdf), /hash/);
  const instagram = await inspectCarouselExport(root, bundle, entry, 'instagram');
  const ig = carouselSpec(bundle, entry, 'instagram', instagram, commit);
  await assert.rejects(verifyPinnedCarouselAssets(ig, async () => new Response(files.get(ig.images[1].path), { headers: { 'Content-Type': 'image/jpeg' } })), /size|hash/);
});

test('existing image verifier accepts recompressed CDN JPEGs but rejects a different slide', async () => {
  const expected = bundle.manifest.threads.find(entry => entry.id === 'C02').instagram.images[0];
  const recompressed = await sharp(files.get(expected.path)).jpeg({ quality: 45 }).toBuffer();
  await providerImageVerifier(root, async () => new Response(recompressed, { headers: { 'Content-Type': 'image/jpeg' } }))('https://cdn.example.test/image.jpg', expected);
  const wrong = bundle.manifest.threads.find(entry => entry.id === 'C02').instagram.images[1];
  await assert.rejects(providerImageVerifier(root, async () => new Response(files.get(wrong.path), { headers: { 'Content-Type': 'image/jpeg' } }))('https://cdn.example.test/image.jpg', expected), /approved image/);
});

test('CLI preflight performs only queries and GETs on both platforms', async () => {
  const net = network(), outputs = [];
  const result = await main(['--mode=preflight', `--date=${date}`], env, { root, clock: () => now, fetcher: net.fetcher, output: value => outputs.push(value) });
  assert.deepEqual(result.map(result => result.status), ['ready', 'ready']);
  assert.equal(net.requests.filter(request => request.url === 'https://api.buffer.com').length, 4);
  assert.equal(outputs.length, 1);
});

test('a failed LinkedIn account does not prevent Instagram preflight and credentials never reach output or journal', async () => {
  const net = network({ wrongLinkedin: true }), outputs = [];
  await assert.rejects(main(['--mode=preflight', `--date=${date}`], env, { root, clock: () => now, fetcher: net.fetcher, output: value => outputs.push(value) }), /checks stopped/);
  const results = JSON.parse(outputs[0]);
  assert.deepEqual(results.map(result => result.status), ['stopped', 'ready']);
  assert.ok(!outputs[0].includes(env.BUFFER_ACCESS_TOKEN));
  const journal = await fs.readFile(path.join(root, '.cache/newknowledge-carousels', date, 'linkedin/journal.jsonl'), 'utf8');
  assert.ok(!journal.includes(env.BUFFER_ACCESS_TOKEN) && !journal.includes(env.GITHUB_TOKEN));
});

test('a broken LinkedIn export does not prevent Instagram or another date from being checked', async () => {
  const file = path.join(root, CAROUSEL_EXPORT_DIRECTORY, 'manifest.json');
  const changed = structuredClone(manifest);
  changed.threads.find(entry => entry.id === 'C02').linkedin.pdf.sha256 = '0'.repeat(64);
  changed.threads.find(entry => entry.id === 'C03').instagram.images[0].path = '../../secret';
  await fs.writeFile(file, JSON.stringify(changed));
  try {
    const net = network(), outputs = [];
    await assert.rejects(main(['--mode=preflight', `--date=${date}`], env, { root, clock: () => now, fetcher: net.fetcher, output: value => outputs.push(value) }), /checks stopped/);
    assert.deepEqual(JSON.parse(outputs[0]).map(result => result.status), ['stopped', 'ready']);
  } finally { await fs.writeFile(file, JSON.stringify(manifest)); }
});

test('per-platform journal initialization failure cannot suppress the other platform', async () => {
  const blocked = path.join(root, '.cache/newknowledge-carousels/2026-10-22/linkedin');
  await fs.mkdir(path.dirname(blocked), { recursive: true });
  await fs.writeFile(blocked, 'blocking fixture');
  const net = network(), outputs = [];
  await assert.rejects(main(['--mode=preflight', '--date=2026-10-22'], env, { root, clock: () => now, fetcher: net.fetcher, output: value => outputs.push(value) }), /checks stopped/);
  assert.deepEqual(JSON.parse(outputs[0]).map(result => result.status), ['stopped', 'ready']);
});

test('accounts helper works without exports and never touches GitHub receipts', async () => {
  const empty = path.join(root, 'accounts-only'); await fs.mkdir(empty);
  const net = network();
  const result = await main(['--mode=accounts'], env, { root: empty, clock: () => now, fetcher: net.fetcher, output: () => {} });
  assert.deepEqual(result.map(result => result.status), ['account-verified', 'account-verified']);
  assert.equal(net.requests.length, 2);
  assert.ok(net.requests.every(request => request.url === 'https://api.buffer.com'));
});

test('CLI plan and publish at the exact window end cannot create or backfill', async () => {
  const net = network();
  const clock = () => Date.parse(`${date}T12:30:00Z`);
  const plan = await main(['--mode=plan', `--date=${date}`], {}, { root, clock, fetcher: net.fetcher, output: () => {} });
  assert.equal(plan.due, false);
  const result = await main(['--mode=publish', `--date=${date}`], env, { root, clock, fetcher: net.fetcher, output: () => {} });
  assert.deepEqual(result.map(result => result.status), ['skipped', 'skipped']);
  assert.ok(net.requests.every(request => request.url.startsWith('https://api.github.com/') && request.method === 'GET'));
});

test('CLI rejects unsupported dates, unknown modes/platforms and non-reconcile IDs before network access', async () => {
  let calls = 0;
  for (const args of [
    ['--mode=preflight', '--date=2026-10-18'], ['--mode=preflight', '--date=2026-11-17'],
    ['--mode=delete'], ['--platform=x'], ['--mode=publish', '--post-id=known'],
    ['--mode=preflight', '--post-id='], ['--mode=reconcile', '--post-id=known', '--platform=both'],
  ]) await assert.rejects(main(args, {}, { root, clock: () => now, output: () => {}, fetcher: async () => { calls++; } }));
  assert.equal(calls, 0);
});
