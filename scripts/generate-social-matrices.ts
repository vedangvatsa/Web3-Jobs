#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'images', 'social');
const FLAGS_DIR = path.join(ROOT, 'content', 'flags-cache');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

fs.mkdirSync(OUT_DIR, { recursive: true });

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

export function checkCollisions(config: MatrixConfig): string[] {
  const warnings: string[] = [];
  const items = config.items;
  const flagRadius = 27;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      // Flag-to-flag distance
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < flagRadius * 2 + 10) {
        warnings.push(`[${config.id}] Flags too close: "${a.name}" & "${b.name}" (dist: ${dist.toFixed(1)}px)`);
      }

      // Check label bounding box overlap
      const aOffset = a.labelOffset || { dx: 0, dy: 44, align: 'middle' };
      const bOffset = b.labelOffset || { dx: 0, dy: 44, align: 'middle' };

      const aLabelX = a.x + aOffset.dx;
      const aLabelY = a.y + aOffset.dy;
      const bLabelX = b.x + bOffset.dx;
      const bLabelY = b.y + bOffset.dy;

      const labelDistX = Math.abs(aLabelX - bLabelX);
      const labelDistY = Math.abs(aLabelY - bLabelY);

      // Typical text label is ~120px wide, ~36px tall
      if (labelDistX < 85 && labelDistY < 32) {
        warnings.push(`[${config.id}] Label overlap: "${a.name}" & "${b.name}" (dx: ${labelDistX.toFixed(1)}px, dy: ${labelDistY.toFixed(1)}px)`);
      }
    }
  }
  return warnings;
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
      
      <!-- Labels -->
      <text x="${tx}" y="${ty}" text-anchor="${align}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15.5" font-weight="700" fill="#111827">${escapeXml(item.name)}</text>
      <text x="${tx}" y="${ty + 18}" text-anchor="${align}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="500" fill="#6B7280">${escapeXml(item.sub)}</text>
    </g>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <style>
      .title { font-family: Georgia, 'Times New Roman', 'Playfair Display', serif; font-weight: 700; fill: #111827; }
      .axis-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1.5px; fill: #111827; }
      .meta { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    </style>
    <marker id="arrow-right" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1F2937"/>
    </marker>
    <marker id="arrow-left" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#1F2937"/>
    </marker>
    <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1.5 8 L 5 0 L 8.5 8 z" fill="#1F2937"/>
    </marker>
    <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1.5 0 L 5 8 L 8.5 0 z" fill="#1F2937"/>
    </marker>
  </defs>

  <!-- Clean Background -->
  <rect width="1200" height="1200" fill="#FFFFFF"/>

  <!-- Top Header Title -->
  <text x="600" y="90" text-anchor="middle" font-size="52" class="title">${escapeXml(config.title)}</text>

  <!-- Crosshairs Axes -->
  <!-- Horizontal X-Axis (from 215 to 985, y=620) -->
  <line x1="215" y1="620" x2="985" y2="620" stroke="#1F2937" stroke-width="2.2" marker-start="url(#arrow-left)" marker-end="url(#arrow-right)"/>
  
  <!-- Vertical Y-Axis (from 195 to 1045, x=600) -->
  <line x1="600" y1="195" x2="600" y2="1045" stroke="#1F2937" stroke-width="2.2" marker-start="url(#arrow-up)" marker-end="url(#arrow-down)"/>

  <!-- Axis Labels -->
  <!-- Top Label -->
  <text x="600" y="165" text-anchor="middle" font-size="18" class="axis-label">${escapeXml(config.yTopLabel)}</text>
  
  <!-- Bottom Label -->
  <text x="600" y="1080" text-anchor="middle" font-size="18" class="axis-label">${escapeXml(config.yBottomLabel)}</text>
  
  <!-- Left Label -->
  <text x="195" y="626" text-anchor="end" font-size="18" class="axis-label">${escapeXml(config.xLeftLabel)}</text>
  
  <!-- Right Label -->
  <text x="1005" y="626" text-anchor="start" font-size="18" class="axis-label">${escapeXml(config.xRightLabel)}</text>

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
    yTopLabel: 'TOP NOMAD QUALITY &amp; INFRASTRUCTURE',
    yBottomLabel: 'LOWER NOMAD INFRASTRUCTURE',
    xLeftLabel: 'EXPENSIVE',
    xRightLabel: 'AFFORDABLE',
    sourceText: 'Sources: Hashtag Web3 Nomad Index (Oct 2026). Costs: Numbeo incl. rent, cafe &amp; coworking.',
    items: [
      { name: 'San Francisco', sub: '$5,400/mo', countryCode: 'us', x: 230, y: 880 },
      { name: 'New York', sub: '$6,100/mo', countryCode: 'us', x: 230, y: 730 },
      { name: 'London', sub: '$4,300/mo', countryCode: 'gb', x: 330, y: 530 },
      { name: 'Singapore', sub: '$4,200/mo', countryCode: 'sg', x: 370, y: 350 },
      { name: 'Dubai', sub: '$3,600/mo', countryCode: 'ae', x: 440, y: 260 },
      { name: 'Barcelona', sub: '$2,800/mo', countryCode: 'es', x: 520, y: 380 },
      { name: 'Lisbon', sub: '$2,500/mo', countryCode: 'pt', x: 590, y: 310 },
      { name: 'Tokyo', sub: '$2,200/mo', countryCode: 'jp', x: 670, y: 230 },
      { name: 'Tallinn', sub: '$1,950/mo', countryCode: 'ee', x: 690, y: 440 },
      { name: 'Mexico City', sub: '$1,800/mo', countryCode: 'mx', x: 740, y: 550 },
      { name: 'Bangkok', sub: '$1,400/mo', countryCode: 'th', x: 820, y: 290 },
      { name: 'Cape Town', sub: '$1,350/mo', countryCode: 'za', x: 830, y: 710 },
      { name: 'Bali', sub: '$1,250/mo', countryCode: 'id', x: 880, y: 370 },
      { name: 'Medellín', sub: '$1,150/mo', countryCode: 'co', x: 910, y: 590 },
      { name: 'Buenos Aires', sub: '$950/mo', countryCode: 'ar', x: 940, y: 790 },
      { name: 'Chiang Mai', sub: '$900/mo', countryCode: 'th', x: 970, y: 250 },
      { name: 'Da Nang', sub: '$850/mo', countryCode: 'vn', x: 990, y: 480 },
    ],
  },

  // 2. GLOBAL PASSPORTS: MOBILITY VS ACQUISITION COST
  {
    id: 'global-passports-mobility-vs-cost',
    title: 'Global Passports: Mobility vs Cost',
    yTopLabel: 'TIER-1 PASSPORT POWER (180+ DESTINATIONS)',
    yBottomLabel: 'MODERATE PASSPORT POWER (&lt;150 DESTINATIONS)',
    xLeftLabel: 'EXPENSIVE CBI',
    xRightLabel: 'ACCESSIBLE CBI',
    sourceText: 'Sources: Hashtag Web3 Passport Index 2026 &amp; official Citizenship-by-Investment registries.',
    items: [
      { name: 'Singapore', sub: '195 Visa-Free · Closed', countryCode: 'sg', x: 230, y: 220 },
      { name: 'Germany', sub: '191 Visa-Free · 5-Yr Route', countryCode: 'de', x: 310, y: 260 },
      { name: 'Spain', sub: '190 Visa-Free · €500k', countryCode: 'es', x: 400, y: 310 },
      { name: 'Portugal', sub: '188 Visa-Free · €500k Fund', countryCode: 'pt', x: 490, y: 360 },
      { name: 'Malta', sub: '187 Visa-Free · €750k CBI', countryCode: 'mt', x: 310, y: 400 },
      { name: 'Greece', sub: '187 Visa-Free · €400k Real Est.', countryCode: 'gr', x: 530, y: 240, labelOffset: { dx: 0, dy: -46 } },
      { name: 'UAE', sub: '182 Visa-Free · $545k 10-Yr', countryCode: 'ae', x: 470, y: 470 },
      { name: 'Cyprus', sub: '181 Visa-Free · €300k PR', countryCode: 'cy', x: 570, y: 530 },
      { name: 'St. Kitts &amp; Nevis', sub: '157 Visa-Free · $250k CBI', countryCode: 'kn', x: 740, y: 570 },
      { name: 'Antigua &amp; Barbuda', sub: '153 Visa-Free · $230k CBI', countryCode: 'ag', x: 870, y: 630 },
      { name: 'Grenada', sub: '148 Visa-Free · $235k (US E-2)', countryCode: 'gd', x: 750, y: 720 },
      { name: 'Dominica', sub: '145 Visa-Free · $200k CBI', countryCode: 'dm', x: 910, y: 770 },
      { name: 'St. Lucia', sub: '146 Visa-Free · $240k CBI', countryCode: 'lc', x: 780, y: 840 },
      { name: 'El Salvador', sub: '136 Visa-Free · $1M BTC', countryCode: 'sv', x: 250, y: 890 },
      { name: 'Turkey', sub: '118 Visa-Free · $400k Real Est.', countryCode: 'tr', x: 490, y: 920 },
      { name: 'Vanuatu', sub: '117 Visa-Free · $130k (30 Days)', countryCode: 'vu', x: 960, y: 920 },
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
    sourceText: 'Sources: Hashtag Web3 Developer Ecosystem &amp; Crypto Tax Guide (October 2026).',
    items: [
      { name: 'San Francisco', sub: 'Top Dev Hub · ~50% Max Tax', countryCode: 'us', x: 230, y: 220 },
      { name: 'New York', sub: 'Wall St Web3 · BitLicense', countryCode: 'us', x: 240, y: 340 },
      { name: 'London', sub: 'Global Tech Hub · 20% CGT', countryCode: 'gb', x: 370, y: 290 },
      { name: 'Tokyo', sub: 'Gaming Capital · Up to 55%', countryCode: 'jp', x: 330, y: 550 },
      { name: 'Seoul', sub: 'Retail Leader · 20% Tax (2027)', countryCode: 'kr', x: 420, y: 470 },
      { name: 'Austin', sub: 'Bitcoin Hub · 0% State Tax', countryCode: 'us', x: 460, y: 660 },
      { name: 'Zurich / Zug', sub: 'Crypto Valley · 0% Wealth CGT', countryCode: 'ch', x: 740, y: 240 },
      { name: 'Dubai', sub: 'VARA Hub · 0% Income &amp; CGT', countryCode: 'ae', x: 940, y: 230 },
      { name: 'Berlin', sub: 'Ethereum Core · 0% After 1-Yr', countryCode: 'de', x: 650, y: 360 },
      { name: 'Singapore', sub: 'Asia Hub · 0% Capital Gains', countryCode: 'sg', x: 860, y: 340 },
      { name: 'Lisbon', sub: 'Hacker Houses · 0% After 365d', countryCode: 'pt', x: 680, y: 490 },
      { name: 'Hong Kong', sub: 'Licensed ETFs · 0% CGT', countryCode: 'hk', x: 870, y: 470 },
      { name: 'Bangkok', sub: 'Hackathon Wave · DTV Friendly', countryCode: 'th', x: 860, y: 610 },
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
      { name: 'Thailand (DTV)', sub: '5 Years · $28k Savings Proof', countryCode: 'th', x: 940, y: 230 },
      { name: 'Albania', sub: 'Up to 5 Yrs · ~$820/mo (0% Tax)', countryCode: 'al', x: 880, y: 330 },
      { name: 'Spain', sub: '3-5 Years · ~$2,800/mo', countryCode: 'es', x: 580, y: 260, labelOffset: { dx: 0, dy: -46 } },
      { name: 'Colombia', sub: '2 Years · ~$1,400/mo', countryCode: 'co', x: 860, y: 440 },
      { name: 'Portugal (D8)', sub: '2 Years · ~$3,500/mo', countryCode: 'pt', x: 340, y: 350 },
      { name: 'Mexico', sub: '1-4 Years · ~$3,200/mo', countryCode: 'mx', x: 480, y: 340 },
      { name: 'Greece', sub: '2 Years · €3,500/mo', countryCode: 'gr', x: 340, y: 470 },
      { name: 'Costa Rica', sub: '2 Years · $3,000/mo', countryCode: 'cr', x: 480, y: 460 },
      { name: 'Dubai', sub: '1 Year · $3,500/mo (0% Tax)', countryCode: 'ae', x: 360, y: 600 },
      { name: 'Croatia', sub: '1 Year · ~$2,700/mo (0% Tax)', countryCode: 'hr', x: 630, y: 590 },
      { name: 'Italy', sub: '1 Year · ~$3,000/mo', countryCode: 'it', x: 480, y: 640 },
      { name: 'Malta', sub: '1 Year · €3,500/mo', countryCode: 'mt', x: 380, y: 720 },
      { name: 'Indonesia (E33G)', sub: '1 Year · $60k/yr Requirement', countryCode: 'id', x: 260, y: 740 },
      { name: 'Japan', sub: '6 Months · ~$5,500/mo', countryCode: 'jp', x: 340, y: 880 },
      { name: 'Iceland', sub: '6 Months · ~$7,500/mo', countryCode: 'is', x: 230, y: 940 },
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
      { name: 'Chiang Mai', sub: '336 Mbps · $900/mo', countryCode: 'th', x: 970, y: 260 },
      { name: 'Bangkok', sub: '368 Mbps · $1,100/mo', countryCode: 'th', x: 860, y: 230 },
      { name: 'Bucharest', sub: '339 Mbps · $1,300/mo', countryCode: 'ro', x: 780, y: 320 },
      { name: 'Da Nang', sub: '246 Mbps · $850/mo', countryCode: 'vn', x: 990, y: 460 },
      { name: 'Buenos Aires', sub: '233 Mbps · $1,300/mo', countryCode: 'ar', x: 880, y: 510 },
      { name: 'Bali', sub: '102 Mbps · $1,100/mo', countryCode: 'id', x: 900, y: 760 },
      { name: 'Cape Town', sub: '94 Mbps · $1,400/mo', countryCode: 'za', x: 770, y: 860 },
      { name: 'Taipei', sub: '260 Mbps · $1,800/mo', countryCode: 'tw', x: 720, y: 440 },
      { name: 'Prague', sub: '253 Mbps · $1,800/mo', countryCode: 'cz', x: 650, y: 570 },
      { name: 'Lisbon', sub: '361 Mbps · $2,000/mo', countryCode: 'pt', x: 590, y: 250 },
      { name: 'Barcelona', sub: '345 Mbps · $2,200/mo', countryCode: 'es', x: 500, y: 330 },
      { name: 'Dubai', sub: '369 Mbps · $2,500/mo', countryCode: 'ae', x: 420, y: 240 },
      { name: 'Berlin', sub: '210 Mbps · $2,500/mo', countryCode: 'de', x: 470, y: 540 },
      { name: 'Tokyo', sub: '304 Mbps · $2,800/mo', countryCode: 'jp', x: 370, y: 370 },
      { name: 'Singapore', sub: '577 Mbps · $3,000/mo', countryCode: 'sg', x: 310, y: 220 },
      { name: 'London', sub: '306 Mbps · $3,200/mo', countryCode: 'gb', x: 250, y: 420 },
      { name: 'San Francisco', sub: '372 Mbps · $3,500/mo', countryCode: 'us', x: 230, y: 290 },
      { name: 'New York', sub: '290 Mbps · $6,100/mo', countryCode: 'us', x: 220, y: 530 },
    ],
  },

  // 6. WHERE TO LIVE SAFELY: RENT VS SAFETY INDEX
  {
    id: 'where-to-live-safely-cost-vs-safety',
    title: 'Where to Live Safely: Rent vs Safety Index',
    yTopLabel: 'ULTRA-SAFE CITIES (8.5 - 10 / 10)',
    yBottomLabel: 'MODERATE SAFETY INDEX (<6.0 / 10)',
    xLeftLabel: 'EXPENSIVE RENT ($1,500+/MO)',
    xRightLabel: 'AFFORDABLE RENT (<$750/MO)',
    sourceText: 'Sources: Hashtag Web3 City Explorer (Numbeo Safety Index & Numbeo 1-bed city center rent, Oct 2026).',
    items: [
      { name: 'Taipei', sub: 'Safety 9.0 · $700 Rent', countryCode: 'tw', x: 770, y: 240 },
      { name: 'Prague', sub: 'Safety 8.3 · $750 Rent', countryCode: 'cz', x: 720, y: 350 },
      { name: 'Chiang Mai', sub: 'Safety 8.0 · $350 Rent', countryCode: 'th', x: 980, y: 340 },
      { name: 'Bangkok', sub: 'Safety 7.0 · $450 Rent', countryCode: 'th', x: 890, y: 430, labelOffset: { dx: 0, dy: -46 } },
      { name: 'Da Nang', sub: 'Safety 7.5 · $300 Rent', countryCode: 'vn', x: 980, y: 490 },
      { name: 'Bucharest', sub: 'Safety 7.0 · $500 Rent', countryCode: 'ro', x: 860, y: 550 },
      { name: 'Bali', sub: 'Safety 7.2 · $450 Rent', countryCode: 'id', x: 880, y: 660 },
      { name: 'Buenos Aires', sub: 'Safety 5.8 · $500 Rent', countryCode: 'ar', x: 860, y: 780 },
      { name: 'Medellín', sub: 'Safety 5.5 · $550 Rent', countryCode: 'co', x: 840, y: 890 },
      { name: 'Cape Town', sub: 'Safety 4.5 · $550 Rent', countryCode: 'za', x: 730, y: 960 },
      { name: 'Tokyo', sub: 'Safety 9.2 · $1,200 Rent', countryCode: 'jp', x: 510, y: 230 },
      { name: 'Singapore', sub: 'Safety 9.1 · $1,400 Rent', countryCode: 'sg', x: 400, y: 250 },
      { name: 'Dubai', sub: 'Safety 8.5 · $1,100 Rent', countryCode: 'ae', x: 560, y: 330 },
      { name: 'Lisbon', sub: 'Safety 7.5 · $850 Rent', countryCode: 'pt', x: 650, y: 470 },
      { name: 'Berlin', sub: 'Safety 7.2 · $1,100 Rent', countryCode: 'de', x: 540, y: 490 },
      { name: 'Barcelona', sub: 'Safety 6.8 · $950 Rent', countryCode: 'es', x: 610, y: 590 },
      { name: 'London', sub: 'Safety 6.5 · $1,500 Rent', countryCode: 'gb', x: 340, y: 630 },
      { name: 'San Francisco', sub: 'Safety 5.5 · $1,800 Rent', countryCode: 'us', x: 240, y: 880 },
      { name: 'New York', sub: 'Safety 5.0 · $2,900 Rent', countryCode: 'us', x: 220, y: 950 },
    ],
  },

  // 7. DIGITAL NOMAD VISAS: TAX POLICY VS INCOME BAR
  {
    id: 'digital-nomad-visas-tax-vs-income',
    title: 'Digital Nomad Visas: Tax vs Income Bar',
    yTopLabel: '0% TAX ON FOREIGN INCOME',
    yBottomLabel: 'STANDARD TAX RESIDENCY (>20%)',
    xLeftLabel: 'HIGH INCOME BAR ($3,500+/MO)',
    xRightLabel: 'ACCESSIBLE INCOME (<$1,500/MO)',
    sourceText: 'Sources: Hashtag Web3 Digital Nomad Visa Directory (71 jurisdictions analyzed, Oct 2026).',
    items: [
      { name: 'Thailand (DTV)', sub: '5 Yrs · 0% Foreign Tax · $28k', countryCode: 'th', x: 960, y: 230 },
      { name: 'Albania', sub: '5 Yrs · 0% Tax · ~$820/mo', countryCode: 'al', x: 900, y: 330 },
      { name: 'Georgia', sub: '1 Yr · 1% Micro-Tax · $0/mo', countryCode: 'ge', x: 970, y: 430 },
      { name: 'Croatia', sub: '1.5 Yrs · 0% Tax · ~$2,700/mo', countryCode: 'hr', x: 640, y: 250 },
      { name: 'Costa Rica', sub: '1 Yr · 0% Tax · $3,000/mo', countryCode: 'cr', x: 530, y: 270 },
      { name: 'Dubai / UAE', sub: '1 Yr · 0% Tax · $3,500/mo', countryCode: 'ae', x: 390, y: 240 },
      { name: 'Barbados', sub: '1 Yr · 0% Tax · $4,167/mo', countryCode: 'bb', x: 270, y: 280 },
      { name: 'Colombia', sub: '2 Yrs · Tax after 183d · ~$1,200/mo', countryCode: 'co', x: 870, y: 740 },
      { name: 'Brazil', sub: '1 Yr · Tax after 183d · $1,500/mo', countryCode: 'br', x: 770, y: 820 },
      { name: 'Spain', sub: '3-5 Yrs · 24% Beckham Law · ~$2,800/mo', countryCode: 'es', x: 600, y: 550 },
      { name: 'Greece', sub: '2 Yrs · 50% Tax Break · €3,500/mo', countryCode: 'gr', x: 430, y: 460 },
      { name: 'Italy', sub: '1 Yr · 5% Impatriati · ~$3,000/mo', countryCode: 'it', x: 520, y: 400 },
      { name: 'Portugal (D8)', sub: '2 Yrs · Standard Brackets · ~$3,500/mo', countryCode: 'pt', x: 410, y: 770 },
      { name: 'Japan', sub: '6 Mos · Standard Tax · ~$5,500/mo', countryCode: 'jp', x: 280, y: 860 },
      { name: 'Iceland', sub: '6 Mos · Standard Tax · ~$7,500/mo', countryCode: 'is', x: 220, y: 940 },
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
      { name: 'Vanuatu', sub: '117 Visa-Free · 30 Days · $130k', countryCode: 'vu', x: 960, y: 230 },
      { name: 'Dominica', sub: '145 Visa-Free · 3 Mos · $200k', countryCode: 'dm', x: 900, y: 340 },
      { name: 'Antigua & Barbuda', sub: '153 Visa-Free · 4 Mos · $230k', countryCode: 'ag', x: 820, y: 250 },
      { name: 'Grenada', sub: '148 Visa-Free · 4 Mos (US E-2) · $235k', countryCode: 'gd', x: 820, y: 420 },
      { name: 'St. Lucia', sub: '146 Visa-Free · 3 Mos · $240k', countryCode: 'lc', x: 730, y: 330 },
      { name: 'St. Kitts & Nevis', sub: '157 Visa-Free · 4 Mos · $250k', countryCode: 'kn', x: 650, y: 270 },
      { name: 'El Salvador', sub: '136 Visa-Free · 60 Days · $1M BTC', countryCode: 'sv', x: 240, y: 270 },
      { name: 'Turkey', sub: '118 Visa-Free · 6-9 Mos · $400k Real Est.', countryCode: 'tr', x: 460, y: 440 },
      { name: 'Malta', sub: '187 Visa-Free · 12-36 Mos · €750k CBI', countryCode: 'mt', x: 340, y: 410 },
      { name: 'UAE', sub: '182 Visa-Free · 10-Yr Golden Visa · $545k', countryCode: 'ae', x: 410, y: 540 },
      { name: 'Greece', sub: '187 Visa-Free · 7 Yrs · €400k-€800k', countryCode: 'gr', x: 460, y: 760 },
      { name: 'Portugal', sub: '188 Visa-Free · 5 Yrs · €500k Fund', countryCode: 'pt', x: 580, y: 700 },
      { name: 'Spain', sub: '190 Visa-Free · 10 Yrs / 2y Ibero · €500k', countryCode: 'es', x: 420, y: 860 },
      { name: 'Germany', sub: '191 Visa-Free · 5 Yrs Naturalization', countryCode: 'de', x: 300, y: 740 },
      { name: 'Singapore', sub: '195 Visa-Free · Ultra Selective / Closed', countryCode: 'sg', x: 230, y: 940 },
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
    sourceText: 'Sources: Hashtag Web3 City Guide (WalkScore, public transit access & Numbeo cost data).',
    items: [
      { name: 'Prague', sub: 'Walk 8.8 · Transit 8.5 · $1,800/mo', countryCode: 'cz', x: 750, y: 240 },
      { name: 'Taipei', sub: 'Walk 8.0 · Transit 8.8 · $1,800/mo', countryCode: 'tw', x: 740, y: 350 },
      { name: 'Buenos Aires', sub: 'Walk 7.5 · Transit 7.8 · $1,300/mo', countryCode: 'ar', x: 860, y: 430 },
      { name: 'Da Nang', sub: 'Walk 6.0 · Transit 4.5 · $850/mo', countryCode: 'vn', x: 980, y: 690 },
      { name: 'Chiang Mai', sub: 'Walk 6.0 · Transit 5.0 · $900/mo', countryCode: 'th', x: 970, y: 580 },
      { name: 'Bangkok', sub: 'Walk 6.5 · Transit 7.5 · $1,100/mo', countryCode: 'th', x: 880, y: 530 },
      { name: 'Bali', sub: 'Walk 4.0 · Scooter Culture · $1,100/mo', countryCode: 'id', x: 880, y: 840 },
      { name: 'Cape Town', sub: 'Walk 4.5 · Car-Reliant · $1,400/mo', countryCode: 'za', x: 780, y: 930 },
      { name: 'Barcelona', sub: 'Walk 9.0 · Transit 8.5 · $2,200/mo', countryCode: 'es', x: 650, y: 230 },
      { name: 'Vienna', sub: 'Walk 9.2 · Transit 9.5 · $2,300/mo', countryCode: 'at', x: 550, y: 200, labelOffset: { dx: 0, dy: -46 } },
      { name: 'Berlin', sub: 'Walk 8.5 · Transit 8.8 · $2,500/mo', countryCode: 'de', x: 460, y: 300 },
      { name: 'Lisbon', sub: 'Walk 8.5 · Transit 7.8 · $2,000/mo', countryCode: 'pt', x: 640, y: 390 },
      { name: 'Tokyo', sub: 'Walk 9.2 · World-Class Transit · $2,800/mo', countryCode: 'jp', x: 440, y: 210, labelOffset: { dx: 0, dy: -46 } },
      { name: 'Singapore', sub: 'Walk 8.5 · Transit 9.0 · $3,000/mo', countryCode: 'sg', x: 350, y: 240 },
      { name: 'London', sub: 'Walk 8.8 · Transit 9.5 · $3,200/mo', countryCode: 'gb', x: 250, y: 290 },
      { name: 'Dubai', sub: 'Walk 4.0 · Car-Centric · $2,500/mo', countryCode: 'ae', x: 500, y: 820 },
      { name: 'San Francisco', sub: 'Walk 8.6 · Hill & Transit · $3,500/mo', countryCode: 'us', x: 240, y: 390 },
      { name: 'Los Angeles', sub: 'Walk 5.0 · Car-Essential · $4,800/mo', countryCode: 'us', x: 230, y: 890 },
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
      { name: 'Chiang Mai', sub: 'Score 97 · $900/mo', countryCode: 'th', x: 980, y: 220 },
      { name: 'Da Nang', sub: 'Score 93 · $850/mo', countryCode: 'vn', x: 990, y: 320 },
      { name: 'Bali', sub: 'Score 88 · $1,100/mo', countryCode: 'id', x: 890, y: 350 },
      { name: 'Bangkok', sub: 'Score 86 · $1,100/mo', countryCode: 'th', x: 890, y: 230 },
      { name: 'Taipei', sub: 'Score 87 · $1,800/mo', countryCode: 'tw', x: 740, y: 280 },
      { name: 'Medellín', sub: 'Score 85 · $1,400/mo', countryCode: 'co', x: 810, y: 400 },
      { name: 'Buenos Aires', sub: 'Score 81 · $1,300/mo', countryCode: 'ar', x: 850, y: 500 },
      { name: 'Cape Town', sub: 'Score 81 · $1,400/mo', countryCode: 'za', x: 800, y: 580 },
      { name: 'Bucharest', sub: 'Score 72 · $1,300/mo', countryCode: 'ro', x: 870, y: 740 },
      { name: 'Prague', sub: 'Score 73 · $1,800/mo', countryCode: 'cz', x: 710, y: 710 },
      { name: 'Lisbon', sub: 'Score 75 · $2,000/mo', countryCode: 'pt', x: 630, y: 650 },
      { name: 'Barcelona', sub: 'Score 75 · $2,200/mo', countryCode: 'es', x: 580, y: 580 },
      { name: 'Dubai', sub: 'Score 74 · $2,500/mo', countryCode: 'ae', x: 520, y: 660 },
      { name: 'Tokyo', sub: 'Score 72 · $2,800/mo', countryCode: 'jp', x: 430, y: 680, labelOffset: { dx: 0, dy: -46 } },
      { name: 'Singapore', sub: 'Score 72 · $3,000/mo', countryCode: 'sg', x: 320, y: 750 },
      { name: 'Berlin', sub: 'Score 66 · $2,500/mo', countryCode: 'de', x: 490, y: 850 },
      { name: 'London', sub: 'Score 60 · $3,200/mo', countryCode: 'gb', x: 270, y: 890 },
      { name: 'San Francisco', sub: 'Score 57 · $3,500/mo', countryCode: 'us', x: 230, y: 970 },
    ],
  },
];

async function main() {
  console.log(`[generate-social-matrices] Checking and generating ${VISUALS.length} high-res social media graphics...`);

  let totalWarnings = 0;
  for (const config of VISUALS) {
    const warnings = checkCollisions(config);
    if (warnings.length > 0) {
      console.warn(`⚠️ Potential collisions in ${config.id}:`);
      warnings.forEach((w) => console.warn(`   ${w}`));
      totalWarnings += warnings.length;
    }
  }

  if (totalWarnings === 0) {
    console.log(`✅ Collision audit passed: zero overlapping labels or flags across all ${VISUALS.length} charts.`);
  }

  for (const config of VISUALS) {
    const svgContent = generateMatrixSvg(config);
    const svgPath = path.join(OUT_DIR, `${config.id}.svg`);
    const pngPath = path.join(OUT_DIR, `${config.id}.png`);

    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // Render 1200x1200 crisp PNG using Resvg
    const resvg = new Resvg(svgContent, {
      fitTo: { mode: 'width', value: 1200 },
      font: { loadSystemFonts: true },
    });
    const pngBuffer = resvg.render().asPng();
    fs.writeFileSync(pngPath, pngBuffer);

    // Also copy to artifact directory for immediate review in chat
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, `${config.id}.png`), pngBuffer);
      fs.writeFileSync(path.join(ARTIFACT_DIR, `${config.id}.svg`), svgContent, 'utf8');
    }

    console.log(` - Generated: ${config.id}.png (${(pngBuffer.length / 1024).toFixed(1)} KB) and .svg`);
  }

  console.log('[generate-social-matrices] Successfully generated all 10 visuals!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
