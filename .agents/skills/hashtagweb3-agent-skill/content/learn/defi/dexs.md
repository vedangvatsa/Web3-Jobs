---
title: How Decentralized Exchanges (DEXs) Work
description: Understand Automated Market Makers (AMMs) and Liquidity Pools.
order: 1
readTime: 8 min
difficulty: intermediate
prerequisites: []
quiz:
  - question: What replaces the traditional order book in a DEX?
    options:
      - A decentralized broker
      - An Automated Market Maker (AMM) using a mathematical formula
      - A network of miners
      - A central database
    correct: 1
    explanation: >-
      DEXs like Uniswap use AMMs. Instead of matching buyers with sellers, you
      trade against a pool of tokens whose prices are determined by a formula (x
      * y = k).
  - question: What is a Liquidity Provider (LP)?
    options:
      - Someone who writes smart contracts
      - A user who deposits pairs of tokens into a DEX to enable trading
      - A regulator
      - A node validator
    correct: 1
    explanation: >-
      LPs deposit their tokens into a pool so others can trade against them. In
      return, they earn a portion of the trading fees.
  - question: >-
      What happens to the price of a token in a pool if you buy a large amount
      of it?
    options:
      - It goes down
      - It stays the same
      - It goes up
      - The transaction fails
    correct: 2
    explanation: >-
      Because of the constant product formula (x * y = k), reducing the supply
      of one token in the pool automatically increases its price. This is called
      slippage.
  - question: What is impermanent loss?
    options:
      - Losing your private key
      - A temporary loss of funds due to a hack
      - >-
        A potential loss LPs face when token prices diverge compared to just
        holding them
      - A fee paid to miners
    correct: 2
    explanation: >-
      If you provide liquidity and the prices of the tokens change
      significantly, you might end up with less value than if you had simply
      held the tokens in your wallet. This is impermanent loss.
  - question: Which of these is NOT a popular DEX?
    options:
      - Uniswap
      - Curve
      - Coinbase
      - Balancer
    correct: 2
    explanation: >-
      Coinbase is a Centralized Exchange (CEX) run by a company. Uniswap, Curve,
      and Balancer are Decentralized Exchanges (DEXs) run by smart contracts.
---

## The Order Book vs. The AMM

Traditional exchanges (like the NYSE or Coinbase) use an **order book**. Buyers state what they are willing to pay, sellers state what they will accept. When prices match, a trade happens. This requires active market makers to ensure there is always someone to trade with.

Decentralized Exchanges (DEXs) like Uniswap use an **Automated Market Maker (AMM)**. There is no order book. You trade directly against a smart contract holding a pool of tokens.

<div class="diagram">
<svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Order Book -->
 <rect x="20" y="20" width="360" height="200" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="200" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Order Book (Centralized)</text>

 <rect x="150" y="70" width="100" height="25" fill="#fee2e2"/>
 <text x="200" y="87" text-anchor="middle" font-size="11" fill="#ef4444">Sell at $101</text>
 <rect x="150" y="100" width="100" height="25" fill="#fee2e2"/>
 <text x="200" y="117" text-anchor="middle" font-size="11" fill="#ef4444">Sell at $100</text>

 <line x1="60" y1="135" x2="340" y2="135" stroke="#fca5a5" stroke-dasharray="4"/>

 <rect x="150" y="145" width="100" height="25" fill="#dcfce7"/>
 <text x="200" y="162" text-anchor="middle" font-size="11" fill="#166534">Buy at $99</text>
 <rect x="150" y="175" width="100" height="25" fill="#dcfce7"/>
 <text x="200" y="192" text-anchor="middle" font-size="11" fill="#166534">Buy at $98</text>

 <!-- AMM -->
 <rect x="420" y="20" width="360" height="200" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="600" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">AMM (Decentralized)</text>

 <circle cx="600" cy="130" r="60" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>
 <text x="600" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">Liquidity Pool</text>
 <text x="600" y="135" text-anchor="middle" font-size="11" fill="#166534">100 ETH</text>
 <text x="600" y="155" text-anchor="middle" font-size="11" fill="#166534">200,000 USDC</text>

 <line x1="450" y1="130" x2="520" y2="130" stroke="#22c55e" stroke-width="2" marker-end="url(#arrow)"/>
 <text x="485" y="120" text-anchor="middle" font-size="10" fill="#166534">User gives ETH</text>

 <line x1="680" y1="130" x2="750" y2="130" stroke="#22c55e" stroke-width="2" marker-end="url(#arrow)"/>
 <text x="715" y="120" text-anchor="middle" font-size="10" fill="#166534">User gets USDC</text>

 <defs>
 <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#22c55e"/></marker>
 </defs>
</svg>
</div>

## Liquidity Pools

A DEX cannot work without tokens to trade against. This is where **Liquidity Providers (LPs)** come in.

Anyone can be an LP. You deposit an equal value of two tokens (e.g., $1000 of ETH and $1000 of USDC) into a smart contract pool. In exchange, every time someone trades using that pool, a small fee (e.g., 0.3%) is collected and given to the LPs.

## The Constant Product Formula (x * y = k)

How does the smart contract know what price to charge if there is no order book? Uniswap uses a simple, elegant formula: `x * y = k`.

- `x` = amount of token A in the pool
- `y` = amount of token B in the pool
- `k` = a constant number

The pool must always maintain the constant `k`.

### Example:
1. A pool has 10 ETH and 20,000 USDC. (`10 * 20,000 = 200,000`). The constant `k` is 200,000.
2. You want to buy 1 ETH from the pool.
3. The pool will now only have 9 ETH.
4. To keep `k` at 200,000, the USDC balance must become `200,000 / 9 = 22,222.22`.
5. The pool currently has 20,000 USDC. So you must pay the difference: 2,222.22 USDC.

This automatically prices the asset based on supply and demand. If a token becomes scarce in the pool, its price goes up exponentially.

## Slippage

Because the formula changes the price as the token ratios change, buying a large amount of a token from a small pool will move the price significantly. This difference between the expected price and the execution price is called **slippage**.

High liquidity (large pools) = low slippage. Low liquidity (small pools) = high slippage.

## Impermanent Loss

Being an LP carries a unique risk called **Impermanent Loss (IL)**. 

If you deposit ETH and USDC into a pool, and the price of ETH doubles, traders will buy ETH from the pool (using USDC) until the pool's ratio matches the market price. When you withdraw your liquidity, you will have less ETH and more USDC than you started with. 

Compared to just holding the ETH and USDC in your wallet, you effectively lost some potential profit. It is "impermanent" because if the price returns to what it was when you deposited, the loss disappears. If you withdraw, the loss becomes permanent.

## Key takeaways

- DEXs replace order books with Automated Market Makers (AMMs) and liquidity pools.
- Prices are set mathematically by the ratio of tokens in the pool (`x * y = k`).
- Liquidity Providers (LPs) supply the tokens and earn trading fees.
- Slippage occurs when large trades move the pool's ratio.
- Impermanent loss is a risk LPs face when token prices diverge.
