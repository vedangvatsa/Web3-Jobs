#!/usr/bin/env node

/**
 * Fact-check glossary terms. Strips hallucinated stats, em dashes, AI slop.
 * Uses GPT-4o-mini with strict instructions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GLOSSARY_DIR = path.join(__dirname, '..', 'content', 'glossary');
const PROGRESS_FILE = path.join(__dirname, '..', 'glossary-factcheck-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Load progress
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

const SYSTEM_PROMPT = `You are a strict fact-checker for Web3/blockchain glossary content. Your job:

1. REMOVE any statistic that cannot be independently verified from a primary source. This includes:
   - "According to [source], X% of..." — unless it's a well-known, easily verifiable fact
   - Dollar amounts like "$X billion" unless from a widely reported, verifiable event
   - Percentage claims like "60% fewer" or "87% growth rate"
   - Future projections ("projected to reach $X by 2030")
   
2. REPLACE removed stats with factual, verifiable statements or remove the sentence entirely.

3. REMOVE all em dashes (—) and replace with commas, periods, or restructured sentences.

4. REMOVE AI slop words: "landscape", "realm", "paradigm", "unleash", "embark", "game-changing", "cutting-edge", "dive into", "tapestry"

5. REMOVE fluff sentences that add no information (e.g., "This is an exciting development")

6. KEEP all technical definitions, mechanism explanations, and well-established facts.

7. Keep the same markdown structure (headings, bold, lists). Do NOT add new sections.

8. Be concise. Every sentence must teach something specific.

Return ONLY the cleaned markdown content (everything after the frontmatter --- block). Do not return frontmatter.`;

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
            { role: 'user', content: `Fact-check and clean this glossary entry:\n\n${content}` }
          ],
          max_tokens: 4000,
          temperature: 0.2,
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
  const files = fs.readdirSync(GLOSSARY_DIR).filter(f => f.endsWith('.md')).sort();
  console.log(`Fact-checking ${files.length} glossary terms...\n`);

  let checked = 0, skipped = 0, errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    if (progress[fileName]) {
      skipped++;
      continue;
    }

    const filePath = path.join(GLOSSARY_DIR, fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');

    // Split frontmatter and content
    const fmMatch = raw.match(/^(---\n[\s\S]*?\n---)\n*([\s\S]*)$/);
    if (!fmMatch) { skipped++; continue; }

    const frontmatter = fmMatch[1];
    const bodyContent = fmMatch[2].trim();

    if (!bodyContent || bodyContent.length < 50) { skipped++; continue; }

    try {
      const cleaned = await callOpenAI(bodyContent);
      if (cleaned && cleaned.length > 30) {
        fs.writeFileSync(filePath, `${frontmatter}\n\n${cleaned}\n`, 'utf-8');
        checked++;
        progress[fileName] = true;
      }
      console.log(`[FC ${i+1}/${files.length} ${((i+1)/files.length*100).toFixed(1)}%] ✅ ${fileName}`);
    } catch (err) {
      console.log(`[FC ${i+1}/${files.length}] ❌ ${fileName}: ${err.message}`);
      errors++;
    }

    // Save progress every 10
    if (checked % 10 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    }
  }

  // Final save
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== GLOSSARY FACT-CHECK DONE === Checked: ${checked}, Skipped: ${skipped}, Errors: ${errors}, Time: ${elapsed}m`);
}

main().catch(console.error);
