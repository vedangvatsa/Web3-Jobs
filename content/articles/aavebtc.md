---
title: Aave raises Bitcoin and Ether borrowing limits across V3 and V4
ogTitle: "AAVE RAISES BITCOIN, ETHER BORROWING LIMITS"
description: >-
  Governance proposal 536 lifted maximum loan-to-value ratios for WBTC and cbBTC
  to 81% on V3 Ethereum Core and raised V4 Main Spoke collateral factors, based
  on a LlamaRisk calibration against two years of price data.
image: /images/news/aavebtc.jpg
imageCaption: "A physical Ethereum coin. Photo: Ivan Radic via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg
category: News
data-ai-hint: physical ethereum coin closeup
publishedDate: '2026-10-30'
lastUpdated: '2026-10-30'
---

Aave raised borrowing limits for bitcoin- and ether-linked collateral across its V3 and V4 markets on Oct. 28, lifting the maximum loan-to-value ratio for WBTC and cbBTC on the V3 Ethereum Core market to 81% from 73%. The changes took effect through governance proposal 536, authored by risk provider LlamaRisk and implemented by Aave Labs, [according to a Defiant report carried by KuCoin](https://www.kucoin.com/news/flash/aave-raises-bitcoin-and-ether-collateral-borrowing-limits-on-v3-and-v4).

That report said Aave's governance record lists all three payloads as executed, and it linked the Ethereum transaction that implemented the V3 and V4 changes at 5:35 a.m. ET on Oct. 28. The higher Core limits let WBTC and cbBTC borrowers take on about 11% more debt against the same collateral valuation, the report calculated. More borrowing capacity does not by itself create a loan; borrowers still have to draw it.

Loan-to-value caps how much a user can borrow against supplied collateral. The liquidation threshold marks the point at which a position becomes eligible for liquidation. On Ethereum Core the gap between the two for WBTC and cbBTC narrows from five percentage points to four. A position backed only by either token and drawn to the new maximum would hit the liquidation boundary after a collateral price decline of about 4.7%, compared with 6.4% under the previous settings, the report calculated, holding debt value fixed and excluding accrued interest.

## The parameter changes

The V3 changes cover Ethereum Core, Arbitrum and Base. On Base, cbBTC's liquidation bonus, the extra collateral paid to liquidators, falls to 6% from 7.5%, and the Base cbBTC Stablecoins efficiency mode, which applies to borrowing GHO and USDC, rises to 82% loan-to-value and an 85% liquidation threshold. On Arbitrum, WBTC moves to 78% loan-to-value and an 82% threshold. On the V4 Ethereum Main Spoke, collateral factors rise from 83% to 84% for WETH, from 80% to 82% for wstETH, from 80% to 81% for weETH, and from 78% to 85% for WBTC and cbBTC, applied as a dynamic configuration update, [the report said](https://www.kucoin.com/news/flash/aave-raises-bitcoin-and-ether-collateral-borrowing-limits-on-v3-and-v4).

The cushion does not narrow everywhere. On Core, WETH's gap between loan-to-value and liquidation threshold widens from 2.5 percentage points to three, as do the gaps for wstETH and weETH, according to the same report.

## How LlamaRisk sized the thresholds

LlamaRisk published its [risk assessment](https://governance.aave.com/t/arfc-revision-of-eth-btc-collateral-efficiency-on-aave/25649) as an Aave governance proposal on Sept. 16. The firm calibrated each threshold against two years of historical price behavior and Chainlink price feed updates, spanning the February 2025 and October 2025 stress events. Each threshold is sized to the 99.9th percentile of the worst excursion inside a one-hour window, the period over which positions clear through sequential liquidation calls, measured at the reserve's liquidation bonus.

Ether remains materially more volatile than bitcoin in that dataset, with two-year annualized volatility of 68.8% against 44.4% and deeper excursion tails at every window. The one-hour 99.9th percentile excursion is -11.85% for ether and -5.09% for bitcoin on the binding leg. The realized worst one-hour moves over the two years were -24.27% and -11.15% respectively, the proposal stated. LlamaRisk set WETH at the model ceiling for its liquidation threshold and placed wstETH and weETH one point inside theirs, while keeping the bitcoin settings at least three points inside the ceiling as margin against depth, cap, and concentration risks the price model does not capture.

Both stress events inside the calibration window cleared with negligible bad debt. February 2025 produced no recognized deficit at all, and October 2025 produced $0.39 million against roughly $128 million, without affecting the ether- and bitcoin-family collateral across deployments, [the assessment said](https://governance.aave.com/t/arfc-revision-of-eth-btc-collateral-efficiency-on-aave/25649). On Ethereum Core in the February event, the median lag between a price publication and the liquidation it triggered was 24 seconds, and 95% of seized volume cleared within a minute.

The residual scenario outside the calibration basis is a stalled oracle and liquidation pipeline coinciding with a move beyond the 99.9th percentile, LlamaRisk wrote. Reaching it would require both systems to stall together through the worst 0.1% hour of the two-year record, which did not happen in either stress event.

LlamaRisk disclosed that it is a DeFi risk service provider funded in part by the Aave DAO and is not directly affiliated with the protocol. The ARFC moved to snapshot voting on Sept. 21, with voting scheduled to begin within 24 hours.
