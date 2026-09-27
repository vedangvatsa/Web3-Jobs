---
title: Perpetual Futures and On-Chain Derivatives
description: >-
  How decentralized perpetual exchanges work and why they are DeFi's largest
  trading venues.
order: 9
readTime: 11 min
difficulty: advanced
prerequisites:
  - dexs
quiz:
  - question: What is a perpetual futures contract?
    options:
      - A futures contract that expires every month.
      - >-
        A futures contract with no expiration date, allowing traders to hold use
        positions indefinitely.
      - A type of options contract.
      - A stablecoin that tracks commodity prices.
    correct: 1
    explanation: >-
      Perpetual futures ('perps') are futures contracts that never expire. They
      use a funding rate mechanism to keep the contract price anchored to the
      spot price.
  - question: What is the 'funding rate' in perpetual futures?
    options:
      - The gas fee for opening a trade.
      - >-
        A periodic payment between longs and shorts that keeps the perp price
        aligned with the spot price.
      - The interest rate on borrowed margin.
      - The protocol's trading fee.
    correct: 1
    explanation: >-
      When the perp price is above spot, longs pay shorts (incentivizing
      shorting). When the perp price is below spot, shorts pay longs. This
      mechanism keeps prices aligned without expiration.
  - question: What happens when a used position gets liquidated?
    options:
      - The exchange refunds your money.
      - >-
        Your collateral is seized because the position's losses approached the
        deposited margin, and the exchange closes the position to prevent bad
        debt.
      - You receive more tokens.
      - Nothing - you can always hold.
    correct: 1
    explanation: >-
      Liquidation occurs when losses eat through most of your collateral. At
      that point, the exchange forcibly closes your position and takes your
      remaining margin to cover the loss. With 10x use, a 10% move against you
      wipes out your entire deposit.
  - question: >-
      What is the main advantage of decentralized perp exchanges over
      centralized ones like Binance?
    options:
      - They are always cheaper.
      - >-
        Non-custodial - you trade from your own wallet and never deposit funds
        with a company that could freeze or lose them.
      - They have more trading pairs.
      - They are faster.
    correct: 1
    explanation: >-
      On decentralized perp exchanges like GMX or Hyperliquid, you trade
      directly from your wallet. Your funds never sit on a company's servers.
      After the FTX collapse showed the risks of custodial exchanges, this
      became a major selling point.
  - question: Why are perpetual futures called 'perpetual'?
    options:
      - Because they last forever once opened.
      - >-
        Because unlike traditional futures that expire on a set date, perpetual
        contracts have no expiration - they can be held indefinitely, with the
        funding rate mechanism keeping prices anchored to spot.
      - Because they cannot be closed.
      - Because the profits are perpetual.
    correct: 1
    explanation: >-
      Traditional futures expire quarterly. Perpetual futures eliminated this
      constraint. Instead of expiration forcing convergence to spot price, the
      funding rate - a periodic payment between longs and shorts - continuously
      pulls the perp price toward the spot price.
lastUpdated: 2026-09-04
---

## What Are Perpetual Futures?

A perpetual contract provides price exposure without a scheduled expiry. A position requires margin and may incur funding payments and trading fees. Liquidation, delisting, or platform rules can end it before the trader chooses to close it.

Perpetual-contract designs differ in collateral, price references, funding calculations, and settlement. Read those rules for the particular market.

## How They Work

### Opening a Position

You deposit eligible collateral and open a **long** or **short** position. Leverage is the ratio of position exposure to the margin supporting it.

Simplified example with 10x leverage, before fees, funding, and maintenance-margin rules:
- You deposit $1,000 as margin.
- You open a 10x long on ETH at $3,000.
- Your effective position size is $10,000 (buying 3.33 ETH worth of exposure).
- If ETH rises 10% to $3,300, your profit is $1,000 (100% return on your margin).
- A 10% fall would consume the initial margin in this simplified calculation. In practice, maintenance-margin rules can trigger liquidation sooner.

### The Funding Rate

Since perps never expire, they need a mechanism to stay pegged to the underlying spot price. This is the **funding rate**.

- When the perp price > spot price (more longs than shorts): **longs pay shorts**.
- When the perp price < spot price (more shorts than longs): **shorts pay longs**.

Funding is typically settled every 1-8 hours. This creates a continuous economic incentive that keeps the perp price close to spot.

<div class="diagram">
<svg viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Perp above spot -->
 <text x="200" y="25" text-anchor="middle" font-size="13" font-weight="bold" fill="#666">Perp price ABOVE spot</text>
 <rect x="40" y="40" width="120" height="50" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="100" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Longs</text>
 <text x="100" y="78" text-anchor="middle" font-size="10" fill="#166534">PAY →</text>
 <rect x="240" y="40" width="120" height="50" rx="8" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="300" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">Shorts</text>
 <text x="300" y="78" text-anchor="middle" font-size="10" fill="#1e40af">GET PAID</text>
 <line x1="160" y1="65" x2="240" y2="65" stroke="#22c55e" stroke-width="2" marker-end="url(#apf)"/>
 <text x="200" y="115" text-anchor="middle" font-size="11" fill="#64748b">Pushes perp price DOWN toward spot</text>

 <!-- Perp below spot -->
 <text x="600" y="25" text-anchor="middle" font-size="13" font-weight="bold" fill="#666">Perp price BELOW spot</text>
 <rect x="440" y="40" width="120" height="50" rx="8" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="500" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">Shorts</text>
 <text x="500" y="78" text-anchor="middle" font-size="10" fill="#1e40af">PAY →</text>
 <rect x="640" y="40" width="120" height="50" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="700" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Longs</text>
 <text x="700" y="78" text-anchor="middle" font-size="10" fill="#166534">GET PAID</text>
 <line x1="560" y1="65" x2="640" y2="65" stroke="#3b82f6" stroke-width="2" marker-end="url(#apf2)"/>
 <text x="600" y="115" text-anchor="middle" font-size="11" fill="#64748b">Pushes perp price UP toward spot</text>

 <text x="400" y="165" text-anchor="middle" font-size="12" fill="#94a3b8">Result: perp price stays close to spot without any expiration date</text>

 <defs>
 <marker id="apf" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
 <marker id="apf2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6"/></marker>
 </defs>
</svg>
</div>

## Decentralized Perp Exchanges

### GMX (Arbitrum, Avalanche)
GMX uses a unique liquidity pool model. Instead of an order book, traders trade against the **GLP pool** - a basket of assets that acts as the counterparty.

- Liquidity providers deposit assets into GLP and earn trading fees + funding payments.
- Traders get zero-slippage execution using Chainlink oracles for pricing.
- GLP holders earn ~15-30% APY from fees but take on the risk that traders collectively profit.

### dYdX
dYdX operates a fully on-chain order book exchange on its own Cosmos-based chain. It offers the deepest liquidity of any decentralized perp exchange.

- Uses an off-chain order book with on-chain settlement.
- Supports up to 20x use on major pairs.
- Has its own dedicated blockchain (dYdX Chain) for maximum throughput.

### Hyperliquid
A high-performance perp DEX on its own L1 blockchain, designed for sub-second latency matching centralized exchange performance.

- Fully on-chain order book.
- Sub-second block times.
- Supports 50+ trading pairs.

## Risk Management

### Liquidation
If your position loses enough that your remaining margin falls below the maintenance requirement, the protocol automatically closes your position. With high use, this can happen very quickly.

### Insurance Funds
Protocols maintain insurance funds to cover situations where liquidations happen at prices worse than the liquidation price (cascading liquidations during flash crashes).

### Oracle Risk
Decentralized perps rely on price oracles. If the oracle reports an incorrect price (due to manipulation or delay), traders can be unfairly liquidated or can exploit the mispricing.

## Centralized vs. Decentralized Perps

| Feature | CEX (Binance) | DEX (GMX/dYdX) |
| --- | --- | --- |
| KYC Required | Yes | No |
| Custody | Exchange holds funds | Self-custody |
| Latency | ~1ms | ~100ms-1s |
| Max use | 125x | 20-50x |
| Transparency | Opaque | Fully auditable |
| Counterparty Risk | Exchange bankruptcy | Smart contract risk |

## Key Takeaways

- Perpetual contracts provide exposure without a scheduled expiry; margin and market rules still apply.
- The funding rate mechanism keeps perp prices aligned with spot prices.
- Decentralized perps (GMX, dYdX, Hyperliquid) offer self-custody and transparency.
- Leverage amplifies gains and losses relative to margin; fees, funding, and liquidation affect the result.
- Oracle reliability is critical for fair pricing on decentralized perp exchanges.
