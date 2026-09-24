/**
 * Static page OG cards (1200×630) — same card design as job/event OG images,
 * but a single big heading line instead of the two-line company/title layout.
 * Writes public/og/pages/{slug}.png + manifest `page:{slug}` keys.
 * Usage: npx tsx scripts/precompute-page-og-images.ts [--if-missing]
 */
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { compressOgPng } from './lib/og-png-compress';

const ROOT = process.cwd();
const OUT_PAGES = path.join(ROOT, 'public', 'og', 'pages');
const MANIFEST_PATH = path.join(ROOT, 'public', 'og', 'manifest.json');
const FONT_PATH = path.join(ROOT, 'scripts', 'social', 'fonts', 'Inter-Bold.ttf');
const WIDTH = 1200;
const HEIGHT = 630;
const VERSION = 'og-page-v1';
const IF_MISSING = process.argv.includes('--if-missing');

type Manifest = Record<string, string>;

/** slug + single big heading shown on the card. */
const PAGE_CARDS: Array<{ slug: string; heading: string }> = [
  { slug: 'popups', heading: 'Startup Societies' },
  { slug: 'events', heading: 'Web3 Events Calendar 2026' },
  { slug: 'community', heading: 'Web3 Community' },
  { slug: 'glossary', heading: 'Web3 Glossary' },
  { slug: 'contact', heading: 'Contact Us' },
  { slug: 'about', heading: 'About Us' },
  { slug: 'privacy', heading: 'Privacy Policy' },
  { slug: 'developers', heading: 'Developer Portal' },
  { slug: 'docs', heading: 'Documentation' },
  { slug: 'interview-questions', heading: 'Interview Questions' },
];

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

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

function headingFontSize(heading: string): number {
  if (heading.length > 40) return 64;
  if (heading.length > 28) return 76;
  if (heading.length > 18) return 88;
  return 104;
}

function pageCardElement(heading: string) {
  const display = truncate(heading, 48);
  const fontSize = headingFontSize(display);
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
              padding: '48px 64px',
              borderRadius: 32,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            },
            children: [
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
                  children: display,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function main() {
  const font = fs.readFileSync(FONT_PATH);
  fs.mkdirSync(OUT_PAGES, { recursive: true });
  const manifest = loadManifest();
  let written = 0;
  let skipped = 0;
  for (const { slug, heading } of PAGE_CARDS) {
    const key = `page:${slug}`;
    const fingerprint = sha(`${VERSION}|${heading}`);
    const outFile = path.join(OUT_PAGES, `${slug}.png`);
    if (IF_MISSING && fs.existsSync(outFile) && manifest[key] === fingerprint) {
      skipped += 1;
      continue;
    }
    if (!IF_MISSING && manifest[key] === fingerprint && fs.existsSync(outFile)) {
      skipped += 1;
      continue;
    }
    const svg = await satori(pageCardElement(heading) as Parameters<typeof satori>[0], {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
    });
    const png = await sharp(Buffer.from(new Resvg(svg).render().asPng())).png().toBuffer();
    const compressed = await compressOgPng(png);
    fs.writeFileSync(outFile, compressed);
    manifest[key] = fingerprint;
    written += 1;
    console.log(`[page-og] wrote ${slug}.png (${compressed.length} bytes)`);
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, 'utf8'));
  console.log(`[page-og] done wrote=${written} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
