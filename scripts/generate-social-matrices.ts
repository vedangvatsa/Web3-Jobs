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
  x: number; // target x: 0 to 1200
  y: number; // target y: 0 to 1200
  styleIdx?: number;
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

// 12 curated sticker/badge styles inspired by modern alignment charts
export const BADGE_STYLES = [
  { bg: '#FF5722', text: '#FFFFFF', sub: '#FFE0B2', border: 'none' }, // 0. Vibrant Orange
  { bg: '#7C3AED', text: '#FFFFFF', sub: '#E9D5FF', border: 'none' }, // 1. Royal Purple
  { bg: '#059669', text: '#FFFFFF', sub: '#A7F3D0', border: 'none' }, // 2. Forest Emerald
  { bg: '#0F172A', text: '#FFFFFF', sub: '#94A3B8', border: 'none' }, // 3. Obsidian Dark
  { bg: '#E11D48', text: '#FFFFFF', sub: '#FECDD3', border: 'none' }, // 4. Crimson / Rose
  { bg: '#2563EB', text: '#FFFFFF', sub: '#BFDBFE', border: 'none' }, // 5. Electric Blue
  { bg: '#FACC15', text: '#1E293B', sub: '#475569', border: 'none' }, // 6. Mustard Yellow
  { bg: '#FFFFFF', text: '#0F172A', sub: '#64748B', border: '#E2E8F0', shadow: true }, // 7. Clean White Sticker
  { bg: '#C084FC', text: '#1E1B4B', sub: '#581C87', border: 'none' }, // 8. Lilac Vibe
  { bg: '#FB923C', text: '#FFFFFF', sub: '#FFEDD5', border: 'none' }, // 9. Coral Pill
  { bg: '#0D9488', text: '#FFFFFF', sub: '#CCFBF1', border: 'none' }, // 10. Deep Teal
  { bg: '#FFFFFF', text: '#0F172A', sub: '#64748B', border: '#CBD5E1', shadow: true }, // 11. White Card
];

export function getTextWidth(text: string, fontSize: number, isBold: boolean): number {
  return text.length * fontSize * (isBold ? 0.60 : 0.52);
}

export interface PlacedBadge extends MatrixItem {
  w: number;
  h: number;
  bx: number;
  by: number;
  styleIdx: number;
}

export function resolveBadgeCollisions(items: MatrixItem[]): PlacedBadge[] {
  const GAP = 12;
  const placed: PlacedBadge[] = items.map((it, idx) => {
    const nw = getTextWidth(it.name, 13.5, true);
    const sw = getTextWidth(it.sub, 10.5, false);
    const w = Math.max(136, Math.ceil(42 + Math.max(nw, sw) + 14));
    const h = 42;
    return {
      ...it,
      w,
      h,
      bx: it.x - w / 2,
      by: it.y - h / 2,
      styleIdx: it.styleIdx ?? (idx % BADGE_STYLES.length)
    };
  });

  for (let iter = 0; iter < 150; iter++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];

        const overlapX = (a.w / 2 + b.w / 2 + GAP) - Math.abs(a.x - b.x);
        const overlapY = (a.h / 2 + b.h / 2 + GAP) - Math.abs(a.y - b.y);

        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          if (overlapX < overlapY * 1.4) {
            const shift = overlapX / 2 + 1;
            const sign = a.x >= b.x ? 1 : -1;
            a.x += shift * sign;
            b.x -= shift * sign;
          } else {
            const shift = overlapY / 2 + 1;
            const sign = a.y >= b.y ? 1 : -1;
            a.y += shift * sign;
            b.y -= shift * sign;
          }
          a.bx = a.x - a.w / 2;
          a.by = a.y - a.h / 2;
          b.bx = b.x - b.w / 2;
          b.by = b.y - b.h / 2;
        }
      }
    }

    // Clearance from central axes and boundaries
    for (const a of placed) {
      // Y-axis line at x = 600
      if (Math.abs(a.x - 600) < a.w / 2 + 16) {
        const sign = a.x >= 600 ? 1 : -1;
        a.x = 600 + (a.w / 2 + 18) * sign;
        a.bx = a.x - a.w / 2;
      }
      // X-axis line at y = 620
      if (Math.abs(a.y - 620) < a.h / 2 + 16) {
        const sign = a.y >= 620 ? 1 : -1;
        a.y = 620 + (a.h / 2 + 18) * sign;
        a.by = a.y - a.h / 2;
      }
      // Top axis label sanctuary at (600, 140)
      if (Math.abs(a.x - 600) < 240 && Math.abs(a.y - 140) < 38) {
        a.y = 178 + a.h / 2;
        a.by = a.y - a.h / 2;
      }
      // Bottom axis label sanctuary at (600, 1112)
      if (Math.abs(a.x - 600) < 240 && Math.abs(a.y - 1112) < 38) {
        a.y = 1070 - a.h / 2;
        a.by = a.y - a.h / 2;
      }
      // Left label sanctuary at (100, 608)
      if (a.bx < 260 && Math.abs(a.y - 608) < 40) {
        const sign = a.y >= 620 ? 1 : -1;
        a.y = 620 + (a.h / 2 + 35) * sign;
        a.by = a.y - a.h / 2;
      }
      // Right label sanctuary at (1100, 608)
      if (a.bx + a.w > 940 && Math.abs(a.y - 608) < 40) {
        const sign = a.y >= 620 ? 1 : -1;
        a.y = 620 + (a.h / 2 + 35) * sign;
        a.by = a.y - a.h / 2;
      }
      // Outer canvas boundaries
      if (a.bx < 60) { a.x = 60 + a.w / 2; a.bx = 60; }
      if (a.bx + a.w > 1140) { a.x = 1140 - a.w / 2; a.bx = 1140 - a.w; }
      if (a.by < 172) { a.y = 172 + a.h / 2; a.by = 172; }
      if (a.by + a.h > 1072) { a.y = 1072 - a.h / 2; a.by = 1072 - a.h; }
    }
    if (!moved) break;
  }

  return placed;
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

  const placed = resolveBadgeCollisions(config.items);

  // Check collision-free guarantee
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      if (a.bx < b.bx + b.w && a.bx + a.w > b.bx && a.by < b.by + b.h && a.by + a.h > b.by) {
        console.warn(`[Collision Warning] ${config.id}: ${a.name} & ${b.name} touch slightly.`);
      }
    }
  }

  const badgesSvg = placed.map((item, idx) => {
    const b64 = flagCache.get(item.countryCode.toLowerCase().trim())!;
    const style = BADGE_STYLES[item.styleIdx % BADGE_STYLES.length];
    
    const bx = Math.round(item.bx);
    const by = Math.round(item.by);
    const badgeW = item.w;
    const badgeH = item.h;
    const rx = 12;
    
    const strokeAttr = style.border && style.border !== 'none' 
      ? `stroke="${style.border}" stroke-width="1.5"` 
      : '';
    
    const shadowFilter = style.shadow ? 'filter="url(#badgeShadow)"' : 'filter="url(#subtleShadow)"';

    return `
    <g class="badge" data-name="${escapeXml(item.name)}">
      <!-- Badge background container -->
      <rect x="${bx}" y="${by}" width="${badgeW}" height="${badgeH}" rx="${rx}" fill="${style.bg}" ${strokeAttr} ${shadowFilter}/>
      
      <!-- Flag circle inside badge -->
      <g transform="translate(${bx + 9}, ${by + 8})">
        <clipPath id="flag-clip-${config.id}-${idx}">
          <circle cx="13" cy="13" r="13"/>
        </clipPath>
        <image href="data:image/svg+xml;base64,${b64}" x="0" y="0" width="26" height="26" clip-path="url(#flag-clip-${config.id}-${idx})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="13" cy="13" r="13" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.9"/>
        <circle cx="13" cy="13" r="13" fill="none" stroke="#000000" stroke-width="0.5" stroke-opacity="0.15"/>
      </g>
      
      <!-- Text details -->
      <text x="${bx + 42}" y="${by + 18}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="700" fill="${style.text}">${escapeXml(item.name)}</text>
      <text x="${bx + 42}" y="${by + 32}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="500" fill="${style.sub}">${escapeXml(item.sub)}</text>
    </g>`;
  }).join('\n');

  // Title font size scaled dynamically so it NEVER clips on edges
  const titleLen = config.title.length;
  const titleFontSize = titleLen > 38 ? 36 : titleLen > 28 ? 39 : 42;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <!-- Dot Grid Pattern -->
    <pattern id="dotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="#CBD5E1" />
    </pattern>

    <!-- Drop Shadows for Badges -->
    <filter id="badgeShadow" x="-10%" y="-20%" width="125%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.08" />
    </filter>
    <filter id="subtleShadow" x="-10%" y="-20%" width="125%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background Canvas with Dot Grid -->
  <rect width="1200" height="1200" fill="#F8FAFC" />
  <rect width="1200" height="1200" fill="url(#dotGrid)" />

  <!-- Outer Border Frame -->
  <rect x="24" y="24" width="1152" height="1152" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Top Title -->
  <text x="600" y="80" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="${titleFontSize}" font-weight="800" fill="#0F172A" letter-spacing="-0.5px">${escapeXml(config.title)}</text>

  <!-- Central Crosshairs Axes in Clean Charcoal/Slate -->
  <!-- Horizontal X-Axis Line (from 90 to 1110, y=620) -->
  <line x1="90" y1="620" x2="1110" y2="620" stroke="#64748B" stroke-width="2.5" />
  <!-- Left Arrow (pointing LEFT) -->
  <polygon points="75,620 92,612 92,628" fill="#64748B" />
  <!-- Right Arrow (pointing RIGHT) -->
  <polygon points="1125,620 1108,612 1108,628" fill="#64748B" />

  <!-- Vertical Y-Axis Line (from 175 to 1065, x=600) -->
  <line x1="600" y1="175" x2="600" y2="1065" stroke="#64748B" stroke-width="2.5" />
  <!-- Top Arrow (pointing UP) -->
  <polygon points="600,160 592,177 608,177" fill="#64748B" />
  <!-- Bottom Arrow (pointing DOWN) -->
  <polygon points="600,1080 592,1063 608,1063" fill="#64748B" />

  <!-- Axis Labels (Clean, Modern, Slate) -->
  <text x="600" y="140" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#334155" letter-spacing="1.2px">${escapeXml(config.yTopLabel)}</text>
  <text x="600" y="1112" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#334155" letter-spacing="1.2px">${escapeXml(config.yBottomLabel)}</text>
  <text x="100" y="608" text-anchor="start" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#334155" letter-spacing="1.2px">${escapeXml(config.xLeftLabel)}</text>
  <text x="1100" y="608" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#334155" letter-spacing="1.2px">${escapeXml(config.xRightLabel)}</text>

  <!-- Data Badges / Stickers -->
  ${badgesSvg}

  <!-- Footer Sources & Watermark -->
  <line x1="45" y1="1138" x2="1155" y2="1138" stroke="#E2E8F0" stroke-width="1" />
  <text x="45" y="1165" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="13" font-weight="400" fill="#64748B">${escapeXml(config.sourceText)}</text>
  <text x="1155" y="1165" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="14.5"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
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
      { name: 'San Francisco', sub: '$5,400/mo', countryCode: 'us', x: 230, y: 880, styleIdx: 5 },
      { name: 'New York', sub: '$6,100/mo', countryCode: 'us', x: 230, y: 730, styleIdx: 3 },
      { name: 'London', sub: '$4,300/mo', countryCode: 'gb', x: 330, y: 530, styleIdx: 7 },
      { name: 'Singapore', sub: '$4,200/mo', countryCode: 'sg', x: 370, y: 350, styleIdx: 3 },
      { name: 'Dubai', sub: '$3,600/mo', countryCode: 'ae', x: 440, y: 260, styleIdx: 0 },
      { name: 'Barcelona', sub: '$2,800/mo', countryCode: 'es', x: 500, y: 380, styleIdx: 4 },
      { name: 'Lisbon', sub: '$2,500/mo', countryCode: 'pt', x: 690, y: 350, styleIdx: 0 },
      { name: 'Tokyo', sub: '$2,200/mo', countryCode: 'jp', x: 740, y: 235, styleIdx: 9 },
      { name: 'Tallinn', sub: '$1,950/mo', countryCode: 'ee', x: 700, y: 440, styleIdx: 5 },
      { name: 'Mexico City', sub: '$1,800/mo', countryCode: 'mx', x: 740, y: 560, styleIdx: 6 },
      { name: 'Bangkok', sub: '$1,400/mo', countryCode: 'th', x: 840, y: 270, styleIdx: 1 },
      { name: 'Cape Town', sub: '$1,350/mo', countryCode: 'za', x: 830, y: 710, styleIdx: 7 },
      { name: 'Bali', sub: '$1,250/mo', countryCode: 'id', x: 890, y: 380, styleIdx: 6 },
      { name: 'Medellín', sub: '$1,150/mo', countryCode: 'co', x: 910, y: 560, styleIdx: 8 },
      { name: 'Buenos Aires', sub: '$950/mo', countryCode: 'ar', x: 940, y: 790, styleIdx: 8 },
      { name: 'Chiang Mai', sub: '$900/mo', countryCode: 'th', x: 980, y: 230, styleIdx: 2 },
      { name: 'Da Nang', sub: '$850/mo', countryCode: 'vn', x: 990, y: 480, styleIdx: 0 },
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
      { name: 'Singapore', sub: '195 Visa-Free · Closed', countryCode: 'sg', x: 230, y: 210, styleIdx: 3 },
      { name: 'Germany', sub: '191 Visa-Free · 5y Route', countryCode: 'de', x: 300, y: 260, styleIdx: 7 },
      { name: 'Spain', sub: '190 Visa-Free · €500k', countryCode: 'es', x: 430, y: 310, styleIdx: 4 },
      { name: 'Portugal', sub: '188 Visa-Free · €500k', countryCode: 'pt', x: 500, y: 380, styleIdx: 0 },
      { name: 'Malta', sub: '187 Visa-Free · €750k CBI', countryCode: 'mt', x: 310, y: 430, styleIdx: 1 },
      { name: 'Greece', sub: '187 Visa-Free · €400k Real Est.', countryCode: 'gr', x: 720, y: 240, styleIdx: 5 },
      { name: 'UAE', sub: '182 Visa-Free · $545k 10-Yr', countryCode: 'ae', x: 430, y: 490, styleIdx: 0 },
      { name: 'Cyprus', sub: '181 Visa-Free · €300k PR', countryCode: 'cy', x: 550, y: 530, styleIdx: 6 },
      { name: 'St. Kitts & Nevis', sub: '157 Visa-Free · $250k CBI', countryCode: 'kn', x: 740, y: 530, styleIdx: 2 },
      { name: 'Antigua & Barbuda', sub: '153 Visa-Free · $230k CBI', countryCode: 'ag', x: 900, y: 600, styleIdx: 10 },
      { name: 'Grenada', sub: '148 Visa-Free · $235k', countryCode: 'gd', x: 740, y: 710, styleIdx: 9 },
      { name: 'Dominica', sub: '145 Visa-Free · $200k CBI', countryCode: 'dm', x: 920, y: 740, styleIdx: 2 },
      { name: 'St. Lucia', sub: '146 Visa-Free · $240k CBI', countryCode: 'lc', x: 780, y: 840, styleIdx: 5 },
      { name: 'El Salvador', sub: '136 Visa-Free · $1M BTC', countryCode: 'sv', x: 250, y: 890, styleIdx: 6 },
      { name: 'Turkey', sub: '118 Visa-Free · $400k', countryCode: 'tr', x: 490, y: 920, styleIdx: 4 },
      { name: 'Vanuatu', sub: '117 Visa-Free · $130k', countryCode: 'vu', x: 960, y: 920, styleIdx: 8 },
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
      { name: 'San Francisco', sub: 'Top Dev Hub · ~50% Max Tax', countryCode: 'us', x: 230, y: 220, styleIdx: 5 },
      { name: 'New York', sub: 'Wall St Web3 · BitLicense', countryCode: 'us', x: 240, y: 350, styleIdx: 3 },
      { name: 'London', sub: 'Global Tech Hub · 20% CGT', countryCode: 'gb', x: 370, y: 290, styleIdx: 7 },
      { name: 'Tokyo', sub: 'Gaming Capital · Up to 55%', countryCode: 'jp', x: 330, y: 550, styleIdx: 9 },
      { name: 'Seoul', sub: 'Retail Leader · 20% Tax', countryCode: 'kr', x: 430, y: 460, styleIdx: 1 },
      { name: 'Austin', sub: 'Bitcoin Hub · 0% State Tax', countryCode: 'us', x: 460, y: 670, styleIdx: 0 },
      { name: 'Zurich / Zug', sub: 'Crypto Valley · 0% CGT', countryCode: 'ch', x: 740, y: 240, styleIdx: 4 },
      { name: 'Dubai', sub: 'VARA Hub · 0% Income & CGT', countryCode: 'ae', x: 940, y: 230, styleIdx: 0 },
      { name: 'Berlin', sub: 'Ethereum Core · 0% After 1y', countryCode: 'de', x: 670, y: 360, styleIdx: 7 },
      { name: 'Singapore', sub: 'Asia Hub · 0% Capital Gains', countryCode: 'sg', x: 880, y: 340, styleIdx: 3 },
      { name: 'Lisbon', sub: 'Hacker Houses · 0% After 365d', countryCode: 'pt', x: 690, y: 490, styleIdx: 0 },
      { name: 'Hong Kong', sub: 'Licensed ETFs · 0% CGT', countryCode: 'hk', x: 890, y: 480, styleIdx: 4 },
      { name: 'Bangkok', sub: 'Hackathon Wave · DTV Friendly', countryCode: 'th', x: 870, y: 640, styleIdx: 1 },
      { name: 'Bali', sub: 'Nomad Haven · 0.1% Final Tax', countryCode: 'id', x: 940, y: 770, styleIdx: 6 },
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
      { name: 'Thailand (DTV)', sub: '5 Years · $28k Proof', countryCode: 'th', x: 940, y: 220, styleIdx: 2 },
      { name: 'Albania', sub: 'Up to 5 Yrs · ~$820/mo', countryCode: 'al', x: 880, y: 330, styleIdx: 10 },
      { name: 'Spain', sub: '3-5 Years · ~$2,800/mo', countryCode: 'es', x: 730, y: 240, styleIdx: 4 },
      { name: 'Colombia', sub: '2 Years · ~$1,400/mo', countryCode: 'co', x: 860, y: 440, styleIdx: 8 },
      { name: 'Portugal (D8)', sub: '2 Years · ~$3,500/mo', countryCode: 'pt', x: 330, y: 340, styleIdx: 0 },
      { name: 'Mexico', sub: '1-4 Years · ~$3,200/mo', countryCode: 'mx', x: 480, y: 350, styleIdx: 6 },
      { name: 'Greece', sub: '2 Years · €3,500/mo', countryCode: 'gr', x: 340, y: 460, styleIdx: 5 },
      { name: 'Costa Rica', sub: '2 Years · $3,000/mo', countryCode: 'cr', x: 490, y: 470, styleIdx: 2 },
      { name: 'Dubai', sub: '1 Year · $3,500/mo (0% Tax)', countryCode: 'ae', x: 350, y: 590, styleIdx: 0 },
      { name: 'Croatia', sub: '1 Year · ~$2,700/mo (0% Tax)', countryCode: 'hr', x: 700, y: 530, styleIdx: 1 },
      { name: 'Italy', sub: '1 Year · ~$3,000/mo', countryCode: 'it', x: 500, y: 680, styleIdx: 7 },
      { name: 'Malta', sub: '1 Year · €3,500/mo', countryCode: 'mt', x: 370, y: 770, styleIdx: 1 },
      { name: 'Indonesia (E33G)', sub: '1 Year · $60k/yr', countryCode: 'id', x: 250, y: 780, styleIdx: 6 },
      { name: 'Japan', sub: '6 Months · ~$5,500/mo', countryCode: 'jp', x: 340, y: 890, styleIdx: 9 },
      { name: 'Iceland', sub: '6 Months · ~$7,500/mo', countryCode: 'is', x: 230, y: 960, styleIdx: 7 },
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
      { name: 'Chiang Mai', sub: '336 Mbps · $900/mo', countryCode: 'th', x: 990, y: 230, styleIdx: 2 },
      { name: 'Bangkok', sub: '368 Mbps · $1,100/mo', countryCode: 'th', x: 810, y: 220, styleIdx: 1 },
      { name: 'Bucharest', sub: '339 Mbps · $1,300/mo', countryCode: 'ro', x: 820, y: 340, styleIdx: 5 },
      { name: 'Da Nang', sub: '246 Mbps · $850/mo', countryCode: 'vn', x: 990, y: 460, styleIdx: 0 },
      { name: 'Buenos Aires', sub: '233 Mbps · $1,300/mo', countryCode: 'ar', x: 890, y: 530, styleIdx: 8 },
      { name: 'Bali', sub: '102 Mbps · $1,100/mo', countryCode: 'id', x: 900, y: 760, styleIdx: 6 },
      { name: 'Cape Town', sub: '94 Mbps · $1,400/mo', countryCode: 'za', x: 770, y: 880, styleIdx: 7 },
      { name: 'Taipei', sub: '260 Mbps · $1,800/mo', countryCode: 'tw', x: 740, y: 430, styleIdx: 10 },
      { name: 'Prague', sub: '253 Mbps · $1,800/mo', countryCode: 'cz', x: 710, y: 540, styleIdx: 11 },
      { name: 'Lisbon', sub: '361 Mbps · $2,000/mo', countryCode: 'pt', x: 700, y: 260, styleIdx: 0 },
      { name: 'Barcelona', sub: '345 Mbps · $2,200/mo', countryCode: 'es', x: 480, y: 390, styleIdx: 4 },
      { name: 'Dubai', sub: '369 Mbps · $2,500/mo', countryCode: 'ae', x: 450, y: 250, styleIdx: 3 },
      { name: 'Berlin', sub: '210 Mbps · $2,500/mo', countryCode: 'de', x: 480, y: 530, styleIdx: 7 },
      { name: 'Tokyo', sub: '304 Mbps · $2,800/mo', countryCode: 'jp', x: 310, y: 390, styleIdx: 9 },
      { name: 'Singapore', sub: '577 Mbps · $3,000/mo', countryCode: 'sg', x: 270, y: 230, styleIdx: 3 },
      { name: 'London', sub: '306 Mbps · $3,200/mo', countryCode: 'gb', x: 230, y: 460, styleIdx: 11 },
      { name: 'San Francisco', sub: '372 Mbps · $3,500/mo', countryCode: 'us', x: 220, y: 310, styleIdx: 5 },
      { name: 'New York', sub: '290 Mbps · $6,100/mo', countryCode: 'us', x: 220, y: 720, styleIdx: 3 },
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
      { name: 'Taipei', sub: 'Safety 9.0 · $700 Rent', countryCode: 'tw', x: 740, y: 240, styleIdx: 2 },
      { name: 'Prague', sub: 'Safety 8.3 · $750 Rent', countryCode: 'cz', x: 730, y: 350, styleIdx: 7 },
      { name: 'Chiang Mai', sub: 'Safety 8.0 · $350 Rent', countryCode: 'th', x: 970, y: 230, styleIdx: 2 },
      { name: 'Bangkok', sub: 'Safety 7.0 · $450 Rent', countryCode: 'th', x: 870, y: 340, styleIdx: 1 },
      { name: 'Da Nang', sub: 'Safety 7.5 · $300 Rent', countryCode: 'vn', x: 980, y: 460, styleIdx: 0 },
      { name: 'Bucharest', sub: 'Safety 7.0 · $500 Rent', countryCode: 'ro', x: 840, y: 500, styleIdx: 5 },
      { name: 'Bali', sub: 'Safety 7.2 · $450 Rent', countryCode: 'id', x: 880, y: 670, styleIdx: 6 },
      { name: 'Buenos Aires', sub: 'Safety 5.8 · $500 Rent', countryCode: 'ar', x: 860, y: 780, styleIdx: 8 },
      { name: 'Medellín', sub: 'Safety 5.5 · $550 Rent', countryCode: 'co', x: 840, y: 890, styleIdx: 8 },
      { name: 'Cape Town', sub: 'Safety 4.5 · $550 Rent', countryCode: 'za', x: 720, y: 970, styleIdx: 7 },
      { name: 'Tokyo', sub: 'Safety 9.2 · $1,200 Rent', countryCode: 'jp', x: 440, y: 240, styleIdx: 9 },
      { name: 'Singapore', sub: 'Safety 9.1 · $1,400 Rent', countryCode: 'sg', x: 290, y: 220, styleIdx: 3 },
      { name: 'Dubai', sub: 'Safety 8.5 · $1,100 Rent', countryCode: 'ae', x: 460, y: 360, styleIdx: 0 },
      { name: 'Lisbon', sub: 'Safety 7.5 · $850 Rent', countryCode: 'pt', x: 670, y: 410, styleIdx: 0 },
      { name: 'Berlin', sub: 'Safety 7.2 · $1,100 Rent', countryCode: 'de', x: 480, y: 490, styleIdx: 7 },
      { name: 'Barcelona', sub: 'Safety 6.8 · $950 Rent', countryCode: 'es', x: 670, y: 550, styleIdx: 4 },
      { name: 'London', sub: 'Safety 6.5 · $1,500 Rent', countryCode: 'gb', x: 340, y: 680, styleIdx: 11 },
      { name: 'San Francisco', sub: 'Safety 5.5 · $1,800 Rent', countryCode: 'us', x: 240, y: 860, styleIdx: 5 },
      { name: 'New York', sub: 'Safety 5.0 · $2,900 Rent', countryCode: 'us', x: 230, y: 970, styleIdx: 3 },
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
      { name: 'Thailand (DTV)', sub: '5 Yrs · 0% Foreign Tax', countryCode: 'th', x: 960, y: 210, styleIdx: 2 },
      { name: 'Albania', sub: '5 Yrs · 0% Tax · ~$820/mo', countryCode: 'al', x: 890, y: 310, styleIdx: 10 },
      { name: 'Georgia', sub: '1 Yr · 1% Micro-Tax · $0/mo', countryCode: 'ge', x: 970, y: 410, styleIdx: 6 },
      { name: 'Croatia', sub: '1.5 Yrs · 0% Tax · ~$2.7k', countryCode: 'hr', x: 730, y: 240, styleIdx: 1 },
      { name: 'Costa Rica', sub: '1 Yr · 0% Tax · $3,000/mo', countryCode: 'cr', x: 550, y: 260, styleIdx: 2 },
      { name: 'Dubai / UAE', sub: '1 Yr · 0% Tax · $3,500/mo', countryCode: 'ae', x: 370, y: 230, styleIdx: 0 },
      { name: 'Barbados', sub: '1 Yr · 0% Tax · $4,167/mo', countryCode: 'bb', x: 260, y: 290, styleIdx: 8 },
      { name: 'Colombia', sub: '2 Yrs · Tax after 183d', countryCode: 'co', x: 880, y: 720, styleIdx: 8 },
      { name: 'Brazil', sub: '1 Yr · Tax after 183d', countryCode: 'br', x: 770, y: 830, styleIdx: 2 },
      { name: 'Spain', sub: '3-5 Yrs · 24% Beckham Law', countryCode: 'es', x: 670, y: 530, styleIdx: 4 },
      { name: 'Greece', sub: '2 Yrs · 50% Tax Break', countryCode: 'gr', x: 420, y: 490, styleIdx: 5 },
      { name: 'Italy', sub: '1 Yr · 5% Impatriati', countryCode: 'it', x: 540, y: 380, styleIdx: 7 },
      { name: 'Portugal (D8)', sub: '2 Yrs · Standard Brackets', countryCode: 'pt', x: 410, y: 750, styleIdx: 0 },
      { name: 'Japan', sub: '6 Mos · Standard Tax', countryCode: 'jp', x: 280, y: 860, styleIdx: 9 },
      { name: 'Iceland', sub: '6 Mos · Standard Tax', countryCode: 'is', x: 220, y: 970, styleIdx: 7 },
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
      { name: 'Vanuatu', sub: '117 Visa-Free · $130k', countryCode: 'vu', x: 960, y: 210, styleIdx: 8 },
      { name: 'Dominica', sub: '145 Visa-Free · $200k', countryCode: 'dm', x: 920, y: 330, styleIdx: 2 },
      { name: 'Antigua & Barbuda', sub: '153 Visa-Free · $230k', countryCode: 'ag', x: 790, y: 240, styleIdx: 10 },
      { name: 'Grenada', sub: '148 Visa-Free · $235k', countryCode: 'gd', x: 840, y: 440, styleIdx: 9 },
      { name: 'St. Lucia', sub: '146 Visa-Free · $240k', countryCode: 'lc', x: 730, y: 360, styleIdx: 5 },
      { name: 'St. Kitts & Nevis', sub: '157 Visa-Free · $250k', countryCode: 'kn', x: 650, y: 250, styleIdx: 2 },
      { name: 'El Salvador', sub: '136 Visa-Free · $1M BTC', countryCode: 'sv', x: 240, y: 270, styleIdx: 6 },
      { name: 'Turkey', sub: '118 Visa-Free · $400k', countryCode: 'tr', x: 470, y: 440, styleIdx: 4 },
      { name: 'Malta', sub: '187 Visa-Free · €750k', countryCode: 'mt', x: 340, y: 390, styleIdx: 1 },
      { name: 'UAE', sub: '182 Visa-Free · $545k', countryCode: 'ae', x: 430, y: 550, styleIdx: 0 },
      { name: 'Greece', sub: '187 Visa-Free · €400k+', countryCode: 'gr', x: 490, y: 770, styleIdx: 5 },
      { name: 'Portugal', sub: '188 Visa-Free · €500k', countryCode: 'pt', x: 670, y: 700, styleIdx: 0 },
      { name: 'Spain', sub: '190 Visa-Free · €500k', countryCode: 'es', x: 420, y: 880, styleIdx: 4 },
      { name: 'Germany', sub: '191 Visa-Free · 5y Natural.', countryCode: 'de', x: 310, y: 740, styleIdx: 7 },
      { name: 'Singapore', sub: '195 Visa-Free · Closed', countryCode: 'sg', x: 230, y: 960, styleIdx: 3 },
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
      { name: 'Prague', sub: 'Walk 8.8 · $1,800/mo', countryCode: 'cz', x: 800, y: 240, styleIdx: 7 },
      { name: 'Taipei', sub: 'Walk 8.0 · $1,800/mo', countryCode: 'tw', x: 770, y: 350, styleIdx: 2 },
      { name: 'Buenos Aires', sub: 'Walk 7.5 · $1,300/mo', countryCode: 'ar', x: 860, y: 430, styleIdx: 8 },
      { name: 'Da Nang', sub: 'Walk 6.0 · $850/mo', countryCode: 'vn', x: 990, y: 690, styleIdx: 0 },
      { name: 'Chiang Mai', sub: 'Walk 6.0 · $900/mo', countryCode: 'th', x: 960, y: 480, styleIdx: 2 },
      { name: 'Bangkok', sub: 'Walk 6.5 · $1,100/mo', countryCode: 'th', x: 850, y: 570, styleIdx: 1 },
      { name: 'Bali', sub: 'Walk 4.0 · Scooter · $1,100', countryCode: 'id', x: 890, y: 840, styleIdx: 6 },
      { name: 'Cape Town', sub: 'Walk 4.5 · Car-Reliant · $1.4k', countryCode: 'za', x: 750, y: 940, styleIdx: 7 },
      { name: 'Barcelona', sub: 'Walk 9.0 · $2,200/mo', countryCode: 'es', x: 670, y: 260, styleIdx: 4 },
      { name: 'Vienna', sub: 'Walk 9.2 · $2,300/mo', countryCode: 'at', x: 480, y: 230, styleIdx: 1 },
      { name: 'Berlin', sub: 'Walk 8.5 · $2,500/mo', countryCode: 'de', x: 480, y: 370, styleIdx: 7 },
      { name: 'Lisbon', sub: 'Walk 8.5 · $2,000/mo', countryCode: 'pt', x: 670, y: 450, styleIdx: 0 },
      { name: 'Tokyo', sub: 'Walk 9.2 · $2,800/mo', countryCode: 'jp', x: 360, y: 250, styleIdx: 9 },
      { name: 'Singapore', sub: 'Walk 8.5 · $3,000/mo', countryCode: 'sg', x: 280, y: 200, styleIdx: 3 },
      { name: 'London', sub: 'Walk 8.8 · $3,200/mo', countryCode: 'gb', x: 250, y: 350, styleIdx: 11 },
      { name: 'Dubai', sub: 'Walk 4.0 · $2,500/mo', countryCode: 'ae', x: 500, y: 820, styleIdx: 0 },
      { name: 'San Francisco', sub: 'Walk 8.6 · $3,500/mo', countryCode: 'us', x: 240, y: 470, styleIdx: 5 },
      { name: 'Los Angeles', sub: 'Walk 5.0 · $4,800/mo', countryCode: 'us', x: 230, y: 910, styleIdx: 3 },
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
      { name: 'Chiang Mai', sub: 'Score 97 · $900/mo', countryCode: 'th', x: 980, y: 210, styleIdx: 2 },
      { name: 'Da Nang', sub: 'Score 93 · $850/mo', countryCode: 'vn', x: 990, y: 350, styleIdx: 0 },
      { name: 'Bali', sub: 'Score 88 · $1,100/mo', countryCode: 'id', x: 880, y: 360, styleIdx: 6 },
      { name: 'Bangkok', sub: 'Score 86 · $1,100/mo', countryCode: 'th', x: 870, y: 210, styleIdx: 1 },
      { name: 'Taipei', sub: 'Score 87 · $1,800/mo', countryCode: 'tw', x: 740, y: 280, styleIdx: 10 },
      { name: 'Medellín', sub: 'Score 85 · $1,400/mo', countryCode: 'co', x: 820, y: 440, styleIdx: 8 },
      { name: 'Buenos Aires', sub: 'Score 81 · $1,300/mo', countryCode: 'ar', x: 900, y: 510, styleIdx: 8 },
      { name: 'Cape Town', sub: 'Score 81 · $1,400/mo', countryCode: 'za', x: 790, y: 660, styleIdx: 7 },
      { name: 'Bucharest', sub: 'Score 72 · $1,300/mo', countryCode: 'ro', x: 880, y: 750, styleIdx: 5 },
      { name: 'Prague', sub: 'Score 73 · $1,800/mo', countryCode: 'cz', x: 720, y: 770, styleIdx: 7 },
      { name: 'Lisbon', sub: 'Score 75 · $2,000/mo', countryCode: 'pt', x: 670, y: 650, styleIdx: 0 },
      { name: 'Barcelona', sub: 'Score 75 · $2,200/mo', countryCode: 'es', x: 530, y: 540, styleIdx: 4 },
      { name: 'Dubai', sub: 'Score 74 · $2,500/mo', countryCode: 'ae', x: 480, y: 630, styleIdx: 0 },
      { name: 'Tokyo', sub: 'Score 72 · $2,800/mo', countryCode: 'jp', x: 360, y: 720, styleIdx: 9 },
      { name: 'Singapore', sub: 'Score 72 · $3,000/mo', countryCode: 'sg', x: 310, y: 790, styleIdx: 3 },
      { name: 'Berlin', sub: 'Score 66 · $2,500/mo', countryCode: 'de', x: 480, y: 860, styleIdx: 7 },
      { name: 'London', sub: 'Score 60 · $3,200/mo', countryCode: 'gb', x: 280, y: 920, styleIdx: 11 },
      { name: 'San Francisco', sub: 'Score 57 · $3,500/mo', countryCode: 'us', x: 230, y: 1040, styleIdx: 5 },
    ],
  },
];

async function main() {
  console.log('[generate-social-matrices] Generating 10 high-res alignment chart graphics...');

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
