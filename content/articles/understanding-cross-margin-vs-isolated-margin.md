---
title: "Understanding Cross-Margin vs Isolated Margin"
image: "https://picsum.photos/seed/cross-isolated/1200/630"
description: "A clear comparison of cross-margin and isolated margin in crypto trading and lending, and when to use each."
category: "DeFi"
data-ai-hint: "two paths"
---

## Understanding Cross-Margin vs. Isolated Margin

In the world of crypto trading and DeFi lending, **cross-margin** and **isolated margin** are two different methods for managing the collateral (margin) in your account. Understanding the difference is crucial for effective risk management.

The core difference lies in what collateral is used to support a specific position or loan.

### Isolated Margin

With isolated margin, you allocate a specific amount of collateral to a single, individual position or trading pair.

-   **How it Works**: The margin you assign to one position is completely separate from all other positions and from the rest of the funds in your account. If that position gets liquidated, you only lose the specific margin allocated to it. The rest of your funds are safe.
-   **Example**: You have $5,000 in your account. You decide to open a leveraged long position on ETH/USD and allocate $1,000 as isolated margin for that trade. If the price of ETH drops and your position is liquidated, you will lose, at most, that $1,000. Your remaining $4,000 is completely untouched.

**When to Use Isolated Margin:**
-   **High-Risk / Speculative Trades**: It is ideal for speculative trades where you want to cap your potential losses.
-   **Risk Containment**: When you want to prevent a single bad trade from affecting your entire portfolio.

**Pros:**
-   Precise risk control on a per-position basis.
-   Limits your maximum loss to the allocated margin.

**Cons:**
-   If the position moves against you, you need to manually add more margin to avoid liquidation.
-   Less capital-efficient, as a large free balance in your account doesn't help your open positions.

### Cross-Margin

With cross-margin, all the available funds in your account are automatically used as collateral for all of your open positions.

-   **How it Works**: Your entire account balance acts as one big pool of margin. The profit from one position can be used to offset the loss from another, preventing liquidation. However, if your overall portfolio value drops, your entire account balance is at risk.
-   **Example**: You have $5,000 in your account and open a leveraged long on ETH. If the price of ETH drops, the system will use the entire $5,000 balance to keep the position from being liquidated. While this gives you more breathing room, if the price continues to fall and a liquidation is triggered, you could lose your entire $5,000 account balance.

**When to Use Cross-Margin:**
-   **Portfolio Hedging**: When you have multiple positions that are expected to offset each other.
-   **Lower-Risk Strategies**: For users who are confident in their overall portfolio management and want to maximize capital efficiency.

**Pros:**
-   Maximizes capital efficiency by using your entire balance.
-   Unrealized profits from one position can help prevent another from being liquidated.
-   Lower risk of liquidation for any single position as long as the overall account is healthy.

**Cons:**
-   **Total Account Risk**: A single bad position can potentially drain your entire account balance.
-   Less precise risk control compared to isolated margin.

### Conclusion

The choice between isolated and cross-margin depends on your trading strategy and risk tolerance.

-   Use **Isolated Margin** for risky, individual bets where you want to strictly limit your downside.
-   Use **Cross-Margin** when you are managing a diversified portfolio and want to use your entire capital base efficiently, understanding that it exposes your whole account to risk.