import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/images/social');
const ARTIFACT_DIR = '/Users/vedang/.gemini/antigravity/brain/d8e0523d-8c6b-4440-8112-6fd00000dadf';

const matrixFiles = [
  'where-to-work-cost-vs-speed.png',
  'where-to-live-safely-cost-vs-safety.png',
  'city-walkability-vs-cost.png',
  'the-nomad-value-index.png',
  'where-to-live-digital-nomad.png',
  'global-passports-mobility-vs-cost.png',
  'digital-nomad-visas-tax-vs-income.png',
  'digital-nomad-visas-income-vs-duration.png',
  'citizenship-by-investment-capital-vs-speed.png',
  'where-to-build-web3.png'
];

const matrixB64 = matrixFiles.map(f => {
  const p = path.join(OUT_DIR, f);
  return fs.readFileSync(p).toString('base64');
});

const matrixMeta = [
  { num: '01', title: 'Living Cost vs Internet Speed', tag: 'SPEED', color: '#2563EB', bg: '#EFF6FF', sweet: 'Chiang Mai · Da Nang · Bucharest', axis: 'Speed: 94–577 Mbps · Cost: $850–$6.1k' },
  { num: '02', title: 'Living Cost vs Safety Score', tag: 'SAFETY', color: '#059669', bg: '#ECFDF5', sweet: 'Taipei · Prague · Valencia', axis: 'Safety Index: 45–86 · Cost: $850–$6.1k' },
  { num: '03', title: 'Walkability vs Living Cost', tag: 'LIFESTYLE', color: '#7C3AED', bg: '#F5F3FF', sweet: 'Prague · Budapest · Buenos Aires', axis: 'Walk Score: 40–96 · Cost: $850–$6.1k' },
  { num: '04', title: 'The Nomad Value Index', tag: 'VALUE', color: '#D97706', bg: '#FFFBEB', sweet: 'Chiang Mai · Da Nang · Lisbon', axis: 'Composite Value: 35–94 · Cost: $850–$6.1k' },
  { num: '05', title: 'Digital Nomad Hubs: Quality vs Cost', tag: 'HUBS', color: '#0284C7', bg: '#F0F9FF', sweet: 'Lisbon · Barcelona · Prague · Taipei', axis: 'Quality Score: 4.0–9.2 · Cost: $850–$6.1k' },
  { num: '06', title: 'Global Passports: Mobility vs Cost', tag: 'MOBILITY', color: '#E11D48', bg: '#FFF1F2', sweet: 'Dominica · St. Lucia · Portugal', axis: 'Visa-Free: 140–190 · Capital: $100k–€750k' },
  { num: '07', title: 'Nomad Visas: Tax vs Income', tag: 'TAXATION', color: '#0D9488', bg: '#F0FDFA', sweet: 'Costa Rica · Dubai · Croatia (0% Tax)', axis: 'Tax Rate: 0%–35% · Income: $0–$10k/mo' },
  { num: '08', title: 'Nomad Visas: Duration vs Income', tag: 'RUNWAY', color: '#4F46E5', bg: '#EEF2FF', sweet: 'Spain · Portugal · Croatia (Long Stay)', axis: 'Stay: 6–60 months · Income: $0–$10k/mo' },
  { num: '09', title: 'Citizenship: Capital vs Speed', tag: 'CITIZENSHIP', color: '#9333EA', bg: '#FAF5FF', sweet: 'Vanuatu · St. Kitts · Dominica (2-3 mo)', axis: 'Process: 2–36 mos · Capital: $100k–€750k' },
  { num: '10', title: 'Where to Build Web3: Law vs Talent', tag: 'WEB3', color: '#EA580C', bg: '#FFF7ED', sweet: 'Dubai (VARA) · Singapore · Zurich', axis: 'Frameworks: VARA, MiCA, MAS · High Dev Density' },
];

function buildCoverSvg(): string {
  let cards = '';
  
  for (let i = 0; i < 10; i++) {
    const isLeft = i < 5;
    const colX = isLeft ? 50 : 615;
    const rowIdx = isLeft ? i : i - 5;
    const rowY = 220 + rowIdx * (165 + 13);
    const m = matrixMeta[i];
    const b64 = matrixB64[i];
    
    cards += `
    <g transform="translate(${colX}, ${rowY})">
      <!-- Card Container with subtle shadow border -->
      <rect width="535" height="165" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="0" y="0" width="6" height="165" rx="3" fill="${m.color}"/>
      
      <!-- Mini Real Matrix Thumbnail -->
      <g transform="translate(16, 15)">
        <rect width="135" height="135" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2"/>
        <clipPath id="clip-cover-${i}">
          <rect width="135" height="135" rx="10"/>
        </clipPath>
        <image href="data:image/png;base64,${b64}" width="135" height="135" clip-path="url(#clip-cover-${i})" preserveAspectRatio="xMidYMid slice"/>
      </g>
      
      <!-- Content Details -->
      <g transform="translate(168, 18)">
        <!-- Badge row -->
        <rect x="0" y="0" width="28" height="20" rx="4" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>
        <text x="14" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#475569">${m.num}</text>
        
        <rect x="34" y="0" width="85" height="20" rx="4" fill="${m.bg}" stroke="${m.color}" stroke-opacity="0.3" stroke-width="1"/>
        <text x="76" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="${m.color}" letter-spacing="0.5">${m.tag}</text>
        
        <!-- Title -->
        <text x="0" y="47" font-size="16" font-weight="700" fill="#0F172A">${m.title}</text>
        
        <!-- Sweet spot / top picks -->
        <text x="0" y="73" font-size="13" font-weight="600" fill="#334155"><tspan fill="${m.color}">★</tspan> ${m.sweet}</text>
        
        <!-- Axis specs -->
        <text x="0" y="97" font-size="11.5" font-weight="500" fill="#64748B">${m.axis}</text>
        
        <!-- View matrix prompt -->
        <g transform="translate(0, 110)">
          <rect width="114" height="20" rx="10" fill="${m.bg}"/>
          <text x="57" y="14" text-anchor="middle" font-size="10.5" font-weight="700" fill="${m.color}">Tweet #${i + 2} in Thread ↓</text>
        </g>
      </g>
    </g>`;
  }
  
  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" style="background:#F8FAFC; font-family:system-ui,-apple-system,'SF Pro Display','Segoe UI',Roboto,Helvetica,sans-serif;">
  <!-- Background Canvas -->
  <rect width="1200" height="1200" fill="#F8FAFC"/>
  <rect x="24" y="24" width="1152" height="1152" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Top Category / Issuer Pill -->
  <g transform="translate(600, 58)">
    <rect x="-175" y="-14" width="350" height="28" rx="14" fill="#EEF2FF" stroke="#C7D2FE" stroke-width="1"/>
    <text x="0" y="4" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4338CA" letter-spacing="1.2">HASHTAG WEB3 RESEARCH · 2026 BENCHMARK</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="115" text-anchor="middle" font-size="38" font-weight="800" fill="#0F172A" letter-spacing="-0.5">The Remote Builder's Decision Atlas</text>
  <text x="600" y="148" text-anchor="middle" font-size="16.5" font-weight="500" fill="#475569">10 Data-Backed 2×2 Decision Matrices Across 100+ Cities, 71 Visas &amp; Web3 Tech Hubs</text>

  <!-- 4 Stats / Feature Pills -->
  <g transform="translate(600, 185)">
    <g transform="translate(-360, 0)">
      <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">100+ GLOBAL CITIES</text>
    </g>
    <g transform="translate(-120, 0)">
      <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">71 NOMAD VISAS</text>
    </g>
    <g transform="translate(120, 0)">
      <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">15 CBI PROGRAMS</text>
    </g>
    <g transform="translate(360, 0)">
      <rect x="-70" y="-12" width="140" height="24" rx="12" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">10 2×2 FRAMEWORKS</text>
    </g>
  </g>

  <!-- Cards Grid (5 left, 5 right) -->
  ${cards}

  <!-- Footer Divider & Meta -->
  <line x1="50" y1="1135" x2="1150" y2="1135" stroke="#E2E8F0" stroke-width="1"/>
  <text x="50" y="1165" font-size="13" font-weight="500" fill="#64748B">Sources: Hashtag Web3 Index, Official Visa Registries &amp; Numbeo Data.</text>
  <text x="1150" y="1165" text-anchor="end" font-size="14"><tspan fill="#475569" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#0F172A" font-weight="700">hashtagweb3.com</tspan></text>
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
      <rect x="35" y="35" width="70" height="32" rx="16" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1"/>
      <text x="70" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#15803D">VISAS</text>
      <text x="120" y="58" font-size="24" font-weight="700" fill="#0F172A">Nomad Visa Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#16A34A">hashtagweb3.com/visas</text>

      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• 71 sovereign remote work visa programs</tspan>
        <tspan x="35" dy="30">• Official statutory monthly income thresholds</tspan>
        <tspan x="35" dy="30">• Local tax exemptions vs territorial rules</tspan>
        <tspan x="35" dy="30">• Passport entry checker &amp; stay durations</tspan>
      </text>
    </g>

    <!-- Resource 3: Passports & Citizenship -->
    <g transform="translate(0, 380)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="105" height="32" rx="16" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1"/>
      <text x="87" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#B45309">PASSPORTS</text>
      <text x="155" y="58" font-size="24" font-weight="700" fill="#0F172A">Citizenship Guide</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#D97706">hashtagweb3.com/citizenship</text>

      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Statutory Citizenship by Investment routes</tspan>
        <tspan x="35" dy="30">• Minimum capital vs government fee schedules</tspan>
        <tspan x="35" dy="30">• Official processing speeds &amp; holding periods</tspan>
        <tspan x="35" dy="30">• Links to official government program gazettes</tspan>
      </text>
    </g>

    <!-- Resource 4: Web3 Job Board -->
    <g transform="translate(520, 380)">
      <rect width="480" height="340" rx="24" fill="url(#cardGrad2)" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow2)"/>
      <rect x="35" y="35" width="90" height="32" rx="16" fill="#FDF4FF" stroke="#F0ABFC" stroke-width="1"/>
      <text x="80" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#A21CAF">CAREERS</text>
      <text x="140" y="58" font-size="24" font-weight="700" fill="#0F172A">Web3 Job Board</text>
      <text x="35" y="100" font-size="15" font-weight="600" fill="#9333EA">hashtagweb3.com/jobs</text>

      <text x="35" y="150" font-size="15" font-weight="500" fill="#334155">
        <tspan x="35" dy="0">• Thousands of verified remote Web3 jobs</tspan>
        <tspan x="35" dy="30">• Smart contracts, frontend dApps, &amp; engineering</tspan>
        <tspan x="35" dy="30">• Growth, marketing, design, &amp; tokenomics</tspan>
        <tspan x="35" dy="30">• Direct company application links</tspan>
      </text>
    </g>
  </g>

  <!-- Bottom CTA Pill -->
  <g transform="translate(600, 1070)">
    <rect x="-350" y="-24" width="700" height="48" rx="24" fill="#0F172A"/>
    <text x="0" y="7" text-anchor="middle" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="1">OPEN-ACCESS REMOTE WORK INTELLIGENCE · HASHTAGWEB3.COM</text>
  </g>

  <!-- Footer Footnotes & Watermark -->
  <text x="45" y="1165" font-size="13" font-weight="400" fill="#9CA3AF">Free for all remote workers, digital nomads and builders.</text>
  <text x="1155" y="1165" text-anchor="end" font-size="15"><tspan fill="#4B5563" font-weight="500">Find Web3 Jobs at </tspan><tspan fill="#111827" font-weight="700">hashtagweb3.com</tspan></text>
</svg>`;
}

async function main() {
  console.log('Rendering high-fidelity thread cover and outro graphics...');
  
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
