import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/company-profiles.ts');
let fileText = fs.readFileSync(filePath, 'utf8');

function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Additional expansion paragraphs for all 71 profiles that are currently < 100 words
const SECOND_PASS_EXPANSIONS = {
  "block": " Block operates with open-source development practices, publishing decentralized identity specs and supporting Bitcoin core developer grants worldwide.",
  "coinbase": " Coinbase recruits across engineering, risk compliance, product design, and business development to expand compliant Web3 financial services.",
  "ramp": " Ramp works closely with international regulatory bodies and card schemes to maintain non-custodial compliance, low fraud rates, and fast liquidity settlement.",
  "bybit": " Bybit prioritizes high availability trading infrastructure, proof-of-reserves transparency, and multi-language client support for digital asset investors.",
  "robinhood": " Robinhood Crypto continues expanding its digital asset ecosystem, introducing staking rewards, international trading availability, and robust wallet security.",
  "bitdeer": " Bitdeer combines high-density datacenter engineering with proprietary cooling technology, offering transparent mining performance analytics to global clients.",
  "trm-labs": " TRM Labs combines multi-chain data graph analytics with machine learning models to trace stolen funds, identify sanctioned addresses, and prevent financial crimes.",
  "kraken": " Kraken maintains rigorous security standards with 24/7 client support, multi-sig cold storage protection, and transparent proof-of-reserves auditing.",
  "polymarket": " Polymarket provides liquid, transparent probability markets where global participants express real-time consensus on economic, political, and cultural developments.",
  "fireblocks": " Fireblocks serves over 1,800 financial institutions, securing trillions in digital asset transactions with hardware-enclosed private key isolation.",
  "alpaca": " Alpaca enables developers and global neobanks to build customizable trading experiences with multi-currency balance management and real-time execution.",
  "dv-trading": " DV Trading brings quantitative risk management and deep liquidity provisioning across spot markets, futures exchanges, and decentralized finance protocols.",
  "hut-8": " Hut 8 operates industrial energy infrastructure across North America, driving scalable computing capacity for digital asset validation and enterprise workloads.",
  "circle": " Circle's USDC and EURC stablecoins provide transparent, fully reserve-backed digital dollar rails designed for high-concurrency cross-border transactions.",
  "chainalysis": " Chainalysis empowers public and private sector compliance teams with real-time transaction monitoring, forensic investigations, and regulatory reporting capabilities.",
  "crypto-com": " Crypto.com expands global digital asset adoption with low-latency exchange execution, non-custodial wallet infrastructure, and tier-one sports partnerships.",
  "blockstream": " Blockstream pioneers sidechain innovation and enterprise hardware solutions, advancing security, privacy, and capital efficiency for the Bitcoin ecosystem.",
  "galaxy-digital": " Galaxy Digital operates across digital asset asset management, principal investments, institutional trading, and Bitcoin infrastructure with full regulatory compliance.",
  "rain": " Rain provides retail and institutional investors across the Middle East with compliant fiat bank rails, multi-asset spot trading, and audited custody.",
  "riot-platforms": " Riot Platforms scales large-scale Bitcoin mining operations in North America, prioritizing energy efficiency, power grid responsiveness, and infrastructure reliability.",
  "kalshi": " Backed by Sequoia and Y Combinator, Kalshi operates a regulated exchange where participants trade directly on economic, political, and financial event outcomes.",
  "flow-traders": " Flow Traders delivers continuous electronic liquidity across global digital asset spot and derivative markets, relying on quantitative execution algorithms.",
  "toku": " Toku provides turn-key Web3 payroll, token grant management, and local tax compliance in 100+ countries, empowering DAOs and crypto companies to hire globally.",
  "morpho": " Morpho optimizes interest rates for DeFi borrowers and lenders through peer-to-peer matching, while providing isolated Morpho Blue lending vaults with customizable risk parameters.",
  "redstone-oracles": " RedStone delivers modular, gas-efficient price feeds to 50+ EVM chains and Layer 2 rollups, protecting DeFi smart contracts against price manipulation.",
  "sphere": " Sphere simplifies stablecoin payments for internet businesses, providing developer-friendly APIs, on-ramp connectivity, and automated invoicing tools built on Solana.",
  "skip-protocol": " Skip Protocol builds MEV capture tools and cross-chain routing engines that enable seamless multi-token swaps and optimal execution across modular blockchains.",
  "vesta": " Vesta's decentralized Layer 1 stablecoin protocol enables collateralized minting of VST with zero interest rates, maximizing digital asset capital efficiency.",
  "sei-labs": " Sei Labs develops Sei Network with built-in order matching engines and parallelized EVM execution, bringing Wall Street trading speed to Web3 applications.",
  "fleek": " Fleek provides edge hosting, IPFS storage pinning, and automated CI/CD workflows, enabling developers to build and deploy censorship-resistant Web3 applications.",
  "partisia-blockchain": " Partisia Blockchain combines multi-party computation with public consensus, enabling enterprises to execute confidential computations on sensitive data without exposing private state on-chain.",
  "yeet": " YEET combines casual mobile gameplay with tokenized rewards and social community loops, giving mainstream users frictionless access to digital asset ownership.",
  "caladan": " Caladan provides 24/7 quantitative market making across 100+ crypto exchanges, deploying high-frequency trading algorithms to maintain continuous orderbook liquidity globally.",
  "arch-network": " Arch Network utilizes zero-knowledge virtual machine execution and threshold cryptography to bring native, high-throughput smart contracts directly to the Bitcoin blockchain.",
  "trail-of-bits": " Trail of Bits conducts deep security audits, formal verification research, and open-source tool development, helping top Web3 protocols and defense clients secure critical systems.",
  "localcoin": " Localcoin operates thousands of cash-to-crypto kiosk terminals across North America, giving everyday consumers a compliant physical gateway to trade digital assets.",
  "groma": " Groma tokenizes residential real estate assets on blockchain rails, empowering retail investors with fractional property ownership, automated rent distribution, and property management.",
  "movement-labs": " Movement Network combines MoveVM parallel execution with Ethereum security, allowing developers to deploy formally verified, high-throughput smart contracts with sub-second finality.",
  "anagram": " Anagram collaborates hands-on with early-stage crypto founders, providing venture capital, applied cryptography research, token economic modeling, and protocol architecture guidance.",
  "ethereum-institutional": " Ethereum Institutional collaborates with tier-one banks, asset managers, and market infrastructure providers to advance understanding, regulatory clarity, and real-world adoption of Ethereum-based financial systems.",
  "river-financial": " River Financial combines zero-fee Bitcoin accumulation, enterprise Lightning Network infrastructure APIs, and institutional custody, empowering clients to build on a pure Bitcoin standard.",
  "dakota": " Dakota provides corporate crypto banking, yield-bearing USD treasury accounts, and global payout rails built specifically for Web3 startups, protocols, and decentralized organizations.",
  "alliance-dao": " Alliance DAO provides intensive mentorship, tokenomics advisory, and founder network access to early-stage crypto startups, serving as a premier launchpad for Web3 founders.",
  "beam": " Beam empowers game studios with seamless account abstraction, NFT marketplaces, and in-game asset management SDKs built on high-performance Avalanche subnet infrastructure.",
  "molecule": " Molecule's DeSci platform connects academic researchers with BioDAOs, using IP-NFTs and smart contract funding protocols to finance early-stage biotech and longevity research.",
  "foundation": " Foundation's curated NFT platform provides digital creators with elegant auction mechanisms, transparent smart contract royalties, and direct connection with global art collectors.",
  "union": " Union utilizes advanced zero-knowledge proofs and CometBFT consensus to enable trustless, hyper-efficient cross-chain message passing and asset transfers across EVM and Cosmos networks.",
  "squads": " Squads Protocol provides formally verified multisig smart account infrastructure on Solana, securing treasury management, program upgrades, and permissions for top Web3 enterprises.",
  "gacha": " Gacha utilizes verifiable random functions and account abstraction to power gamified Web3 entertainment, allowing creators to distribute digital collectibles to global communities.",
  "logos": " Logos develops peer-to-peer messaging, decentralized storage, and zero-knowledge privacy infrastructure to preserve digital rights, free expression, and financial autonomy.",
  "gensyn": " Gensyn connects hardware providers with AI researchers using cryptographic proofs-of-learning, creating a decentralized compute protocol for scalable neural network training.",
  "elwood-technologies": " Elwood Technologies provides institutional investors, tier-one banks, and asset managers with unified API connectivity for high-performance crypto trading, execution, and portfolio risk management.",
  "stronghold": " Stronghold provides real-time payment processing, custom stablecoin clearing, and digital asset liquidity infrastructure for merchant businesses and financial institutions.",
  "r3": " R3's Corda platform enables central banks and tier-one financial institutions to tokenized assets, deploy CBDCs, and automate cross-border settlement with enterprise-grade regulatory compliance.",
  "loopscale": " Loopscale brings structured credit markets on-chain, enabling dynamic collateralization, granular risk isolation, and capital-efficient borrowing for institutional crypto participants.",
  "arcade": " Arcade Protocol enables non-custodial peer-to-peer lending against digital collectibles and tokenized real-world assets, unlocking liquidity through audited escrow smart contracts.",
  "allperps": " ALLPerps delivers sub-second perpetual futures execution, deep pooled liquidity, and automated cross-margin risk management for quantitative digital asset traders.",
  "brale": " Brale enables institutions and fintechs to issue, manage, and settle custom fiat-backed stablecoins across major blockchain networks with strict regulatory compliance.",
  "staking-facilities": " Staking Facilities operates enterprise validator hardware in certified European data centers, securing proof-of-stake networks with 24/7 monitoring and high availability.",
  "janus": " Janus builds high-performance Solana transaction routing algorithms and MEV protection infrastructure, optimizing execution speeds for automated traders and DeFi protocols.",
  "range": " Range provides real-time transaction monitoring and threat prevention for blockchains and rollups, detecting exploits and smart contract anomalies before funds are compromised.",
  "jupiter": " Jupiter routes the vast majority of Solana DEX trading volume, delivering optimal price execution, perpetual trading, DCA tools, and JUP DAO community governance.",
  "the-tie": " The Tie Terminal aggregates real-time market data, sentiment analytics, and news feeds for over 100+ institutional clients, hedge funds, and token issuers in the digital asset space.",
  "raydium": " Raydium provides high-throughput AMM liquidity pools and concentrated market maker positions on Solana, taking full advantage of low fees and sub-second execution.",
  "tenderly": " Tenderly's Web3 developer platform provides real-time smart contract monitoring, transaction simulation, visual debugging, and node infrastructure for over 300,000 developers.",
  "skyrise": " Skyrise combines on-chain wallet analytics with targeted questing and conversion tracking, helping Web3 protocols acquire and retain active users without bot spam.",
  "axiom": " Axiom utilizes ZK-SNARK proofs to give Ethereum smart contracts trustless access to historical blockchain data, enabling data-rich dApps and dynamic DeFi applications.",
  "airtm": " Airtm provides digital dollar accounts and cross-border payment rails for freelancers and remote workers in emerging markets, facilitating instant USDC payouts and bank settlement.",
  "very-ai": " Very AI combines decentralized compute with AI agent frameworks, enabling autonomous agents to execute complex smart contract workflows, trading, and governance tasks.",
  "trojan": " Trojan delivers high-speed automated trading, copy trading, and MEV protection on Solana, processing billions in monthly volume for retail and professional traders.",
  "horizon": " Horizon Blockchain Games builds Sequence smart wallet APIs and Skyweaver trading card games, providing game studios with full-stack Web3 account abstraction tooling."
};

let modifiedCount = 0;
let codeStr = fileText;

for (const [slug, exp] of Object.entries(SECOND_PASS_EXPANSIONS)) {
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
console.log(`Successfully expanded ${modifiedCount} profiles in second pass!`);
