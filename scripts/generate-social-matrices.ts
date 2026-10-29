#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'images', 'social');
const FLAGS_DIR = path.join(ROOT, 'content', 'flags-cache');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

fs.mkdirSync(OUT_DIR, { recursive: true });
if (fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

export interface MatrixItem {
  name: string;
  sub: string;
  countryCode: string;
  x: number; // 0 to 1200
  y: number; // 0 to 1200
  labelOffset?: { dx: number; dy: number; align?: 'middle' | 'start' | 'end' };
}

export interface MatrixConfig {
  id: string;
  title: string;
  yTopLabel: string;
  yBottomLabel: string;
  xLeftLabel: string;
  xRightLabel: string;
  sourceText: string;
  items: MatrixItem[];
}

function loadFlagBase64(countryCode: string): string {
  const code = countryCode.toLowerCase().trim();
  const filePath = path.join(FLAGS_DIR, `${code}.svg`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Flag not found for country code: ${code}`);
  }
  const svg = fs.readFileSync(filePath, 'utf8');
  return Buffer.from(svg).toString('base64');
}

export const R = 27; // flag radius
export const GAP = 5; // minimum clear air gap

export function getTextWidth(text: string, fontSize: number, isBold: boolean): number {
  return text.length * fontSize * (isBold ? 0.60 : 0.52);
}

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function getLabelBox(item: MatrixItem): Box {
  const offset = item.labelOffset || { dx: 0, dy: 44, align: 'middle' };
  const tx = item.x + offset.dx;
  const ty = item.y + offset.dy;
  const w = Math.max(getTextWidth(item.name, 15, true), getTextWidth(item.sub, 12.5, false));
  let x1 = tx - w / 2;
  let x2 = tx + w / 2;
  if (offset.align === 'start') {
    x1 = tx;
    x2 = tx + w;
  } else if (offset.align === 'end') {
    x1 = tx - w;
    x2 = tx;
  }
  return { x1: x1 - GAP, y1: ty - 14 - GAP, x2: x2 + GAP, y2: ty + 22 + GAP };
}

export function getFlagBox(item: MatrixItem): Box {
  return { x1: item.x - R - GAP, y1: item.y - R - GAP, x2: item.x + R + GAP, y2: item.y + R + GAP };
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

export function getSanctuaries(v: MatrixConfig): { name: string; box: Box }[] {
  const topW = getTextWidth(v.yTopLabel, 17, true) + 20;
  const botW = getTextWidth(v.yBottomLabel, 17, true) + 20;
  const leftW = getTextWidth(v.xLeftLabel, 16, true) + 10;
  const rightW = getTextWidth(v.xRightLabel, 16, true) + 10;

  return [
    {
      name: 'Top Axis Label & Arrow',
      box: { x1: 600 - topW / 2 - GAP, y1: 120, x2: 600 + topW / 2 + GAP, y2: 190 },
    },
    {
      name: 'Bottom Axis Label & Arrow',
      box: { x1: 600 - botW / 2 - GAP, y1: 1055, x2: 600 + botW / 2 + GAP, y2: 1130 },
    },
    {
      name: 'Left Axis Label & Arrow',
      box: { x1: 55, y1: 588, x2: 80 + leftW + GAP, y2: 632 },
    },
    {
      name: 'Right Axis Label & Arrow',
      box: { x1: 1120 - rightW - GAP, y1: 588, x2: 1145, y2: 632 },
    },
    {
      name: 'Center Crosshair Origin',
      box: { x1: 575, y1: 595, x2: 625, y2: 645 },
    },
  ];
}

export function checkCollisions(v: MatrixConfig): string[] {
  const errs: string[] = [];
  const n = v.items.length;
  const sanctuaries = getSanctuaries(v);

  for (let i = 0; i < n; i++) {
    const a = v.items[i];
    const bA = getLabelBox(a);
    const fA = getFlagBox(a);

    // Canvas boundary checks
    if (bA.x1 < 25 || bA.x2 > 1175) {
      errs.push(`Label "${a.name}" out of bounds X [${bA.x1.toFixed(0)}, ${bA.x2.toFixed(0)}]`);
    }
    if (bA.y1 < 115 || bA.y2 > 1145) {
      errs.push(`Label "${a.name}" out of bounds Y [${bA.y1.toFixed(0)}, ${bA.y2.toFixed(0)}]`);
    }
    if (fA.x1 < 25 || fA.x2 > 1175) {
      errs.push(`Flag "${a.name}" out of bounds X [${fA.x1.toFixed(0)}, ${fA.x2.toFixed(0)}]`);
    }
    if (fA.y1 < 115 || fA.y2 > 1145) {
      errs.push(`Flag "${a.name}" out of bounds Y [${fA.y1.toFixed(0)}, ${fA.y2.toFixed(0)}]`);
    }

    // Sanctuary zone checks
    for (const sz of sanctuaries) {
      if (boxesOverlap(bA, sz.box)) errs.push(`Label "${a.name}" intrudes into ${sz.name}`);
      if (boxesOverlap(fA, sz.box)) errs.push(`Flag "${a.name}" intrudes into ${sz.name}`);
    }

    // Pairwise checks
    for (let j = i + 1; j < n; j++) {
      const b = v.items[j];
      const fd = Math.hypot(a.x - b.x, a.y - b.y);
      if (fd < R * 2 + GAP * 2) {
        errs.push(`Flags "${a.name}" & "${b.name}" too close (${fd.toFixed(1)}px < ${(R * 2 + GAP * 2).toFixed(1)}px)`);
      }
      const bB = getLabelBox(b);
      if (boxesOverlap(bA, bB)) {
        errs.push(`Labels "${a.name}" & "${b.name}" overlap`);
      }
      if (boxesOverlap(fA, bB)) {
        errs.push(`Flag "${a.name}" touches Label of "${b.name}"`);
      }
      const fB = getFlagBox(b);
      if (boxesOverlap(fB, bA)) {
        errs.push(`Flag "${b.name}" touches Label of "${a.name}"`);
      }
    }
  }

  return errs;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateMatrixSvg(config: MatrixConfig): string {
  const flagCache = new Map<string, string>();
  for (const item of config.items) {
    const code = item.countryCode.toLowerCase().trim();
    if (!flagCache.has(code)) {
      flagCache.set(code, loadFlagBase64(code));
    }
  }

  const itemsSvg = config.items
    .map((item) => {
      const b64 = flagCache.get(item.countryCode.toLowerCase().trim())!;
      const r = 27; // radius of flag
      const d = r * 2;
      const fx = item.x - r;
      const fy = item.y - r;

      const offset = item.labelOffset || { dx: 0, dy: 44, align: 'middle' };
      const tx = item.x + offset.dx;
      const ty = item.y + offset.dy;
      const align = offset.align || 'middle';

      let leaderLine = '';
      if (Math.abs(offset.dx) > 12 || Math.abs(offset.dy - 44) > 12) {
        const startY = offset.dy > 0 ? item.y + r + 2 : item.y - r - 2;
        const targetY = offset.dy > 0 ? ty - 15 : ty + 6;
        leaderLine = `<line x1="${item.x}" y1="${startY}" x2="${tx}" y2="${targetY}" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.85" />`;
      }

      return `
    <g class="matrix-item" data-name="${escapeXml(item.name)}">
      ${leaderLine}
      <!-- Drop shadow for flag circle -->
      <circle cx="${item.x}" cy="${item.y + 3}" r="${r}" fill="#000000" opacity="0.08" />
      <circle cx="${item.x}" cy="${item.y + 1}" r="${r}" fill="#000000" opacity="0.06" />
      
      <!-- Flag circle image -->
      <image href="data:image/svg+xml;base64,${b64}" x="${fx}" y="${fy}" width="${d}" height="${d}" />
      
      <!-- Flag borders -->
      <circle cx="${item.x}" cy="${item.y}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="${item.x}" cy="${item.y}" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="0.75" />
      
      <!-- Labels with protective white halo for 100% legibility -->
      <text x="${tx}" y="${ty}" text-anchor="${align}" class="item-title">${escapeXml(item.name)}</text>
      <text x="${tx}" y="${ty + 18}" text-anchor="${align}" class="item-sub">${escapeXml(item.sub)}</text>
    </g>`;
    })
    .join('\n');

  // Title font size scaled dynamically so it NEVER clips on edges
  const titleLen = config.title.length;
  const titleFontSize = titleLen > 38 ? 36 : titleLen > 28 ? 40 : 44;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <style>
      .title { font-family: Georgia, 'Times New Roman', 'Playfair Display', serif; font-weight: 700; fill: #111827; }
      .axis-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1.5px; fill: #111827; }
      .meta { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .item-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; fill: #111827; paint-order: stroke fill; stroke: #FFFFFF; stroke-width: 4.5px; stroke-linejoin: round; }
      .item-sub { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12.5px; font-weight: 500; fill: #4B5563; paint-order: stroke fill; stroke: #FFFFFF; stroke-width: 3.5px; stroke-linejoin: round; }
    </style>
  </defs>

  <!-- Clean Background -->
  <rect width="1200" height="1200" fill="#FFFFFF"/>

  <!-- Top Header Title (Dynamically Scaled & Centered, 0% Edge Clipping) -->
  <text x="600" y="85" text-anchor="middle" font-size="${titleFontSize}" class="title">${escapeXml(config.title)}</text>

  <!-- Central Crosshairs Axes with Direct Sharp Polygon Arrows -->
  <!-- Horizontal X-Axis Line (from 75 to 1125, y=620) -->
  <line x1="75" y1="620" x2="1125" y2="620" stroke="#1F2937" stroke-width="2.5"/>
  <!-- Left Arrow (pointing LEFT) -->
  <polygon points="60,620 75,613 75,627" fill="#1F2937"/>
  <!-- Right Arrow (pointing RIGHT) -->
  <polygon points="1140,620 1125,613 1125,627" fill="#1F2937"/>

  <!-- Vertical Y-Axis Line (from 175 to 1065, x=600) -->
  <line x1="600" y1="175" x2="600" y2="1065" stroke="#1F2937" stroke-width="2.5"/>
  <!-- Top Arrow (pointing UP) -->
  <polygon points="600,160 593,175 607,175" fill="#1F2937"/>
  <!-- Bottom Arrow (pointing DOWN) -->
  <polygon points="600,1080 593,1065 607,1065" fill="#1F2937"/>

  <!-- Axis Labels -->
  <!-- Top Label -->
  <text x="600" y="142" text-anchor="middle" font-size="17" class="axis-label">${escapeXml(config.yTopLabel)}</text>
  
  <!-- Bottom Label -->
  <text x="600" y="1108" text-anchor="middle" font-size="17" class="axis-label">${escapeXml(config.yBottomLabel)}</text>
  
  <!-- Left Label (placed cleanly above the left arrow line) -->
  <text x="80" y="608" text-anchor="start" font-size="16" class="axis-label">${escapeXml(config.xLeftLabel)}</text>
  
  <!-- Right Label (placed cleanly above the right arrow line) -->
  <text x="1120" y="608" text-anchor="end" font-size="16" class="axis-label">${escapeXml(config.xRightLabel)}</text>

  <!-- Render Data Points -->
  ${itemsSvg}

  <!-- Footer Footnotes & Watermark -->
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#9CA3AF" class="meta">${escapeXml(config.sourceText)}</text>
  <text x="1155" y="1165" text-anchor="end" font-size="15" font-weight="700" fill="#111827" class="meta">@hashtagweb3 · hashtagweb3.com</text>
</svg>`;
}

export const VISUALS: MatrixConfig[] = [
  // 1. DIGITAL NOMAD CITIES: QUALITY VS COST
  {
    id: 'where-to-live-digital-nomad',
    title: 'Where to Live as a Digital Nomad',
    yTopLabel: 'TOP NOMAD QUALITY & INFRASTRUCTURE',
    yBottomLabel: 'LOWER NOMAD INFRASTRUCTURE',
    xLeftLabel: 'EXPENSIVE',
    xRightLabel: 'AFFORDABLE',
    sourceText: 'Sources: Hashtag Web3 Nomad Index (Oct 2026). Costs: Numbeo incl. rent, cafe & coworking.',
    items: [
      { name: 'San Francisco', sub: '$5,400/mo', countryCode: 'us', x: 230, y: 880 },
      { name: 'New York', sub: '$6,100/mo', countryCode: 'us', x: 230, y: 730 },
      { name: 'London', sub: '$4,300/mo', countryCode: 'gb', x: 330, y: 530 },
      { name: 'Singapore', sub: '$4,200/mo', countryCode: 'sg', x: 370, y: 350 },
      { name: 'Dubai', sub: '$3,600/mo', countryCode: 'ae', x: 440, y: 260 },
      { name: 'Barcelona', sub: '$2,800/mo', countryCode: 'es', x: 520, y: 380 },
      { name: 'Lisbon', sub: '$2,500/mo', countryCode: 'pt', x: 670, y: 350, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Tokyo', sub: '$2,200/mo', countryCode: 'jp', x: 730, y: 235, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Tallinn', sub: '$1,950/mo', countryCode: 'ee', x: 690, y: 440 },
      { name: 'Mexico City', sub: '$1,800/mo', countryCode: 'mx', x: 740, y: 560 },
      { name: 'Bangkok', sub: '$1,400/mo', countryCode: 'th', x: 840, y: 290, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Cape Town', sub: '$1,350/mo', countryCode: 'za', x: 830, y: 710 },
      { name: 'Bali', sub: '$1,250/mo', countryCode: 'id', x: 890, y: 380 },
      { name: 'Medellín', sub: '$1,150/mo', countryCode: 'co', x: 910, y: 560 },
      { name: 'Buenos Aires', sub: '$950/mo', countryCode: 'ar', x: 940, y: 790 },
      { name: 'Chiang Mai', sub: '$900/mo', countryCode: 'th', x: 970, y: 240 },
      { name: 'Da Nang', sub: '$850/mo', countryCode: 'vn', x: 990, y: 480 },
    ],
  },

  // 2. GLOBAL PASSPORTS: MOBILITY VS ACQUISITION COST
  {
    id: 'global-passports-mobility-vs-cost',
    title: 'Global Passports: Mobility vs Cost',
    yTopLabel: 'TIER-1 PASSPORT POWER (180+ DESTINATIONS)',
    yBottomLabel: 'MODERATE PASSPORT POWER (<150 DESTINATIONS)',
    xLeftLabel: 'EXPENSIVE CBI',
    xRightLabel: 'ACCESSIBLE CBI',
    sourceText: 'Sources: Hashtag Web3 Passport Index 2026 & official Citizenship-by-Investment registries.',
    items: [
      { name: 'Singapore', sub: '195 Visa-Free · Closed', countryCode: 'sg', x: 230, y: 210, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Germany', sub: '191 Visa-Free · 5y Route', countryCode: 'de', x: 300, y: 260, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Spain', sub: '190 Visa-Free · €500k', countryCode: 'es', x: 430, y: 310, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Portugal', sub: '188 Visa-Free · €500k', countryCode: 'pt', x: 500, y: 380, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Malta', sub: '187 Visa-Free · €750k CBI', countryCode: 'mt', x: 310, y: 430, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Greece', sub: '187 Visa-Free · €400k Real Est.', countryCode: 'gr', x: 720, y: 240, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'UAE', sub: '182 Visa-Free · $545k 10-Yr', countryCode: 'ae', x: 430, y: 490, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Cyprus', sub: '181 Visa-Free · €300k PR', countryCode: 'cy', x: 560, y: 530, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'St. Kitts & Nevis', sub: '157 Visa-Free · $250k CBI', countryCode: 'kn', x: 740, y: 530, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Antigua & Barbuda', sub: '153 Visa-Free · $230k CBI', countryCode: 'ag', x: 900, y: 600, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Grenada', sub: '148 Visa-Free · $235k', countryCode: 'gd', x: 740, y: 710, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Dominica', sub: '145 Visa-Free · $200k CBI', countryCode: 'dm', x: 920, y: 740 },
      { name: 'St. Lucia', sub: '146 Visa-Free · $240k CBI', countryCode: 'lc', x: 780, y: 840 },
      { name: 'El Salvador', sub: '136 Visa-Free · $1M BTC', countryCode: 'sv', x: 250, y: 890 },
      { name: 'Turkey', sub: '118 Visa-Free · $400k', countryCode: 'tr', x: 490, y: 920 },
      { name: 'Vanuatu', sub: '117 Visa-Free · $130k', countryCode: 'vu', x: 960, y: 920 },
    ],
  },

  // 3. WHERE TO BUILD WEB3: TAX EASE VS DEVELOPER SCENE
  {
    id: 'where-to-build-web3',
    title: 'Where to Build Web3: Tax vs Dev Scene',
    yTopLabel: 'STRONG WEB3 DEVELOPER ECOSYSTEM',
    yBottomLabel: 'EMERGING WEB3 DEVELOPER SCENE',
    xLeftLabel: 'HIGH CRYPTO TAX',
    xRightLabel: '0% CRYPTO TAX',
    sourceText: 'Sources: Hashtag Web3 Developer Ecosystem & Crypto Tax Guide (October 2026).',
    items: [
      { name: 'San Francisco', sub: 'Top Dev Hub · ~50% Max Tax', countryCode: 'us', x: 230, y: 220 },
      { name: 'New York', sub: 'Wall St Web3 · BitLicense', countryCode: 'us', x: 240, y: 350 },
      { name: 'London', sub: 'Global Tech Hub · 20% CGT', countryCode: 'gb', x: 370, y: 290 },
      { name: 'Tokyo', sub: 'Gaming Capital · Up to 55%', countryCode: 'jp', x: 330, y: 550 },
      { name: 'Seoul', sub: 'Retail Leader · 20% Tax', countryCode: 'kr', x: 430, y: 460, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Austin', sub: 'Bitcoin Hub · 0% State Tax', countryCode: 'us', x: 460, y: 670 },
      { name: 'Zurich / Zug', sub: 'Crypto Valley · 0% CGT', countryCode: 'ch', x: 730, y: 240, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Dubai', sub: 'VARA Hub · 0% Income & CGT', countryCode: 'ae', x: 940, y: 230 },
      { name: 'Berlin', sub: 'Ethereum Core · 0% After 1y', countryCode: 'de', x: 650, y: 360 },
      { name: 'Singapore', sub: 'Asia Hub · 0% Capital Gains', countryCode: 'sg', x: 860, y: 340 },
      { name: 'Lisbon', sub: 'Hacker Houses · 0% After 365d', countryCode: 'pt', x: 680, y: 490 },
      { name: 'Hong Kong', sub: 'Licensed ETFs · 0% CGT', countryCode: 'hk', x: 870, y: 480 },
      { name: 'Bangkok', sub: 'Hackathon Wave · DTV Friendly', countryCode: 'th', x: 860, y: 640 },
      { name: 'Bali', sub: 'Nomad Haven · 0.1% Final Tax', countryCode: 'id', x: 940, y: 770 },
    ],
  },

  // 4. DIGITAL NOMAD VISAS: INCOME BAR VS STAY DURATION
  {
    id: 'digital-nomad-visas-income-vs-duration',
    title: 'Digital Nomad Visas: Income vs Stay',
    yTopLabel: 'LONG STAY (2 TO 5 YEARS)',
    yBottomLabel: 'SHORT STAY (6 TO 12 MONTHS)',
    xLeftLabel: 'HIGH INCOME BAR',
    xRightLabel: 'LOW INCOME BAR',
    sourceText: 'Sources: Hashtag Web3 Digital Nomad Visa Directory (71 Countries, Oct 2026).',
    items: [
      { name: 'Thailand (DTV)', sub: '5 Years · $28k Proof', countryCode: 'th', x: 940, y: 220, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Albania', sub: 'Up to 5 Yrs · ~$820/mo', countryCode: 'al', x: 880, y: 330 },
      { name: 'Spain', sub: '3-5 Years · ~$2,800/mo', countryCode: 'es', x: 720, y: 240, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Colombia', sub: '2 Years · ~$1,400/mo', countryCode: 'co', x: 860, y: 440 },
      { name: 'Portugal (D8)', sub: '2 Years · ~$3,500/mo', countryCode: 'pt', x: 330, y: 340, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Mexico', sub: '1-4 Years · ~$3,200/mo', countryCode: 'mx', x: 480, y: 350 },
      { name: 'Greece', sub: '2 Years · €3,500/mo', countryCode: 'gr', x: 340, y: 460 },
      { name: 'Costa Rica', sub: '2 Years · $3,000/mo', countryCode: 'cr', x: 490, y: 470 },
      { name: 'Dubai', sub: '1 Year · $3,500/mo (0% Tax)', countryCode: 'ae', x: 350, y: 590 },
      { name: 'Croatia', sub: '1 Year · ~$2,700/mo (0% Tax)', countryCode: 'hr', x: 680, y: 530, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Italy', sub: '1 Year · ~$3,000/mo', countryCode: 'it', x: 500, y: 680 },
      { name: 'Malta', sub: '1 Year · €3,500/mo', countryCode: 'mt', x: 370, y: 770, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Indonesia (E33G)', sub: '1 Year · $60k/yr', countryCode: 'id', x: 250, y: 780, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Japan', sub: '6 Months · ~$5,500/mo', countryCode: 'jp', x: 340, y: 890 },
      { name: 'Iceland', sub: '6 Months · ~$7,500/mo', countryCode: 'is', x: 230, y: 960 },
    ],
  },

  // 5. WHERE TO WORK: LIVING COST VS INTERNET SPEED
  {
    id: 'where-to-work-cost-vs-speed',
    title: 'Where to Work: Living Cost vs Internet Speed',
    yTopLabel: 'ULTRA-FAST FIBER (300+ MBPS)',
    yBottomLabel: 'MODERATE INTERNET SPEED (<150 MBPS)',
    xLeftLabel: 'EXPENSIVE ($3,000+/MO)',
    xRightLabel: 'AFFORDABLE (<$1,500/MO)',
    sourceText: 'Sources: Hashtag Web3 Nomad Index (Ookla speed tests + Numbeo monthly living costs, Oct 2026).',
    items: [
      { name: 'Chiang Mai', sub: '336 Mbps · $900/mo', countryCode: 'th', x: 970, y: 240 },
      { name: 'Bangkok', sub: '368 Mbps · $1,100/mo', countryCode: 'th', x: 860, y: 220, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Bucharest', sub: '339 Mbps · $1,300/mo', countryCode: 'ro', x: 780, y: 320 },
      { name: 'Da Nang', sub: '246 Mbps · $850/mo', countryCode: 'vn', x: 990, y: 460 },
      { name: 'Buenos Aires', sub: '233 Mbps · $1,300/mo', countryCode: 'ar', x: 880, y: 510 },
      { name: 'Bali', sub: '102 Mbps · $1,100/mo', countryCode: 'id', x: 900, y: 760 },
      { name: 'Cape Town', sub: '94 Mbps · $1,400/mo', countryCode: 'za', x: 770, y: 860 },
      { name: 'Taipei', sub: '260 Mbps · $1,800/mo', countryCode: 'tw', x: 740, y: 430, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Prague', sub: '253 Mbps · $1,800/mo', countryCode: 'cz', x: 660, y: 520 },
      { name: 'Lisbon', sub: '361 Mbps · $2,000/mo', countryCode: 'pt', x: 670, y: 240, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Barcelona', sub: '345 Mbps · $2,200/mo', countryCode: 'es', x: 520, y: 360, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Dubai', sub: '369 Mbps · $2,500/mo', countryCode: 'ae', x: 410, y: 250, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Berlin', sub: '210 Mbps · $2,500/mo', countryCode: 'de', x: 470, y: 520 },
      { name: 'Tokyo', sub: '304 Mbps · $2,800/mo', countryCode: 'jp', x: 350, y: 370 },
      { name: 'Singapore', sub: '577 Mbps · $3,000/mo', countryCode: 'sg', x: 300, y: 220, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'London', sub: '306 Mbps · $3,200/mo', countryCode: 'gb', x: 240, y: 420 },
      { name: 'San Francisco', sub: '372 Mbps · $3,500/mo', countryCode: 'us', x: 230, y: 300 },
      { name: 'New York', sub: '290 Mbps · $6,100/mo', countryCode: 'us', x: 220, y: 690 },
    ],
  },

  // 6. WHERE TO LIVE SAFELY: RENT VS SAFETY INDEX
  {
    id: 'where-to-live-safely-cost-vs-safety',
    title: 'Where to Live Safely: Rent vs Safety Index',
    yTopLabel: 'ULTRA-SAFE CITIES (8.5 - 10 / 10)',
    yBottomLabel: 'MODERATE SAFETY INDEX (<6.0 / 10)',
    xLeftLabel: 'EXPENSIVE RENT ($1.5K+)',
    xRightLabel: 'AFFORDABLE RENT (<$750)',
    sourceText: 'Sources: Hashtag Web3 City Explorer (Numbeo Safety Index & Numbeo 1-bed city center rent, Oct 2026).',
    items: [
      { name: 'Taipei', sub: 'Safety 9.0 · $700 Rent', countryCode: 'tw', x: 740, y: 240, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Prague', sub: 'Safety 8.3 · $750 Rent', countryCode: 'cz', x: 730, y: 350, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Chiang Mai', sub: 'Safety 8.0 · $350 Rent', countryCode: 'th', x: 970, y: 230, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Bangkok', sub: 'Safety 7.0 · $450 Rent', countryCode: 'th', x: 870, y: 340, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Da Nang', sub: 'Safety 7.5 · $300 Rent', countryCode: 'vn', x: 980, y: 460, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Bucharest', sub: 'Safety 7.0 · $500 Rent', countryCode: 'ro', x: 840, y: 500, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Bali', sub: 'Safety 7.2 · $450 Rent', countryCode: 'id', x: 880, y: 670 },
      { name: 'Buenos Aires', sub: 'Safety 5.8 · $500 Rent', countryCode: 'ar', x: 860, y: 780 },
      { name: 'Medellín', sub: 'Safety 5.5 · $550 Rent', countryCode: 'co', x: 840, y: 890 },
      { name: 'Cape Town', sub: 'Safety 4.5 · $550 Rent', countryCode: 'za', x: 720, y: 970 },
      { name: 'Tokyo', sub: 'Safety 9.2 · $1,200 Rent', countryCode: 'jp', x: 440, y: 240, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Singapore', sub: 'Safety 9.1 · $1,400 Rent', countryCode: 'sg', x: 290, y: 220, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Dubai', sub: 'Safety 8.5 · $1,100 Rent', countryCode: 'ae', x: 460, y: 360, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Lisbon', sub: 'Safety 7.5 · $850 Rent', countryCode: 'pt', x: 650, y: 410, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Berlin', sub: 'Safety 7.2 · $1,100 Rent', countryCode: 'de', x: 480, y: 490, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Barcelona', sub: 'Safety 6.8 · $950 Rent', countryCode: 'es', x: 670, y: 550, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'London', sub: 'Safety 6.5 · $1,500 Rent', countryCode: 'gb', x: 340, y: 680 },
      { name: 'San Francisco', sub: 'Safety 5.5 · $1,800 Rent', countryCode: 'us', x: 240, y: 860, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'New York', sub: 'Safety 5.0 · $2,900 Rent', countryCode: 'us', x: 230, y: 970 },
    ],
  },

  // 7. DIGITAL NOMAD VISAS: TAX POLICY VS INCOME BAR
  {
    id: 'digital-nomad-visas-tax-vs-income',
    title: 'Digital Nomad Visas: Tax vs Income Bar',
    yTopLabel: '0% TAX ON FOREIGN INCOME',
    yBottomLabel: 'STANDARD TAX RESIDENCY (>20%)',
    xLeftLabel: 'HIGH INCOME BAR ($3.5K+)',
    xRightLabel: 'ACCESSIBLE INCOME (<$1.5K)',
    sourceText: 'Sources: Hashtag Web3 Digital Nomad Visa Directory (71 jurisdictions analyzed, Oct 2026).',
    items: [
      { name: 'Thailand (DTV)', sub: '5 Yrs · 0% Foreign Tax', countryCode: 'th', x: 960, y: 210, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Albania', sub: '5 Yrs · 0% Tax · ~$820/mo', countryCode: 'al', x: 890, y: 310, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Georgia', sub: '1 Yr · 1% Micro-Tax · $0/mo', countryCode: 'ge', x: 970, y: 410 },
      { name: 'Croatia', sub: '1.5 Yrs · 0% Tax · ~$2.7k', countryCode: 'hr', x: 730, y: 240, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Costa Rica', sub: '1 Yr · 0% Tax · $3,000/mo', countryCode: 'cr', x: 550, y: 260, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Dubai / UAE', sub: '1 Yr · 0% Tax · $3,500/mo', countryCode: 'ae', x: 370, y: 230, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Barbados', sub: '1 Yr · 0% Tax · $4,167/mo', countryCode: 'bb', x: 260, y: 290, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Colombia', sub: '2 Yrs · Tax after 183d', countryCode: 'co', x: 880, y: 720, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Brazil', sub: '1 Yr · Tax after 183d', countryCode: 'br', x: 770, y: 830 },
      { name: 'Spain', sub: '3-5 Yrs · 24% Beckham Law', countryCode: 'es', x: 670, y: 530, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Greece', sub: '2 Yrs · 50% Tax Break', countryCode: 'gr', x: 420, y: 490 },
      { name: 'Italy', sub: '1 Yr · 5% Impatriati', countryCode: 'it', x: 540, y: 380 },
      { name: 'Portugal (D8)', sub: '2 Yrs · Standard Brackets', countryCode: 'pt', x: 410, y: 750, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Japan', sub: '6 Mos · Standard Tax', countryCode: 'jp', x: 280, y: 860 },
      { name: 'Iceland', sub: '6 Mos · Standard Tax', countryCode: 'is', x: 220, y: 970 },
    ],
  },

  // 8. GLOBAL CITIZENSHIP: CAPITAL VS SPEED TO PASSPORT
  {
    id: 'citizenship-by-investment-capital-vs-speed',
    title: 'Global Citizenship: Capital vs Speed',
    yTopLabel: 'FAST-TRACK PASSPORT (1 - 6 MONTHS)',
    yBottomLabel: 'NATURALIZATION ROUTE (5 - 10 YEARS)',
    xLeftLabel: 'EXPENSIVE CAPITAL ($500K+)',
    xRightLabel: 'ACCESSIBLE CAPITAL (<$250K)',
    sourceText: 'Sources: Hashtag Web3 Passport & CBI Guide (Statutory citizenship & Golden Visa laws 2026).',
    items: [
      { name: 'Vanuatu', sub: '117 Visa-Free · $130k', countryCode: 'vu', x: 960, y: 210, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Dominica', sub: '145 Visa-Free · $200k', countryCode: 'dm', x: 920, y: 330 },
      { name: 'Antigua & Barbuda', sub: '153 Visa-Free · $230k', countryCode: 'ag', x: 790, y: 240, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Grenada', sub: '148 Visa-Free · $235k', countryCode: 'gd', x: 840, y: 440 },
      { name: 'St. Lucia', sub: '146 Visa-Free · $240k', countryCode: 'lc', x: 730, y: 360 },
      { name: 'St. Kitts & Nevis', sub: '157 Visa-Free · $250k', countryCode: 'kn', x: 650, y: 250, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'El Salvador', sub: '136 Visa-Free · $1M BTC', countryCode: 'sv', x: 240, y: 270, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Turkey', sub: '118 Visa-Free · $400k', countryCode: 'tr', x: 470, y: 440, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Malta', sub: '187 Visa-Free · €750k', countryCode: 'mt', x: 340, y: 390, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'UAE', sub: '182 Visa-Free · $545k', countryCode: 'ae', x: 430, y: 550, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Greece', sub: '187 Visa-Free · €400k+', countryCode: 'gr', x: 490, y: 770 },
      { name: 'Portugal', sub: '188 Visa-Free · €500k', countryCode: 'pt', x: 650, y: 700 },
      { name: 'Spain', sub: '190 Visa-Free · €500k', countryCode: 'es', x: 420, y: 880 },
      { name: 'Germany', sub: '191 Visa-Free · 5y Natural.', countryCode: 'de', x: 310, y: 740, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Singapore', sub: '195 Visa-Free · Closed', countryCode: 'sg', x: 230, y: 960 },
    ],
  },

  // 9. WALKABLE CITIES: CAR-FREE LIFE VS COST
  {
    id: 'city-walkability-vs-cost',
    title: 'Walkable Cities: Car-Free Life vs Cost',
    yTopLabel: 'CAR-FREE PARADISE (WALK & TRANSIT 8.5+)',
    yBottomLabel: 'CAR-DEPENDENT LIVING (<6.0)',
    xLeftLabel: 'EXPENSIVE ($2,500+/MO)',
    xRightLabel: 'AFFORDABLE (<$1,500/MO)',
    sourceText: 'Sources: Hashtag Web3 City Guide (WalkScore, transit access & Numbeo data).',
    items: [
      { name: 'Prague', sub: 'Walk 8.8 · $1,800/mo', countryCode: 'cz', x: 800, y: 240, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Taipei', sub: 'Walk 8.0 · $1,800/mo', countryCode: 'tw', x: 770, y: 350, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Buenos Aires', sub: 'Walk 7.5 · $1,300/mo', countryCode: 'ar', x: 860, y: 430, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Da Nang', sub: 'Walk 6.0 · $850/mo', countryCode: 'vn', x: 990, y: 690 },
      { name: 'Chiang Mai', sub: 'Walk 6.0 · $900/mo', countryCode: 'th', x: 960, y: 480, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Bangkok', sub: 'Walk 6.5 · $1,100/mo', countryCode: 'th', x: 850, y: 570, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Bali', sub: 'Walk 4.0 · Scooter · $1,100', countryCode: 'id', x: 890, y: 840 },
      { name: 'Cape Town', sub: 'Walk 4.5 · Car-Reliant · $1.4k', countryCode: 'za', x: 750, y: 940 },
      { name: 'Barcelona', sub: 'Walk 9.0 · $2,200/mo', countryCode: 'es', x: 650, y: 260, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Vienna', sub: 'Walk 9.2 · $2,300/mo', countryCode: 'at', x: 480, y: 230, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Berlin', sub: 'Walk 8.5 · $2,500/mo', countryCode: 'de', x: 480, y: 370 },
      { name: 'Lisbon', sub: 'Walk 8.5 · $2,000/mo', countryCode: 'pt', x: 650, y: 450, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Tokyo', sub: 'Walk 9.2 · $2,800/mo', countryCode: 'jp', x: 360, y: 250, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Singapore', sub: 'Walk 8.5 · $3,000/mo', countryCode: 'sg', x: 280, y: 200, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'London', sub: 'Walk 8.8 · $3,200/mo', countryCode: 'gb', x: 250, y: 350 },
      { name: 'Dubai', sub: 'Walk 4.0 · $2,500/mo', countryCode: 'ae', x: 500, y: 820 },
      { name: 'San Francisco', sub: 'Walk 8.6 · $3,500/mo', countryCode: 'us', x: 240, y: 470 },
      { name: 'Los Angeles', sub: 'Walk 5.0 · $4,800/mo', countryCode: 'us', x: 230, y: 910 },
    ],
  },

  // 10. THE NOMAD VALUE INDEX: OVERALL SCORE VS COST
  {
    id: 'the-nomad-value-index',
    title: 'The Nomad Value Index: Score vs Cost',
    yTopLabel: 'TOP NOMAD SCORE (85 - 100 / 100)',
    yBottomLabel: 'MODERATE SCORE (<70 / 100)',
    xLeftLabel: 'EXPENSIVE ($2,500+/MO)',
    xRightLabel: 'BUDGET-FRIENDLY (<$1,500/MO)',
    sourceText: 'Sources: Hashtag Web3 Nomad Index (Composite of speed, cost, community, safety & weather).',
    items: [
      { name: 'Chiang Mai', sub: 'Score 97 · $900/mo', countryCode: 'th', x: 980, y: 210 },
      { name: 'Da Nang', sub: 'Score 93 · $850/mo', countryCode: 'vn', x: 990, y: 350 },
      { name: 'Bali', sub: 'Score 88 · $1,100/mo', countryCode: 'id', x: 880, y: 360, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Bangkok', sub: 'Score 86 · $1,100/mo', countryCode: 'th', x: 870, y: 210, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Taipei', sub: 'Score 87 · $1,800/mo', countryCode: 'tw', x: 740, y: 280 },
      { name: 'Medellín', sub: 'Score 85 · $1,400/mo', countryCode: 'co', x: 820, y: 440, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Buenos Aires', sub: 'Score 81 · $1,300/mo', countryCode: 'ar', x: 900, y: 510, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Cape Town', sub: 'Score 81 · $1,400/mo', countryCode: 'za', x: 790, y: 660, labelOffset: { dx: 38, dy: 6, align: 'start' } },
      { name: 'Bucharest', sub: 'Score 72 · $1,300/mo', countryCode: 'ro', x: 880, y: 750 },
      { name: 'Prague', sub: 'Score 73 · $1,800/mo', countryCode: 'cz', x: 720, y: 770 },
      { name: 'Lisbon', sub: 'Score 75 · $2,000/mo', countryCode: 'pt', x: 670, y: 650, labelOffset: { dx: 0, dy: 44, align: 'middle' } },
      { name: 'Barcelona', sub: 'Score 75 · $2,200/mo', countryCode: 'es', x: 530, y: 540, labelOffset: { dx: 0, dy: -46, align: 'middle' } },
      { name: 'Dubai', sub: 'Score 74 · $2,500/mo', countryCode: 'ae', x: 480, y: 630, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Tokyo', sub: 'Score 72 · $2,800/mo', countryCode: 'jp', x: 360, y: 720, labelOffset: { dx: -38, dy: 6, align: 'end' } },
      { name: 'Singapore', sub: 'Score 72 · $3,000/mo', countryCode: 'sg', x: 310, y: 790 },
      { name: 'Berlin', sub: 'Score 66 · $2,500/mo', countryCode: 'de', x: 480, y: 860 },
      { name: 'London', sub: 'Score 60 · $3,200/mo', countryCode: 'gb', x: 280, y: 920 },
      { name: 'San Francisco', sub: 'Score 57 · $3,500/mo', countryCode: 'us', x: 230, y: 1040 },
    ],
  },
];

async function main() {
  console.log('[generate-social-matrices] Checking and generating 10 high-res social media graphics...');

  let totalWarnings = 0;
  for (const config of VISUALS) {
    const warnings = checkCollisions(config);
    if (warnings.length > 0) {
      console.warn(`⚠️ Collisions detected in ${config.id}:`);
      warnings.forEach((w) => console.warn(`   ${w}`));
      totalWarnings += warnings.length;
    }
  }

  if (totalWarnings === 0) {
    console.log(`✅ Collision audit passed: ZERO overlapping labels, flags, or edge clipping across all ${VISUALS.length} charts.`);
  } else {
    console.error(`❌ Total collision errors: ${totalWarnings}`);
    process.exit(1);
  }

  for (const config of VISUALS) {
    const svgContent = generateMatrixSvg(config);
    const svgPath = path.join(OUT_DIR, `${config.id}.svg`);
    const pngPath = path.join(OUT_DIR, `${config.id}.png`);

    // 1. Write SVG to public
    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // 2. Render 1200x1200 PNG via Resvg
    const resvg = new Resvg(svgContent, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(pngPath, pngBuffer);

    // 3. Mirror into Artifact Directory for user inspection & conversation showcase
    if (fs.existsSync(ARTIFACT_DIR)) {
      const artSvg = path.join(ARTIFACT_DIR, `${config.id}.svg`);
      const artPng = path.join(ARTIFACT_DIR, `${config.id}.png`);
      fs.writeFileSync(artSvg, svgContent, 'utf8');
      fs.writeFileSync(artPng, pngBuffer);
    }

    console.log(` - Generated: ${config.id}.png (${(pngBuffer.length / 1024).toFixed(1)} KB) and .svg`);
  }

  console.log('[generate-social-matrices] Successfully generated all 10 visuals!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
