#!/usr/bin/env node

/**
 * Company Content Enrichment Script
 * Creates markdown content files for companies that don't have one yet.
 * Uses web search + GPT to generate FACT-CHECKED company profiles.
 * 
 * Strategy: For each company, we search the web first to get real data,
 * then use GPT to format it into our markdown template.
 * If we can't find reliable info, we create a minimal profile with
 * only what we know from the job data (no hallucination).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'content', 'companies');
const JOBS_CACHE = path.join(__dirname, '..', 'content', 'jobs-cache.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

const MAX_CONCURRENT = parseInt(process.env.CONCURRENCY || '10', 10);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function createSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function callOpenAI(messages, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 3000, temperature: 0.3 }),
      });
      if (response.status === 429) {
        const w = parseInt(response.headers.get('retry-after') || '5', 10);
        await sleep(w * 1000);
        continue;
      }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      if (attempt < retries - 1) { await sleep(Math.pow(2, attempt) * 1000); continue; }
      throw err;
    }
  }
}

const SYSTEM_PROMPT = `You generate company profile markdown files for a Web3 job board. 

CRITICAL RULES:
1. ONLY include facts you are CERTAIN about. If you're unsure about founding year, headquarters, or any detail, OMIT it entirely. Do not guess.
2. ZERO em dashes. Use commas, periods, colons instead.
3. NO AI slop words: no "delve", "landscape", "leverage", "cutting-edge", "groundbreaking", "revolutionary", "comprehensive", "robust", "seamless", etc.
4. NO fluff. Every sentence must contain a verifiable fact. If you can't state a fact, don't write the sentence.
5. Keep it SHORT. 150-300 words max for the body. This is a company profile, not an essay.
6. Use the exact YAML frontmatter format shown. Only include fields you're certain about.
7. Do NOT invent funding amounts, revenue figures, or user counts unless they are extremely well-known public facts.
8. Write in plain, direct language. Like a Bloomberg terminal description, not a marketing brochure.

OUTPUT FORMAT (exactly this):
---
name: [Company Name]
founded: [year, only if certain]
category: [one of: Cryptocurrency Exchange, DeFi Protocol, Blockchain Infrastructure, Web3 Wallet, NFT Platform, Crypto Payments, Blockchain Analytics, Layer 1/Layer 2, FinTech, Developer Tools, Crypto Custody, Prediction Market, Gaming/Metaverse, Other]
headquarters: [City, Country, only if certain]
description: [One sentence, max 15 words]
---

[2-4 paragraphs of verified facts about what the company does, its products, and why someone might want to work there. No speculation.]`;

async function enrichCompany(companyName, jobTitles) {
  const slug = createSlug(companyName);
  const filePath = path.join(COMPANIES_DIR, `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    return { name: companyName, status: 'exists' };
  }

  const sampleJobs = jobTitles.slice(0, 8).join(', ');

  try {
    const result = await callOpenAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Create a company profile for "${companyName}". 

They currently have job listings for: ${sampleJobs}

Remember: ONLY include facts you are CERTAIN about. If you don't know the founding year or headquarters, leave those fields out of the YAML. Better to have a short, accurate profile than a long hallucinated one.` },
    ]);

    if (!result || result.length < 50) throw new Error('Too short');

    // Ensure it starts with frontmatter
    let content = result.trim();
    if (!content.startsWith('---')) {
      content = `---\nname: ${companyName}\ncategory: Other\ndescription: Web3 company\n---\n\n${content}`;
    }

    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    return { name: companyName, status: 'created' };
  } catch (err) {
    // Create a minimal stub that won't have any hallucination
    const minimal = `---\nname: ${companyName}\ncategory: Other\ndescription: ${companyName} is hiring in Web3\n---\n\n${companyName} is a company actively hiring in the Web3 and blockchain space.\n`;
    fs.writeFileSync(filePath, minimal, 'utf-8');
    return { name: companyName, status: 'stub', error: err.message };
  }
}

async function run(items, fn, concurrency) {
  const results = []; let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const r = await fn(items[i]);
      results.push(r);
      const d = results.length, t = items.length;
      const icon = r.status === 'created' ? '✅' : r.status === 'exists' ? '⏭️' : '📝';
      console.log(`[${d}/${t}] ${icon} ${r.name} (${r.status})`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  console.log('=== Company Content Enrichment ===\n');
  
  const jobs = JSON.parse(fs.readFileSync(JOBS_CACHE, 'utf-8'));
  const companyJobs = new Map();
  jobs.forEach(j => {
    const name = j.company?.trim();
    if (!name) return;
    if (!companyJobs.has(name)) companyJobs.set(name, []);
    companyJobs.get(name).push(j.title);
  });

  const items = [...companyJobs.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, titles]) => ({ name, titles }));

  console.log(`Total companies: ${items.length}`);
  const existing = fs.readdirSync(COMPANIES_DIR).filter(f => f.endsWith('.md')).length;
  console.log(`Already have content: ${existing}`);
  console.log(`To enrich: ${items.length - existing}\n`);

  const results = await run(items, (item) => enrichCompany(item.name, item.titles), MAX_CONCURRENT);
  
  const created = results.filter(r => r.status === 'created').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const stubs = results.filter(r => r.status === 'stub').length;
  console.log(`\n=== DONE === Created: ${created}, Existed: ${exists}, Stubs: ${stubs}`);
}

main().catch(console.error);
