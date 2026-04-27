#!/usr/bin/env node

/**
 * Add correct website URLs to company markdown frontmatter.
 * Uses GPT to determine the actual company website (not ATS URLs).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'content', 'companies');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callOpenAI(prompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are a factual lookup tool. Given a company name, return ONLY the company's official website URL. No explanation, no formatting, just the URL. If you are not certain, return "UNKNOWN". Examples:
- Coinbase -> https://coinbase.com
- Aave -> https://aave.com
- Chainalysis -> https://chainalysis.com
- Phantom -> https://phantom.app
Return ONLY the URL, nothing else.` },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50,
          temperature: 0,
        }),
      });
      if (response.status === 429) { await sleep(3000); continue; }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      if (attempt < retries - 1) { await sleep(1000); continue; }
      throw err;
    }
  }
}

async function main() {
  const files = fs.readdirSync(COMPANIES_DIR).filter(f => f.endsWith('.md'));
  console.log(`Processing ${files.length} company files...\n`);

  let updated = 0, skipped = 0, unknown = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(COMPANIES_DIR, files[i]);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if website already in frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const frontmatter = fmMatch[1];

    if (frontmatter.includes('website:')) {
      console.log(`[${i+1}/${files.length}] ⏭️  ${files[i]} (has website)`);
      skipped++;
      continue;
    }

    // Get company name from frontmatter
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const companyName = nameMatch ? nameMatch[1].trim() : files[i].replace('.md', '');

    try {
      const websiteUrl = await callOpenAI(companyName);

      if (!websiteUrl || websiteUrl === 'UNKNOWN' || !websiteUrl.startsWith('http')) {
        console.log(`[${i+1}/${files.length}] ❓ ${companyName}: unknown`);
        unknown++;
        continue;
      }

      // Add website to frontmatter
      const newFrontmatter = frontmatter.replace(/^(name:.+)$/m, `$1\nwebsite: ${websiteUrl}`);
      content = content.replace(fmMatch[1], newFrontmatter);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[${i+1}/${files.length}] ✅ ${companyName}: ${websiteUrl}`);
      updated++;
    } catch (err) {
      console.log(`[${i+1}/${files.length}] ❌ ${companyName}: ${err.message}`);
    }

    // Small delay to avoid rate limits
    if (i % 10 === 9) await sleep(500);
  }

  console.log(`\n=== DONE === Updated: ${updated}, Skipped: ${skipped}, Unknown: ${unknown}`);
}

main().catch(console.error);
