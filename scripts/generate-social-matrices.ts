#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'images', 'social');
const FLAGS_DIR = path.join(ROOT, 'content', 'flags-cache');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

fs.mkdirSync(OUT_DIR, { recursive: true });

interface MatrixItem {
  name: string;
  sub: string;
  countryCode: string;
  x: number; // 0 to 1200
  y: number; // 0 to 1200
  labelOffset?: { dx: number; dy: number; align?: 'middle' | 'start' | 'end' };
}

interface MatrixConfig {
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

function generateMatrixSvg(config: MatrixConfig): string {
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
    <g class="matrix-item" data-name="${item.name}">
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
      <text x="${tx}" y="${ty}" text-anchor="${align}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15.5" font-weight="700" fill="#111827">${item.name}</text>
      <text x="${tx}" y="${ty + 18}" text-anchor="${align}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="500" fill="#6B7280">${item.sub}</text>
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
  <text x="600" y="90" text-anchor="middle" font-size="52" class="title">${config.title}</text>

  <!-- Crosshairs Axes -->
  <!-- Horizontal X-Axis (from 220 to 980, y=620) -->
  <line x1="215" y1="620" x2="985" y2="620" stroke="#1F2937" stroke-width="2.2" marker-start="url(#arrow-left)" marker-end="url(#arrow-right)"/>
  
  <!-- Vertical Y-Axis (from 195 to 1045, x=600) -->
  <line x1="600" y1="195" x2="600" y2="1045" stroke="#1F2937" stroke-width="2.2" marker-start="url(#arrow-up)" marker-end="url(#arrow-down)"/>

  <!-- Axis Labels -->
  <!-- Top Label -->
  <text x="600" y="165" text-anchor="middle" font-size="18" class="axis-label">${config.yTopLabel}</text>
  
  <!-- Bottom Label -->
  <text x="600" y="1080" text-anchor="middle" font-size="18" class="axis-label">${config.yBottomLabel}</text>
  
  <!-- Left Label -->
  <text x="195" y="626" text-anchor="end" font-size="18" class="axis-label">${config.xLeftLabel}</text>
  
  <!-- Right Label -->
  <text x="1005" y="626" text-anchor="start" font-size="18" class="axis-label">${config.xRightLabel}</text>

  <!-- Render Data Points -->
  ${itemsSvg}

  <!-- Footer Footnotes & Watermark -->
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#9CA3AF" class="meta">${config.sourceText}</text>
  <text x="1155" y="1165" text-anchor="end" font-size="15" font-weight="700" fill="#111827" class="meta">@hashtagweb3 · hashtagweb3.com</text>
</svg>`;
}

const VISUALS: MatrixConfig[] = [
  // 1. DIGITAL NOMAD CITIES
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
];

async function main() {
  console.log(`[generate-social-matrices] Generating ${VISUALS.length} high-res social media graphics...`);

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

  console.log('[generate-social-matrices] Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
