---
title: "Understanding Interest Rate Models in Compound"
image: "https://picsum.photos/seed/interest-models/1200/630"
description: "Explore how DeFi protocols like Compound use algorithmic interest rate models to balance supply and demand for assets."
category: "DeFi"
data-ai-hint: "interest graph"
---

## Understanding Interest Rate Models in Compound

DeFi lending protocols like Compound don't use static interest rates like a traditional bank. Instead, they employ **algorithmic interest rate models** that dynamically adjust rates based on real-time market conditions of supply and demand. This ensures that the protocol remains liquid and can always service withdrawal requests.

### The Role of the Utilization Rate

The primary driver of interest rates in these models is the **Utilization Rate**.

-   **Utilization Rate**: This is the percentage of the total assets in a lending pool that are currently being borrowed.
-   **Formula**: `Utilization Rate = Total Borrows / (Total Borrows + Total Cash)`

For example, if there is $1,000,000 of USDC in a pool and $750,000 of it is being borrowed, the utilization rate is 75%.

The interest rate for both suppliers (lenders) and borrowers is a direct function of this utilization rate.

### The Kinked Interest Rate Model

Most modern DeFi protocols, including Compound V2 and Aave, use a "kinked" or "jump" interest rate model. This model has two different slopes to aggressively incentivize liquidity when a pool is becoming depleted.

The model is defined by a few key parameters:

1.  **Base Rate**: The interest rate when utilization is 0%.
2.  **Kink**: The "optimal" utilization rate (e.g., 80%). This is the point where the interest rate model changes.
3.  **Slope 1 (Multiplier)**: The slope of the interest rate curve before the kink.
4.  **Slope 2 (Jump Multiplier)**: The much steeper slope of the interest rate curve after the kink.

#### How It Works in Practice

-   **Below the Kink (e.g., 0% to 80% Utilization)**: As borrowing increases, the interest rate for both borrowers and suppliers climbs steadily. The goal is to find a healthy equilibrium.
    -   *Borrow Rate = Base Rate + (Utilization Rate * Slope 1)*

-   **Above the Kink (e.g., 80% to 100% Utilization)**: If the utilization rate surpasses the optimal "kink" point, it means the pool is running low on liquidity. To correct this, the interest rate model applies the much steeper "jump multiplier".
    -   *Borrow Rate = Base Rate + (Kink * Slope 1) + ((Utilization Rate - Kink) * Slope 2)*
    -   The borrow rate skyrockets, making it very expensive to borrow. This incentivizes borrowers to repay their loans.
    -   Simultaneously, the supply APY also skyrockets, incentivizing new lenders to deposit assets and replenish the pool's liquidity.

### Supplier APY vs. Borrower APY

The interest paid by borrowers is distributed to the lenders. The Supplier APY is calculated as follows:

-   **Supplier APY = Borrower APY * Utilization Rate * (1 - Reserve Factor)**

The **Reserve Factor** is a small percentage of the interest paid by borrowers that is kept by the protocol as revenue.

This dynamic model allows DeFi money markets to operate autonomously, balancing the needs of borrowers and lenders without manual intervention. By understanding how the utilization rate drives interest rates, users can make more informed decisions about when to supply or borrow assets.