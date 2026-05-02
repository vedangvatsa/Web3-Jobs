import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'LOCAL_PATH/.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
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

// Whitelist for filtering AI output
const VALID = new Set([
  'Python','JavaScript','TypeScript','Java','Golang','Go','Rust','C++','C#','Ruby','Scala','Kotlin',
  'Swift','Solidity','Vyper','PHP','SQL','NoSQL','HTML','CSS','R',
  'React','React Native','Next.js','Vue.js','Angular','Svelte','Redux',
  'Node.js','Django','Flask','FastAPI','Spring Boot','Express.js','GraphQL','gRPC','REST API','Microservices',
  'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','DynamoDB','Cassandra','ClickHouse','Firebase','Supabase',
  'Kafka','RabbitMQ','Spark','Apache Spark','Airflow','dbt','Snowflake','BigQuery','Redshift','Databricks','ETL','Hadoop','Flink',
  'AWS','GCP','Google Cloud','Azure','Docker','Kubernetes','Terraform','Ansible','Linux','Nginx','CI/CD','Helm','Vault',
  'Machine Learning','Deep Learning','NLP','TensorFlow','PyTorch','LLM','GPT','OpenAI','LangChain','Computer Vision','MLOps','RAG','Generative AI','Neural Networks',
  'Ethereum','Solana','Polygon','Arbitrum','Cosmos','Substrate','Polkadot','Avalanche',
  'Hardhat','Foundry','Truffle','Web3.js','Ethers.js','IPFS','Chainlink','TheGraph',
  'DeFi','NFT','NFTs','Smart Contracts','EVM','ZK Proofs','MEV','Web3','Staking','Tokenomics','Layer 2','Rollups',
  'Prometheus','Grafana','Datadog','Splunk','Sentry','New Relic',
  'Penetration Testing','SIEM','SOC','WAF','IAM','OAuth','Threat Modeling','Incident Response','OWASP',
  'iOS','Android','Flutter','SwiftUI','Objective-C',
  'Figma','Sketch','Adobe Creative Suite','After Effects','Cinema 4D','UI/UX Design','UX Design','Motion Design','Prototyping','User Research','Design Systems','Wireframing',
  'Tableau','Power BI','Looker','Amplitude','Mixpanel','Segment','Pandas','NumPy','Data Analysis','Data Visualization','A/B Testing','Google Analytics',
  'SEO','SEM','Google Ads','Facebook Ads','Content Marketing','Email Marketing','Paid Media','Growth Marketing','Performance Marketing',
  'HubSpot','Marketo','Mailchimp','Salesforce','CRM','Copywriting','Community Management','Influencer Marketing','Brand Strategy','PR',
  'Financial Modeling','Excel','GAAP','IFRS','FP&A','NetSuite','QuickBooks','SAP','Accounting','Auditing','Treasury','Forecasting','Budgeting','Financial Reporting','Tax Compliance',
  'KYC','AML','GDPR','SOC 2','SOX','Risk Management','Regulatory Compliance','Due Diligence','Contract Negotiation','Corporate Governance',
  'Workday','Greenhouse','HRIS','Talent Acquisition','Employer Branding',
  'Jira','Confluence','Asana','Linear','Product Management','Project Management','Agile','Scrum','OKRs',
  'B2B Sales','Account Management','Lead Generation','Negotiation','Pipeline Management','Customer Success',
  'Zendesk','Intercom','Technical Writing','Documentation',
  'Git','GitHub','GitLab','Postman',
  'Distributed Systems','System Design','WebSocket','API','SDK',
  'Databricks','Data Engineering','Data Modeling',
]);

const validLower = new Map();
for (const s of VALID) validLower.set(s.toLowerCase(), s);

const PROMPT = `List exactly 5 specific skills/tools required for this job. Pick from this list ONLY:

Python, JavaScript, TypeScript, Java, Golang, Rust, C++, Solidity, Kotlin, Ruby, Scala, SQL, React, Node.js, Next.js, Vue.js, Angular, GraphQL, PostgreSQL, MySQL, MongoDB, Redis, Kafka, AWS, GCP, Azure, Docker, Kubernetes, Terraform, Linux, CI/CD, Git, Machine Learning, LLM, NLP, PyTorch, TensorFlow, Ethereum, Solana, DeFi, NFT, Smart Contracts, Web3, EVM, IPFS, ZK Proofs, Hardhat, Foundry, SEO, SEM, Google Ads, Google Analytics, HubSpot, Salesforce, CRM, Content Marketing, Email Marketing, Paid Media, Figma, Adobe Creative Suite, UI/UX Design, After Effects, Motion Design, Financial Modeling, Excel, GAAP, IFRS, FP&A, NetSuite, Accounting, Auditing, Treasury, Forecasting, KYC, AML, GDPR, SOC 2, Risk Management, Regulatory Compliance, Due Diligence, Product Management, Project Management, Account Management, Customer Success, B2B Sales, Negotiation, Lead Generation, Tableau, Looker, Power BI, A/B Testing, Data Analysis, Databricks, Snowflake, BigQuery, ETL, Datadog, Prometheus, iOS, Android, Flutter, Workday, Jira, Technical Writing, Community Management, Distributed Systems

Respond with ONLY 5 skills separated by semicolons. Nothing else.

Job: TITLE
Description: DESC`;

async function classify(title, desc) {
  const prompt = PROMPT.replace('TITLE', title).replace('DESC', desc.slice(0, 2000));
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 100 }
  };
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
      });
      if (res.status === 429) { await new Promise(r => setTimeout(r, 3000 * (attempt + 1))); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      // Filter through whitelist
      const skills = text.split(';').map(s => s.trim()).map(s => validLower.get(s.toLowerCase())).filter(Boolean);
      return [...new Set(skills)];
    } catch (e) {
      if (attempt === 2) return null;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function main() {
  const rows = parseCSV(fs.readFileSync('LOCAL_PATH/jobs-extracted.csv', 'utf8'));
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find rows with <3 skills
  const thin = [];
  for (let i = 0; i < data.length; i++) {
    const count = (data[i][9]||'').split(';').map(s=>s.trim()).filter(s=>s&&s!=='-').length;
    if (count < 3) thin.push(i);
  }
  console.log(`Thin rows (<3 skills): ${thin.length}`);
  
  const BATCH = 50;
  let done = 0, errors = 0;
  
  for (let b = 0; b < thin.length; b += BATCH) {
    const batch = thin.slice(b, b + BATCH);
    const results = await Promise.all(batch.map(async idx => {
      const row = data[idx];
      const existing = (row[9]||'').split(';').map(s=>s.trim()).filter(s=>s&&s!=='-');
      const aiSkills = await classify(row[3], row[11]);
      if (!aiSkills) { errors++; return { idx, skills: null }; }
      const merged = [...new Set([...existing, ...aiSkills])].slice(0, 8);
      return { idx, skills: merged };
    }));
    
    for (const { idx, skills } of results) {
      if (skills && skills.length > 0) data[idx][9] = skills.join('; ');
    }
    
    done += batch.length;
    process.stdout.write(`\r  ${done}/${thin.length} (${(done/thin.length*100).toFixed(1)}%) | errors: ${errors}`);
    if (b + BATCH < thin.length) await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n\nWriting...');
  const esc = v => { const s = String(v||'-'); if (s.includes(',') || s.includes('"')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', out.join('\n'));
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', out.join('\n'));
  
  let one=0,two=0,three=0,four=0,five=0;
  for (const r of data) {
    const c = (r[9]||'').split(';').length;
    if (c<=1) one++; else if (c===2) two++; else if (c===3) three++; else if (c===4) four++; else five++;
  }
  console.log('1:', one, '| 2:', two, '| 3:', three, '| 4:', four, '| 5+:', five);
}

main().catch(e => { console.error(e); process.exit(1); });
