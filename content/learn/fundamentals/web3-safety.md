---
title: "Web3 Safety"
description: "How to protect yourself from scams, phishing, and rug pulls in Web3."
order: 15
readTime: "9 min"
difficulty: "beginner"
prerequisites: ["defi-banking-without-banks"]
quiz:
  - question: "What is the most common type of Web3 scam?"
    options:
      - "Hardware wallet theft"
      - "Phishing — fake websites or DMs that trick you into approving malicious transactions"
      - "Blockchain hacking"
      - "Mining scams"
    correct: 1
    explanation: "Phishing is by far the most common attack. Scammers create fake websites that look like real DeFi protocols or send DMs pretending to be 'support.' When you connect your wallet and sign a transaction, they drain your funds."
  - question: "What is a 'token approval' and why is it dangerous?"
    options:
      - "Approving a token listing on an exchange"
      - "Giving a smart contract permission to spend your tokens — a malicious contract can drain your wallet"
      - "Approving a governance proposal"
      - "Creating a new token"
    correct: 1
    explanation: "When you interact with a DeFi protocol, it asks you to 'approve' access to your tokens. A legitimate protocol only uses what it needs. A malicious contract can use that approval to drain your entire balance of that token."
  - question: "What should you do if someone DMs you offering 'free tokens'?"
    options:
      - "Click the link quickly before it expires"
      - "Ask for more details"
      - "Ignore and block — it is almost certainly a scam"
      - "Share it with friends"
    correct: 2
    explanation: "Unsolicited DMs about free tokens, airdrops, or investment opportunities are almost always scams. Legitimate projects do not DM individuals asking them to connect wallets."
  - question: "What is revoke.cash used for?"
    options:
      - "Earning interest on crypto"
      - "Reviewing and revoking token approvals you have given to smart contracts"
      - "Creating new wallets"
      - "Mining cryptocurrency"
    correct: 1
    explanation: "Revoke.cash lets you see all the smart contracts that have permission to spend your tokens. You can revoke approvals you no longer need, reducing your attack surface."
  - question: "Which is the safest practice?"
    options:
      - "Keeping all your crypto in one hot wallet"
      - "Using separate wallets for different purposes (daily use vs savings)"
      - "Sharing your seed phrase with a trusted friend for backup"
      - "Storing your seed phrase in a cloud document"
    correct: 1
    explanation: "Using separate wallets isolates risk. If your daily-use wallet gets compromised, your savings wallet stays safe. Never share your seed phrase with anyone, and never store it digitally."
---

## The number one rule

Most crypto losses are not from blockchain hacks. They are from social engineering — people being tricked into giving up their keys or approving malicious transactions.

The scammers are good at their job. They create perfect copies of real websites, impersonate project founders on Discord, and engineer urgency ("claim your airdrop in the next 10 minutes or it expires").

Your best defense: slow down and verify everything.

## Common attack types

<div class="diagram">
<svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Phishing -->
  <rect x="20" y="20" width="240" height="120" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="140" y="48" text-anchor="middle" font-size="13" font-weight="bold" fill="#991b1b">Phishing</text>
  <text x="140" y="68" text-anchor="middle" font-size="10" fill="#64748b">Fake websites and DMs</text>
  <text x="140" y="85" text-anchor="middle" font-size="10" fill="#64748b">that trick you into signing</text>
  <text x="140" y="100" text-anchor="middle" font-size="10" fill="#64748b">malicious transactions</text>
  <text x="140" y="125" text-anchor="middle" font-size="11" fill="#ef4444">Most common attack</text>

  <!-- Rug pull -->
  <rect x="280" y="20" width="240" height="120" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="400" y="48" text-anchor="middle" font-size="13" font-weight="bold" fill="#854d0e">Rug Pull</text>
  <text x="400" y="68" text-anchor="middle" font-size="10" fill="#64748b">Developer launches a project,</text>
  <text x="400" y="85" text-anchor="middle" font-size="10" fill="#64748b">attracts deposits, then</text>
  <text x="400" y="100" text-anchor="middle" font-size="10" fill="#64748b">drains all the funds</text>
  <text x="400" y="125" text-anchor="middle" font-size="11" fill="#854d0e">Check for audits + lock-ups</text>

  <!-- Malicious approval -->
  <rect x="540" y="20" width="240" height="120" rx="10" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="660" y="48" text-anchor="middle" font-size="13" font-weight="bold" fill="#9d174d">Bad Approvals</text>
  <text x="660" y="68" text-anchor="middle" font-size="10" fill="#64748b">Approving a contract to</text>
  <text x="660" y="85" text-anchor="middle" font-size="10" fill="#64748b">spend unlimited tokens,</text>
  <text x="660" y="100" text-anchor="middle" font-size="10" fill="#64748b">which it later drains</text>
  <text x="660" y="125" text-anchor="middle" font-size="11" fill="#9d174d">Use revoke.cash regularly</text>

  <!-- Bottom tips -->
  <rect x="20" y="160" width="760" height="100" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="400" y="188" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Defense checklist</text>
  <text x="400" y="210" text-anchor="middle" font-size="11" fill="#64748b">✓ Bookmark real sites · ✓ Never click DM links · ✓ Verify contract addresses</text>
  <text x="400" y="230" text-anchor="middle" font-size="11" fill="#64748b">✓ Use hardware wallet for savings · ✓ Separate wallets for daily/savings · ✓ Revoke old approvals</text>
  <text x="400" y="248" text-anchor="middle" font-size="11" fill="#64748b">✓ Start with small amounts · ✓ Read what you sign · ✓ If it sounds too good, it is</text>
</svg>
</div>

## The token approval problem

When you use a DeFi protocol, it asks permission to spend your tokens. This is called a **token approval**. Legitimate protocols need this to execute swaps, deposits, and withdrawals.

The danger: many approvals are set to "unlimited" by default. This means the contract can spend as many of your tokens as it wants, forever. If that contract gets hacked, or if it was malicious from the start, it can drain your entire balance.

**How to protect yourself**:

1. Set custom approval amounts instead of unlimited (most wallets allow this)
2. Regularly check and revoke old approvals at [revoke.cash](https://revoke.cash)
3. Never approve tokens on a site you do not fully trust

## The wallet separation strategy

Use at least two wallets:

| Wallet | Purpose | Type | What goes here |
| --- | --- | --- | --- |
| Daily wallet | Browsing DeFi, minting NFTs, trying new protocols | Hot (MetaMask) | Small amounts you can afford to lose |
| Savings wallet | Long-term holdings | Cold (Ledger/Trezor) | Main portfolio — never connects to risky sites |

If your daily wallet gets drained by a phishing attack, your savings wallet is untouched. This is the simplest, most effective security measure.

## Red flags checklist

If you see any of these, stop immediately:

- A website URL that is slightly different from the real one (uniiswap.com instead of uniswap.org)
- Anyone asking for your seed phrase, for any reason
- "Send 1 ETH, get 2 ETH back" — this is always a scam
- Urgency pressure ("Claim in the next 5 minutes")
- Unsolicited DMs about airdrops, investment opportunities, or "support"
- A token that appeared in your wallet that you did not buy (airdrop scam — interacting with it can drain your wallet)
- Anonymous team with no public track record
- No audit, no GitHub, no documentation

## Key takeaways

- Most losses come from social engineering, not blockchain hacking. Slow down and verify.
- Phishing (fake sites and DMs) is the most common attack. Bookmark real URLs.
- Token approvals are a hidden risk. Use limited approvals and check revoke.cash regularly.
- Use separate wallets: a hot wallet for daily use, a cold wallet for savings.
- If something seems too good to be true, it is a scam. Always.

## Congratulations

You have completed the Web3 Fundamentals course. You now understand blockchains, wallets, tokens, smart contracts, DeFi, and how to stay safe.

**Next paths to explore:**

- **DeFi Deep Dive** — go deeper into how DEXs, lending, and yield strategies work
- **Smart Contract Development** — learn to write and deploy your own contracts
- **Web3 Careers** — how to get hired at a Web3 company
