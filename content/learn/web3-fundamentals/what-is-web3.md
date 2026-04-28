---
title: "What is Web3?"
description: "A plain-English explanation of Web3 with diagrams showing how it works and why it matters."
order: 1
readTime: "8 min"
difficulty: "beginner"
prerequisites: []
quiz:
  - question: "What is the main difference between Web2 and Web3?"
    options:
      - "Web3 is faster than Web2"
      - "In Web3, users own their data and assets instead of companies"
      - "Web3 only works on mobile devices"
      - "Web3 does not use the internet"
    correct: 1
    explanation: "Web3 is about ownership. In Web2, platforms like Google and Meta hold your data. In Web3, you hold your own assets in a wallet."
  - question: "What does a wallet do in Web3?"
    options:
      - "It stores your passwords for websites"
      - "It is a browser extension for blocking ads"
      - "It acts as your identity and holds your money and tokens"
      - "It mines cryptocurrency automatically"
    correct: 2
    explanation: "A Web3 wallet is two things in one: your identity (it proves who you are) and your bank account (it holds your crypto and tokens)."
  - question: "What is a smart contract?"
    options:
      - "A legal agreement signed digitally"
      - "A program that runs automatically on a blockchain"
      - "A contract between a company and its employees"
      - "An AI chatbot that answers questions"
    correct: 1
    explanation: "Smart contracts are programs that live on a blockchain and run by themselves when conditions are met. No human needs to approve the action."
  - question: "Why do most Web3 apps still use regular servers?"
    options:
      - "Because blockchains do not actually work"
      - "Because blockchains are slow and expensive for everyday operations"
      - "Because Web3 is the same as Web2"
      - "Because governments require it"
    correct: 1
    explanation: "Blockchains are great for money and ownership, but too slow and expensive for everything else. Web3 apps use blockchains for the important parts and regular servers for speed."
  - question: "Which of these is a stablecoin?"
    options:
      - "ETH"
      - "BTC"
      - "USDC"
      - "UNI"
    correct: 2
    explanation: "USDC is a stablecoin pegged to the US dollar. ETH is Ethereum's native currency, BTC is Bitcoin, and UNI is Uniswap's governance token."
---

## The one-sentence version

Web3 is an internet where you own your stuff. Your money, your data, your identity - you hold them, not a company.

## Think of it like this

Right now, when you post a photo on Instagram, Instagram owns it. When you save money in a bank, the bank holds it. When you buy a game on Steam, Steam can remove it from your library.

Web3 flips this. You hold your own money in a wallet on your phone. You own your digital items directly. No company sits in the middle.

<div class="diagram">
<svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Web2 side -->
  <text x="200" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#666">Today (Web2)</text>
  <rect x="40" y="50" width="100" height="50" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="90" y="80" text-anchor="middle" font-size="13" fill="#374151">You</text>
  <rect x="260" y="50" width="100" height="50" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="310" y="80" text-anchor="middle" font-size="13" fill="#374151">You</text>
  <rect x="150" y="140" width="120" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="210" y="165" text-anchor="middle" font-size="13" font-weight="600" fill="#1e40af">Company</text>
  <text x="210" y="182" text-anchor="middle" font-size="11" fill="#3b82f6">(owns everything)</text>
  <line x1="90" y1="100" x2="180" y2="140" stroke="#9ca3af" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="310" y1="100" x2="240" y2="140" stroke="#9ca3af" stroke-width="1.5" marker-end="url(#arrow)"/>
  
  <!-- Web3 side -->
  <text x="600" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#666">Web3</text>
  <rect x="470" y="50" width="100" height="50" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="520" y="80" text-anchor="middle" font-size="13" fill="#374151">You</text>
  <rect x="630" y="50" width="100" height="50" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="680" y="80" text-anchor="middle" font-size="13" fill="#374151">You</text>
  <line x1="570" y1="75" x2="630" y2="75" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <rect x="530" y="140" width="140" height="60" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
  <text x="600" y="165" text-anchor="middle" font-size="13" font-weight="600" fill="#166534">Blockchain</text>
  <text x="600" y="182" text-anchor="middle" font-size="11" fill="#22c55e">(no middleman)</text>
  <line x1="520" y1="100" x2="570" y2="140" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="680" y1="100" x2="630" y2="140" stroke="#22c55e" stroke-width="1.5"/>

  <!-- Arrows -->
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#9ca3af"/></marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
  </defs>
</svg>
</div>

## Three phases of the internet

The internet changed twice before. We are in the middle of the third change.

| Era | Years | What you could do | Who was in charge |
| --- | --- | --- | --- |
| Web1 | 1991-2004 | Read websites | Nobody (open protocols) |
| Web2 | 2004-now | Read + write + share | Big platforms (Google, Meta, Amazon) |
| Web3 | 2015-now | Read + write + own | Users (through blockchains) |

**Web1** was like a library. You could read, but you could not write. Websites were static pages. If you wanted to publish, you needed to know HTML.

**Web2** gave everyone a voice. Facebook, YouTube, and Twitter let anyone post. But the trade-off was big: these platforms collected your data and sold ads against it. You became the product.

**Web3** adds ownership. When you buy a token, you hold it in your own wallet. When you earn rewards from a protocol, they go straight to you. No company can freeze your account or change the rules.

## The four building blocks

Web3 runs on four things. Each one is simple on its own.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <rect x="20" y="30" width="170" height="140" rx="12" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="105" y="70" text-anchor="middle" font-size="28">⛓️</text>
  <text x="105" y="100" text-anchor="middle" font-size="14" font-weight="600" fill="#1e40af">Blockchains</text>
  <text x="105" y="118" text-anchor="middle" font-size="11" fill="#64748b">Shared record books</text>
  <text x="105" y="133" text-anchor="middle" font-size="11" fill="#64748b">that nobody controls</text>
  
  <rect x="215" y="30" width="170" height="140" rx="12" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="300" y="70" text-anchor="middle" font-size="28">📜</text>
  <text x="300" y="100" text-anchor="middle" font-size="14" font-weight="600" fill="#854d0e">Smart Contracts</text>
  <text x="300" y="118" text-anchor="middle" font-size="11" fill="#64748b">Programs that run</text>
  <text x="300" y="133" text-anchor="middle" font-size="11" fill="#64748b">automatically on-chain</text>

  <rect x="410" y="30" width="170" height="140" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="495" y="70" text-anchor="middle" font-size="28">👛</text>
  <text x="495" y="100" text-anchor="middle" font-size="14" font-weight="600" fill="#166534">Wallets</text>
  <text x="495" y="118" text-anchor="middle" font-size="11" fill="#64748b">Your identity and</text>
  <text x="495" y="133" text-anchor="middle" font-size="11" fill="#64748b">bank account in one</text>

  <rect x="605" y="30" width="170" height="140" rx="12" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="690" y="70" text-anchor="middle" font-size="28">🪙</text>
  <text x="690" y="100" text-anchor="middle" font-size="14" font-weight="600" fill="#9d174d">Tokens</text>
  <text x="690" y="118" text-anchor="middle" font-size="11" fill="#64748b">Digital money, votes,</text>
  <text x="690" y="133" text-anchor="middle" font-size="11" fill="#64748b">or ownership rights</text>
</svg>
</div>

### Blockchains

A blockchain is a shared record book. Thousands of computers around the world each keep a copy. When someone sends money, every copy gets updated at the same time. No single person or company can change the records.

Ethereum is the most popular blockchain for building apps. Bitcoin was first but is mostly used for storing and sending money.

### Smart contracts

A smart contract is a small program that lives on a blockchain. It runs by itself when certain conditions are met.

Example: You send 1 ETH to a trading contract. The contract checks the current price, calculates the exchange rate, and sends you USDC back. No human touches the trade. No company approves it. The code just runs.

### Wallets

A wallet is two things in one: your identity and your bank account. When you connect to a Web3 app, your wallet proves who you are. It also holds your money and tokens.

Popular wallets: MetaMask (browser), Phantom (Solana), Rabby (multi-chain). Hardware wallets like Ledger keep your keys on a physical device for extra safety.

### Tokens

Tokens are digital units that represent something. A few common types:

- **ETH** - the currency of Ethereum, used to pay for transactions
- **USDC** - a stablecoin worth $1, backed by real dollars in a bank
- **UNI** - a governance token that lets holders vote on how Uniswap works

## What is different for you

| If you are a... | Web2 | Web3 |
| --- | --- | --- |
| **User** | Platform holds your data | You hold your data |
| **Developer** | Build on private APIs | Build on open protocols |
| **Business** | Revenue from ads | Revenue from protocol fees |

For **job seekers**: Web3 companies are hiring right now. Our job board tracks 1,500+ open roles. You do not need blockchain experience to start. Most roles ask for Python, SQL, or JavaScript - the same skills you already have. Companies train the Web3-specific parts internally.

## What Web3 does not do

Web3 is not magic. Some honest things to know:

- Most Web3 apps still use regular servers for speed. Only the important parts (money, ownership) go on-chain.
- If you lose your wallet password (called a seed phrase), your money is gone. There is no "forgot password" button.
- Transaction fees exist. Sending money on Ethereum costs a few dollars. Layer 2 networks bring this down to cents.
- Scams exist. If someone DMs you about a "special token," it is almost always a scam.

## Next steps

Now that you know what Web3 is, the next lessons cover each building block in detail:

1. **How the Internet Evolved** - the full story from dial-up to decentralization
2. **Web3 vs Web2** - a side-by-side look at how the two actually work
3. **Wallets and Keys** - set up your first wallet in 5 minutes
