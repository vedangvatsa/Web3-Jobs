#!/usr/bin/env node

/**
 * Fact-Check Pass: Scans rewritten articles for specific factual claims
 * and softens or removes any that are unverifiable.
 * 
 * Strategy: Rather than trying to verify each claim externally,
 * this pass tells the model to:
 * 1. Remove any specific dollar amounts, TVL figures, or market stats
 *    that it cannot be 100% certain about
 * 2. Replace hard numbers with safer language ("significant", "substantial")
 *    or remove the claim entirely
 * 3. Keep only facts that are well-established and widely known
 * 4. Flag and soften any speculative or forward-looking claims
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const PROGRESS_FILE = path.join(__dirname, 'factcheck-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

const MAX_CONCURRENT = parseInt(process.env.CONCURRENCY || '30', 10);
const MODEL = 'gpt-4o-mini';

let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

const SYSTEM_PROMPT = `You are a fact-checker for a Web3 career website. Your job is to review article content and remove or soften ANY factual claim that could be wrong or outdated.

RULES:
1. REMOVE or REPLACE any specific dollar amounts, TVL figures, trading volumes, or market cap numbers. These go stale fast. Replace with relative language: "billions in value", "significant volume", etc. Exception: if it's a well-known historical fact (e.g., "The DAO hack lost $60M in 2016"), keep it.

2. REMOVE specific user/subscriber/holder counts unless they are extremely well-known milestones (e.g., "Bitcoin has been adopted by El Salvador").

3. REMOVE or SOFTEN any claim about a company's current status, funding, or valuation. Companies change rapidly. Replace "X raised $Y" with descriptions of what the company does.

4. KEEP well-established technical facts: how consensus works, what Solidity is, how AMMs function, etc. These don't change.

5. KEEP historical facts with correct dates: Ethereum launched in 2015, Bitcoin whitepaper in 2008, The Merge in September 2022, etc.

6. REMOVE any forward-looking predictions presented as fact. "X will reach $Y by 2027" should be removed or rephrased as opinion.

7. REMOVE any statistics about "% growth" or "X% increase" unless citing a specific, named source.

8. FIX any factual errors you notice. Common ones: wrong launch dates, wrong founder attributions, incorrect protocol descriptions.

9. PRESERVE the exact YAML frontmatter. Only modify body content.

10. PRESERVE all internal links, markdown formatting, and article structure. Make minimal changes - only touch factual claims.

11. Do NOT add new content. Do NOT rewrite the voice or style. Only fix facts.

12. ZERO em dashes (—). If you see any, replace with commas/periods/colons.

Output ONLY the corrected body content (no frontmatter).`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: content };
  return { frontmatter: `---\n${m[1]}\n---`, body: m[2].trim() };
}

function countWords(t) { return t.split(/\s+/).filter(w => w.length > 0).length; }

async function callOpenAI(messages, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: MODEL, messages, max_tokens: 8000, temperature: 0.3 }),
      });
      if (response.status === 429) {
        const w = parseInt(response.headers.get('retry-after') || '5', 10);
        console.log(`  Rate limited, waiting ${w}s...`);
        await sleep(w * 1000);
        continue;
      }
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status}: ${err.substring(0, 200)}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      if (attempt < retries - 1) {
        await sleep(Math.pow(2, attempt) * 1000 + Math.random() * 1000);
        console.log(`  Retry ${attempt + 1}: ${err.message.substring(0, 80)}`);
      } else throw err;
    }
  }
}

async function factCheckArticle(filePath) {
  const filename = path.basename(filePath);
  if (progress[filename]?.status === 'done') {
    return { filename, status: 'skipped' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (countWords(body) < 100) {
    progress[filename] = { status: 'done', reason: 'too short to check' };
    return { filename, status: 'skipped', reason: 'too short' };
  }

  try {
    const result = await callOpenAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Fact-check and correct this article body. Output ONLY the corrected body.\n\n${body}` },
    ]);

    if (!result || result.length < 100) throw new Error('Response too short');

    let cleanBody = result;
    if (cleanBody.startsWith('---')) {
      const ei = cleanBody.indexOf('---', 3);
      if (ei !== -1) cleanBody = cleanBody.substring(ei + 3).trim();
    }

    fs.writeFileSync(filePath, `${frontmatter}\n\n${cleanBody}\n`, 'utf-8');

    progress[filename] = { status: 'done', timestamp: new Date().toISOString() };
    return { filename, status: 'checked' };
  } catch (err) {
    progress[filename] = { status: 'error', error: err.message };
    return { filename, status: 'error', error: err.message };
  }
}

async function run(items, fn, concurrency) {
  const results = []; let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const r = await fn(items[i]);
      results.push(r);
      const d = results.length, t = items.length, p = ((d/t)*100).toFixed(1);
      if (r.status === 'checked') console.log(`[FC ${d}/${t} ${p}%] ✅ ${r.filename}`);
      else if (r.status === 'skipped') console.log(`[FC ${d}/${t} ${p}%] ⏭️  ${r.filename}`);
      else console.log(`[FC ${d}/${t} ${p}%] ❌ ${r.filename}: ${r.error?.substring(0,60)}`);
      if (d % 10 === 0) saveProgress();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  saveProgress();
  return results;
}

async function main() {
  console.log(`=== Fact-Check Pass (${MODEL}, ${MAX_CONCURRENT} concurrent) ===\n`);
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => path.join(ARTICLES_DIR, f)).sort();
  const done = files.filter(f => progress[path.basename(f)]?.status === 'done').length;
  console.log(`Total: ${files.length}, Already checked: ${done}, Remaining: ${files.length - done}\n`);
  const t0 = Date.now();
  const res = await run(files, factCheckArticle, MAX_CONCURRENT);
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  const checked = res.filter(r => r.status === 'checked').length;
  const skipped = res.filter(r => r.status === 'skipped').length;
  const errors = res.filter(r => r.status === 'error').length;
  console.log(`\n=== FACT-CHECK DONE === Checked: ${checked}, Skipped: ${skipped}, Errors: ${errors}, Time: ${mins}m`);
}

main().catch(console.error);
