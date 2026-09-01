import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/company-profiles.ts');
let fileText = fs.readFileSync(filePath, 'utf8');

const FINAL_PASS_4 = {
  "toku": " The platform operates with zero-knowledge security protocols and robust banking integrations, giving DAOs and decentralized protocols complete compliance peace of mind.",
  "vesta": " Vesta's collateralized stablecoin framework empowers decentralized finance builders with efficient liquidity, transparent risk parameters, and sustainable on-chain yield opportunities.",
  "sei-labs": " Sei's architecture optimizes orderbook liquidity, sub-second execution, and high-concurrency smart contract throughput, bringing Wall Street-grade trading infrastructure to the Web3 ecosystem.",
  "partisia-blockchain": " By combining secure multi-party computation with Layer 1 public consensus, Partisia enables privacy-preserving smart contract execution for enterprise compliance, healthcare data, and financial applications.",
  "yeet": " YEET bridges casual mobile gaming with digital asset incentives, creating engaging social gaming loops and provably fair rewards for players worldwide.",
  "caladan": " Caladan deploys high-frequency algorithmic market making algorithms and automated risk management across 100+ exchanges, providing continuous orderbook liquidity for digital assets.",
  "localcoin": " Localcoin operates thousands of retail cash-to-crypto kiosk terminals across North America, providing a secure, compliant physical gateway for consumers to buy and sell Bitcoin.",
  "groma": " Groma tokenizes residential real estate portfolios on public blockchains, enabling fractional ownership, automated rental distributions, and transparent property asset management.",
  "anagram": " Anagram supports early-stage crypto founders with strategic seed capital, applied zero-knowledge cryptography research, protocol economic design, and global go-to-market execution.",
  "ethereum-institutional": " Ethereum Institutional collaborates with tier-one banks, asset managers, and capital market infrastructure providers to advance understanding, regulatory clarity, and real-world adoption of Ethereum.",
  "dakota": " Dakota provides corporate crypto banking, yield-bearing USD treasury accounts, and global payment rails designed specifically for Web3 startups, protocols, and DAOs.",
  "beam": " Built on high-performance Avalanche subnet infrastructure, Beam empowers game studios with account abstraction SDKs, NFT marketplaces, and player-owned gaming economies.",
  "molecule": " Molecule's DeSci platform connects academic researchers with BioDAOs, using IP-NFTs and smart contract funding protocols to finance early-stage biotech and longevity research.",
  "foundation": " Foundation provides digital creators with elegant auction mechanisms, transparent smart contract royalties, and direct connection with global collectors on Ethereum.",
  "logos": " Logos builds peer-to-peer messaging, decentralized storage, and zero-knowledge privacy infrastructure to preserve digital rights, free expression, and financial autonomy.",
  "elwood-technologies": " Elwood Technologies provides institutional investors, tier-one banks, and asset managers with unified API connectivity for high-performance crypto trading, execution, and portfolio risk management.",
  "stronghold": " Stronghold provides real-time payment processing, custom stablecoin clearing, and digital asset liquidity infrastructure for merchant businesses and financial institutions.",
  "brale": " Brale enables institutions and fintechs to issue, manage, and settle custom fiat-backed stablecoins across major blockchain networks with strict regulatory compliance.",
  "the-tie": " The Tie Terminal aggregates real-time market data, sentiment analytics, and news feeds for over 100+ institutional clients, hedge funds, and token issuers in the digital asset space.",
  "airtm": " Airtm provides digital dollar accounts and cross-border payment rails for freelancers and remote workers in emerging markets, facilitating instant USDC payouts and bank settlement.",
  "horizon": " Horizon Blockchain Games builds Sequence smart wallet APIs and Skyweaver trading card games, providing game studios with full-stack Web3 account abstraction tooling."
};

let codeStr = fileText;
let modifiedCount = 0;

for (const [slug, exp] of Object.entries(FINAL_PASS_4)) {
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
console.log(`Successfully expanded remaining ${modifiedCount} profiles in final pass 4!`);

// Sync markdown profile files
for (const [slug, exp] of Object.entries(FINAL_PASS_4)) {
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
