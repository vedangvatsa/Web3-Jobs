---
title: "Understanding Interest Rate Models in Compound"
image: "https://picsum.photos/seed/interest-rate-models/1200/630"
description: "A look into how DeFi lending protocols like Compound use algorithmic interest rate models to balance supply and demand for assets."
category: "Educational"
data-ai-hint: "financial graph"
---

### Introduction

In traditional finance, interest rates are set by central banks and financial institutions. In the world of Decentralized Finance (DeFi), protocols like Compound use a fundamentally different approach: algorithmic interest rate models. These models automatically adjust borrowing and lending rates based on the real time supply and demand of assets within a liquidity pool. Understanding how these models work is key to grasping the dynamic nature of DeFi lending.

### How It Works

The interest rate for any given asset on Compound is not static. It is a function of the **utilization rate** of that asset's liquidity pool.

1.  **Utilization Rate**: This is the percentage of the total assets in a pool that are currently being borrowed.
    *Utilization Rate = (Total Assets Borrowed) / (Total Assets Supplied)*

2.  **The Interest Rate Model**: Compound's interest rate model is a graph where the x-axis is the utilization rate (from 0% to 100%) and the y-axis is the interest rate. The model is typically a line with a "kink."
    -   **Before the Kink**: At low utilization rates, the interest rate increases slowly as utilization goes up. This encourages borrowing.
    -   **The Kink**: There is an optimal utilization rate (e.g., 80%) that the protocol targets. This is the "kink" in the graph.
    -   **After the Kink**: If the utilization rate surpasses the optimal point, the interest rate starts to increase much more sharply. This steep rise is designed to strongly incentivize borrowers to repay their loans and new lenders to supply assets, pushing the utilization rate back down towards the optimal level.

3.  **Borrow Rate vs. Supply Rate**:
    -   The **Borrow Rate** is directly determined by the utilization rate on the graph.
    -   The **Supply Rate** (the interest paid to lenders) is derived from the borrow rate. It is calculated as:
        *Supply Rate = Borrow Rate × Utilization Rate × (1 - Reserve Factor)*
    -   The **Reserve Factor** is a small percentage of the interest paid by borrowers that is kept by the protocol as a reserve fund.

### Why It Matters

This algorithmic approach has several important implications for the protocol and its users.

-   **Autonomous and Transparent**: The rates are set by a predictable, open source algorithm, not by a committee behind closed doors. Anyone can see the formula and understand why rates are what they are.
-   **Maintains Liquidity**: The primary goal of the model is to ensure there are always enough assets available for lenders to withdraw. By sharply increasing rates at high utilization, the model prevents a "bank run" scenario where all assets are borrowed and lenders cannot get their funds back.
-g
-   **Balances Incentives**: The model constantly works to balance the needs of borrowers (who want low rates) and lenders (who want high rates), finding an equilibrium based on market demand.
-   **Market-Driven Rates**: The rates are a direct reflection of the real time demand for a particular asset. If many people want to borrow USDC, its interest rate will naturally rise.

### Practical Example

Consider a USDC liquidity pool on Compound. The interest rate model has its "kink" at 80% utilization.

-   **Scenario 1: Low Utilization (20%)**
    -   Only 20% of the USDC in the pool is being borrowed.
    -   According to the model, the interest rate is low, perhaps 2% for borrowers.
    -   This makes it cheap to borrow USDC, encouraging more activity. Lenders earn a small yield.

-   **Scenario 2: High Utilization (95%)**
    -   The pool is almost empty, with 95% of the USDC borrowed. This is past the 80% kink.
    -   The model now dictates a much higher interest rate, perhaps jumping to 25% for borrowers.
    -   This high rate strongly incentivizes existing borrowers to repay their loans to stop paying the high interest.
    -   Simultaneously, the high rate attracts new lenders who want to earn a high yield, thus replenishing the pool's liquidity.

This shows how the model acts as an automatic, self-correcting mechanism to ensure the protocol remains healthy and liquid.

### FAQ

**Why is there a "kink" in the interest rate model?**
The kink represents the point that the protocol considers the optimal balance between capital efficiency (having assets borrowed and generating fees) and liquidity risk (having enough assets available for withdrawal). The sharp increase after the kink is a safety measure to aggressively defend that liquidity.

**Who sets the parameters for the interest rate model?**
The specific parameters for each asset's interest rate model (like the optimal utilization rate and the slope of the interest curve) are controlled by Compound's governance. COMP token holders can propose and vote on changes to these parameters.

**Are the interest rates fixed?**
No, they are variable. Because the utilization rate can change from block to block as users borrow and repay assets, the interest rates for both borrowing and lending are constantly fluctuating.
