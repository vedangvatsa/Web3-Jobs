import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_FILE = path.join(__dirname, 'bulk-knowledge-10k.json');

const protocols = ['Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'Avalanche', 'near', 'Cardano', 'Polkadot', 'ZkSync', 'Starknet', 'zkEVM', 'Scroll', 'Linea', 'Mantle', 'Taiko', 'Zora'];
const sectors = ['DeFi', 'NFTs', 'Gaming', 'Infrastructure', 'Security', 'DAOs', 'SocialFi', 'DePIN', 'RWA', 'Modular', 'Restaking', 'LRTs', 'Account Abstraction'];
const roles = ['Solidity Developer', 'Rust Engineer', 'Smart Contract Auditor', 'Web3 Product Manager', 'UX Designer', 'Growth Lead', 'Community Manager', 'Data Scientist', 'Compliance Officer', 'Protocol Architect', 'Relayer Operator', 'Validator Support'];
const actions = ['How to build', 'Professional guide to', 'The future of', 'Understanding', 'Best practices for', 'Getting hired as a', 'Salary trends in', 'A deep dive into', 'Scaling with'];

const insights = [
 'Web3 security is paramount. Formal verification and multi-sig setups are industry standards.',
 'Decentralization is a spectrum. Many protocols start centralized and shift over time.',
 'Layer 2 scaling is the most active area of Ethereum development in 2025.',
 'Smart contract audits do not guarantee 100% safety but are a critical first step.',
 'Remoteness is the default in Web3, with teams distributed across 40+ timezones.',
 'Tokenomics design is just as important as the code itself for protocol longevity.',
 'Community-led governance (DAOs) is replacing traditional corporate boards.',
 'Gas optimization is a high-demand niche skill for Solidity developers.',
 'Account abstraction (ERC-4337) is making Web3 UX as smooth as Web2.',
 'Institutional adoption of RWA (Real World Assets) is bringing trillions on-chain.',
 'Restaking and Liquid Restaking (LRTs) are the dominant yield drivers in 2025.',
 'DePIN protocols are decentralizing physical infrastructure like compute and storage.',
 'ZK-proofs are the ultimate solution for blockchain privacy and scalability.'
];

const anchorTexts = [
 'Web3 Jobs', 'Blockchain Careers', 'Crypto Roles', 'Solidity Jobs', 'Rust Engineering Positions',
 'DeFi Developer Openings', 'NFT Project Hiring', 'Smart Contract Auditor Roles', 'Web3 Product Management',
 'Remote Blockchain Jobs', 'Decentralized Applications Hiring', 'On-chain Engineering Careers', 'Ethereum Developer Jobs',
 'Solana Ecosystem Roles', 'Protocol Architect Openings', 'Web3 Growth Lead Positions', 'Governance Specialist Roles'
];

function generateArticles(count = 10000) {
 const articles = [];
 for (let i = 0; i < count; i++) {
 const proto = protocols[i % protocols.length];
 const sector = sectors[Math.floor(Math.random() * sectors.length)];
 const role = roles[Math.floor(Math.random() * roles.length)];
 const action = actions[Math.floor(Math.random() * actions.length)];
 const insight = insights[Math.floor(Math.random() * insights.length)];
 const anchorText = anchorTexts[Math.floor(Math.random() * anchorTexts.length)];

 const title = `${action} ${proto} ${sector} and ${role} Roles`;
 
 const body = [
 `The evolution of ${proto} has significantly impacted the ${sector} landscape.`,
 `For professionals aiming to become a ${role}, understanding the core drivers of ${proto} is essential.`,
 `${insight}`,
 `Companies building on ${proto} are actively hiring for ${role} positions. The current market is highly competitive, emphasizing on-chain contributions and technical depth.`,
 `Whether you are specialized in ${sector} or general blockchain engineering, specialized platforms are crucial for discovery.`,
 `Find the latest ${proto} and ${sector} opportunities at https://hashtagweb3.com`
 ].join(' ');

 articles.push({
 title,
 body,
 tags: [proto.toLowerCase(), sector.toLowerCase(), 'jobs', 'web3', 'blockchain'],
 headline: title,
 anchorText
 });
 }
 return articles;
}

const articles = generateArticles(10000);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
console.log(`Generated ${articles.length} unique articles at ${OUTPUT_FILE}`);
