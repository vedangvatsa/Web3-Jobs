import fs from 'fs';
import path from 'path';

const job = {
  id: 'kappa-lab-quant-trader-297472',
  title: 'Quant Trader',
  company: 'Kappa Lab Ltd',
  location: 'London, United Kingdom (Hybrid)',
  type: 'Full-time',
  date: '2026-08-12',
  source: 'GoHire [gohire]',
  link: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/',
  applyUrl: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/',
  department: 'Quantitative Trading',
  salary: 'Competitive Salary',
  active: true,
  description: `About Kappa Lab:
Kappa Lab is a digital-assets market maker. We provide continuous, round-the-clock liquidity across 50+ centralised and decentralised exchanges, quoting a wide range of assets. Our proprietary technology and quantitative models let us price consistently and respond quickly across every venue we trade.

About the role:
As a Quantitative Trader you will join a hands-on trading team, taking ownership of live market-making strategies while researching and prototyping new ones. This is a role for someone who enjoys the challenge of achieving high performance and PnL plus the analytical side of markets and the engineering that makes trading work in practice.

What you will do:
- Own live market-making strategies: tune quoting parameters, spreads, sizing and hedging, and diagnose and improve performance
- Research, prototype and launch new quantitative strategies across venues and asset classes
- Analyse execution quality in depth - fill quality, adverse selection, realised spreads, and trading costs
- Work in our configuration-as-code platform, where strategy parameters are version-controlled, reviewed and deployed like software
- Monitor live trading and manage risk through volatile market conditions
- Work closely with engineering on the systems you trade through, and contribute code to them yourself

What we are looking for:
- Strong quantitative reasoning and real comfort applying statistics to noisy, fast-moving data
- Production-grade Python: code others can maintain, sensible use of version control, and the ability to debug a live system under pressure
- Evidence you can turn large market datasets into a decision and clearly explain your reasoning
- Familiarity with cryptocurrency markets, blockchain technology, and trading concepts
- Sound judgement about risk: knowing when to size down, hedge or stop
- A proactive mindset and ability to spot opportunities, move fast, and make things happen

Strongly valued:
- Experience in market making, high-frequency trading, or systematic execution
- Proficiency in Rust
- Familiarity with DeFi and on-chain execution

Location and Working Style:
We have offices in London (UK) and Dubai (UAE) and operate on a hybrid basis.`,
  skills: ['Quant Trading', 'Python', 'Rust', 'DeFi', 'Market Making', 'Crypto', 'High-Frequency Trading'],
  slug: 'kappalabquanttrader297472'
};

function ingest() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const idx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link || j.slug === job.slug);
  if (idx >= 0) {
    cacheData[idx] = { ...cacheData[idx], ...job };
    console.log(`Updated job: ${job.title} at ${job.company}`);
  } else {
    cacheData.unshift(job);
    console.log(`Added new job: ${job.title} at ${job.company}`);
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  console.log(`Successfully updated jobs-cache.json. Total jobs: ${cacheData.length}`);
}

ingest();
