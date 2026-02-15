export interface GlossaryTerm {
  term: string;
  slug: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image?: string;
  imageAlt?: string;
  description: string; // Short definition for meta/preview
  content: string; // Full markdown content
  relatedTerms: string[];
  synonyms?: string[];
  publishedDate: string;
  updatedDate?: string;
}

export interface GlossaryCategory {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  termCount?: number;
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  {
    name: 'Blockchain Fundamentals',
    slug: 'blockchain-fundamentals',
    description: 'Core concepts and building blocks of blockchain technology',
  },
  {
    name: 'Cryptocurrencies',
    slug: 'cryptocurrencies',
    description: 'Digital currencies, tokens, and payment systems',
  },
  {
    name: 'DeFi',
    slug: 'defi',
    description: 'Decentralized finance protocols, lending, and yield strategies',
  },
  {
    name: 'NFTs & Digital Assets',
    slug: 'nfts',
    description: 'Non-fungible tokens, digital collectibles, and ownership',
  },
  {
    name: 'Smart Contracts',
    slug: 'smart-contracts',
    description: 'Self-executing contracts and blockchain programming',
  },
  {
    name: 'Protocols & Standards',
    slug: 'protocols',
    description: 'Token standards, layer solutions, and interoperability',
  },
  {
    name: 'Governance & DAOs',
    slug: 'governance',
    description: 'Decentralized organizations and on-chain voting',
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Wallets, keys, audits, and best practices',
  },
  {
    name: 'Trading & Markets',
    slug: 'trading',
    description: 'Exchanges, liquidity, and market mechanics',
  },
  {
    name: 'Technical',
    slug: 'technical',
    description: 'Infrastructure, nodes, consensus, and technical operations',
  },
];
