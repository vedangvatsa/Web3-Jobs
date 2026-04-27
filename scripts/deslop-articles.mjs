#!/usr/bin/env node

/**
 * Strip AI slop from articles using GPT-4o-mini.
 * Targets: filler words, fluff sentences, hallucinated stats.
 * High concurrency (20 parallel).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const PROGRESS_FILE = path.join(__dirname, '..', 'article-deslop-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

const CONCURRENCY = 20;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

const SYSTEM_PROMPT = `You are an editor removing AI-generated filler from web articles. Rules:

REPLACE these overused words/phrases with specific, direct alternatives:
- "landscape" → use "market", "industry", "sector", or "field" where appropriate
- "leveraging/leverage" → use "using", "applying", "with"
- "robust" → use "strong", "reliable", "thorough", or just remove it
- "foster" → use "build", "support", "encourage", "grow"
- "embrace" → use "adopt", "use", "apply", "accept"
- "comprehensive" → use "complete", "full", "detailed", or remove it
- "navigate" → use "manage", "handle", "work through", or "understand"
- "empower" → use "enable", "help", "allow"
- "seamless" → use "smooth", "easy", "simple", or remove it
- "realm" → use "area", "field", "domain"
- "delve" → use "explore", "examine", "look at"
- "paradigm" → use "model", "approach", "shift"
- "pivotal" → use "important", "key", "critical"
- "unprecedented" → use "rare", "unusual", "new", or remove it
- "revolutionize" → use "transform", "change", "reshape"
- "cutting-edge" → use "advanced", "modern", "new"
- "harness" → use "use", "apply", "capture"
- "unlock" → use "enable", "create", "open"
- "game-changing" → use "significant", "important", or remove it

ALSO:
- Remove fluff sentences that state the obvious or add no information
- Remove "According to [source]" + unverifiable stats
- Keep all factual technical content intact
- Do NOT change the structure, headings, or links
- Do NOT add new content
- Keep the exact same markdown format

Return ONLY the cleaned content after the frontmatter. Do not return frontmatter.`;

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
            { role: 'user', content: `Clean this article:\n\n${content}` }
          ],
          max_tokens: 8000,
          temperature: 0.15,
        }),
      });
      if (response.status === 429) { await sleep(3000 + Math.random() * 3000); continue; }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      if (attempt < retries - 1) { await sleep(2000); continue; }
      throw err;
    }
  }
}

// Only process articles that actually contain slop
function hasSlop(content) {
  const slopWords = /\b(landscape|leverag|robust|foster|embrace|comprehensive|navigate|empower|seamless|realm|delve|paradigm|pivotal|unprecedented|revolutioniz|cutting-edge|harness|unlock|game-chang)\b/gi;
  return slopWords.test(content);
}

async function processFile(fileName, index, total) {
  if (progress[fileName]) return 'skip';

  const filePath = path.join(ARTICLES_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = raw.match(/^(---\n[\s\S]*?\n---)\n*([\s\S]*)$/);
  if (!fmMatch) return 'skip';

  const frontmatter = fmMatch[1];
  const bodyContent = fmMatch[2].trim();
  if (!bodyContent || bodyContent.length < 100) return 'skip';
  if (!hasSlop(bodyContent)) {
    progress[fileName] = true;
    return 'clean';
  }

  try {
    const cleaned = await callOpenAI(bodyContent);
    if (cleaned && cleaned.length > 50) {
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
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).sort();
  const pending = files.filter(f => !progress[f]);
  console.log(`De-slopping ${pending.length} articles (${Object.keys(progress).length} already done)...\n`);

  let done = 0, clean = 0, errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((f, j) => processFile(f, i + j + 1, pending.length))
    );
    results.forEach(r => { if (r === 'done') done++; if (r === 'clean') clean++; if (r === 'error') errors++; });
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    
    const pct = ((i + batch.length) / pending.length * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
    if ((i + CONCURRENCY) % 100 === 0) {
      console.log(`--- Progress: ${pct}% | Done: ${done} | Clean: ${clean} | Errors: ${errors} | Time: ${elapsed}m ---`);
    }
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE === Cleaned: ${done}, Already clean: ${clean}, Errors: ${errors}, Time: ${elapsed}m`);
}

main().catch(console.error);
