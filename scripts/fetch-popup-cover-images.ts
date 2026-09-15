import { createHash } from 'crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { getAllPopups } from '@/lib/popups';
import {
  isCommunityPhotoRef,
  scoreCommunityPhotoUrl,
} from '@/lib/popup-community-photos';
import {
  POPUP_MAX_COVER_IMAGES,
  POPUP_MIN_COVER_IMAGES,
  popupCommunityCoverCount,
  trimPopupCoverImages,
} from '@/lib/popup-gallery';
import { getNsDashboardUrl } from '@/lib/popup-ns';
import type { Popup } from '@/types/popup';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const NS_PAGES = path.join(ROOT, 'tmp/popups/ns-pages');
const XYZ_DETAIL = path.join(ROOT, 'tmp/popups/xyz-detail');
const MAX_COVERS = POPUP_MAX_COVER_IMAGES;

/** Official site paths with inline `/img/…` galleries (not linked in meta tags). */
const SITE_GALLERY_PATHS: Record<string, string[]> = {
  jungli: ['/stay/big/', '/stay/soch/', '/stay/serenne/', '/stay/camping/'],
  itana: ['/community'],
};

function publicPath(webPath: string): string {
  return path.join(PUBLIC, webPath.replace(/^\//, ''));
}

function xyzSlugFromPopup(popup: Popup): string | null {
  if (!popup.xyzUrl) return null;
  const m = popup.xyzUrl.match(/network-states\/([^/?#]+)/);
  return m?.[1] ?? null;
}

function extractXyzStateUrls(html: string, xyzSlug: string): string[] {
  const out = new Set<string>();
  const re = new RegExp(`/states/${xyzSlug}/([a-z0-9-]+\\.(?:webp|jpe?g|png))`, 'gi');
  for (const m of html.matchAll(re)) {
    const file = m[1];
    if (/logo/i.test(file)) continue;
    out.add(`https://xyz.city/states/${xyzSlug}/${file}`);
  }
  for (const m of html.matchAll(/\/_next\/image\?url=([^&"']+)/g)) {
    try {
      const decoded = decodeURIComponent(m[1]);
      if (decoded.includes(`/states/${xyzSlug}/`) && !/logo/i.test(decoded)) {
        out.add(decoded.startsWith('http') ? decoded : `https://xyz.city${decoded}`);
      }
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

function extractNsCommunityUrls(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/https:\/\/assets\.ns\.com\/static\/dashboard\/[^\s"'<>]+/gi)) {
    let u = m[0].replace(/\\+$/g, '').replace(/\\/g, '');
    try {
      u = decodeURIComponent(u);
    } catch {
      /* keep */
    }
    if (/logo\.(jpe?g|png|webp)$/i.test(u) || /email\/|socials\//i.test(u)) continue;
    if (u.includes('dashboard/https') || u.includes('dashboard/http')) continue;
    if (/gallery|banner|photo|hero|community/i.test(u)) {
      out.add(u);
    }
  }
  return [...out];
}

function extractSiteRelativeImages(html: string, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin;
  const out = new Set<string>();
  for (const m of html.matchAll(/src=["'](\/(?:img|og)\/[^"']+\.(?:jpe?g|webp|png|JPG))["']/gi)) {
    const rel = m[1];
    if (/logo|favicon|full-logo/i.test(rel)) continue;
    out.add(new URL(rel, origin).href);
  }
  return [...out];
}

const ITANA_GALLERY_SKIP =
  /logo|footer|favicon|coa|iyin|temi|nadayar|odunayo|kola|timi|maya|micheal|abubakar|ola|greg|jude|rosemond|jamiu|niklas|sogo|bradford|julia|stanislav|chimenem/i;

function isItanaCommunityMediaFile(file: string): boolean {
  if (ITANA_GALLERY_SKIP.test(file)) return false;
  return /^image\d+\./i.test(file) || /community_video/i.test(file);
}

/** Next.js static bundles (e.g. Itana /community carousel). */
function extractNextStaticGallery(html: string, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin;
  const out = new Set<string>();
  const addFile = (file: string) => {
    if (!isItanaCommunityMediaFile(file)) return;
    out.add(`${origin}/_next/static/media/${file}`);
  };

  for (const m of html.matchAll(/\/_next\/static\/media\/([a-z0-9_.-]+\.(?:webp|jpe?g|png))/gi)) {
    addFile(m[1]);
  }
  for (const m of html.matchAll(/\/_next\/image\?url=([^&"']+)/g)) {
    try {
      const decoded = decodeURIComponent(m[1].replace(/&amp;/g, '&'));
      const file = decoded.split('/').pop() ?? '';
      addFile(file);
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

async function fetchSiteGalleryImages(popup: Popup): Promise<string[]> {
  const paths = SITE_GALLERY_PATHS[popup.slug];
  if (!paths?.length || !popup.website) return [];
  const origin = popup.website.replace(/\/$/, '');
  const urls = new Set<string>();
  for (const relPath of paths) {
    const pageUrl = `${origin}${relPath}`;
    const html = await fetchHtml(pageUrl);
    if (!html) continue;
    for (const u of extractSiteRelativeImages(html, pageUrl)) urls.add(u);
    for (const u of extractNextStaticGallery(html, pageUrl)) urls.add(u);
  }
  return [...urls].sort((a, b) => scoreCommunityPhotoUrl(b) - scoreCommunityPhotoUrl(a));
}

function extractWebsiteCommunityUrls(html: string): string[] {
  const out = new Set<string>();
  const add = (raw: string) => {
    let u = raw.trim();
    if (!u.startsWith('http')) return;
    if (!isCommunityPhotoRef(u) && scoreCommunityPhotoUrl(u) < 5) return;
    if (scoreCommunityPhotoUrl(u) < 0) return;
    out.add(u);
  };

  for (const m of html.matchAll(/https:\/\/[^\s"'<>]+\.(?:jpe?g|webp)(?:\?[^\s"'<>]*)?/gi)) {
    add(m[0]);
  }

  return [...out].sort((a, b) => scoreCommunityPhotoUrl(b) - scoreCommunityPhotoUrl(a));
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HashtagWeb3Bot/1.0 (+https://hashtagweb3.com)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function downloadUrl(
  remoteUrl: string,
  destDirWeb: string,
  baseName?: string,
): Promise<string | null> {
  try {
    const res = await fetch(remoteUrl, {
      headers: { 'User-Agent': 'HashtagWeb3Bot/1.0 (+https://hashtagweb3.com)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4_000) return null;

    const urlPath = new URL(remoteUrl).pathname;
    const fromUrl = path.basename(urlPath.split('?')[0]);
    let fileName = baseName ?? fromUrl;
    if (!/\.(jpe?g|webp|png|gif)$/i.test(fileName)) {
      const hash = createHash('sha1').update(remoteUrl).digest('hex').slice(0, 10);
      fileName = `photo-${hash}.jpg`;
    }
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');

    const dirFs = publicPath(destDirWeb);
    mkdirSync(dirFs, { recursive: true });
    const webPath = `${destDirWeb}/${fileName}`;
    const fsPath = path.join(dirFs, fileName);
    if (!existsSync(fsPath)) writeFileSync(fsPath, buf);
    return isCommunityPhotoRef(webPath) ? webPath : null;
  } catch {
    return null;
  }
}

function localXyzCommunityPaths(popup: Popup): string[] {
  const xyzSlug = xyzSlugFromPopup(popup);
  if (!xyzSlug) return [];
  const dirWeb = `/popups/xyz/${xyzSlug}`;
  const dirFs = publicPath(dirWeb);
  if (!existsSync(dirFs)) return [];
  return readdirSync(dirFs)
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f) && !/logo/i.test(f))
    .map((f) => `${dirWeb}/${f}`)
    .filter((p) => isCommunityPhotoRef(p));
}

function nsPageFile(slug: string): string | null {
  const dash = getNsDashboardUrl(slug);
  if (!dash) return null;
  const segment = dash.replace('https://ns.com/dashboard/', '');
  const file = path.join(NS_PAGES, `${segment}.html`);
  return existsSync(file) ? file : null;
}

async function collectCommunityCovers(popup: Popup): Promise<string[]> {
  const covers: string[] = [];
  const seen = new Set<string>();

  const push = (webPath: string | null) => {
    if (!webPath || seen.has(webPath) || !isCommunityPhotoRef(webPath)) return;
    if (!existsSync(publicPath(webPath))) return;
    seen.add(webPath);
    covers.push(webPath);
  };

  const siteGallery = await fetchSiteGalleryImages(popup);
  for (const url of siteGallery) {
    if (covers.length >= MAX_COVERS) break;
    const local = await downloadUrl(url, `/popups/${popup.slug}`);
    push(local);
  }

  if (popup.slug === 'jungli' && covers.length >= POPUP_MIN_COVER_IMAGES) {
    return covers.slice(0, MAX_COVERS);
  }

  for (const p of localXyzCommunityPaths(popup)) {
    if (covers.length >= MAX_COVERS) break;
    push(p);
  }

  const htmlChunks: string[] = [];
  const xyzSlug = xyzSlugFromPopup(popup);
  if (xyzSlug) {
    const cached = path.join(XYZ_DETAIL, `${xyzSlug}.html`);
    if (existsSync(cached)) htmlChunks.push(readFileSync(cached, 'utf8'));
    const live = await fetchHtml(popup.xyzUrl!);
    if (live) htmlChunks.push(live);
  }
  const nsFile = nsPageFile(popup.slug);
  if (nsFile) htmlChunks.push(readFileSync(nsFile, 'utf8'));

  const remoteUrls = new Set<string>();
  for (const html of htmlChunks) {
    if (xyzSlug) {
      for (const u of extractXyzStateUrls(html, xyzSlug)) remoteUrls.add(u);
    }
    for (const u of extractNsCommunityUrls(html)) remoteUrls.add(u);
  }

  for (const url of [...remoteUrls].sort((a, b) => scoreCommunityPhotoUrl(b) - scoreCommunityPhotoUrl(a))) {
    if (covers.length >= MAX_COVERS) break;
    const cleanUrl = url.replace(/\\+$/g, '');
    const base = path.basename(decodeURIComponent(new URL(cleanUrl).pathname));
    const dest = xyzSlug ? `/popups/xyz/${xyzSlug}` : `/popups/${popup.slug}`;
    const local = await downloadUrl(cleanUrl, dest, base);
    push(local);
  }

  if (covers.length < POPUP_MIN_COVER_IMAGES && popup.website) {
    const base = popup.website.replace(/\/$/, '');
    const pages = [`${base}/events`, popup.website, `${base}/gallery`];
    for (const pageUrl of pages) {
      const html = await fetchHtml(pageUrl);
      if (!html) continue;
      const urls = extractWebsiteCommunityUrls(html).filter((u) =>
        pageUrl.includes('/events') ? /events-gallery/i.test(u) : true,
      );
      for (const url of urls) {
        if (covers.length >= MAX_COVERS) break;
        const local = await downloadUrl(url, `/popups/${popup.slug}`);
        push(local);
      }
    }
  }

  return covers.slice(0, MAX_COVERS);
}

const header = `import type { Popup } from '@/types/popup';

export const POPUP_TYPES = ['popup', 'permanent', 'sez'] as const;

export const POPUP_TYPE_LABELS: Record<(typeof POPUP_TYPES)[number], string> = {
  popup: 'Popup',
  permanent: 'Permanent',
  sez: 'City / SEZ',
};

export const popupData: Popup[] = `;

const footer = `;

export function getAllPopups(): Popup[] {
  return [...popupData].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPopupBySlug(slug: string): Popup | undefined {
  return popupData.find((popup) => popup.slug === slug);
}

export function getPopupSlugs(): string[] {
  return popupData.map((popup) => popup.slug);
}
`;

async function main() {
  const onlySlug = process.env.POPUP_SLUG?.trim();
  const popups = getAllPopups();
  const updated: Popup[] = [];
  const report: string[] = [];

  for (const popup of popups) {
    const before = popupCommunityCoverCount(popup);
    const coverImages =
      onlySlug && popup.slug !== onlySlug ? (popup.coverImages ?? []) : await collectCommunityCovers(popup);
    const after = coverImages.filter((c) => isCommunityPhotoRef(c)).length;
    updated.push({ ...popup, coverImages: trimPopupCoverImages(coverImages) });
    if (before !== after || before < POPUP_MIN_COVER_IMAGES) {
      report.push(`${popup.slug}: ${before} → ${after} community (${coverImages.map((c) => path.basename(c)).join(', ')})`);
    }
  }

  writeFileSync('src/lib/popups.ts', header + JSON.stringify(updated, null, 2) + footer);

  const short = updated.filter((p) => popupCommunityCoverCount(p) < POPUP_MIN_COVER_IMAGES);
  console.log(report.join('\n') || '(no changes)');
  console.log(
    `\n${updated.length} popups. Under ${POPUP_MIN_COVER_IMAGES} community photos: ${short.map((p) => p.slug).join(', ') || 'none'}`,
  );
  const fail = onlySlug ? short.filter((p) => p.slug === onlySlug) : short;
  if (fail.length) process.exit(1);
}

main();
