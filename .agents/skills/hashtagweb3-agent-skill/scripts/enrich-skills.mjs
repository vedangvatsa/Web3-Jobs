import fs from 'fs';

const OPENAI_KEY = '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';
const CONCURRENCY = 10;

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i+1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { cur.push(field); field = ''; }
      else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) {
        cur.push(field); field = '';
        if (cur.length >= 14) rows.push(cur);
        cur = [];
        if (ch === '\r') i++;
      } else field += ch;
    }
  }
  if (cur.length >= 14) rows.push(cur);
  return rows;
}

async function extractSkills(title, company, description) {
  const prompt = `Extract technical skills from this job posting. Return ONLY a semicolon-separated list of up to 10 technical skills (programming languages, frameworks, tools, platforms). NO soft skills. If no technical skills found, return "-".

Job: ${title} at ${company}

Description:
${description.slice(0, 2000)}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 429) return '__QUOTA__';
      console.error(`  API error ${res.status}: ${err.slice(0, 100)}`);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch(e) {
    console.error(`  Fetch error: ${e.message}`);
    return null;
  }
}

async function main() {
  const content = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find jobs with description but no skills
  // Fields: 0:URL, 1:Company, 2:CompanyURL, 3:Title, 4:Description, 5:Skills, ...
  const toEnrich = [];
  for (let i = 0; i < data.length; i++) {
    const desc = (data[i][4]||'').trim();
    const skills = (data[i][5]||'').trim();
    if (desc.length >= 100 && (!skills || skills === '-')) {
      toEnrich.push(i);
    }
  }
  
  console.log(`Found ${toEnrich.length} jobs with descriptions but no skills`);
  
  // Also find jobs missing other fields that we can fill
  let missingDept = 0, missingLevel = 0, missingType = 0;
  for (const idx of toEnrich) {
    if (!(data[idx][10]||'').trim() || data[idx][10] === '-') missingDept++;
    if (!(data[idx][9]||'').trim() || data[idx][9] === '-') missingLevel++;
    if (!(data[idx][8]||'').trim() || data[idx][8] === '-') missingType++;
  }
  console.log(`  Also missing: ${missingDept} dept, ${missingLevel} level, ${missingType} type`);
  console.log('');
  
  // Process in batches
  let done = 0, success = 0, failed = 0, quota = false;
  
  for (let i = 0; i < toEnrich.length; i += CONCURRENCY) {
    if (quota) break;
    const batch = toEnrich.slice(i, i + CONCURRENCY);
    
    await Promise.all(batch.map(async (rowIdx) => {
      const row = data[rowIdx];
      const result = await extractSkills(row[3], row[1], row[4]);
      done++;
      
      if (result === '__QUOTA__') {
        quota = true;
        failed++;
        return;
      }
      
      if (result && result !== '-' && result.length > 2) {
        row[5] = result;
        success++;
      } else {
        failed++;
      }
    }));
    
    process.stdout.write(`\r  ${done}/${toEnrich.length} — ✓${success} ✗${failed}`);
    
    if (quota) {
      console.log('\n\n⚠️  OpenAI quota exceeded. Falling back to keyword extraction...');
      break;
    }
  }
  
  console.log('\n');
  
  // If quota hit, use keyword-based extraction for remaining
  if (quota || failed > success) {
    console.log('Using keyword-based skill extraction as fallback...');
    const SKILL_KEYWORDS = [
      'Python','JavaScript','TypeScript','Java','Go','Rust','C++','C#','Ruby','PHP','Scala','Kotlin','Swift',
      'Solidity','Vyper','Move','Cairo',
      'SQL','NoSQL','GraphQL','HTML','CSS',
      'React','Next.js','Vue','Angular','Svelte','Node.js','Express','Django','Flask','FastAPI','Spring Boot',
      'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','DynamoDB','Snowflake','BigQuery',
      'AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD','Linux','Git',
      'Machine Learning','Deep Learning','NLP','TensorFlow','PyTorch',
      'Blockchain','Ethereum','DeFi','Web3','Smart Contracts','NFT',
      'Hardhat','Foundry','Solana','Polygon','Arbitrum','Optimism',
      'Figma','Sketch',
      'Agile','Scrum','Jira',
      'iOS','Android','React Native','Flutter',
      'Kafka','RabbitMQ','Airflow','Spark','Hadoop',
      'REST','gRPC','WebSocket','Microservices','Serverless',
      'KYC','AML','SOC 2',
      'Tableau','Power BI','Looker','dbt',
    ];
    
    let kwFixed = 0;
    for (const rowIdx of toEnrich) {
      const row = data[rowIdx];
      const skills = (row[5]||'').trim();
      if (skills && skills !== '-') continue; // Already filled by AI
      
      const desc = (row[4]||'').toLowerCase() + ' ' + (row[3]||'').toLowerCase();
      const found = SKILL_KEYWORDS.filter(skill => {
        const re = new RegExp('\\b' + skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+') + '\\b', 'i');
        return re.test(desc);
      });
      
      if (found.length > 0) {
        row[5] = found.slice(0, 10).join('; ');
        kwFixed++;
      }
    }
    console.log(`  Keyword extraction fixed: ${kwFixed}`);
  }
  
  // Write back
  const esc = v => {
    const s = String(v||'');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', out.join('\n'));
  
  // Final audit
  const finalSkills = data.filter(r => (r[5]||'').trim() && r[5] !== '-').length;
  const finalDesc = data.filter(r => (r[4]||'').trim().length >= 100).length;
  console.log(`\n✅ Updated jobs-extracted.csv`);
  console.log(`   Description: ${finalDesc}/${data.length} (${(finalDesc/data.length*100).toFixed(1)}%)`);
  console.log(`   Skills: ${finalSkills}/${data.length} (${(finalSkills/data.length*100).toFixed(1)}%)`);
}

main().catch(e => { console.error(e); process.exit(1); });
