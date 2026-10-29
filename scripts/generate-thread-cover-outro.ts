import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/social');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

// 1. Minimal Cover with Perfectly Balanced Spacing & Big Typography
function buildCoverSvg(): string {
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#F8FAFC; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <defs>
    <pattern id="dotGridCover" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="#CBD5E1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="1200" fill="#F8FAFC" />
  <rect width="1200" height="1200" fill="url(#dotGridCover)" />
  <rect x="36" y="36" width="1128" height="1128" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Title Section (Balanced Leading) -->
  <g transform="translate(600, 135)">
    <text x="0" y="0" text-anchor="middle" font-size="68" font-weight="900" fill="#0F172A" letter-spacing="-1.5px">10 Decision Matrices</text>
    <text x="0" y="66" text-anchor="middle" font-size="38" font-weight="800" fill="#475569" letter-spacing="-0.5px">for Remote Builders</text>
    <text x="0" y="118" text-anchor="middle" font-size="23" font-weight="600" fill="#64748B">Cities · Visas · Passports · Web3 Tech Hubs</text>
  </g>

  <!-- 2x2 Crosshairs (Balanced Geometry) -->
  <line x1="90" y1="675" x2="1110" y2="675" stroke="#64748B" stroke-width="2.5" />
  <polygon points="75,675 92,667 92,683" fill="#64748B" />
  <polygon points="1125,675 1108,667 1108,683" fill="#64748B" />

  <line x1="600" y1="365" x2="600" y2="985" stroke="#64748B" stroke-width="2.5" />
  <polygon points="600,350 592,367 608,367" fill="#64748B" />
  <polygon points="600,1000 592,983 608,983" fill="#64748B" />

  <!-- Axis Direction Labels (Spaced from arrows and borders) -->
  <text x="600" y="322" text-anchor="middle" font-size="19" font-weight="800" fill="#64748B" letter-spacing="2px">FREEDOM &amp; RUNWAY</text>
  <text x="600" y="1038" text-anchor="middle" font-size="19" font-weight="800" fill="#64748B" letter-spacing="2px">RESTRICTIVE &amp; SLOW</text>
  <text x="95" y="652" text-anchor="start" font-size="19" font-weight="800" fill="#64748B" letter-spacing="2px">EXPENSIVE</text>
  <text x="1105" y="652" text-anchor="end" font-size="19" font-weight="800" fill="#64748B" letter-spacing="2px">AFFORDABLE</text>

  <!-- 4 Quadrants (Vertically and Horizontally Symmetrical) -->
  <!-- Top Right (Sweet Spots) -->
  <g transform="translate(850, 475)">
    <text x="0" y="0" text-anchor="middle" font-size="38" font-weight="900" fill="#059669">Sweet Spots</text>
    <text x="0" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#0F172A">Chiang Mai · Da Nang · Lisbon</text>
    <text x="0" y="90" text-anchor="middle" font-size="21" font-weight="500" fill="#64748B">Thailand DTV · 0% Tax · Fast Fiber</text>
  </g>

  <!-- Top Left (Global Tech Capitals) -->
  <g transform="translate(350, 475)">
    <text x="0" y="0" text-anchor="middle" font-size="38" font-weight="900" fill="#2563EB">Global Tech Capitals</text>
    <text x="0" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#0F172A">San Francisco · London · NYC</text>
    <text x="0" y="90" text-anchor="middle" font-size="21" font-weight="500" fill="#64748B">Dubai VARA · Singapore MAS</text>
  </g>

  <!-- Bottom Right (Fast Runways) -->
  <g transform="translate(850, 785)">
    <text x="0" y="0" text-anchor="middle" font-size="38" font-weight="900" fill="#D97706">Fast Runways</text>
    <text x="0" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#0F172A">Bali · Medellín · Buenos Aires</text>
    <text x="0" y="90" text-anchor="middle" font-size="21" font-weight="500" fill="#64748B">Vanuatu CBI · Caribbean Visas</text>
  </g>

  <!-- Bottom Left (Legacy & High Capital) -->
  <g transform="translate(350, 785)">
    <text x="0" y="0" text-anchor="middle" font-size="38" font-weight="900" fill="#475569">Legacy &amp; High Capital</text>
    <text x="0" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#0F172A">Tokyo · Zurich · Malta</text>
    <text x="0" y="90" text-anchor="middle" font-size="21" font-weight="500" fill="#64748B">Naturalization &amp; €750k CBI</text>
  </g>

  <!-- Footer (Even Padding) -->
  <line x1="60" y1="1130" x2="1140" y2="1130" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="60" y="1165" font-size="19" font-weight="600" fill="#64748B">100+ Cities · 71 Nomad Visas · 15 CBI Programs</text>
  <text x="1140" y="1165" text-anchor="end" font-size="20"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="800">hashtagweb3.com</tspan></text>
</svg>`;
}

// 2. Minimal Outro with Symmetrical Vertical Padding & Refined Typography
function buildOutroSvg(): string {
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#F8FAFC; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <defs>
    <pattern id="dotGridOutro" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.5" fill="#CBD5E1" />
    </pattern>
  </defs>

  <rect width="1200" height="1200" fill="#F8FAFC" />
  <rect width="1200" height="1200" fill="url(#dotGridOutro)" />
  <rect x="36" y="36" width="1128" height="1128" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Big Clean Title (100px top clearance to Row 1) -->
  <g transform="translate(90, 155)">
    <text x="0" y="0" font-size="70" font-weight="900" fill="#0F172A" letter-spacing="-1.5px">Explore the Data</text>
    <text x="0" y="58" font-size="28" font-weight="500" fill="#64748B">All 10 interactive comparison tools and directories are live:</text>
  </g>

  <!-- 4 Clean Stacked Rows (Even 175px spacing, 100px bottom clearance to footer) -->
  <g transform="translate(90, 325)">
    <!-- Row 1: Cities -->
    <g transform="translate(0, 0)">
      <text x="0" y="44" font-size="46" font-weight="900" fill="#0F172A">Cities</text>
      <text x="0" y="90" font-size="25" font-weight="500" fill="#64748B">100+ cities ranked by speed, cost &amp; safety</text>
      <text x="1020" y="66" text-anchor="end" font-size="32" font-weight="800" fill="#2563EB">hashtagweb3.com/nomads</text>
      <line x1="0" y1="135" x2="1020" y2="135" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 2: Visas -->
    <g transform="translate(0, 175)">
      <text x="0" y="44" font-size="46" font-weight="900" fill="#0F172A">Visas</text>
      <text x="0" y="90" font-size="25" font-weight="500" fill="#64748B">71 nomad visas compared by tax &amp; income bar</text>
      <text x="1020" y="66" text-anchor="end" font-size="32" font-weight="800" fill="#2563EB">hashtagweb3.com/visas</text>
      <line x1="0" y1="135" x2="1020" y2="135" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 3: Passports -->
    <g transform="translate(0, 350)">
      <text x="0" y="44" font-size="46" font-weight="900" fill="#0F172A">Passports</text>
      <text x="0" y="90" font-size="25" font-weight="500" fill="#64748B">Statutory CBI &amp; Golden Visas by capital &amp; speed</text>
      <text x="1020" y="66" text-anchor="end" font-size="32" font-weight="800" fill="#2563EB">hashtagweb3.com/citizenship</text>
      <line x1="0" y1="135" x2="1020" y2="135" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 4: Web3 Jobs -->
    <g transform="translate(0, 525)">
      <text x="0" y="44" font-size="46" font-weight="900" fill="#0F172A">Web3 Jobs</text>
      <text x="0" y="90" font-size="25" font-weight="500" fill="#64748B">Verified remote engineering &amp; builder roles</text>
      <text x="1020" y="66" text-anchor="end" font-size="32" font-weight="800" fill="#2563EB">hashtagweb3.com/jobs</text>
      <line x1="0" y1="135" x2="1020" y2="135" stroke="#E2E8F0" stroke-width="1.5" />
    </g>
  </g>

  <!-- Clean Minimal Footer -->
  <line x1="60" y1="1130" x2="1140" y2="1130" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="60" y="1165" font-size="19" font-weight="600" fill="#64748B">Free directory for remote workers and builders.</text>
  <text x="1140" y="1165" text-anchor="end" font-size="20"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="800">hashtagweb3.com</tspan></text>
</svg>`;
}

async function main() {
  console.log('Rendering clean, minimal thread cover and outro graphics with proper spacing...');
  
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

  console.log('Finished rendering perfectly spaced thread cover and outro visuals successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
