#!/usr/bin/env node

/**
 * Gemini-powered parallel article rewriter (Worker B).
 * Processes from Z→A while OpenAI worker goes A→Z.
 * Shares progress file so they don't duplicate work.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const PROGRESS_FILE = path.join(__dirname, 'rewrite-progress.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const MAX_CONCURRENT = parseInt(process.env.CONCURRENCY || '20', 10);
const MODEL = 'gemini-2.5-flash';

let progress = {};
function loadProgress() {
  try { if (fs.existsSync(PROGRESS_FILE)) progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')); } catch { progress = {}; }
}
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

const SYSTEM_PROMPT = `You are rewriting articles for hashtagweb3.com. Your output must read like it was written by a knowledgeable human editor, not an AI.

ABSOLUTE RULES - VIOLATION OF ANY MEANS FAILURE:
1. ZERO em dashes (—). Use commas, periods, colons, semicolons, or parentheses.
2. BANNED WORDS/PHRASES (never use any of these): "delve", "landscape", "leverage" (as verb), "tapestry", "pivotal", "it's worth noting", "in today's world", "in today's rapidly evolving", "unleash", "unlock", "navigate", "at its core", "game-changer", "paradigm shift", "cutting-edge", "groundbreaking", "revolutionize", "comprehensive", "deep dive", "demystifying", "furthermore", "moreover", "in conclusion", "to summarize", "in essence", "crucial", "essential" (in headers), "the world of", "the realm of", "ever-evolving", "rapidly changing", "bustling", "robust", "seamless", "myriad", "plethora", "multifaceted", "holistic", "synergy", "empower", "foster", "facilitate", "harness", "spearhead", "underscore", "notably", "interestingly", "importantly"
3. NO filler sentences. Every sentence must contain NEW information. Delete any sentence that could be removed without losing info.
4. NO throat-clearing intros like "In the fast-paced world of Web3..." Start with a concrete fact, number, or direct statement.
5. Vary sentence length naturally. Mix short punchy sentences with longer ones.
6. Use specific numbers, dates, project names, and real examples.
7. Occasionally use informal connectors: "Here's the thing.", "That said,", "The catch:", "Worth knowing:".
8. Write opinions where appropriate. AI refuses opinions. You should have them.
9. Include at least one markdown table with real, specific data.
10. Minimum 1500 words of body content.
11. PRESERVE the YAML frontmatter EXACTLY. Only rewrite body content below the closing ---.
12. Preserve all internal links like [Web3](/what-is-web3).
13. No JSX/React components. Plain markdown only.
14. Remove any "Keep Learning" or "Related Guides" link-dump sections.
15. End with substantive content, not a generic call-to-action.

VOICE: Smart colleague who knows this stuff cold. Direct, occasionally dry. Think: Stratechery or Not Boring. Not: corporate blog or Wikipedia.`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: content };
  return { frontmatter: `---\n${m[1]}\n---`, body: m[2].trim() };
}

function countWords(t) { return t.split(/\s+/).filter(w => w.length > 0).length; }

function hasAISlop(text) {
  const patterns = [/—/g, /\bdelve\b/gi, /\blandscape\b/gi, /\bleverage\b/gi, /\btapestry\b/gi, /\bpivotal\b/gi, /it's worth noting/gi, /in today's/gi, /game.changer/gi, /paradigm shift/gi, /cutting.edge/gi, /groundbreaking/gi, /revolutionize/gi, /unleash/gi, /unlock the power/gi, /navigate the complex/gi, /at its core/gi, /furthermore/gi, /moreover/gi, /in conclusion/gi, /in essence/gi];
  let s = 0;
  for (const p of patterns) { const m = text.match(p); if (m) s += m.length; }
  return s;
}

async function callGemini(userPrompt, retries = 5) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
        }),
      });
      if (response.status === 429 || response.status === 503) {
        const wait = Math.pow(2, attempt) * 3000 + Math.random() * 3000;
        console.log(`  [G] ${response.status}, waiting ${Math.round(wait/1000)}s...`);
        await sleep(wait);
        continue;
      }
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini ${response.status}: ${err.substring(0, 150)}`);
      }
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('Empty response');
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      if (attempt < retries - 1) {
        const wait = Math.pow(2, attempt) * 2000 + Math.random() * 2000;
        console.log(`  [G] Retry ${attempt + 1}: ${err.message.substring(0, 100)}`);
        await sleep(wait);
      } else throw err;
    }
  }
}

async function rewriteArticle(filePath) {
  const filename = path.basename(filePath);
  loadProgress();
  if (progress[filename]?.status === 'done' || progress[filename]?.status === 'in-progress') {
    return { filename, status: 'skipped', reason: 'already done/claimed' };
  }
  progress[filename] = { status: 'in-progress', worker: 'gemini' };
  saveProgress();

  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const wordCount = countWords(body);
  const slopScore = hasAISlop(body);

  if (wordCount >= 1500 && slopScore === 0) {
    progress[filename] = { status: 'done', reason: 'already clean', wordCount, slopScore: 0 };
    return { filename, status: 'skipped', reason: 'already clean' };
  }

  const prompt = `Rewrite the following article body. The frontmatter is for context only - DO NOT include it in your output. Output ONLY the rewritten body content in markdown.

FRONTMATTER (context only):
${frontmatter}

CURRENT BODY TO REWRITE:
${body || '(Empty - write full content based on the title/description)'}

REQUIREMENTS:
- Min 1500 words. Current: ${wordCount}. Slop score: ${slopScore} (must be 0)
- ${wordCount < 300 ? 'Article is empty. Write full substantive content from scratch.' : 'Rewrite to remove AI patterns and add specificity.'}
- Include at least one markdown table with real data
- End with substantive content, not links
- Preserve internal links like [text](/path)
- No JSX/React components`;

  try {
    const rewritten = await callGemini(prompt);
    if (!rewritten || rewritten.length < 200) throw new Error('Too short');
    let cleanBody = rewritten;
    if (cleanBody.startsWith('---')) {
      const ei = cleanBody.indexOf('---', 3);
      if (ei !== -1) cleanBody = cleanBody.substring(ei + 3).trim();
    }
    // Strip markdown code fences if model wrapped output
    cleanBody = cleanBody.replace(/^```markdown\n?/, '').replace(/\n?```$/, '');
    
    fs.writeFileSync(filePath, `${frontmatter}\n\n${cleanBody}\n`, 'utf-8');
    const nw = countWords(cleanBody), ns = hasAISlop(cleanBody);
    progress[filename] = { status: 'done', oldWordCount: wordCount, newWordCount: nw, oldSlopScore: slopScore, newSlopScore: ns, worker: 'gemini', timestamp: new Date().toISOString() };
    return { filename, status: 'rewritten', oldWords: wordCount, newWords: nw, oldSlop: slopScore, newSlop: ns };
  } catch (err) {
    progress[filename] = { status: 'error', error: err.message, worker: 'gemini' };
    return { filename, status: 'error', error: err.message };
  }
}

async function run(items, fn, concurrency) {
  const results = []; let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      loadProgress();
      const f = path.basename(items[i]);
      if (progress[f]?.status === 'done') { results.push({ filename: f, status: 'skipped', reason: 'done' }); continue; }
      const r = await fn(items[i]);
      results.push(r);
      const d = results.length, t = items.length, p = ((d/t)*100).toFixed(1);
      if (r.status === 'rewritten') console.log(`[G ${d}/${t} ${p}%] ✅ ${r.filename} (${r.oldWords}→${r.newWords} words, slop ${r.oldSlop}→${r.newSlop})`);
      else if (r.status === 'skipped') console.log(`[G ${d}/${t} ${p}%] ⏭️  ${r.filename} (${r.reason})`);
      else console.log(`[G ${d}/${t} ${p}%] ❌ ${r.filename}: ${r.error?.substring(0,80)}`);
      if (d % 10 === 0) saveProgress();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  saveProgress();
  return results;
}

async function main() {
  console.log(`=== Gemini Worker (${MODEL}, ${MAX_CONCURRENT} concurrent) ===\n`);
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => path.join(ARTICLES_DIR, f)).sort().reverse();
  loadProgress();
  const done = files.filter(f => progress[path.basename(f)]?.status === 'done').length;
  console.log(`Total: ${files.length}, Done: ${done}, Remaining: ${files.length - done}\n`);
  const t0 = Date.now();
  const res = await run(files, rewriteArticle, MAX_CONCURRENT);
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  const rw = res.filter(r => r.status === 'rewritten').length;
  const sk = res.filter(r => r.status === 'skipped').length;
  const er = res.filter(r => r.status === 'error').length;
  console.log(`\n=== GEMINI DONE === Rewritten: ${rw}, Skipped: ${sk}, Errors: ${er}, Time: ${mins}m`);
  if (er > 0) res.filter(r => r.status === 'error').forEach(r => console.log(`  ${r.filename}: ${r.error}`));
}

main().catch(console.error);
