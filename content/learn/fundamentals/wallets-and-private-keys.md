---
title: "Wallets and Private Keys"
description: "How wallets work, what private keys are, and how to keep your crypto safe."
order: 5
readTime: "10 min"
difficulty: "beginner"
prerequisites: ["ethereum-the-world-computer"]
quiz:
  - question: "What is a private key?"
    options:
      - "Your username on a blockchain"
      - "A secret number that lets you spend your crypto"
      - "A password you set when creating a wallet"
      - "The address where you receive crypto"
    correct: 1
    explanation: "A private key is a secret number that proves you own your crypto. Anyone who has your private key can spend your money. You must never share it."
  - question: "What is a seed phrase?"
    options:
      - "A password to log into a website"
      - "A list of 12 or 24 words that can regenerate all your private keys"
      - "A code sent to your email for verification"
      - "The name of your wallet"
    correct: 1
    explanation: "A seed phrase (also called recovery phrase) is 12 or 24 random words. From these words, your wallet can regenerate all your private keys and addresses. If you lose your seed phrase and your device, your crypto is gone forever."
  - question: "What happens if you lose your seed phrase and your device breaks?"
    options:
      - "You can reset it through customer support"
      - "The blockchain will recover your funds"
      - "Your crypto is permanently lost"
      - "Your bank will reimburse you"
    correct: 2
    explanation: "There is no customer support for blockchains. If you lose both your seed phrase and your device, there is no way to recover your crypto. This is why backing up your seed phrase is critical."
  - question: "Which is safer for storing large amounts of crypto?"
    options:
      - "A browser extension wallet"
      - "A mobile wallet app"
      - "A hardware wallet"
      - "A screenshot of your seed phrase"
    correct: 2
    explanation: "Hardware wallets (like Ledger or Trezor) store your private keys on a physical device that never connects to the internet. This makes them nearly impossible to hack remotely."
  - question: "Your wallet address is like a..."
    options:
      - "Password that must stay secret"
      - "Bank account number that you can share publicly"
      - "Social security number"
      - "Credit card number"
    correct: 1
    explanation: "Your wallet address is public, like a bank account number. Anyone can send crypto to it. Your private key is what you keep secret — it is what lets you spend the crypto in that address."
---

## Your wallet is your bank account and your ID

In Web2, you log into websites with an email and password. In Web3, you connect with a wallet. Your wallet does three things:

1. **Holds your money** — your ETH, tokens, and NFTs
2. **Proves your identity** — your wallet address is your on-chain identity
3. **Signs transactions** — confirms that you approve a transfer or contract interaction

There is no company behind your wallet. No bank holds your funds. You hold them directly.

## Public keys and private keys

Every wallet is built on a pair of keys.

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:650px">
  <!-- Private key -->
  <rect x="20" y="30" width="340" height="160" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="190" y="60" text-anchor="middle" font-size="15" font-weight="bold" fill="#991b1b">🔐 Private Key</text>
  <text x="190" y="85" text-anchor="middle" font-size="11" fill="#64748b">A secret 256-bit number</text>
  <text x="190" y="105" text-anchor="middle" font-size="10" font-family="monospace" fill="#991b1b">e9873d79c6d87dc0fb6a57...</text>
  <line x1="40" y1="120" x2="340" y2="120" stroke="#fecaca" stroke-width="1"/>
  <text x="190" y="140" text-anchor="middle" font-size="11" fill="#ef4444">⚠ NEVER share this</text>
  <text x="190" y="158" text-anchor="middle" font-size="11" fill="#64748b">Anyone with this key</text>
  <text x="190" y="173" text-anchor="middle" font-size="11" fill="#64748b">can spend your crypto</text>

  <!-- Arrow -->
  <line x1="360" y1="110" x2="420" y2="110" stroke="#94a3b8" stroke-width="2" marker-end="url(#ak)"/>
  <text x="390" y="100" text-anchor="middle" font-size="9" fill="#94a3b8">derives</text>

  <!-- Public key / address -->
  <rect x="420" y="30" width="340" height="160" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="590" y="60" text-anchor="middle" font-size="15" font-weight="bold" fill="#166534">📬 Public Address</text>
  <text x="590" y="85" text-anchor="middle" font-size="11" fill="#64748b">Derived from the private key</text>
  <text x="590" y="105" text-anchor="middle" font-size="10" font-family="monospace" fill="#166534">0x71C7656EC7ab88b098...</text>
  <line x1="440" y1="120" x2="740" y2="120" stroke="#bbf7d0" stroke-width="1"/>
  <text x="590" y="140" text-anchor="middle" font-size="11" fill="#22c55e">✓ Safe to share publicly</text>
  <text x="590" y="158" text-anchor="middle" font-size="11" fill="#64748b">Like a bank account number.</text>
  <text x="590" y="173" text-anchor="middle" font-size="11" fill="#64748b">People send crypto to this.</text>

  <defs><marker id="ak" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker></defs>
</svg>
</div>

**Private key** → a secret number (like a password you can never change). If someone gets it, they control your money.

**Public address** → derived from the private key using math. You share this with anyone who wants to send you crypto. It starts with `0x` on Ethereum.

The key point: you can go from private key → public address, but you cannot go backwards. Nobody can figure out your private key from your public address.

## The seed phrase

Managing a raw 256-bit private key is impractical. That is why wallets use a **seed phrase** (also called a recovery phrase): 12 or 24 English words that encode your private key.

Example seed phrase (do NOT use this — it is just for illustration):

```
apple banana cherry dragon eagle frost grape hollow ivory jewel kite lemon
```

From these 12 words, your wallet can generate your private key, your public address, and even multiple accounts. If your phone breaks, you install a new wallet app, enter the 12 words, and everything is restored.

**The rule**: Write your seed phrase on paper. Store it somewhere safe. Never type it into a website. Never screenshot it. Never email it. If someone asks for your seed phrase, it is a scam. No exception.

## Types of wallets

<div class="diagram">
<svg viewBox="0 0 800 260" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Hot wallets -->
  <rect x="20" y="20" width="360" height="220" rx="12" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="200" y="48" text-anchor="middle" font-size="15" font-weight="bold" fill="#854d0e">Hot Wallets (online)</text>
  
  <rect x="40" y="65" width="155" height="70" rx="8" fill="#fef9c3" stroke="#facc15"/>
  <text x="117" y="88" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">Browser</text>
  <text x="117" y="105" text-anchor="middle" font-size="10" fill="#64748b">MetaMask, Rabby</text>
  <text x="117" y="120" text-anchor="middle" font-size="10" fill="#64748b">Best for daily use</text>

  <rect x="205" y="65" width="155" height="70" rx="8" fill="#fef9c3" stroke="#facc15"/>
  <text x="282" y="88" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">Mobile</text>
  <text x="282" y="105" text-anchor="middle" font-size="10" fill="#64748b">Phantom, Rainbow</text>
  <text x="282" y="120" text-anchor="middle" font-size="10" fill="#64748b">Best for on-the-go</text>

  <text x="200" y="165" text-anchor="middle" font-size="11" fill="#64748b">✓ Convenient, always accessible</text>
  <text x="200" y="182" text-anchor="middle" font-size="11" fill="#64748b">✓ Free to use</text>
  <text x="200" y="199" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Connected to internet = hackable</text>
  <text x="200" y="216" text-anchor="middle" font-size="11" fill="#64748b">Best for: small amounts, daily use</text>

  <!-- Cold wallets -->
  <rect x="420" y="20" width="360" height="220" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="600" y="48" text-anchor="middle" font-size="15" font-weight="bold" fill="#166534">Cold Wallets (offline)</text>
  
  <rect x="440" y="65" width="155" height="70" rx="8" fill="#dcfce7" stroke="#86efac"/>
  <text x="517" y="88" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Hardware</text>
  <text x="517" y="105" text-anchor="middle" font-size="10" fill="#64748b">Ledger, Trezor</text>
  <text x="517" y="120" text-anchor="middle" font-size="10" fill="#64748b">$60-150</text>

  <rect x="605" y="65" width="155" height="70" rx="8" fill="#dcfce7" stroke="#86efac"/>
  <text x="682" y="88" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Paper</text>
  <text x="682" y="105" text-anchor="middle" font-size="10" fill="#64748b">Printed keys</text>
  <text x="682" y="120" text-anchor="middle" font-size="10" fill="#64748b">Free but fragile</text>

  <text x="600" y="165" text-anchor="middle" font-size="11" fill="#64748b">✓ Keys never touch the internet</text>
  <text x="600" y="182" text-anchor="middle" font-size="11" fill="#64748b">✓ Extremely hard to hack remotely</text>
  <text x="600" y="199" text-anchor="middle" font-size="11" fill="#22c55e">✓ Best security available</text>
  <text x="600" y="216" text-anchor="middle" font-size="11" fill="#64748b">Best for: savings, large amounts</text>
</svg>
</div>

**Hot wallets** are connected to the internet. Easy to use but more vulnerable to hacks. Use them like a wallet in your pocket — carry spending money, not your life savings.

**Cold wallets** keep your keys offline. A hardware wallet like Ledger is a USB-sized device that stores your private key on a secure chip. When you want to sign a transaction, you physically press a button on the device. Even if your computer has malware, the hacker cannot access your keys.

## How to stay safe

| Do | Do not |
| --- | --- |
| Write seed phrase on paper | Screenshot your seed phrase |
| Store backup in a safe | Keep it in a notes app or cloud |
| Use hardware wallet for savings | Keep large amounts in a browser wallet |
| Double-check addresses before sending | Rush transactions |
| Start with small test transactions | Send large amounts to unverified addresses |
| Bookmark the real website URLs | Click links from DMs or emails |

**Common scams to watch for**:

"Connect your wallet to claim free tokens" — this is almost always a scam. The website drains your wallet when you approve the transaction.

"Send me your seed phrase to verify your wallet" — no legitimate service will ever ask for your seed phrase. Ever.

"This token will 100x" — unsolicited investment advice in DMs is a scam. Always.

## Key takeaways

- Your wallet has a private key (secret, controls your funds) and a public address (shareable, receives funds).
- A seed phrase is 12 or 24 words that can restore your entire wallet. Guard it like cash.
- Hot wallets (MetaMask, Phantom) are for daily use. Cold wallets (Ledger, Trezor) are for savings.
- If you lose your seed phrase and your device, your crypto is gone. There is no password reset.
