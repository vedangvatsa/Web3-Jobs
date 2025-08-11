
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
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralization: ', style: 'bold' }, { type: 'text', value: 'Instead of data being stored on servers owned by a single company, it\'s distributed across a global network of computers. This creates a resilient, censorship-resistant foundation where no single entity has control.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Blockchain & Crypto: ', style: 'bold' }, { type: 'text', value: 'Blockchains like Ethereum act as a global "state machine." They are transparent, immutable ledgers that track transactions and the state of applications. Cryptocurrencies are the native economic layer, enabling value transfer and incentivizing network participants.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Verifiable & Trustless: ', style: 'bold' }, { type: 'text', value: 'Because the logic is encoded in open-source smart contracts on a public blockchain, users can verify the rules of an application themselves. You don\'t have to trust a company; you just have to trust the code.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Self-Custody & Digital Ownership: ', style: 'bold' }, { type: 'text', value: 'Users manage their own assets and identity through cryptographic wallets (e.g., MetaMask). This is the key to true ownership. Your assets are in your wallet, not on a company\'s database, and only you can access them with your private keys.' }] },
        ],
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
        type: 'ul',
        children: [
            { type: 'li', children: [{ type: 'text', value: 'DeFi (Decentralized Finance): ', style: 'bold' }, { type: 'text', value: 'Financial services like lending, borrowing, and trading built on open protocols. (See our separate guide on DeFi for more!)'}] },
            { type: 'li', children: [{ type: 'text', value: 'NFTs (Non-Fungible Tokens): ', style: 'bold' }, { type: 'text', value: 'Provably unique digital assets representing ownership of art, collectibles, in-game items, or even real-world assets.'}] },
            { type: 'li', children: [{ type: 'text', value: 'DAOs (Decentralized Autonomous Organizations): ', style: 'bold' }, { type: 'text', value: 'Internet-native organizations where members vote on decisions and manage collective resources using tokens.'}] },
            { type: 'li', children: [{ type: 'text', value: 'Decentralized Social Media: ', style: 'bold' }, { type: 'text', value: 'Platforms like Farcaster and Lens Protocol aim to give users control over their social graph and content, free from the whims of a central algorithm.'}] },
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
        type: 'ul',
        children: [
            { type: 'li', children: [{ type: 'text', value: 'User Experience (UX): ', style: 'bold' }, { type: 'text', value: 'Using Web3 applications can be daunting. Managing wallets, seed phrases, and gas fees is a major hurdle for mainstream adoption.'}] },
            { type: 'li', children: [{ type: 'text', value: 'Scalability: ', style: 'bold' }, { type: 'text', value: 'Blockchains like Ethereum can only process a limited number of transactions per second, leading to high fees during peak demand. Solutions like Layer 2 rollups are actively being developed to address this.'}] },
            { type: 'li', children: [{ type: 'text', value: 'Security & Scams: ', style: 'bold' }, { type: 'text', value: 'The self-custody nature of Web3 means users are fully responsible for their security. Phishing attacks, smart contract bugs, and scams are rampant.'}] },
            { type: 'li', children: [{ type: 'text', value: 'Regulation: ', style: 'bold' }, { type: 'text', value: 'Governments around the world are still figuring out how to approach this new technology, creating an uncertain regulatory landscape.'}] },
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
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Decentralized Exchanges (DEXs): ', style: 'bold' }, { type: 'text', value: 'Platforms like Uniswap and Curve allow users to trade digital assets directly from their wallets without a central intermediary. They use Automated Market Makers (AMMs)—pools of assets governed by an algorithm—to facilitate trades instead of traditional order books.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Lending & Borrowing Protocols: ', style: 'bold' }, { type: 'text', value: 'Protocols like Aave and Compound allow users to lend their crypto to earn interest or borrow assets by supplying collateral. Interest rates are determined algorithmically based on real-time supply and demand.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Stablecoins: ', style: 'bold' }, { type: 'text', value: 'The bedrock of DeFi. These are cryptocurrencies like USDC and DAI, which are pegged to a stable asset (like the US dollar) to minimize volatility and serve as a reliable medium of exchange.' }] },
           { type: 'li', children: [{ type: 'text', value: 'Liquid Staking: ', style: 'bold' }, { type: 'text', value: 'Protocols like Lido allow users to stake their assets (e.g., ETH) to help secure the network and earn rewards, while receiving a liquid token representation (e.g., stETH) that can be used elsewhere in DeFi. This unlocks liquidity that would otherwise be locked up.' }] },
           { type: 'li', children: [{ type: 'text', value: 'Derivatives & Synthetics: ', style: 'bold' }, { type: 'text', value: 'Platforms like Synthetix and GMX enable the creation of synthetic assets that track the price of real-world assets (like stocks or commodities) and allow for on-chain perpetual futures trading.' }] },
        ],
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
