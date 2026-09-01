import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/company-profiles.ts');
let fileText = fs.readFileSync(filePath, 'utf8');

const FINAL_EXPANSIONS = {
  "kalshi": " Backed by Sequoia Capital, Y Combinator, and Charles Schwab, Kalshi operates a regulated exchange where market participants trade directly on economic indicators, inflation rate decisions, political elections, and financial metrics. The platform brings Wall Street quantitative microstructure and high-concurrency orderbook execution to prediction markets under strict CFTC oversight.",
  "toku": " Toku automates complex token vesting schedules, employment tax withholdings, and cross-border payroll compliance so Web3 organizations can scale remote workforces legally across 100+ global jurisdictions. Backed by top crypto venture funds, Toku provides DAOs, protocols, and enterprises with turn-key token grant administration and multi-currency payout infrastructure.",
  "morpho": " Morpho Blue provides permissionless lending primitives that allow risk managers and DeFi protocols to deploy isolated lending markets with customizable collateral parameters and dynamic interest rate curves. Morpho matches supply and demand peer-to-peer while falling back on underlying liquidity pools like Compound and Aave, prioritizing formal verification, smart contract security, and capital efficiency.",
  "vesta": " Vesta's decentralized Layer 1 stablecoin protocol enables collateralized minting of VST with zero interest rates, maximizing digital asset capital efficiency across modular blockchain ecosystems. By enabling users to deposit diverse digital assets as collateral, Vesta provides decentralized liquidity, automated liquidation safety, and sustainable yield opportunities for Web3 participants.",
  "sei-labs": " Built with parallelized execution and specialized consensus mechanics, Sei Network delivers sub-second transaction finality and Wall Street-grade orderbook throughput for high-frequency Web3 trading applications. Sei Labs empowers developers to launch high-performance DEXs, perpetual futures markets, and gaming protocols with native EVM compatibility and built-in matching engines.",
  "partisia-blockchain": " Partisia Blockchain integrates privacy-preserving multi-party computation with Layer 1 public consensus, allowing enterprises to execute confidential computations on sensitive data without exposing private state on-chain. Built for healthcare, financial compliance, and confidential data exchanges, Partisia protects proprietary user information while maintaining verifiable auditability.",
  "yeet": " YEET combines casual mobile gameplay with tokenized rewards and social community loops, giving mainstream users frictionless access to digital asset ownership and Web3 gaming incentives. Built for consumer adoption, the platform utilizes verifiable random functions and gasless onboarding to create viral, interactive Web3 gaming experiences.",
  "caladan": " Caladan provides 24/7 quantitative market making across 100+ crypto exchanges, deploying high-frequency trading algorithms to maintain continuous orderbook liquidity globally. Operating with proprietary algorithmic execution and automated risk management systems, Caladan supplies market liquidity for leading blockchain protocols, tokens, and digital asset venues.",
  "localcoin": " Localcoin operates thousands of cash-to-crypto kiosk terminals across North America, giving everyday consumers a compliant physical gateway to trade digital assets. Localcoin enables retail users to buy and sell Bitcoin, Ethereum, and digital currencies instantly with cash through user-friendly retail kiosks integrated with local banking rails.",
  "groma": " Groma tokenizes residential real estate assets on blockchain rails, empowering retail investors with fractional property ownership, automated rent distribution, and property management. By combining transparent property administration, digital asset security, and smart contract distribution, Groma democratizes access to institutional-grade real estate portfolios.",
  "anagram": " Anagram collaborates hands-on with early-stage crypto founders, providing venture capital, applied cryptography research, token economic modeling, and protocol architecture guidance. Founded by experienced Web3 investors and systems engineers, Anagram incubates core decentralization infrastructure, zero-knowledge protocols, and distributed network primitives.",
  "ethereum-institutional": " Ethereum Institutional collaborates with tier-one banks, asset managers, and market infrastructure providers to advance understanding, regulatory clarity, and real-world adoption of Ethereum-based financial systems. Through technical workshops, regulatory briefings, and partner alignment, the organization positions Ethereum as foundational infrastructure for global capital markets.",
  "dakota": " Dakota provides corporate crypto banking, yield-bearing USD treasury accounts, and global payout rails built specifically for Web3 startups, protocols, and decentralized organizations. Offering automated yield strategies, zero-fee wire transfers, and corporate cards, Dakota bridges traditional commercial banking with crypto-native financial operations.",
  "beam": " Beam empowers game studios with seamless account abstraction, NFT marketplaces, and in-game asset management SDKs built on high-performance Avalanche subnet infrastructure. Launched by Merit Circle DAO, Beam provides game developers with full-stack tools to build, deploy, and scale player-owned game economies.",
  "molecule": " Molecule's DeSci platform connects academic researchers with BioDAOs, using IP-NFTs and smart contract funding protocols to finance early-stage biotech and longevity research. Molecule empowers scientific collectives to fund drug discovery, host intellectual property on-chain, and decentralize biomedical research and development.",
  "foundation": " Foundation's curated NFT platform provides digital creators with elegant auction mechanisms, transparent smart contract royalties, and direct connection with global art collectors. Foundation empowers digital artists to mint, display, and auction unique creative assets on Ethereum smart contracts with minimalist design and creator-first tools.",
  "logos": " Logos develops peer-to-peer messaging, decentralized storage, and zero-knowledge privacy infrastructure to preserve digital rights, free expression, and financial autonomy. Incorporating Waku messaging, Codex storage, and Nomos smart contract execution, Logos builds a sovereign, censorship-resistant web stack.",
  "elwood-technologies": " Elwood Technologies provides institutional investors, tier-one banks, and asset managers with unified API connectivity for high-performance crypto trading, execution, and portfolio risk management. Founded by Alan Howard, Elwood delivers enterprise-grade trading software, liquidity aggregation, and portfolio analytics across digital asset venues.",
  "stronghold": " Stronghold provides real-time payment processing, custom stablecoin clearing, and digital asset liquidity infrastructure for merchant businesses and financial institutions. Stronghold bridges traditional payment card networks with digital asset clearing to lower transaction fees and accelerate merchant cross-border settlement.",
  "brale": " Brale enables institutions and fintechs to issue, manage, and settle custom fiat-backed stablecoins across major blockchain networks with strict regulatory compliance. Operating as a licensed financial technology platform, Brale provides tokenization APIs, reserve auditability, and Treasury-backed asset issuance.",
  "staking-facilities": " Staking Facilities operates enterprise validator hardware in certified European data centers, securing proof-of-stake networks with 24/7 monitoring and high availability.",
  "the-tie": " The Tie Terminal aggregates real-time market data, sentiment analytics, and news feeds for over 100+ institutional clients, hedge funds, and token issuers in the digital asset space. Connecting sentiment tracking with derivative flows, execution volume, and news, The Tie provides institutional investors with comprehensive digital asset intelligence.",
  "airtm": " Airtm provides digital dollar accounts and cross-border payment rails for freelancers and remote workers in emerging markets, facilitating instant USDC payouts and bank settlement. Operating across Latin America and global markets, Airtm enables users to hold digital dollars, send payments, and convert funds into local bank accounts with minimal fees.",
  "horizon": " Horizon Blockchain Games builds Sequence smart wallet APIs and Skyweaver trading card games, providing game studios with full-stack Web3 account abstraction tooling. Sequence enables web3 game developers to offer invisible wallet creation, gasless transactions, and seamless NFT marketplace integration to mainstream players."
};

let codeStr = fileText;
let modifiedCount = 0;

for (const [slug, exp] of Object.entries(FINAL_EXPANSIONS)) {
  const pattern = new RegExp(`("${slug}":\\s*\`[^\`]+\`)`, 'g');
  if (pattern.test(codeStr)) {
    codeStr = codeStr.replace(pattern, (match, p1) => {
      const baseText = p1.slice(p1.indexOf('`') + 1, -1);
      const newText = baseText.trim() + exp;
      modifiedCount++;
      return `"${slug}": \`${newText}\``;
    });
  }
}

fs.writeFileSync(filePath, codeStr, 'utf8');
console.log(`Successfully expanded remaining ${modifiedCount} profiles in final pass!`);

// Sync markdown profile files
for (const [slug, exp] of Object.entries(FINAL_EXPANSIONS)) {
  const mdPath = path.join(process.cwd(), 'content/companies', `${slug}.md`);
  if (fs.existsSync(mdPath)) {
    let md = fs.readFileSync(mdPath, 'utf8');
    const fullMatch = codeStr.match(new RegExp(`"${slug}":\\s*\`([^\`]+)\``));
    if (fullMatch && fullMatch[1]) {
      const fullText = fullMatch[1];
      md = md.replace(/description:.*$/m, `description: "${fullText.replace(/"/g, '\\"')}"`);
      fs.writeFileSync(mdPath, md, 'utf8');
    }
  }
}
