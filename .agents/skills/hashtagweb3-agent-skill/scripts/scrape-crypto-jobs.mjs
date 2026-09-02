#!/usr/bin/env node
/**
 * Crypto Jobs Scraper — scrapes all open jobs from target crypto companies.
 * Outputs CSV to ~/Desktop/crypto-jobs.csv
 * Usage: node scripts/scrape-crypto-jobs.mjs
 */
import { writeFileSync } from 'fs';
import { homedir } from 'os';

const OUTPUT = `${homedir()}/Desktop/crypto-jobs.csv`;

// ── Skill taxonomy ──
const SKILL_MAP = [
  [/\bPython\b/i,'Python'],[/\bJavaScript\b/i,'JavaScript'],[/\bTypeScript\b/i,'TypeScript'],
  [/\bJava\b(?!Script)/i,'Java'],[/\bGolang\b|\bGo\s+(?:programming|language)/i,'Go'],
  [/\bRust\b/i,'Rust'],[/\bC\+\+\b/i,'C++'],[/\bSolidity\b/i,'Solidity'],
  [/\bReact\b(?!\s*Native)/i,'React'],[/\bReact\s*Native\b/i,'React Native'],
  [/\bNode\.?js\b/i,'Node.js'],[/\bNext\.?js\b/i,'Next.js'],[/\bVue\.?js\b/i,'Vue.js'],
  [/\bAngular\b/i,'Angular'],[/\bGraphQL\b/i,'GraphQL'],
  [/\bPostgreSQL\b|\bPostgres\b/i,'PostgreSQL'],[/\bMySQL\b/i,'MySQL'],
  [/\bMongoDB\b/i,'MongoDB'],[/\bRedis\b/i,'Redis'],[/\bKafka\b/i,'Kafka'],
  [/\bAWS\b/i,'AWS'],[/\bGCP\b|\bGoogle Cloud\b/i,'GCP'],[/\bAzure\b/i,'Azure'],
  [/\bDocker\b/i,'Docker'],[/\bKubernetes\b|\bk8s\b/i,'Kubernetes'],
  [/\bTerraform\b/i,'Terraform'],[/\bCI\/CD\b/i,'CI/CD'],[/\bLinux\b/i,'Linux'],
  [/\bMachine Learning\b/i,'ML'],[/\bLLM\b/i,'LLM'],[/\bPyTorch\b/i,'PyTorch'],
  [/\bTensorFlow\b/i,'TensorFlow'],[/\bNLP\b/i,'NLP'],
  [/\bEthereum\b/i,'Ethereum'],[/\bSolana\b/i,'Solana'],[/\bDeFi\b/i,'DeFi'],
  [/\bNFT\b/i,'NFT'],[/\bHardhat\b/i,'Hardhat'],[/\bFoundry\b/i,'Foundry'],
  [/\bIPFS\b/i,'IPFS'],[/\bZK/i,'ZK Proofs'],[/\bEVM\b/i,'EVM'],
  [/\bSmart\s+Contract/i,'Smart Contracts'],[/\bWeb3\b/i,'Web3'],
  [/\bSQL\b/i,'SQL'],[/\bTableau\b/i,'Tableau'],[/\bSEO\b/i,'SEO'],
  [/\bFigma\b/i,'Figma'],[/\bUI\/UX\b|\bUX\/UI\b/i,'UI/UX'],
  [/\bKYC\b/i,'KYC'],[/\bAML\b/i,'AML'],[/\bGDPR\b/i,'GDPR'],
  [/\bCompliance\b/i,'Compliance'],[/\bAgile\b|\bScrum\b/i,'Agile'],
  [/\bAPI\b/i,'API'],[/\bMicroservices\b/i,'Microservices'],
  [/\bLayer\s*2\b|\bL2\b/i,'Layer 2'],[/\bKotlin\b/i,'Kotlin'],[/\bSwift\b/i,'Swift'],
  [/\bDjango\b/i,'Django'],[/\bFlask\b/i,'Flask'],[/\bElasticsearch\b/i,'Elasticsearch'],
  [/\bDatabricks\b/i,'Databricks'],[/\bDatadog\b/i,'Datadog'],
  [/\bRisk Management\b/i,'Risk Mgmt'],[/\bSalesforce\b/i,'Salesforce'],
];

function extractSkills(text) {
  if (!text) return '';
  const found = new Set();
  for (const [re, label] of SKILL_MAP) if (re.test(text)) found.add(label);
  return found.size ? [...found].join('; ') : '';
}

function inferSeniority(t) {
  t = (t||'').toLowerCase();
  if (/\b(intern|internship)\b/.test(t)) return 'Intern';
  if (/\b(junior|jr\.?|entry|associate)\b/.test(t)) return 'Junior';
  if (/\b(director|vp|head|chief|cto|ceo|cfo|president)\b/.test(t)) return 'Leadership';
  if (/\b(senior|sr\.?|lead|principal|staff)\b/.test(t)) return 'Senior';
  if (/\b(manager|mgr)\b/.test(t)) return 'Manager';
  return 'Mid';
}

function inferDept(t) {
  t = (t||'').toLowerCase();
  if (/data scien|machine learn|ml eng|ai eng|nlp|llm/i.test(t)) return 'Data Science / AI';
  if (/data analyst|analytics/i.test(t)) return 'Analytics';
  if (/data engineer|etl/i.test(t)) return 'Data Engineering';
  if (/software|engineer|developer|\bswe\b|frontend|backend|fullstack|devops|\bsre\b|mobile/i.test(t)) return 'Engineering';
  if (/design|ux\b|ui design|product design/i.test(t)) return 'Design';
  if (/product manag|product owner|\btpm\b/i.test(t)) return 'Product';
  if (/marketing|growth|\bseo\b|\bbrand\b|content/i.test(t)) return 'Marketing';
  if (/\bsales\b|account exec|business develop/i.test(t)) return 'Sales';
  if (/recrui|talent|people ops|\bhr\b/i.test(t)) return 'People / HR';
  if (/finance|accounting|fp.?a/i.test(t)) return 'Finance';
  if (/legal|counsel|compliance|regulatory|risk/i.test(t)) return 'Legal / Compliance';
  if (/customer|support eng/i.test(t)) return 'Customer Success';
  if (/security|infosec|cyber/i.test(t)) return 'Security';
  if (/research|scientist/i.test(t)) return 'Research';
  if (/community|devrel/i.test(t)) return 'Community';
  if (/operat/i.test(t)) return 'Operations';
  return 'Other';
}

function inferRemote(l) { l=(l||'').toLowerCase(); return /\bremote\b/.test(l)?'Yes':/\bhybrid\b/.test(l)?'Hybrid':'On-site'; }

function decodeEntities(s) {
  if (!s) return '';
  // Decode repeatedly to handle double/triple encoding (&amp;lt; → &lt; → <)
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
      .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'")
      .replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/').replace(/&nbsp;/g,' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
  }
  return s;
}

function stripHTML(h) {
  if (!h) return '';
  // 1. Decode all HTML entities first (handles double-encoded content)
  h = decodeEntities(h);
  // 2. Now strip actual HTML tags
  return h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'')
    .replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<\/li>/gi,'\n')
    .replace(/<\/h[1-6]>/gi,'\n').replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ').trim();
}

function esc(v) {
  if (!v && v!==0) return '';
  const s = String(v).replace(/\r?\n/g,' ').replace(/"/g,'""');
  return s.includes(',')||s.includes('"') ? `"${s}"` : s;
}

function extractSalary(text) {
  if (!text) return '';
  let m = text.match(/(?:[$€£])\s?(\d{1,3}(?:,\d{3})+)\s*[-–—to]+\s*(?:[$€£])\s?(\d{1,3}(?:,\d{3})+)/i);
  if (m) return `$${m[1]} - $${m[2]}`;
  m = text.match(/(?:[$€£])\s?(\d{2,4})[kK]\s*[-–—to]+\s*(?:[$€£])\s?(\d{2,4})[kK]/i);
  if (m) return `$${parseInt(m[1])*1000} - $${parseInt(m[2])*1000}`;
  return '';
}

// ── ATS Fetchers ──

async function fetchGreenhouseJobs(slug, company) {
  console.log(`  Fetching Greenhouse: ${slug}`);
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
  const data = await r.json();
  return (data.jobs || []).map(j => ({
    company, title: j.title||'', url: j.absolute_url||'',
    location: j.location?.name||'', department: j.departments?.[0]?.name||'',
    description: stripHTML(j.content||''), datePosted: j.updated_at?.split('T')[0]||'',
    salary: '',
  }));
}

async function fetchLeverJobs(slug, company) {
  console.log(`  Fetching Lever: ${slug}`);
  const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  const data = await r.json();
  return (Array.isArray(data)?data:[]).map(j => ({
    company, title: j.text||'', url: j.hostedUrl||'',
    location: j.categories?.location||'', department: j.categories?.team||'',
    description: stripHTML(j.descriptionPlain||j.description||''),
    datePosted: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : '',
    salary: '',
  }));
}

async function fetchAshbyJobs(slug, company) {
  console.log(`  Fetching Ashby: ${slug}`);
  // Use minimal query that works reliably
  const r = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operationName: 'ApiJobBoardWithTeams',
      variables: { organizationHostedJobsPageName: slug },
      query: 'query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) { jobBoard: jobBoardWithTeams(organizationHostedJobsPageName: $organizationHostedJobsPageName) { jobPostings { id title locationName employmentType compensationTierSummary } } }',
    }),
  });
  const data = await r.json();
  const postings = data?.data?.jobBoard?.jobPostings || [];
  console.log(`  Found ${postings.length} listings, fetching descriptions...`);

  const jobs = [];
  for (let i = 0; i < postings.length; i++) {
    const p = postings[i];
    let desc = '';
    try {
      const dr = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationName: 'ApiJobPosting',
          variables: { jobPostingId: p.id },
          query: 'query ApiJobPosting($jobPostingId: String!) { jobPosting(id: $jobPostingId) { id title descriptionHtml locationName departmentName compensationTierSummary } }',
        }),
      });
      const dd = await dr.json();
      desc = stripHTML(dd?.data?.jobPosting?.descriptionHtml || '');
    } catch {}
    jobs.push({
      company, title: p.title||'', url: `https://jobs.ashbyhq.com/${encodeURIComponent(slug)}/${p.id}`,
      location: p.locationName||'', department: '',
      description: desc, salary: p.compensationTierSummary||'', datePosted: '',
    });
    if ((i+1) % 20 === 0) process.stdout.write(`\r  ${i+1}/${postings.length} descriptions...`);
  }
  if (postings.length > 10) console.log(`\r  ${postings.length}/${postings.length} descriptions done`);
  return jobs;
}

async function fetchSolanaEcosystemJobs() {
  console.log('  Fetching Solana ecosystem from jobs.solana.com...');
  // Get buildId first
  const html = await (await fetch('https://jobs.solana.com/jobs')).text();
  const buildMatch = html.match(/"buildId":"([^"]+)"/);
  if (!buildMatch) { console.log('  ✗ Cannot find buildId'); return []; }
  const buildId = buildMatch[1];

  const allJobs = [];
  const totalPages = 25; // 437 jobs / 20 per page ≈ 22 pages, pad a bit
  for (let page = 1; page <= totalPages; page++) {
    try {
      const url = `https://jobs.solana.com/_next/data/${buildId}/jobs.json?page=${page}`;
      const r = await fetch(url);
      if (!r.ok) break;
      const data = await r.json();
      const jobs = data?.pageProps?.initialState?.jobs?.found || [];
      if (jobs.length === 0) break;
      for (const j of jobs) {
        const org = j.organization || {};
        const loc = (j.locations || []).map(l => l.name || l).join('; ') || (j.searchableLocations||[]).join('; ');
        const salary = (j.compensationAmountMinCents && j.compensationAmountMaxCents)
          ? `$${Math.round(j.compensationAmountMinCents/100)} - $${Math.round(j.compensationAmountMaxCents/100)}${j.compensationPeriod ? '/' + j.compensationPeriod : ''}`
          : '';
        allJobs.push({
          company: org.name || 'Solana Ecosystem',
          title: j.title || '',
          url: j.url || `https://jobs.solana.com/jobs/${j.slug || j.id}`,
          location: loc,
          department: '',
          description: '', // No descriptions in listing, would need individual fetch
          salary,
          datePosted: j.createdAt ? new Date(j.createdAt * 1000).toISOString().split('T')[0] : '',
          skills: (j.skills || []).map(s => s.name || s).join('; '),
          seniority: j.seniority || '',
          workMode: j.workMode || '',
        });
      }
      process.stdout.write(`\r  Page ${page}: ${allJobs.length} jobs so far...`);
    } catch { break; }
  }
  console.log(`\r  Solana ecosystem: ${allJobs.length} total jobs`);
  return allJobs;
}

async function fetchAbout(url) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(10000),
    });
    let text = stripHTML(await r.text());
    return text.length > 2000 ? text.slice(0, 2000) + '...' : text;
  } catch { return ''; }
}

// ── Main ──
async function main() {
  console.log('🔍 Crypto Jobs Scraper\n' + '━'.repeat(50));
  const allRows = [];

  // Company configs
  const sources = [
    { company: 'Gemini', domain: 'gemini.com', ats: 'greenhouse', slug: 'gemini', aboutUrl: 'https://www.gemini.com/about' },
    { company: 'Binance', domain: 'binance.com', ats: 'lever', slug: 'binance', aboutUrl: 'https://www.binance.com/en/about' },
    { company: 'Kraken', domain: 'kraken.com', ats: 'ashby', slug: 'kraken.com', aboutUrl: 'https://www.kraken.com/about' },
    { company: 'Solana Foundation', domain: 'solana.com', ats: 'ashby', slug: 'Solana Foundation', aboutUrl: 'https://solana.com/about' },
    { company: 'Ethereum Foundation', domain: 'ethereum.org', ats: 'ashby', slug: 'ethereum-foundation', aboutUrl: 'https://ethereum.org/en/about/' },
  ];

  // Fetch about pages
  console.log('\n📄 Fetching about pages...');
  const aboutMap = {};
  await Promise.all(sources.map(async s => {
    aboutMap[s.company] = await fetchAbout(s.aboutUrl);
    console.log(`  ✓ ${s.company}: ${aboutMap[s.company].length} chars`);
  }));

  // Fetch jobs from each ATS
  for (const s of sources) {
    console.log(`\n🏢 ${s.company} (${s.ats})...`);
    let jobs = [];
    try {
      if (s.ats === 'greenhouse') jobs = await fetchGreenhouseJobs(s.slug, s.company);
      else if (s.ats === 'lever') jobs = await fetchLeverJobs(s.slug, s.company);
      else if (s.ats === 'ashby') jobs = await fetchAshbyJobs(s.slug, s.company);
    } catch (e) { console.log(`  ✗ Error: ${e.message}`); }
    console.log(`  ✓ ${jobs.length} jobs`);

    for (const j of jobs) {
      allRows.push({
        company: j.company, domain: s.domain, title: j.title, url: j.url,
        location: j.location, remote: inferRemote(j.location),
        department: j.department || inferDept(j.title), seniority: inferSeniority(j.title),
        skills: extractSkills(`${j.title} ${j.description}`), salary: j.salary || extractSalary(j.description),
        datePosted: j.datePosted, description: j.description.slice(0, 5000),
        about: aboutMap[s.company] || '',
      });
    }
  }

  // Solana Ecosystem (jobs.solana.com aggregator)
  console.log('\n🌐 Solana Ecosystem (jobs.solana.com)...');
  const solanaAbout = aboutMap['Solana Foundation'] || '';
  try {
    const solJobs = await fetchSolanaEcosystemJobs();
    for (const j of solJobs) {
      allRows.push({
        company: j.company, domain: 'solana.com', title: j.title, url: j.url,
        location: j.location, remote: j.workMode === 'remote' ? 'Yes' : inferRemote(j.location),
        department: inferDept(j.title), seniority: j.seniority || inferSeniority(j.title),
        skills: j.skills || extractSkills(j.title), salary: j.salary,
        datePosted: j.datePosted, description: j.description,
        about: solanaAbout,
      });
    }
  } catch (e) { console.log(`  ✗ Error: ${e.message}`); }

  // Coinbase — Greenhouse board 'coinbase' exists but listing API is disabled.
  // All known job IDs return 404 (post-layoff board closure). Skipping.
  console.log('\n🏢 Coinbase...');
  console.log('  ⚠ Greenhouse board "coinbase" listing API disabled (confidential board).');
  console.log('  ⚠ All known position IDs return 404 post-workforce reduction. Skipped.');

  // ── 404 Validation Pass ──
  console.log('\n🔗 Validating job URLs (filtering out 404s)...');
  const BATCH = 20; // concurrent checks
  let verified = 0, removed = 0;
  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (row) => {
      if (!row.url) return false;
      try {
        const r = await fetch(row.url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
        });
        // Accept 200, 301, 302, 303, 307, 308 — reject 404, 410
        return r.status < 400;
      } catch {
        return true; // keep on timeout/network error (assume alive)
      }
    }));
    for (let j = 0; j < batch.length; j++) {
      if (results[j]) verified++;
      else { removed++; batch[j]._remove = true; }
    }
    process.stdout.write(`\r  Checked ${Math.min(i + BATCH, allRows.length)}/${allRows.length}...`);
  }
  const validRows = allRows.filter(r => !r._remove);
  console.log(`\r  ✓ ${verified} verified, ${removed} removed (404/410)                `);

  // Build CSV
  const HEADER = 'Company,Company Domain,Job Title,Job URL,Location,Remote,Department,Seniority,Skills,Salary,Date Posted,Description,Company About';
  const rows = validRows.map(r => [
    esc(r.company),esc(r.domain),esc(r.title),esc(r.url),esc(r.location),esc(r.remote),
    esc(r.department),esc(r.seniority),esc(r.skills),esc(r.salary),esc(r.datePosted),
    esc(r.description),esc(r.about),
  ].join(','));

  writeFileSync(OUTPUT, HEADER + '\n' + rows.join('\n') + '\n', 'utf8');

  console.log('\n' + '━'.repeat(50));
  console.log(`✅ ${validRows.length} verified jobs → ${OUTPUT}`);
  const byCompany = {};
  for (const r of validRows) byCompany[r.company] = (byCompany[r.company]||0)+1;
  Object.entries(byCompany).sort((a,b)=>b[1]-a[1]).forEach(([c,n]) => console.log(`   ${c}: ${n}`));
}

main().catch(console.error);
