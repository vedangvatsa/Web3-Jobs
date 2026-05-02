import fs from 'fs';
import puppeteer from 'puppeteer';

const TIMEOUT = 20000;
const PARALLEL_PAGES = 5;

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 14) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length >= 14) rows.push(cur);
  return rows;
}

async function scrapeWithBrowser(browser, url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: TIMEOUT });
    
    // Wait a bit for JS to render
    await new Promise(r => setTimeout(r, 2000));
    
    // Try to extract job description using various selectors
    const description = await page.evaluate(() => {
      // Common JD containers across ATS platforms
      const selectors = [
        // Lever
        '[data-qa="job-description"]',
        '.posting-page .content',
        // Greenhouse  
        '#content .body',
        '.job-description',
        '#job-description',
        // Workday
        '[data-automation-id="jobPostingDescription"]',
        '.job-posting-description',
        // Revolut
        '.job-details__description',
        '[class*="JobDescription"]',
        '[class*="job-description"]',
        '[class*="jobDescription"]',
        // Ashby
        '[class*="ashby-job-posting"]',
        // Generic
        'article',
        'main [class*="description"]',
        'main [class*="content"]',
        '[role="main"]',
        'main',
      ];
      
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.innerText.trim();
          // Must be substantial and not just nav
          if (text.length > 100 && text.split('\n').filter(l => l.trim().length > 40).length > 3) {
            return text;
          }
        }
      }
      
      // Fallback: try JSON-LD
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        try {
          const j = JSON.parse(s.textContent);
          if (j.description && j.description.length > 100) return j.description;
        } catch(e) {}
      }
      
      return '';
    });
    
    await page.close();
    return description;
  } catch(e) {
    await page.close().catch(() => {});
    return '';
  }
}

async function main() {
  const content = fs.readFileSync('LOCAL_PATH/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find jobs missing descriptions
  const toScrape = [];
  for (let i = 0; i < data.length; i++) {
    const desc = (data[i][4]||'').trim();
    if (!desc || desc === '-' || desc.length < 100) {
      toScrape.push(i);
    }
  }
  console.log(`${toScrape.length} jobs need browser scraping\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  let done = 0, success = 0, failed = 0;
  
  // Process in parallel batches
  for (let i = 0; i < toScrape.length; i += PARALLEL_PAGES) {
    const batch = toScrape.slice(i, i + PARALLEL_PAGES);
    
    await Promise.all(batch.map(async (rowIdx) => {
      const row = data[rowIdx];
      const url = row[0];
      const desc = await scrapeWithBrowser(browser, url);
      done++;
      
      if (desc && desc.length > 100) {
        // Clean: remove excessive whitespace
        row[4] = desc.replace(/\n{3,}/g, '\n\n').trim();
        success++;
        console.log(`  ✓ ${row[1]} - ${row[3]} (${desc.length} chars)`);
      } else {
        failed++;
        console.log(`  ✗ ${row[1]} - ${row[3]}`);
      }
    }));
    
    process.stdout.write(`  Progress: ${done}/${toScrape.length} — ✓${success} ✗${failed}\n`);
  }
  
  await browser.close();
  
  // Also extract skills for newly described jobs using keyword matching
  const SKILL_KEYWORDS = [
    'Python','JavaScript','TypeScript','Java','Go','Rust','C++','C#','Ruby','PHP','Scala','Kotlin','Swift',
    'Solidity','Vyper','Move','Cairo','SQL','NoSQL','GraphQL',
    'React','Next.js','Vue','Angular','Node.js','Django','Flask','FastAPI','Spring Boot',
    'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','DynamoDB','Snowflake','BigQuery',
    'AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD','Linux','Git',
    'Machine Learning','Deep Learning','NLP','TensorFlow','PyTorch',
    'Blockchain','Ethereum','DeFi','Web3','Smart Contracts','Solidity',
    'Hardhat','Foundry','Solana','Polygon',
    'Kafka','Spark','Airflow','Figma','Agile','Scrum','Jira',
    'iOS','Android','React Native','Flutter',
    'REST','gRPC','Microservices','Serverless','KYC','AML',
  ];
  
  let skillsFixed = 0;
  for (const rowIdx of toScrape) {
    const row = data[rowIdx];
    const desc = (row[4]||'').trim();
    const skills = (row[5]||'').trim();
    if (desc.length >= 100 && (!skills || skills === '-')) {
      const text = desc.toLowerCase() + ' ' + (row[3]||'').toLowerCase();
      const found = SKILL_KEYWORDS.filter(s => {
        const re = new RegExp('\\b' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        return re.test(text);
      });
      if (found.length > 0) { row[5] = [...new Set(found)].slice(0, 10).join('; '); skillsFixed++; }
    }
  }
  
  // Write back
  const esc = v => { const s = String(v||''); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', out.join('\n'));
  
  const finalDesc = data.filter(r => (r[4]||'').trim().length >= 100).length;
  const finalSkills = data.filter(r => (r[5]||'').trim() && r[5] !== '-').length;
  console.log(`\n✅ Updated jobs-extracted.csv`);
  console.log(`   Description: ${finalDesc}/${data.length} (${(finalDesc/data.length*100).toFixed(1)}%)`);
  console.log(`   Skills: ${finalSkills}/${data.length} (${(finalSkills/data.length*100).toFixed(1)}%)`);
  console.log(`   Browser scraped: ${success}, Skills filled: ${skillsFixed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
