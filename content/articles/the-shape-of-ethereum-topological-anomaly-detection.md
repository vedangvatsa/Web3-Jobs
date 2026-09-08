---
title: 'The Shape of Ethereum: A Six-Year Study of Topological Anomalies'
description: >-
  An investigative deep dive into research by Matan Prasma and Uri Yacobi Keller using Topological Data Analysis (TDA) to map the multi-dimensional geometric shape of Ethereum transactions from 2020 to 2025.
category: Technology Deep Dives
data-ai-hint: ethereum research tda topology machine-learning
publishedDate: '2026-09-08'
lastUpdated: '2026-09-08'
slug: the-shape-of-ethereum-topological-anomaly-detection
---

What if Ethereum’s blockchain isn’t just a ledger of ledger entries or a chart of prices, but a living, breathing geometric shape that changes form right before a major crash, exploit, or market shift?

In groundbreaking research published by mathematicians **Matan Prasma** ([@KanExtension](https://ethresear.ch/u/kanextension)) and **Uri Yacobi Keller** ([@urihamster](https://ethresear.ch/u/urihamster)) on [ethresear.ch](https://ethresear.ch/t/the-shape-of-ethereum-a-six-year-study-of-topological-anomalies/25902) and detailed in their [full technical paper](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/blob/main/Article/Shape_of_Ethereum-Full_Article.md), researchers analyzed **six full years of Ethereum on-chain history (2020–2025)** using **Topological Data Analysis (TDA)**—an advanced branch of algebraic topology.

Instead of tracking basic metrics like transaction volume, gas fees, or market price, their mathematical pipeline converts daily transaction graphs into multi-dimensional geometric objects and measures how their **physical "shape" distorts over time**.

The result? Over 2,191 consecutive days, their topological detector flagged **86 anomalous events**. When cross-referenced against historical news, **73 out of the 86 flags (85%) matched major real-world shocks**—often detecting mechanism breakdowns and fund rebalancing days or hours before they became public knowledge.

Here is the complete investigative breakdown of how algebraic topology is opening a new frontier in blockchain forensics, network health monitoring, and systemic risk prediction.

---

## 1. The Core Idea: Why Price and Volume Are Blind

Traditional blockchain analytics rely on simple scalar metrics: daily active addresses, total transaction count, gas used, or token transfer volume. 

However, scalar metrics suffer from a critical flaw: **they lack spatial structure**. 

![Ethereum Topological Data Analysis Network Visualization](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200)
<figcaption>Visual representation of Ethereum's high-dimensional transaction graph. Topological Data Analysis measures structural loops and connected clusters rather than simple transaction counts.</figcaption>

Consider two scenarios:
1. **Scenario A:** 100,000 retail users transfer $50 each to central exchanges during a routine price rally.
2. **Scenario B:** 100 automated keeper bots execute 1,000 highly interconnected, high-speed contract calls across MakerDAO, Aave, and Uniswap to prevent cascading collateral liquidations.

Both scenarios might record similar total gas usage or dollar volume. But **Scenario A** is a decentralized cloud of isolated transactions, whereas **Scenario B** is a tightly wound, dense web of multi-contract calls. 

Price and volume cannot tell them apart. **Topology can.**

By treating wallet addresses as coordinates (nodes) and transaction frequency as structural closeness (edges), TDA measures the multi-dimensional geometry of the network—detecting when connected clusters collapse, when loops open up, and when the underlying architecture of capital flow breaks down.

---

## 2. Demystifying the Math: How TDA Sees Blockchain Geometry

To process six years of Ethereum data without being overwhelmed by millions of daily transactions, Prasma and Keller constructed a multi-stage mathematical pipeline.

![Topological Data Analysis Vietoris-Rips Filtration Concept](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200)
<figcaption>Vietoris-Rips filtration concept: As the distance threshold expands, isolated data points merge into connected components (H0) and form topological loops or holes (H1).</figcaption>

### Step A: The Four Distinct Transaction Layers
Raw transaction data is partitioned into four distinct operational layers based on transaction complexity:

| Layer | Definition | Operational Meaning | Typical Real-World Events |
|---|---|---|---|
| `highInput` | Calldata $\ge 500$ bytes, $0$ ETH value | Complex smart contract executions & factory calls | Liquidation cascades, automated bot races, flash loan exploits |
| `medInput` | Calldata $100$–$499$ bytes, $0$ ETH value | Mid-level contract interactions | DeFi liquidity shifts, lending adjustments, DEX routing |
| `nonFactory` | Calldata $1$–$99$ bytes, $0$ ETH value | Direct wallet-to-contract calls | Institutional custody, staking, governance, ETF flows |
| `simple_txs` | Direct ETH transfer ($\text{value} > 0$) | Plain ETH transfers with no contract logic | Retail trading, exchange withdrawals, macro repositioning |

### Step B: Geodesic Densification & Graphs
For each layer on each day:
1. The top 750 most active address pairs (edges) are selected.
2. All mutual connections between those addresses are retained, creating a dense induced subgraph.
3. Transaction counts ($w$) are converted into spatial distances ($d$) using a non-linear similarity transform:
   $$d(u,v) = \frac{1}{1 + \alpha \cdot \frac{w - w_{\min}}{w_{\max} - w_{\min}}}$$
   *(where $\alpha = 9$, mapping high-traffic connections to very short distances $\approx 0.1$, and low-traffic connections to $1.0$)*.
4. Shortest paths between all pairs of nodes are computed via Dijkstra's algorithm, establishing a smooth metric distance space.

### Step C: Vietoris–Rips Filtration & Persistence Diagrams
Imagine placing a sphere of radius $r$ around every address node in the network:
- As $r$ grows from $0$ to $1$, spheres overlap.
- When two spheres touch, an edge is drawn. When three touch, a triangle (2-simplex) is formed.
- **$H_0$ Homology (Connected Components):** Tracks how isolated clusters of wallets merge together.
- **$H_1$ Homology (Topological Loops):** Tracks when circular transactional loops form and close (e.g., arbitrage loops or laundering cycles).

The birth radius and death radius of every cluster and loop are recorded in a 2D plot called a **Persistence Diagram**.

### Step D: The Wasserstein Distance Signal
To measure structural change, the researchers calculated the **1-Wasserstein distance** between today’s persistence diagram and yesterday’s persistence diagram:

$$W_1(D_{\text{today}}, D_{\text{yesterday}})$$

This outputs a single numerical score per layer per day: **How much did the geometric shape of the Ethereum network shift compared to yesterday?**

---

## 3. Forensic Case Studies: 3 Major Market Shocks

When the Wasserstein distance signals were passed through Seasonal Hybrid ESD (S-ESD) anomaly detection, the spikes aligned with precision alongside historical crises.

![DeFi Liquidity and Trading Infrastructure](https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200)
<figcaption>High-frequency contract execution and liquidation cascades create intense topological distortions in the highInput layer during market crashes.</figcaption>

### Case Study 1: Black Thursday (March 12, 2020)
- **Market Context:** COVID-19 panic caused ETH to plunge 43% in 24 hours. High gas prices congested the mempool, causing price oracles to lag and allowing a single liquidation bot to win MakerDAO collateral auctions with $0 DAI bids, draining $8.3M.
- **Topological Signature:** The `highInput` layer registered its largest single-day Wasserstein spike in the entire 2020 dataset—firing on the **exact same day** at a massive **$z = 5.2$ score (100th percentile)**.
- **Why it matters:** Black Thursday was not just a price crash; it was a structural mechanism failure. Automated keeper bots racing to liquidate undercollateralized vaults generated dense, multi-step contract calls that twisted `highInput` geometry instantly.

### Case Study 2: Russia Invades Ukraine (February 26, 2022)
- **Market Context:** Russia launched its invasion on February 24, 2022, causing global risk-off repositioning.
- **Topological Signature:** The `medInput` layer fired **two days later** on February 26 at **$z = 5.1$ (100th percentile)**.
- **Why it matters:** Invasion day was a Thursday; protocol repositioning peaked over the weekend as stablecoin flows migrated to safe-haven assets and lending protocols adjusted collateral parameters. `medInput` specifically measures deliberate protocol-level capital movements rather than automated liquidation cascades.

### Case Study 3: The Bybit Hack (February 21, 2025)
- **Market Context:** Attackers compromised Bybit's cold storage, stealing 401,000 ETH ($1.46B)—the largest crypto heist in history.
- **Topological Signature:** The `medInput` layer fired the **next day** (February 22) at **$z = 5.1$ (99.9th percentile)**.
- **Why it matters:** The theft itself was a single transaction—invisible to topological distance, which measures graph structure rather than value moved. What TDA caught was the aftermath: as stolen funds were routed across DEX aggregators, bridges, and mixing protocols, they generated a massive wave of mid-complexity contract calls that restructured `medInput` geometry.

---

## 4. Precursor Signals: Detecting Crises Before the Headlines

One of the study's most remarkable findings is that topological anomalies often **lead public market events**:

```
Timeline of Early On-Chain Warning Signals:

  COMP Governance Distribution Shock (June 2020)
  ├── TDA Signal: Fired 4 days prior (June 11) in medInput
  └── Public Event: Yield farming explosion (June 15)

  Celsius Insolvency Crisis (June 2022)
  ├── TDA Signal: Fired 3 days prior (June 9) in medInput
  └── Public Event: Celsius pauses all withdrawals (June 12)

  Curve Finance stETH Pool De-pegging (May 2022)
  ├── TDA Signal: Fired 2 days prior (May 6) in medInput
  └── Public Event: Terra/LUNA UST collapse begins (May 8)
```

In the case of **Celsius Network**, institutional wallet rebalancing and collateral withdrawals generated a distinct `medInput` structural anomaly three days before Celsius officially froze customer withdrawals. Topological data captured capital flight in real time while the public was still unaware.

---

## 5. Structural Regimes: The 6 Key Shifts in Ethereum’s History

Using global change-point detection (`ruptures` L2 offline cost optimization), the researchers partitioned Ethereum's six-year history into **seven distinct operational regimes**:

![Blockchain Architecture and Change Point Transitions](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200)
<figcaption>Change-point detection identifies structural shifts in network behavior without inspecting news or price charts.</figcaption>

1. **September 19, 2020 — End of DeFi Summer:** Transition from speculative yield-farming frenzy into a structural consolidation phase.
2. **September 4, 2022 — Pre-Merge Transition:** Fired 11 days before The Merge, capturing MEV searcher and validator repositioning prior to Proof-of-Stake activation.
3. **June 16, 2023 — BlackRock ETF Filing:** Fired 1 day after BlackRock submitted its spot Bitcoin ETF application, marking the start of institutional re-rating.
4. **October 25, 2023 — Spot ETF Anticipation Rally:** Fired as Bitcoin broke $35,000 and ETH crossed $2,000.
5. **January 23, 2024 — Post-Approval GBTC Settlement:** Fired as initial Grayscale GBTC outflow volatility settled into steady institutional inflows.
6. **January 29, 2025 — The DeepSeek AI Macro Shock:** Fired two days after the DeepSeek release triggered a 17% drop in Nvidia and a global tech risk-off rotation.

---

## 6. The Great Layer Rotation: How Ethereum Transformed (2020 vs. 2025)

By analyzing which layer triggered anomalies in each year, Prasma and Keller uncovered a profound shift in **who uses Ethereum and how**:

```
Layer Anomaly Activity Shift (2024 vs. 2025):

  2024 (Institutional Era):
  ├── nonFactory (Custody/ETF/Gov):  11 events  ████████████
  └── simple_txs (Retail transfers):  1 event   █

  2025 (Macro-Integrated Era):
  ├── nonFactory (Custody/ETF/Gov):  Quiet      ░
  └── simple_txs (Retail/Macro):     14 events  ███████████████
```

- **In 2020–2021:** `highInput` and `medInput` dominated. Ethereum was a **DeFi-native playground** driven by automated liquidation bots, DEX swaps, and yield farming.
- **In 2024:** `nonFactory` dominated (firing 11 out of 16 anomalies). Ethereum became an **institutional asset class** driven by ETF custody moves, multi-sig treasury management, and corporate rebalancing.
- **In 2025:** `simple_txs` dominated while `highInput` went quiet. Macro interest rate expectations, Fed policy, and ETF flow rebalancing transformed Ethereum into a **global macro financial asset**.

---

## 7. Key Takeaways for Web3 Engineers & Analysts

1. **Topology is an Uncheatable Health Metric:** While volume can be wash-traded and prices can be manipulated off-chain, the high-dimensional geometric topology of contract interactions cannot be easily faked.
2. **Early Warning Systems for Protocol Risk:** Integrating TDA monitoring into risk engines (e.g., Aave, MakerDAO, or Chainlink oracles) offers real-time detection of pool imbalances and liquidation bot anomalies days before insolvency events manifest.
3. **Data-Driven Governance:** Layer-rotation metrics provide concrete empirical evidence on how protocol upgrades or fee changes impact distinct user classes (retail, DeFi protocols, vs. institutional custodians).

---

## References & Further Reading

- **Original ethresear.ch Post:** [The Shape of Ethereum: A Six-Year Study of Topological Anomalies](https://ethresear.ch/t/the-shape-of-ethereum-a-six-year-study-of-topological-anomalies/25902) by Matan Prasma & Uri Yacobi Keller.
- **Full Article & Technical Appendix:** [Simplex-TDA / ETH-Anomaly-Detection GitHub Repository](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/blob/main/Article/Shape_of_Ethereum-Full_Article.md).
- **Predictive Validation Experiment:** [Simplex-TDA Volatility Prediction Pipeline](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/tree/main/predictive-validation).
- **Prior Research:** Ofori-Boateng et al., *"Topological Anomaly Detection in Dynamic Multilayer Blockchain Networks"* (arXiv:2106.01806).
