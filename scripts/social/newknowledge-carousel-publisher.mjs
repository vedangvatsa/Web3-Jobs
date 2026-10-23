import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { ASSET_DIRECTORY, CAMPAIGN, sha256, validateCampaign, assertKnowledgeWindow, assertThreadResourceFreshness } from './newknowledge-content.mjs';
import { REPOSITORY, sleep } from './newknowledge-state.mjs';
import { assertCarouselDate, CAROUSEL_PLATFORMS } from './newknowledge-carousel-state.mjs';
import { CAROUSEL_ACCOUNTS, assertCarouselAccount, assertCarouselCaption, bufferCarouselInput, verifyCarouselReceipt } from './newknowledge-carousel-providers.mjs';
import { assertPublicFields, assertPublicThread, assertPublicImageCopy, assertPublicCarouselCopy, usesPublicCopyPolicy } from './public-copy-guard.mjs';

export const CAROUSEL_EXPORT_DIRECTORY = `${ASSET_DIRECTORY}/exports`;
const hashPattern = /^[a-f0-9]{64}$/;

export function assertCarouselAssetPath(file, { sourceId, number, extension = 'jpg' } = {}) {
  assert.equal(typeof file, 'string', 'Missing carousel asset path');
  if (sourceId) {
    assert.match(sourceId, /^[CEN](?:0[2-9]|10)$/);
    assert.ok(Number.isInteger(number) && number >= 1 && number <= 6);
    assert.equal(file, `${ASSET_DIRECTORY}/images/${sourceId}-${String(number).padStart(2, '0')}.jpg`, 'Wrong source image path/order');
  } else {
    assert.ok(file.startsWith(`${CAROUSEL_EXPORT_DIRECTORY}/`), 'Asset outside carousel exports');
    assert.ok(file.split('/').every(part => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part) && part !== '..'), 'Invalid carousel asset path');
    assert.ok(file.endsWith(`.${extension}`), 'Wrong carousel file extension');
  }
}

async function confinedRead(root, file) {
  const canonicalRoot = await fs.realpath(root);
  const target = path.resolve(canonicalRoot, file);
  assert.ok(target.startsWith(`${canonicalRoot}${path.sep}`), 'Asset escapes repository');
  assert.equal(await fs.realpath(target), target, 'Symlinked carousel files are not allowed');
  const stat = await fs.stat(target);
  assert.ok(stat.isFile() && stat.size > 0 && stat.size < 100 * 1024 * 1024, 'Invalid carousel file size');
  return fs.readFile(target);
}

export async function loadCarouselSources(root) {
  const [contentBytes, calendarBytes, imageBytes, exportBytes] = await Promise.all(['content.json', 'calendar.json', 'image-manifest.json', 'exports/manifest.json'].map(file => confinedRead(root, `${ASSET_DIRECTORY}/${file}`)));
  return { contentBytes, calendarBytes, content: JSON.parse(contentBytes), calendar: JSON.parse(calendarBytes), imageManifest: JSON.parse(imageBytes), manifest: JSON.parse(exportBytes) };
}

export function validateCarouselManifest(bundle) {
  const { contentBytes, calendarBytes, content, calendar, imageManifest, manifest } = bundle;
  const threads = validateCampaign(content, calendar).filter(thread => /^[CEN](?:0[2-9]|10)$/.test(thread.id));
  assert.equal(threads.length, 27);
  assert.equal(manifest.schemaVersion, 1, 'Unsupported carousel export schema');
  assert.equal(manifest.campaign, CAMPAIGN);
  assert.equal(manifest.sourceContentSha256, sha256(contentBytes), 'Carousel source content hash mismatch');
  assert.equal(imageManifest.contentSha256, manifest.sourceContentSha256, 'Source images belong to another content revision');
  assert.equal(imageManifest.calendarSha256, sha256(calendarBytes), 'Source image calendar hash mismatch');
  assert.equal(manifest.threads?.length, 27, 'Expected all 27 carousel exports');
  assert.deepEqual(manifest.threads.map(thread => thread.id).sort(), threads.map(thread => thread.id).sort(), 'Wrong carousel IDs');
  for (const item of manifest.threads) {
    assertCarouselDate(item.date);
    const entry = calendar.dates.find(entry => entry.date === item.date);
    assert.deepEqual({ date: item.date, id: item.id, sequence: item.sequence, title: item.title }, entry, 'Carousel calendar selection changed');
  }
  return manifest.threads;
}

function assetMetadata(asset, pdf = false) {
  assert.match(asset?.sha256, hashPattern, 'Missing asset SHA-256');
  assert.ok(Number.isSafeInteger(asset.bytes) && asset.bytes > 0 && asset.bytes < (pdf ? 100 : 8) * 1024 * 1024, 'Invalid asset bytes');
  if (pdf) {
    assert.equal(asset.pageCount, 6);
    assert.equal(asset.widthPt, 600);
    assert.equal(asset.heightPt, 750);
    return { path: asset.path, sha256: asset.sha256, bytes: asset.bytes, pageCount: 6, widthPt: 600, heightPt: 750 };
  }
  assert.ok(Number.isSafeInteger(asset.width) && Number.isSafeInteger(asset.height) && asset.width > 0 && asset.height > 0);
  assert.ok(typeof asset.alt === 'string' && asset.alt.trim().length >= 20 && asset.alt.length <= 1000, 'Invalid image alt text');
  return { path: asset.path, sha256: asset.sha256, bytes: asset.bytes, width: asset.width, height: asset.height, alt: asset.alt };
}

export function assertCarouselPDF(bytes, expected) {
  assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-', 'Invalid PDF header');
  assert.equal(sha256(bytes), expected.sha256, 'Wrong PDF source hash');
  assert.equal(bytes.length, expected.bytes, 'Wrong PDF source size');
  const text = bytes.toString('latin1').replace(/stream\r?\n[\s\S]*?\r?\nendstream/g, '');
  assert.ok(!/\/ObjStm\b|\/Encrypt\b/.test(text), 'Unsupported PDF structure');
  const pages = [...text.matchAll(/\b\d+\s+\d+\s+obj\b([\s\S]*?)endobj/g)].map(match => match[1]).filter(object => /\/Type\s*\/Page\b/.test(object));
  assert.equal(pages.length, expected.pageCount, 'PDF page count mismatch');
  for (const page of pages) {
    const box = page.match(/\/MediaBox\s*\[\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*\]/);
    assert.ok(box, 'PDF page dimensions missing');
    const [left, bottom, right, top] = box.slice(1).map(Number);
    assert.equal(left, 0); assert.equal(bottom, 0);
    assert.ok(Math.abs(right - expected.widthPt) < 0.01 && Math.abs(top - expected.heightPt) < 0.01, 'PDF page dimensions mismatch');
  }
}

async function inspectAsset(root, asset, options = {}) {
  const pdf = options.extension === 'pdf';
  assertCarouselAssetPath(asset?.path, options);
  const expected = assetMetadata(asset, pdf);
  const bytes = await confinedRead(root, expected.path);
  assert.equal(bytes.length, expected.bytes, 'Carousel asset size changed');
  assert.equal(sha256(bytes), expected.sha256, 'Carousel asset hash changed');
  if (pdf) assertCarouselPDF(bytes, expected);
  else {
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, 'jpeg', 'Carousel images must be JPEG');
    assert.equal(metadata.width, expected.width);
    assert.equal(metadata.height, expected.height);
    assert.equal(metadata.space, 'srgb');
  }
  return expected;
}

export async function inspectCarouselExport(root, bundle, entry, platform) {
  assert.ok(CAROUSEL_PLATFORMS.includes(platform));
  const thread = bundle.content.threads.find(thread => thread.id === entry.id);
  assert.ok(thread, 'Carousel source thread missing');
  const strict = usesPublicCopyPolicy({ campaign: CAMPAIGN, threadId: thread.id, sequence: thread.sequence, date: entry.date });
  if (strict) assertPublicThread(thread);
  assert.deepEqual(entry.sourcePostHashes, thread.posts.map(post => sha256(JSON.stringify(post))), 'Carousel source post hashes changed');
  assert.equal(entry.sourceImages?.length, 6);
  const sourceImages = [];
  for (const [index, image] of entry.sourceImages.entries()) {
    const number = index + 1;
    const matches = bundle.imageManifest.images.filter(image => image.threadId === thread.id && image.postNumber === number);
    assert.equal(matches.length, 1, `image-manifest[${thread.id}/${number}]: expected one declared image`);
    const master = matches[0];
    assert.ok(master, 'Source image manifest entry missing');
    if (strict) assertPublicImageCopy(master, { field: `image-manifest[${thread.id}/${number}]` });
    assert.equal(master.contentPostSha256, entry.sourcePostHashes[index]);
    const expected = { path: master.repoPath, sha256: master.sha256, bytes: master.bytes, width: 1200, height: 1500, alt: master.alt };
    assert.deepEqual(assetMetadata(image), expected, 'Carousel source image metadata/order changed');
    const source = await inspectAsset(root, image, { sourceId: thread.id, number });
    if (strict) {
      assert.equal(master.alt, thread.posts[index].alt || `${thread.posts[index].visual.headline}. ${thread.posts[index].visual.labels.join('. ')}.`, `image-manifest[${thread.id}/${number}].alt: source label changed`);
      source.renderedText = master.renderedText;
    }
    sourceImages.push(source);
  }
  assert.equal(new Set(sourceImages.map(image => image.sha256)).size, 6, 'Source images must be distinct');
  const output = entry[platform];
  assertCarouselCaption(output?.caption, platform);
  if (strict) assertPublicFields(output, { field: `carousel[${thread.id}].${platform}` });
  const result = { sourceThread: thread, sourceImages, caption: output.caption };
  if (platform === 'linkedin') {
    assert.ok(typeof output.title === 'string' && output.title.trim() === output.title && output.title.length > 0 && !/[\r\n]/.test(output.title), 'Invalid document title');
    result.title = output.title;
    result.pdf = await inspectAsset(root, output.pdf, { extension: 'pdf' });
    result.thumbnail = await inspectAsset(root, output.thumbnail);
    assert.equal(result.thumbnail.alt, sourceImages[0].alt, 'Wrong document cover label');
    assert.equal(result.thumbnail.width / result.thumbnail.height, 0.8, 'Wrong document cover ratio');
  } else {
    assert.equal(output.images?.length, 6, 'Instagram requires six images');
    result.images = [];
    for (const [index, image] of output.images.entries()) {
      assert.equal(image.width, 1080);
      assert.equal(image.height, 1350);
      assert.equal(image.alt, sourceImages[index].alt, 'Instagram image labels/order changed');
      result.images.push(await inspectAsset(root, image));
    }
    assert.equal(new Set(result.images.map(image => image.sha256)).size, 6, 'Instagram images must be distinct');
  }
  return result;
}

function pinAsset(asset, commit) {
  assert.match(commit, /^[a-f0-9]{40}$/, 'Carousel assets require a full Git commit SHA');
  assertCarouselAssetPath(asset.path, { extension: asset.pageCount ? 'pdf' : 'jpg' });
  return { ...asset, url: `https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${asset.path}` };
}

export function carouselSpec(bundle, entry, platform, inspected, assetCommit) {
  const base = {
    campaign: CAMPAIGN, date: entry.date, threadId: entry.id, sequence: entry.sequence, platform,
    sourceContentSha256: bundle.manifest.sourceContentSha256, calendarSha256: sha256(bundle.calendarBytes),
    sourceThreadSha256: sha256(JSON.stringify(inspected.sourceThread)), sourcePostHashes: entry.sourcePostHashes,
    sourceImages: inspected.sourceImages, assetCommit, target: CAROUSEL_ACCOUNTS[platform], caption: inspected.caption,
  };
  return platform === 'linkedin'
    ? { ...base, title: inspected.title, pdf: pinAsset(inspected.pdf, assetCommit), thumbnail: pinAsset(inspected.thumbnail, assetCommit) }
    : { ...base, images: inspected.images.map(image => pinAsset(image, assetCommit)) };
}

export function retainClaimedCarouselSpec(candidate, claimed) {
  if (!claimed) return candidate;
  const comparison = structuredClone(candidate);
  if (!usesPublicCopyPolicy(claimed)) {
    for (const key of ['sourceContentSha256', 'calendarSha256']) {
      assert.match(claimed[key], hashPattern, `Missing claimed ${key}`);
      comparison[key] = claimed[key];
    }
  }
  assert.deepEqual(comparison, claimed, 'Claimed carousel selected content, caption, assets or account changed');
  return structuredClone(claimed);
}

async function downloadAsset(url, expected, fetcher, pinned = false) {
  const source = new URL(url);
  assert.ok(source.protocol === 'https:' && !source.username && !source.password, 'Invalid provider asset URL');
  const response = await fetcher(url, { redirect: pinned ? 'error' : 'follow', signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, 'Carousel asset unavailable');
  if (response.url) assert.equal(new URL(response.url).protocol, 'https:', 'Insecure asset redirect');
  const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  assert.ok(expected.pageCount ? ['application/pdf', 'application/octet-stream'].includes(mime) : mime === 'image/jpeg', 'Wrong carousel asset MIME type');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, expected.bytes, 'Public carousel asset size changed');
  assert.equal(sha256(bytes), expected.sha256, 'Public carousel asset hash changed');
  if (expected.pageCount) assertCarouselPDF(bytes, expected);
  else assert.equal((await sharp(bytes).metadata()).format, 'jpeg');
}

export async function verifyPinnedCarouselAssets(spec, fetcher = fetch) {
  const assets = spec.platform === 'linkedin' ? [spec.pdf, spec.thumbnail] : spec.images;
  for (const asset of assets) {
    assert.equal(asset.url, pinAsset(asset, spec.assetCommit).url, 'Carousel URL must be full-SHA-pinned');
    await downloadAsset(asset.url, asset, fetcher, true);
  }
}

export function providerDocumentVerifier(fetcher = fetch) {
  return (url, expected) => downloadAsset(url, expected, fetcher);
}

export async function runCarouselPlatform({
  spec, sourceThread, calendar, events = [], store, client, verifyAssets, verifyImage, verifyDocument,
  mode = 'preflight', initialState, recovery, clock = Date.now, wait = sleep, journal,
}) {
  assert.ok(['preflight', 'publish', 'reconcile'].includes(mode));
  assertCarouselDate(spec.date);
  assert.equal(spec.campaign, CAMPAIGN);
  assert.equal(spec.threadId, sourceThread?.id);
  assert.equal(spec.sequence, sourceThread.sequence);
  assert.equal(spec.sourceThreadSha256, sha256(JSON.stringify(sourceThread)), 'Selected source changed');
  assert.deepEqual(spec.sourcePostHashes, sourceThread.posts.map(post => sha256(JSON.stringify(post))), 'Selected source posts changed');
  assert.deepEqual(calendar.dates.find(entry => entry.date === spec.date), { date: spec.date, id: sourceThread.id, title: sourceThread.title, sequence: sourceThread.sequence }, 'Selected calendar date changed');
  bufferCarouselInput(spec, { publicCopy: usesPublicCopyPolicy(spec) });
  assert.equal(typeof journal, 'function', 'Durable local journal required');
  assert.equal(typeof verifyAssets, 'function', 'Public asset verification required');
  if (recovery) {
    assert.equal(mode, 'reconcile', 'Only reconcile accepts a post ID');
    assert.match(recovery.postId, /^[\w-]+$/);
  }
  let state = initialState === undefined ? await store.load() : initialState;
  if (state) {
    assert.equal(state.version, 1);
    assert.ok(state.claimId, 'Missing carousel claim');
    assert.deepEqual(state.spec, spec, 'Claimed carousel content, assets or account changed');
    await journal(state, 'checkpoint');
  }
  const freshness = () => {
    if (mode !== 'reconcile') assertThreadResourceFreshness(sourceThread, events, Math.max(clock(), Date.parse(`${spec.date}T11:30:00Z`)));
  };
  const guard = () => {
    assert.equal(mode, 'publish', 'Read-only provider operation');
    assertKnowledgeWindow(spec.date, clock());
    assertPublicThread(sourceThread);
    assertPublicCarouselCopy(spec);
    freshness();
  };
  const stamp = () => new Date(clock()).toISOString();
  const save = async () => { state = await store.save(state); };
  freshness();
  if (!state && mode === 'publish') guard();
  if (recovery) assert.ok(state && (!state.postId || state.postId === recovery.postId), 'Recovery needs an existing claim and cannot replace a known ID');
  const account = await client.account();
  const identity = assertCarouselAccount(account, spec.platform);
  if (state) assert.deepEqual(state.account, identity, 'Claimed provider profile changed');
  await verifyAssets(spec);
  let created = false;
  if (!state) {
    const history = await client.history(account);
    await journal({ ids: history.filter(post => post.text === spec.caption).map(post => post.id) }, 'matching-history');
    assert.ok(!history.some(post => post.text === spec.caption), 'Matching carousel caption exists; reconcile manually');
    if (mode !== 'publish') return { status: 'ready', spec, account: identity };
    guard();
    state = { version: 1, spec, account: identity, claimId: randomUUID(), startedAt: stamp(), status: 'claimed' };
    await save();
    await journal(state, 'create-attempt');
    guard();
    const id = await client.create(spec, async postId => {
      assert.match(postId, /^[\w-]+$/);
      assert.ok(!state.postId || state.postId === postId, 'Buffer returned conflicting IDs');
      state.postId = postId;
      state.status = 'accepted';
      await journal(state, 'checkpoint');
      await save();
    });
    assert.equal(id, state.postId, 'Buffer create skipped its ID checkpoint');
    assert.ok(id, 'Ambiguous Buffer create; reconcile without resending');
    created = true;
  }
  const id = recovery?.postId || state.postId;
  assert.ok(id, 'Ambiguous earlier carousel create; reconcile without resending');
  const attempts = created ? 36 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    await journal({ state, postId: id, attempt }, 'readback-attempt');
    const post = await client.post(id);
    await journal({ postId: id, post }, 'provider-receipt');
    assert.equal(post?.id, id, 'Wrong Buffer post ID');
    const receiptIdentity = await verifyCarouselReceipt(post, spec, { verifyImage, verifyDocument });
    assert.deepEqual(receiptIdentity, state.account, 'Receipt provider profile changed');
    if (recovery && !state.postId) {
      state.postId = id; state.status = 'accepted';
      await journal(state, 'checkpoint');
      await save();
    }
    assert.ok(['sent', 'sending', 'scheduled'].includes(post.status), 'Buffer post failed or has uncertain status; retain ID and reconcile');
    if (post.status === 'sent') {
      if (mode !== 'preflight' && state.status !== 'verified') {
        state.status = 'verified'; state.permalink = post.externalLink; state.verifiedAt = stamp();
        await save();
      }
      return { status: 'verified', state, proof: { postId: id, status: post.status, permalink: post.externalLink, checkedAt: stamp() } };
    }
    if (attempt + 1 < attempts) await wait(5000);
  }
  throw new Error('Carousel ID retained but not sent; reconcile without creating another post');
}
