#!/usr/bin/env node

/**
 * High-concurrency glossary fact-checker.
 * Runs 20 concurrent API calls for speed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GLOSSARY_DIR = path.join(__dirname, '..', 'content', 'glossary');
const PROGRESS_FILE = path.join(__dirname, '..', 'glossary-factcheck-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

const CONCURRENCY = 20;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

const SYSTEM_PROMPT = `You are a strict fact-checker for Web3/blockchain glossary content. Your job:

1. REMOVE any statistic that cannot be independently verified. This includes:
   - "According to [source], X% of..." — unless it's a well-known, easily verifiable fact
   - Dollar amounts like "$X billion" unless from a widely reported, verifiable event
   - Percentage claims, future projections
   
2. REPLACE removed stats with factual statements or remove the sentence.
3. REMOVE all em dashes (—), replace with commas/periods.
4. REMOVE AI slop: "landscape", "realm", "paradigm", "unleash", "embark", "game-changing", "cutting-edge", "dive into", "tapestry", "robust", "leveraging", "harness"
5. REMOVE fluff sentences that add no information.
6. KEEP all technical definitions, mechanism explanations, and well-established facts.
7. Keep the same markdown structure. Do NOT add new sections.
8. Be concise. Every sentence must teach something specific.

Return ONLY the cleaned markdown content (after frontmatter). Do not return frontmatter.`;

async function callOpenAI(content, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Fact-check and clean:\n\n${content}` }
          ],
          max_tokens: 4000,
          temperature: 0.2,
        }),
      });
      if (response.status === 429) { await sleep(2000 + Math.random() * 2000); continue; }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      if (attempt < retries - 1) { await sleep(1000); continue; }
      throw err;
    }
  }
}

async function processFile(fileName, index, total) {
  if (progress[fileName]) return 'skip';

  const filePath = path.join(GLOSSARY_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = raw.match(/^(---\n[\s\S]*?\n---)\n*([\s\S]*)$/);
  if (!fmMatch) return 'skip';

  const frontmatter = fmMatch[1];
  const bodyContent = fmMatch[2].trim();
  if (!bodyContent || bodyContent.length < 50) return 'skip';

  try {
    const cleaned = await callOpenAI(bodyContent);
    if (cleaned && cleaned.length > 30) {
      fs.writeFileSync(filePath, `${frontmatter}\n\n${cleaned}\n`, 'utf-8');
      progress[fileName] = true;
      console.log(`[${index}/${total}] ✅ ${fileName}`);
      return 'done';
    }
    return 'skip';
  } catch (err) {
    console.log(`[${index}/${total}] ❌ ${fileName}: ${err.message}`);
    return 'error';
  }
}

async function main() {
  const files = fs.readdirSync(GLOSSARY_DIR).filter(f => f.endsWith('.md')).sort();
  const pending = files.filter(f => !progress[f]);
  console.log(`Fact-checking ${pending.length} remaining glossary terms (${Object.keys(progress).length} already done)...\n`);

  let done = 0, errors = 0;
  const startTime = Date.now();

  // Process in batches of CONCURRENCY
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((f, j) => processFile(f, i + j + 1, pending.length))
    );
    results.forEach(r => { if (r === 'done') done++; if (r === 'error') errors++; });
    
    // Save progress after each batch
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE === Checked: ${done}, Errors: ${errors}, Time: ${elapsed}m`);
}

main().catch(console.error);
