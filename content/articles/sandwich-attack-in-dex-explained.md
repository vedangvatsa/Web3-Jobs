---
title: Sandwich Attack in DEX Explained
description: >-
  Learn how sandwich attacks work on decentralized exchanges (DEXs), how they
  exploit DeFi traders, and what strategies you can use to protect your trades.
category: Educational
image: 'https://picsum.photos/seed/sandwich/1200/630'
data-ai-hint: sandwich attack
publishedDate: '2026-03-11'
lastUpdated: "2026-08-24"
---

## Understanding Sandwich Attacks in Decentralized Finance (DeFi)

A **sandwich attack** represents a prevalent and predatory tactic employed in **[front-running](/what-is-frontrunning-in-defi-trading)** within Decentralized Finance (DeFi). This occurs when an attacker identifies a user's pending trade on a **[Decentralized Exchange](/what-is-a-decentralized-exchange-dex)** (DEX) and positions their own trades around it to secure a profit. In this scenario, the attacker's transactions act as the "bread," while the victim's trade serves as the "filling."

This exploitative approach capitalizes on the transparent nature of [blockchain](/what-is-a-blockchain) mempools and the operational mechanics of Automated Market Makers (AMMs). The attacker profits directly from the victim, who ends up receiving a less favorable price for their trade than anticipated.

This article details the mechanics of sandwich attacks, explores the reasons behind their occurrence, and outlines protective measures users can adopt.

### Key Insights

| Concept | Description |
|------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **Core Concept** | A sandwich attack involves three key steps: the attacker buys, the victim trades, then the attacker sells. |
| **Potential Victim** | Users executing large trades on a DEX with loose slippage settings are prime targets. |
| **Attacker Profile** | Bots designed to monitor the public mempool for profitable sandwiching opportunities. |
| **Outcome for Victims** | Victims receive fewer [tokens](/what-is-a-token) than expected, suffering from value extraction by the attacker. |
| **Effective Countermeasures**| Implementing tight slippage tolerances and using MEV (Maximal Extractable Value) protection services. |

### Dissecting a Sandwich Attack

To illustrate a sandwich attack, consider the following three-step process. Bob intends to swap a significant amount of [ETH](/what-is-ethereum) for a token named "CAT" on a DEX such as Uniswap.

#### Step 1: The Front-Run (Initial Trade)

1. **Transaction Submission**: Bob submits his trade to the Ethereum mempool, a public space where transactions await inclusion in a block by miners or validators.
2. **Bot Activity**: An attacker's bot continuously scans the mempool, identifying significant, lucrative trades. It notices Bob's buy order for CAT.
3. **Order Placement**: The bot anticipates that Bob's trade will improve the price of CAT. To capitalize, the bot promptly submits its own buy transaction for CAT, offering a higher gas fee to guarantee its execution before Bob's trade.

The block is now forming with the bot's transaction prioritized ahead of Bob's.

#### Step 2: Victim's Trade (The Filling)

1. **Execution of the Bot's Trade**: The block gets mined, allowing the bot's buy order to execute first, resulting in a slight price increase for CAT.
2. **Execution of Bob's Trade**: Bob's trade executes, but now at a higher average price than initially expected due to the price fluctuation caused by his large trade.

#### Step 3: The Back-Run (Final Trade)

1. **Bot's Sell Transaction**: The attacker's bot has already submitted a sell transaction for the CAT tokens acquired in Step 1. The bot adjusts its gas fee to ensure this transaction is included immediately after Bob's in the same block.
2. **Realization of Profit**: The bot sells its CAT tokens at the improve price resulting from Bob's significant purchase.

**Outcome:**
- Bob receives fewer CAT tokens for his trade because the bot's initial transaction increased the price, forcing him to purchase at a less favorable rate. The difference between the expected and actual amount received constitutes Bob's **slippage**.
- The attacker profits from capturing this slippage, effectively executing a perfect sandwich.

### Why Sandwich Attacks Occur

Sandwich attacks exploit specific characteristics of public blockchains:
- **Public Mempool**: Transactions await confirmation in a publicly accessible area, exposing user intentions.
- **AMM Price Mechanics**: Prices on AMMs change predictably based on transaction size, allowing bots to forecast the **[price impact](/what-is-price-impact-in-dex-trading)** accurately.
- **Gas Price Auctions**: The order of transactions within a block is influenced by gas fees. Bots can easily outbid user gas prices for priority execution.

### Strategies to Protect Against Sandwich Attacks

DeFi users can take proactive measures to mitigate the risk of sandwich attacks:

1. **Set Low Slippage Tolerance**: This is the most effective method of protection. Slippage represents the allowable price change for a trade to execute. Many DEX interfaces default to higher percentages, inviting sandwich bots. Adjust your slippage to a lower value. If a bot attempts a sandwich and shifts the price beyond your slippage, your transaction will fail, preserving your investment.

2. **Use MEV Protection Services**:
 - **Flashbots**: This service lets you send transactions to a private relay, directly to miners. If bots cannot see your transaction, they cannot front-run it. Popular wallets and DEX aggregators typically integrate Flashbots or similar MEV protection RPCs.
 - **DEX Aggregators**: Platforms like 1inch or CowSwap include mechanisms to shield against sandwich attacks by routing trades through private liquidity or employing batch auctions.

3. **Trade on Less Popular DEXs**: Bots often target high-volume DEXs like Uniswap. Trading on less frequented platforms may lower the risk of sandwich attacks but can involve different risks and potentially higher fees.

4. **Divide Large Trades**: Instead of executing a single large trade, consider splitting it into several smaller transactions. Smaller trades exert less price influence and are less attractive targets for sandwich bots.

### Frequently Asked Questions (FAQ)

**Q: Am I at risk if I make a small trade?** 
A: Typically, no. Sandwich bots seek trades large enough to move prices significantly, covering transaction costs and still yielding profit. Small retail trades generally do not present profitable opportunities.

**Q: Can I guarantee my trade won't be sandwiched?** 
A: Using an MEV protection service like Flashbots comes closest to guaranteeing this, as it completely conceals your transaction from the public mempool where bots operate.

**Q: Will I lose all my money in a sandwich attack?** 
A: No. You do not lose your principal investment. Instead, you lose value due to slippage. For example, you may expect a certain number of CAT tokens but receive fewer, with the value of the missing tokens representing the bot's profit.

**Q: Why don't DEXs implement protection by default?** 
A: Some protocols are beginning to integrate protective measures. For instance, CowSwap employs batch auctions to mitigate risks. However, standard AMMs like Uniswap face challenges in preventing MEV without significant changes to their architecture.

### DEXs with Sandwich Attack Prevention

Not all decentralized exchanges possess the same vulnerability to sandwich attacks. Some protocols have been specifically designed or modified to reduce MEV exposure for traders.

| DEX Name | Protection Mechanism |
|-----------------------|----------------------------------------------------------------------------------------------------------|
| **CoW Protocol (CoW Swap)** | The largest MEV-resistant DEX by volume, using batch auctions that settle trades at a uniform price, preventing individual order exploitation. |
| **1inch Fusion** | Employs a Dutch auction mechanism with a network of resolvers who fill orders off-chain, keeping trades off the public mempool. |
| **Flashbots Protect RPC** | A free RPC endpoint that can be added to any wallet, routing transactions privately to block builders and eliminating front-running exposure. |
| **Paraswap Delta** | Offers private transaction routing through its order-flow system, providing equivalent protection against mempool visibility. |
| **Uniswap v4 hooks** | Introduces a programmable layer to AMM logic, allowing the implementation of MEV protection mechanisms directly at the protocol level. |

For effective MEV protection, maintain slippage tolerance at a low percentage, use a private RPC endpoint, and choose DEX aggregators that route trades through protected channels when trading larger amounts. 

In the evolving DeFi ecosystem, understanding and mitigating sandwich attacks is essential. By adopting these strategies, traders can safeguard their transactions and enhance their trading outcomes.
