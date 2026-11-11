#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Job } from '../src/types';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const COMPANY_NAME = 'Altitude Development Partners';
const COMPANY_SLUG = 'altitude-development-partners';
const COMPANY_WEBSITE = 'https://altitudedp.com';

async function ensureBranding(root: string) {
  const logoDir = path.join(root, 'public/logo/companies');
  fs.mkdirSync(logoDir, { recursive: true });
  const logoPath = path.join(logoDir, `${COMPANY_SLUG}.png`);

  // Download logo from altitudedp.com if not already saved
  if (!fs.existsSync(logoPath) || fs.statSync(logoPath).size < 100) {
    const res = await fetch(`${COMPANY_WEBSITE}/logo.png`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Failed to download logo: HTTP ${res.status}`);
    const rawBuffer = Buffer.from(await res.arrayBuffer());

    // Fit onto 256x256 transparent square canvas
    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp(rawBuffer)
            .resize({ width: 220, height: 220, fit: 'inside' })
            .toBuffer(),
          gravity: 'centre',
        },
      ])
      .png()
      .toFile(logoPath);

    console.log('✓ Ensured company logo at', logoPath);
  }

  // Update company logos index
  const logosIndexPath = path.join(root, 'content/company-logos-index.json');
  if (fs.existsSync(logosIndexPath)) {
    const logosIndex = JSON.parse(fs.readFileSync(logosIndexPath, 'utf8')) as string[];
    const relativeLogo = `/logo/companies/${COMPANY_SLUG}.png`;
    if (!logosIndex.includes(relativeLogo)) {
      logosIndex.push(relativeLogo);
      logosIndex.sort();
      fs.writeFileSync(logosIndexPath, `${JSON.stringify(logosIndex, null, 2)}\n`);
      console.log('✓ Added to company-logos-index.json');
    }
  }

  // Update company branding
  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = fs.existsSync(brandingPath) ? JSON.parse(fs.readFileSync(brandingPath, 'utf8')) : {};
  branding[COMPANY_SLUG] = {
    website: COMPANY_WEBSITE,
    logo: `/logo/companies/${COMPANY_SLUG}.png`,
  };
  fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);
  console.log('✓ Updated company-branding.json');

  // Update company socials
  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = fs.existsSync(socialsPath) ? JSON.parse(fs.readFileSync(socialsPath, 'utf8')) : {};
  socials[COMPANY_SLUG] = {
    website: COMPANY_WEBSITE,
    twitter: 'https://x.com/altitudedp',
  };
  fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);
  console.log('✓ Updated company-socials.json');

  // Update company editorial
  const editorialPath = path.join(root, 'content/company-profile-editorial.json');
  if (fs.existsSync(editorialPath)) {
    const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));
    editorial[COMPANY_SLUG] =
      'Altitude Development Partners is a venture and technology studio and DeFi hedge fund specializing in quantitative research, decentralized finance, and protocol development.';
    fs.writeFileSync(editorialPath, `${JSON.stringify(editorial, null, 2)}\n`);
    console.log('✓ Updated company-profile-editorial.json');
  }

  // Create company markdown profile
  const companyMdPath = path.join(root, 'content/companies', `${COMPANY_SLUG}.md`);
  if (!fs.existsSync(companyMdPath)) {
    const mdContent = `---
name: ${COMPANY_NAME}
website: '${COMPANY_WEBSITE}'
category: DeFi & Quantitative Finance
headquarters: Remote
description: "Altitude Development Partners is a venture and technology studio and DeFi hedge fund specializing in quantitative research, decentralized finance, and protocol development. Founded in 2018, the studio builds systems across spatial technology, Web3, PropTech, and algorithmic trading, with dedicated trading strategies and portfolio risk management across decentralized finance."
lastUpdated: 2026-11-11
---

Altitude Development Partners is a venture and technology studio and DeFi hedge fund specializing in quantitative research, decentralized finance, and protocol development.

The company actively hires professionals across quantitative research, strategy development, decentralized finance, risk analysis, and smart contract engineering.
`;
    fs.writeFileSync(companyMdPath, mdContent);
    console.log(`✓ Created content/companies/${COMPANY_SLUG}.md`);
  }
}

async function main() {
  const root = process.cwd();
  await ensureBranding(root);

  const jobsToIngest: Array<{
    job: Job;
    rawDescription: string;
  }> = [
    {
      job: {
        id: 'altitude-development-partners-quant-researcher-strategy-developer',
        title: 'Quant Researcher / Strategy Developer',
        company: COMPANY_NAME,
        link: 'https://altitudedp.com/careers/quant-researcher-strategy-developer',
        date: '2026-11-11T00:00:00.000Z',
        dateVerified: true,
        dateSource: 'Altitude Development Partners Careers',
        source: 'Altitude Development Partners [altitudedp]',
        location: 'Remote',
        isRemote: true,
        workplaceType: 'Remote',
        department: 'Engineering',
        active: true,
      },
      rawDescription: `<p>We are hiring a quant researcher and strategy developer for our DeFi hedge fund: a strong programmer with a research mindset and a solid grasp of finance.</p>
<p>You will come up with strategy ideas on your own, work out their economics, test them, and get them into production. The role runs from the first hypothesis all the way to live code.</p>
<h2>What you will do</h2>
<ul>
<li>Originate strategy ideas and work out how, and why, each one makes money.</li>
<li>Gather the data and calculate returns after fees and borrowing costs.</li>
<li>Check your assumptions, find the weak spots, and improve the strategy.</li>
<li>Write code to test hypotheses and automate strategies, then take them into production.</li>
<li>Dig into products you have not seen before and back up your conclusions with a clear argument.</li>
</ul>
<h2>What we are looking for</h2>
<ul>
<li><strong>Deep understanding of DeFi.</strong> You know how protocols work, where yield comes from, what risks sit behind it, and when a strategy works and when it stops working.</li>
<li><strong>Solid grounding in traditional finance.</strong> Bonds, interest rates, lending, and derivatives. You understand how these mechanics carry over to DeFi and how market conditions affect strategies.</li>
<li><strong>Strong programming skills.</strong> You know Solidity, can read and pick apart smart contracts, work with on-chain data, and write code to test hypotheses and automate strategies.</li>
<li><strong>A hands-on approach to research.</strong> You do the work yourself, from raw data to a return figure you would defend.</li>
<li><strong>Independence and curiosity.</strong> You spot opportunities yourself and do not wait to be handed a problem.</li>
</ul>
<h2>How to Apply</h2>
<p>Send a note to <a href="mailto:careers@altitudedp.com?subject=Application%3A%20Quant%20Researcher%20%2F%20Strategy%20Developer">careers@altitudedp.com</a> explaining why this role fits, along with links to work you are proud of.</p>`,
    },
    {
      job: {
        id: 'altitude-development-partners-risk-analyst',
        title: 'Risk Analyst',
        company: COMPANY_NAME,
        link: 'https://altitudedp.com/careers/risk-analyst',
        date: '2026-11-11T00:00:00.000Z',
        dateVerified: true,
        dateSource: 'Altitude Development Partners Careers',
        source: 'Altitude Development Partners [altitudedp]',
        location: 'Remote',
        isRemote: true,
        workplaceType: 'Remote',
        department: 'Finance',
        active: true,
      },
      rawDescription: `<p>We are hiring a risk analyst for our DeFi hedge fund: someone who knows both DeFi and traditional finance well.</p>
<p>The core of the job is to take apart the fund's strategies and positions, work out where and under what conditions we could lose money, and propose concrete ways to manage that risk.</p>
<h2>What you will do</h2>
<ul>
<li>Break down each strategy and position to find where, and under what conditions, we could lose money.</li>
<li>Assess concentration, correlations, and shared sources of risk across positions, including what could hit several strategies at once.</li>
<li>Test scenarios: a sharp market move, a rate spike, a wave of withdrawals.</li>
<li>Estimate how fast we can exit a position and how much we would lose doing it.</li>
<li>Propose position sizes, limits, and the metrics to monitor, along with the conditions under which we should cut or close a position.</li>
<li>Explain your conclusions clearly to the team.</li>
</ul>
<h2>What we are looking for</h2>
<ul>
<li><strong>Understanding of financial mechanics.</strong> Sources of yield, interest rates, the cost of borrowed capital, leverage, collateral, and liquidations.</li>
<li><strong>Deep understanding of DeFi risk.</strong> Liquidity, stablecoin depegs, smart contract and oracle risk, and dependencies between protocols. You can work out how a new product is built on your own.</li>
<li><strong>A portfolio-level view.</strong> You think in terms of the whole book, not one position at a time.</li>
<li><strong>Comfort with data and scenarios.</strong> You turn a risk into numbers we can act on.</li>
<li><strong>Practical recommendations.</strong> Your output is a decision the team can make, not only an observation.</li>
</ul>
<h2>How to Apply</h2>
<p>Send a note to <a href="mailto:careers@altitudedp.com?subject=Application%3A%20Risk%20Analyst">careers@altitudedp.com</a> explaining why this role fits, along with links to work you are proud of.</p>`,
    },
  ];

  // Ingest into jobs-cache.json
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const incomingIds = new Set(jobsToIngest.map((item) => item.job.id));
  const incomingLinks = new Set(jobsToIngest.map((item) => item.job.link));

  const filtered = allJobs.filter(
    (j) => !incomingIds.has(j.id) && !incomingLinks.has(j.link) && !(j.company === COMPANY_NAME)
  );

  const newJobs = jobsToIngest.map((item) => item.job);
  const combined = [...newJobs, ...filtered];

  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  assignJobSlugsAndSyncLegacyArchive(combined, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  fs.writeFileSync(cachePath, `${JSON.stringify(combined, null, 2)}\n`);
  for (const job of newJobs) {
    console.log(`✓ Added job: "${job.title}" (slug: /${job.slug})`);
  }

  // Store descriptions in shards
  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };

  for (const item of jobsToIngest) {
    const cleanDesc = sanitizeJobDescriptionHtml(item.rawDescription, COMPANY_NAME);
    const contentKey = getJobContentKey(item.job);
    descriptions[contentKey] = cleanDesc;
    console.log(`✓ Stored description for key ${contentKey}`);
  }

  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(combined, descriptions) },
    },
    root
  );
  console.log('✓ Successfully updated job description shards');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
