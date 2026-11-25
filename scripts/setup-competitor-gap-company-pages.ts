#!/usr/bin/env tsx
/**
 * Seed content/companies/*.md and favicons for competitor-gap ATS employers.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const COMPANIES: Array<{ slug: string; name: string; website: string; category: string; description: string }> = [
  {
    slug: 'arca',
    name: 'Arca',
    website: 'https://www.arcawealth.com',
    category: 'Crypto Asset Management',
    description:
      'Arca is a Los Angeles-based digital asset investment firm founded in 2018, operating hedge funds, venture strategies, and an SEC-registered investment adviser focused on blockchain-native assets. The team combines trading, research, and compliance capabilities for institutions and qualified investors participating in crypto markets. Arca publishes research, engages in token governance, and invests across DeFi, infrastructure, and liquid digital assets. Engineers and operators build portfolio systems, risk tooling, and data pipelines for regulated asset management workflows.',
  },
  {
    slug: 'nibiru',
    name: 'Nibiru',
    website: 'https://nibiru.fi',
    category: 'Layer-1 Blockchain',
    description:
      'Nibiru is a Layer-1 blockchain and smart contract platform delivering high-performance DeFi, trading, and application infrastructure. Built with Cosmos SDK interoperability and a developer-friendly Go and Wasm execution environment, Nibiru targets exchanges, perpetuals, and on-chain financial products. The protocol powers ecosystem applications such as Sai and community programs for builders in APAC and global remote hubs. Teams ship consensus, execution, and developer relations that keep the network production-ready for traders and DeFi users.',
  },
  {
    slug: 'sfox',
    name: 'SFOX',
    website: 'https://www.sfox.com',
    category: 'Crypto Prime Brokerage',
    description:
      'SFOX is a cryptocurrency prime brokerage and trading platform serving institutional and professional traders with aggregated liquidity, smart order routing, and post-trade settlement across major venues. Founded in 2014 and headquartered in Los Angeles, SFOX connects hedge funds, family offices, and proprietary desks to deep crypto markets with reporting and risk tools designed for regulated-adjacent workflows. Engineering and operations teams maintain low-latency connectivity, wallet segregation, and compliance processes that support large block trades and systematic strategies in digital assets.',
  },
  {
    slug: 'xion',
    name: 'XION',
    website: 'https://xion.burnt.com',
    category: 'Layer-1 / Consumer Crypto',
    description:
      'XION (formerly Burnt Finance) is building a consumer-focused Layer-1 designed for mainstream users with gasless, account-abstraction style onboarding and familiar payment flows. The network emphasizes mobile-friendly wallets, branded experiences for apps, and developer tools that abstract chain complexity for non-crypto-native audiences. Core teams work on protocol economics, wallets, and ecosystem partnerships that expand real-world usage beyond speculative trading. XION positions itself as infrastructure for applications that need Web2-grade UX with on-chain settlement.',
  },
  {
    slug: 'dtcpay',
    name: 'dtcpay',
    website: 'https://www.dtcpay.com',
    category: 'Crypto Payments',
    description:
      'dtcpay is a Singapore-based fintech providing fiat and crypto payment, wallet, and merchant acceptance services for businesses operating across Asia and digital-asset corridors. Licensed under MAS and related frameworks, dtcpay supports stablecoin settlement, card programs, and treasury accounts for enterprises that need regulated on-ramps and off-ramps. Engineering and compliance teams build transaction monitoring, wallet backends, and integrations with banking partners. dtcpay serves merchants, payment providers, and institutions modernizing cross-border money movement with blockchain settlement options.',
  },
  {
    slug: 'chaincode-labs',
    name: 'Chaincode Labs',
    website: 'https://chaincode.com',
    category: 'Bitcoin Research',
    description:
      'Chaincode Labs is a Bitcoin research and development center in New York supporting open-source contributors, protocol engineers, and educational programs that strengthen the Bitcoin network. The organization funds residencies, sponsors Bitcoin Core and Lightning ecosystem work, and publishes resources for developers learning to build on Bitcoin. Chaincode is known for rigorous engineering mentorship rather than token issuance, focusing on node software, privacy, scalability, and wallet security. Teams value deep protocol understanding and long-horizon contributions to public infrastructure.',
  },
  {
    slug: '3commas',
    name: '3Commas',
    website: 'https://3commas.io',
    category: 'Crypto Trading Tools',
    description:
      '3Commas is a crypto trading automation platform offering bots, portfolio management, and API integrations for retail and professional traders on centralized and decentralized venues. Founded in 2017, the Tallinn-based company provides DCA bots, grid strategies, signal following, and risk controls across hundreds of exchange accounts. Product and engineering teams ship trading infrastructure, exchange connectors, and analytics that help users automate strategies without operating their own stack. 3Commas focuses on reliability, exchange API resilience, and approachable UX for active crypto market participants.',
  },
  {
    slug: 'geo-browser',
    name: 'Geo Browser',
    website: 'https://www.geobrowser.io',
    category: 'Web3 Consumer',
    description:
      'Geo Browser is a consumer Web3 browser and wallet experience exploring geospatial, social, and on-chain discovery features for mainstream users. The team builds mobile and web clients that connect wallets, content, and location-aware applications with approachable onboarding. Engineering focuses on performance, privacy, and integrations with emerging L2 and consumer-crypto standards. Geo Browser participates in the broader movement to make decentralized applications feel as seamless as traditional mobile apps.',
  },
  {
    slug: 'aptos-foundation',
    name: 'Aptos Foundation',
    website: 'https://aptosfoundation.org',
    category: 'Foundation',
    description:
      'The Aptos Foundation supports the Aptos blockchain ecosystem through grants, events, community programs, and ecosystem growth initiatives. It coordinates developer education, regional community leads, and partnerships that expand adoption of the Aptos network and Move programming language. The Foundation works alongside Aptos Labs on governance, treasury deployment, and public-goods funding for tooling, security, and education. Teams combine developer relations, program management, and partnership development across global crypto hubs.',
  },
  {
    slug: 'hivemind-capital',
    name: 'Hivemind Capital',
    website: 'https://hivemind.capital',
    category: 'Crypto VC',
    description:
      'Hivemind Capital Partners is a crypto-native investment firm backing founders building financial infrastructure, DeFi, and digital asset services. The firm combines venture and liquid strategies with operational support for portfolio companies navigating regulatory and market structure shifts. Investment professionals and platform operators work on diligence, token design, governance, and go-to-market for early and growth-stage Web3 companies. Hivemind engages with founders on treasury, listing, and product milestones across global markets.',
  },
  {
    slug: 'overmind',
    name: 'Overmind',
    website: 'https://overmind.pro',
    category: 'Web3 Engineering',
    description:
      'Overmind is a blockchain engineering and analytics team hiring for smart contract, full-stack, and data roles on decentralized infrastructure projects. The organization partners with protocol teams to deliver production software, growth analytics, and integration work across EVM and alternative execution environments. Engineers emphasize Solidity, Rust, and modern Web3 application stacks. Overmind operates as a specialist builder and staffing partner for teams shipping on-chain products.',
  },
  {
    slug: 'capco',
    name: 'Capco',
    website: 'https://www.capco.com',
    category: 'Financial Services Consulting',
    description:
      'Capco is a global technology and management consultancy specialized in banking, capital markets, and payments transformation. Digital assets and blockchain practices advise institutions on tokenization, stablecoin operations, wallet infrastructure, and regulatory compliance alongside core banking programs. Capco deploys cross-functional teams of business analysts, architects, and engineers at tier-one financial institutions. Digital asset roles on Capco boards focus on blockchain product design, DvP settlement, and operational models for banks entering crypto markets.',
  },
  {
    slug: 'okta',
    name: 'Okta',
    website: 'https://www.okta.com',
    category: 'Identity & Security',
    description:
      'Okta is a leading identity and access management company providing single sign-on, multifactor authentication, and lifecycle management for enterprises worldwide. While primarily an enterprise security vendor, Okta hires specialists for Web3 wallet security, offensive security reviews, and networking products that intersect with decentralized identity experiments. Engineering culture emphasizes zero-trust architecture, developer-friendly APIs, and large-scale SaaS reliability. Select roles tagged for blockchain or Web3 security appear when customers adopt custody and digital asset workflows.',
  },
  {
    slug: 'metropolis',
    name: 'Metropolis',
    website: 'https://www.metropolis.io',
    category: 'Parking / Mobility Tech',
    description:
      'Metropolis is a technology company modernizing parking payments and mobility commerce with computer vision, membership, and contactless checkout for garages and venues. Operators and engineers build hardware-software systems that recognize vehicles, automate billing, and integrate with consumer wallets. A subset of roles references Web3 or digital wallet integrations as Metropolis explores modern payment rails. The company scales operations across U.S. metros with product, field engineering, and partnership teams.',
  },
  {
    slug: 'betsson-group',
    name: 'Betsson Group',
    website: 'https://www.betsson.com',
    category: 'Gaming & iGaming',
    description:
      'Betsson Group is an international gaming operator running online casino, sportsbook, and gaming brands with licenses across Europe and other regulated markets. Technology teams build high-availability gaming platforms, payments, fraud prevention, and customer analytics. Some engineering roles intersect with Web3 wallets, blockchain payments, or digital asset integrations as the group experiments with new payment technology. Betsson emphasizes responsible gaming compliance, multilingual product delivery, and scalable cloud infrastructure.',
  },
  {
    slug: 'project44',
    name: 'project44',
    website: 'https://www.project44.com',
    category: 'Supply Chain SaaS',
    description:
      'project44 provides a supply-chain visibility platform connecting shippers, carriers, and logistics partners with real-time tracking and analytics. Enterprise engineers build API integrations, data pipelines, and predictive ETA models across global freight networks. Occasional roles reference blockchain pilots, trade finance, or digitized document workflows where distributed ledgers support logistics transparency. project44 serves Fortune 500 shippers with cloud-native architecture and operational reliability as primary engineering values.',
  },
  {
    slug: 'akuna-capital',
    name: 'Akuna Capital',
    website: 'https://www.akunacapital.com',
    category: 'Trading & Market Making',
    description:
      'Akuna Capital is a proprietary trading firm and market maker active in options, futures, and quantitative strategies across global exchanges. Engineering teams build low-latency systems, pricing models, and risk platforms in Chicago, Sydney, and distributed offices. Digital asset desks extend similar quantitative infrastructure to crypto derivatives and spot venues where Akuna participates. The firm values C++, Python, and mathematical modeling excellence for production trading systems.',
  },
  {
    slug: 'sparksoft-corporation',
    name: 'Sparksoft Corporation',
    website: 'https://www.sparksoftcorp.com',
    category: 'IT Consulting',
    description:
      'Sparksoft Corporation is a U.S.-based IT services and consulting firm delivering software engineering, cloud migration, and federal civilian technology programs. Consultants embed with agency and commercial clients to modernize legacy systems, implement DevSecOps, and deliver analytics platforms. Some public sector postings reference distributed ledger, digital identity, or blockchain-adjacent modernization work. Sparksoft recruits software engineers, architects, and program managers for long-term client engagements.',
  },
  {
    slug: 'future-works',
    name: 'Future',
    website: 'https://future.co',
    category: 'Health Tech',
    description:
      'Future (Future.co) is a personalized health coaching platform pairing members with fitness coaches and data-driven training plans through a mobile app. The company builds consumer software, coaching operations, and wearable integrations focused on long-term health outcomes rather than crypto products. Engineering and product teams emphasize behavioral design, coaching workflows, and scalable content delivery. Hashtag Web3 may list only roles whose descriptions include digital asset keywords when Future posts mixed job boards.',
  },
  {
    slug: 'disco',
    name: 'DISCO',
    website: 'https://www.disco.xyz',
    category: 'Web3 Social',
    description:
      'DISCO is a decentralized social and identity platform exploring on-chain profiles, creator monetization, and portable reputation across applications. Builders work on smart contracts, client applications, and protocols that let users own social graph data and credentials. The team experiments with community-led growth, tokenized incentives, and integrations with broader Web3 identity standards. Engineering roles span full-stack, protocol, and growth when DISCO expands product surfaces.',
  },
  {
    slug: 'ideo-colab-ventures',
    name: 'IDEO CoLab Ventures',
    website: 'https://www.ideocolab.com',
    category: 'Web3 VC & Design',
    description:
      'IDEO CoLab Ventures is the crypto investment and incubation arm linked to IDEO, supporting founders at the intersection of design, consumer experience, and decentralized technology. The group backs early-stage protocols, applications, and infrastructure with venture capital and collaborative design sprints. Operators help portfolio companies with UX research, go-to-market narrative, and partnerships across the Web3 ecosystem. Open roles are limited but often span venture platform, design engineering, and ecosystem partnerships.',
  },
  {
    slug: 'xsolla',
    name: 'Xsolla',
    website: 'https://xsolla.com',
    category: 'Gaming Commerce',
    description:
      'Xsolla provides commerce, payments, and monetization tools for game developers and publishers worldwide. The company operates payment rails, fraud controls, and distribution services connecting studios to global players. Web3-oriented teams build NFT marketplaces, wallet integrations, smart-contract payment flows, and blockchain game infrastructure for studios adopting digital assets. Engineering spans high-scale payments compliance and newer crypto-native product lines such as smart wallets and account abstraction.',
  },
  {
    slug: 'meter',
    name: 'Meter',
    website: 'https://www.meter.com',
    category: 'Networking Infrastructure',
    description:
      'Meter builds enterprise networking hardware and software for fast, managed Wi-Fi and ISP infrastructure at offices, campuses, and multi-tenant buildings. Engineers design routers, cloud controllers, and installation operations that compete with legacy telecom vendors. Select roles reference Web3, cryptocurrency, or decentralized infrastructure keywords when Meter explores adjacent markets or clients. The company sells networking as a service with emphasis on reliability, field operations, and polished enterprise UX.',
  },
  {
    slug: 'toogeza',
    name: 'Toogeza',
    website: 'https://www.toogeza.com',
    category: 'Web3 Product',
    description:
      'Toogeza is a product-led technology company building consumer and developer experiences in the crypto and Web3 space. Teams iterate on applications that combine wallet connectivity, content, and community features for emerging markets and global users. Engineering and growth roles focus on mobile delivery, backend APIs, and partnerships that expand distribution. Hashtag Web3 ingests Toogeza roles that meet on-chain and digital asset keyword thresholds from the company careers board.',
  },
];

const OUT_DIR = path.join(process.cwd(), 'public/logo/companies');

async function faviconToPng(domain: string, dest: string): Promise<boolean> {
  const url = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < 80) return false;
  await sharp(buf)
    .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(dest);
  return true;
}

async function main() {
  const companiesDir = path.join(process.cwd(), 'content/companies');
  fs.mkdirSync(companiesDir, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const row of COMPANIES) {
    const mdPath = path.join(companiesDir, `${row.slug}.md`);
    const body = `${row.name} is an organization listed on Hashtag Web3 when open roles match our crypto and Web3 relevance filters.\n`;
    const front = [
      '---',
      `name: ${row.name}`,
      `website: '${row.website}'`,
      `category: ${row.category}`,
      `description: "${row.description.replace(/"/g, '\\"')}"`,
      'lastUpdated: 2026-11-25',
      '---',
      '',
    ].join('\n');
    if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8').length < 200) {
      fs.writeFileSync(mdPath, front + body);
      console.log(`wrote ${row.slug}.md`);
    }

    const domain = new URL(row.website).hostname.replace(/^www\./, '');
    const logoPath = path.join(OUT_DIR, `${row.slug}.png`);
    if (!fs.existsSync(logoPath)) {
      const jobSibling = path.join(process.cwd(), 'public/logo/job', `${row.slug}.png`);
      if (fs.existsSync(jobSibling)) {
        fs.copyFileSync(jobSibling, logoPath);
        console.log(`copied logo job → companies ${row.slug}`);
      } else if (await faviconToPng(domain, logoPath)) {
        console.log(`fetched favicon ${row.slug}`);
      } else {
        console.warn(`logo missing ${row.slug}`);
      }
    }
  }

  // Ledger already has md + rich about; ensure logo
  const ledgerLogo = path.join(OUT_DIR, 'ledger.png');
  if (!fs.existsSync(ledgerLogo)) await faviconToPng('ledger.com', ledgerLogo);
}

main();