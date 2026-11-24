#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import type { Job } from '../src/types';
import { buildSynthesizedJobContent } from '../src/lib/job-guides';
import { polishJobDescriptionHtml } from '../src/lib/job-description-polish';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore, writeJobDescriptionStore } from './lib/job-description-store';
import { descriptionFormattingIssues } from './lib/description-format-checks';

const LOGO_URL =
  'https://cdn.prod.website-files.com/6604526310f4c7f24d8e3435/6696b8aa9cec14c7a88baf02_webclip.png';

const RAW = `<p>Moon makes it easier to spend digital assets in the real world through payment cards, gift cards, and payment infrastructure. We're looking for a hands-on Head of Growth Marketing to grow our audience, strengthen our social presence, and turn interest into customers.</p>
<p><strong>You'll own our organic social media growth strategy and execution, with a primary focus on building our founder's audience on X (Twitter).</strong> We're looking for someone who understands how to build an influential voice, develop compelling narratives, and create content that people genuinely want to follow.</p>
<p>You'll work directly with our CEO to turn his ideas and perspectives on Bitcoin, stablecoins, payments, and financial technology into engaging content. You should be comfortable identifying interesting angles, challenging ideas, and proactively developing content rather than waiting for assignments.</p>
<p>This is a hands-on, individual contributor role. You'll own the entire creative process, from strategy and content creation to video editing, publishing, and performance analysis. You'll be accountable for audience growth, engagement, and translating social media reach into meaningful business results.</p>
<p>While our immediate priority is organic social media and founder-led content, you'll have the opportunity to expand into additional growth channels, campaigns, and marketing.</p>
<h3>What you'll do</h3>
<ul>
<li>Own Moon's social media presence, including content planning, creation, publishing, and community engagement, with a particular focus on X (Twitter).</li>
<li>Build and grow our founder's personal brand on X. Develop his content strategy, write posts and threads, identify engagement opportunities, and consistently grow his following and reach.</li>
<li>Work directly with the CEO to turn his ideas, interviews, commentary, and raw video footage into engaging content that builds his audience and establishes him as a recognizable voice in Bitcoin, crypto/stablecoins, and fintech.</li>
<li>Create and edit compelling video content, particularly short-form clips for X, Instagram, TikTok, YouTube Shorts, and other platforms.</li>
<li>Write clear, engaging copy for social posts, campaigns, product announcements, and founder-led content.</li>
<li>Plan and execute creative marketing campaigns that drive awareness, sign-ups, and product usage.</li>
<li>Identify and manage relationships with relevant creators, influencers, and partners.</li>
<li>Create visual content, including infographics, graphics, memes, and other social media assets.</li>
<li>Maintain consistent publishing schedules using social media management and scheduling tools.</li>
<li>Work with our leadership and product teams to translate new features and company updates into content people understand and care about.</li>
<li>Track performance, test different messages and formats, and continually improve content based on results.</li>
</ul>
<h3>What we're looking for</h3>
<ul>
<li>Experience independently running social media and marketing campaigns for a brand, startup, founder, or your own business.</li>
<li><strong>Demonstrated ability to grow your own personal social media accounts, particularly on X (Twitter).</strong> Ideally, you have built a substantial following of your own and can show how you achieved that growth.</li>
<li>A proven track record of growing social media audiences organically, including measurable follower growth, engagement, and reach.</li>
<li>Strong video editing skills and a portfolio of content you personally produced. You understand hooks, pacing, captions, storytelling, and what makes people stop scrolling.</li>
<li>Excellent writing skills, including the ability to ghostwrite in someone else's voice and turn complex ideas into engaging social content.</li>
<li>Experience building personal brands or managing social media accounts for founders, executives, or industry personalities.</li>
<li>Strong creative instincts and an understanding of what performs well on X and other social platforms.</li>
<li>A practical understanding of marketing analytics and how to connect content performance to customer growth.</li>
<li>Strong organization and follow-through. You can manage multiple content calendars and keep work moving without close supervision.</li>
<li>A willingness to experiment, move quickly, and handle both the creative and operational sides of marketing.</li>
</ul>
<h3>Nice to have</h3>
<ul>
<li>Experience in crypto, Bitcoin, fintech, or payments.</li>
<li>Fluency in Spanish.</li>
<li>Experience managing influencer or creator campaigns.</li>
<li>Experience using AI tools to accelerate content production, video editing, and design.</li>
<li>Basic design and motion graphics skills.</li>
<li>Experience with email marketing, referral programs, or paid social.</li>
<li>Availability to work primarily within Americas time zones.</li>
</ul>
<h3>What success looks like</h3>
<p>You'll help establish Moon and its founder as recognizable voices in the Bitcoin, stablecoin/crypto, and fintech space.</p>
<p>Success means consistently producing high-quality content, significantly growing the founder's personal X following, building an engaged audience across Moon's social channels, and executing campaigns that contribute to customer acquisition and product usage.</p>
<p>You'll take ownership of the creative process and help us identify which messages, formats, and channels drive the strongest results.</p>
<h3>How to apply</h3>
<p>Send your résumé or LinkedIn profile, along with:</p>
<ul>
<li>Links to your personal social media accounts, particularly X (Twitter).</li>
<li>Examples of social media accounts you've grown, including follower growth and engagement metrics.</li>
<li>Examples of short-form videos, written content, and campaigns you've personally created.</li>
<li>Any experience managing or growing the personal brand of a founder or executive.</li>
</ul>
<p><strong>Video editing is a core part of this role.</strong> As part of the interview process, shortlisted candidates may be asked to turn raw footage into a social-ready video and create sample X posts for our founder.</p>
<p><em>Apply on Wellfound: <a href="https://wellfound.com/jobs/5101765-head-of-growth-marketing" rel="noopener noreferrer" target="_blank">Head of Growth Marketing at Moon</a></em></p>`;

async function main() {
  const root = process.cwd();
  const cache = JSON.parse(fs.readFileSync(path.join(root, 'content/jobs-cache.json'), 'utf8')) as Job[];
  const job = cache.find((row) => row.id === 'wellfound-5101765');
  if (!job) throw new Error('Moon job missing from cache');

  const res = await fetch(LOGO_URL, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Logo download HTTP ${res.status}`);
  const logoPath = path.join(root, 'public/logo/companies/moon.png');
  await sharp(Buffer.from(await res.arrayBuffer())).png().toFile(logoPath);

  const logosPath = path.join(root, 'content/company-logos-index.json');
  const logos = JSON.parse(fs.readFileSync(logosPath, 'utf8')) as string[];
  const rel = '/logo/companies/moon.png';
  if (!logos.includes(rel)) {
    logos.push(rel);
    logos.sort();
    fs.writeFileSync(logosPath, `${JSON.stringify(logos, null, 2)}\n`);
  }

  const html = polishJobDescriptionHtml(sanitizeJobDescriptionHtml(RAW, 'Moon'), 'Moon');
  const key = getJobContentKey(job);
  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions, [key]: html };
  writeJobDescriptionStore({ descriptions, aliases: store.aliases }, root);

  const rendered = buildSynthesizedJobContent(job, html);
  const issues = descriptionFormattingIssues(rendered);
  if (issues.length) {
    throw new Error(`Formatting issues: ${JSON.stringify(issues)}`);
  }

  const words = cheerio.load(html).root().text().replace(/\s+/g, ' ').trim().split(/\s+/).length;
  const copyeditPath = path.join(root, 'content/jobs/copyedit-status.json');
  const copyedit = JSON.parse(fs.readFileSync(copyeditPath, 'utf8')) as Record<
    string,
    { reviewedAt: string; method: string; words: number }
  >;
  copyedit[key] = { reviewedAt: new Date().toISOString(), method: 'human-editorial-polish-v2', words };
  fs.writeFileSync(copyeditPath, `${JSON.stringify(copyedit, null, 2)}\n`);

  const headings = cheerio.load(rendered)('h3').map((_, el) => cheerio.load(rendered)(el).text().trim()).get();
  console.log(`✓ Moon description (${words} words), headings: ${headings.join(' | ')}`);
  console.log('✓ Logo at public/logo/companies/moon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});