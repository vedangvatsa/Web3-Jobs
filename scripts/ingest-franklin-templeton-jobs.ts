import fs from 'fs';
import path from 'path';

const franklinTempletonJobs = [
  {
    id: 'ft-digital-product-manager-blockchain',
    title: 'Digital Product Manager (Blockchain & Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote (US)',
    department: 'Digital Assets & Tokenization',
    active: true,
    slug: 'productft01',
    description: `<h3><strong>Role Overview</strong></h3><p>Franklin Templeton is hiring a Digital Product Manager within our Digital Assets team to drive the product lifecycle of tokenized investment funds, blockchain data integrations, and Web3 wealth management platforms.</p><h3><strong>Responsibilities</strong></h3><ul><li>Define product requirements and user stories for blockchain-native financial products including FOBXX (FOBXX On-Chain Money Market Fund).</li><li>Collaborate with protocol developers, smart contract auditors, transfer agents, and institutional custody partners.</li><li>Manage product backlog, sprint prioritization, and technical roadmap execution for digital asset management tools.</li><li>Analyze on-chain transaction metrics, wallet interaction patterns, and gas efficiency to optimize investor onboarding.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>5+ years of digital product management experience in fintech, asset management, or Web3 platforms.</li><li>Working knowledge of EVM chains, ERC-20 token standards, smart contracts, and digital asset custody.</li></ul>`
  },
  {
    id: 'ft-digital-product-manager-hyderabad',
    title: 'Digital Product Manager (Digital Assets & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'Hyderabad, India (Hybrid)',
    department: 'Digital Wealth & Tokenization',
    active: true,
    slug: 'productft02',
    description: `<h3><strong>Role Overview</strong></h3><p>Join Franklin Templeton's Global Digital Assets engineering hub in Hyderabad to build scalable tokenization APIs, wallet integrations, and digital asset reporting interfaces.</p><h3><strong>Responsibilities</strong></h3><ul><li>Lead cross-functional engineering pods building high-throughput blockchain integration APIs for asset servicing.</li><li>Partner with global product leads to translate regulatory requirements and tokenization specs into technical deliverables.</li><li>Oversee quality assurance, security testing, and deployment pipelines for decentralized finance (DeFi) analytics tools.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>4+ years in software product management with focus on financial APIs, blockchain tech, or enterprise fintech.</li></ul>`
  },
  {
    id: 'ft-director-digital-audience-engagement',
    title: 'Director, Digital Audience Engagement (Crypto & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Hybrid',
    department: 'Digital Asset Marketing',
    active: true,
    slug: 'marketingft03',
    description: `<h3><strong>Role Overview</strong></h3><p>Lead global marketing, educational content, and digital audience engagement strategies for Franklin Templeton's Digital Assets and Crypto division.</p><h3><strong>Responsibilities</strong></h3><ul><li>Design multi-channel campaigns educating institutional investors, RIAs, and wealth advisors on blockchain tokenization and crypto investment strategies.</li><li>Publish research summaries, whitepapers, and market commentary analyzing public blockchain adoption and DeFi protocols.</li><li>Manage digital acquisition channels, developer relations touchpoints, and institutional event sponsorships.</li></ul>`
  },
  {
    id: 'ft-program-manager-digital-audience-engagement',
    title: 'Program Manager, Digital Audience Engagement (Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Digital Assets & Innovation',
    active: true,
    slug: 'managerft04',
    description: `<h3><strong>Role Overview</strong></h3><p>Coordinate cross-functional marketing campaigns, Web3 content operations, and institutional distribution programs for digital asset products.</p><h3><strong>Responsibilities</strong></h3><ul><li>Manage editorial calendars, thought leadership publishing, and podcast operations covering blockchain technology and digital money markets.</li><li>Track campaign analytics, conversion funnels, and RIA engagement across digital asset portals.</li></ul>`
  },
  {
    id: 'ft-senior-administrative-assistant-crypto',
    title: 'Senior Administrative Assistant (Franklin Templeton Crypto)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Crypto Operations',
    active: true,
    slug: 'operationsft05',
    description: `<h3><strong>Role Overview</strong></h3><p>Provide executive administrative and operational support to the leadership team of Franklin Templeton's Digital Assets & Crypto investment group.</p><h3><strong>Responsibilities</strong></h3><ul><li>Manage executive calendars, travel arrangements, and event logistics for global Web3 conferences and institutional investor summits.</li><li>Coordinate department vendor contracts, invoice processing, and cross-team communications between investment management, compliance, and product pods.</li></ul>`
  },
  {
    id: 'ft-senior-research-analyst-digital-assets',
    title: 'Senior Research Analyst (Digital Assets & Crypto)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / New York, NY',
    department: 'Digital Assets Research',
    active: true,
    slug: 'researchft06',
    description: `<h3><strong>Role Overview</strong></h3><p>Conduct fundamental and quantitative research on layer-1/layer-2 protocols, DeFi primitives, token economics, and emerging crypto networks to inform fund management decisions.</p><h3><strong>Responsibilities</strong></h3><ul><li>Analyze protocol revenue models, staking dynamics, governance proposals, and on-chain liquidity metrics across Bitcoin, Ethereum, Solana, and alt-L1s.</li><li>Publish institutional research reports, valuation frameworks, and risk assessments for portfolio managers.</li></ul>`
  },
  {
    id: 'ft-compliance-manager-crypto-digital-assets',
    title: 'Compliance Manager (Crypto & Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote (US)',
    department: 'Legal & Regulatory Compliance',
    active: true,
    slug: 'complianceft07',
    description: `<h3><strong>Role Overview</strong></h3><p>Oversee regulatory compliance, SEC filing reviews, and AML/KYC policies for Franklin Templeton's digital asset funds and tokenization initiatives.</p><h3><strong>Responsibilities</strong></h3><ul><li>Monitor evolving US and international crypto regulations (SEC, CFTC, MiCA, FinCEN Travel Rule).</li><li>Conduct compliance reviews for smart contracts, wallet custody arrangements, and decentralized protocol interactions.</li></ul>`
  },
  {
    id: 'ft-digital-asset-trader-quantitative-analyst',
    title: 'Digital Asset Trader & Quantitative Analyst',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Digital Asset Investment Management',
    active: true,
    slug: 'traderft08',
    description: `<h3><strong>Role Overview</strong></h3><p>Execute OTC crypto trades, manage staking infrastructure, and develop quantitative algorithmic trading models for digital asset portfolios.</p><h3><strong>Responsibilities</strong></h3><ul><li>Execute spot and derivative transactions across liquidity venues, OTC desks, and centralized/decentralized exchanges.</li><li>Build quantitative models for arbitrage, yield optimization, and portfolio risk management in crypto assets.</li></ul>`
  },
  {
    id: 'ft-blockchain-solutions-architect',
    title: 'Blockchain Solutions Architect (Tokenized Funds & Protocols)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote',
    department: 'Tokenization & Protocol Engineering',
    active: true,
    slug: 'architectft09',
    description: `<h3><strong>Role Overview</strong></h3><p>Lead the architectural design of smart contract systems, tokenization protocols, and cross-chain bridge integrations for tokenized money market funds.</p><h3><strong>Responsibilities</strong></h3><ul><li>Write, audit, and deploy production-grade Solidity smart contracts for fund token issuance, transfer restrictions, and yield distribution.</li><li>Integrate decentralized oracle networks (Chainlink), MPC key custody solutions, and zero-knowledge privacy tools into enterprise DLT.</li></ul>`
  },
  {
    id: 'ft-legal-counsel-digital-assets-fintech',
    title: 'Legal Counsel (Digital Assets, Crypto & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Hybrid',
    department: 'Global Legal & Regulatory',
    active: true,
    slug: 'legalft10',
    description: `<h3><strong>Role Overview</strong></h3><p>Provide legal advice on digital asset product launches, SEC registration, tokenization structures, custody agreements, and protocol partnerships.</p><h3><strong>Responsibilities</strong></h3><ul><li>Draft and negotiate agreements with crypto custodians, market makers, protocol foundations, and technology providers.</li><li>Analyze legal implications of decentralized governance, staking mechanics, and tokenized security offerings.</li></ul>`
  },
  {
    id: 'ft-client-relationship-manager-crypto-institutions',
    title: 'Institutional Relationship Manager (Crypto & Web3 Ecosystems)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / London, UK',
    department: 'Institutional Digital Assets Sales',
    active: true,
    slug: 'salesft11',
    description: `<h3><strong>Role Overview</strong></h3><p>Drive institutional business development, partnership expansion, and client relationships across crypto-native funds, DAOs, protocol foundations, and wealth managers.</p><h3><strong>Responsibilities</strong></h3><ul><li>Represent Franklin Templeton's digital asset strategies and tokenized fund offerings to institutional allocators globally.</li><li>Build strategic co-marketing and integration partnerships with Web3 ecosystem platforms, custodians, and exchanges.</li></ul>`
  }
];

function ingestFranklinTempleton() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const job of franklinTempletonJobs) {
    const idx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
    if (idx >= 0) {
      cacheData[idx] = { ...cacheData[idx], ...job };
      updated++;
    } else {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested Franklin Templeton Jobs: ${added} added, ${updated} updated. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestFranklinTempleton();
