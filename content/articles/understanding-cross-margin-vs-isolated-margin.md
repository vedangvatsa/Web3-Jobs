---
title: "Understanding Cross-Margin vs Isolated Margin"
image: "https://picsum.photos/seed/cross-isolated-margin/1200/630"
description: "A clear comparison of cross-margin and isolated margin in crypto trading and lending, and how they impact your risk management strategy."
category: "Educational"
data-ai-hint: "two paths"
---

### Introduction

In the worlds of both decentralized (DeFi) and centralized (CeFi) crypto trading and lending, the terms "Cross-Margin" and "Isolated Margin" define two different ways of managing your collateral and risk. Understanding the difference between them is crucial, as the choice you make can have a significant impact on the safety of your funds and your potential for liquidation. In simple terms, cross-margin pools all of your available capital together to support your positions, while isolated margin quarantines the risk to a single position.

### Cross-Margin

In a cross-margin system, all the assets in your margin account are treated as a single, collective pool of collateral to support all of your open positions.

**How It Works:**
Imagine you have a margin account with $1,000 USDC, 1 ETH, and 0.1 WBTC. You open two positions: a leveraged long on SOL and a leveraged short on AVAX.
Under a cross-margin system, the entire balance of your account ($1,000 USDC + 1 ETH + 0.1 WBTC) is used to calculate one unified health factor or margin ratio for *both* positions. A loss in your SOL position can be offset by a gain in your AVAX position or by the available balance of your other assets.

**Pros:**
-   **Lower Liquidation Risk**: Because your entire portfolio is backing your positions, you are less likely to be liquidated from a small, adverse price movement in a single position. The overall buffer is much larger.
-   **Convenience**: It is simpler to manage, as you only need to monitor one overall margin level for your entire account.

**Cons:**
-   **Total Portfolio Risk**: This is the major drawback. If a single position incurs a massive, catastrophic loss, it can drain your entire margin account and liquidate *all* of your positions and collateral. The risk is contagious. You can lose everything, even the assets you weren't actively trading.

### Isolated Margin

In an isolated margin system, you allocate a specific amount of collateral to a single, individual position. This collateral is completely separate from your other positions and the rest of the funds in your account.

**How It Works:**
Using the same example, you might decide to allocate 0.5 ETH as collateral for your SOL long position, and $500 USDC for your AVAX short position.
The SOL position's risk is calculated *only* against the 0.5 ETH. The AVAX position's risk is calculated *only* against the $500 USDC. The 0.5 ETH and $500 USDC remaining in your account are completely safe and are not affected by what happens to your open positions.

**Pros:**
-   **Risk Containment**: This is the primary benefit. A catastrophic loss in one position will only liquidate the margin allocated to that specific position. The rest of your portfolio is safe. It allows you to take on a high-risk, high-leverage trade without risking your entire account.
-   **Precise Risk Management**: It gives you granular control over how much capital you are willing to risk on any single trade.

**Cons:**
-   **Higher Liquidation Risk**: Because each position is only supported by its own isolated margin, even a small price movement can be enough to trigger liquidation if you are using high leverage. The safety buffer is much smaller.
-   **More Management Overhead**: You need to individually monitor the margin level for each open position.

### Analogy: Ships in a Fleet

-   **Cross-Margin** is like a fleet of ships all tied together. If one ship starts to sink, it can pull all the other ships down with it. However, the combined buoyancy of the whole fleet makes it harder for any single ship to be sunk by a small wave.
-   **Isolated Margin** is like a fleet of independent ships. If one ship sinks, the others are unaffected. However, each individual ship is more vulnerable to being sunk by a wave on its own.

### DeFi Lending Context

This concept applies directly to DeFi lending protocols as well:

-   **Aave** is an example of a **cross-margin** system. When you deposit multiple assets (ETH, WBTC, etc.), they all contribute to a single "Health Factor" that supports all of your borrowing positions.
-   **Silo Finance** is an example of an **isolated margin** system. Each lending market (e.g., ETH/USDC) is a separate "silo." Your ETH collateral in one silo can only be used to borrow USDC and is not affected by what happens in any other silo.

### FAQ

**Which one should I use?**
It depends on your strategy and risk tolerance.
-   Use **Cross-Margin** if you are managing a diversified portfolio of positions and want to minimize the risk of being liquidated by small, random price wicks. It's generally better for lower-leverage, portfolio-level strategies.
-   Use **Isolated Margin** for highly speculative, high-leverage trades. It allows you to make a risky bet with a defined maximum loss, protecting the rest of your capital.

**Can I switch between the two?**
On most centralized exchanges, yes. You can typically choose whether to open a new position using cross or isolated margin. You can also often add or remove margin from an existing isolated position.

**Does cross-margin mean my funds are automatically used?**
Yes. In a cross-margin system, if one of your positions starts to approach liquidation, the system will automatically use the available free margin in your account to prevent it. If that is not enough, it will start to liquidate your other positions to cover the loss.
