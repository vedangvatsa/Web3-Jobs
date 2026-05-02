import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/vedang/PDFtoWebsite/.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('No GEMINI_API_KEY'); process.exit(1); }

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 12) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length >= 12) rows.push(cur);
  return rows;
}

const SYSTEM_PROMPT = `You are a job data classifier. Given a job title and description, extract exactly two fields:

SKILLS: List up to 6 specific, concrete skills from these categories. Only include skills clearly mentioned or required:
- Tech: Python, JavaScript, TypeScript, Java, Golang, Rust, C++, Solidity, React, Node.js, Next.js, Vue.js, Angular, GraphQL, PostgreSQL, MySQL, MongoDB, Redis, Kafka, AWS, GCP, Azure, Docker, Kubernetes, Terraform, SQL, Git, Linux, TensorFlow, PyTorch, CI/CD
- Blockchain: Ethereum, Solana, DeFi, NFT, Smart Contracts, Hardhat, Foundry, IPFS, ZK Proofs, Web3.js
- Data: Snowflake, BigQuery, Airflow, dbt, Tableau, Power BI, Looker, ETL, Pandas
- Marketing: SEO, SEM, Google Ads, Google Analytics, HubSpot, Salesforce, Content Marketing, Paid Media, CRM
- Design: Figma, Adobe Suite, UI/UX Design, Motion Design, After Effects
- Finance: Financial Modeling, Excel, GAAP, IFRS, FP&A, NetSuite, QuickBooks
- Compliance: KYC, AML, GDPR, SOC 2, SOX, Risk Management
- Business: Project Management, Product Management, Account Management, B2B Sales, Customer Success

DEPARTMENT: Exactly one of: Engineering, Product, Design, Marketing, Sales, Finance, Legal, HR, Operations, Data, Security, Research, Customer Support, Business Development, Executive

Respond ONLY in this exact format (no other text):
SKILLS: skill1; skill2; skill3
DEPARTMENT: department`;

async function classify(title, desc) {
  const truncDesc = desc.slice(0, 2000); // limit tokens
  const body = {
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nJob Title: ${title}\n\nDescription: ${truncDesc}` }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 200 }
  };
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 5000));
    return classify(title, desc); // retry
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 100)}`);
  }
  
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const skillsMatch = text.match(/SKILLS:\s*(.+)/i);
  const deptMatch = text.match(/DEPARTMENT:\s*(.+)/i);
  
  return {
    skills: skillsMatch ? skillsMatch[1].trim() : '-',
    department: deptMatch ? deptMatch[1].trim() : '-',
  };
}

async function main() {
  const csvContent = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(csvContent);
  const header = rows[0];
  const data = rows.slice(1);
  
  console.log(`Total jobs: ${data.length}`);
  
  // Process in batches of 10 concurrent requests
  const BATCH_SIZE = 50;
  let processed = 0;
  let errors = 0;
  
  // Save progress periodically
  const progressFile = '/Users/vedang/web3jobs/Web3-Jobs/ai-extract-progress.json';
  let progress = {};
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    console.log(`Resuming from ${Object.keys(progress).length} cached results`);
  }
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(batch.map(async (row, idx) => {
      const url = (row[0] || '').trim();
      
      // Check cache
      if (progress[url]) return progress[url];
      
      const title = (row[3] || '').trim();
      const desc = (row[11] || '').trim();
      
      try {
        const result = await classify(title, desc);
        progress[url] = result;
        return result;
      } catch (e) {
        errors++;
        return { skills: '-', department: '-' };
      }
    }));
    
    // Apply results
    for (let j = 0; j < batch.length; j++) {
      const globalIdx = i + j;
      data[globalIdx][9] = results[j].skills;   // Skills column
      data[globalIdx][8] = results[j].department; // Department column
    }
    
    processed += batch.length;
    
    // Save progress every 50
    if (processed % 50 === 0 || processed === data.length) {
      fs.writeFileSync(progressFile, JSON.stringify(progress));
      process.stdout.write(`\r  ${processed}/${data.length} (${(processed/data.length*100).toFixed(1)}%) | errors: ${errors}`);
    }
    
    // Rate limit: 10 req/s for free tier
    if (i + BATCH_SIZE < data.length) await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n\nWriting CSV...');
  
  const esc = v => { const s = String(v||'-'); if (s.includes(',') || s.includes('"')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', out.join('\n'));
  fs.writeFileSync('/Users/vedang/Desktop/jobs-extracted.csv', out.join('\n'));
  
  console.log(`Done! ${processed} jobs classified, ${errors} errors`);
  
  // Quick audit
  const depts = {};
  for (const r of data) { const d = (r[8]||'').trim(); depts[d] = (depts[d]||0)+1; }
  console.log('\nDepartment distribution:');
  Object.entries(depts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v.toString().padStart(5)} | ${k}`));
}

main().catch(e => { console.error(e); process.exit(1); });
