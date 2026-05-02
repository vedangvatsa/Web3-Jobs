import fs from 'fs';
import readline from 'readline';
import XLSX from 'xlsx';

function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

async function readCSV(path) {
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  let ln = 0, headers = [];
  const stats = { total: 0, withDesc: 0, withSalary: 0, withApply: 0, withLocation: 0, withTags: 0, withType: 0, withLogo: 0 };
  const companies = new Map(), tags = {}, categories = {}, types = {}, locations = {};

  for await (const line of rl) {
    if (ln === 0) { headers = parseLine(line); ln++; continue; }
    const f = parseLine(line);
    if (f.length < 10) { ln++; continue; }
    stats.total++;
    const co = (f[1]||'').trim();
    if (co && co !== '-') companies.set(co, (companies.get(co)||0)+1);
    ln++;
  }
  return { headers, stats, companies };
}

async function analyzeCvinBio() {
  const rl = readline.createInterface({ input: fs.createReadStream('/Users/vedang/Documents/cvinbio-jobs-extracted.csv'), crlfDelay: Infinity });
  let ln = 0;
  const stats = { total: 0, withDesc: 0, withSalary: 0, withApply: 0, withLocation: 0, withTags: 0, withType: 0 };
  const companies = new Map(), tags = {}, categories = {}, types = {}, locations = {};

  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    if (f.length < 10) { ln++; continue; }
    stats.total++;
    const company = (f[1]||'').trim();
    if (company && company !== '-') companies.set(company, (companies.get(company)||0)+1);
    const loc = (f[4]||'').trim();
    if (loc && loc !== '-') { stats.withLocation++; locations[loc] = (locations[loc]||0)+1; }
    const salary = (f[5]||'').trim();
    if (salary && salary !== '-' && salary.length > 2) stats.withSalary++;
    const cat = (f[7]||'').trim();
    if (cat && cat !== '-') categories[cat] = (categories[cat]||0)+1;
    const tag = (f[8]||'').trim();
    if (tag && tag !== '-') {
      stats.withTags++;
      tag.split(/[,;|]/).map(s=>s.trim()).filter(s=>s.length>1&&s.length<50).forEach(s => tags[s] = (tags[s]||0)+1);
    }
    const type = (f[9]||'').trim();
    if (type && type !== '-') { stats.withType++; types[type] = (types[type]||0)+1; }
    if ((f[12]||'').trim() && f[12].trim() !== '-' && f[12].trim().length > 5) stats.withApply++;
    const desc = (f[14]||'').trim();
    if (desc && desc.length > 5 && desc !== '-') stats.withDesc++;
    ln++;
  }
  return { stats, companies, tags, categories, types, locations };
}

async function analyzeWeb3() {
  const rl = readline.createInterface({ input: fs.createReadStream('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv'), crlfDelay: Infinity });
  let ln = 0;
  const stats = { total: 0, withDesc: 0, withSkills: 0, withSalary: 0, withLocation: 0, withType: 0, withLevel: 0 };
  const companies = new Map(), skills = {}, locations = {}, types = {}, levels = {}, depts = {}, cryptos = {}, sources = {};

  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    if (f.length < 10) { ln++; continue; }
    stats.total++;
    const co = (f[1]||'').trim();
    if (co) companies.set(co, (companies.get(co)||0)+1);
    const desc = (f[4]||'').trim();
    if (desc && desc.length > 5) stats.withDesc++;
    const sk = (f[5]||'').trim();
    if (sk) { stats.withSkills++; sk.split(/[,;|]/).map(s=>s.trim()).filter(s=>s.length>1&&s.length<50).forEach(s => skills[s] = (skills[s]||0)+1); }
    const comp = (f[6]||'').trim();
    if (comp && comp.length > 2) stats.withSalary++;
    const loc = (f[7]||'').trim();
    if (loc) { stats.withLocation++; locations[loc] = (locations[loc]||0)+1; }
    const type = (f[8]||'').trim();
    if (type) { stats.withType++; types[type] = (types[type]||0)+1; }
    const lvl = (f[9]||'').trim();
    if (lvl) { stats.withLevel++; levels[lvl] = (levels[lvl]||0)+1; }
    const dept = (f[10]||'').trim();
    if (dept) depts[dept] = (depts[dept]||0)+1;
    const cf = (f[11]||'').trim();
    if (cf) cryptos[cf] = (cryptos[cf]||0)+1;
    const src = (f[12]||'').trim();
    if (src) sources[src] = (sources[src]||0)+1;
    ln++;
  }
  return { stats, companies, skills, locations, types, levels, depts, cryptos, sources };
}

function sortedEntries(obj) {
  return Object.entries(obj).sort((a,b) => b[1]-a[1]);
}

function addSheet(wb, name, headers, rows) {
  // Truncate sheet name to 31 chars (Excel limit)
  const safeName = name.substring(0, 31);
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto-width columns
  const colWidths = headers.map((h, i) => {
    let max = String(h).length;
    rows.forEach(r => { const v = String(r[i] || ''); if (v.length > max) max = v.length; });
    return { wch: Math.min(max + 2, 50) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, safeName);
  console.log(`  ✓ ${safeName}: ${rows.length} rows`);
}

async function main() {
  console.log('Analyzing CVin.bio...');
  const cvin = await analyzeCvinBio();
  console.log('Analyzing Web3 Jobs...');
  const web3 = await analyzeWeb3();

  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Overview ───
  addSheet(wb, 'Overview', ['Metric', 'CVin.bio', '#Web3 Jobs', 'Notes'], [
    ['Total Jobs', cvin.stats.total, web3.stats.total, 'Raw row count from CSV exports'],
    ['Unique Companies', cvin.companies.size, web3.companies.size, 'Distinct company names'],
    ['With Description', cvin.stats.withDesc, web3.stats.withDesc, `${(cvin.stats.withDesc/cvin.stats.total*100).toFixed(1)}% / ${(web3.stats.withDesc/web3.stats.total*100).toFixed(1)}%`],
    ['With Salary', cvin.stats.withSalary, web3.stats.withSalary, 'Non-empty salary field'],
    ['With Location', cvin.stats.withLocation, web3.stats.withLocation, ''],
    ['With Apply URL', cvin.stats.withApply, 'N/A', 'CVin.bio only'],
    ['With Skills/Tags', cvin.stats.withTags, web3.stats.withSkills, ''],
    ['With Job Type', cvin.stats.withType, web3.stats.withType, ''],
  ]);

  // ─── Sheet 2: CVin.bio Companies ───
  const cCoSorted = [...cvin.companies.entries()].sort((a,b)=>b[1]-a[1]);
  addSheet(wb, 'CVin.bio Companies', ['Rank', 'Company', 'Jobs', '% of Total'], 
    cCoSorted.slice(0, 50).map(([k,v], i) => [i+1, k, v, `${(v/cvin.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 3: Web3 Companies ───
  const wCoSorted = [...web3.companies.entries()].sort((a,b)=>b[1]-a[1]);
  addSheet(wb, 'Web3 Companies', ['Rank', 'Company', 'Jobs', '% of Total'],
    wCoSorted.map(([k,v], i) => [i+1, k, v, `${(v/web3.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 4: CVin.bio Departments/Tags ───
  addSheet(wb, 'CVin.bio Departments', ['Rank', 'Department / Tag', 'Count', '% of Total'],
    sortedEntries(cvin.tags).slice(0, 50).map(([k,v], i) => [i+1, k, v, `${(v/cvin.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 5: Web3 Skills ───
  addSheet(wb, 'Web3 Skills', ['Rank', 'Skill', 'Count', '% of Total'],
    sortedEntries(web3.skills).slice(0, 50).map(([k,v], i) => [i+1, k, v, `${(v/web3.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 6: Seniority ───
  const senRows = [];
  sortedEntries(cvin.categories).forEach(([k,v]) => senRows.push([k, v, `${(v/cvin.stats.total*100).toFixed(1)}%`, '', '']));
  // Add blank separator label
  if (senRows.length > 0) senRows.push(['', '', '', '', '']);
  sortedEntries(web3.levels).forEach(([k,v]) => senRows.push([k, '', '', v, `${(v/web3.stats.total*100).toFixed(1)}%`]));
  addSheet(wb, 'Seniority', ['Level', 'CVin.bio Count', 'CVin.bio %', 'Web3 Count', 'Web3 %'], senRows);

  // ─── Sheet 7: Locations ───
  const cLoc = sortedEntries(cvin.locations).slice(0, 40);
  const wLoc = sortedEntries(web3.locations).slice(0, 30);
  const maxLocRows = Math.max(cLoc.length, wLoc.length);
  const locRows = [];
  for (let i = 0; i < maxLocRows; i++) {
    locRows.push([
      i+1,
      cLoc[i] ? cLoc[i][0] : '', cLoc[i] ? cLoc[i][1] : '', cLoc[i] ? `${(cLoc[i][1]/cvin.stats.total*100).toFixed(1)}%` : '',
      wLoc[i] ? wLoc[i][0] : '', wLoc[i] ? wLoc[i][1] : '', wLoc[i] ? `${(wLoc[i][1]/web3.stats.total*100).toFixed(1)}%` : '',
    ]);
  }
  addSheet(wb, 'Locations', ['Rank', 'CVin.bio Location', 'Count', '%', 'Web3 Location', 'Count', '%'], locRows);

  // ─── Sheet 8: Job Types ───
  const cType = sortedEntries(cvin.types).slice(0, 20);
  const wType = sortedEntries(web3.types);
  const maxTypeRows = Math.max(cType.length, wType.length);
  const typeRows = [];
  for (let i = 0; i < maxTypeRows; i++) {
    typeRows.push([
      cType[i] ? cType[i][0] : '', cType[i] ? cType[i][1] : '', cType[i] ? `${(cType[i][1]/cvin.stats.total*100).toFixed(1)}%` : '',
      wType[i] ? wType[i][0] : '', wType[i] ? wType[i][1] : '', wType[i] ? `${(wType[i][1]/web3.stats.total*100).toFixed(1)}%` : '',
    ]);
  }
  addSheet(wb, 'Job Types', ['CVin.bio Type', 'Count', '%', 'Web3 Type', 'Count', '%'], typeRows);

  // ─── Sheet 9: Web3 Departments ───
  addSheet(wb, 'Web3 Departments', ['Rank', 'Department', 'Jobs', '% of Total'],
    sortedEntries(web3.depts).map(([k,v], i) => [i+1, k, v, `${(v/web3.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 10: Web3 Crypto Focus ───
  addSheet(wb, 'Web3 Crypto Focus', ['Rank', 'Crypto Sector', 'Jobs', '% of Total'],
    sortedEntries(web3.cryptos).map(([k,v], i) => [i+1, k, v, `${(v/web3.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 11: Web3 Job Sources ───
  addSheet(wb, 'Web3 Job Sources', ['Rank', 'Source', 'Jobs', '% of Total'],
    sortedEntries(web3.sources).map(([k,v], i) => [i+1, k, v, `${(v/web3.stats.total*100).toFixed(1)}%`])
  );

  // ─── Sheet 12: HashtagWeb3.com ───
  addSheet(wb, 'HashtagWeb3.com', ['Metric', 'Value', 'Source'], [
    ['Founded', '2022', 'Schema.org JSON-LD on hashtagweb3.com'],
    ['Website', 'https://hashtagweb3.com', 'Canonical URL'],
    ['Community Size (claimed)', '60,000+', 'Twitter meta: Join 60000+ Web3 professionals'],
    ['Telegram Channel', 'https://t.me/web3hiring', 'Schema.org sameAs'],
    ['Twitter/X', 'https://x.com/hashtag_web3', 'Schema.org sameAs'],
    ['LinkedIn', 'https://linkedin.com/company/hashtagweb3', 'Schema.org sameAs'],
    ['YouTube', 'https://www.youtube.com/channel/UCr5WlEpTviHnnK856wG0EIg', 'Schema.org sameAs'],
    ['Career Guides (claimed)', '500+', 'Schema.org Organization description'],
    ['Glossary Terms (claimed)', '200+', 'Schema.org Organization description'],
    ['Analytics', 'Google Analytics (G-FYBLPS87X0) + PostHog', 'Page source'],
    ['Post a Job Contact', 'https://t.me/web3jobs_rep', 'CTA link'],
    ['', '', ''],
    ['FEATURED COMPANIES ON HOMEPAGE', '', ''],
    ['LBank', 'Logo displayed', 'Homepage'],
    ['dYdX', 'Logo displayed', 'Homepage'],
    ['Coinbase', 'Logo displayed', 'Homepage'],
    ['Bitget', 'Logo displayed', 'Homepage'],
    ['Binance', 'Logo displayed', 'Homepage'],
    ['Circle', 'Logo displayed', 'Homepage'],
    ['', '', ''],
    ['FEATURES & TOOLS', 'URL', ''],
    ['Jobs', 'https://hashtagweb3.com/', 'Main page'],
    ['News', 'https://hashtagweb3.com/news', 'Nav'],
    ['Community', 'https://hashtagweb3.com/community', 'Nav'],
    ['Companies', 'https://hashtagweb3.com/companies', 'Nav'],
    ['Learn Web3', 'https://hashtagweb3.com/learn', 'Nav'],
    ['Playbook (Blog)', 'https://hashtagweb3.com/blog', 'Nav'],
    ['Glossary', 'https://hashtagweb3.com/glossary', 'Nav'],
    ['Interview Questions', 'https://hashtagweb3.com/interview-questions', 'Nav'],
    ['Career Quiz', 'https://hashtagweb3.com/web3-career-quiz', 'Nav'],
    ['Salary Calculator', 'https://hashtagweb3.com/salary-calculator', 'Nav'],
    ['Freelance Rates', 'https://hashtagweb3.com/freelance-rates-by-industry', 'Nav'],
    ['Resume Builder', 'https://hashtagweb3.com/resume-builder', 'Nav'],
    ['Invoice Generator', 'https://hashtagweb3.com/invoice-generator', 'Nav'],
    ['Digital Nomad Visas', 'https://hashtagweb3.com/digital-nomad-visas', 'Nav'],
    ['Remote Work Checklist', 'https://hashtagweb3.com/remote-work-checklist', 'Nav'],
    ['JD Builder', 'https://hashtagweb3.com/jd-builder', 'Nav'],
    ['Offer Letter Customizer', 'https://hashtagweb3.com/offer-letter-customizer', 'Nav'],
    ['Onboarding Checklist', 'https://hashtagweb3.com/employee-onboarding-checklist', 'Nav'],
    ['Interview Feedback', 'https://hashtagweb3.com/interview-feedback-template', 'Nav'],
    ['Exit Survey', 'https://hashtagweb3.com/employee-exit-survey', 'Nav'],
    ['Milestones Tracker', 'https://hashtagweb3.com/employee-milestones-tracker', 'Nav'],
    ['Engagement Survey', 'https://hashtagweb3.com/employee-engagement-survey', 'Nav'],
    ['Work-Life Balance Survey', 'https://hashtagweb3.com/work-life-balance-survey', 'Nav'],
    ['Company Culture Guide', 'https://hashtagweb3.com/company-culture-guide', 'Nav'],
  ]);

  // Write the workbook
  const outPath = '/Users/vedang/Documents/platform-stats.xlsx';
  XLSX.writeFile(wb, outPath);
  console.log(`\n✅ Written to ${outPath}`);
  console.log(`   ${wb.SheetNames.length} sheets: ${wb.SheetNames.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
