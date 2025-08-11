
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
          { type: 'text', value: 'Web3 represents a paradigm shift from the centralized internet we know today (Web2) to a decentralized ecosystem powered by blockchain technology. At its core, it\'s an attempt to restructure the internet, moving power from large corporations to individual users. This guide will break down the core concepts of Web3 and explain why it matters.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Pillars of Web3' }],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralization: ', style: 'bold' }, { type: 'text', value: 'Instead of data being stored on servers owned by companies like Google or Facebook, it\'s distributed across a peer-to-peer network of computers. This means no single entity has control, which prevents censorship and single points of failure.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Blockchain & Crypto: ', style: 'bold' }, { type: 'text', value: 'Transactions and state changes are recorded on a public, immutable ledger (the blockchain). Cryptocurrencies like Ethereum (ETH) are used as native digital money and to pay for computational resources.' }] },
          { type: 'li', children: [{ type: 'text', value: 'User-Owned: ', style: 'bold' }, { type: 'text', value: 'Users have true ownership of their digital assets and data, not corporations. This is often managed through self-custodial crypto wallets like MetaMask or Phantom. Your identity and assets are your own.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Permissionless: ', style: 'bold' }, { type: 'text', value: 'Anyone can build on or use the Web3 network. You don\'t need permission from a central authority to create a new app or service, fostering an environment of open innovation.' }] },
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
        children: [{ type: 'text', value: 'Web3 vs. Web2: What\'s the Difference?' }],
      },
      {
        type: 'p',
        children: [
            { type: 'text', value: 'In Web2, large tech companies act as intermediaries. They provide services in exchange for your data, which they monetize. You interact on their platforms, subject to their rules and algorithms. Web3 removes these intermediaries. You interact directly with the protocol, and your digital identity is portable across different applications. ' }
        ],
      },
      {
        type: 'blockquote',
        children: [
            {
                type: 'p',
                children: [
                    { type: 'text', value: "Think of it this way: In Web2, you are the product. In Web3, you are the owner." }
                ]
            }
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Challenges and Criticisms' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is not without its challenges. The user experience can be complex for newcomers, transaction fees (known as "gas fees") can be high on popular networks, and the technology is still maturing. Scalability is a major hurdle that developers are actively working to solve through solutions like Layer 2s. Furthermore, the space has seen its share of scams and hacks, highlighting the need for caution and robust security.' }
        ],
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'Despite these hurdles, the potential for a more equitable, open, and user-centric internet continues to drive development and attract talent from all over the world. The journey is just beginning.' }
        ],
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
          { type: 'text', value: 'Decentralized Finance, or DeFi, is a fast-growing sector of the crypto industry. It aims to recreate the entire traditional financial system—from lending and borrowing to insurance and trading—using decentralized, permissionless blockchain technology. It uses smart contracts—self-executing contracts with the terms of the agreement directly written into code—to create financial services that are open, transparent, and accessible to anyone with an internet connection.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Key DeFi Applications' }],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralized Exchanges (DEXs): ', style: 'bold' }, { type: 'text', value: 'Platforms like Uniswap and Sushiswap allow users to trade digital assets directly from their wallets. Instead of a central order book, they use Automated Market Makers (AMMs) to facilitate trades.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Lending & Borrowing: ', style: 'bold' }, { type: 'text', value: 'Protocols like Aave and Compound let users lend out their crypto to earn interest or borrow assets by providing collateral. Interest rates are determined algorithmically based on supply and demand.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Stablecoins: ', style: 'bold' }, { type: 'text', value: 'Cryptocurrencies like USDC and DAI that are pegged to a stable asset (like the US dollar) to minimize volatility and serve as a reliable medium of exchange within the DeFi ecosystem.' }] },
           { type: 'li', children: [{ type: 'text', value: 'Yield Farming: ', style: 'bold' }, { type: 'text', value: 'A more advanced strategy where users provide liquidity to DeFi protocols in exchange for rewards, often in the form of the protocol\'s governance token. This is a key driver of liquidity in the DeFi space.' }] },
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
        type: 'h2',
        children: [{ type: 'text', value: 'The Risks and Rewards' }],
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Rewards' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi offers unparalleled accessibility—anyone can access these financial services without needing a bank account. It also provides transparency, as all transactions are public on the blockchain. The potential for high yields on lending and liquidity provision is a major draw for investors.' }
        ],
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Risks' }],
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'However, the risks are significant. Smart contract bugs can lead to catastrophic losses of funds, as has been seen in numerous hacks. "Impermanent loss" is a unique risk for liquidity providers in AMMs. Additionally, the regulatory landscape is still uncertain, and the high volatility of crypto assets can lead to rapid liquidations for borrowers. It is crucial to do your own research and never invest more than you are willing to lose.' }
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
