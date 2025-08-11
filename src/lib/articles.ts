
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
          { type: 'text', value: 'Over the past thirty years, the internet has changed society, commerce, and communication. For all its wonders, the current web, often called Web2, has put huge power and data into the hands of a few technology companies. Web3 is a bold vision to rebuild the internet, aiming for a more decentralized, user-focused, and open digital world. It is not just an upgrade; it is a basic shift that seeks to give the keys of the digital kingdom back to its users. This guide explores the journey from Web1 to Web3, its main ideas, its real-world uses, and the challenges on the path to a decentralized future.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Evolutionary Path: From Web1 to Web3' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To understand Web3, it is good to know about the versions that came before it and the problems each one created and solved.' }
        ],
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web1: The Read-Only Web (Around 1991-2004)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web1 was the internet\'s early days. It was a large, digital library of static web pages built on open protocols like HTTP, SMTP, and FTP. A small number of developers and groups created content for a passive audience. Interaction was limited to simple links and email. Think of early Yahoo directories, static university websites, and personal homepages on services like GeoCities. While it was new, it was a one-way street of information. Power was spread out, since anyone could host a server, but the power to create and interact was very limited.' }
        ]
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web2: The Read-Write, Centralized Web (Around 2004-Present)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'The start of social media and user-generated content platforms was the start of Web2. The internet became interactive. Platforms like Facebook, Twitter, and YouTube let anyone become a creator, sharing their thoughts, photos, and videos with a world-wide audience. This led to a huge amount of creativity and connection. But, this ease came at a hidden price. The platforms that allowed this interaction became huge, central powers. They gave free services for user data, which they used to make money through targeted ads. In Web2, the user became the product. Your data, your social connections, and your content are locked in these corporate "walled gardens," controlled by their rules, terms of service, and business goals. This has led to worries about data privacy, control over content, and the huge, unchecked power of Big Tech.' }
        ]
      },
      {
        type: 'h3',
        children: [{ type: 'text', value: 'Web3: The Read-Write-Own, Decentralized Web' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 adds the final piece: ownership. It mixes the interactive nature of Web2 with the decentralized spirit of Web1, but on a new, stronger base. Using blockchain technology, Web3 lets users have true, provable ownership of their data, digital items, and online identity. Instead of logging into platforms with an email and password controlled by a company, you connect with a crypto wallet that only you control. This wallet becomes your digital identity, holding your items (like cryptocurrencies and NFTs) and giving you access to a new type of decentralized applications (dApps).' }
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
          { type: 'text', value: 'Web3 is built on a set of connected ideas that together create a stronger and fairer digital system.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'decentralization', title: 'Decentralization', description: [{ type: 'text', value: 'Instead of data being stored on servers owned by one company, it is spread across a network of computers around the world. This makes the system strong, resistant to control, and removes single points of failure.' }] },
            { icon: 'blockchain', title: 'Blockchain & Crypto', description: [{ type: 'text', value: 'Blockchains are the base of Web3, acting as a clear and unchangeable public record. Cryptocurrencies like Bitcoin and Ethereum provide the money layer, giving rewards for network members and allowing value to be sent without middlemen.' }] },
            { icon: 'trustless', title: 'Verifiable & Trustless', description: [{ type: 'text', value: 'The word "trustless" does not mean you can not trust anyone; it means you do not have to. The rules of an application are written in open-source smart contracts on the blockchain, letting anyone check the rules. This removes the need to trust a central company to be fair.' }] },
            { icon: 'ownership', title: 'Self-Custody & Digital Ownership', description: [{ type: 'text', value: 'Through crypto wallets, users have full control over their items and identity. This idea of "self-custody" means your digital property can not be taken, frozen, or blocked by a third party, giving you true digital freedom.' }] },
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
          { type: 'text', value: 'Web3 is not just an idea anymore; it is a growing system of applications and platforms that are already showing its power.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'defi', title: 'DeFi (Decentralized Finance)', description: [{ type: 'text', value: 'A whole other financial system being built on the blockchain. You can learn more in our '}, { type: 'link', href: '/guide-to-defi', value: 'Introduction to DeFi'}, { type: 'text', value: '. It includes services like lending, borrowing, and trading that are open to anyone with an internet connection, without traditional banks.' }] },
            { icon: 'nfts', title: 'NFTs (Non-Fungible Tokens)', description: [{ type: 'text', value: 'Provably unique digital items that show ownership of anything from art and collectibles to in-game items and real-world things. NFTs are giving creators a new way to make money from their work and connect with their communities directly.' }] },
            { icon: 'daos', title: 'DAOs (Decentralized Autonomous Organizations)', description: [{ type: 'text', value: 'Internet-based groups run by their members. Decisions are made by voting with special tokens, and money is managed clearly on the blockchain. DAOs are used to run everything from DeFi protocols to investment funds and social clubs.' }] },
            { icon: 'decentralized-social', title: 'Decentralized Social Media', description: [{ type: 'text', value: 'Platforms like Farcaster and Lens Protocol are building social networks where users own their data and social connections. This means you can take your followers and content with you from one application to another, breaking the "walled gardens" of Web2.' }] },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Big Hurdles on the Horizon' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Even with its promise, the path to wide Web3 use is hard and full of challenges that need to be solved.' }
        ],
      },
      {
        type: 'keyPoints',
        points: [
            { icon: 'ux', title: 'User Experience (UX)', description: [{ type: 'text', value: 'The current user experience in Web3 can be hard and scary. Managing wallets, seed phrases, and paying for "gas" (transaction fees) is a big problem for the average internet user. Getting started needs to be as easy as Web2.' }] },
            { icon: 'scalability', title: 'Scalability', description: [{ type: 'text', value: 'Popular blockchains like Ethereum can only handle a limited number of transactions per second right now. This creates slow-downs and high fees when many people are using it. Layer 2 scaling solutions are being worked on to fix this, but it is still a major issue.' }] },
            { icon: 'security', title: 'Security & Scams', description: [{ type: 'text', value: 'The self-custody nature of Web3 puts a lot of responsibility on the user. Phishing attacks, smart contract flaws, and smart scams are common, and unlike traditional finance, there is often no central power to undo bad transactions.' }] },
            { icon: 'regulation', title: 'Regulation', description: [{ type: 'text', value: 'Governments and rule-making bodies around the world are still trying to figure out how to handle this new technology. The lack of clear rules creates doubt for builders, investors, and users, which could slow down new ideas.' }] },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Dawn of a New Internet' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Web3 is more than just a tech change; it is a movement to create a more fair, open, and user-focused internet. It goes against the current model of central control and gives people true ownership in the digital world. The journey is still in its early stages, and the system is not yet fully grown. There will be good times and bad, wins and losses. But, the core ideas of decentralization and user power are strong forces that are bringing in a world-wide community of keen developers, creators, and thinkers. While the challenges are real, the chance to build a better internet for everyone is what makes Web3 one of the most exciting and important tech fields of our time.' }
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
    image: 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8RmluYW5jZXxlbnwwfHx8fDE3NTQ5NDg2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Learn how DeFi is rebuilding traditional financial systems like lending, borrowing, and trading on the blockchain, without the need for intermediaries.',
    content: [
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Decentralized Finance, or DeFi, is perhaps the most lively and game-changing area in the Web3 world. It presents a bold new way of thinking about the global financial system, built not on secret boardroom talks but on open, clear, and programmable code. DeFi uses blockchain technology to create a parallel financial world that is open to all, available everywhere, and works without the need for traditional middlemen like banks, brokers, or insurance companies. Instead, it uses smart contracts, which are self-running agreements written in code on a blockchain, to create and manage a wide range of financial products and services. This guide will look at the problems DeFi tries to solve, its main parts, and give a clear view of the huge chances and big risks in this new financial area. If you are new to the space, you might want to read our ' },
          { type: 'link', href: '/what-is-web3', value: 'guide to Web3' },
          { type: 'text', value: ' first.' }
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Why DeFi? The Problems in Traditional Finance (TradFi)' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'To fully see the new ideas in DeFi, one must first understand the limits and problems of the traditional financial (TradFi) system it wants to improve:' },
        ],
      },
      {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Centralization and Gatekeeping: ', style: 'bold' }, { type: 'text', value: 'TradFi is controlled by a few powerful groups that act as gatekeepers. They decide who can get financial services, often leaving out billions of people, especially in developing countries, who do not have the right papers or money.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Inefficiency and Cost: ', style: 'bold' }, { type: 'text', value: 'The system is built on old technology, leading to slow transaction times (often taking days) and high costs. Many middlemen, each taking a fee, make everything from sending money overseas to getting a loan more expensive.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Opacity and Systemic Risk: ', style: 'bold' }, { type: 'text', value: 'The way large financial groups work is often hidden. This lack of clearness can hide big risks, as shown by the 2008 financial crisis, where the complex and hidden nature of derivatives led to a global crash.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Censorship and Control: ', style: 'bold' }, { type: 'text', value: 'In a central system, a government or company can freeze your assets, block your transactions, or kick you off a platform, with little you can do. Your financial freedom depends on their okay.' }] },
        ]
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi offers a very different option by building financial services on a base of open rules and clear code, available to anyone, anywhere, with just an internet connection and a crypto wallet.' },
        ],
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Core Parts of the DeFi Stack' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'DeFi is often called "money Legos" because its different protocols are made to be combined. This means they can be easily put together to create new and more complex financial products. This ability to work together has led to fast new ideas. Here are some of the basic building blocks:' },
        ],
      },
      {
        type: 'keyPoints',
        points: [
          { icon: 'decentralization', title: 'Decentralized Exchanges (DEXs)', description: [{ type: 'text', value: 'Platforms like Uniswap, Curve, and PancakeSwap let users trade digital assets directly from their wallets. Instead of traditional order books, most DEXs use Automated Market Makers (AMMs), which are smart contracts that hold pools of assets and make trades based on a math formula.' }] },
          { icon: 'blockchain', title: 'Lending & Borrowing Protocols', description: [{ type: 'text', value: 'Protocols like Aave and Compound act as decentralized money markets. Users can lend their crypto assets to earn interest or put up their assets as collateral to borrow other assets. Interest rates are set by a formula based on supply and demand in the protocol.' }] },
          { icon: 'trustless', title: 'Stablecoins', description: [{ type: 'text', value: 'The foundation of DeFi. Stablecoins are cryptocurrencies made to keep a stable value by linking to an outside asset, usually the US Dollar. Coins like USDC, USDT, and the decentralized DAI are key for reducing the price swings of other crypto assets and act as a reliable way to trade.' }] },
          { icon: 'ownership', title: 'Liquid Staking', description: [{ type: 'text', value: 'Protocols like Lido and Rocket Pool solve the problem of staked assets (crypto locked up to help secure a network) not being usable. They let users stake their tokens and get a liquid, tokenized version back (e.g., stETH for ETH). This token can then be used in other DeFi protocols, freeing up money.' }] },
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
          { type: 'text', value: 'While it is a big change, DeFi is often called the "Wild West" of finance for a good reason. The risks are large and varied, and anyone taking part should be very careful.' }
        ],
      },
       {
        type: 'ul',
        children: [
          { type: 'li', children: [{ type: 'text', value: 'Smart Contract Risk: ', style: 'bold' }, { type: 'text', value: 'This is the biggest risk in DeFi. A bug or flaw in a protocol\'s smart contract code can be used by hackers, possibly leading to a total and permanent loss of all user funds. While checks from good firms can lower this risk, they are not a sure promise of safety.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Impermanent Loss: ', style: 'bold' }, { type: 'text', value: 'A unique and often misunderstood risk for those who provide money to Automated Market Makers (AMMs). If the price of the assets in a liquidity pool changes a lot, the value of the provider\'s stake can be less than if they had just kept the assets in their wallet.' }] },
          { type: 'li', children: [{ type: 'text', value: 'Volatility and Liquidation Risk: ', style: 'bold' }, { type: 'text', value: 'The high price swings of most crypto assets create big risks for borrowers. If the value of their collateral drops below a certain point set by the protocol, their position can be automatically sold off to repay the loan, often with a large fee.' }] },
          { type: 'li', children: [{ type: 'text', value: 'MEV (Maximal Extractable Value): ', style: 'bold' }, { type: 'text', value: 'This is the profit that can be taken by smartly reordering, adding, or blocking transactions in a block. Advanced traders and bots can use plans like front-running (seeing a large trade and placing an order before it) and sandwich attacks to make money at the cost of normal users, creating a hidden tax on their transactions.' }] },
        ]
      },
      {
        type: 'h2',
        children: [{ type: 'text', value: 'The Future of Finance is Being Built' }],
      },
      {
        type: 'p',
        children: [
            { type: 'text', value: 'DeFi marks a deep change in the world of finance. It is a field of amazing new ideas, offering the chance for a more open, efficient, and clear global financial system. But, it is also a new and very experimental area with a lot of risk. The technology is still growing, the user experience can be hard, and the rules are not clear. As DeFi grows, the key to its success will be balancing its open ideals with the need for more security, user protection, and the ability to handle more users. For those ready to deal with its complexities and risks, DeFi offers a front-row seat to the building of a new financial future.' }
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
  return articles.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return articles.find((article) => article.slug === slug);
}
