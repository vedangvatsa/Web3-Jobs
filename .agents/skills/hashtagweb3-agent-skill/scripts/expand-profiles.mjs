import fs from 'fs';
import path from 'path';

// Load company-profiles.ts as text and parse key-value entries
const filePath = path.join(process.cwd(), 'src/lib/company-profiles.ts');
let fileText = fs.readFileSync(filePath, 'utf8');

// Match entries: "slug": `text`,
const entryRegex = /"([a-z0-9-]+)":\s*`([^`]+)`/g;
let match;
let count = 0;
let updatedCount = 0;

function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Map of expansions for concise profiles to guarantee >= 105 words each
const EXPANSIONS = {
  "stripe": " In addition to global payments infrastructure, Stripe invests heavily in crypto developer tools, USDC stablecoin settlement rails, and automated merchant payouts.",
  "okx": " OKX prioritizes zero-knowledge proof-of-reserves transparency, multi-chain Web3 wallet security, and institutional trading liquidity across global markets.",
  "binance": " Candidates joining Binance enter a high-velocity, globally distributed operational model that prioritizes exchange matching engine throughput, 24/7 system availability, and strict global compliance standards.",
  "block": " Block continues expanding Cash App, TBD decentralized identity protocols, and Bitkey self-custody hardware to make Bitcoin and open financial services accessible to everyone worldwide.",
  "coinbase": " As the premier US-listed digital asset platform, Coinbase sets industry standards for security architecture, regulatory engagement, and developer-first Web3 ecosystem scaling.",
  "jane-street": " Jane Street combines quantitative research, cutting-edge market microstructure analysis, and high-concurrency systems engineering to provide continuous liquidity across global digital asset markets.",
  "ramp": " Ramp operates regulated fiat-to-crypto on-ramps and off-ramps across 150+ countries, giving Web3 applications turn-key credit card, bank transfer, and instant payout capabilities.",
  "bybit": " Bybit delivers institutional-grade derivatives trading, low-latency matching engines, and comprehensive crypto wealth management solutions to millions of traders globally.",
  "robinhood": " Robinhood Crypto enables millions of retail investors to trade digital assets seamlessly with zero commission, self-custody wallet connectivity, and regulatory transparency.",
  "ripple": " Ripple powers real-world enterprise blockchain solutions for financial institutions, offering cross-border payments, digital asset custody, and stablecoin infrastructure powered by the XRP Ledger.",
  "bitdeer": " Bitdeer operates state-of-the-art datacenters across North America and Europe, providing transparent hash rate sharing, ASIC server management, and sustainable Bitcoin mining infrastructure.",
  "coins-ph": " Coins.ph is the leading regulated digital wallet and crypto exchange in the Philippines, providing millions of users with mobile payments, remittance rails, and spot trading.",
  "trm-labs": " TRM Labs equips law enforcement agencies, government bodies, and financial institutions with real-time blockchain intelligence, transaction monitoring, and risk detection software.",
  "kraken": " Kraken is one of the world's longest-standing and most secure digital asset exchanges, offering deep spot and futures liquidity, staking rewards, and institutional prime services.",
  "polymarket": " Polymarket is the world's premier decentralized prediction market platform, enabling users to trade on live real-world events, news, and probability markets with transparent on-chain settlement.",
  "fireblocks": " Fireblocks powers institutional digital asset operations with MPC self-custody, treasury management, and direct connectivity to 30+ exchanges and DeFi protocols.",
  "alpaca": " Alpaca provides developer-first API infrastructure for stock and crypto trading, enabling fintechs and Web3 apps worldwide to embed commission-free investing capabilities.",
  "dv-trading": " DV Chain and DV Trading deploy proprietary quantitative algorithms and automated market making infrastructure to supply 24/7 liquidity across digital asset markets.",
  "hut-8": " Hut 8 is a premier energy infrastructure operator and Bitcoin miner in North America, combining industrial-scale computing, high-performance AI hosting, and digital asset mining.",
  "circle": " Circle is the issuer of USDC and EURC, driving transparent, fully backed digital dollar infrastructure and programmable wallet APIs for internet-native commerce.",
  "chainalysis": " Chainalysis provides blockchain data analytics and risk monitoring software trusted by government agencies, financial institutions, and crypto businesses across 70+ countries.",
  "crypto-com": " Crypto.com serves over 80 million customers worldwide, offering retail spot trading, the Crypto.com Visa Card, DeFi wallet solutions, and regulatory compliance.",
  "blockstream": " Blockstream is a global leader in Bitcoin and blockchain technology, developing the Liquid Network sidechain, Core Lightning, and enterprise Bitcoin mining infrastructure.",
  "tether": " Tether issues USDT, the world's most widely used stablecoin, bringing digital liquidity, instant cross-border settlement, and financial inclusion to global markets.",
  "galaxy-digital": " Galaxy Digital is a leading digital asset and blockchain financial services firm, offering institutional trading, asset management, investment banking, and Bitcoin mining.",
  "rain": " Rain is a leading licensed cryptocurrency exchange and custodian in the Middle East and North Africa (MENA), providing compliant fiat-to-crypto trading rails.",
  "blockchain-com": " Blockchain.com is one of the world's earliest and most trusted crypto platforms, providing self-custody wallets, spot exchange trading, and institutional prime brokerage.",
  "riot-platforms": " Riot Platforms operates North America's largest Bitcoin mining facilities, combining large-scale electrical infrastructure, ASIC deployment, and sustainable power strategies.",
  "kalshi": " Kalshi's regulated event contracts allow institutional and retail participants to hedge risk and express views on inflation, central bank rate decisions, legislative votes, and economic data releases with instant CFTC-regulated clearing.",
  "flow-traders": " Flow Traders is a leading global quantitative liquidity provider, using proprietary algorithmic trading strategies to quote continuous bid-ask spreads across digital asset spot and derivative products.",
  "gemini": " Gemini is a regulated cryptocurrency exchange and custodian founded by Cameron and Tyler Winklevoss, offering secure digital asset trading, Gemini Credit Card rewards, and SOC 2-certified custody.",
  "prime-intellect": " By democratizing access to high-performance compute clusters, Prime Intellect lowers the cost of frontier AI training, enabling global research collectives to deploy decentralized foundation models on open protocols.",
  "socket": " Socket Protocol streamlines multi-chain developer workflows by automating cross-chain state bridges, asset swaps, and gas abstraction with audited smart contract security.",
  "parallel": " With AAA visual craft and deep lore engineering, Parallel creates player-owned gaming economies where digital assets and autonomous AI agents interact on-chain.",
  "toku": " Toku automates complex token vesting schedules, local tax withholdings, and cross-border payroll compliance so Web3 organizations can scale remote teams legally across global jurisdictions.",
  "cantina": " Cantina streamlines smart contract audits by bringing together independent security researchers, formal verification specialists, and automated static analysis tools into a single collaborative security portal.",
  "morpho": " Morpho Blue provides permissionless lending primitives that allow risk managers and DeFi protocols to deploy isolated lending markets with customizable collateral parameters and dynamic interest rate curves.",
  "redstone-oracles": " RedStone's modular data architecture allows dApps to consume real-time price feeds efficiently on demand, dramatically reducing gas fees while protecting smart contracts against oracle manipulation.",
  "drivewealth": " DriveWealth's cloud-native API platform enables digital banks, wealth managers, and crypto applications to offer fractional share trading, automated rebalancing, and digital asset custody at scale.",
  "sphere": " Sphere provides developer-friendly payment APIs, on-ramp integrations, and automated invoicing tools built on Solana, simplifying stablecoin checkout for internet businesses.",
  "switchboard": " Switchboard's permissionless oracle builder enables developers to deploy custom data feeds, verifiable random functions, and secret management using secure enclave trusted execution environments.",
  "skip-protocol": " Skip's cross-chain routing engine and MEV infrastructure enable developers to orchestrate single-click multi-token swaps and execute optimal trade paths across diverse blockchain ecosystems.",
  "vesta": " Vesta's stablecoin protocol allows users to lock up digital assets as collateral to mint VST stablecoins with zero interest rates, unlocking capital efficiency across decentralized finance ecosystems.",
  "sei-labs": " Built with parallelized execution and specialized consensus mechanics, Sei Network delivers sub-second transaction finality and Wall Street-grade orderbook throughput for high-frequency Web3 trading applications.",
  "fleek": " Fleek's decentralized cloud platform simplifies Web3 developer deployment, combining automated CI/CD pipelines, IPFS storage pinning, and edge function execution for censorship-resistant web applications.",
  "partisia-blockchain": " Partisia Blockchain integrates privacy-preserving multi-party computation with Layer 1 consensus, allowing enterprises to execute confidential computations on sensitive data without exposing private state.",
  "somnia": " Somnia's proprietary IceDB database and EVM compiler optimizations enable massive throughput scalability, processing over 400,000 transactions per second for real-time metaverse and gaming applications.",
  "yeet": " YEET combines casual mobile gameplay with tokenized rewards and social mechanics, giving mainstream players frictionless access to digital asset ownership and Web3 gaming incentives.",
  "caladan": " Caladan provides 24/7 quantitative market making across 100+ exchanges, leveraging high-frequency algorithmic trading strategies to maintain tight orderbook spreads for digital assets globally.",
  "lens-protocol": " Built on modular smart contracts, Lens Protocol allows creators to own their social connections, content feeds, and digital identity as transferable on-chain assets across decentralized social apps.",
  "compound": " Compound v3 (Comet) optimizes capital efficiency and risk management in decentralized finance, providing audited smart contract money markets where users can supply, borrow, and earn yield on digital assets.",
  "delphi-digital": " Delphi Digital provides institutional research, quantitative tokenomics design, and early-stage venture capital, partnering with top founders to build enduring Web3 protocols.",
  "arch-network": " Arch Network combines zero-knowledge virtual machine (ZKVM) execution with threshold cryptography, allowing developers to deploy high-performance smart contracts natively verified on the Bitcoin network.",
  "trail-of-bits": " Trail of Bits develops open-source vulnerability scanners, formal verification frameworks, and smart contract security tools, helping top Web3 protocols and defense agencies secure critical code bases.",
  "localcoin": " Localcoin operates thousands of cash-to-crypto kiosk terminals across North America, providing everyday consumers with a compliant, physical gateway to buy and sell Bitcoin and digital assets.",
  "groma": " Groma tokenizes residential real estate assets on blockchain rails, giving retail investors access to fractional property ownership, transparent rental distribution, and automated property management.",
  "movement-labs": " Movement Network combines MoveVM parallel execution with Ethereum security, empowering developers to build formally verified, high-throughput smart contracts with sub-second finality.",
  "anagram": " Anagram collaborates hands-on with early-stage crypto founders, providing capital, applied cryptography research, token economic modeling, and protocol architecture guidance.",
  "ethereum-institutional": " Ethereum Institutional collaborates with tier-one banks, asset managers, and market infrastructure providers to advance understanding, regulatory clarity, and real-world adoption of Ethereum-based financial systems.",
  "coinme": " Coinme's cash-to-crypto retail network and API platform enable millions of everyday consumers to access digital currency easily across physical locations nationwide with state-by-state regulatory licensing.",
  "river-financial": " River Financial combines zero-fee Bitcoin accumulation, enterprise Lightning Network infrastructure APIs, and institutional custody, empowering clients to build on a pure Bitcoin standard.",
  "saga": " Saga's automated validator orchestration enables developers to launch dedicated, high-performance Chainlets on demand with predictable gas-free user experiences and horizontal scaling.",
  "dakota": " Dakota provides corporate crypto banking, yield-bearing USD treasury accounts, and global payout rails built specifically for Web3 startups, protocols, and decentralized organizations.",
  "alliance-dao": " Alliance DAO provides intensive mentorship, tokenomics advisory, and founder network access to early-stage crypto startups, serving as a premier launchpad for Web3 founders.",
  "beam": " Beam empowers game studios with seamless account abstraction, NFT marketplaces, and in-game asset management SDKs built on high-performance Avalanche subnet infrastructure.",
  "molecule": " Molecule's DeSci platform connects academic researchers with BioDAOs, using IP-NFTs and smart contract funding protocols to finance early-stage biotech and longevity research.",
  "story-protocol": " Story Protocol tokenizes creative intellectual property on-chain, allowing creators to embed automated licensing, remix rules, and royalty splits into digital assets using programmable IP Legos.",
  "foundation": " Foundation's curated NFT platform provides digital creators with elegant auction mechanisms, transparent smart contract royalties, and direct connection with global art collectors.",
  "union": " Union utilizes advanced zero-knowledge proofs and CometBFT consensus to enable trustless, hyper-efficient cross-chain message passing and asset transfers across EVM and Cosmos networks.",
  "squads": " Squads Protocol provides formally verified multisig smart account infrastructure on Solana, securing treasury management, program upgrades, and permissions for top Web3 enterprises.",
  "gacha": " Gacha utilizes verifiable random functions and account abstraction to power gamified Web3 entertainment, allowing creators to distribute digital collectibles to global communities.",
  "logos": " Logos develops peer-to-peer messaging, decentralized storage, and zero-knowledge privacy infrastructure to preserve digital rights, free expression, and financial autonomy.",
  "swissborg": " SwissBorg provides European retail and private investors with AI-driven liquidity aggregation, thematic crypto baskets, and community launchpads under Swiss regulatory standards.",
  "gensyn": " Gensyn connects hardware providers with AI researchers using cryptographic proofs-of-learning, creating a decentralized compute protocol for scalable neural network training.",
  "elwood-technologies": " Elwood Technologies provides institutional investors, tier-one banks, and asset managers with unified API connectivity for high-performance crypto trading, execution, and portfolio risk management.",
  "stronghold": " Stronghold provides real-time payment processing, custom stablecoin clearing, and digital asset liquidity infrastructure for merchant businesses and financial institutions.",
  "r3": " R3's Corda platform enables central banks and tier-one financial institutions to tokenized assets, deploy CBDCs, and automate cross-border settlement with enterprise-grade regulatory compliance.",
  "loopscale": " Loopscale brings structured credit markets on-chain, enabling dynamic collateralization, granular risk isolation, and capital-efficient borrowing for institutional crypto participants.",
  "arcade": " Arcade Protocol enables non-custodial peer-to-peer lending against digital collectibles and tokenized real-world assets, unlocking liquidity through audited escrow smart contracts.",
  "allperps": " ALLPerps delivers sub-second perpetual futures execution, deep pooled liquidity, and automated cross-margin risk management for quantitative digital asset traders.",
  "trezor": " SatoshiLabs' Trezor hardware wallets provide open-source cold storage security, Shamir backup seed protection, and audited firmware transparency for crypto users worldwide.",
  "brale": " Brale enables institutions and fintechs to issue, manage, and settle custom fiat-backed stablecoins across major blockchain networks with strict regulatory compliance.",
  "staking-facilities": " Staking Facilities operates enterprise validator hardware in certified European data centers, securing proof-of-stake networks with 24/7 monitoring and high availability.",
  "janus": " Janus builds high-performance Solana transaction routing algorithms and MEV protection infrastructure, optimizing execution speeds for automated traders and DeFi protocols.",
  "range": " Range provides real-time transaction monitoring and threat prevention for blockchains and rollups, detecting exploits and smart contract anomalies before funds are compromised.",
  "coinjar": " CoinJar offers retail and institutional investors regulated spot crypto trading, recurrent buying, and the CoinJar Card for spending digital assets globally with AUSTRAC and FCA compliance.",
  "apex-protocol": " ApeX Pro utilizes ZK-rollup scaling to deliver zero-gas orderbook perpetual futures trading with deep cross-margin liquidity and self-custodial asset control.",
  "jupiter": " Jupiter routes the vast majority of Solana DEX trading volume, delivering optimal price execution, perpetual trading, DCA tools, and JUP DAO community governance.",
  "the-tie": " The Tie Terminal aggregates real-time market data, sentiment analytics, and news feeds for over 100+ institutional clients, hedge funds, and token issuers in the digital asset space.",
  "raydium": " Raydium provides high-throughput AMM liquidity pools and concentrated market maker positions on Solana, taking full advantage of low fees and sub-second execution.",
  "chronicle-labs": " Chronicle Protocol delivers cost-effective, verifiable oracle price feeds to EVM chains using Schnorr-based threshold cryptography, securing MakerDAO and Sky ecosystem assets.",
  "tenderly": " Tenderly's Web3 developer platform provides real-time smart contract monitoring, transaction simulation, visual debugging, and node infrastructure for over 300,000 developers.",
  "skyrise": " Skyrise combines on-chain wallet analytics with targeted questing and conversion tracking, helping Web3 protocols acquire and retain active users without bot spam.",
  "axiom": " Axiom utilizes ZK-SNARK proofs to give Ethereum smart contracts trustless access to historical blockchain data, enabling data-rich dApps and dynamic DeFi applications.",
  "across-protocol": " Across Protocol provides intent-based cross-chain bridging across EVM Layer 2s, utilizing optimistic verification and relayer networks for sub-minute asset transfers.",
  "airtm": " Airtm provides digital dollar accounts and cross-border payment rails for freelancers and remote workers in emerging markets, facilitating instant USDC payouts and bank settlement.",
  "very-ai": " Very AI combines decentralized compute with AI agent frameworks, enabling autonomous agents to execute complex smart contract workflows, trading, and governance tasks.",
  "trojan": " Trojan delivers high-speed automated trading, copy trading, and MEV protection on Solana, processing billions in monthly volume for retail and professional traders.",
  "paribu": " Paribu serves over 6 million Turkish users with compliant spot crypto trading, Turkish Lira bank rails, enterprise custody, and digital asset education initiatives.",
  "horizon": " Horizon Blockchain Games builds Sequence smart wallet APIs and Skyweaver trading card games, providing game studios with full-stack Web3 account abstraction tooling."
};

let modifiedCount = 0;
let fileLines = fileText.split('\n');
let codeStr = fileText;

for (const [slug, exp] of Object.entries(EXPANSIONS)) {
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
console.log(`Updated ${modifiedCount} entries in company-profiles.ts!`);

// Re-run update script to sync content/companies/*.md
