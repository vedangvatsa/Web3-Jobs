---
title: "Making Your First Transaction"
description: "Step-by-step guide to set up MetaMask, get test ETH, and send your first on-chain transaction."
order: 6
readTime: "8 min"
difficulty: "beginner"
prerequisites: ["wallets"]
quiz:
  - question: "What is a testnet?"
    options:
      - "A fake blockchain used for practice, with no real money"
      - "A premium version of Ethereum"
      - "A tool for testing internet speed"
      - "A wallet application"
    correct: 0
    explanation: "A testnet is a copy of Ethereum where the ETH has no real value. Developers and learners use it to practice transactions and test smart contracts without risking real money."
  - question: "What is a faucet in crypto?"
    options:
      - "A tool to mine cryptocurrency"
      - "A website that gives you free testnet tokens for practice"
      - "A type of hardware wallet"
      - "A DeFi lending protocol"
    correct: 1
    explanation: "A faucet is a website that distributes free testnet tokens. Since testnet ETH has no value, faucets give it away so developers and learners can experiment."
  - question: "What do you need to pay a gas fee?"
    options:
      - "A credit card"
      - "A monthly subscription"
      - "ETH in your wallet"
      - "A special gas token"
    correct: 2
    explanation: "Gas fees on Ethereum are always paid in ETH. You need ETH in your wallet to send any transaction, even if you are sending a different token."
  - question: "What should you always do before sending a large transaction?"
    options:
      - "Post about it on social media"
      - "Send a small test transaction first"
      - "Wait for the weekend when fees are lower"
      - "Turn off your VPN"
    correct: 1
    explanation: "Always send a small test transaction first to confirm the address is correct. Blockchain transactions are irreversible — if you send to the wrong address, your money is gone."
  - question: "Where can you view the details of any Ethereum transaction?"
    options:
      - "In your email inbox"
      - "On a block explorer like Etherscan"
      - "In the Ethereum Foundation's database"
      - "Only in your wallet app"
    correct: 1
    explanation: "Block explorers like Etherscan let anyone view any transaction on the blockchain. Since the blockchain is public, all transactions are visible to everyone."
---

## What you will do in this lesson

By the end of this lesson, you will have:

1. Installed MetaMask (a browser wallet)
2. Switched to a test network (no real money needed)
3. Got free test ETH from a faucet
4. Sent your first transaction
5. Viewed it on a block explorer

This entire process is free and takes about 10 minutes.

## Step 1: Install MetaMask

MetaMask is the most popular Ethereum wallet. It runs as a browser extension.

1. Go to **metamask.io** (make sure it is the real site — check the URL)
2. Click "Download" and install the browser extension
3. Click "Create a new wallet"
4. Set a password (this locks MetaMask on your device)
5. **Write down your seed phrase on paper** — MetaMask will show you 12 words
6. Confirm the seed phrase by selecting the words in order

You now have a wallet. Your public address will look something like `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`.

## Step 2: Switch to a test network

By default, MetaMask connects to Ethereum mainnet (where real money lives). For practice, switch to a testnet.

<div class="diagram">
<svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:650px">
  <rect x="20" y="20" width="340" height="120" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="190" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Mainnet</text>
  <text x="190" y="72" text-anchor="middle" font-size="11" fill="#64748b">Real ETH, real money</text>
  <text x="190" y="90" text-anchor="middle" font-size="11" fill="#64748b">Real gas fees ($1-50)</text>
  <text x="190" y="115" text-anchor="middle" font-size="12" fill="#ef4444">⚠ Mistakes cost real money</text>

  <text x="400" y="80" text-anchor="middle" font-size="20" fill="#94a3b8">vs</text>

  <rect x="440" y="20" width="340" height="120" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="610" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Testnet (Sepolia)</text>
  <text x="610" y="72" text-anchor="middle" font-size="11" fill="#64748b">Free test ETH, no value</text>
  <text x="610" y="90" text-anchor="middle" font-size="11" fill="#64748b">Free gas fees</text>
  <text x="610" y="115" text-anchor="middle" font-size="12" fill="#22c55e">✓ Safe to experiment</text>
</svg>
</div>

To switch to Sepolia testnet in MetaMask:

1. Click the network dropdown at the top of MetaMask (it says "Ethereum Mainnet")
2. Toggle "Show test networks" on
3. Select "Sepolia"

## Step 3: Get free test ETH

A **faucet** is a website that gives away free testnet ETH. Since test ETH has no value, it exists purely for practice.

1. Go to a Sepolia faucet (search "Sepolia faucet" — several are available)
2. Paste your wallet address
3. Click "Send me ETH"
4. Wait about 30 seconds

You should see test ETH appear in your MetaMask balance. If one faucet is empty, try another — they refill periodically.

## Step 4: Send your first transaction

Now send some test ETH to another address:

1. In MetaMask, click "Send"
2. Paste a destination address (you can use another wallet you control, or any valid Ethereum address)
3. Enter an amount (try 0.01 ETH)
4. Review the gas fee (on testnet, this is free)
5. Click "Confirm"

Your transaction is now being processed. MetaMask will show "Pending" for about 12 seconds, then "Confirmed."

## Step 5: View it on Etherscan

Every transaction on Ethereum is public. You can view any transaction on a **block explorer** — a website that reads the blockchain.

1. After your transaction confirms, click on it in MetaMask
2. Click "View on block explorer" (or go to sepolia.etherscan.io)
3. You will see:

| Field | What it means |
| --- | --- |
| Transaction Hash | A unique ID for this transaction |
| From | Your wallet address |
| To | The address you sent to |
| Value | How much ETH you sent |
| Gas Fee | How much the transaction cost |
| Block | Which block included your transaction |
| Status | Success or Failed |

This is the power of a public blockchain: anyone can verify any transaction. There is no hidden ledger.

## What just happened, technically

When you clicked "Confirm" in MetaMask, this happened behind the scenes:

1. MetaMask used your **private key** to sign the transaction (proving it came from you)
2. The signed transaction was **broadcast** to the Ethereum network
3. A **validator** included it in the next block (~12 seconds)
4. Every **node** on the network verified it was valid
5. Your balance decreased, the recipient's balance increased
6. The transaction was recorded permanently on the blockchain

No bank processed this. No company approved it. Math and code did the work.

## Key takeaways

- Use a **testnet** to practice without risking real money
- A **faucet** gives you free testnet tokens for experimenting
- Every transaction requires **gas** (paid in ETH) to process
- **Block explorers** (Etherscan) let anyone view any transaction on the blockchain
- Always send a **small test transaction** before sending large amounts
