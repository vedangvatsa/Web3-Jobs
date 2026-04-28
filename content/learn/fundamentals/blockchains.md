---
title: "How Blockchains Work"
description: "Blocks, hashes, nodes, and consensus - how blockchains actually work, explained with diagrams."
order: 3
readTime: "12 min"
difficulty: "beginner"
prerequisites: ["history"]
quiz:
  - question: "What is a block in a blockchain?"
    options:
      - "A type of cryptocurrency"
      - "A bundle of transactions grouped together"
      - "A computer that runs the network"
      - "A password for your wallet"
    correct: 1
    explanation: "A block is a bundle of transactions. Each block holds a few hundred to a few thousand transactions, along with a hash of the previous block."
  - question: "What makes it nearly impossible to change old transactions?"
    options:
      - "A company reviews every change"
      - "Each block contains the hash of the previous block, so changing one breaks the chain"
      - "Transactions are encrypted with passwords"
      - "Old blocks are deleted from the system"
    correct: 1
    explanation: "Each block contains the hash of the previous block. If you change one old transaction, its block's hash changes, which breaks every block after it. You would need to redo all the work for every subsequent block."
  - question: "What do nodes do in a blockchain network?"
    options:
      - "They design the blockchain's website"
      - "They store a copy of the blockchain and verify transactions"
      - "They create new cryptocurrencies"
      - "They set the price of tokens"
    correct: 1
    explanation: "Nodes are computers that each keep a full copy of the blockchain. They verify every transaction independently. If thousands of nodes agree, the transaction is valid."
  - question: "In Proof of Stake, what do validators risk to participate?"
    options:
      - "Their electricity bill"
      - "Their computer hardware"
      - "Their own tokens (staked as collateral)"
      - "Their identity documents"
    correct: 2
    explanation: "In Proof of Stake, validators lock up (stake) their own tokens as collateral. If they try to cheat, their stake gets 'slashed' (taken away). This is what keeps them honest."
  - question: "Why is a blockchain called 'immutable'?"
    options:
      - "Because it is very fast"
      - "Because no one is allowed to read it"
      - "Because once data is added, it is practically impossible to change"
      - "Because it only works on one computer"
    correct: 2
    explanation: "Immutable means it cannot be changed. Once a transaction is confirmed and buried under more blocks, changing it would require redoing all the work after it and convincing the entire network to accept your version."
---

## What problem does a blockchain solve?

Imagine you and a friend keep score in a game, but you each write the score on your own paper. If there is a disagreement, who is right?

A blockchain solves this by giving everyone the same paper, and making it so nobody can erase what was already written.

In the real world, this matters for money. If Alice sends $100 to Bob, how do both sides know the money actually moved? Today, a bank keeps the record. A blockchain replaces the bank with math and thousands of computers.

## Blocks: bundles of transactions

A blockchain is, quite literally, a chain of blocks.

Each block is a container. It holds a list of recent transactions — "Alice sent 2 ETH to Bob," "Charlie sent 0.5 ETH to Diana," and so on. A typical Ethereum block holds a few hundred transactions.

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Block 1 -->
  <rect x="20" y="30" width="200" height="160" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="120" y="55" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">Block #1</text>
  <line x1="40" y1="65" x2="200" y2="65" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="85" font-size="11" fill="#64748b">Prev hash: 0000...</text>
  <text x="40" y="102" font-size="11" fill="#64748b">Timestamp: Jan 2015</text>
  <line x1="40" y1="112" x2="200" y2="112" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="130" font-size="11" fill="#334155">Alice → Bob: 2 ETH</text>
  <text x="40" y="147" font-size="11" fill="#334155">Eve → Frank: 1 ETH</text>
  <text x="40" y="164" font-size="11" fill="#334155">Grace → Hank: 5 ETH</text>
  <text x="120" y="183" text-anchor="middle" font-size="10" fill="#94a3b8">Hash: a3f8...</text>

  <!-- Arrow 1→2 -->
  <line x1="220" y1="110" x2="280" y2="110" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowBlue)"/>

  <!-- Block 2 -->
  <rect x="280" y="30" width="200" height="160" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="380" y="55" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">Block #2</text>
  <line x1="300" y1="65" x2="460" y2="65" stroke="#e2e8f0" stroke-width="1"/>
  <text x="300" y="85" font-size="11" fill="#3b82f6" font-weight="600">Prev hash: a3f8...</text>
  <text x="300" y="102" font-size="11" fill="#64748b">Timestamp: Jan 2015</text>
  <line x1="300" y1="112" x2="460" y2="112" stroke="#e2e8f0" stroke-width="1"/>
  <text x="300" y="130" font-size="11" fill="#334155">Bob → Carol: 1 ETH</text>
  <text x="300" y="147" font-size="11" fill="#334155">Dana → Eve: 3 ETH</text>
  <text x="300" y="164" font-size="11" fill="#334155">Frank → Grace: 2 ETH</text>
  <text x="380" y="183" text-anchor="middle" font-size="10" fill="#94a3b8">Hash: 7b2c...</text>

  <!-- Arrow 2→3 -->
  <line x1="480" y1="110" x2="540" y2="110" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowBlue)"/>

  <!-- Block 3 -->
  <rect x="540" y="30" width="200" height="160" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="640" y="55" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">Block #3</text>
  <line x1="560" y1="65" x2="720" y2="65" stroke="#e2e8f0" stroke-width="1"/>
  <text x="560" y="85" font-size="11" fill="#3b82f6" font-weight="600">Prev hash: 7b2c...</text>
  <text x="560" y="102" font-size="11" fill="#64748b">Timestamp: Jan 2015</text>
  <line x1="560" y1="112" x2="720" y2="112" stroke="#e2e8f0" stroke-width="1"/>
  <text x="560" y="130" font-size="11" fill="#334155">Hank → Alice: 4 ETH</text>
  <text x="560" y="147" font-size="11" fill="#334155">Bob → Dana: 1 ETH</text>
  <text x="560" y="164" font-size="11" fill="#334155">Carol → Eve: 2 ETH</text>
  <text x="640" y="183" text-anchor="middle" font-size="10" fill="#94a3b8">Hash: d91e...</text>

  <defs>
    <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6"/></marker>
  </defs>
</svg>
</div>

Notice the blue text: each block's "Previous hash" matches the hash of the block before it. This is what creates the chain. If you change even one character in Block #1, its hash changes completely, and Block #2's "Previous hash" would no longer match. The chain breaks.

## Hashes: digital fingerprints

A hash is a fingerprint for data. You feed any amount of data into a hash function, and it spits out a fixed-length string of characters. The same input always gives the same output. But change even one letter, and the output is completely different.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:650px">
  <!-- Input 1 -->
  <rect x="20" y="20" width="200" height="40" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="120" y="45" text-anchor="middle" font-size="13" fill="#1e40af">"Hello World"</text>
  <!-- Arrow -->
  <line x1="220" y1="40" x2="340" y2="40" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray)"/>
  <text x="280" y="32" text-anchor="middle" font-size="10" fill="#94a3b8">SHA-256</text>
  <!-- Output 1 -->
  <rect x="340" y="20" width="420" height="40" rx="6" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="550" y="45" text-anchor="middle" font-size="11" font-family="monospace" fill="#166534">a591a6d40bf420404a011733cfb7b190...</text>

  <!-- Input 2 -->
  <rect x="20" y="90" width="200" height="40" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="120" y="115" text-anchor="middle" font-size="13" fill="#1e40af">"Hello World!"</text>
  <!-- Arrow -->
  <line x1="220" y1="110" x2="340" y2="110" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray)"/>
  <text x="280" y="102" text-anchor="middle" font-size="10" fill="#94a3b8">SHA-256</text>
  <!-- Output 2 -->
  <rect x="340" y="90" width="420" height="40" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="550" y="115" text-anchor="middle" font-size="11" font-family="monospace" fill="#991b1b">7f83b1657ff1fc53b92dc18148a1d65d...</text>

  <!-- Note -->
  <text x="400" y="160" font-size="12" fill="#64748b">Adding one character ("!") completely changes the output.</text>
  <text x="400" y="177" font-size="12" fill="#64748b">This is called the "avalanche effect."</text>

  <defs>
    <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker>
  </defs>
</svg>
</div>

This is what makes blockchains tamper-proof. Each block contains the hash of the previous block. Change one old transaction, and its block's hash changes. That breaks every block after it. To fake a transaction, you would need to redo the hash for every block that comes after — and do it faster than the entire network adds new ones.

## Nodes: thousands of copies

A blockchain does not live on one computer. It lives on thousands of computers called **nodes**. Each node keeps a complete copy of the entire blockchain.

<div class="diagram">
<svg viewBox="0 0 800 260" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:600px">
  <!-- Center: Blockchain -->
  <rect x="300" y="90" width="200" height="70" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="400" y="120" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">New Transaction</text>
  <text x="400" y="140" text-anchor="middle" font-size="11" fill="#3b82f6">Alice → Bob: 2 ETH</text>

  <!-- Node 1 - top left -->
  <circle cx="120" cy="60" r="30" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="120" y="55" text-anchor="middle" font-size="20">💻</text>
  <text x="120" y="73" text-anchor="middle" font-size="8" fill="#166534">Node 1</text>
  <line x1="150" y1="70" x2="300" y2="110" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="85" y="105" text-anchor="middle" font-size="10" fill="#22c55e">✓ Valid</text>

  <!-- Node 2 - top right -->
  <circle cx="680" cy="60" r="30" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="680" y="55" text-anchor="middle" font-size="20">💻</text>
  <text x="680" y="73" text-anchor="middle" font-size="8" fill="#166534">Node 2</text>
  <line x1="650" y1="70" x2="500" y2="110" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="715" y="105" text-anchor="middle" font-size="10" fill="#22c55e">✓ Valid</text>

  <!-- Node 3 - bottom left -->
  <circle cx="120" cy="210" r="30" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="120" y="205" text-anchor="middle" font-size="20">💻</text>
  <text x="120" y="223" text-anchor="middle" font-size="8" fill="#166534">Node 3</text>
  <line x1="150" y1="200" x2="300" y2="150" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="85" y="175" text-anchor="middle" font-size="10" fill="#22c55e">✓ Valid</text>

  <!-- Node 4 - bottom right -->
  <circle cx="680" cy="210" r="30" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="680" y="205" text-anchor="middle" font-size="20">💻</text>
  <text x="680" y="223" text-anchor="middle" font-size="8" fill="#166534">Node 4</text>
  <line x1="650" y1="200" x2="500" y2="150" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="715" y="175" text-anchor="middle" font-size="10" fill="#22c55e">✓ Valid</text>

  <!-- Node 5 - center bottom (attacker) -->
  <circle cx="400" cy="240" r="30" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="400" y="235" text-anchor="middle" font-size="20">🏴‍☠️</text>
  <text x="400" y="253" text-anchor="middle" font-size="8" fill="#991b1b">Attacker</text>
  <line x1="400" y1="210" x2="400" y2="160" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="445" y="195" font-size="10" fill="#ef4444">✗ Rejected</text>
</svg>
</div>

When someone broadcasts a transaction, every node checks it independently. Does Alice actually have 2 ETH? Is the signature valid? If most nodes agree the transaction is good, it gets included in the next block.

If an attacker tries to submit a fake transaction, the other nodes reject it. To successfully cheat, an attacker would need to control the majority of the network's computing power (in Proof of Work) or staked tokens (in Proof of Stake) — which for large blockchains costs billions of dollars.

## Consensus: how nodes agree

With thousands of independent computers, how do they agree on which transactions are valid and in what order? This is called **consensus**, and it is the hardest problem in blockchain design.

There are two main approaches:

<div class="diagram">
<svg viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- PoW side -->
  <rect x="20" y="20" width="360" height="260" rx="12" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="200" y="50" text-anchor="middle" font-size="16" font-weight="bold" fill="#854d0e">Proof of Work</text>
  <text x="200" y="70" text-anchor="middle" font-size="11" fill="#a16207">Used by: Bitcoin</text>
  
  <text x="40" y="100" font-size="12" fill="#334155">How it works:</text>
  <text x="40" y="120" font-size="11" fill="#64748b">1. Miners race to solve a math puzzle</text>
  <text x="40" y="138" font-size="11" fill="#64748b">2. First to solve it gets to add the block</text>
  <text x="40" y="156" font-size="11" fill="#64748b">3. Winner earns a reward (new coins)</text>
  
  <text x="40" y="186" font-size="12" fill="#334155">Security model:</text>
  <text x="40" y="206" font-size="11" fill="#64748b">Cheating requires more computing</text>
  <text x="40" y="222" font-size="11" fill="#64748b">power than the entire network.</text>

  <text x="40" y="252" font-size="12" fill="#991b1b">⚡ Downside: Uses a lot of energy</text>

  <!-- PoS side -->
  <rect x="420" y="20" width="360" height="260" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="600" y="50" text-anchor="middle" font-size="16" font-weight="bold" fill="#166534">Proof of Stake</text>
  <text x="600" y="70" text-anchor="middle" font-size="11" fill="#15803d">Used by: Ethereum</text>
  
  <text x="440" y="100" font-size="12" fill="#334155">How it works:</text>
  <text x="440" y="120" font-size="11" fill="#64748b">1. Validators lock up tokens as collateral</text>
  <text x="440" y="138" font-size="11" fill="#64748b">2. Network picks a validator randomly</text>
  <text x="440" y="156" font-size="11" fill="#64748b">3. Validator proposes the next block</text>
  
  <text x="440" y="186" font-size="12" fill="#334155">Security model:</text>
  <text x="440" y="206" font-size="11" fill="#64748b">Cheating means losing your staked</text>
  <text x="440" y="222" font-size="11" fill="#64748b">tokens (called "slashing").</text>

  <text x="440" y="252" font-size="12" fill="#166534">✓ Uses 99.95% less energy</text>
</svg>
</div>

**Proof of Work** is like a lottery where buying a ticket requires solving a hard math problem. The more computing power you have, the more tickets you buy. Bitcoin uses this method.

**Proof of Stake** is like a security deposit. Validators put up their own money (ETH) as collateral. If they act honestly, they earn a small reward. If they try to cheat, their deposit gets taken away. Ethereum switched to Proof of Stake in September 2022 and now uses 99.95% less energy than before.

## How a transaction actually works

When you send ETH to someone, here is what happens step by step:

<div class="diagram">
<svg viewBox="0 0 800 340" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Step 1 -->
  <rect x="20" y="20" width="160" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="100" y="48" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">1. You sign</text>
  <text x="100" y="66" text-anchor="middle" font-size="10" fill="#64748b">Your wallet signs the</text>
  <text x="100" y="80" text-anchor="middle" font-size="10" fill="#64748b">transaction with your key</text>
  
  <line x1="180" y1="60" x2="220" y2="60" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray2)"/>

  <!-- Step 2 -->
  <rect x="220" y="20" width="160" height="80" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="300" y="48" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">2. Broadcast</text>
  <text x="300" y="66" text-anchor="middle" font-size="10" fill="#64748b">Transaction sent to</text>
  <text x="300" y="80" text-anchor="middle" font-size="10" fill="#64748b">the network (mempool)</text>

  <line x1="380" y1="60" x2="420" y2="60" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray2)"/>

  <!-- Step 3 -->
  <rect x="420" y="20" width="160" height="80" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="500" y="48" text-anchor="middle" font-size="12" font-weight="600" fill="#9d174d">3. Validate</text>
  <text x="500" y="66" text-anchor="middle" font-size="10" fill="#64748b">Nodes check: do you</text>
  <text x="500" y="80" text-anchor="middle" font-size="10" fill="#64748b">have enough ETH?</text>

  <line x1="580" y1="60" x2="620" y2="60" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGray2)"/>

  <!-- Step 4 -->
  <rect x="620" y="20" width="160" height="80" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="700" y="48" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">4. Confirmed</text>
  <text x="700" y="66" text-anchor="middle" font-size="10" fill="#64748b">Added to a block.</text>
  <text x="700" y="80" text-anchor="middle" font-size="10" fill="#64748b">Done. Irreversible.</text>

  <!-- Time labels -->
  <text x="100" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">~1 second</text>
  <text x="300" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">~1 second</text>
  <text x="500" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">~12 seconds</text>
  <text x="700" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">~12 seconds</text>

  <defs>
    <marker id="arrowGray2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker>
  </defs>
</svg>
</div>

On Ethereum, new blocks are added every 12 seconds. Once your transaction is in a block, it is permanent. After a few more blocks are added on top, it becomes practically impossible to reverse.

## Why this matters

Blockchains are slow (12 seconds per block) and expensive (you pay gas fees for every transaction) compared to a regular database. So why use one?

Because they solve a problem regular databases cannot: **trust without a middleman**. A bank can freeze your account. A company can edit its database. A blockchain cannot be changed by anyone once a transaction is confirmed.

| Feature | Regular database | Blockchain |
| --- | --- | --- |
| Speed | Milliseconds | 12+ seconds |
| Cost | Free (for the company) | Gas fees per transaction |
| Who controls it | The company that owns it | No single entity |
| Can be edited | Yes, by the database admin | No, once confirmed |
| Needs trust | Yes, trust the company | No, trust the math |
| Best for | Speed-sensitive apps | Money, ownership, voting |

The right question is not "blockchain or database?" It is "which parts of my app need trust guarantees, and which parts need speed?" Most Web3 apps use both.

## Key takeaways

- A **block** is a bundle of transactions. A **chain** is blocks linked by hashes.
- A **hash** is a digital fingerprint. Change one bit of input, and the entire hash changes.
- **Nodes** are computers that each hold a copy of the blockchain and verify transactions independently.
- **Consensus** is how nodes agree. Proof of Work uses computing power. Proof of Stake uses staked tokens.
- Blockchains are slow and expensive, but they remove the need to trust a middleman.
