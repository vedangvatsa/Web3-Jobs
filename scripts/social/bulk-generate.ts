/**
 * Bulk Social Media Image Generator — Space-Filling Design
 * White/light backgrounds, big bold text filling the entire canvas
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import { readFile } from 'fs/promises';

const OUTPUT_DIR = path.join(__dirname, 'output/bulk');
const WIDTH = 1080;
const HEIGHT = 1080;

// --- Content Types ---
interface StatPost {
  type: 'stat';
  tag: string;
  headline: string;
  stat: string;
  statLabel: string;
  body: string;
  accent: string;
  accentBg: string;
}

interface BarChartPost {
  type: 'chart';
  tag: string;
  headline: string;
  bars: { label: string; value: number; display: string }[];
  footer: string;
  accent: string;
  accentBg: string;
}

interface TipPost {
  type: 'tip';
  tag: string;
  headline: string;
  tips: string[];
  accent: string;
  accentBg: string;
}

type PostData = StatPost | BarChartPost | TipPost;

// --- Template: Stat ---
function renderStat(post: StatPost) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1080px', height: '1080px', backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter',
      },
      children: [
        // Top colored band with tag
        {
          type: 'div',
          props: {
            style: { backgroundColor: post.accent, padding: '44px 80px 40px', display: 'flex', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '3px', textTransform: 'uppercase' }, children: post.tag } },
            ],
          },
        },
        // Main content — fills space
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' },
            children: [
              // Giant stat number
              { type: 'div', props: { style: { fontSize: '180px', fontWeight: 700, color: post.accent, lineHeight: 0.9, letterSpacing: '-6px', marginBottom: '8px' }, children: post.stat } },
              // Stat label
              { type: 'div', props: { style: { fontSize: '36px', fontWeight: 700, color: '#374151', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px' }, children: post.statLabel } },
              // Thick divider
              { type: 'div', props: { style: { width: '120px', height: '6px', backgroundColor: post.accent, marginBottom: '40px', borderRadius: '3px' } } },
              // Headline
              { type: 'div', props: { style: { fontSize: '44px', fontWeight: 700, color: '#111827', lineHeight: 1.25, marginBottom: '24px' }, children: post.headline } },
              // Body
              { type: 'div', props: { style: { fontSize: '26px', color: '#6b7280', lineHeight: 1.5 }, children: post.body } },
            ],
          },
        },
        // Bottom branded bar
        {
          type: 'div',
          props: {
            style: { backgroundColor: '#f3f4f6', padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: '#374151', letterSpacing: '1px' }, children: 'Web3 Jobs' } },
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: post.accent }, children: 'HashtagWeb3.com' } },
            ],
          },
        },
      ],
    },
  };
}

// --- Template: Chart ---
function renderChart(post: BarChartPost) {
  const maxVal = Math.max(...post.bars.map(b => b.value));
  return {
    type: 'div',
    props: {
      style: {
        width: '1080px', height: '1080px', backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter',
      },
      children: [
        // Top colored band
        {
          type: 'div',
          props: {
            style: { backgroundColor: post.accent, padding: '44px 80px 40px', display: 'flex', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '3px', textTransform: 'uppercase' }, children: post.tag } },
            ],
          },
        },
        // Content
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 80px 24px' },
            children: [
              // Big headline
              { type: 'div', props: { style: { fontSize: '48px', fontWeight: 700, color: '#111827', lineHeight: 1.15, marginBottom: '44px' }, children: post.headline } },
              // Bars — expanded to fill space
              ...post.bars.map((bar) => ({
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', marginBottom: '20px', width: '100%' },
                  children: [
                    { type: 'div', props: { style: { width: '160px', fontSize: '22px', fontWeight: 700, color: '#111827', flexShrink: 0 }, children: bar.label } },
                    { type: 'div', props: { style: { flex: 1, height: '52px', backgroundColor: post.accentBg, borderRadius: '10px', display: 'flex', overflow: 'hidden' }, children: [
                      { type: 'div', props: { style: { width: `${Math.max(Math.round((bar.value / maxVal) * 100), 15)}%`, height: '100%', backgroundColor: post.accent, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '16px' }, children: [
                        { type: 'span', props: { style: { fontSize: '20px', fontWeight: 700, color: '#ffffff' }, children: bar.display } }
                      ] } }
                    ] } },
                  ],
                },
              })),
              // Footer text — fills remaining space
              { type: 'div', props: { style: { marginTop: 'auto', paddingTop: '28px', fontSize: '26px', color: '#374151', lineHeight: 1.5, fontWeight: 700 }, children: post.footer } },
            ],
          },
        },
        // Bottom branded bar
        {
          type: 'div',
          props: {
            style: { backgroundColor: '#f3f4f6', padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: '#374151', letterSpacing: '1px' }, children: 'Web3 Jobs' } },
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: post.accent }, children: 'HashtagWeb3.com' } },
            ],
          },
        },
      ],
    },
  };
}

// --- Template: Tips ---
function renderTip(post: TipPost) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1080px', height: '1080px', backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter',
      },
      children: [
        // Top colored band
        {
          type: 'div',
          props: {
            style: { backgroundColor: post.accent, padding: '44px 80px 40px', display: 'flex', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '3px', textTransform: 'uppercase' }, children: post.tag } },
            ],
          },
        },
        // Content — fills everything
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 80px 24px' },
            children: [
              // Big headline
              { type: 'div', props: { style: { fontSize: '48px', fontWeight: 700, color: '#111827', lineHeight: 1.15, marginBottom: '48px' }, children: post.headline } },
              // Tips — big, space-filling
              ...post.tips.map((tip, i) => ({
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'flex-start', marginBottom: '32px' },
                  children: [
                    // Big number
                    { type: 'div', props: { style: { fontSize: '48px', fontWeight: 700, color: post.accent, marginRight: '24px', lineHeight: 1, minWidth: '50px' }, children: `${i + 1}` } },
                    // Tip text — large
                    { type: 'div', props: { style: { fontSize: '26px', color: '#374151', lineHeight: 1.45, fontWeight: 700, paddingTop: '8px', flex: 1 }, children: tip } },
                  ],
                },
              })),
            ],
          },
        },
        // Bottom branded bar
        {
          type: 'div',
          props: {
            style: { backgroundColor: '#f3f4f6', padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: '#374151', letterSpacing: '1px' }, children: 'Web3 Jobs' } },
              { type: 'div', props: { style: { fontSize: '22px', fontWeight: 700, color: post.accent }, children: 'HashtagWeb3.com' } },
            ],
          },
        },
      ],
    },
  };
}

// --- Sample Content ---
const SAMPLE_POSTS: PostData[] = [
  {
    type: 'stat',
    tag: 'Market Data',
    headline: 'Web3 Hiring Is Not Slowing Down',
    stat: '668+',
    statLabel: 'Open Positions',
    body: 'Active Web3 job listings across 55 companies. The narrative says crypto winter. The data says otherwise.',
    accent: '#2563eb',
    accentBg: '#dbeafe',
  },
  {
    type: 'chart',
    tag: 'Hiring Data',
    headline: 'Who Is Hiring the Most in Web3?',
    bars: [
      { label: 'Binance', value: 326, display: '326' },
      { label: 'Coinbase', value: 81, display: '81' },
      { label: 'Robinhood', value: 59, display: '59' },
      { label: 'Ripple', value: 44, display: '44' },
      { label: 'Fireblocks', value: 14, display: '14' },
      { label: 'BitGo', value: 10, display: '10' },
    ],
    footer: '668+ total positions across 55 companies. Data from HashtagWeb3.com job aggregator.',
    accent: '#7c3aed',
    accentBg: '#ede9fe',
  },
  {
    type: 'tip',
    tag: 'Career Tips',
    headline: '5 Skills Every Web3 Developer Needs in 2026',
    tips: [
      'Solidity and smart contract security fundamentals',
      'Understanding of MEV and transaction ordering',
      'Experience with L2 rollups (Arbitrum, Optimism, Base)',
      'Knowledge of account abstraction (ERC-4337)',
      'Cross-chain messaging and bridge architecture',
    ],
    accent: '#059669',
    accentBg: '#d1fae5',
  },
];

// --- Font Loading ---
async function loadFont(): Promise<ArrayBuffer> {
  const fontPath = path.join(__dirname, 'fonts/Inter-Bold.ttf');
  if (fs.existsSync(fontPath)) return readFile(fontPath);
  console.log('Downloading Inter font...');
  const res = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.1/files/inter-latin-700-normal.woff');
  const buffer = await res.arrayBuffer();
  fs.mkdirSync(path.dirname(fontPath), { recursive: true });
  fs.writeFileSync(fontPath, Buffer.from(buffer));
  return buffer;
}

// --- Main ---
async function generateImage(post: PostData, index: number, font: ArrayBuffer): Promise<string> {
  let element: any;
  switch (post.type) {
    case 'stat':  element = renderStat(post); break;
    case 'chart': element = renderChart(post); break;
    case 'tip':   element = renderTip(post); break;
  }
  const svg = await satori(element, {
    width: WIDTH, height: HEIGHT,
    fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH * 2 } });
  const png = resvg.render().asPng();
  const seoSlug = (post as any).seoTitle
    ? (post as any).seoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'').substring(0, 60)
    : `${post.type}-${index + 1}`;
  const filename = `web3-jobs-hashtagweb3-${seoSlug}-${String(index + 1).padStart(4, '0')}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, png);
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : Infinity;
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const font = await loadFont();

  // Load from content library or fall back to samples
  const contentIdx = args.indexOf('--content');
  const contentFile = contentIdx >= 0 ? path.resolve(args[contentIdx + 1]) : path.join(__dirname, 'bulk-content.json');
  let posts: PostData[];
  if (fs.existsSync(contentFile)) {
    posts = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
    console.log(`Loaded ${posts.length} posts from bulk-content.json`);
  } else {
    posts = SAMPLE_POSTS;
    console.log('Using sample posts (run generate-content-library.ts first for full library)');
  }
  posts = posts.slice(0, limit);

  console.log(`Generating ${posts.length} images...`);
  const t = Date.now();
  for (let i = 0; i < posts.length; i++) {
    const p = await generateImage(posts[i], i, font);
    if (i % 50 === 0 || i === posts.length - 1) {
      const elapsed = ((Date.now() - t) / 1000).toFixed(1);
      const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1);
      console.log(`  [${i + 1}/${posts.length}] ${rate} img/s — ${path.basename(p)}`);
    }
  }
  console.log(`\nDone! ${posts.length} images in ${((Date.now() - t) / 1000).toFixed(1)}s → ${OUTPUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
