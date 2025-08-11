
import type { Article } from '@/types';

const articles: Article[] = [
  {
    slug: 'what-is-web3',
    title: 'What is Web3? A Beginner\'s Guide to the Decentralized Internet',
    image: 'https://images.unsplash.com/photo-1665597704311-d7304eaf70ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHx3ZWIzfGVufDB8fHx8MTc1NDk0ODU1MXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Explore the fundamentals of Web3, the next evolution of the internet built on blockchain technology, decentralization, and user empowerment.',
    content: [
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Over the past three decades, the internet has reshaped society, commerce, and communication. Yet, for all its wonders, the current web—often called Web2—has concentrated immense power and data into the hands of a few technology giants. Web3 represents a bold and ambitious vision to re-architect the internet, aiming to create a more decentralized, user-centric, and open digital world. It\'s not just an upgrade; it\'s a fundamental paradigm shift that seeks to hand the keys of the digital kingdom back to its users. This guide will explore the journey from Web1 to Web3, break down its core principles, examine its real-world applications, and honestly assess the challenges that lie on the path to a decentralized future.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Evolutionary Path: From Web1 to Web3' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To truly grasp the significance of Web3, it\'s essential to understand its predecessors and the problems each era created and solved.' }
        ],
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web1: The Read-Only Web (~1991-2004)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web1 was the internet\'s infancy. It was a vast, digital library of static web pages built on open protocols like HTTP, SMTP, and FTP. Content was created by a small number of developers and organizations and consumed by a passive audience. Interactivity was limited to basic hyperlinks and email. Think of early Yahoo directories, static university websites, and personal homepages on services like GeoCities. While revolutionary, it was a one-way street of information. Power was decentralized in the sense that anyone could host a server, but the ability to create and interact was highly limited.' }
        ]
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web2: The Read-Write, Centralized Web (~2004-Present)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'The advent of social media and user-generated content platforms marked the beginning of Web2. The internet became interactive. Platforms like Facebook, Twitter, and YouTube empowered anyone to become a creator, sharing their thoughts, photos, and videos with a global audience. This led to an explosion of creativity and connectivity. However, this convenience came with a hidden cost. The platforms that enabled this interaction became centralized behemoths. They provided free services in exchange for user data, which they monetized through targeted advertising. In Web2, the user became the product. Your data, your social graph, and your content are locked within these corporate "walled gardens," subject to their algorithms, terms of service, and business interests. This centralization has led to concerns about data privacy, censorship, and the immense, unchecked power of Big Tech.' }
        ]
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web3: The Read-Write-Own, Decentralized Web' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 introduces the missing piece: ownership. It combines the interactive, dynamic nature of Web2 with the decentralized ethos of Web1, but on a new, more powerful foundation. By leveraging blockchain technology, Web3 enables users to have true, verifiable ownership of their data, digital assets, and online identity. Instead of logging into platforms with an email and password controlled by a company, you connect with a cryptographic wallet that you alone control. This wallet becomes your digital identity, holding your assets (like cryptocurrencies and NFTs) and giving you access to a new generation of decentralized applications (dApps).' }
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
        children: [{ type: 'text', value: 'The Core Pillars of Web3' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is built on a set of interconnected principles that collectively create a more robust and equitable digital infrastructure.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'decentralization', title: 'Decentralization', description: 'Instead of data being stored on servers owned by a single company, it is distributed across a peer-to-peer network of computers worldwide. This makes the system resilient, censorship-resistant, and removes single points of failure.' },
            { icon: 'blockchain', title: 'Blockchain & Crypto', description: 'Blockchains are the backbone of Web3, acting as a transparent and immutable public ledger. Cryptocurrencies like Bitcoin and Ethereum provide the native economic layer, creating incentives for network participants and enabling value transfer without intermediaries.' },
            { icon: 'trustless', title: 'Verifiable & Trustless', description: 'The term "trustless" doesn\'t mean you can\'t trust anyone; it means you don\'t have to. The logic of an application is encoded in open-source smart contracts on the blockchain, allowing anyone to verify the rules. This eliminates the need to trust a central company to act honorably.' },
            { icon: 'ownership', title: 'Self-Custody & Digital Ownership', description: 'Through cryptographic wallets, users have full control over their assets and identity. This concept of "self-custody" means your digital property cannot be seized, frozen, or censored by a third party, giving you true digital sovereignty.' },
        ]
      },
      {
        type: 'cta',
        text: 'Learn Web3 for free',
        href: 'https://academy.hashtagweb3.com'
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Web3 in Action: What Does It Look Like?' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is no longer a theoretical concept; it\'s a burgeoning ecosystem of applications and platforms that are already demonstrating its potential.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'defi', title: 'DeFi (Decentralized Finance)', description: 'An entire parallel financial system being built on the blockchain. It includes services like lending, borrowing, trading, and insurance that are accessible to anyone with an internet connection, bypassing traditional banks.' },
            { icon: 'nfts', title: 'NFTs (Non-Fungible Tokens)', description: 'Provably unique digital assets that represent ownership of anything from art and collectibles to in-game items and real-world assets. NFTs are giving creators a new way to monetize their work and engage with their communities directly.' },
            { icon: 'daos', title: 'DAOs (Decentralized Autonomous Organizations)', description: 'Internet-native organizations governed by their members. Decisions are made through voting with governance tokens, and financial resources are managed transparently on the blockchain. DAOs are used to manage everything from DeFi protocols to investment funds and social clubs.' },
            { icon: 'decentralized-social', title: 'Decentralized Social Media', description: 'Platforms like Farcaster and Lens Protocol are building social networks where users own their data and social graph. This means you can take your followers and content with you from one application to another, breaking down the walled gardens of Web2.' },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Significant Hurdles on the Horizon' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Despite its promise, the path to mainstream Web3 adoption is steep and fraught with challenges that must be addressed.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'ux', title: 'User Experience (UX)', description: 'The current user experience in Web3 can be complex and intimidating. Managing wallets, seed phrases, and paying for "gas" (transaction fees) is a significant barrier for the average internet user. Onboarding needs to become as seamless as Web2.' },
            { icon: 'scalability', title: 'Scalability', description: 'Popular blockchains like Ethereum can currently only process a limited number of transactions per second. This creates network congestion and high fees during peak demand. Layer 2 scaling solutions are being actively developed to address this, but it remains a critical bottleneck.' },
            { icon: 'security', title: 'Security & Scams', description: 'The self-custody nature of Web3 places a high burden of responsibility on the user. Phishing attacks, smart contract vulnerabilities, and sophisticated scams are rampant, and unlike traditional finance, there is often no central authority to reverse fraudulent transactions.' },
            { icon: 'regulation', title: 'Regulation', description: 'Governments and regulatory bodies around the world are still grappling with how to approach this new technological frontier. The lack of clear regulatory frameworks creates uncertainty for builders, investors, and users, potentially stifling innovation.' },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Conclusion: The Dawn of a New Internet' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is more than just a technological evolution; it\'s a philosophical movement aimed at creating a more equitable, open, and user-centric internet. It challenges the status quo of centralized control and empowers individuals with true ownership in the digital world. The journey is still in its early stages, and the ecosystem is far from mature. There will be booms and busts, successes and failures. However, the core ideas of decentralization and user sovereignty are powerful forces that are attracting a global community of passionate developers, creators, and thinkers. While the challenges are real, the potential to build a better internet for everyone is what makes Web3 one of the most exciting and important technological frontiers of our time.' }
        ],
      },
      {
        type: 'cta',
        text: 'Find Your Next Web3 Job',
        href: 'https://t.me/web3hiring'
      }
    ]
  },
  {
    slug: 'guide-to-defi',
    title: 'An Introduction to Decentralized Finance (DeFi)',
    image: 'https://images.unsplash.com/photo-1642155518939-479e085e1c09?q=80&w=1200&h=630&auto=format&fit=crop',
    description: 'Learn how DeFi is rebuilding traditional financial systems like lending, borrowing, and trading on the blockchain, without the need for intermediaries.',
    content: [
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Decentralized Finance, or DeFi, is arguably the most dynamic and disruptive sector within the Web3 ecosystem. It represents a bold reimagining of the global financial system, built not on closed-door boardroom decisions but on open, transparent, and programmable code. DeFi leverages blockchain technology to create a parallel financial world that is permissionless, globally accessible, and operates without the need for traditional intermediaries like banks, brokerages, or insurers. Instead, it relies on smart contracts—self-executing agreements written in code on a blockchain—to create and manage a wide array of financial products and services. This guide will delve into the problems DeFi aims to solve, explore its core components, and provide a clear-eyed view of the immense opportunities and significant risks inherent in this financial frontier.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Why DeFi? The Flaws in Traditional Finance (TradFi)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To fully appreciate the innovation of DeFi, one must first understand the limitations and inefficiencies of the traditional financial (TradFi) system it seeks to improve upon:' },
        ],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Centralization and Gatekeeping: ', style: 'bold' }, { type: 'text', value: 'TradFi is dominated by a small number of powerful institutions that act as gatekeepers. They determine who can access financial services, often excluding billions of people, particularly in developing nations, who lack the required documentation or wealth.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Inefficiency and Cost: ', style: 'bold' }, { type: 'text', value: 'The system is built on outdated technology, leading to slow transaction settlement times (often taking days) and high costs. Numerous intermediaries, each taking a fee, inflate the cost of everything from sending money abroad to getting a loan.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Opacity and Systemic Risk: ', style: 'bold' }, { type: 'text', value: 'The inner workings of large financial institutions are often a black box. This lack of transparency can hide systemic risks, as tragically demonstrated by the 2008 financial crisis, where the complex and opaque nature of derivatives led to a global meltdown.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Censorship and Control: ', style: 'bold' }, { type: 'text', value: 'In a centralized system, a government or corporation can unilaterally freeze your assets, block your transactions, or de-platform you, leaving you with little recourse. Your financial autonomy is contingent on their approval.' }] },
        ]
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi presents a radical alternative by building financial services on a foundation of open protocols and transparent code, available to anyone, anywhere, with just an internet connection and a crypto wallet.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Components of the DeFi Stack' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi is often described as "money Legos" because its various protocols are designed to be composable—meaning they can be easily combined and integrated to create new and more sophisticated financial products. This interoperability has led to a rapid pace of innovation. Here are some of the fundamental building blocks:' },
        ],
      },
      {
        type: 'keyPoints',
        points: [
          { icon: 'decentralization', title: 'Decentralized Exchanges (DEXs)', description: 'Platforms like Uniswap, Curve, and PancakeSwap allow users to trade digital assets directly from their wallets. Instead of traditional order books, most DEXs use Automated Market Makers (AMMs), which are smart contracts that hold pools of assets and execute trades based on a mathematical formula.' },
          { icon: 'blockchain', title: 'Lending & Borrowing Protocols', description: 'Protocols like Aave and Compound function as decentralized money markets. Users can lend their crypto assets to earn interest or deposit their assets as collateral to borrow other assets. Interest rates are determined algorithmically based on supply and demand within the protocol.' },
          { icon: 'trustless', title: 'Stablecoins', description: 'The bedrock of DeFi. Stablecoins are cryptocurrencies designed to maintain a stable value by pegging to an external asset, typically the US Dollar. Coins like USDC, USDT, and the decentralized DAI are crucial for mitigating the volatility of other crypto assets and serve as a reliable medium of exchange.' },
          { icon: 'ownership', title: 'Liquid Staking', description: 'Protocols like Lido and Rocket Pool address the illiquidity of staked assets (crypto locked up to help secure a network). They allow users to stake their tokens while receiving a liquid, tokenized version in return (e.g., stETH for ETH). This token can then be used across other DeFi protocols, unlocking capital efficiency.' },
        ]
      },
      {
        type: 'cta',
        text: 'Join AI & Web3 Community',
        href: 'https://t.me/addlist/gkBHozFQkTllOTdl'
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Unavoidable Risks of an Open Financial System' }],
      },
       {
        type: 'p',
        children: [
          { type: 'text', value: 'While revolutionary, DeFi is often called the "Wild West" of finance for good reason. The risks are substantial and multifaceted, and anyone participating should proceed with extreme caution.' }
        ],
      },
       {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Smart Contract Risk: ', style: 'bold' }, { type: 'text', value: 'This is the most significant risk in DeFi. A bug or vulnerability in a protocol\'s smart contract code can be exploited by hackers, potentially leading to a complete and irreversible loss of all user funds. While audits from reputable firms can mitigate this risk, they are not an ironclad guarantee of safety.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Impermanent Loss: ', style: 'bold' }, { type: 'text', value: 'A unique and often misunderstood risk for those who provide liquidity to Automated Market Makers (AMMs). If the price of the assets in a liquidity pool changes significantly, the value of the provider\'s stake can end up being less than if they had simply held the assets in their wallet.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Volatility and Liquidation Risk: ', style: 'bold' }, { type: 'text', value: 'The high volatility of most crypto assets creates significant risk for borrowers. If the value of their deposited collateral drops below a certain threshold determined by the protocol, their position can be automatically liquidated (sold off) to repay the loan, often incurring a hefty penalty.' }] },
          { type: 'li', children: [{ type: 'text', value: 'MEV (Maximal Extractable Value): ', style: 'bold' }, { type: 'text', value: 'This refers to the profit that can be extracted by strategically reordering, inserting, or censoring transactions within a block. Advanced traders and bots can use strategies like front-running (seeing a large trade and placing an order before it) and sandwich attacks to profit at the expense of ordinary users, creating an invisible tax on their transactions.' }] },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Conclusion: The Future of Finance is Being Built' }],
      },
      {
        type: 'p',
        children: [
            { type: 'text', value: 'DeFi represents a profound paradigm shift in the world of finance. It is an arena of incredible innovation, offering the potential for a more inclusive, efficient, and transparent global financial system. However, it is also a nascent and highly experimental space fraught with risk. The technology is still maturing, the user experience can be challenging, and the regulatory landscape is uncertain. As DeFi evolves, the key to its success will be balancing its permissionless ideals with the need for greater security, user protection, and scalability. For those willing to navigate its complexities and risks, DeFi offers a front-row seat to the construction of a new financial future.' }
        ]
      },
      {
        type: 'cta',
        text: 'Web3 Job Feed',
        href: 'https://t.me/web3hiring'
      }
    ]
  }
];

export async function getAllArticles(): Promise<Article[]> {
  // In a real app, this would fetch from a database or CMS
  return articles.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  // In a real app, this would fetch a single article
  return articles.find((article) => article.slug === slug);
}
