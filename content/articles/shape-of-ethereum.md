---
title: 'The Shape of Ethereum'
description: >-
  A 6-year study of topological anomaly detection on Ethereum by Matan Prasma and Uri Yacobi Keller analyzing structural network shifts from 2020 to 2025.
category: Technology Deep Dives
publishedDate: '2026-09-08'
lastUpdated: "2026-09-08"
slug: shape-of-ethereum
---

When capital moves rapidly, when automated keeper bots compete for liquidation rights, or when institutions rebalance during macro shocks, the structural geometry of blockchain transaction graphs changes before prices or transaction counts reflect the shift.

In research led by mathematicians Matan Prasma ([@KanExtension](https://ethresear.ch/u/kanextension)) and Uri Yacobi Keller ([@urihamster](https://ethresear.ch/u/urihamster)) on [ethresear.ch](https://ethresear.ch/t/the-shape-of-ethereum-a-six-year-study-of-topological-anomalies/25902) and documented in their [open-source repository](https://github.com/Simplex-TDA/ETH-Anomaly-Detection/blob/main/Article/Shape_of_Ethereum-Full_Article.md), researchers analyzed 2,191 consecutive days of Ethereum transaction history (2020-2025) using Topological Data Analysis (TDA).

By converting daily transaction flows into multi-dimensional spatial shapes and calculating their 1-Wasserstein geometric distance, their model flagged 86 major structural anomalies. When cross-referenced against historical events, 73 out of 86 (84.9%) aligned with real-world shocks, frequently serving as an early-warning signal days before public headlines.

This analysis synthesizes data from 10 primary sources to explore how high-dimensional geometry provides new insight into blockchain analytics, protocol risk management, and market intelligence.

---

## 1. Why Volume and TVL Miss Structural Shifts

Traditional blockchain analytics rely on scalar aggregates: Total Value Locked (TVL), daily active addresses, transaction throughput (TPS), or gas consumption. 

However, scalar metrics count how much activity occurred, but cannot describe how that activity was structurally distributed across the network.

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
  <div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 1: Scalar Volume vs. Topological Graph Structure</div>
  <svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
    <!-- Background Grid -->
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-opacity="0.05" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="320" fill="transparent"/>
    <rect width="800" height="320" fill="url(#grid)" />

    <!-- Left Box: Scalar View -->
    <g transform="translate(40, 30)">
      <rect width="330" height="260" rx="12" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5"/>
      <text x="165" y="32" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="700" fill="currentColor">Scalar View (Volume / TPS)</text>
      <text x="165" y="52" text-anchor="middle" font-family="system-ui" font-size="11" fill="currentColor" fill-opacity="0.6">Disconnected Cloud of Retail Transfers</text>
      
      <!-- Random Disconnected Nodes -->
      <circle cx="80" cy="110" r="6" fill="#3b82f6"/>
      <circle cx="140" cy="90" r="5" fill="#3b82f6"/>
      <circle cx="210" cy="120" r="7" fill="#3b82f6"/>
      <circle cx="270" cy="100" r="5" fill="#3b82f6"/>
      <circle cx="100" cy="180" r="6" fill="#3b82f6"/>
      <circle cx="180" cy="200" r="5" fill="#3b82f6"/>
      <circle cx="250" cy="170" r="6" fill="#3b82f6"/>

      <!-- Thin Edges -->
      <line x1="80" y1="110" x2="140" y2="90" stroke="#3b82f6" stroke-width="1" stroke-opacity="0.4"/>
      <line x1="180" y1="200" x2="250" y2="170" stroke="#3b82f6" stroke-width="1" stroke-opacity="0.4"/>

      <text x="165" y="240" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#3b82f6">Result: Gas = $10M | Vol = $500M</text>
    </g>

    <!-- Right Box: Topological View -->
    <g transform="translate(430, 30)">
      <rect width="330" height="260" rx="12" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5"/>
      <text x="165" y="32" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="700" fill="currentColor">Topological View (TDA)</text>
      <text x="165" y="52" text-anchor="middle" font-family="system-ui" font-size="11" fill="currentColor" fill-opacity="0.6">Tightly Coupled Liquidation Loop (H1 Void)</text>

      <!-- Central Loop Nodes (MakerDAO, Aave, Uniswap Bots) -->
      <polygon points="165,95 245,140 215,215 115,215 85,140" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
      
      <!-- Nodes -->
      <circle cx="165" cy="95" r="8" fill="#ef4444"/>
      <circle cx="245" cy="140" r="8" fill="#ef4444"/>
      <circle cx="215" cy="215" r="8" fill="#ef4444"/>
      <circle cx="115" cy="215" r="8" fill="#ef4444"/>
      <circle cx="85" cy="140" r="8" fill="#ef4444"/>

      <!-- Interconnecting Heavy Edges -->
      <line x1="165" y1="95" x2="245" y2="140" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="245" y1="140" x2="215" y2="215" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="215" y1="215" x2="115" y2="215" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="115" y1="215" x2="85" y2="140" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="85" y1="140" x2="165" y2="95" stroke="#ef4444" stroke-width="2.5"/>

      <!-- Inner Loop Label -->
      <text x="165" y="160" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#ef4444">H1 Loop Hole</text>

      <text x="165" y="240" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#ef4444">Result: High Fragility Anomaly Flag</text>
    </g>
  </svg>
</div>

Consider two scenarios:

1. **Decentralized Retail Distribution:** 100,000 retail traders independently transfer $100 to centralized exchanges during a market rally. The result is a sparse, disconnected cloud of simple peer-to-peer transfers.
2. **Systemic Liquidation Cascade:** 50 automated liquidation keeper bots execute 10,000 rapid, multi-hop transactions across [MakerDAO collateral vaults](https://forum.makerdao.com/t/black-thursday-response-next-steps/1701), [Aave lending pools](https://aave.com), and [Uniswap liquidity pools](https://uniswap.org) to prevent protocol insolvency.

Both events might register identical gas usage ($10M) and transaction volume ($500M). Yet Event 1 represents organic retail flow, whereas Event 2 represents a tightly coupled liquidation loop during protocol stress. 

As demonstrated in research by [Ofori-Boateng et al. (2021)](https://arxiv.org/abs/2106.01806), scalar metrics cannot differentiate between these states. Topological Data Analysis maps the spatial geometry of the underlying transaction graph to reveal these structural differences.

---

## 2. The Mathematical Pipeline: From Raw Logs to Metric Spaces

To convert daily Ethereum transactions into a structural signal, Prasma and Keller constructed a four-stage topological pipeline.

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
  <div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 2: Vietoris-Rips Filtration and Persistence Diagram Mapping</div>
  <svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
    <!-- Step 1: Small Radius r1 -->
    <g transform="translate(30, 20)">
      <rect width="220" height="200" rx="10" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="currentColor">Scale r = 0.1 (Isolated Nodes)</text>

      <circle cx="60" cy="80" r="16" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="60" cy="80" r="3" fill="#10b981"/>

      <circle cx="140" cy="70" r="16" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="140" cy="70" r="3" fill="#10b981"/>

      <circle cx="100" cy="140" r="16" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="100" cy="140" r="3" fill="#10b981"/>

      <text x="110" y="180" text-anchor="middle" font-family="system-ui" font-size="11" fill="currentColor" fill-opacity="0.7">H0 = 3 Clusters | H1 = 0 Loops</text>
    </g>

    <!-- Arrow 1 -->
    <path d="M 260 120 L 280 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Step 2: Medium Radius r2 -->
    <g transform="translate(290, 20)">
      <rect width="220" height="200" rx="10" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="currentColor">Scale r = 0.4 (Loop Born)</text>

      <circle cx="60" cy="80" r="45" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="1.5"/>
      <circle cx="140" cy="70" r="45" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="1.5"/>
      <circle cx="100" cy="140" r="45" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="1.5"/>

      <line x1="60" y1="80" x2="140" y2="70" stroke="#f59e0b" stroke-width="2"/>
      <line x1="140" y1="70" x2="100" y2="140" stroke="#f59e0b" stroke-width="2"/>
      <line x1="100" y1="140" x2="60" y2="80" stroke="#f59e0b" stroke-width="2"/>

      <circle cx="60" cy="80" r="3" fill="#f59e0b"/>
      <circle cx="140" cy="70" r="3" fill="#f59e0b"/>
      <circle cx="100" cy="140" r="3" fill="#f59e0b"/>

      <text x="110" y="180" text-anchor="middle" font-family="system-ui" font-size="11" fill="#f59e0b" font-weight="600">H1 Loop Birth (r = 0.4)</text>
    </g>

    <!-- Arrow 2 -->
    <path d="M 520 120 L 540 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>

    <!-- Step 3: Persistence Diagram -->
    <g transform="translate(550, 20)">
      <rect width="220" height="200" rx="10" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="currentColor">Persistence Diagram</text>

      <!-- Axes -->
      <line x1="40" y1="160" x2="180" y2="160" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
      <line x1="40" y1="160" x2="40" y2="45" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.5"/>
      <!-- Diagonal -->
      <line x1="40" y1="160" x2="180" y2="45" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="3"/>

      <!-- H1 Persistence Point -->
      <circle cx="100" cy="75" r="5" fill="#ef4444"/>
      <text x="110" y="70" font-family="system-ui" font-size="10" font-weight="700" fill="#ef4444">H1 (Birth 0.4, Death 0.9)</text>

      <text x="110" y="175" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor" fill-opacity="0.6">Birth Scale (r)</text>
    </g>
  </svg>
</div>

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

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
  <div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 3: Layer Rotation Breakdown (2020-2021 vs. 2024 vs. 2025)</div>
  <svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
    <!-- 2020-2021 -->
    <g transform="translate(40, 30)">
      <rect width="220" height="180" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="currentColor">2020-2021: DeFi Era</text>
      
      <rect x="20" y="45" width="180" height="24" rx="4" fill="#ef4444" fill-opacity="0.8"/>
      <text x="30" y="61" font-family="system-ui" font-size="11" font-weight="600" fill="#fff">highInput (Liquidation Bots)</text>

      <rect x="20" y="75" width="160" height="24" rx="4" fill="#f59e0b" fill-opacity="0.8"/>
      <text x="30" y="91" font-family="system-ui" font-size="11" font-weight="600" fill="#fff">medInput (DEX Swaps)</text>

      <rect x="20" y="105" width="40" height="24" rx="4" fill="#3b82f6" fill-opacity="0.4"/>
      <text x="30" y="121" font-family="system-ui" font-size="11" fill="currentColor">nonFactory</text>

      <rect x="20" y="135" width="30" height="24" rx="4" fill="#10b981" fill-opacity="0.4"/>
      <text x="30" y="151" font-family="system-ui" font-size="11" fill="currentColor">simple_txs</text>
    </g>

    <!-- 2024 -->
    <g transform="translate(290, 30)">
      <rect width="220" height="180" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="currentColor">2024: Institutional ETF Era</text>

      <rect x="20" y="45" width="30" height="24" rx="4" fill="#ef4444" fill-opacity="0.3"/>
      <rect x="20" y="75" width="40" height="24" rx="4" fill="#f59e0b" fill-opacity="0.3"/>

      <rect x="20" y="105" width="175" height="24" rx="4" fill="#3b82f6" fill-opacity="0.9"/>
      <text x="30" y="121" font-family="system-ui" font-size="11" font-weight="600" fill="#fff">nonFactory (11/16 Events)</text>

      <rect x="20" y="135" width="20" height="24" rx="4" fill="#10b981" fill-opacity="0.4"/>
      <text x="30" y="151" font-family="system-ui" font-size="11" fill="currentColor">simple_txs (1 Event)</text>
    </g>

    <!-- 2025 -->
    <g transform="translate(540, 30)">
      <rect width="220" height="180" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.15"/>
      <text x="110" y="25" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="currentColor">2025: Macro Financial Era</text>

      <rect x="20" y="45" width="10" height="24" rx="4" fill="#ef4444" fill-opacity="0.2"/>
      <rect x="20" y="75" width="30" height="24" rx="4" fill="#f59e0b" fill-opacity="0.3"/>
      <rect x="20" y="105" width="30" height="24" rx="4" fill="#3b82f6" fill-opacity="0.3"/>

      <rect x="20" y="135" width="180" height="24" rx="4" fill="#10b981" fill-opacity="0.9"/>
      <text x="30" y="151" font-family="system-ui" font-size="11" font-weight="600" fill="#fff">simple_txs (14 Events)</text>
    </g>
  </svg>
</div>

- **2020-2021:** Ethereum operated as a DeFi-native network. Anomalies were driven by automated liquidation bots, flash loans, and DEX arbitrage.
- **2024:** Ethereum shifted toward an institutional asset class. The `nonFactory` layer dominated as ETF custodians (Coinbase Custody), institutional multi-sigs, and corporate treasuries executed direct smart contract interactions.
- **2025:** Ethereum operated as a global macro financial asset. Plain ETH transfers (`simple_txs`) dominated anomaly counts, reflecting sensitivity to US Federal Reserve policy, Treasury yields, and global technology equity shifts.

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
