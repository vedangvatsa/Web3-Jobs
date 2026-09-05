import fs from 'fs';
import path from 'path';

const pwcWeb3Jobs = [
  {
    id: 'pwc-digital-assets-senior-manager-tech',
    title: 'Digital Assets Senior Manager (Technology)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Tech Consulting',
    active: true,
    slug: 'seniorpwc01',
    description: `<h3><strong>Role Overview</strong></h3><p>PwC is seeking a Digital Assets Senior Manager within our Technology Consulting practice to lead client engagements across enterprise blockchain readiness, Web3 strategy, and digital asset platform integration.</p><h3><strong>Responsibilities</strong></h3><ul><li>Architect enterprise blockchain and distributed ledger technology (DLT) solutions for institutional clients.</li><li>Lead cross-functional engineering and consulting teams developing decentralized applications (dApps) and smart contract workflows using Solidity, Rust, and Go.</li><li>Advise Fortune 500 executives on digital asset custody, tokenized real-world assets (RWA), stablecoins, and Web3 infrastructure governance.</li><li>Manage end-to-end client delivery, risk frameworks, and regulatory compliance assessments for digital asset deployments.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>8+ years of experience in technology consulting, software architecture, or financial technology.</li><li>Hands-on expertise with public and permissioned blockchain protocols (Ethereum, Solana, Hyperledger, Polygon).</li><li>Strong background in digital asset custody, smart contract security auditing, and financial services integration.</li></ul>`
  },
  {
    id: 'pwc-digital-assets-crypto-manager-ny',
    title: 'Digital Assets Manager (Technology)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Tech Consulting',
    active: true,
    slug: 'managerpwc02',
    description: `<h3><strong>Role Overview</strong></h3><p>PwC is hiring a Digital Assets Manager to drive technical implementation, dApp architecture, and blockchain infrastructure integration for global financial services clients.</p><h3><strong>Responsibilities</strong></h3><ul><li>Deliver technical advisory on blockchain indexing, node infrastructure, and API integration for crypto platforms.</li><li>Oversee smart contract deployment pipelines, security reviews, and tokenization protocol designs.</li><li>Collaborate with client product and engineering teams to translate business requirements into scalable Web3 solutions.</li><li>Prepare technical roadmaps, risk matrices, and architecture blueprints for digital asset custody.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>5+ years of experience in software development, technical project management, or IT consulting.</li><li>Demonstrated knowledge of Web3 architecture, EVM chains, and cryptographic key management.</li></ul>`
  },
  {
    id: 'pwc-ai-blockchain-architect-senior-manager',
    title: 'AI / Blockchain Architect Senior Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'Tampa, FL / Hybrid',
    department: 'Platform Architecture & Blockchain',
    active: true,
    slug: 'architectpwc03',
    description: `<h3><strong>Role Overview</strong></h3><p>Join PwC as an AI / Blockchain Architect Senior Manager to lead the convergence of artificial intelligence pipelines with decentralized data infrastructure.</p><h3><strong>Responsibilities</strong></h3><ul><li>Design hybrid AI and blockchain platform architectures combining decentralized data verification, zero-knowledge proofs (ZKP), and machine learning pipelines.</li><li>Establish technical standards for enterprise data integrity, automated smart contract execution, and AI model provenance on-chain.</li><li>Guide enterprise clients through complex integration of cloud infrastructure (AWS/GCP/Azure) with Web3 protocols.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>10+ years in platform engineering and software architecture with deep exposure to both AI pipelines and blockchain networks.</li></ul>`
  },
  {
    id: 'pwc-digital-assurance-digital-assets-senior-associate',
    title: 'Digital Assurance & Transparency - Digital Assets Senior Associate',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'San Francisco, CA / Hybrid',
    department: 'Digital Asset Audit & Assurance',
    active: true,
    slug: 'seniorpwc04',
    description: `<h3><strong>Role Overview</strong></h3><p>PwC's Digital Assurance & Transparency team is looking for a Digital Assets Senior Associate to perform audit testing, proof-of-reserves verification, and control assessments for crypto exchanges and institutional custodians.</p><h3><strong>Responsibilities</strong></h3><ul><li>Evaluate internal IT controls, cryptographic key management procedures, and transaction processing systems for digital asset platforms.</li><li>Analyze blockchain transaction logs using chain analytics tools (TRM Labs, Chainalysis) to verify asset balances and reserves.</li><li>Prepare audit documentation, risk assessments, and compliance reports adhering to GAAP, IFRS, and SOC standards.</li></ul><h3><strong>Qualifications</strong></h3><ul><li>3+ years in IT audit, digital assurance, or public accounting with specialized knowledge of cryptocurrency accounting.</li></ul>`
  },
  {
    id: 'pwc-bcm-assurance-digital-assets-manager',
    title: 'BCM - Assurance - Digital Assets Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'San Francisco, CA / Hybrid',
    department: 'Banking & Capital Markets Assurance',
    active: true,
    slug: 'managerpwc05',
    description: `<h3><strong>Role Overview</strong></h3><p>Manage financial statement audits and regulatory compliance engagements for major banking and capital markets clients engaging in digital asset custody and trading.</p><h3><strong>Responsibilities</strong></h3><ul><li>Lead audit teams reviewing financial disclosures, token valuation methodologies, and digital asset reserve balances.</li><li>Assess anti-money laundering (AML), Know Your Customer (KYC), and Travel Rule compliance for institutional crypto platforms.</li><li>Interface with regulatory authorities and client executives on digital asset accounting standards.</li></ul>`
  },
  {
    id: 'pwc-awm-digital-assets-senior-manager',
    title: 'AWM - Digital Assets Senior Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Asset & Wealth Management Advisory',
    active: true,
    slug: 'seniorpwc06',
    description: `<h3><strong>Role Overview</strong></h3><p>Lead PwC's Asset & Wealth Management advisory practice in structuring digital asset investment products, crypto ETFs, and tokenized private fund vehicles.</p><h3><strong>Responsibilities</strong></h3><ul><li>Advise hedge funds, private equity sponsors, and asset managers on launch strategies for crypto funds and tokenized RWAs.</li><li>Develop fund administration, valuation, and custody governance frameworks for digital asset portfolios.</li></ul>`
  },
  {
    id: 'pwc-awm-assurance-digital-assets-manager',
    title: 'AWM - Assurance - Digital Assets Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Asset & Wealth Management Assurance',
    active: true,
    slug: 'managerpwc07',
    description: `<h3><strong>Role Overview</strong></h3><p>Manage digital asset audit engagements for asset management clients holding cryptocurrencies, tokenized securities, and venture investments.</p><h3><strong>Responsibilities</strong></h3><ul><li>Execute audit procedures verifying digital asset ownership, wallet signing authority, and fund NAV calculations.</li><li>Review custodian SOC reports, smart contract audit reports, and valuation inputs.</li></ul>`
  },
  {
    id: 'pwc-digital-assets-crypto-director',
    title: 'Digital Assets & Crypto Director (Consulting & Strategy)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Digital Assets Advisory',
    active: true,
    slug: 'directorpwc08',
    description: `<h3><strong>Role Overview</strong></h3><p>As a Director in PwC's Web3 & Digital Assets practice, lead market expansion, strategic client relationships, and high-impact consulting engagements across the crypto ecosystem.</p><h3><strong>Responsibilities</strong></h3><ul><li>Build C-suite relationships with Web3 founders, global banks, and institutional market infrastructure providers.</li><li>Drive thought leadership on central bank digital currencies (CBDC), stablecoin regulations, and decentralized financial markets.</li></ul>`
  },
  {
    id: 'pwc-bcm-tax-manager-fintech-crypto',
    title: 'Banking & Capital Markets Tax Manager (FinTech & Crypto)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Chicago, IL / Hybrid',
    department: 'FinTech & Crypto Tax Advisory',
    active: true,
    slug: 'managerpwc09',
    description: `<h3><strong>Role Overview</strong></h3><p>PwC's FinTech Tax practice is hiring a Manager to advise institutional crypto clients, decentralized protocols, and digital banks on complex domestic and international tax compliance.</p><h3><strong>Responsibilities</strong></h3><ul><li>Provide tax structuring advice for staking rewards, token generation events (TGE), cross-border crypto transactions, and digital asset derivatives.</li><li>Manage tax reporting and compliance engagements for publicly traded crypto firms and crypto investment funds.</li></ul>`
  },
  {
    id: 'pwc-technology-consulting-associate-digital-assets',
    title: 'Technology Consulting Associate (Digital Assets & Payments)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / San Francisco, CA / Hybrid',
    department: 'Digital Assets Consulting',
    active: true,
    slug: 'associatepwc10',
    description: `<h3><strong>Role Overview</strong></h3><p>Join PwC's Technology Consulting practice as a Digital Assets & Payments Associate. In this role, you will work alongside senior technology architects and industry consultants to help global financial institutions, payment networks, and enterprise clients design, evaluate, and implement blockchain infrastructure, stablecoin payment rails, and tokenized asset platforms.</p><h3><strong>Key Responsibilities</strong></h3><ul><li>Support client engagement teams in conducting technical evaluations of public and permissioned blockchain networks (Ethereum, Solana, Polygon, Avalanche, Hyperledger).</li><li>Assist in documenting architecture requirements, smart contract transaction flows, and API integration specifications for digital asset custody and payment platforms.</li><li>Perform quantitative analysis on market trends, stablecoin settlement volumes, tokenized real-world asset (RWA) flows, and decentralized finance (DeFi) primitives.</li><li>Participate in proof-of-concept testing, decentralized application (dApp) user experience reviews, and smart contract workflow validation.</li><li>Prepare high-impact client presentations, industry whitepapers, and benchmarking studies on central bank digital currencies (CBDCs), MiCA regulations, and SEC compliance frameworks.</li></ul><h3><strong>Key Qualifications</strong></h3><ul><li>Bachelor's or Master's degree in Computer Science, Information Systems, Engineering, Finance, Economics, or related quantitative discipline.</li><li>Demonstrated interest or hands-on experience in Web3 technology, EVM smart contracts, digital asset custody, or fintech payment infrastructure.</li><li>Strong analytical and problem-solving skills, with the ability to communicate complex technical concepts to non-technical stakeholders.</li><li>Familiarity with programming languages (Solidity, Python, JavaScript/TypeScript, Go) or blockchain indexing tools (Etherscan, Dune Analytics, Chainalysis) is a strong plus.</li><li>Excellent teamwork, written communication, and presentation skills.</li></ul><h3><strong>Compensation & Benefits</strong></h3><ul><li>Competitive entry-level salary ($95,000 - $125,000 USD base depending on location) plus annual performance bonus and certification sponsorship.</li><li>Comprehensive medical, dental, and vision insurance coverage starting on day one.</li><li>401(k) retirement plan with PwC matching contributions.</li><li>Generous paid time off (PTO), firm holidays, and annual firm-wide disconnect weeks.</li><li>Structured career mentorship, technical training programs, and support for professional certifications (CISA, AWS, Certified Blockchain Developer).</li></ul><h3><strong>About PwC Digital Assets Consulting</strong></h3><p>PricewaterhouseCoopers (PwC) is a global leader in professional services operating across 151 countries. PwC's Technology Consulting and Digital Assets practice provides strategic guidance and technical implementation to Fortune 500 banks, asset managers, and Web3 enterprises driving the future of digital finance, stablecoins, and tokenized markets.</p>`
  }
];

function ingestPwc() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const job of pwcWeb3Jobs) {
    const idx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
    if (idx >= 0) {
      cacheData[idx] = { ...cacheData[idx], ...job };
      updated++;
    } else {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested PwC Web3 Jobs with descriptions: ${added} added, ${updated} updated. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestPwc();
