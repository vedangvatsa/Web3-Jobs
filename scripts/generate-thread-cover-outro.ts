import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/social');
const FLAGS_DIR = path.join(ROOT, 'content/flags-cache');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

function loadFlagBase64(countryCode: string): string {
  const code = countryCode.toLowerCase().trim();
  const filePath = path.join(FLAGS_DIR, `${code}.svg`);
  const svg = fs.readFileSync(filePath, 'utf8');
  return Buffer.from(svg).toString('base64');
}

const coverItems = [
  // Top-Right: Maximum Freedom & Affordable
  { name: 'Chiang Mai', sub: '336 Mbps · $900/mo', code: 'th', x: 860, y: 310, bg: '#059669', text: '#FFFFFF', subColor: '#A7F3D0' },
  { name: 'Thailand DTV', sub: '5 Yrs · 0% Foreign Tax', code: 'th', x: 800, y: 420, bg: '#FF5722', text: '#FFFFFF', subColor: '#FFE0B2' },
  { name: 'Prague', sub: 'Walk 8.8 · Safety 8.3', code: 'cz', x: 870, y: 530, bg: '#7C3AED', text: '#FFFFFF', subColor: '#E9D5FF' },

  // Top-Left: Mega Hubs & Tech Capitals
  { name: 'San Francisco', sub: 'Top Dev Hub · High Burn', code: 'us', x: 340, y: 310, bg: '#2563EB', text: '#FFFFFF', subColor: '#BFDBFE' },
  { name: 'Dubai', sub: 'VARA · 0% Income Tax', code: 'ae', x: 410, y: 420, bg: '#0F172A', text: '#FFFFFF', subColor: '#94A3B8' },
  { name: 'Singapore', sub: '577 Mbps · Top Safety', code: 'sg', x: 330, y: 530, bg: '#FFFFFF', text: '#0F172A', subColor: '#64748B', border: '#CBD5E1', shadow: true },

  // Bottom-Right: Fast Runways & Value Havens
  { name: 'Vanuatu CBI', sub: '2-Month Passport · $130k', code: 'vu', x: 850, y: 740, bg: '#FACC15', text: '#1E293B', subColor: '#475569' },
  { name: 'Bali', sub: 'Nomad Value Index: 88/100', code: 'id', x: 790, y: 860, bg: '#C084FC', text: '#1E1B4B', subColor: '#581C87' },

  // Bottom-Left: High Capital & Strict Residency
  { name: 'Malta CBI', sub: '€750k Statutory EU Route', code: 'mt', x: 340, y: 750, bg: '#E11D48', text: '#FFFFFF', subColor: '#FECDD3' },
  { name: 'Tokyo', sub: 'Safety 9.2 · 55% Tax Bar', code: 'jp', x: 410, y: 870, bg: '#FFFFFF', text: '#0F172A', subColor: '#64748B', border: '#CBD5E1', shadow: true },
];

function buildCoverSvg(): string {
  const flagCache = new Map<string, string>();
  for (const it of coverItems) {
    if (!flagCache.has(it.code)) {
      flagCache.set(it.code, loadFlagBase64(it.code));
    }
  }

  const badgesSvg = coverItems.map((it, idx) => {
    const b64 = flagCache.get(it.code)!;
    const w = 210;
    const h = 44;
    const bx = it.x - w / 2;
    const by = it.y - h / 2;
    const strokeAttr = it.border ? `stroke="${it.border}" stroke-width="1.5"` : '';
    const shadowFilter = it.shadow ? 'filter="url(#badgeShadow)"' : 'filter="url(#subtleShadow)"';

    return `
    <g class="badge" data-name="${it.name}">
      <rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="12" fill="${it.bg}" ${strokeAttr} ${shadowFilter}/>
      <!-- Flag circle inside badge -->
      <g transform="translate(${bx + 10}, ${by + 9})">
        <clipPath id="cflag-${idx}">
          <circle cx="13" cy="13" r="13"/>
        </clipPath>
        <image href="data:image/svg+xml;base64,${b64}" x="0" y="0" width="26" height="26" clip-path="url(#cflag-${idx})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="13" cy="13" r="13" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.9"/>
        <circle cx="13" cy="13" r="13" fill="none" stroke="#000000" stroke-width="0.5" stroke-opacity="0.15"/>
      </g>
      <text x="${bx + 44}" y="${by + 19}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${it.text}">${it.name}</text>
      <text x="${bx + 44}" y="${by + 33}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="500" fill="${it.subColor}">${it.sub}</text>
    </g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <!-- Dot Grid Pattern -->
    <pattern id="dotGridCover" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="#CBD5E1" />
    </pattern>

    <!-- Drop Shadows -->
    <filter id="badgeShadow" x="-10%" y="-20%" width="125%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.08" />
    </filter>
    <filter id="subtleShadow" x="-10%" y="-20%" width="125%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background Canvas with Dot Grid -->
  <rect width="1200" height="1200" fill="#F8FAFC" />
  <rect width="1200" height="1200" fill="url(#dotGridCover)" />

  <!-- Outer Frame -->
  <rect x="24" y="24" width="1152" height="1152" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Title & Subtitle (Clean, Modern, Minimal) -->
  <text x="600" y="85" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="40" font-weight="800" fill="#0F172A" letter-spacing="-0.5px">10 Decision Matrices for Remote Builders</text>
  <text x="600" y="125" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" fill="#64748B">The Alignment Chart for Cities, Visas, Passports &amp; Web3 Tech Hubs</text>

  <!-- Central Crosshairs Axes in Slate -->
  <line x1="90" y1="620" x2="1110" y2="620" stroke="#64748B" stroke-width="2.5" />
  <polygon points="75,620 92,612 92,628" fill="#64748B" />
  <polygon points="1125,620 1108,612 1108,628" fill="#64748B" />

  <line x1="600" y1="175" x2="600" y2="1065" stroke="#64748B" stroke-width="2.5" />
  <polygon points="600,160 592,177 608,177" fill="#64748B" />
  <polygon points="600,1080 592,1063 608,1063" fill="#64748B" />

  <!-- Axis Labels -->
  <text x="600" y="148" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#334155" letter-spacing="1.2px">MAXIMUM FREEDOM &amp; RUNWAY</text>
  <text x="600" y="1112" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#334155" letter-spacing="1.2px">RESTRICTIVE / HIGH FRICTION</text>
  <text x="100" y="608" text-anchor="start" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#334155" letter-spacing="1.2px">EXPENSIVE ($3,000+/MO)</text>
  <text x="1100" y="608" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#334155" letter-spacing="1.2px">AFFORDABLE (&lt;$1,500/MO)</text>

  <!-- Badges -->
  ${badgesSvg}

  <!-- Footer Sources & Watermark -->
  <line x1="45" y1="1138" x2="1155" y2="1138" stroke="#E2E8F0" stroke-width="1" />
  <text x="45" y="1165" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="13" font-weight="400" fill="#64748B">10-Part Visual Thread · 100+ Cities · 71 Nomad Visas · 15 CBI Programs</text>
  <text x="1155" y="1165" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="14.5"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

function buildOutroSvg(): string {
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <defs>
    <!-- Dot Grid Pattern -->
    <pattern id="dotGridOutro" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="#CBD5E1" />
    </pattern>
    <filter id="outroShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.05"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="1200" fill="#F8FAFC"/>
  <rect width="1200" height="1200" fill="url(#dotGridOutro)"/>
  <rect x="24" y="24" width="1152" height="1152" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Top Category Pill -->
  <g transform="translate(600, 95)">
    <rect x="-140" y="-16" width="280" height="32" rx="16" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-size="12" font-weight="700" fill="#4338CA" letter-spacing="1.2">HASHTAG WEB3 DIRECTORY</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="185" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#0F172A" letter-spacing="-0.5px">Explore All Free Tools Online</text>
  <text x="600" y="230" text-anchor="middle" font-size="18" font-weight="500" fill="#64748B">Compare cities, verify visa laws, research citizenship, and find remote roles</text>

  <!-- 4 Core Resources Grid -->
  <g transform="translate(100, 290)">
    <!-- Resource 1: City Explorer -->
    <g transform="translate(0, 0)">
      <rect width="480" height="360" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#outroShadow)"/>
      <rect x="35" y="35" width="80" height="30" rx="15" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
      <text x="75" y="55" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1D4ED8">CITIES</text>
      <text x="130" y="57" font-size="22" font-weight="700" fill="#0F172A">City Explorer</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#2563EB">hashtagweb3.com/nomads</text>
      
      <text x="35" y="155" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Compare 100+ cities by living cost and rent</tspan>
        <tspan x="35" dy="32">• Real Ookla internet speeds &amp; fiber availability</tspan>
        <tspan x="35" dy="32">• Walkability scores, safety index &amp; weather</tspan>
        <tspan x="35" dy="32">• Direct side-by-side city matchup cards</tspan>
      </text>
    </g>

    <!-- Resource 2: Nomad Visas -->
    <g transform="translate(520, 0)">
      <rect width="480" height="360" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#outroShadow)"/>
      <rect x="35" y="35" width="70" height="30" rx="15" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1"/>
      <text x="70" y="55" text-anchor="middle" font-size="11.5" font-weight="700" fill="#15803D">VISAS</text>
      <text x="120" y="57" font-size="22" font-weight="700" fill="#0F172A">Nomad Visa Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#16A34A">hashtagweb3.com/visas</text>

      <text x="35" y="155" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• 71 sovereign remote work visa programs</tspan>
        <tspan x="35" dy="32">• Official statutory monthly income thresholds</tspan>
        <tspan x="35" dy="32">• Local tax exemptions vs territorial rules</tspan>
        <tspan x="35" dy="32">• Passport entry checker &amp; stay durations</tspan>
      </text>
    </g>

    <!-- Resource 3: Passports & Citizenship -->
    <g transform="translate(0, 400)">
      <rect width="480" height="360" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#outroShadow)"/>
      <rect x="35" y="35" width="105" height="30" rx="15" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1"/>
      <text x="87" y="55" text-anchor="middle" font-size="11.5" font-weight="700" fill="#B45309">PASSPORTS</text>
      <text x="155" y="57" font-size="22" font-weight="700" fill="#0F172A">Citizenship Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#D97706">hashtagweb3.com/citizenship</text>

      <text x="35" y="155" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Statutory Citizenship by Investment routes</tspan>
        <tspan x="35" dy="32">• Minimum capital vs government fee schedules</tspan>
        <tspan x="35" dy="32">• Official processing speeds &amp; holding periods</tspan>
        <tspan x="35" dy="32">• Links to official government program gazettes</tspan>
      </text>
    </g>

    <!-- Resource 4: Web3 Job Board -->
    <g transform="translate(520, 400)">
      <rect width="480" height="360" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#outroShadow)"/>
      <rect x="35" y="35" width="90" height="30" rx="15" fill="#FDF4FF" stroke="#F0ABFC" stroke-width="1"/>
      <text x="80" y="55" text-anchor="middle" font-size="11.5" font-weight="700" fill="#A21CAF">CAREERS</text>
      <text x="140" y="57" font-size="22" font-weight="700" fill="#0F172A">Web3 Job Board</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#9333EA">hashtagweb3.com/jobs</text>

      <text x="35" y="155" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Thousands of verified remote Web3 jobs</tspan>
        <tspan x="35" dy="32">• Smart contracts, frontend dApps, &amp; engineering</tspan>
        <tspan x="35" dy="32">• Growth, marketing, design, &amp; tokenomics</tspan>
        <tspan x="35" dy="32">• Direct company application links</tspan>
      </text>
    </g>
  </g>

  <!-- Bottom CTA Pill -->
  <g transform="translate(600, 1085)">
    <rect x="-350" y="-22" width="700" height="44" rx="22" fill="#0F172A"/>
    <text x="0" y="6" text-anchor="middle" font-size="14.5" font-weight="700" fill="#FFFFFF" letter-spacing="1">OPEN-ACCESS REMOTE WORK INTELLIGENCE · HASHTAGWEB3.COM</text>
  </g>

  <!-- Footer Footnotes & Watermark -->
  <line x1="45" y1="1138" x2="1155" y2="1138" stroke="#E2E8F0" stroke-width="1"/>
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#64748B">Free for all remote workers, digital nomads and builders.</text>
  <text x="1155" y="1165" text-anchor="end" font-size="14.5"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

async function main() {
  console.log('Rendering clean, minimal thread cover and outro graphics...');
  
  // 1. Cover
  const coverSvg = buildCoverSvg();
  const coverSvgPath = path.join(OUT_DIR, 'thread-cover-matrices.svg');
  const coverPngPath = path.join(OUT_DIR, 'thread-cover-matrices.png');
  fs.writeFileSync(coverSvgPath, coverSvg);
  
  const coverResvg = new Resvg(coverSvg, { fitTo: { mode: 'width', value: 1200 } });
  const coverPng = coverResvg.render().asPng();
  fs.writeFileSync(coverPngPath, coverPng);
  console.log(`Saved Cover: ${coverPngPath} (${coverPng.length} bytes)`);

  // Mirror Cover to artifact directory
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'thread-cover-matrices.svg'), coverSvg);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'thread-cover-matrices.png'), coverPng);

  // 2. Outro
  const outroSvg = buildOutroSvg();
  const outroSvgPath = path.join(OUT_DIR, 'thread-outro-resources.svg');
  const outroPngPath = path.join(OUT_DIR, 'thread-outro-resources.png');
  fs.writeFileSync(outroSvgPath, outroSvg);

  const outroResvg = new Resvg(outroSvg, { fitTo: { mode: 'width', value: 1200 } });
  const outroPng = outroResvg.render().asPng();
  fs.writeFileSync(outroPngPath, outroPng);
  console.log(`Saved Outro: ${outroPngPath} (${outroPng.length} bytes)`);

  // Mirror Outro to artifact directory
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'thread-outro-resources.svg'), outroSvg);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'thread-outro-resources.png'), outroPng);

  console.log('Finished rendering thread cover and outro visuals successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
