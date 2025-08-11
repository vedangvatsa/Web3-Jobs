
import type { Article } from '@/types';
import { MessageSquare } from 'lucide-react';

const articles: Article[] = [
  {
    slug: 'what-is-web3',
    title: 'What is Web3? A Beginner\'s Guide to the Decentralized Internet',
    image: 'https://placehold.co/1200x630.png',
    description: 'Explore the fundamentals of Web3, the next evolution of the internet built on blockchain technology, decentralization, and user empowerment.',
    content: [
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 represents a fundamental paradigm shift from the centralized, corporate-controlled internet (Web2) to a decentralized ecosystem powered by blockchains. At its core, it’s an ambitious attempt to re-architect the web, shifting power from a handful of tech giants to individual users and creators. This guide will break down the core concepts of Web3, explore its philosophical underpinnings, and explain why it promises a more open and equitable digital future.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Journey from Web1 to Web3' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To understand Web3, we must first look at its predecessors:' }
        ],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Web1 (The Read-Only Web, ~1991-2004): ', style: 'bold' }, { type: 'text', value: 'This was the era of static web pages. Content was created by a select few and consumed by the masses. Interaction was minimal. Think of it as a giant, digital encyclopedia.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Web2 (The Read-Write Web, ~2004-Present): ', style: 'bold' }, { type: 'text', value: 'The rise of social media and user-generated content. Platforms like Facebook, Twitter, and YouTube made it easy for anyone to create and share, but this came at a cost. Our data became the product, stored and monetized in centralized corporate silos.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Web3 (The Read-Write-Own Web): ', style: 'bold' }, { type: 'text', value: 'Web3 introduces a crucial third element: ownership. By leveraging blockchain technology, users can truly own their data, digital assets (like NFTs), and identity. It combines the read/write interactivity of Web2 with the decentralized ethos of Web1.' }] },
        ]
      },
       {
        type: 'cta',
        text: 'Learn Web3 for free',
        href: 'https://academy.hashtagweb3.com'
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Pillars of Web3' }],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'decentralization', title: 'Decentralization', description: 'Data is distributed across a global network, creating a resilient, censorship-resistant foundation where no single entity has control.' },
            { icon: 'blockchain', title: 'Blockchain & Crypto', description: 'Blockchains are transparent, immutable ledgers that track transactions, while cryptocurrencies provide the native economic layer.' },
            { icon: 'trustless', title: 'Verifiable & Trustless', description: 'Users can verify the rules of an application themselves via open-source smart contracts, removing the need to trust a central company.' },
            { icon: 'ownership', title: 'Self-Custody & Digital Ownership', description: 'Users manage their own assets and identity through cryptographic wallets, ensuring true ownership that cannot be revoked.' },
        ]
      },
      {
        type: 'blockquote',
        children: [
            {
                type: 'p',
                children: [
                    { type: 'text', value: "In Web2, you are the product. In Web3, you are the owner." }
                ]
            }
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'What Does Web3 Actually Look Like?' }],
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 isn\'t just a theory; it\'s a rapidly growing ecosystem of applications:' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'defi', title: 'DeFi (Decentralized Finance)', description: 'Financial services like lending, borrowing, and trading built on open protocols, available to anyone with an internet connection.' },
            { icon: 'nfts', title: 'NFTs (Non-Fungible Tokens)', description: 'Provably unique digital assets representing ownership of art, collectibles, in-game items, or even real-world assets.' },
            { icon: 'daos', title: 'DAOs (Decentralized Autonomous Organizations)', description: 'Internet-native organizations where members vote on decisions and manage collective resources using governance tokens.' },
            { icon: 'decentralized-social', title: 'Decentralized Social Media', description: 'Platforms where users control their own data and social graph, free from the whims of a central algorithm or censorship.' },
        ]
      },
       {
        type: 'cta',
        text: 'Join AI & Web3 Community',
        href: 'https://t.me/addlist/gkBHozFQkTllOTdl'
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Challenges on the Horizon' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is not a utopia. The path to a decentralized future is fraught with significant challenges:' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'ux', title: 'User Experience (UX)', description: 'Using Web3 can be daunting. Managing wallets, seed phrases, and gas fees is a major hurdle for mainstream adoption.' },
            { icon: 'scalability', title: 'Scalability', description: 'Blockchains like Ethereum can only process a limited number of transactions per second, leading to high fees. Layer 2 solutions are actively being developed to address this.' },
            { icon: 'security', title: 'Security & Scams', description: 'The self-custody nature of Web3 means users are responsible for their security. Phishing, smart contract bugs, and scams are rampant.' },
            { icon: 'regulation', title: 'Regulation', description: 'Governments worldwide are still figuring out how to approach this new technology, creating an uncertain regulatory landscape.' },
        ]
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'Despite these hurdles, the potential for a more equitable, open, and user-centric internet continues to drive development and attract talent from all over the world. The journey is just beginning.' }
        ],
      },
      {
        type: 'cta',
        text: 'Find Your Next Web3 Job',
        href: 'https://t.me/web3hiring'
      }
    ],
  },
  {
    slug: 'guide-to-defi',
    title: 'An Introduction to Decentralized Finance (DeFi)',
    image: 'https://placehold.co/1200x630.png',
    description: 'Learn how DeFi is rebuilding traditional financial systems like lending, borrowing, and trading on the blockchain, without the need for intermediaries.',
    content: [
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Decentralized Finance (DeFi) is one of the most innovative and disruptive sectors within the Web3 ecosystem. It leverages blockchain technology to build a parallel financial system that is open, permissionless, and transparent. Instead of relying on traditional intermediaries like banks, brokerages, and insurers, DeFi uses smart contracts—self-executing code on a blockchain—to create and manage financial products and services.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Why DeFi? The Problems with Traditional Finance' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To appreciate DeFi, it helps to understand the issues it seeks to solve in Traditional Finance (TradFi):' },
        ],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Centralization & Gatekeeping: ', style: 'bold' }, { type: 'text', value: 'TradFi is controlled by a few large institutions. They decide who gets access to financial services, often excluding billions of people worldwide.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Inefficiency & Cost: ', style: 'bold' }, { type: 'text', value: 'Transactions can be slow, taking days to settle, and involve numerous middlemen who all take a cut, increasing costs for the end-user.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Opacity & Lack of Transparency: ', style: 'bold' }, { type: 'text', value: 'The inner workings of financial institutions are often a black box, leading to systemic risks as seen in the 2008 financial crisis.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Censorship: ', style: 'bold' }, { type: 'text', value: 'A central authority can freeze your account or block your transactions at will.' }] },
        ]
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi offers a compelling alternative by being globally accessible, transparent by default, and controlled by code rather than by corporate entities.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Components of the DeFi Stack' }],
      },
      {
        type: 'keyPoints',
        points: [
          { icon: 'decentralization', title: 'Decentralized Exchanges (DEXs)', description: 'Platforms like Uniswap allow users to trade assets directly from their wallets using Automated Market Makers (AMMs) instead of traditional order books.' },
          { icon: 'blockchain', title: 'Lending & Borrowing', description: 'Protocols like Aave and Compound allow users to lend crypto to earn interest or borrow assets by supplying collateral, with algorithmically set rates.' },
          { icon: 'trustless', title: 'Stablecoins', description: 'The bedrock of DeFi. Cryptocurrencies like USDC and DAI are pegged to stable assets (e.g., USD) to minimize volatility and serve as a reliable medium of exchange.' },
          { icon: 'ownership', title: 'Liquid Staking', description: 'Protocols like Lido unlock liquidity by allowing users to stake assets to secure the network while receiving a liquid token representation that can be used elsewhere in DeFi.' },
        ]
      },
      {
        type: 'cta',
        text: 'Web3 Job Feed',
        href: 'https://t.me/web3hiring'
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Unavoidable Risks of an Open System' }],
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'While revolutionary, DeFi is the "Wild West" of finance, and the risks are substantial and varied:' }
        ],
      },
       {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Smart Contract Risk: ', style: 'bold' }, { type: 'text', value: 'Bugs or vulnerabilities in a protocol\'s code can be exploited by hackers, leading to a complete loss of funds. Audits help but are not a guarantee of safety.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Impermanent Loss: ', style: 'bold' }, { type: 'text', value: 'A unique risk for liquidity providers in AMMs, where the value of their deposited assets can decrease relative to just holding them in their wallet due to price volatility.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Volatility & Liquidation: ', style: 'bold' }, { type: 'text', value: 'The high volatility of crypto assets can lead to rapid liquidations for borrowers if the value of their collateral drops below a certain threshold.' }] },
          { type: 'li', children: [{ type: 'text', value: 'MEV (Maximal Extractable Value): ', style: 'bold' }, { type: 'text', value: 'Advanced traders can exploit the order of transactions in a block to profit at the expense of ordinary users through strategies like front-running and sandwich attacks.' }] },
        ]
      },
      {
        type: 'p',
        children: [
            { type: 'text', value: 'DeFi represents a profound shift in how we think about financial services. It is a world of immense opportunity and significant risk. As the technology matures and the user experience improves, it has the potential to create a more inclusive and efficient global financial system. However, it demands caution, education, and a clear understanding of the dangers involved. Always do your own research and never invest more than you are willing to lose.' }
        ]
      }
    ],
  },
];

export async function getAllArticles(): Promise<Article[]> {
  // In a real app, this would fetch from a database or CMS
  return articles.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  // In a real app, this would fetch a single article
  return articles.find((article) => article.slug === slug);
}
