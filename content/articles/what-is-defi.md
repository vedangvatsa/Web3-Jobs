---
title: What is DeFi? A Beginner's Guide to Decentralized Finance
image: /images/carl-heyerdahl-KE0nC8-58MQ-unsplash.jpg
description: >-
  DeFi (Decentralized Finance) rebuilds financial services on blockchain networks using smart contracts. Learn how lending, trading, and stablecoins work, who it is for, and the risks to weigh before you use it.
category: Industry Insights
data-ai-hint: defi explained
publishedDate: '2026-03-11'
lastUpdated: "2026-08-27"
---

DeFi is a set of financial applications built on public blockchains that run through smart contracts instead of banks, brokers, or exchanges. A smart contract is a program at a blockchain address that holds funds and executes when its conditions are met, and no one can change it after deployment except through its coded governance. On Ethereum, where most DeFi operates, this means you can lend, borrow, trade, and create dollar-pegged assets without handing custody to an intermediary.

Ethereum describes the model directly: in DeFi a smart contract replaces the financial institution in the transaction, and contracts are public for anyone to inspect and audit.

## What DeFi is

DeFi covers lending, borrowing, trading, stablecoin issuance, and related services that live on programmable blockchains, primarily Ethereum and its Layer 2 networks. Users keep control of keys in a self-custody wallet and interact directly with contracts. That is different from centralized finance, or CeFi, where a company holds your funds and can approve, delay, or reverse transfers.

Traditional finance relies on trusted intermediaries. A bank holds deposits, pays part of the interest to savers and keeps a spread, checks credit, and manages compliance. An exchange holds custody, matches orders, and charges fees for settlement and custody. DeFi replaces that trust in institutions with verification of code and collateral.

## Who it is for

**People who want self-custody and permissionless access.** If you have internet access and a self-custody wallet, you can use DeFi without an ID check or credit score. That matters where banking access is limited, or where you want to keep custody instead of leaving funds on an exchange.

**Active crypto users and traders.** If you hold ETH or stablecoins and want to earn interest by supplying them, borrow against them, or swap tokens without an order book, DeFi provides those tools. You trade directly against pool liquidity and pay a fee to liquidity providers.

**Builders and career switchers evaluating Web3 roles.** If you are considering work as a Solidity developer, smart contract auditor, protocol engineer, or on-chain analyst, DeFi is where those skills are tested. You will need to read contract code, understand risk parameters, and use tools like Foundry, Hardhat, and on-chain explorers.

It is a poor fit if you need deposit insurance, guaranteed redemption, or help recovering a mistaken transfer. DeFi has no bank support desk and no regulator that will reimburse a bug or a phishing loss. If you are uncomfortable managing keys and verifying contract addresses, use a regulated custodian first and start with small test amounts.

## How it works

### Smart contracts replace intermediaries

A smart contract on Ethereum is an account with code and storage at a specific address. It has a balance and can receive transactions. Unlike a user account controlled by a private key, it runs exactly as coded. The ethereum.org smart contract docs compare it to a vending machine: with the right inputs you get a guaranteed output, and no vendor can change the rules after deployment.

Contracts are composable. Because they share the same language and address format on Ethereum, you can lend on one protocol and use the receipt token in another app in the same transaction. Lending pools issue aTokens that track your deposit and interest, and you can swap that aToken elsewhere without withdrawing first.

### 1. Lending and borrowing with overcollateralization

Aave is the clearest example to learn from. Aave is a non-custodial liquidity protocol where suppliers add assets to shared pools and earn interest, and borrowers draw from those pools by posting collateral that exceeds the loan amount. The docs at aave.com describe this as overcollateralization, which is required because DeFi does not use credit scores.

How it works in practice:

* You supply assets to a pool, for example USDC on Aave v3, and receive aTokens such as aUSDC that accrue interest in real time. Your aToken balance grows as interest accrues.
* Each asset has a loan-to-value ratio, or LTV, and a liquidation threshold. If ETH has a 80 percent LTV, $10,000 of ETH lets you borrow up to $8,000 of stablecoins.
* To stay safe you must keep your Health Factor above 1. Health Factor compares collateral value times threshold against debt. If collateral falls and Health Factor drops below 1, keepers can liquidate part of your position to repay lenders.
* Interest rates are utilization based. When more of a pool is borrowed, rates rise to attract suppliers and discourage borrowing. Some markets also offer a more predictable stable rate that governance can still adjust.

Concrete example: you deposit $15,000 of ETH as collateral at a 150 percent minimum ratio and borrow $8,000 of USDC. If ETH drops about 25 percent, your collateral falls near $11,250 and your position moves toward liquidation. The contract will sell part of your ETH at a discount to a liquidator to cover debt, plus a penalty. That is why borrowers usually keep a buffer well above the minimum.

Aave v3 runs on Ethereum mainnet and on multiple Layer 2s and sidechains, with different asset lists and risk parameters per network. Borrowers also use Aave to mint GHO, Aave's overcollateralized stablecoin, by paying an interest rate set by governance. Flash loans, an Aave innovation, let you borrow without collateral as long as you repay in the same transaction, which is used for arbitrage and for refinancing positions in one step.

### 2. Trading with automated market makers

Decentralized exchanges, or DEXs, let you trade without handing custody to a company. Uniswap is the most used DEX protocol. The Uniswap docs explain that it does not use an order book. It is an automated market maker, or AMM, a set of smart contracts that hold reserves of two ERC-20 tokens and quote prices from pool state.

The classic pricing rule from Uniswap v2 is x * y = k, where x and y are the two token balances and k stays constant. When you buy one token, you add the other, the ratio shifts, and the price updates. Traders interact with the pool, not with a counterparty order. Around that core, versions added concentrated liquidity in v3 and singleton pools with hooks in v4, which let providers place liquidity in a chosen price range for better capital efficiency.

If you provide liquidity you become a liquidity provider, or LP. You deposit both tokens in a pool and earn a share of swap fees. Pool fee tiers on Uniswap range from 0.05 percent to 1 percent depending on expected volatility. Fees accrue to LPs, and the protocol can enable a separate protocol fee through governance.

Three trade-offs to know:

* Impermanent loss. If the two token prices move apart after you deposit, you can end up with less value than if you had just held them. Fees can offset it, but not always.
* Slippage and price impact. Small pools or large trades move the price more. The app shows price impact before you sign.
* Gas cost. Swaps on Ethereum mainnet still pay gas, which can be $5 to $20 per transaction when the network is busy. Layer 2 deployments are cheaper but still require gas.

Anyone can list a token by creating a pool, which is why you must verify contract addresses from the official docs or a reputable token list before swapping.

### 3. Stablecoin issuance and stable swaps

DeFi needs dollar-pegged assets that do not rely on a bank. Two systems matter here: Sky Protocol, formerly MakerDAO, and Curve Finance.

**Sky and DAI/USDS.** MakerDAO launched in 2017 as a vault-based credit system for DAI. In August 2024 it introduced the Endgame rebrand to Sky Protocol and added USDS alongside DAI. Both are dollar-pegged stablecoins backed by the same collateral pool and convertible 1:1 through the SkyMoneyConverter contract at no fee and with no slippage. Sky's docs and public dashboards show the mechanics:

* You open a Vault, lock collateral such as ETH, staked ETH like wstETH, wrapped Bitcoin, or USDC via the Peg Stability Module, and generate DAI or USDS up to the asset's ceiling.
* Each collateral type has its own minimum ratio, stability fee, and debt ceiling. In 2026 public parameter tables show examples like 150 percent minimum for ETH at about 5.75 percent APR, 160 percent for wstETH at 6.25 percent, 130 percent for USDC at 4.50 percent, and 150 percent for wBTC at 6.00 percent. Governance can change these.
* You pay an annual stability fee on the debt. That fee funds the Sky Savings Rate and the surplus buffer.
* If collateral falls below the minimum, the position is liquidated. The protocol sells collateral to cover debt.

As of Q1 2026, circulating supply tracked by DeFiLlama and project dashboards was near $7.5 billion for USDS and $3.2 billion for DAI, with total collateral backing reported near $15.79 billion. The mix was about 40 percent real-world assets such as Treasury bills, about 35 percent USDC in the Peg Stability Module, and the rest in ETH and other crypto collateral. MKR, the original governance token, converts to the new SKY token at 1:24,000. DAI did not go away. It remains listed on most exchanges and in many DeFi pools.

**Curve for pegged assets.** Curve is a DEX and AMM optimized for assets that should trade near parity, like USDC, USDT, and DAI, or wrapped variants like stETH and ETH. The Curve docs describe two invariants: StableSwap for pegged assets and CryptoSwap for volatile pairs, now in next-generation NG contracts. Because the curve is flatter near parity, Curve can offer very low slippage and fees often below 0.1 percent for stable swaps, which is why other protocols route stable trades through Curve pools. Curve also issues crvUSD, an overcollateralized stablecoin with its own LLAMMA liquidation system, and runs a gauge system where veCRV voters direct CRV emissions to pools.

### 4. Other services: insurance and yield curation

Smart contract bugs can still cause loss, so some protocols sell cover that pays if a contract fails. Economics are straightforward: you pay a premium, a pool of capital takes the risk, and claims are assessed by governance or an oracle. Coverage is narrowly scoped to a contract and an event, and payouts are not guaranteed. Evaluate the claim process and exclusions before you pay for it.

## Current state in 2026: size, chains, and leading protocols

Total value locked, or TVL, is the dollar sum of all assets deposited in DeFi contracts at a moment, including lending pools, liquidity positions, and staking. DeFiLlama reports it by querying on-chain balances and pricing each token.

TVL moves with prices and with how you count categories. Use it as a directional gauge, not an exact bank balance. With that context:

* DeFiLlama's chain snapshot for mid-June 2026 put total TVL at $71.77 billion across 453 chains, down 37.3 percent year to date from $114.49 billion on January 1, 2026 and 59.6 percent below the November 2021 peak of $177.48 billion. The same aggregator showed about $81.37 billion thirty days earlier and $94.13 billion on March 20, 2026. Broader views that include liquid staking and restaking reported a higher range around $95 billion to $140 billion in April to May 2026. Ethereum held about 53.1 percent of TVL at $38.24 billion in the June snapshot, with BNB Chain, Solana, Tron, Bitcoin DeFi, and Base each near $4 billion to $5 billion.
* Daily DEX volume was about $7.20 billion on June 18, 2026, up 9.30 percent day over day even as TVL fell, which shows trading can decouple from locked capital.
* Stablecoin circulating supply was about $314 billion in mid-June 2026, about 4.4 times total DeFi TVL, which indicates most stablecoin capital sits outside DeFi contracts.

Leading protocols by category, with verification points:

| Protocol | Category | What it does and how it is measured |
| --- | --- | --- |
| Aave v3 | Lending | Largest lending market. Pools hold deposits and issue aTokens. TVL reported near $26.18 billion in mid-May 2026 on DeFiLlama across all chains, with higher historical prints near $69 billion in August 2025 when categorization included more affiliated markets. |
| Lido | Liquid staking | Lets users stake ETH and receive stETH that remains usable in DeFi. TVL near $23.07 billion in May 2026 and $15.17 billion in the June 18 snapshot, which reflects price-driven variation. |
| Uniswap | DEX | AMM that executes swaps against pooled reserves. Uniswap docs note open-source, non-upgradeable pool contracts and permissionless listing. Cumulative volume is in the trillions of dollars across versions, and the protocol regularly leads daily DEX volume. |
| Curve | Stablecoin DEX | StableSwap-based pools for pegged assets with low slippage, plus gauges and veCRV voting. Preferred venue for USDC/USDT/DAI swaps and routing. |
| Sky Protocol | Stablecoin issuance | Issues DAI since 2017 and USDS since August 2024, both convertible 1:1. Parameters include vault ratios and stability fees set by SKY governance. Supply near $8.7 billion for USDS and $4.7 billion for DAI in April 2026 per CoinMarketCap and project trackers. |

TVL peaked intraday at $237 billion in Q3 2025 per market trackers, then fell to about $86.3 billion in April 2026 after a $13 billion outflow linked to a restaking exploit, which shows how concentrated deposits can move fast.

## Pros and cons to weigh

**Permissionless access.** Anyone with a wallet and internet can supply, borrow, or swap without a bank account or broker. No custodian can freeze the contract itself, though front ends and stablecoin issuers may maintain compliance controls on their own interfaces.

**Transparency.** Contracts, balances, and collateral are public on chain. You can inspect code on Etherscan, verify the proxy and implementation, and read audits. That does not remove the need for technical review, but it makes independent checks possible.

**Composability and programmability.** Because DeFi products share Ethereum addresses and token standards, you can use an interest-bearing position as collateral elsewhere, automate strategies in a single transaction, or build new instruments without a new legal entity. Examples include delta-neutral stable positions and vaults that auto-rebalance.

**Self-custody.** You hold keys, not an exchange. That removes custodian failure but shifts key management to you.

**Smart contract and protocol logic risk.** Immunefi data put DeFi protocol losses at $680 million in 2025, up from $534 million in 2024 but still about 74 percent below the $2.62 billion peak in 2022. The median loss per incident fell to $1.5 million from $6 million, and 89 percent of 2025 losses came from protocol logic errors rather than generic bridge or oracle classes. A past audit is a snapshot of one commit. It does not cover later changes, key handling, or front-end compromise. Euler lost $197 million in March 2023 to a donation and liquidation logic bug even after audits.

**Collateral volatility and liquidation.** Overcollateralization helps lenders, but borrowers face auto-liquidation if prices drop. During sharp moves, liquidations can cascade and the discount paid to liquidators increases your loss.

**Fees and user experience.** Gas, price impact, failed transactions, and approval steps remain friction, especially for small amounts on mainnet. Layer 2s reduce fees by 5 to 20 times per ethereum.org scaling notes, but you must still manage bridging and finality delays.

**Regulatory uncertainty.** Rules for tokens, stablecoins, and lending differ by jurisdiction and are still being written under frameworks like the EU's MiCA and pending US stablecoin legislation. Some activities that are permissionless today could face geofencing or issuer-level restrictions later, and stablecoins such as USDS include compliance-related contract controls for institutional use.

**Scams and key risk.** Fake token contracts, phishing front ends that mimic real apps, unlimited token approvals, and single-key admin control have caused large losses. Bridge and admin key failures accounted for more than half of the $6.4 billion lost across 23 major incidents of $100 million or more between 2022 and mid-2026, per curated rekt.news and Chainalysis records. The $1.44 billion Bybit cold wallet compromise in February 2025, attributed to a supply-chain attack on its signing interface, was not a DeFi contract bug but shows how signing infrastructure matters.

## How to get started safely

### If you want to try DeFi with a small amount

1. **Set up a self-custody wallet and back up keys offline.** Use a hardware wallet if you plan to hold more than a test sum. Write the seed phrase on paper or metal, never screenshot it, and practice recovering on a second device before you fund it.

2. **Pick one chain and one well-known protocol to learn on.** For lending, start on Aave v3 on Ethereum or on a Layer 2 you already use. For swapping, start with Uniswap on the same network. Verify the URL from the official docs: app.aave.com, app.uniswap.org, curve.fi, sky.money. Check contract addresses on an explorer.

3. **Fund with a small test amount and do one full loop.** Deposit a small stablecoin amount, watch the aToken accrue, try a small borrow only if you understand Health Factor, then repay and withdraw. On a DEX, swap a small amount, review price impact and gas, and check the transaction succeeded. Keep your first total below what you can afford to lose.

4. **Set approvals to the minimum and revoke when done.** When a dApp asks for unlimited allowance, lower it to the amount you need. After you finish, revoke unused approvals with a tool like Revoke.cash and disconnect the site.

5. **Monitor risk and keep records.** Track Health Factor if you borrow, set a price alert well above liquidation, avoid borrowing near the max LTV, and export transaction history for taxes. In many jurisdictions, interest, swap gains, and liquidation losses are taxable events.

### If you are exploring DeFi as a career

1. **Learn to read contracts before you write them.** Work through ethereum.org smart contract introductions and the Aave and Uniswap docs. Practice the checks-effects-interactions pattern and the withdrawal pattern from the Solidity docs.

2. **Ship one auditable project.** Build a vault or a small AMM helper with Foundry tests, fuzz runs with `forge test --fuzz-runs 256`, and gas reports. Deploy to a testnet, verify on an explorer, and publish the repo with a clear README.

3. **Study one risk domain in depth.** Options include oracle design, liquidation math, or key management with multisig and timelock. Write a short postmortem of a real incident, such as Euler 2023 or a recent price manipulation case, with what the fix was and how you would test for it.

4. **Track hiring signals.** Teams hire for evidence of on-chain work, not just course completion. Contributions to docs, dashboards on Dune, or a small audit review carry more weight than a generic certificate.

## FAQ

**What is the simplest definition of DeFi?**
DeFi is financial software that runs on public blockchains through smart contracts, so users can lend, borrow, trade, and issue dollar-pegged assets without a bank or broker holding their funds.

**How is DeFi different from CeFi?**
In CeFi a company custodies funds and grants access under its terms, with customer support and, in some cases, regulatory cover. In DeFi you hold keys and interact directly with contracts that enforce rules in code, with public execution and no built-in reimbursement if code fails.

**Do I need to overcollateralize to borrow?**
Yes on overcollateralized markets like Aave. You lock more value than you borrow, for example $150 of ETH to borrow $100. Undercollateralized borrowing only exists inside a single transaction with flash loans, where you must borrow and repay atomically.

**Is DeFi cheaper than using a centralized exchange?**
It depends. Pool fees on DEXs start at 0.05 percent and go up to 1 percent by tier, which can be close to centralized exchange fees of about 0.1 percent. Gas on Ethereum mainnet can make small trades more expensive than on a centralized exchange. Layer 2s lower that cost, but you pay bridging and still consider slippage.

**Can I lose money providing liquidity?**
Yes. You can face impermanent loss if the two assets in a pool diverge, plus contract risk and token price risk. Fees help but may not cover a large divergence. Start with a stable pair on Curve if you want to study the mechanics with lower price divergence, and keep the amount small.

**Are DEX trades anonymous?**
No. Ethereum is pseudonymous. Every transaction is tied to an address and is visible on chain, and analytics firms map addresses to entities. You get privacy from not sharing your name with a custodian, not privacy from public ledger analysis.

**Is DAI the same as USDS?**
Both are dollar-pegged stablecoins from Sky Protocol, backed by the same collateral pool and exchangeable 1:1 via the official converter. DAI is the original since 2017. USDS launched August 27, 2024 under the Sky rebrand, with native access to the Sky Savings Rate. DAI remains in wide use on chains and in apps that have not migrated.

**Does an audit mean a protocol is safe?**
No. An audit reduces the chance of generic bugs and shows a team paid for review, but 89 percent of 2025 losses were protocol logic flaws specific to one app, per Immunefi. Check whether the code on chain matches the audited commit, whether admin keys are in a multisig with a timelock, whether there is a bug bounty, and whether the team has responded transparently to past incidents.

**What is impermanent loss in one sentence?**
It is the shortfall you get when the value of your share in a two-asset pool ends up less than the value of simply holding the two tokens outside the pool because prices moved apart while you were deposited.

**Is DeFi regulated?**
Partially and unevenly. Smart contracts themselves are permissionless, but stablecoin issuers, front ends, and fiat on-ramps often face securities, lending, or anti-money laundering rules. Frameworks like MiCA in the EU and proposed stablecoin bills in the US are shaping what issuers and custodians must do, which affects which assets and interfaces are available in your region.
