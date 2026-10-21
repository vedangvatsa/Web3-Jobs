import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { jsPDF } from 'jspdf';
import sharp from 'sharp';
import { zipSync, strToU8 } from 'fflate';
import { CAMPAIGN, renderThread, sha256, validateCampaign } from '../../scripts/social/newknowledge-content.mjs';
import { platformLink } from '../../scripts/social/platform-links.mjs';
import { assertCarouselCaption, carouselCaptionUnits } from '../../scripts/social/newknowledge-carousel-providers.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const directory = 'social-assets/knowledge-threads-month';
const exportDirectory = `${directory}/exports`;
const fixedDate = new Date('2026-10-21T00:00:00.000Z');
const read = async file => JSON.parse(await fs.readFile(path.join(repo, file), 'utf8'));
const json = async (file, value) => fs.writeFile(path.join(repo, file), JSON.stringify(value, null, 2) + '\n');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function resourcePath(thread) {
  return [...thread.posts].reverse().find(post => post.linkPath)?.linkPath || null;
}

export function carouselCaption(thread, platform) {
  const link = resourcePath(thread);
  const paragraphs = thread.posts.map((post, index) => `${index ? `${index}. ` : ''}${post.text}`);
  const caption = [...paragraphs, ...(link ? [`Full resource: ${platformLink(`hashtagweb3.com${link}`, platform)}`] : [])].join('\n\n');
  if (platform === 'linkedin' || platform === 'instagram') assertCarouselCaption(caption, platform);
  return caption;
}

export function compactCaption(thread, platform) {
  const link = resourcePath(thread);
  return `${thread.posts[0].text}${link ? `\n\n${platformLink(`hashtagweb3.com${link}`, platform)}` : ''}`;
}

async function outputAsset(file, bytes, extra) {
  await fs.writeFile(path.join(repo, file), bytes);
  return { path: file, sha256: sha256(bytes), bytes: bytes.length, ...extra };
}

export async function exportPlatforms() {
  const contentBytes = await fs.readFile(path.join(repo, directory, 'content.json'));
  const content = JSON.parse(contentBytes);
  const calendar = await read(`${directory}/calendar.json`);
  const images = await read(`${directory}/image-manifest.json`);
  validateCampaign(content, calendar);
  assert.equal(images.contentSha256, sha256(contentBytes), 'Render current images before exporting');
  const threads = [];
  for (const thread of [...content.threads].filter(t => t.sequence > 3).sort((a, b) => a.sequence - b.sequence)) {
    const folder = `${exportDirectory}/${thread.id}`;
    await fs.mkdir(path.join(repo, folder, 'instagram'), { recursive: true });
    const sourceImages = [], originals = [];
    for (const post of thread.posts) {
      const source = images.images.find(image => image.threadId === thread.id && image.postNumber === post.number);
      assert.ok(source && source.contentPostSha256 === sha256(JSON.stringify(post)));
      const bytes = await fs.readFile(path.join(repo, source.repoPath));
      assert.equal(sha256(bytes), source.sha256);
      originals.push(bytes);
      sourceImages.push({ path: source.repoPath, sha256: source.sha256, bytes: source.bytes, width: source.width, height: source.height, alt: source.alt });
    }
    const linkedinCaption = carouselCaption(thread, 'linkedin');
    const instagramCaption = carouselCaption(thread, 'instagram');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [600, 750], compress: true, putOnlyUsedFonts: true });
    pdf.setCreationDate(fixedDate);
    pdf.setFileId(sha256(JSON.stringify({ title: thread.title, sources: sourceImages.map(image => image.sha256) })).slice(0, 32).toUpperCase());
    pdf.setProperties({ title: thread.title, author: 'Hashtag Web3', creator: 'Hashtag Web3 carousel exporter', subject: thread.posts[0].text, keywords: 'Hashtag Web3, carousel, source-backed comparison' });
    for (const [index, bytes] of originals.entries()) {
      if (index) pdf.addPage([600, 750], 'portrait');
      pdf.addImage(new Uint8Array(bytes), 'JPEG', 0, 0, 600, 750, `slide-${index + 1}`, 'NONE');
    }
    assert.equal(pdf.getNumberOfPages(), 6);
    const document = await outputAsset(`${folder}/linkedin.pdf`, Buffer.from(pdf.output('arraybuffer')), { pageCount: 6, widthPt: 600, heightPt: 750 });
    const thumbnail = await outputAsset(`${folder}/cover.jpg`, originals[0], { width: 1200, height: 1500, alt: sourceImages[0].alt });
    const instagramImages = [], zipFiles = {};
    for (const [index, bytes] of originals.entries()) {
      const name = `${String(index + 1).padStart(2, '0')}.jpg`;
      const resized = await sharp(bytes).resize(1080, 1350, { fit: 'inside', withoutEnlargement: true }).toColourspace('srgb').jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer();
      instagramImages.push(await outputAsset(`${folder}/instagram/${name}`, resized, { width: 1080, height: 1350, alt: sourceImages[index].alt }));
      zipFiles[name] = [new Uint8Array(resized), { level: 0, mtime: fixedDate }];
    }
    zipFiles['caption.txt'] = [strToU8(instagramCaption + '\n'), { mtime: fixedDate }];
    zipFiles['alt-text.json'] = [strToU8(JSON.stringify(instagramImages.map((image, index) => ({ file: `${String(index + 1).padStart(2, '0')}.jpg`, alt: image.alt })), null, 2) + '\n'), { mtime: fixedDate }];
    const instagramPack = await outputAsset(`${folder}/instagram.zip`, Buffer.from(zipSync(zipFiles)), { fileCount: 8 });
    await fs.writeFile(path.join(repo, folder, 'linkedin-caption.txt'), linkedinCaption + '\n');
    await fs.writeFile(path.join(repo, folder, 'instagram-caption.txt'), instagramCaption + '\n');
    const x = renderThread(thread, 'x'), threadsPosts = renderThread(thread, 'threads');
    const facebook = { caption: carouselCaption(thread, 'facebook'), images: sourceImages };
    const telegram = { caption: compactCaption(thread, 'telegram'), images: sourceImages };
    assert.ok(telegram.caption.length <= 1024, 'Telegram album caption limit');
    const blueskyPosts = thread.posts.map((post, index) => ({ text: post.text + (post.linkPath ? `\n\n${platformLink(`hashtagweb3.com${post.linkPath}`, 'bluesky')}` : ''), image: sourceImages[index].path, alt: sourceImages[index].alt }));
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    assert.ok(blueskyPosts.every(post => [...segmenter.segment(post.text)].length <= 300));
    await json(`${folder}/other-platforms.json`, { x: { posts: x }, threads: { posts: threadsPosts }, facebook, telegram, bluesky: { posts: blueskyPosts } });
    const date = calendar.dates.find(entry => entry.id === thread.id).date;
    threads.push({ id: thread.id, sequence: thread.sequence, date, title: thread.title, sourcePostHashes: thread.posts.map(post => sha256(JSON.stringify(post))), sourceImages, linkedin: { caption: linkedinCaption, title: thread.title, pdf: document, thumbnail }, instagram: { caption: instagramCaption, images: instagramImages, pack: instagramPack }, facebook, telegram, bluesky: { posts: blueskyPosts }, x: { posts: x }, threads: { posts: threadsPosts } });
    console.log(`${thread.id}: 6-page PDF, 6 Instagram images, captions; IG ${carouselCaptionUnits(instagramCaption, 'instagram')}/2196 units`);
  }
  assert.equal(threads.length, 27);
  const manifest = { schemaVersion: 1, campaign: CAMPAIGN, generatedAt: new Date().toISOString(), sourceContentSha256: sha256(contentBytes), formats: { linkedin: 'Six-page PDF document post, 600 x 750 pt', instagram: 'Six JPEGs, 1080 x 1350, sRGB, 4:5', x: 'Six image posts', threads: 'Six image replies', facebook: 'Multi-photo post export', telegram: 'Six-photo album export', bluesky: 'Six image replies export' }, threads };
  await json(`${exportDirectory}/manifest.json`, manifest);
  const rows = threads.map(thread => `<tr><td>${escape(thread.date)}</td><td><strong>${escape(thread.id)}</strong><br>${escape(thread.title)}</td><td><a href="${thread.id}/linkedin.pdf">6-page PDF</a><br><a href="${thread.id}/linkedin-caption.txt">Caption</a></td><td><a href="${thread.id}/instagram.zip">6-image ZIP</a><br><a href="${thread.id}/instagram-caption.txt">Caption</a></td><td><a href="${thread.id}/other-platforms.json">Platform text + image order</a></td></tr>`).join('');
  await fs.writeFile(path.join(repo, exportDirectory, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hashtag Web3 carousel exports</title><style>*{box-sizing:border-box}body{margin:0;background:white;color:#171719;font:16px/1.6 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:32px}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}a{color:#176349;display:inline-block;min-height:44px;padding:8px 0}a:focus-visible{outline:3px solid #176349;outline-offset:3px}table{border-collapse:collapse;width:100%}th,td{padding:20px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd}th{font-weight:650}.table{overflow-x:auto}td:nth-child(2){min-width:220px}td:first-child{white-space:nowrap}@media(max-width:600px){main{padding:16px}th,td{padding:16px 8px}}</style></head><body><main><a href="../preview.html">Image and text preview</a><h1>LinkedIn and Instagram carousels</h1><p>27 topics. Each LinkedIn PDF contains the six original white-background slides. Instagram packs contain six 1080 × 1350 JPEGs, a caption and alt text. Source dates and qualifications are retained.</p><p>Daily automatic publishing targets LinkedIn and Instagram through their own receipts. X and Threads keep their existing image-thread schedule. Facebook, Telegram and Bluesky files are additional prepared exports.</p><div class="table"><table><thead><tr><th>Date</th><th>Topic</th><th>LinkedIn</th><th>Instagram</th><th>Other formats</th></tr></thead><tbody>${rows}</tbody></table></div></main></body></html>`);
  await fs.writeFile(path.join(repo, exportDirectory, 'README.md'), '# Platform-ready carousel files\n\nRun `node social-assets/knowledge-threads-month/export-platforms.mjs` from the repository root to regenerate the 27 packages. It verifies the source image and post hashes before writing exports.\n\n- LinkedIn: one six-page PDF plus cover and caption per topic. Pages retain the original 4:5 image ratio.\n- Instagram: six numbered 1080 x 1350 sRGB JPEGs, caption and alt descriptions, also bundled as a ZIP.\n- X and Threads: original six-post text/image order with platform-specific links.\n- Facebook, Telegram and Bluesky: prepared text/image payloads; these are not additional enabled publishing targets.\n\nThe exporter does not publish. Native LinkedIn/Instagram publication is handled by the separate knowledge-carousel workflow, within the existing daily window and with immutable per-platform receipts. A missed date is not backfilled.\n');
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) exportPlatforms().catch(error => { console.error(error); process.exitCode = 1; });
