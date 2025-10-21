---
title: "What is a Lending Pool Utilization Rate"
image: "https://picsum.photos/seed/utilization-rate/1200/630"
description: "Learn what the utilization rate is and why it's the most important metric driving interest rates in DeFi lending."
category: "DeFi"
data-ai-hint: "pie chart"
---

## What is a Lending Pool Utilization Rate?

In decentralized finance (DeFi) money markets like Aave and Compound, the **Utilization Rate** is the single most important metric that determines the interest rates for both lending and borrowing. It provides a real-time snapshot of a lending pool's supply and demand dynamics.

### Defining the Utilization Rate

The Utilization Rate is the percentage of a pool's total liquidity that is currently being borrowed by users.

The formula is straightforward:

**Utilization Rate = (Total Amount Borrowed) / (Total Amount Supplied)**

For example, if a USDC lending pool contains a total of $1,000,000 supplied by lenders, and borrowers have taken out loans totaling $600,000, the calculation is:

-   `$600,000 (Borrowed) / $1,000,000 (Supplied) = 0.60`

The utilization rate for the USDC pool is 60%.

### Why is the Utilization Rate So Important?

The utilization rate is the primary input for the protocol's **algorithmic interest rate model**. The model is designed to use this rate to automatically balance the pool and ensure its health.

1.  **Reflects Liquidity**: A high utilization rate means there is low liquidity remaining in the pool. This is a risk for lenders, as they may not be able to withdraw their funds immediately if there isn't enough cash on hand.
2.  **Determines APY**: The protocol's smart contracts use the utilization rate to adjust the Annual Percentage Yield (APY) for both lenders and borrowers.

### How Utilization Affects Interest Rates

The relationship between utilization and interest rates is direct and intentional:

-   **Low Utilization**:
    -   **Meaning**: There is high supply and low demand for the asset.
    -   **Effect on Rates**: The protocol lowers interest rates for both borrowing and lending. This encourages more borrowing and makes supplying less attractive, pushing the utilization rate up towards a healthier equilibrium.

-   **High Utilization**:
    -   **Meaning**: There is low supply and high demand for the asset. The pool is at risk of becoming illiquid.
    -   **Effect on Rates**: The protocol sharply increases interest rates. High borrowing rates incentivize borrowers to repay their loans, while high lending rates incentivize suppliers to deposit more assets. This dual pressure works to decrease the utilization rate back to a safer level.

Most protocols use a "kinked" interest rate model. This means that after the utilization rate crosses a certain optimal threshold (e.g., 80%), the interest rates start to increase much more dramatically to strongly protect the pool's liquidity.

By constantly monitoring the utilization rate of each lending pool, DeFi money markets can operate autonomously, ensuring that there is a healthy balance between the funds available for withdrawal and the funds being used for borrowing.