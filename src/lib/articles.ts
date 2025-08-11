
import type { Article } from '@/types';

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
          { type: 'text', value: 'Web3 represents a paradigm shift from the centralized internet we know today (Web2) to a decentralized ecosystem powered by blockchain technology. This guide will break down the core concepts of Web3 and explain why it matters.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Pillars of Web3' }],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralization: ', style: 'bold' }, { type: 'text', value: 'Instead of data being stored on servers owned by companies like Google or Facebook, it\'s distributed across a peer-to-peer network. No single entity has control.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Blockchain & Crypto: ', style: 'bold' }, { type: 'text', value: 'Transactions and interactions are recorded on a public ledger (the blockchain), often facilitated by cryptocurrencies like Ethereum.' }] },
          { type: 'li', children: [{ type: 'text', value: 'User-Owned: ', style: 'bold' }, { type: 'text', value: 'Users have true ownership of their digital assets and data, not corporations. This is often managed through crypto wallets.' }] },
        ],
      },
      {
        type: 'image',
        src: 'https://placehold.co/800x400.png',
        alt: 'A diagram showing the difference between centralized Web2 and decentralized Web3.',
        'data-ai-hint': 'decentralized network diagram',
        caption: 'Web3 distributes control, moving away from centralized authorities.'
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Why Does Web3 Matter?' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 aims to solve many of Web2\'s problems, such as data privacy issues, censorship, and the concentration of power in a few tech giants. It opens up new possibilities for applications like DeFi (Decentralized Finance), DAOs (Decentralized Autonomous Organizations), and NFTs (Non-Fungible Tokens).' }
        ],
      },
        {
        type: 'blockquote',
        children: [
            {
                type: 'p',
                children: [
                    { type: 'text', value: "The future of the internet is about returning power to the users. That's the core promise of Web3." }
                ]
            }
        ]
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
          { type: 'text', value: 'Decentralized Finance, or DeFi, is a fast-growing sector of the crypto industry. It uses smart contracts—self-executing contracts with the terms of the agreement directly written into code—to create financial services that are open, transparent, and accessible to anyone with an internet connection.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Key DeFi Applications' }],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralized Exchanges (DEXs): ', style: 'bold' }, { type: 'text', value: 'Platforms like Uniswap and Sushiswap allow users to trade digital assets directly with each other, without a central authority.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Lending & Borrowing: ', style: 'bold' }, { type: 'text', value: 'Protocols like Aave and Compound let users lend out their crypto to earn interest or borrow against their holdings.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Stablecoins: ', style: 'bold' }, { type: 'text', value: 'Cryptocurrencies like USDC and DAI that are pegged to a stable asset (like the US dollar) to minimize volatility.' }] },
        ],
      },
       {
        type: 'image',
        src: 'https://placehold.co/800x400.png',
        alt: 'An illustration of DeFi concepts like lending and trading.',
        'data-ai-hint': 'financial technology blockchain',
        caption: 'DeFi applications are rebuilding finance on the blockchain.'
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'The Risks and Rewards' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'While DeFi offers high potential returns and greater financial freedom, it also comes with risks, including smart contract vulnerabilities, market volatility, and regulatory uncertainty. It\'s crucial to do your own research before investing in DeFi protocols.' }
        ],
      },
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
