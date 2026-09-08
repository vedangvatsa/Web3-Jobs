---
title: 'The Shape of Ethereum'
description: >-
  A 6-year study of topological anomaly detection on Ethereum by Matan Prasma and Uri Yacobi Keller analyzing structural network shifts from 2020 to 2025.
category: Technology Deep Dives
data-ai-hint: ethereum research tda topology machine-learning forensics
publishedDate: '2026-09-08'
lastUpdated: '2026-09-08'
slug: the-shape-of-ethereum-topological-anomaly-detection
---

When capital moves rapidly, when automated keeper bots compete for liquidation rights, or when institutions rebalance during macro shocks, the structural geometry of blockchain transaction graphs changes before prices or transaction counts reflect the shift.

In research led by mathematicians Matan Prasma ([@KanExtension](https://ethresear.ch/u/kanextension)) and Uri Yacobi Keller ([@urihamster](https://ethresear.ch/u/urihamster)) on [ethresear.ch](https://ethresear.ch/t/the-shape-of-ethereum-a-six-year-study-of-topological-anomalies/25902) and documented in their [open-source repository](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/blob/main/Article/Shape_of_Ethereum-Full_Article.md), researchers analyzed 2,191 consecutive days of Ethereum transaction history (2020-2025) using Topological Data Analysis (TDA).

By converting daily transaction flows into multi-dimensional spatial shapes and calculating their 1-Wasserstein geometric distance, their model flagged 86 major structural anomalies. When cross-referenced against historical events, 73 out of 86 (84.9%) aligned with real-world shocks, frequently serving as an early-warning signal days before public headlines.

This analysis synthesizes data from 10 primary sources to explore how high-dimensional geometry provides new insight into blockchain analytics, protocol risk management, and market intelligence.

---

## 1. Why Volume and TVL Miss Structural Shifts

Traditional blockchain analytics rely on scalar aggregates: Total Value Locked (TVL), daily active addresses, transaction throughput (TPS), or gas consumption. 

However, scalar metrics count how much activity occurred, but cannot describe how that activity was structurally distributed across the network.

![High-Dimensional Network Topology and Graph Geometry](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200)
<figcaption>Visual representation of a complex multi-layered financial network graph. Topological Data Analysis measures structural loops and cluster formations rather than raw scalar transaction volume.</figcaption>

Consider two scenarios:

1. **Decentralized Retail Distribution:** 100,000 retail traders independently transfer $100 to centralized exchanges during a market rally. The result is a sparse, disconnected cloud of simple peer-to-peer transfers.
2. **Systemic Liquidation Cascade:** 50 automated liquidation keeper bots execute 10,000 rapid, multi-hop transactions across [MakerDAO collateral vaults](https://forum.makerdao.com/t/black-thursday-response-next-steps/1701), [Aave lending pools](https://aave.com), and [Uniswap liquidity pools](https://uniswap.org) to prevent protocol insolvency.

Both events might register identical gas usage ($10M) and transaction volume ($500M). Yet Event 1 represents organic retail flow, whereas Event 2 represents a tightly coupled liquidation loop during protocol stress. 

As demonstrated in research by [Ofori-Boateng et al. (2021)](https://arxiv.org/abs/2106.01806), scalar metrics cannot differentiate between these states. Topological Data Analysis maps the spatial geometry of the underlying transaction graph to reveal these structural differences.

---

## 2. The Mathematical Pipeline: From Raw Logs to Metric Spaces

To convert daily Ethereum transactions into a structural signal, Prasma and Keller constructed a four-stage topological pipeline.

![Vietoris-Rips Filtration and Persistent Homology Concept](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200)
<figcaption>Concept of Vietoris-Rips filtration: As the distance scale r expands, data points connect to form clusters (H0 homology) and enclosed topological loops (H1 homology).</figcaption>

### Layer 1: Dissecting Calldata Complexity
The researchers partitioned all Ethereum transactions into four disjoint operational layers based on calldata payload size and transaction type:

- **`highInput` (Calldata >= 500 bytes, 0 ETH value):** Complex smart contract executions and factory deployments. This is the liquidation and crash layer, capturing automated keeper bot races, flash loan exploits, and complex smart contract interactions.
- **`medInput` (Calldata 100-499 bytes, 0 ETH value):** Mid-level contract calls. This is the DeFi operational layer, tracking DEX routing, yield rebalancing, and protocol liquidity adjustments.
- **`nonFactory` (Calldata 1-99 bytes, 0 ETH value):** Simple contract interactions. This is the institutional and custody layer, recording multi-sig wallet operations, ETF custodian movements, and governance voting.
- **`simple_txs` (Value > 0 ETH):** Plain ETH transfers without calldata. This is the retail and macro layer, capturing direct exchange deposits, withdrawals, and macroeconomic portfolio shifts.

### Layer 2: Subgraph Induction & Geodesic Densification
For each layer-day:
1. The model selects the top 750 most active address pairs by transaction frequency ($w$).
2. It retains all mutual connections between nodes incident to those edges, creating a dense induced subgraph.
3. Edge weights are transformed into metric distances ($d$) using a non-linear similarity transform:
   $$d(u,v) = \frac{1}{1 + \alpha \cdot \frac{w - w_{\min}}{w_{\max} - w_{\min}}}$$
   *(where $\alpha = 9$, mapping high-frequency bot interactions to short distances $\approx 0.1$, and rare interactions to $1.0$)*.
4. All-pairs shortest path distances are calculated via Dijkstra's algorithm, converting the graph into a metric space.

### Layer 3: Vietoris-Rips Filtrations & Persistence Diagrams
A Vietoris-Rips filtration places an expanding metric ball of radius $r \in [0, 1]$ around every address:
- As $r$ grows, connected components merge ($H_0$ Homology).
- As nodes form closed loops, topological holes appear and eventually fill in ($H_1$ Homology).

The birth radius ($r_{\text{birth}}$) and death radius ($r_{\text{death}}$) of every topological feature are plotted on a 2D Persistence Diagram. Features that persist across wide radius ranges represent true structural architecture, whereas short-lived features represent random transaction noise.

### Layer 4: 1-Wasserstein Distance & Anomaly Detection
To measure day-over-day structural distortion, the pipeline calculates the 1-Wasserstein distance between consecutive daily persistence diagrams:

$$W_1(D_{t}, D_{t-1}) = \inf_{\gamma} \sum_{x \in D_{t}} \|x - \gamma(x)\|_1$$

This generates a daily metric for each layer measuring structural shift relative to the previous day.

---

## 3. Case Studies: 4 Key Market Events

Passing the daily Wasserstein metric through Seasonal Hybrid ESD (S-ESD) anomaly detection shows how different market shocks manifest in distinct topological layers.

![DeFi Liquidity and Smart Contract Trading Infrastructure](https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200)
<figcaption>High-frequency contract execution and liquidation cascades create intense topological distortions in the highInput layer during market crashes.</figcaption>

### 1. Black Thursday Collateral Auction Collapse (March 12, 2020)
- **Primary Source:** [Glassnode Research Post-Mortem](https://insights.glassnode.com/what-really-happened-to-makerdao/) and [MakerDAO Forum Incident Log](https://forum.makerdao.com/t/black-thursday-response-next-steps/1701).
- **The Event:** COVID-19 panic triggered a 43% crash in ETH price within 24 hours. High gas prices congested the Ethereum mempool, preventing MakerDAO price oracles from updating. A single liquidator exploited the congestion to win collateral auctions with $0 DAI bids, extracting $8.3M in uncollateralized DAI.
- **Topological Signature:** The `highInput` layer registered its highest single-day spike of 2020 on the exact same day ($z = 5.2$, 100th percentile).
- **Diagnosis:** Automated keeper bots spamming multi-step smart contract calls created a dense, highly distorted `highInput` topology.

### 2. Russia Invades Ukraine (February 26, 2022)
- **Primary Source:** International financial market logs and DeFi protocol flow data.
- **The Event:** Full-scale military invasion began on February 24, 2022 (Thursday). Global markets entered an immediate risk-off posture.
- **Topological Signature:** The `medInput` layer fired two days later on February 26 ($z = 5.1$, 100th percentile).
- **Diagnosis:** Protocol capital repositioning peaked over the weekend. As market participants withdrew liquidity from lending pools and converted assets into stablecoins, `medInput` (which tracks protocol-level rebalancing) captured the capital flight.

### 3. The Celsius Network Insolvency (June 2022 Precursor)
- **Primary Source:** [Celsius Network Official Announcement](https://celsiusnetwork.medium.com/a-memo-to-the-celsius-community-591286a9da76).
- **The Event:** On June 12, 2022, centralized lender Celsius Network paused all customer withdrawals, signaling insolvency following the Terra/LUNA collapse.
- **Topological Signature:** The `medInput` layer fired three days prior on June 9 ($z = 4.8$).
- **Diagnosis:** Days before public announcement, institutional wallets and liquidity providers actively unstaked stETH and withdrew collateral from Aave and Compound. The topology of `medInput` detected capital flight prior to the official freeze.

### 4. The $1.46B Bybit Cold Wallet Hack (February 21, 2025)
- **Primary Source:** [CoinDesk On-Chain Hack Reporting](https://www.coindesk.com/business/2025/02/21/bybit-hacked-for-14b-in-largest-crypto-heist/).
- **The Event:** Attackers compromised Bybit's Ethereum cold storage, stealing 401,000 ETH ($1.46B) - the largest heist in crypto history.
- **Topological Signature:** The `medInput` layer fired the following day on February 22 ($z = 5.1$, 99.9th percentile).
- **Diagnosis:** The initial theft was a single multi-sig transfer (invisible to graph topology). TDA detected the immediate aftermath: stolen funds being laundered through DEX aggregators, Tornado Cash, and cross-chain bridges, creating a structural spike in `medInput`.

---

## 4. Uncovering Structural Regimes: Change-Point Analysis

Using global offline change-point detection (`ruptures` L2 cost optimization), the algorithm partitioned six years of data into seven distinct structural regimes without inspecting news, social media, or price charts:

![Blockchain Architecture and Change Point Transitions](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200)
<figcaption>Change-point detection identifies macro shifts in network architecture without using price inputs.</figcaption>

| Regime Breakpoint | Nearest Real-World Catalyst | Primary Structural Shift |
|---|---|---|
| **September 19, 2020** | Peak of DeFi Summer Yield Farming | Transition from liquidity mining frenzy to protocol consolidation |
| **September 4, 2022** | 11 Days Before [The Ethereum Merge](https://ethereum.org/en/roadmap/merge/) | MEV searcher and validator repositioning prior to PoS migration |
| **June 16, 2023** | 1 Day After [BlackRock Spot BTC ETF Filing](https://www.sec.gov/edgar/browse/?CIK=0001980994) | Institutional re-rating of digital asset market infrastructure |
| **October 25, 2023** | Start of Spot BTC ETF Rally | BTC breaks $35k; ETH breaks $2,000; liquidity expands |
| **January 23, 2024** | Settlement of Spot BTC ETF Trading | GBTC outflow volatility settles into steady institutional inflows |
| **January 29, 2025** | DeepSeek AI Market Shock | Nvidia drops 17%; global tech risk-off rotation impacts crypto |

---

## 5. Layer Rotation: How Ethereum Transformed (2020 vs 2025)

The study's primary structural insight is Layer Rotation - the shift in which transaction layers trigger anomalies over time:

```
Distribution of Anomaly Flags by Layer (2020-2025):

  2020-2021 (DeFi-Native Era):
  ├── highInput (Liquidation Bots): ████████████████ (Dominant)
  └── medInput (DeFi Swaps/Yield):   ██████████████ (Dominant)

  2024 (Institutional Custody Era):
  ├── nonFactory (Custody/ETF/Gov): ████████████████ (11 out of 16 events)
  └── simple_txs (Retail transfers): █ (1 event)

  2025 (Macro Financial Era):
  ├── simple_txs (Macro/ETF Flows): ████████████████ (14 events)
  └── highInput (DeFi Crashes):     ░ (0 events)
```

- **2020-2021:** Ethereum operated as a DeFi-native network. Anomalies were driven by automated liquidation bots, flash loans, and DEX arbitrage.
- **2024:** Ethereum shifted toward an institutional asset class. The `nonFactory` layer dominated as ETF custodians (Coinbase Custody), institutional multi-sigs, and corporate treasuries executed direct smart contract interactions.
- **2025:** Ethereum operated as a global macro financial asset. Plain ETH transfers (`simple_txs`) dominated anomaly counts, reflecting sensitivity to US Federal Reserve policy, Treasury yields, and global AI tech equity shifts.

---

## 6. Predictive Validation & Applications

Can topological anomalies predict future price volatility?

In a follow-up experiment documented in the [Simplex-TDA Predictive Validation Repository](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/tree/main/predictive-validation), researchers combined rolling TDA topological descriptors with standard financial indicators to predict 7-day-ahead elevated volatility:

- **Predictive Performance:** Incorporating TDA features improved 7-day elevated volatility classification AUC from 0.480 to 0.523 (surviving FDR statistical corrections and placebo-shuffle tests).
- **Protocol Risk Management:** Lending protocols like [Aave](https://aave.com) and [Compound](https://compound.finance) can use real-time `highInput` Wasserstein distance monitoring to adjust collateral factors dynamically before liquidation cascades trigger.
- **Forensic Security:** Exchange security teams can track `medInput` structural loops to detect unauthorized cold-storage fund laundering in real time.

---

## 7. Reference Index (10 Primary Sources)

1. **Prasma, M. & Keller, U. Y. (2025):** *"The Shape of Ethereum: A Six-Year Study of Topological Anomalies."* [ethresear.ch Post #25902](https://ethresear.ch/t/the-shape-of-ethereum-a-six-year-study-of-topological-anomalies/25902).
2. **Simplex-TDA (2025):** *"ETH Anomaly Detection Full Technical Specification."* [Simplex-TDA GitHub Repository](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/blob/main/Article/Shape_of_Ethereum-Full_Article.md).
3. **Simplex-TDA (2025):** *"Predictive Validation and Volatility Experiment."* [Predictive Validation Module](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/tree/main/predictive-validation).
4. **Ofori-Boateng, R. et al. (2021):** *"Topological Anomaly Detection in Dynamic Multilayer Blockchain Networks."* [arXiv:2106.01806](https://arxiv.org/abs/2106.01806).
5. **Glassnode Research (2020):** *"What Really Happened to MakerDAO on Black Thursday."* [Glassnode Insights](https://insights.glassnode.com/what-really-happened-to-makerdao/).
6. **MakerDAO Governance (2020):** *"Black Thursday Formal Response & Post-Mortem."* [MakerDAO Forum Log](https://forum.makerdao.com/t/black-thursday-response-next-steps/1701).
7. **Celsius Network (2022):** *"Official Memo to the Celsius Community on Withdrawal Pause."* [Celsius Medium Announcement](https://celsiusnetwork.medium.com/a-memo-to-the-celsius-community-591286a9da76).
8. **CoinDesk Research (2025):** *"Bybit Hacked for $1.46B in Largest Crypto Theft in History."* [CoinDesk Article](https://www.coindesk.com/business/2025/02/21/bybit-hacked-for-14b-in-largest-crypto-heist/).
9. **U.S. Securities and Exchange Commission (2023):** *"iShares Bitcoin Trust Registration Statement (Form S-1)."* [SEC EDGAR Filing](https://www.sec.gov/edgar/browse/?CIK=0001980994).
10. **Ethereum Foundation (2022):** *"The Merge Protocol Upgrade Documentation."* [Ethereum.org Roadmap](https://ethereum.org/en/roadmap/merge/).
