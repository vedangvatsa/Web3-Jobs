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
const COMPANY_SLUG = 'altitudedp';
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
      'Altitude Development Partners is a venture and technology studio and DeFi hedge fund specializing in quantitative research, systematic trading strategies, protocol engineering, and portfolio risk management.';
    fs.writeFileSync(editorialPath, `${JSON.stringify(editorial, null, 2)}\n`);
    console.log('✓ Updated company-profile-editorial.json');
  }

  // Create company markdown profile
  const companyMdPath = path.join(root, 'content/companies', `${COMPANY_SLUG}.md`);
  const mdContent = `---
name: ${COMPANY_NAME}
website: '${COMPANY_WEBSITE}'
category: DeFi & Quantitative Finance
headquarters: Remote
description: "Altitude Development Partners is a venture studio, technology studio, and DeFi hedge fund founded in 2018. The firm specializes in quantitative research, systematic trading strategy development, protocol architecture, and comprehensive risk modeling across decentralized finance and traditional markets."
lastUpdated: 2026-11-11
---

Altitude Development Partners is a venture and technology studio operating a dedicated decentralized finance (DeFi) hedge fund. Founded in 2018, the studio is built around systems engineering, rigorous quantitative research, and production-grade software delivery.

### What They Build

- **DeFi Hedge Fund & Quantitative Systems**: Systematic trading strategies, yield modeling, lending and derivatives arbitrage, and automated execution from raw on-chain data to live smart contract deployment.
- **Protocol & MEV Infrastructure**: Deep analysis of decentralized protocols, liquidity pools, cross-chain dynamics, and smart contract mechanics with automated risk monitoring.
- **Technology & Venture Studio**: Multi-disciplinary engineering spanning spatial technologies, Web3 protocols, PropTech, and quantitative financial products.

### Culture & Standards

Altitude emphasizes high standards and ownership, holding a culture where problems are diagnosed from first principles and execution goes from raw hypothesis to defended production code. The team operates globally and hires professionals who demonstrate deep technical judgment, hands-on research rigor, and collaborative execution.
`;
  fs.writeFileSync(companyMdPath, mdContent);
  console.log(`✓ Updated content/companies/${COMPANY_SLUG}.md`);
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
        link: 'mailto:careers@altitudedp.com?subject=Application%3A%20Quant%20Researcher%20%2F%20Strategy%20Developer',
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
      rawDescription: `<h3>About the Role</h3>
<p>Altitude Development Partners is hiring a Quant Researcher and Strategy Developer for our DeFi hedge fund: a strong programmer with a research mindset and a solid grasp of finance.</p>
<p>You will come up with strategy ideas on your own, work out their economics, test them, and get them into production. The role runs from the first hypothesis all the way to live code.</p>

<h3>What You Will Do</h3>
<ul>
  <li><strong>Originate strategy ideas:</strong> Identify profitable opportunities across DeFi and work out how, and why, each one generates return.</li>
  <li><strong>Economic analysis:</strong> Gather on-chain and market data to calculate real returns after fees, borrowing costs, slippage, and gas.</li>
  <li><strong>Hypothesis testing:</strong> Check your assumptions, stress-test weak spots, and systematically iterate and improve strategy parameters.</li>
  <li><strong>Production engineering:</strong> Write high-performance code to automate strategies, interact with smart contracts, and take models into live production.</li>
  <li><strong>Protocol deep-dives:</strong> Dig into novel DeFi protocols and financial products, dissecting mechanics and backing up conclusions with defensible quantitative arguments.</li>
</ul>

<h3>What We Are Looking For</h3>
<ul>
  <li><strong>Deep understanding of DeFi:</strong> You know how automated market makers, lending pools, and yield protocols work under the hood, where yield originates, what systemic risks sit behind it, and when a strategy works or fails.</li>
  <li><strong>Solid grounding in traditional finance:</strong> Bonds, yield curves, interest rates, lending, derivatives, and arbitrage mechanics, with clear intuition for how these concepts transfer to digital asset markets.</li>
  <li><strong>Strong programming skills:</strong> Solid experience with Solidity or systems programming (Python, Rust, TypeScript). You can read and audit smart contracts, query on-chain data, and build automated execution tooling.</li>
  <li><strong>Hands-on research discipline:</strong> You do the work yourself, taking raw protocol data through to defensible risk-adjusted return figures.</li>
  <li><strong>Independence & initiative:</strong> You spot opportunities proactively and do not wait to be handed a problem.</li>
</ul>

<h3>Location & Work Environment</h3>
<ul>
  <li><strong>Workplace:</strong> Fully Remote (global team).</li>
  <li><strong>Focus:</strong> DeFi Hedge Fund & Algorithmic Trading Systems.</li>
</ul>

<h3>How to Apply</h3>
<p>To apply, send an email directly to <a href="mailto:careers@altitudedp.com?subject=Application%3A%20Quant%20Researcher%20%2F%20Strategy%20Developer">careers@altitudedp.com</a> with:</p>
<ul>
  <li>A brief note explaining why this role fits your background and experience</li>
  <li>Links to projects, code repositories, research, or work you are proud of</li>
  <li>Your CV, resume, or LinkedIn profile</li>
</ul>
<p><em>Official careers listing: <a href="https://altitudedp.com/careers/quant-researcher-strategy-developer" target="_blank" rel="noopener noreferrer">altitudedp.com/careers/quant-researcher-strategy-developer</a></em></p>`,
    },
    {
      job: {
        id: 'altitude-development-partners-risk-analyst',
        title: 'Risk Analyst',
        company: COMPANY_NAME,
        link: 'mailto:careers@altitudedp.com?subject=Application%3A%20Risk%20Analyst',
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
      rawDescription: `<h3>About the Role</h3>
<p>Altitude Development Partners is hiring a Risk Analyst for our DeFi hedge fund: someone who deeply understands both decentralized finance and traditional finance mechanics.</p>
<p>The core of the job is to take apart the fund's strategies and positions, work out where and under what conditions we could lose money, and propose concrete, actionable ways to manage and mitigate that risk.</p>

<h3>What You Will Do</h3>
<ul>
  <li><strong>Position breakdown:</strong> Dissect each strategy and portfolio position to uncover latent risks, edge cases, and conditions where losses could occur.</li>
  <li><strong>Correlation & concentration analysis:</strong> Assess shared sources of risk across positions, tail-risk events, and market conditions that could impact multiple strategies simultaneously.</li>
  <li><strong>Scenario stress-testing:</strong> Model severe market shocks: violent price dislocations, interest rate spikes, liquidity dry-ups, oracle failures, or heavy withdrawal cascades.</li>
  <li><strong>Liquidity & exit modeling:</strong> Accurately estimate time-to-exit under distress and quantify expected liquidation or slippage losses.</li>
  <li><strong>Risk parameters & controls:</strong> Propose position limits, leverage constraints, real-time monitoring metrics, and programmatic circuit breakers to cut or exit exposure.</li>
  <li><strong>Clear team communication:</strong> Deliver crisp, actionable risk assessments and decisions to portfolio managers and engineers.</li>
</ul>

<h3>What We Are Looking For</h3>
<ul>
  <li><strong>Grounding in financial mechanics:</strong> Clear mastery of yield sources, interest rate curves, cost of capital, leverage, collateralization ratios, and liquidation cascades.</li>
  <li><strong>Deep understanding of DeFi risk:</strong> Protocol insolvency risks, stablecoin depeg mechanics, smart contract vulnerabilities, oracle latency/manipulation, and protocol composability dependencies.</li>
  <li><strong>Portfolio-level perspective:</strong> You evaluate the aggregate risk across the entire book rather than isolating positions in a silo.</li>
  <li><strong>Data & scenario fluency:</strong> You translate theoretical vulnerabilities into concrete probabilities, numbers, and parameters the team can act on.</li>
  <li><strong>Actionable decision-making:</strong> Your deliverables are pragmatic decisions and risk bounds, not merely passive observations.</li>
</ul>

<h3>Location & Work Environment</h3>
<ul>
  <li><strong>Workplace:</strong> Fully Remote (global team).</li>
  <li><strong>Focus:</strong> DeFi Hedge Fund Portfolio Risk Management.</li>
</ul>

<h3>How to Apply</h3>
<p>To apply, send an email directly to <a href="mailto:careers@altitudedp.com?subject=Application%3A%20Risk%20Analyst">careers@altitudedp.com</a> with:</p>
<ul>
  <li>A brief note explaining why this role fits your background and experience</li>
  <li>Details or links to relevant risk modeling, financial analysis, or research you have conducted</li>
  <li>Your CV, resume, or LinkedIn profile</li>
</ul>
<p><em>Official careers listing: <a href="https://altitudedp.com/careers/risk-analyst" target="_blank" rel="noopener noreferrer">altitudedp.com/careers/risk-analyst</a></em></p>`,
    },
  ];

  // Ingest into jobs-cache.json
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const incomingIds = new Set(jobsToIngest.map((item) => item.job.id));

  // Remove existing Altitude Development Partners jobs to replace cleanly
  const filtered = allJobs.filter(
    (j) => !incomingIds.has(j.id) && !(j.company === COMPANY_NAME)
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
    console.log(`✓ Added job: "${job.title}" (slug: /${job.slug}, link: ${job.link})`);
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
