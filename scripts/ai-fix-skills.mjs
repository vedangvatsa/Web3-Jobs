import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/vedang/PDFtoWebsite/.env.local' });

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

const PROMPT = `Extract 3-6 specific technical skills/tools from this job posting. 

Rules:
- Return ONLY a semicolon-separated list of skills, nothing else
- Include specific tools, languages, frameworks, platforms, methodologies
- Examples of GOOD skills: Python, AWS, Kubernetes, SQL, Salesforce, Figma, Excel, KYC, AML, SEO, React, Solidity, DeFi, Financial Modeling, Risk Management
- Do NOT include generic terms like "communication", "teamwork", "leadership"
- Do NOT include "DEPARTMENT:" or any labels
- If the job truly has no specific skills, respond with just: -
- Minimum 3 skills, maximum 6

Job Title: TITLE
Description: DESC`;

async function classify(title, desc) {
  const prompt = PROMPT.replace('TITLE', title).replace('DESC', desc.slice(0, 2500));
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 150 }
  };
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      let text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      
      // Clean: remove DEPARTMENT, SKILLS: prefix, trailing semicolons
      text = text.replace(/DEPARTMENT:.*$/i, '').replace(/^SKILLS:\s*/i, '').replace(/;\s*$/, '').trim();
      
      if (!text || text === '-') return '-';
      return text;
    } catch (e) {
      if (attempt === 2) return null; // give up
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function main() {
  const csvContent = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(csvContent);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find bad rows: DEPARTMENT in skills, or <=1 skill
  const needsFix = [];
  for (let i = 0; i < data.length; i++) {
    const skills = (data[i][9] || '').trim();
    const hasDept = /DEPARTMENT/i.test(skills);
    const count = skills.split(';').map(x => x.trim()).filter(x => x && x !== '-').length;
    if (hasDept || count <= 1) needsFix.push(i);
  }
  
  console.log(`Need to fix: ${needsFix.length} rows`);
  
  const BATCH = 50;
  let done = 0, errors = 0;
  
  for (let b = 0; b < needsFix.length; b += BATCH) {
    const batch = needsFix.slice(b, b + BATCH);
    
    const results = await Promise.all(batch.map(async idx => {
      const row = data[idx];
      const result = await classify(row[3], row[11]);
      return { idx, result };
    }));
    
    for (const { idx, result } of results) {
      if (result && result !== '-') {
        data[idx][9] = result;
      } else if (result === null) {
        errors++;
      }
    }
    
    done += batch.length;
    process.stdout.write(`\r  ${done}/${needsFix.length} (${(done/needsFix.length*100).toFixed(1)}%) | errors: ${errors}`);
    
    if (b + BATCH < needsFix.length) await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n\nWriting...');
  const esc = v => { const s = String(v||'-'); if (s.includes(',') || s.includes('"')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', out.join('\n'));
  fs.writeFileSync('/Users/vedang/Desktop/jobs-extracted.csv', out.join('\n'));
  
  // Audit
  let one = 0, two = 0, three = 0;
  for (const r of data) {
    const c = (r[9]||'').split(';').map(x=>x.trim()).filter(x=>x&&x!=='-').length;
    if (c <= 1) one++;
    else if (c === 2) two++;
    else three++;
  }
  console.log(`\n1 skill: ${one} | 2 skills: ${two} | 3+ skills: ${three}`);
}

main().catch(e => { console.error(e); process.exit(1); });
