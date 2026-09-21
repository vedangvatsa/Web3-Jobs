/**
 * Dynamic OG PNGs (1200×630) for jobs/companies — not part of `npm run build`.
 * Also writes Instagram-safe squares (`{slug}-ig.png`) by letterboxing the same
 * landscape card onto 1080×1080 — no second design. `--ig-pad-only` regenerates
 * squares from existing landscape PNGs without re-running Satori.
 * Run after jobs refresh: `npm run precompute:og-images` (or `precompute:og`).
 * CI: refresh-jobs-cache + deploy cache restore; `--if-missing` skips only when PNG exists
 * and manifest fingerprint still matches job title/company/logo.
 * Served from /public/og/** as static CDN assets — no Serverless /api/og.
 */
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { compressOgPng } from './lib/og-png-compress';
import { getAllJobsWithSlugs } from '../src/lib/job-guides';
import { getCompanies } from '../src/lib/companies';
import { getCompanySlug } from '../src/lib/job-slugs';
import { resolveCompanyLogo } from '../src/lib/company-logo';

const ROOT = process.cwd();
const OUT_JOBS = path.join(ROOT, 'public', 'og', 'jobs');
const OUT_COMPANIES = path.join(ROOT, 'public', 'og', 'companies');
const MANIFEST_PATH = path.join(ROOT, 'public', 'og', 'manifest.json');
const FONT_PATH = path.join(ROOT, 'scripts', 'social', 'fonts', 'Inter-Bold.ttf');
const WIDTH = 1200;
const HEIGHT = 630;
/** Instagram feed square; landscape OG is letterboxed onto this with the same slate bg. */
const IG_WIDTH = 1080;
const IG_HEIGHT = 1080;
const OG_BG = { r: 241, g: 245, b: 249 }; // #f1f5f9 — matches job card canvas
const VERSION = 'og-v7-ig-pad';
const CONCURRENCY = Math.max(
  1,
  Math.min(32, Number(process.env.OG_CONCURRENCY) || (process.env.CI ? 6 : 12)),
);
const LOG_EVERY = process.env.CI ? 50 : 200;
const WITH_LOGOS = process.argv.includes('--logos');
const IF_MISSING = process.argv.includes('--if-missing');
const SKIP_COMPANIES = process.argv.includes('--skip-companies');
const COMPANIES_ONLY = process.argv.includes('--companies-only');
/** Pad existing landscape job PNGs to Instagram squares without re-rendering cards. */
const IG_PAD_ONLY = process.argv.includes('--ig-pad-only');

type Manifest = Record<string, string>;

function parseLimit(): number | null {
  const idx = process.argv.indexOf('--limit');
  if (idx < 0) return null;
  const n = Number(process.argv[idx + 1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseOffset(): number {
  const idx = process.argv.indexOf('--offset');
  if (idx < 0) return 0;
  const n = Number(process.argv[idx + 1]);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function sha(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 16);
}

function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(manifest: Manifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8');
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

function titleFontSize(title: string): number {
  if (title.length > 55) return 60;
  if (title.length > 35) return 72;
  if (title.length > 20) return 86;
  return 100;
}

function fileToDataUrl(absPath: string): string | null {
  try {
    if (!fs.existsSync(absPath)) return null;
    const buf = fs.readFileSync(absPath);
    if (buf.byteLength === 0 || buf.byteLength > 500_000) return null;
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function logoDataUrlForCompany(companyName: string): string | null {
  const logoPath = resolveCompanyLogo(getCompanySlug(companyName));
  if (!logoPath) return null;
  // PNG/JPEG only — webp data URLs can hang satori/resvg.
  const pngCandidate = logoPath.replace(/\.(webp|svg)$/i, '.png');
  for (const rel of [pngCandidate, logoPath]) {
    if (!/\.(png|jpe?g)$/i.test(rel)) continue;
    const data = fileToDataUrl(path.join(ROOT, 'public', rel.replace(/^\//, '')));
    if (data) return data;
  }
  return null;
}

function jobCardElement(opts: {
  title: string;
  company: string;
  logoDataUrl: string | null;
}) {
  const displayTitle = truncate(opts.title, 70);
  const displayCompany = truncate(opts.company || 'Web3 Company', 40);
  const fontSize = titleFontSize(displayTitle);

  const logoBlock = opts.logoDataUrl
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            padding: 12,
          },
          children: [
            {
              type: 'img',
              props: {
                src: opts.logoDataUrl,
                width: 72,
                height: 72,
                style: { borderRadius: 16 },
              },
            },
          ],
        },
      }
    : null;

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        fontFamily: 'Inter',
        backgroundColor: '#f1f5f9',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: 1120,
              height: 550,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 32,
              padding: '48px 64px',
              borderRadius: 32,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            },
            children: [
              ...(logoBlock ? [logoBlock] : []),
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 48,
                          fontWeight: 800,
                          color: '#0284c7',
                          letterSpacing: -0.5,
                        },
                        children: displayCompany,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 48,
                          fontWeight: 500,
                          color: '#475569',
                          letterSpacing: -0.5,
                        },
                        children: 'is hiring for',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.14,
                    letterSpacing: -2,
                    maxWidth: 1020,
                    padding: '0 20px',
                  },
                  children: displayTitle,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Reuse the landscape job OG as-is: scale to IG width and letterbox onto a
 * square with the same slate background so Instagram does not crop/distort.
 */
async function landscapeOgToInstagramSquare(landscapePng: Buffer): Promise<Buffer> {
  const scaledH = Math.round((IG_WIDTH * HEIGHT) / WIDTH);
  const top = Math.floor((IG_HEIGHT - scaledH) / 2);
  const bottom = IG_HEIGHT - scaledH - top;
  const padded = await sharp(landscapePng)
    .resize(IG_WIDTH, scaledH, { fit: 'fill' })
    .extend({
      top,
      bottom,
      left: 0,
      right: 0,
      background: OG_BG,
    })
    .png()
    .toBuffer();
  return compressOgPng(padded);
}

function companyCardElement(opts: { name: string; jobCount?: number; logoDataUrl: string | null }) {
  const name = truncate(opts.name, 48);
  const subtitle =
    typeof opts.jobCount === 'number' && opts.jobCount > 0
      ? `${opts.jobCount} open role${opts.jobCount === 1 ? '' : 's'}`
      : 'Web3 careers';

  return jobCardElement({
    title: subtitle,
    company: name,
    logoDataUrl: opts.logoDataUrl,
  });
}

async function renderPng(element: unknown, font: Buffer): Promise<Buffer> {
  const work = (async () => {
    const svg = await satori(element as Parameters<typeof satori>[0], {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
    });
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
    });
    const raw = Buffer.from(resvg.render().asPng());
    // Flat cards target ~7–15KB palette PNG; unpalettized resvg RGBA is ~60–90KB.
    return compressOgPng(raw);
  })();

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('og render timeout')), 15_000);
  });
  return Promise.race([work, timeout]);
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const limit = parseLimit();
  const offset = parseOffset();
  const font = fs.readFileSync(FONT_PATH);
  const manifest = loadManifest();
  fs.mkdirSync(OUT_JOBS, { recursive: true });
  fs.mkdirSync(OUT_COMPANIES, { recursive: true });

  if (COMPANIES_ONLY) {
    await renderCompanies(font, manifest, limit, 0);
    saveManifest(manifest);
    return;
  }

  let jobs = await getAllJobsWithSlugs();
  if (offset > 0 || limit) {
    jobs = jobs.slice(offset, limit ? offset + limit : undefined);
  }

  const missingJobs = jobs.filter(({ slug }) => !fs.existsSync(path.join(OUT_JOBS, `${slug}.png`))).length;
  console.log(
    `[precompute-og-images] start jobs=${jobs.length} offset=${offset} missing=${missingJobs} logos=${WITH_LOGOS} ifMissing=${IF_MISSING} concurrency=${CONCURRENCY}`,
  );

  let written = 0;
  let skipped = 0;
  const t0 = Date.now();

  let done = 0;
  const heartbeat = setInterval(() => {
    console.log(
      `[precompute-og-images] heartbeat jobs ${done}/${jobs.length} (wrote ${written}, skipped ${skipped}, ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed)`,
    );
  }, 60_000);
  heartbeat.unref?.();

  await mapPool(jobs, CONCURRENCY, async ({ job, slug }) => {
    const key = `job:${slug}`;
    const igKey = `job-ig:${slug}`;
    const logoRel = WITH_LOGOS ? resolveCompanyLogo(getCompanySlug(job.company)) || '' : '';
    const fingerprint = sha(`${VERSION}|${job.title}|${job.company}|${logoRel}`);
    const outFile = path.join(OUT_JOBS, `${slug}.png`);
    const igOutFile = path.join(OUT_JOBS, `${slug}-ig.png`);

    const writeIgPadFromLandscape = async (): Promise<boolean> => {
      if (!fs.existsSync(outFile)) return false;
      const igPng = await landscapeOgToInstagramSquare(fs.readFileSync(outFile));
      fs.writeFileSync(igOutFile, igPng);
      manifest[igKey] = manifest[key] || fingerprint;
      return true;
    };

    if (IG_PAD_ONLY) {
      try {
        if (await writeIgPadFromLandscape()) written += 1;
      } catch (err) {
        console.warn(`[precompute-og-images] ig-pad skip ${slug}:`, (err as Error).message);
      }
      done += 1;
      if (done % LOG_EVERY === 0 || done === jobs.length) {
        console.log(`[precompute-og-images] jobs ${done}/${jobs.length} (wrote ${written}, skipped ${skipped})`);
        saveManifest(manifest);
      }
      return;
    }

    if (
      IF_MISSING &&
      fs.existsSync(outFile) &&
      fs.existsSync(igOutFile) &&
      manifest[key] === fingerprint &&
      manifest[igKey] === fingerprint
    ) {
      skipped += 1;
      done += 1;
      return;
    }
    if (
      !IF_MISSING &&
      manifest[key] === fingerprint &&
      manifest[igKey] === fingerprint &&
      fs.existsSync(outFile) &&
      fs.existsSync(igOutFile)
    ) {
      skipped += 1;
      done += 1;
      return;
    }

    // Landscape is current — only need Instagram letterbox.
    if (
      fs.existsSync(outFile) &&
      manifest[key] === fingerprint &&
      (!fs.existsSync(igOutFile) || manifest[igKey] !== fingerprint)
    ) {
      try {
        if (await writeIgPadFromLandscape()) written += 1;
      } catch (err) {
        console.warn(`[precompute-og-images] ig-pad skip ${slug}:`, (err as Error).message);
      }
      done += 1;
      if (done % LOG_EVERY === 0 || done === jobs.length) {
        console.log(`[precompute-og-images] jobs ${done}/${jobs.length} (wrote ${written}, skipped ${skipped})`);
        saveManifest(manifest);
      }
      return;
    }

    try {
      const renderStarted = Date.now();
      const png = await renderPng(
        jobCardElement({
          title: job.title,
          company: job.company,
          logoDataUrl: WITH_LOGOS ? logoDataUrlForCompany(job.company) : null,
        }),
        font,
      );
      const igPng = await landscapeOgToInstagramSquare(png);
      const renderMs = Date.now() - renderStarted;
      if (renderMs > 10_000) {
        console.warn(`[precompute-og-images] slow render ${slug} ${renderMs}ms`);
      }
      fs.writeFileSync(outFile, png);
      fs.writeFileSync(igOutFile, igPng);
      manifest[key] = fingerprint;
      manifest[igKey] = fingerprint;
      written += 1;
    } catch (err) {
      try {
        const png = await renderPng(
          jobCardElement({ title: job.title, company: job.company, logoDataUrl: null }),
          font,
        );
        const igPng = await landscapeOgToInstagramSquare(png);
        fs.writeFileSync(outFile, png);
        fs.writeFileSync(igOutFile, igPng);
        manifest[key] = fingerprint;
        manifest[igKey] = fingerprint;
        written += 1;
      } catch (err2) {
        console.warn(`[precompute-og-images] skip job ${slug}:`, (err2 as Error).message || err);
      }
    }
    done += 1;
    if (done % LOG_EVERY === 0 || done === jobs.length) {
      console.log(`[precompute-og-images] jobs ${done}/${jobs.length} (wrote ${written}, skipped ${skipped})`);
      saveManifest(manifest);
    }
  });

  clearInterval(heartbeat);

  if (SKIP_COMPANIES || IG_PAD_ONLY) {
    saveManifest(manifest);
    console.log(
      `[precompute-og-images] batch done wrote ${written}, skipped ${skipped}, jobs=${jobs.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s (companies skipped)`,
    );
    return;
  }

  await renderCompanies(font, manifest, limit, written, skipped, jobs.length, t0);
}

async function renderCompanies(
  font: Buffer,
  manifest: Manifest,
  limit: number | null,
  writtenJobs = 0,
  skippedJobs = 0,
  jobCount = 0,
  t0 = Date.now(),
): Promise<void> {
  let written = writtenJobs;
  let skipped = skippedJobs;

  let companies = await getCompanies();
  if (limit) companies = companies.slice(0, Math.min(limit, companies.length));

  await mapPool(companies, CONCURRENCY, async (company) => {
    const slug = getCompanySlug(company.name);
    const key = `company:${slug}`;
    const logoRel = WITH_LOGOS ? resolveCompanyLogo(slug) || '' : '';
    const jobCount = 'jobCount' in company ? Number((company as { jobCount?: number }).jobCount || 0) : 0;
    const fingerprint = sha(`${VERSION}|${company.name}|${jobCount}|${logoRel}`);
    const outFile = path.join(OUT_COMPANIES, `${slug}.png`);
    if (IF_MISSING && fs.existsSync(outFile) && manifest[key] === fingerprint) {
      skipped += 1;
      return;
    }
    if (!IF_MISSING && manifest[key] === fingerprint && fs.existsSync(outFile)) {
      skipped += 1;
      return;
    }
    try {
      const png = await renderPng(
        companyCardElement({
          name: company.name,
          jobCount,
          logoDataUrl: WITH_LOGOS ? logoDataUrlForCompany(company.name) : null,
        }),
        font,
      );
      fs.writeFileSync(outFile, png);
      manifest[key] = fingerprint;
      written += 1;
    } catch {
      try {
        const png = await renderPng(
          companyCardElement({ name: company.name, jobCount, logoDataUrl: null }),
          font,
        );
        fs.writeFileSync(outFile, png);
        manifest[key] = fingerprint;
        written += 1;
      } catch (err2) {
        console.warn(`[precompute-og-images] skip company ${slug}:`, (err2 as Error).message);
      }
    }
  });

  saveManifest(manifest);
  console.log(
    `[precompute-og-images] wrote ${written}, skipped ${skipped}, jobs=${jobCount}, companies=${companies.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s → public/og/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
