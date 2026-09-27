---
title: 'MEV: Maximal Extractable Value'
description: >-
  How validators and searchers extract profit from transaction ordering, and why
  it matters for every DeFi user.
order: 5
readTime: 8 min
difficulty: advanced
prerequisites:
  - exploits
quiz:
  - question: What is MEV?
    options:
      - A type of mining reward
      - >-
        Profit that validators or searchers extract by including, excluding, or
        reordering transactions within a block
      - A metric for measuring blockchain performance
      - A token used for Ethereum governance
    correct: 1
    explanation: >-
      MEV (Maximal Extractable Value) is the profit available from manipulating
      transaction order. If a large buy order is sitting in the mempool, a
      searcher can place their own buy before it (front-running) and a sell
      after it (back-running), extracting profit from the price movement.
  - question: What is a 'sandwich attack'?
    options:
      - An attack that targets three different protocols
      - >-
        A front-run + back-run combo: the attacker buys before your swap
        (raising the price), your swap executes at the worse price, then the
        attacker sells at the higher price
      - An attack on the consensus layer
      - A social engineering technique
    correct: 1
    explanation: >-
      Your pending Uniswap swap is visible in the mempool. A bot sees it,
      submits a buy order with higher gas to execute first (front-run), your
      swap executes at a worse price due to the price impact, then the bot sells
      at the inflated price (back-run). The bot profits from the price
      difference.
  - question: Why is MEV sometimes called an 'invisible tax' on DeFi users?
    options:
      - Because it appears as a gas fee
      - >-
        Because users unknowingly receive worse execution prices on their swaps
        due to front-running, and this cost is never displayed in the UI
      - Because MEV is taxed by governments
      - Because validators charge hidden fees
    correct: 1
    explanation: >-
      When you swap on Uniswap, the UI shows an expected price. But if a
      sandwich bot intervenes, you receive fewer tokens than expected. The
      difference - often $5-50 per trade - goes to the MEV extractor. Most users
      never realize this happened because the transaction still succeeds.
  - question: What is Flashbots and how does it address MEV?
    options:
      - A tool for writing flash loans
      - >-
        An organization that built a private transaction relay to protect users
        from front-running, and a transparent MEV marketplace for validators
      - A blockchain explorer
      - A DeFi aggregator
    correct: 1
    explanation: >-
      Flashbots created 'MEV-Boost' - a system where searchers submit
      transaction bundles to a private relay instead of the public mempool. This
      prevents sandwich attacks (your transaction isn't visible to attackers)
      and creates a competitive auction for MEV extraction.
  - question: >-
      What is a 'private mempool' or 'RPC endpoint' and why do advanced users
      use one?
    options:
      - A faster internet connection for trading
      - >-
        A transaction submission channel that hides your pending transaction
        from public view, preventing front-running bots from seeing it
      - A private blockchain
      - An encrypted wallet
    correct: 1
    explanation: >-
      A private submission service can reduce exposure to public-mempool
      observers. Its protections depend on routing, participating builders,
      service policy, and fallback behavior; they are not an absolute guarantee.
lastUpdated: 2026-09-04
---

## Transaction ordering and execution price

Pending transactions can reveal trades and other actions before they are included in a block. Searchers and block builders can use that information when choosing transaction order.

MEV - Maximal Extractable Value - is the profit that can be extracted by manipulating the order, inclusion, or exclusion of transactions within a block.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">Sandwich Attack</text>

 <!-- Step 1: Front-run -->
 <rect x="20" y="40" width="180" height="65" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="110" y="62" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">1. Bot Front-Runs</text>
 <text x="110" y="80" text-anchor="middle" font-size="10" fill="#ef4444">Buys token FIRST</text>
 <text x="110" y="95" text-anchor="middle" font-size="9" fill="#64748b">Price goes UP ↑</text>

 <line x1="205" y1="72" x2="235" y2="72" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="235,68 243,72 235,76" fill="#94a3b8"/>

 <!-- Step 2: Your TX -->
 <rect x="250" y="40" width="180" height="65" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="340" y="62" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">2. Your Swap</text>
 <text x="340" y="80" text-anchor="middle" font-size="10" fill="#eab308">Executes at worse price</text>
 <text x="340" y="95" text-anchor="middle" font-size="9" fill="#64748b">You get fewer tokens 😞</text>

 <line x1="435" y1="72" x2="465" y2="72" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="465,68 473,72 465,76" fill="#94a3b8"/>

 <!-- Step 3: Back-run -->
 <rect x="480" y="40" width="180" height="65" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="570" y="62" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">3. Bot Back-Runs</text>
 <text x="570" y="80" text-anchor="middle" font-size="10" fill="#ef4444">Sells at higher price</text>
 <text x="570" y="95" text-anchor="middle" font-size="9" fill="#64748b">Pockets difference 💰</text>

 <!-- Protection -->
 <rect x="200" y="125" width="400" height="55" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="400" y="148" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">🛡️ Protection: Use private RPC (Flashbots Protect)</text>
 <text x="400" y="168" text-anchor="middle" font-size="10" fill="#22c55e">Your TX is hidden from bots → no sandwich possible</text>
</svg>
</div>

## How Transactions Get Ordered

When you submit a transaction on Ethereum, it doesn't execute immediately. It enters the **mempool** - a public waiting area where pending transactions sit until a validator includes them in a block.

Validators have complete discretion over transaction ordering within their block. They can:
- Reorder transactions to maximize their own profit
- Include their own transactions at specific positions
- Exclude transactions entirely

This power is the root of MEV.

## The Three Types of MEV

### 1. Front-Running

A bot sees a profitable transaction in the mempool and submits the same transaction with a higher gas price to execute first.

**Example:** You spot a new token listing on Uniswap and submit a buy order. A bot sees your pending transaction, submits its own buy with higher gas, executes first at the lower price, and then sells to you at the higher price.

### 2. Sandwich Attacks

A sandwich places transactions before and after a target trade, attempting to profit from its price impact.

```
Mempool state:
 Your transaction: Swap 10 ETH → USDC on Uniswap (slippage tolerance: 1%)

Bot's attack:
 1. BUY: Bot buys USDC with 50 ETH (gas: 100 gwei) → executes FIRST
 Price of USDC increases due to the buy pressure
 2. YOUR TX: Your swap executes at the now-worse price
 You receive fewer USDC than expected (within your 1% slippage)
 3. SELL: Bot sells its USDC back for ETH (gas: 90 gwei)
 Bot profits from the price difference it created
```

The additional execution cost depends on liquidity, order size, slippage limits, and transaction ordering. It is not a fixed percentage of every swap.

### 3. Arbitrage

Arbitrage bots equalize prices across DEXs. If ETH is $2,000 on Uniswap and $2,010 on SushiSwap, a bot simultaneously buys on Uniswap and sells on SushiSwap, pocketing the $10 difference.

Unlike sandwiching, arbitrage is generally considered beneficial - it keeps prices consistent across markets.

## The Scale of MEV

MEV estimates depend on which networks, transactions, and strategies a dataset can identify. Check those definitions before comparing totals from different sources.

| MEV Type | Who Benefits | Who Pays |
|---|---|---|
| Arbitrage | Market efficiency | Nobody directly (neutral) |
| Liquidations | Protocol solvency | Undercollateralized borrowers |
| Sandwich attacks | MEV searchers | Every DeFi swap user |
| Front-running | MEV searchers | Original transaction submitter |

## How to Protect Yourself

### 1. Use a Private RPC

Instead of broadcasting your transaction to the public mempool, send it through a private relay.

- **Flashbots Protect:** Free. Add `https://rpc.flashbots.net` as a custom RPC in MetaMask.
- **MEV Blocker:** Free. Maintained by CoW Protocol. Refunds a portion of extracted MEV back to you.

### 2. Set Tight Slippage Tolerance

Lower slippage tolerance = less room for sandwich bots. But too tight and your transaction may fail.

- Stablecoin swaps: 0.1-0.3%
- Major tokens (ETH, BTC): 0.5-1%
- Small-cap tokens: 1-3% (higher volatility)

### 3. Use MEV-Aware DEX Aggregators

- **CoW Swap:** Uses batch auctions and solver competition to reduce exposure to certain forms of MEV.
- **1inch Fusion:** Routes through private order flow to minimize front-running exposure.

### 4. Break Up Large Trades

Splitting an order can change its price impact, but it also adds fees and exposes more transactions. Compare quoted execution costs rather than assume splitting is always better.

## MEV's Impact on Ethereum's Design

**MEV-Boost** lets participating validators obtain blocks from external builders through relays. The arrangement separates block construction from proposal while adding dependencies on builders and relays.

Ethereum's roadmap includes **Proposer-Builder Separation (PBS)** as a protocol-level solution, formally separating block building from block proposing to reduce centralization pressures from MEV.

## Key takeaways

- MEV is profit extracted from manipulating transaction ordering within blocks. It is an inherent property of public blockchains with transparent mempools.
- Sandwich attacks can worsen trade execution; exposure and losses vary by trade.
- Use private RPCs (Flashbots Protect) and MEV-aware DEXs (CoW Swap) to protect your transactions.
- Arbitrage MEV is beneficial (market efficiency). Sandwich MEV is extractive (user cost).
