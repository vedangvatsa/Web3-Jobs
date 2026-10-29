import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/social');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

// 1. Minimal Cover (Zero pills, zero AI clutter, pure clean typography & crosshairs)
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

  <!-- Title Section -->
  <g transform="translate(600, 150)">
    <text x="0" y="0" text-anchor="middle" font-size="52" font-weight="900" fill="#0F172A" letter-spacing="-1px">10 Decision Matrices</text>
    <text x="0" y="56" text-anchor="middle" font-size="32" font-weight="700" fill="#475569" letter-spacing="-0.5px">for Remote Builders</text>
    <text x="0" y="102" text-anchor="middle" font-size="18" font-weight="500" fill="#64748B">Cities · Visas · Passports · Web3 Tech Hubs</text>
  </g>

  <!-- Minimal 2x2 Crosshairs (Zero pills, clean typography) -->
  <line x1="120" y1="660" x2="1080" y2="660" stroke="#64748B" stroke-width="2" />
  <polygon points="105,660 122,653 122,667" fill="#64748B" />
  <polygon points="1095,660 1078,653 1078,667" fill="#64748B" />

  <line x1="600" y1="360" x2="600" y2="960" stroke="#64748B" stroke-width="2" />
  <polygon points="600,345 593,362 607,362" fill="#64748B" />
  <polygon points="600,975 593,958 607,958" fill="#64748B" />

  <!-- Axis Direction Labels -->
  <text x="600" y="328" text-anchor="middle" font-size="14" font-weight="700" fill="#64748B" letter-spacing="1.5px">FREEDOM &amp; RUNWAY</text>
  <text x="600" y="1010" text-anchor="middle" font-size="14" font-weight="700" fill="#64748B" letter-spacing="1.5px">RESTRICTIVE &amp; SLOW</text>
  <text x="120" y="645" text-anchor="start" font-size="14" font-weight="700" fill="#64748B" letter-spacing="1.5px">EXPENSIVE</text>
  <text x="1080" y="645" text-anchor="end" font-size="14" font-weight="700" fill="#64748B" letter-spacing="1.5px">AFFORDABLE</text>

  <!-- 4 Quadrants (Clean text, no pill containers) -->
  <!-- Top Right -->
  <g transform="translate(850, 490)">
    <text x="0" y="0" text-anchor="middle" font-size="24" font-weight="800" fill="#059669">Sweet Spots</text>
    <text x="0" y="32" text-anchor="middle" font-size="16" font-weight="600" fill="#0F172A">Chiang Mai · Da Nang · Lisbon</text>
    <text x="0" y="58" text-anchor="middle" font-size="14.5" font-weight="500" fill="#64748B">Thailand DTV · 0% Tax · Fast Fiber</text>
  </g>

  <!-- Top Left -->
  <g transform="translate(350, 490)">
    <text x="0" y="0" text-anchor="middle" font-size="24" font-weight="800" fill="#2563EB">Global Tech Capitals</text>
    <text x="0" y="32" text-anchor="middle" font-size="16" font-weight="600" fill="#0F172A">San Francisco · London · NYC</text>
    <text x="0" y="58" text-anchor="middle" font-size="14.5" font-weight="500" fill="#64748B">Dubai VARA · Singapore MAS</text>
  </g>

  <!-- Bottom Right -->
  <g transform="translate(850, 805)">
    <text x="0" y="0" text-anchor="middle" font-size="24" font-weight="800" fill="#D97706">Fast Runways</text>
    <text x="0" y="32" text-anchor="middle" font-size="16" font-weight="600" fill="#0F172A">Bali · Medellín · Buenos Aires</text>
    <text x="0" y="58" text-anchor="middle" font-size="14.5" font-weight="500" fill="#64748B">Vanuatu CBI · Caribbean Visas</text>
  </g>

  <!-- Bottom Left -->
  <g transform="translate(350, 805)">
    <text x="0" y="0" text-anchor="middle" font-size="24" font-weight="800" fill="#475569">Legacy &amp; High Capital</text>
    <text x="0" y="32" text-anchor="middle" font-size="16" font-weight="600" fill="#0F172A">Tokyo · Zurich · Malta</text>
    <text x="0" y="58" text-anchor="middle" font-size="14.5" font-weight="500" fill="#64748B">Naturalization &amp; €750k CBI</text>
  </g>

  <!-- Footer -->
  <line x1="60" y1="1135" x2="1140" y2="1135" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="60" y="1165" font-size="14" font-weight="500" fill="#64748B">100+ Cities · 71 Nomad Visas · 15 CBI Programs</text>
  <text x="1140" y="1165" text-anchor="end" font-size="15"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

// 2. Minimal Outro (Zero pills, zero marketing filler, clean links)
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

  <!-- Big Clean Title -->
  <g transform="translate(100, 180)">
    <text x="0" y="0" font-size="56" font-weight="900" fill="#0F172A" letter-spacing="-1.5px">Explore the Data</text>
    <text x="0" y="52" font-size="22" font-weight="500" fill="#64748B">All 10 interactive comparison tools and directories are live:</text>
  </g>

  <!-- 4 Clean Rows (Zero pills, perfectly balanced vertical spacing) -->
  <g transform="translate(100, 380)">
    <!-- Row 1: Cities -->
    <g transform="translate(0, 0)">
      <text x="0" y="42" font-size="36" font-weight="800" fill="#0F172A">Cities</text>
      <text x="260" y="42" font-size="20" font-weight="500" fill="#64748B">100+ cities ranked by speed, cost &amp; safety</text>
      <text x="1000" y="42" text-anchor="end" font-size="22" font-weight="700" fill="#2563EB">hashtagweb3.com/nomads</text>
      <line x1="0" y1="105" x2="1000" y2="105" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 2: Visas -->
    <g transform="translate(0, 160)">
      <text x="0" y="42" font-size="36" font-weight="800" fill="#0F172A">Visas</text>
      <text x="260" y="42" font-size="20" font-weight="500" fill="#64748B">71 nomad visas by tax &amp; income bar</text>
      <text x="1000" y="42" text-anchor="end" font-size="22" font-weight="700" fill="#2563EB">hashtagweb3.com/visas</text>
      <line x1="0" y1="105" x2="1000" y2="105" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 3: Passports -->
    <g transform="translate(0, 320)">
      <text x="0" y="42" font-size="36" font-weight="800" fill="#0F172A">Passports</text>
      <text x="260" y="42" font-size="20" font-weight="500" fill="#64748B">Statutory CBI &amp; Golden Visas compared</text>
      <text x="1000" y="42" text-anchor="end" font-size="22" font-weight="700" fill="#2563EB">hashtagweb3.com/citizenship</text>
      <line x1="0" y1="105" x2="1000" y2="105" stroke="#E2E8F0" stroke-width="1.5" />
    </g>

    <!-- Row 4: Web3 Jobs -->
    <g transform="translate(0, 480)">
      <text x="0" y="42" font-size="36" font-weight="800" fill="#0F172A">Web3 Jobs</text>
      <text x="260" y="42" font-size="20" font-weight="500" fill="#64748B">Verified remote engineering &amp; product roles</text>
      <text x="1000" y="42" text-anchor="end" font-size="22" font-weight="700" fill="#2563EB">hashtagweb3.com/jobs</text>
      <line x1="0" y1="105" x2="1000" y2="105" stroke="#E2E8F0" stroke-width="1.5" />
    </g>
  </g>

  <!-- Clean Minimal Footer -->
  <line x1="60" y1="1135" x2="1140" y2="1135" stroke="#E2E8F0" stroke-width="1.5" />
  <text x="60" y="1165" font-size="14" font-weight="500" fill="#64748B">Free directory for remote workers and builders.</text>
  <text x="1140" y="1165" text-anchor="end" font-size="15"><tspan fill="#64748B" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
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
