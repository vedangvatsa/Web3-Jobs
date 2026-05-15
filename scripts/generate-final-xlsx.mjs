import fs from 'fs';
import readline from 'readline';
import XLSX from 'xlsx';

/* ─── CSV Parser ─── */
function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

/* ─── Analyze CVin.bio ─── */
async function analyzeCvinBio() {
  const rl = readline.createInterface({ input: fs.createReadStream('/Users/vedang/Documents/cvinbio-jobs-extracted.csv'), crlfDelay: Infinity });
  let ln = 0;
  const s = { total: 0, withDesc: 0, withSalary: 0, withApply: 0, withLocation: 0, withTags: 0, withType: 0 };
  const companies = new Map(), tags = {}, categories = {}, types = {}, locations = {};
  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    if (f.length < 10) { ln++; continue; }
    s.total++;
    const co = (f[1]||'').trim(); if (co && co !== '-') companies.set(co, (companies.get(co)||0)+1);
    const loc = (f[4]||'').trim(); if (loc && loc !== '-') { s.withLocation++; locations[loc] = (locations[loc]||0)+1; }
    const sal = (f[5]||'').trim(); if (sal && sal !== '-' && sal.length > 2) s.withSalary++;
    const cat = (f[7]||'').trim(); if (cat && cat !== '-') categories[cat] = (categories[cat]||0)+1;
    const tag = (f[8]||'').trim();
    if (tag && tag !== '-') { s.withTags++; tag.split(/[,;|]/).map(t=>t.trim()).filter(t=>t.length>1&&t.length<50).forEach(t => tags[t] = (tags[t]||0)+1); }
    const type = (f[9]||'').trim(); if (type && type !== '-') { s.withType++; types[type] = (types[type]||0)+1; }
    if ((f[12]||'').trim() && f[12].trim() !== '-' && f[12].trim().length > 5) s.withApply++;
    const desc = (f[14]||'').trim(); if (desc && desc.length > 5 && desc !== '-') s.withDesc++;
    ln++;
  }
  return { s, companies, tags, categories, types, locations };
}

/* ─── Analyze Web3 Jobs ─── */
async function analyzeWeb3() {
  const rl = readline.createInterface({ input: fs.createReadStream('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv'), crlfDelay: Infinity });
  let ln = 0;
  const s = { total: 0, withDesc: 0, withSkills: 0, withSalary: 0, withLocation: 0, withType: 0, withLevel: 0 };
  const companies = new Map(), skills = {}, locations = {}, types = {}, levels = {}, depts = {}, cryptos = {}, sources = {};
  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    if (f.length < 10) { ln++; continue; }
    s.total++;
    const co = (f[1]||'').trim(); if (co) companies.set(co, (companies.get(co)||0)+1);
    const desc = (f[4]||'').trim(); if (desc && desc.length > 5) s.withDesc++;
    const sk = (f[5]||'').trim();
    if (sk) { s.withSkills++; sk.split(/[,;|]/).map(t=>t.trim()).filter(t=>t.length>1&&t.length<50).forEach(t => skills[t] = (skills[t]||0)+1); }
    const comp = (f[6]||'').trim(); if (comp && comp.length > 2) s.withSalary++;
    const loc = (f[7]||'').trim(); if (loc) { s.withLocation++; locations[loc] = (locations[loc]||0)+1; }
    const type = (f[8]||'').trim(); if (type) { s.withType++; types[type] = (types[type]||0)+1; }
    const lvl = (f[9]||'').trim(); if (lvl) { s.withLevel++; levels[lvl] = (levels[lvl]||0)+1; }
    const dept = (f[10]||'').trim(); if (dept) depts[dept] = (depts[dept]||0)+1;
    const cf = (f[11]||'').trim(); if (cf) cryptos[cf] = (cryptos[cf]||0)+1;
    const src = (f[12]||'').trim(); if (src) sources[src] = (sources[src]||0)+1;
    ln++;
  }
  return { s, companies, skills, locations, types, levels, depts, cryptos, sources };
}

/* ─── Parse Sitemap ─── */
function parseSitemap() {
  const raw = fs.readFileSync('/Users/vedang/.gemini/antigravity/brain/724f7586-3993-460e-8d24-efb1ad745c81/.system_generated/steps/2670/content.md', 'utf8');
  const entries = [];
  const urlBlocks = raw.split('<url>').slice(1);
  for (const block of urlBlocks) {
    const locM = block.match(/<loc>(.*?)<\/loc>/);
    const prioM = block.match(/<priority>(.*?)<\/priority>/);
    const freqM = block.match(/<changefreq>(.*?)<\/changefreq>/);
    const modM = block.match(/<lastmod>(.*?)<\/lastmod>/);
    if (!locM) continue;
    const url = locM[1].trim();
    const path = url.replace('https://hashtagweb3.com', '') || '/';
    const prio = prioM ? parseFloat(prioM[1]) : 0.5;
    const freq = freqM ? freqM[1] : '';
    const lastmod = modM ? modM[1].split('T')[0] : '';
    
    // Categorize
    let category = 'Other';
    if (path === '/' || path === '/jobs') category = 'Jobs (Core)';
    else if (path.startsWith('/blog') || path.startsWith('/news')) category = 'Content';
    else if (path.startsWith('/glossary/') || path.startsWith('/learn')) category = 'Education';
    else if (path === '/glossary' || path === '/companies' || path === '/community' || path === '/resources') category = 'Directory';
    else if (path.startsWith('/company/')) category = 'Company Pages';
    else if (path.startsWith('/job/')) category = 'Job Pages';
    else if (/salary|resume|invoice|jd-builder|career-quiz|freelance|interview-questions/.test(path)) category = 'Tools';
    else if (/onboarding|offer-letter|exit-survey|feedback|milestones|engagement|work-life|culture|checklist/.test(path)) category = 'HR Tools';
    else if (path.match(/^\/[a-z]/) && !path.includes('/') || path.split('/').length === 2) category = 'Glossary Terms';
    
    entries.push({ url, path, prio, freq, lastmod, category });
  }
  return entries;
}

function sorted(obj) { return Object.entries(obj).sort((a,b) => b[1]-a[1]); }

function addSheet(wb, name, headers, rows) {
  const safeName = name.substring(0, 31);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h, i) => {
    let max = String(h).length;
    rows.forEach(r => { const v = String(r[i]||''); if (v.length > max) max = v.length; });
    return { wch: Math.min(max + 2, 55) };
  });
  XLSX.utils.book_append_sheet(wb, ws, safeName);
  console.log(`  ✓ ${safeName}: ${rows.length} rows`);
}

/* ─── MAIN ─── */
async function main() {
  console.log('Analyzing CVin.bio...');
  const cvin = await analyzeCvinBio();
  console.log('Analyzing Web3 Jobs...');
  const web3 = await analyzeWeb3();
  console.log('Parsing sitemap...');
  const sitemap = parseSitemap();

  const wb = XLSX.utils.book_new();

  // ═══════════════════════════════════════════════════
  // SHEET 1: OVERVIEW (merged from old Overview + Seniority + Job Types)
  // ═══════════════════════════════════════════════════
  const overviewRows = [];
  const p = (v, total) => `${(v/total*100).toFixed(1)}%`;

  // Section A: Key Metrics
  overviewRows.push(['KEY METRICS', '', '', '', '']);
  overviewRows.push(['Total Jobs', cvin.s.total, web3.s.total, '', 'Raw CSV row count']);
  overviewRows.push(['Unique Companies', cvin.companies.size, web3.companies.size, '', 'Distinct company names']);
  overviewRows.push(['With Description', cvin.s.withDesc, web3.s.withDesc, `${p(cvin.s.withDesc, cvin.s.total)} / ${p(web3.s.withDesc, web3.s.total)}`, '']);
  overviewRows.push(['With Salary', cvin.s.withSalary, web3.s.withSalary, '', '']);
  overviewRows.push(['With Location', cvin.s.withLocation, web3.s.withLocation, '', '']);
  overviewRows.push(['With Apply URL', cvin.s.withApply, 'N/A', '', 'CVin.bio only']);
  overviewRows.push(['With Skills/Tags', cvin.s.withTags, web3.s.withSkills, '', '']);
  overviewRows.push(['With Job Type', cvin.s.withType, web3.s.withType, '', '']);
  overviewRows.push(['', '', '', '', '']);

  // Section B: Seniority
  overviewRows.push(['SENIORITY', '', '', '', '']);
  sorted(cvin.categories).forEach(([k,v]) => overviewRows.push([k, v, '', p(v, cvin.s.total), 'CVin.bio']));
  sorted(web3.levels).forEach(([k,v]) => overviewRows.push([k, '', v, p(v, web3.s.total), 'Web3 Jobs']));
  overviewRows.push(['', '', '', '', '']);

  // Section C: Job Types
  overviewRows.push(['JOB / EMPLOYMENT TYPES', '', '', '', '']);
  const cType = sorted(cvin.types).slice(0, 15);
  const wType = sorted(web3.types);
  cType.forEach(([k,v]) => overviewRows.push([k, v, '', p(v, cvin.s.total), 'CVin.bio']));
  wType.forEach(([k,v]) => overviewRows.push([k, '', v, p(v, web3.s.total), 'Web3 Jobs']));

  addSheet(wb, 'Overview', ['Metric', 'CVin.bio', '#Web3 Jobs', '%', 'Notes'], overviewRows);

  // ═══════════════════════════════════════════════════
  // SHEET 2: COMPANIES (merged CVin.bio + Web3 side by side)
  // ═══════════════════════════════════════════════════
  const cCo = [...cvin.companies.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 50);
  const wCo = [...web3.companies.entries()].sort((a,b)=>b[1]-a[1]);
  const maxCo = Math.max(cCo.length, wCo.length);
  const coRows = [];
  for (let i = 0; i < maxCo; i++) {
    coRows.push([
      i+1,
      cCo[i] ? cCo[i][0] : '', cCo[i] ? cCo[i][1] : '', cCo[i] ? p(cCo[i][1], cvin.s.total) : '',
      wCo[i] ? wCo[i][0] : '', wCo[i] ? wCo[i][1] : '', wCo[i] ? p(wCo[i][1], web3.s.total) : '',
    ]);
  }
  addSheet(wb, 'Companies', ['#', 'CVin.bio Company', 'Jobs', '%', 'Web3 Company', 'Jobs', '%'], coRows);

  // ═══════════════════════════════════════════════════
  // SHEET 3: SKILLS & DEPARTMENTS (merged)
  // ═══════════════════════════════════════════════════
  const cTags = sorted(cvin.tags).slice(0, 50);
  const wSkills = sorted(web3.skills).slice(0, 50);
  const maxSk = Math.max(cTags.length, wSkills.length);
  const skRows = [];
  for (let i = 0; i < maxSk; i++) {
    skRows.push([
      i+1,
      cTags[i] ? cTags[i][0] : '', cTags[i] ? cTags[i][1] : '', cTags[i] ? p(cTags[i][1], cvin.s.total) : '',
      wSkills[i] ? wSkills[i][0] : '', wSkills[i] ? wSkills[i][1] : '', wSkills[i] ? p(wSkills[i][1], web3.s.total) : '',
    ]);
  }
  // Append Web3 departments & crypto focus below
  skRows.push(['', '', '', '', '', '', '']);
  skRows.push(['', 'WEB3 DEPARTMENTS', '', '', 'WEB3 CRYPTO FOCUS', '', '']);
  const wDepts = sorted(web3.depts);
  const wCrypto = sorted(web3.cryptos);
  const maxDC = Math.max(wDepts.length, wCrypto.length);
  for (let i = 0; i < maxDC; i++) {
    skRows.push([
      i+1,
      wDepts[i] ? wDepts[i][0] : '', wDepts[i] ? wDepts[i][1] : '', wDepts[i] ? p(wDepts[i][1], web3.s.total) : '',
      wCrypto[i] ? wCrypto[i][0] : '', wCrypto[i] ? wCrypto[i][1] : '', wCrypto[i] ? p(wCrypto[i][1], web3.s.total) : '',
    ]);
  }
  addSheet(wb, 'Skills & Departments', ['#', 'CVin.bio Dept/Tag', 'Count', '%', 'Web3 Skill/Sector', 'Count', '%'], skRows);

  // ═══════════════════════════════════════════════════
  // SHEET 4: LOCATIONS (merged)
  // ═══════════════════════════════════════════════════
  const cLoc = sorted(cvin.locations).slice(0, 40);
  const wLoc = sorted(web3.locations).slice(0, 30);
  const maxLoc = Math.max(cLoc.length, wLoc.length);
  const locRows = [];
  for (let i = 0; i < maxLoc; i++) {
    locRows.push([
      i+1,
      cLoc[i] ? cLoc[i][0] : '', cLoc[i] ? cLoc[i][1] : '', cLoc[i] ? p(cLoc[i][1], cvin.s.total) : '',
      wLoc[i] ? wLoc[i][0] : '', wLoc[i] ? wLoc[i][1] : '', wLoc[i] ? p(wLoc[i][1], web3.s.total) : '',
    ]);
  }
  addSheet(wb, 'Locations', ['#', 'CVin.bio Location', 'Jobs', '%', 'Web3 Location', 'Jobs', '%'], locRows);

  // ═══════════════════════════════════════════════════
  // SHEET 5: HASHTAGWEB3 + JOB SOURCES (merged)
  // ═══════════════════════════════════════════════════
  const hw3Rows = [];
  hw3Rows.push(['PLATFORM PROFILE', '', '']);
  hw3Rows.push(['Founded', '2022', 'Schema.org JSON-LD']);
  hw3Rows.push(['Website', 'https://hashtagweb3.com', 'Canonical URL']);
  hw3Rows.push(['Community Size (claimed)', '60,000+', 'Twitter meta tag']);
  hw3Rows.push(['Telegram Channel', 'https://t.me/web3hiring', 'Schema.org sameAs']);
  hw3Rows.push(['Twitter/X', 'https://x.com/hashtag_web3', 'Schema.org sameAs']);
  hw3Rows.push(['LinkedIn', 'https://linkedin.com/company/hashtagweb3', 'Schema.org sameAs']);
  hw3Rows.push(['YouTube', 'https://youtube.com/channel/UCr5WlEpTviHnnK856wG0EIg', 'Schema.org sameAs']);
  hw3Rows.push(['Career Guides (claimed)', '500+', 'Org description']);
  hw3Rows.push(['Glossary Terms (claimed)', '200+', 'Org description']);
  hw3Rows.push(['Analytics Stack', 'PostHog + Google Analytics (G-FYBLPS87X0)', 'Page source']);
  hw3Rows.push(['Post a Job', 'https://t.me/web3jobs_rep', 'CTA link']);
  hw3Rows.push(['Total Sitemap Pages', String(sitemap.length), 'sitemap.xml']);
  hw3Rows.push(['', '', '']);
  hw3Rows.push(['FEATURED HOMEPAGE LOGOS', '', '']);
  ['LBank','dYdX','Coinbase','Bitget','Binance','Circle'].forEach(c => hw3Rows.push([c, 'Logo displayed', 'Homepage']));
  hw3Rows.push(['', '', '']);
  hw3Rows.push(['WEB3 JOB SOURCES (all)', 'Jobs', '%']);
  sorted(web3.sources).forEach(([k,v]) => hw3Rows.push([k, v, p(v, web3.s.total)]));

  addSheet(wb, 'HashtagWeb3 & Sources', ['Metric / Source', 'Value', 'Source / %'], hw3Rows);

  // ═══════════════════════════════════════════════════
  // SHEET 6: HASHTAGWEB3 PAGES (from sitemap)
  // ═══════════════════════════════════════════════════
  // Categorize and summarize
  const catCounts = {};
  sitemap.forEach(e => { catCounts[e.category] = (catCounts[e.category]||0)+1; });

  const pageRows = [];
  // Summary first
  pageRows.push(['PAGE CATEGORY SUMMARY', '', '', '', '']);
  sorted(catCounts).forEach(([cat, cnt]) => {
    pageRows.push([cat, cnt, p(cnt, sitemap.length), '', '']);
  });
  pageRows.push(['TOTAL', sitemap.length, '100%', '', '']);
  pageRows.push(['', '', '', '', '']);

  // Top pages by priority
  pageRows.push(['TOP PAGES BY SITEMAP PRIORITY', '', '', '', '']);
  const topPages = [...sitemap].sort((a,b) => b.prio - a.prio || a.path.localeCompare(b.path));
  // Show all non-0.6 priority pages first (the differentiated ones), then sample 0.6
  const highPrio = topPages.filter(p => p.prio > 0.6);
  const medPrio = topPages.filter(p => p.prio === 0.6).slice(0, 20);
  const lowPrio = topPages.filter(p => p.prio < 0.6);

  highPrio.forEach(e => pageRows.push([e.path, e.prio, e.freq, e.category, e.lastmod]));
  pageRows.push(['', '', '', '', '']);
  pageRows.push(['--- Medium Priority (0.6) — showing 20 of ' + topPages.filter(p=>p.prio===0.6).length, '', '', '', '']);
  medPrio.forEach(e => pageRows.push([e.path, e.prio, e.freq, e.category, e.lastmod]));
  pageRows.push(['', '', '', '', '']);
  pageRows.push(['--- Lower Priority (<0.6)', '', '', '', '']);
  lowPrio.forEach(e => pageRows.push([e.path, e.prio, e.freq, e.category, e.lastmod]));

  addSheet(wb, 'HashtagWeb3 Pages', ['Page Path', 'Priority', 'Update Freq', 'Category', 'Last Modified'], pageRows);

  // Write workbook
  const outPath = '/Users/vedang/Documents/platform-stats.xlsx';
  XLSX.writeFile(wb, outPath);
  console.log(`\n✅ Written to ${outPath}`);
  console.log(`   ${wb.SheetNames.length} sheets: ${wb.SheetNames.join(', ')}`);

  // ═══════════════════════════════════════════════════
  // ALSO GENERATE THE HASHTAGWEB3 PAGES CSV
  // ═══════════════════════════════════════════════════
  const csvRows = ['Page Path,URL,Sitemap Priority,Update Frequency,Category,% of Site,Last Modified'];
  // Sort by priority desc, then alphabetically
  const allSorted = [...sitemap].sort((a,b) => b.prio - a.prio || a.path.localeCompare(b.path));
  allSorted.forEach(e => {
    const esc = v => '"' + String(v||'').replace(/"/g,'""') + '"';
    csvRows.push([esc(e.path), esc(e.url), e.prio, esc(e.freq), esc(e.category), p(1, sitemap.length), esc(e.lastmod)].join(','));
  });
  // Add category summary at bottom
  csvRows.push('');
  csvRows.push('CATEGORY SUMMARY,Total Pages,% of Site,,,,');
  sorted(catCounts).forEach(([cat, cnt]) => {
    csvRows.push(`"${cat}",${cnt},${p(cnt, sitemap.length)},,,,`);
  });
  csvRows.push(`TOTAL,${sitemap.length},100%,,,,`);

  fs.writeFileSync('/Users/vedang/Documents/hashtagweb3-pages.csv', csvRows.join('\n'));
  console.log(`\n✅ Written hashtagweb3-pages.csv (${allSorted.length} pages)`);
}

main().catch(e => { console.error(e); process.exit(1); });
