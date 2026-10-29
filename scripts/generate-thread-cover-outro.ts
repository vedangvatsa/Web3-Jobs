import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/social');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

function buildCoverSvg(): string {
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F9FAFB"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.04"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="1200" fill="#FFFFFF"/>
  <rect x="30" y="30" width="1140" height="1140" rx="28" fill="none" stroke="#F3F4F6" stroke-width="2"/>

  <!-- Top Pill Badge -->
  <g transform="translate(600, 110)">
    <rect x="-170" y="-18" width="340" height="36" rx="18" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#374151" letter-spacing="1.2">HASHTAG WEB3 RESEARCH · 2026</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="210" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="52" font-weight="700" fill="#111827">Global Nomads, Visas &amp; Web3</text>
  <text x="600" y="265" text-anchor="middle" font-size="22" font-weight="500" fill="#4B5563">10 Data-Backed 2×2 Matrix Charts for Remote Builders</text>

  <!-- 4 Core Themes (2x2 Visual Grid) -->
  <g transform="translate(100, 320)">
    <!-- Card 1: Cities & Speed -->
    <g transform="translate(0, 0)">
      <rect width="480" height="340" rx="20" fill="url(#cardGrad)" stroke="#E5E7EB" stroke-width="1.5" filter="url(#shadow)"/>
      <rect x="25" y="25" width="70" height="32" rx="16" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
      <text x="60" y="46" text-anchor="middle" font-size="11" font-weight="700" fill="#1D4ED8" letter-spacing="0.5">SPEED</text>
      <text x="110" y="47" font-size="19" font-weight="700" fill="#111827">Living Cost vs Internet Speed</text>
      <text x="28" y="82" font-size="14" font-weight="500" fill="#6B7280">Gigabit fiber vs monthly burn across 19 global hubs</text>
      
      <!-- Mini Visual Representation -->
      <line x1="60" y1="210" x2="420" y2="210" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="240" y1="120" x2="240" y2="300" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="340" cy="160" r="14" fill="#3B82F6"/>
      <text x="362" y="165" font-size="13" font-weight="600" fill="#1F2937">Chiang Mai · Da Nang</text>
      <circle cx="140" cy="250" r="14" fill="#EF4444"/>
      <text x="162" y="255" font-size="13" font-weight="600" fill="#1F2937">San Francisco · NYC</text>
    </g>

    <!-- Card 2: Cost vs Safety -->
    <g transform="translate(520, 0)">
      <rect width="480" height="340" rx="20" fill="url(#cardGrad)" stroke="#E5E7EB" stroke-width="1.5" filter="url(#shadow)"/>
      <rect x="25" y="25" width="74" height="32" rx="16" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1"/>
      <text x="62" y="46" text-anchor="middle" font-size="11" font-weight="700" fill="#15803D" letter-spacing="0.5">SAFETY</text>
      <text x="114" y="47" font-size="19" font-weight="700" fill="#111827">Living Cost vs Safety Index</text>
      <text x="28" y="82" font-size="14" font-weight="500" fill="#6B7280">Ultra-safe destinations ranked by monthly expenses</text>

      <!-- Mini Visual Representation -->
      <line x1="60" y1="210" x2="420" y2="210" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="240" y1="120" x2="240" y2="300" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="350" cy="150" r="14" fill="#10B981"/>
      <text x="372" y="155" font-size="13" font-weight="600" fill="#1F2937">Taipei · Prague</text>
      <circle cx="150" cy="150" r="14" fill="#6366F1"/>
      <text x="172" y="155" font-size="13" font-weight="600" fill="#1F2937">Tokyo · Singapore</text>
    </g>

    <!-- Card 3: Visas & Tax -->
    <g transform="translate(0, 380)">
      <rect width="480" height="340" rx="20" fill="url(#cardGrad)" stroke="#E5E7EB" stroke-width="1.5" filter="url(#shadow)"/>
      <rect x="25" y="25" width="66" height="32" rx="16" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1"/>
      <text x="58" y="46" text-anchor="middle" font-size="11" font-weight="700" fill="#B45309" letter-spacing="0.5">VISAS</text>
      <text x="106" y="47" font-size="19" font-weight="700" fill="#111827">Nomad Visas: Tax vs Income</text>
      <text x="28" y="82" font-size="14" font-weight="500" fill="#6B7280">Statutory tax exemptions vs minimum salary thresholds</text>

      <!-- Mini Visual Representation -->
      <line x1="60" y1="210" x2="420" y2="210" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="240" y1="120" x2="240" y2="300" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="340" cy="160" r="14" fill="#F59E0B"/>
      <text x="362" y="165" font-size="13" font-weight="600" fill="#1F2937">0% Tax Programs</text>
      <circle cx="150" cy="250" r="14" fill="#8B5CF6"/>
      <text x="172" y="255" font-size="13" font-weight="600" fill="#1F2937">European Standard</text>
    </g>

    <!-- Card 4: Passports & CBI -->
    <g transform="translate(520, 380)">
      <rect width="480" height="340" rx="20" fill="url(#cardGrad)" stroke="#E5E7EB" stroke-width="1.5" filter="url(#shadow)"/>
      <rect x="25" y="25" width="84" height="32" rx="16" fill="#FCE7F3" stroke="#FBCFE8" stroke-width="1"/>
      <text x="67" y="46" text-anchor="middle" font-size="11" font-weight="700" fill="#BE185D" letter-spacing="0.5">GLOBAL</text>
      <text x="124" y="47" font-size="19" font-weight="700" fill="#111827">Passports &amp; Web3 Cities</text>
      <text x="28" y="82" font-size="14" font-weight="500" fill="#6B7280">CBI speed &amp; cost vs regulatory clarity for crypto developers</text>

      <!-- Mini Visual Representation -->
      <line x1="60" y1="210" x2="420" y2="210" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="240" y1="120" x2="240" y2="300" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4"/>
      <circle cx="350" cy="170" r="14" fill="#EC4899"/>
      <text x="372" y="175" font-size="13" font-weight="600" fill="#1F2937">Vanuatu · Caribbean</text>
      <circle cx="160" cy="150" r="14" fill="#06B6D4"/>
      <text x="182" y="155" font-size="13" font-weight="600" fill="#1F2937">Dubai · Singapore</text>
    </g>
  </g>

  <!-- Bottom Stats Pill Banner -->
  <g transform="translate(600, 1070)">
    <rect x="-380" y="-22" width="760" height="44" rx="22" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="0" y="6" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">100+ CITIES · 71 DIGITAL NOMAD VISAS · 15 CBI PROGRAMS</text>
  </g>

  <!-- Footer Footnotes & Watermark -->
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#9CA3AF">Sources: Hashtag Web3 Index, Official Visa Registries &amp; Numbeo Data.</text>
  <text x="1155" y="1165" text-anchor="end" font-size="15" class="meta"><tspan fill="#4B5563" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#111827" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

function buildOutroSvg(): string {
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#FFFFFF; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <defs>
    <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
    <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000000" flood-opacity="0.05"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="1200" fill="#FFFFFF"/>
  <rect x="30" y="30" width="1140" height="1140" rx="28" fill="none" stroke="#F3F4F6" stroke-width="2"/>

  <!-- Top Pill Badge -->
  <g transform="translate(600, 110)">
    <rect x="-130" y="-18" width="260" height="36" rx="18" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#374151" letter-spacing="1.2">HASHTAG WEB3 DIRECTORY</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="210" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="52" font-weight="700" fill="#111827">Explore All Free Tools Online</text>
  <text x="600" y="265" text-anchor="middle" font-size="22" font-weight="500" fill="#4B5563">Compare cities, verify visa laws, research citizenship, and find remote roles</text>

  <!-- 4 Core Resources Grid -->
  <g transform="translate(100, 320)">
    <!-- Resource 1: City Explorer -->
    <g transform="translate(0, 0)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="80" height="32" rx="16" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
      <text x="75" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#1D4ED8">CITIES</text>
      <text x="130" y="58" font-size="24" font-weight="700" fill="#0F172A">City Explorer</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#2563EB">hashtagweb3.com/nomads</text>
      
      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Compare 100+ cities by living cost and rent</tspan>
        <tspan x="35" dy="30">• Real Ookla internet speeds &amp; fiber availability</tspan>
        <tspan x="35" dy="30">• Walkability scores, safety index &amp; weather</tspan>
        <tspan x="35" dy="30">• Direct side-by-side city matchup cards</tspan>
      </text>
    </g>

    <!-- Resource 2: Nomad Visas -->
    <g transform="translate(520, 0)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="76" height="32" rx="16" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1"/>
      <text x="73" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">VISAS</text>
      <text x="126" y="58" font-size="24" font-weight="700" fill="#0F172A">Nomad Visa Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#16A34A">hashtagweb3.com/visas</text>
      
      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• 71 sovereign remote work visa programs</tspan>
        <tspan x="35" dy="30">• Official statutory monthly income thresholds</tspan>
        <tspan x="35" dy="30">• Local tax exemptions vs territorial rules</tspan>
        <tspan x="35" dy="30">• Passport entry checker &amp; stay durations</tspan>
      </text>
    </g>

    <!-- Resource 3: Citizenship & CBI -->
    <g transform="translate(0, 380)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="94" height="32" rx="16" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
      <text x="82" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#B45309">PASSPORTS</text>
      <text x="144" y="58" font-size="24" font-weight="700" fill="#0F172A">Citizenship Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#D97706">hashtagweb3.com/citizenship</text>
      
      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Statutory Citizenship by Investment routes</tspan>
        <tspan x="35" dy="30">• Minimum capital vs government fee schedules</tspan>
        <tspan x="35" dy="30">• Official processing speeds &amp; holding periods</tspan>
        <tspan x="35" dy="30">• Links to official government program gazettes</tspan>
      </text>
    </g>

    <!-- Resource 4: Web3 Jobs -->
    <g transform="translate(520, 380)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="80" height="32" rx="16" fill="#FAF5FF" stroke="#E9D5FF" stroke-width="1"/>
      <text x="75" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#7E22CE">CAREERS</text>
      <text x="130" y="58" font-size="24" font-weight="700" fill="#0F172A">Web3 Job Board</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#9333EA">hashtagweb3.com/jobs</text>
      
      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Thousands of verified remote Web3 jobs</tspan>
        <tspan x="35" dy="30">• Smart contracts, frontend dApps, &amp; engineering</tspan>
        <tspan x="35" dy="30">• Growth, marketing, design, &amp; tokenomics</tspan>
        <tspan x="35" dy="30">• Direct company application links</tspan>
      </text>
    </g>
  </g>

  <!-- Bottom CTA Pill Banner -->
  <g transform="translate(600, 1070)">
    <rect x="-350" y="-22" width="700" height="44" rx="22" fill="#0F172A" stroke="#1E293B" stroke-width="1"/>
    <text x="0" y="6" text-anchor="middle" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">OPEN-ACCESS REMOTE WORK INTELLIGENCE · HASHTAGWEB3.COM</text>
  </g>

  <!-- Footer Footnotes & Watermark -->
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#9CA3AF">Free for all remote workers, digital nomads and builders.</text>
  <text x="1155" y="1165" text-anchor="end" font-size="15" class="meta"><tspan fill="#4B5563" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#111827" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

async function renderImage(id: string, svg: string) {
  const svgPath = path.join(OUT_DIR, `${id}.svg`);
  const pngPath = path.join(OUT_DIR, `${id}.png`);

  fs.writeFileSync(svgPath, svg, 'utf8');

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngBuffer = resvg.render().asPng();
  fs.writeFileSync(pngPath, pngBuffer);

  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${id}.svg`), svg, 'utf8');
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${id}.png`), pngBuffer);
  }

  console.log(`Generated: ${id}.png (${(pngBuffer.length / 1024).toFixed(1)} KB) and .svg`);
}

async function main() {
  console.log('[generate-thread-cover-outro] Generating clean Cover & Outro visuals...');
  await renderImage('thread-cover-matrices', buildCoverSvg());
  await renderImage('thread-outro-resources', buildOutroSvg());
  console.log('[generate-thread-cover-outro] Done!');
}

main().catch(console.error);
