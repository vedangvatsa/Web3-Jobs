---
title: What is a Bonding Curve in Token Economics
image: /images/maximalfocus-naSAHDWRNbQ-unsplash.jpg
data-ai-hint: bonding curve token
description: >-
 A bonding curve is a mathematical curve that defines the relationship between
 a token's price and its supply, creating an automated and predictable market.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

A bonding curve defines the relationship between a token's price and its supply through a mathematical model. This concept has gained traction In **[tokenomics](/understanding-tokenomics)**. A bonding curve functions as a smart contract that operates as an autonomous market maker. It automatically adjusts the price of a token based on its circulating supply. When individuals purchase tokens, the contract mints new ones; conversely, when they sell tokens, it burns them, all while adjusting the price according to a predetermined curve.

This mechanism establishes a liquid and predictable market from the token's inception, eliminating reliance on traditional order book exchanges.

### Mechanics of a Bonding Curve

A bonding curve operates through a smart contract that holds a reserve of collateral tokens, such as [ETH](/what-is-ethereum) or stablecoins. The contract is designed to issue a new native token.

1. **The Curve**: The curve's mathematical formula defines the price of the native token based on its current supply. For example, a linear bonding curve could follow the formula `Price = 0.001 * CurrentSupply`.

2. **Buying (Minting)**: When a user wishes to acquire the native token, they send collateral (e.g., ETH) to the smart contract. The contract calculates the current price based on supply, mints the corresponding number of new tokens, and transfers them to the buyer. The buyer's collateral becomes part of the contract's reserve pool. As supply increases, the price for subsequent buyers rises.

3. **Selling (Burning)**: When a user intends to sell the native token, they return it to the smart contract. The contract computes the current price, withdraws the corresponding collateral from its reserve pool, and sends it to the seller while burning the native tokens received. As supply decreases, the price for the next seller declines.

The bonding curve itself acts as the market. It remains available for buying or selling, and its prices are predictable based on the established formula.

### The Impact of Curve Shape

The mathematical formula that defines the bonding curve significantly influences the token's economic properties.

- **Linear Curve**: `Price = m * Supply`. This model increases the price at a constant rate as the supply grows.

- **Exponential Curve**: `Price = m * Supply^n`. This formula results in a price that escalates at an accelerating pace, providing greater rewards to early buyers.

- **Sigmoid (S-shaped) Curve**: This model is often employed for more complex scenarios, such as a "Hype-then-Sustain" model. Initially, the price may increase slowly, accelerate during a growth phase, and then stabilize as the project matures.

### Applications of Bonding Curves

Bonding curves find numerous applications in various domains:

- **Automated Market Making**: Bonding curves serve as foundational elements for many **Automated Market Makers (AMMs)**.

- **Funding and Curation Markets**: Projects can use bonding curves for fundraising. Early supporters can purchase tokens at lower prices, with the funds supporting development. As project success attracts more buyers, the price rises, rewarding initial investors.

- **Community Tokens**: Launching social tokens for communities through bonding curves offers instant liquidity and a clear mechanism for price discovery.

### Advantages and Disadvantages

**Advantages**:
- **Instant Liquidity**: The bonding curve itself provides liquidity, eliminating the need to find a counterparty for trades.

- **Predictable Pricing**: Prices derive from a transparent mathematical formula, avoiding the unpredictability of order books.

- **Automated Operations**: The market operates through a smart contract, minimizing the need for intermediaries.

**Disadvantages**:
- **Capital Intensive Setup**: Establishing a bonding curve requires a reserve of collateral, which can demand substantial capital.

- **Slippage Risks**: Large trades may lead to significant slippage, as prices shift along the curve during execution.

- **Susceptibility to Speculation**: Bonding curves can experience speculative bubbles, where hype inflates prices rapidly, often resulting in sharp declines as early investors cash out.

Bonding curves present a compelling toolkit in the [Web3](/what-is-web3) economic framework. They introduce new methods for price discovery and liquidity, establishing markets that operate transparently and autonomously through code.
