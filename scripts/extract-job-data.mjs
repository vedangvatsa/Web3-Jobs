#!/usr/bin/env node

/**
 * Job Description Extraction Pipeline
 * 1. Reads job URLs from jobs-cache.json
 * 2. Fetches each job page
 * 3. Extracts structured fields using GPT-4o-mini
 * 4. Outputs CSV for spreadsheet import
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JOBS_CACHE = path.join(__dirname, '..', 'content', 'jobs-cache.json');
const OUTPUT_CSV = path.join(__dirname, '..', 'jobs-extracted.csv');
const PROGRESS_FILE = path.join(__dirname, '..', 'jobs-extract-progress.json');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1); }

const CONCURRENCY = 10; // Lower than article de-slop since we're also fetching URLs
const FETCH_TIMEOUT = 15000; // 15s timeout for job page fetches

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Load progress
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

// CSV escaping
function csvEscape(val) {
  if (!val) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

const SYSTEM_PROMPT = `You extract structured job posting data from raw HTML/text content. Return ONLY valid JSON with these fields:

{
  "job_title": "exact job title",
  "company_name": "company name",
  "company_url": "company homepage URL (not careers page)",
  "location": "job location or 'Remote' if remote",
  "compensation": "salary range if mentioned, else null",
  "employment_type": "Full-time/Part-time/Contract/Internship",
  "experience_level": "Entry/Mid/Senior/Lead/Staff/Principal",
  "skills": ["skill1", "skill2", ...],
  "description_summary": "2-3 sentence summary of the role",
  "department": "Engineering/Marketing/Operations/Design/etc",
  "crypto_focus": "DeFi/NFT/Infrastructure/Trading/Security/Gaming/etc"
}

Rules:
- skills should be specific technical skills (e.g., "Solidity", "React", "Python", "AWS") not generic ones
- Limit skills to max 10 most relevant
- For company_url, use the main company domain (e.g., coinbase.com), not careers subdomain
- If compensation is not explicitly stated, set to null
- Keep description_summary factual and concise`;

async function fetchJobPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    // Strip HTML tags but keep text structure
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000); // Limit to 6000 chars for API
  } catch {
    return null;
  }
}

async function extractWithAI(pageText, jobMeta) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Job URL: ${jobMeta.link}\nCompany (from cache): ${jobMeta.company}\nTitle (from cache): ${jobMeta.title}\n\nPage content:\n${pageText}` }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });
      if (response.status === 429) { await sleep(3000 + Math.random() * 3000); continue; }
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      if (attempt < 2) { await sleep(2000); continue; }
      return null;
    }
  }
}

async function processJob(job, index, total) {
  if (progress[job.id]) return progress[job.id];

  // Fetch page
  const pageText = await fetchJobPage(job.link);
  
  let result;
  if (pageText && pageText.length > 100) {
    // Extract with AI
    const extracted = await extractWithAI(pageText, job);
    if (extracted) {
      result = {
        url: job.link,
        company_name: extracted.company_name || job.company,
        company_url: extracted.company_url || '',
        job_title: extracted.job_title || job.title,
        description_summary: extracted.description_summary || '',
        skills: (extracted.skills || []).join('; '),
        compensation: extracted.compensation || '',
        location: extracted.location || '',
        employment_type: extracted.employment_type || '',
        experience_level: extracted.experience_level || '',
        department: extracted.department || '',
        crypto_focus: extracted.crypto_focus || '',
        source: job.source,
        date: job.date,
      };
    }
  }
  
  if (!result) {
    // Fallback: use cached data only
    result = {
      url: job.link,
      company_name: job.company,
      company_url: '',
      job_title: job.title,
      description_summary: '',
      skills: '',
      compensation: '',
      location: '',
      employment_type: '',
      experience_level: '',
      department: '',
      crypto_focus: '',
      source: job.source,
      date: job.date,
    };
  }

  progress[job.id] = result;
  console.log(`[${index}/${total}] ✅ ${job.company}: ${job.title}`);
  return result;
}

async function main() {
  const allJobs = JSON.parse(fs.readFileSync(JOBS_CACHE, 'utf-8'));
  const pending = allJobs.filter(j => !progress[j.id]);
  console.log(`Extracting ${pending.length} jobs (${Object.keys(progress).length} already done)...\n`);

  const startTime = Date.now();
  let done = 0, errors = 0;

  // Process in batches
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((job, j) => processJob(job, i + j + 1, pending.length))
    );
    done += batch.length;

    // Save progress every batch
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    if (done % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      console.log(`--- Progress: ${(done/pending.length*100).toFixed(1)}% | Done: ${done} | Time: ${elapsed}m ---`);
    }
  }

  // Write CSV
  const headers = ['URL', 'Company Name', 'Company URL', 'Job Title', 'Description Summary', 'Skills', 'Compensation', 'Location', 'Employment Type', 'Experience Level', 'Department', 'Crypto Focus', 'Source', 'Date'];
  const rows = allJobs.map(j => {
    const r = progress[j.id] || {};
    return [
      r.url || j.link,
      r.company_name || j.company,
      r.company_url || '',
      r.job_title || j.title,
      r.description_summary || '',
      r.skills || '',
      r.compensation || '',
      r.location || '',
      r.employment_type || '',
      r.experience_level || '',
      r.department || '',
      r.crypto_focus || '',
      r.source || j.source,
      r.date || j.date,
    ].map(csvEscape).join(',');
  });

  fs.writeFileSync(OUTPUT_CSV, [headers.join(','), ...rows].join('\n'), 'utf-8');

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE === Extracted: ${done}, Time: ${elapsed}m`);
  console.log(`CSV written to: ${OUTPUT_CSV}`);
}

main().catch(console.error);
