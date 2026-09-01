import fs from 'fs';
import fetch from 'node-fetch';

const categories = [
  'engineering', 'design', 'defi', 'crypto', 'nft', 'dao', 'gaming', 'blockchain',
  'marketing', 'sales', 'product', 'finance', 'operations', 'legal', 'internship'
];

async function getFindweb3Companies() {
  const companies = new Set();
  for (const cat of categories) {
    try {
      const res = await fetch(`https://findweb3.com/jobs/${cat}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (match) {
          const data = JSON.parse(match[1]);
          const jobs = data?.props?.pageProps?.jobs || [];
          jobs.forEach(j => {
            const name = j['Company Name'] || j.organization?.name || j.company?.name;
            if (name) companies.add(name.trim());
          });
        }
      }
    } catch(e) {}
  }
  return Array.from(companies);
}

async function run() {
  console.log("Fetching findweb3 company list across categories...");
  const allFindweb3 = await getFindweb3Companies();
  console.log(`Extracted ${allFindweb3.length} companies from findweb3.`);

  const tsScript = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');

  const untracked = allFindweb3.filter(c => {
    const norm = c.toLowerCase().replace(/[^a-z0-9]/g, '');
    return !tsScript.toLowerCase().includes(norm);
  });

  console.log(`Analyzing ${untracked.length} untracked companies for website domain probes...`);

  function getCandidateDomains(name) {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const kebab = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://${clean}.io`,
      `https://${clean}.com`,
      `https://${clean}.xyz`,
      `https://${clean}.network`,
      `https://${clean}.fi`,
      `https://${clean}.org`,
      `https://${kebab}.io`,
      `https://${kebab}.com`,
      `https://${kebab}.xyz`,
    ];
  }

  const discoveredAtsFromWebsites = [];

  const atsRegexes = [
    { type: 'ashby', regex: /jobs\.ashbyhq\.com\/([a-zA-Z0-9_-]+)/i },
    { type: 'gh', regex: /boards\.greenhouse\.io\/([a-zA-Z0-9_-]+)/i },
    { type: 'lever', regex: /jobs\.lever\.co\/([a-zA-Z0-9_-]+)/i },
    { type: 'workable', regex: /apply\.workable\.com\/([a-zA-Z0-9_-]+)/i },
    { type: 'recruitee', regex: /([a-zA-Z0-9_-]+)\.recruitee\.com/i },
    { type: 'bamboolink', regex: /([a-zA-Z0-9_-]+)\.bamboohr\.com\/careers/i },
    { type: 'smartrecruiters', regex: /jobs\.smartrecruiters\.com\/([a-zA-Z0-9_-]+)/i },
    { type: 'teamtailor', regex: /career\.([a-zA-Z0-9_-]+)\.com/i },
    { type: 'rippling', regex: /ats\.rippling\.com\/([a-zA-Z0-9_-]+)/i },
  ];

  async function probeWebsite(company) {
    const domains = getCandidateDomains(company);
    for (const domain of domains) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(domain, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
          signal: controller.signal,
          redirect: 'follow'
        });
        clearTimeout(timeout);

        if (res.ok) {
          const text = await res.text();
          for (const { type, regex } of atsRegexes) {
            const match = text.match(regex);
            if (match && match[1]) {
              const board = match[1];
              if (!['widget', 'embed', 'api', 'js', 'assets', 'static', 'cdn'].includes(board.toLowerCase())) {
                console.log(`[DISCOVERED VIA WEBSITE] ${type}:${board} for ${company} on ${domain}`);
                discoveredAtsFromWebsites.push({ company, type, board, domain });
                return;
              }
            }
          }

          if (text.includes('/careers') || text.includes('/jobs') || text.toLowerCase().includes('join our team')) {
            try {
              const cController = new AbortController();
              const cTimeout = setTimeout(() => cController.abort(), 3500);
              const cRes = await fetch(`${domain.replace(/\/$/, '')}/careers`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
                signal: cController.signal,
                redirect: 'follow'
              });
              clearTimeout(cTimeout);
              if (cRes.ok) {
                const cText = await cRes.text();
                for (const { type, regex } of atsRegexes) {
                  const match = cText.match(regex);
                  if (match && match[1]) {
                    const board = match[1];
                    if (!['widget', 'embed', 'api', 'js', 'assets', 'static', 'cdn'].includes(board.toLowerCase())) {
                      console.log(`[DISCOVERED VIA WEBSITE /CAREERS] ${type}:${board} for ${company} on ${domain}/careers`);
                      discoveredAtsFromWebsites.push({ company, type, board, domain: `${domain}/careers` });
                      return;
                    }
                  }
                }
              }
            } catch (e) {}
          }
          return;
        }
      } catch (err) {}
    }
  }

  const batchSize = 10;
  for (let i = 0; i < untracked.length; i += batchSize) {
    const batch = untracked.slice(i, i + batchSize);
    console.log(`Probing website batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(untracked.length / batchSize)}...`);
    await Promise.all(batch.map(probeWebsite));
  }

  console.log("\n=== ALL DISCOVERED ATS ENDPOINTS FROM WEBSITES ===");
  console.log(JSON.stringify(discoveredAtsFromWebsites, null, 2));
}

run();
