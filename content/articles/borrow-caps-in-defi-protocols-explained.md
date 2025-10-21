---
title: "Borrow Caps in DeFi Protocols Explained"
image: "https://picsum.photos/seed/borrow-caps/1200/630"
description: "Understand what borrow caps are in DeFi lending and how they are used as a crucial risk management tool."
category: "DeFi"
data-ai-hint: "limit gauge"
---

## Borrow Caps in DeFi Protocols Explained

In decentralized finance (DeFi) lending markets like Aave, **Borrow Caps** are a critical risk management parameter set by the protocol's governance. A borrow cap imposes a hard limit on the total amount of a specific asset that can be borrowed from a lending pool.

This mechanism acts as a safety measure to prevent certain risks associated with having too much of a single asset being borrowed.

### Why are Borrow Caps Necessary?

While overcollateralization is the primary defense for lenders, borrow caps provide an additional layer of security, particularly for assets that might introduce new risks to the protocol. Here are the main reasons why borrow caps are implemented:

#### 1. Mitigating Infinite Minting Bugs or Exploits

Imagine a newly listed, less-vetted token is added as a borrowable asset. If this token has a bug that allows an attacker to mint an infinite number of tokens, they could theoretically borrow every single asset from the lending protocol by supplying the buggy token as collateral.

A borrow cap on the buggy token would limit the damage. Even if the attacker mints infinite tokens, they can only borrow up to the cap (e.g., $1 million), preventing them from draining the entire protocol.

#### 2. Preventing Liquidity Crises in Volatile Assets

If a very large amount of a single volatile asset is borrowed, and the price of that asset suddenly spikes, it could cause cascading liquidations across the protocol. A large, coordinated market participant could even intentionally manipulate the price to trigger such an event.

By capping the total borrow amount of a volatile asset, the protocol limits its total exposure to that asset's price fluctuations, reducing the potential systemic impact of a major price swing.

#### 3. Limiting Exposure to Less Liquid Assets

For newly listed assets with lower liquidity, it might be difficult for liquidators to efficiently sell off large amounts of collateral during a market downturn. If the total borrowed amount is too high, liquidations could fail or cause significant price slippage, leading to bad debt for the protocol.

A borrow cap ensures that the total potential liquidations for that asset remain within a manageable size relative to its market liquidity.

### How are Borrow Caps Determined?

Borrow caps are not arbitrary. They are set through governance proposals based on a thorough risk assessment of the asset. The factors considered include:

-   **Asset Volatility**: More volatile assets get lower borrow caps.
-   **Market Liquidity**: Assets with lower on-chain liquidity have lower borrow caps.
-   **Contract Security**: The quality and audit history of the token's smart contract.
-   **Overall Market Cap**: Newer, smaller-cap assets receive more conservative caps.

When a borrow cap is reached for an asset, no new loans can be taken out for that asset until some existing borrowers repay their positions. This makes borrow caps a powerful tool for protocols to manage risk and ensure their long-term solvency.