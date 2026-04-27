#!/usr/bin/env node

/**
 * Parallel Article Rewriter
 * Processes all markdown articles through GPT-4o-mini to:
 * 1. Remove AI slop (em dashes, "delve", "landscape", "leverage", etc.)
 * 2. Replace vague language with specific, data-backed claims
 * 3. Ensure minimum ~1500 words of substantive content
 * 4. Fact-check and remove unsupported claims
 * 5. Write in a direct, McKinsey-style voice
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const PROGRESS_FILE = path.join(__dirname, 'rewrite-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Set OPENAI_API_KEY environment variable');
  process.exit(1);
}

const MAX_CONCURRENT = parseInt(process.env.CONCURRENCY || '30', 10);
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const DRY_RUN = process.env.DRY_RUN === '1';

// Track progress so we can resume
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

const SYSTEM_PROMPT = `You are rewriting articles for hashtagweb3.com. Your output must read like it was written by a knowledgeable human editor, not an AI.

ABSOLUTE RULES - VIOLATION OF ANY MEANS FAILURE:
1. ZERO em dashes (—). Use commas, periods, colons, semicolons, or parentheses.
2. BANNED WORDS/PHRASES (never use any of these): "delve", "landscape", "leverage" (as verb), "tapestry", "pivotal", "it's worth noting", "in today's world", "in today's rapidly evolving", "unleash", "unlock", "navigate", "at its core", "game-changer", "paradigm shift", "cutting-edge", "groundbreaking", "revolutionize", "comprehensive", "deep dive", "demystifying", "furthermore", "moreover", "in conclusion", "to summarize", "in essence", "crucial", "essential" (in headers), "the world of", "the realm of", "ever-evolving", "rapidly changing", "bustling", "robust", "seamless", "myriad", "plethora", "multifaceted", "holistic", "synergy", "empower", "foster", "facilitate", "harness", "spearhead", "underscore", "notably", "interestingly", "importantly"
3. NO filler sentences. Every sentence must contain information the reader did not have before reading it. If a sentence could be deleted without losing information, delete it.
4. NO throat-clearing introductions like "In the fast-paced world of Web3..." or "As the blockchain industry continues to grow..." Start with a concrete fact, number, or direct statement.
5. Vary sentence length naturally. Mix short punchy sentences (5-8 words) with longer ones. Real humans don't write uniformly structured paragraphs.
6. Use specific numbers, dates, project names, and real examples. Never say "many projects" when you can say "Uniswap, Aave, and Compound".
7. Occasionally use informal connectors: "Here's the thing.", "That said,", "The catch:", "Worth knowing:", "Put differently,". Real writers use these.
8. Write opinions where appropriate. "This is overhyped" or "Most people get this wrong" is fine. AI refuses to have opinions. You should have them.
9. Include at least one markdown table with real, specific data.
10. Minimum 1500 words of body content.
11. PRESERVE the YAML frontmatter EXACTLY. Only rewrite body content below the closing ---.
12. Preserve all internal links like [Web3](/what-is-web3).
13. No JSX/React components. Plain markdown only.
14. Remove any "Keep Learning" or "Related Guides" link-dump sections.
15. End with substantive content, not a generic call-to-action.

VOICE: You are a smart colleague who knows this stuff cold. You explain things directly, occasionally crack dry observations, and never pad your writing. Think: Stratechery, Not Boring, or a good Substack writer. Not: corporate blog, Wikipedia, or textbook.`;

async function callOpenAI(messages, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_tokens: 8000,
          temperature: 0.7,
        }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
        console.log(`  Rate limited, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error ${response.status}: ${err}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      if (attempt < retries - 1) {
        const wait = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`  Retry ${attempt + 1} after error: ${err.message}. Waiting ${Math.round(wait)}ms`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: content };
  return { frontmatter: `---\n${match[1]}\n---`, body: match[2].trim() };
}

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function hasAISlop(text) {
  const slopPatterns = [
    /—/g,
    /\bdelve\b/gi,
    /\blandscape\b/gi,
    /\bleverage\b/gi,
    /\btapestry\b/gi,
    /\bpivotal\b/gi,
    /it's worth noting/gi,
    /in today's/gi,
    /game.changer/gi,
    /paradigm shift/gi,
    /cutting.edge/gi,
    /groundbreaking/gi,
    /revolutionize/gi,
    /unleash/gi,
    /unlock the power/gi,
    /navigate the complex/gi,
    /at its core/gi,
    /furthermore/gi,
    /moreover/gi,
    /in conclusion/gi,
    /in essence/gi,
  ];
  
  let score = 0;
  for (const pattern of slopPatterns) {
    const matches = text.match(pattern);
    if (matches) score += matches.length;
  }
  return score;
}

async function rewriteArticle(filePath) {
  const filename = path.basename(filePath);
  
  if (progress[filename]?.status === 'done') {
    return { filename, status: 'skipped', reason: 'already done' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const wordCount = countWords(body);
  const slopScore = hasAISlop(body);

  // Skip articles that are already high quality
  if (wordCount >= 1500 && slopScore === 0) {
    progress[filename] = { status: 'done', reason: 'already clean', wordCount, slopScore: 0 };
    return { filename, status: 'skipped', reason: 'already clean' };
  }

  const userPrompt = `Rewrite the following article body. The frontmatter is provided for context only - DO NOT include it in your output. Output ONLY the rewritten body content in markdown.

FRONTMATTER (for context, do not output):
${frontmatter}

CURRENT BODY CONTENT TO REWRITE:
${body || '(Article is empty - write full content based on the title and description in the frontmatter)'}

REQUIREMENTS:
- Minimum 1500 words
- Current word count: ${wordCount}
- Current AI-slop score: ${slopScore} (must be 0)
- ${wordCount < 300 ? 'This article is essentially empty. Write full substantive content from scratch based on the title.' : 'Rewrite to remove AI patterns and add specificity.'}
- Include at least one markdown table with real data
- End with a substantive conclusion, not a link list
- Preserve all existing internal links like [text](/path)
- No JSX/React components`;

  try {
    const rewritten = await callOpenAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    if (!rewritten || rewritten.length < 200) {
      throw new Error('Response too short');
    }

    // Remove any accidental frontmatter the model might have added
    let cleanBody = rewritten;
    if (cleanBody.startsWith('---')) {
      const endIdx = cleanBody.indexOf('---', 3);
      if (endIdx !== -1) {
        cleanBody = cleanBody.substring(endIdx + 3).trim();
      }
    }

    const newContent = `${frontmatter}\n\n${cleanBody}\n`;
    const newWordCount = countWords(cleanBody);
    const newSlopScore = hasAISlop(cleanBody);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
    }

    progress[filename] = {
      status: 'done',
      oldWordCount: wordCount,
      newWordCount,
      oldSlopScore: slopScore,
      newSlopScore,
      timestamp: new Date().toISOString(),
    };

    return { filename, status: 'rewritten', oldWords: wordCount, newWords: newWordCount, oldSlop: slopScore, newSlop: newSlopScore };
  } catch (err) {
    progress[filename] = { status: 'error', error: err.message };
    return { filename, status: 'error', error: err.message };
  }
}

async function processWithConcurrency(items, fn, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const result = await fn(items[i]);
      results.push(result);
      
      // Progress log
      const done = results.length;
      const total = items.length;
      const pct = ((done / total) * 100).toFixed(1);
      
      if (result.status === 'rewritten') {
        console.log(`[${done}/${total} ${pct}%] ✅ ${result.filename} (${result.oldWords}→${result.newWords} words, slop ${result.oldSlop}→${result.newSlop})`);
      } else if (result.status === 'skipped') {
        console.log(`[${done}/${total} ${pct}%] ⏭️  ${result.filename} (${result.reason})`);
      } else {
        console.log(`[${done}/${total} ${pct}%] ❌ ${result.filename}: ${result.error}`);
      }
      
      // Save progress every 10 articles
      if (done % 10 === 0) saveProgress();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  saveProgress();
  
  return results;
}

async function main() {
  console.log('=== Web3 Article Rewriter ===');
  console.log(`Model: ${MODEL}`);
  console.log(`Concurrency: ${MAX_CONCURRENT}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log('');

  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(ARTICLES_DIR, f))
    .sort();

  console.log(`Found ${files.length} articles to process`);
  
  // Count already done
  const alreadyDone = files.filter(f => progress[path.basename(f)]?.status === 'done').length;
  console.log(`Already processed: ${alreadyDone}`);
  console.log(`Remaining: ${files.length - alreadyDone}`);
  console.log('');

  const startTime = Date.now();
  const results = await processWithConcurrency(files, rewriteArticle, MAX_CONCURRENT);
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  // Summary
  const rewritten = results.filter(r => r.status === 'rewritten').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('\n=== SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`Rewritten: ${rewritten}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Time: ${elapsed} minutes`);

  if (errors > 0) {
    console.log('\nFailed articles:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`  ${r.filename}: ${r.error}`);
    });
  }
}

main().catch(console.error);
