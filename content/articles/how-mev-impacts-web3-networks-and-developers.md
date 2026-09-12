---
title: How MEV Impacts Web3 Networks and Developers
image: /images/brian-kostiuk-S4jSvcHYcOs-unsplash.jpg
data-ai-hint: mev network developer
description: >-
  How maximal extractable value arises from transaction ordering, who captures it,
  where it harms users, and what application developers can and cannot mitigate.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-12'
---

Maximal extractable value (MEV) is the value available to a party that can influence which transactions enter a block and in what order. On Ethereum, this includes value extracted by including, excluding, or reordering transactions beyond ordinary block rewards and gas fees, as [ethereum.org defines MEV](https://ethereum.org/en/developers/docs/mev/). The earlier term, miner extractable value, reflected proof-of-work block production. Ethereum validators now propose blocks, but the ability to affect ordering, and the value attached to it, remains.

MEV is neither synonymous with fraud nor limited to Ethereum. It follows from shared, stateful execution. One transaction can change a price, collateral ratio, inventory balance, or eligibility condition; the result of the next transaction then depends on its position. Automated market makers, lending protocols, NFT sales, bridges, and some governance systems all have transaction-ordering dependencies.

This article is for developers designing contracts and transaction flows, product teams setting execution expectations, and users trying to understand why a wallet quote is not a guarantee. Ethereum provides the main examples, but rollups face the same question. A rollup may have a sequencer rather than a decentralized set of proposers, yet somebody still receives an order, chooses its place, and can observe the value created by that choice.

## Transaction order is application behavior

A signed Ethereum transaction specifies a sender, a contract call, and fee parameters. It does not reserve a particular slot in a future block. When a user broadcasts a transaction to the peer-to-peer network, nodes commonly retain it in a transaction pool, or mempool, before a builder selects it. Other participants can inspect the call data, compare it with current chain state, and simulate its outcome.

Consider a constant-product pool. A large trade changes the pool reserves and its marginal price. A searcher that sees the trade before it executes can calculate whether buying first and selling after the user's trade is profitable. The chain can execute all three transactions exactly as written. The user's worse price results from ordering rather than a stolen key or a broken contract.

Gas fees affect inclusion incentives, but they are not a universal ordering guarantee. A higher priority fee can make a public transaction more attractive than a similar one, yet builders value combinations of transactions, bundles, and direct payments. A transaction can be delayed, replaced, dropped by a node, or lose to a privately submitted bundle. For a price-sensitive contract call, ordering and latency are adversarial inputs, not background implementation details.

The foundational [*Flash Boys 2.0* paper](https://arxiv.org/abs/1904.05234) documented bots bidding against each other for priority through escalating fees, which the authors called priority gas auctions. These auctions produced network load and losing on-chain attempts. Much competition now occurs through private order-flow channels, but that change does not remove MEV. It changes who can inspect an opportunity and how the right to order it is sold.

## Searchers, builders, relays, and validators

**Users** submit ordinary transactions or use a private endpoint. Their intent is often conditional: swap only if output exceeds a minimum, mint only while supply remains, or liquidate only if an account is unhealthy.

**Searchers** monitor public state and, in some cases, private order flow for opportunities. They write transactions or bundles to execute arbitrage, liquidations, or other strategies. A bundle can express a required transaction sequence and the conditions under which it should be included. Competition is intense because a successful transaction usually eliminates the opportunity.

**Builders** receive public mempool transactions and may receive user transactions and searcher bundles directly. They simulate combinations and construct a block intended to maximize its value. In the [Flashbots Auction architecture](https://docs.flashbots.net/flashbots-auction/overview), searchers send bundles to builders, which aggregate them with ordinary transactions. This is a privileged position: Flashbots notes that builders with raw transaction visibility can front-run or censor. Private routing therefore changes a user's trust boundary; it does not make transaction content unknowable to every intermediary.

**Relays** sit between builders and validators in the widely used MEV-Boost workflow. They validate and hold payloads, return blinded headers and bids to proposers, then release the full payload after the proposer commits. Relays are not consensus participants, but their availability, privacy policy, and connections affect transaction routing. Using several providers can reduce dependence on one service while adding operational complexity.

**Validators** act as block proposers in proof-of-stake Ethereum. A proposer may build locally or select an external payload with the highest bid. The consensus protocol verifies a block's validity, but it does not choose a fair ordering for every application action. [Proposer-builder separation](https://ethereum.org/en/roadmap/pbs/) aims to separate specialized block construction from block proposal, reducing the need for every validator to operate sophisticated MEV infrastructure.

The division of labor lets smaller validators receive competitive bids without operating arbitrage systems. It can also concentrate power. Builders with better connectivity, simulation systems, and exclusive order flow can bid more, receive more proposer connections, and gain more order flow. Validator stake alone does not capture the risk: concentration can also arise in builders, relays, private endpoints, and censorship policies.

## MEV strategies have different consequences

**Arbitrage** corrects a price difference between venues. A searcher buys where an asset is cheaper and sells where it is more expensive, often atomically so that both legs succeed or both revert. This commonly moves fragmented market prices closer together. It is MEV because the profit depends on obtaining the required transaction position, but it can improve the market users encounter.

**Liquidation** is an explicit lending-protocol incentive. If a borrower's collateral no longer satisfies the protocol's rules, a liquidator can repay debt and receive collateral, often with a stated bonus. Prompt liquidation can protect lenders and keep debt solvent. The design concern is the trigger: an unsafe oracle, a bonus that is too small to attract execution, or insufficient liquidity can each defeat the intended protection. Ethereum's [MEV documentation](https://ethereum.org/en/developers/docs/mev/#mev-examples-liquidations) explains why searchers compete to find eligible accounts first.

**Sandwiching** is harmful to the targeted trader. A searcher buys before a visible, market-moving swap, lets that swap raise the automated market maker price, and sells after it. The trade may still satisfy the user's slippage limit, but the user receives a worse outcome than they would without the inserted transactions. The searcher's profit is not necessarily identical to the user's loss because fees and pool mechanics also matter, but the strategy monetizes the user's price impact.

**Displacement**, sometimes called generalized front-running, copies a visible profitable call and substitutes the searcher's address or parameters. A public mint, claim, or arbitrage can be vulnerable if the contract rewards the first equivalent caller and does not bind the action to an authorized recipient. This is a protocol-design issue as much as a network-speed issue.

**Oracle manipulation** can combine temporary price movement with ordering. A protocol that reads a thin on-chain spot price and immediately permits borrowing or a reward calculation may allow an attacker to move a price, invoke the vulnerable function, and reverse the move in one atomic sequence. The academic [oracle systematization](https://arxiv.org/abs/2106.00667) describes the wider trust and market-manipulation problem. MEV makes an ordering-sensitive attack easier to package; it does not replace the need for an economically sound oracle.

## Effects on users and networks

For users, MEV affects execution quality, cost, certainty, and privacy. A wallet quote is calculated from a state snapshot. Between signing and inclusion, another transaction can change that state. Slippage protection lets the user specify a minimum output or maximum input; it does not promise the quoted price. A wide tolerance can turn a bad fill into a valid transaction.

Public priority races can also raise fees and consume blockspace through failed attempts. Private submission can prevent public mempool observers from copying a transaction and can make some payments conditional on inclusion. It is not an absolute defense. Builders, relays, and endpoints that see the raw transaction retain information that could be misused or could be subject to censorship.

MEV also reaches the consensus layer. If the value in a past block materially exceeds the reward for building on the chain tip, participants may have an incentive to reorganize history to capture it. *Flash Boys 2.0* identified this class of consensus risk, and Ethereum's [overview of MEV effects](https://ethereum.org/en/developers/docs/mev/#the-bad) discusses block reorganization incentives. The existence of the incentive does not mean every valuable block will be reorganized; it means protocol security analysis must account for unusually valuable ordering opportunities.

## Design for adversarial ordering

Developers should review each state-changing external call for ordering dependence. Ask whether another caller benefits by inserting a transaction before it, after it, or in its place. Test these sequences with realistic pool state, flash liquidity, and multi-call atomic transactions. This analysis belongs in economic testing and integration testing, not only in a launch checklist.

For swaps and other price-sensitive calls, enforce user bounds such as `amountOutMin`, `amountInMax`, and a deadline. Bind the recipient where an observer must not be able to replace it. Explain that a deadline stops stale execution, not a sandwich in the same block. Private order flow may reduce public exposure, but the product should state its privacy scope, failure behavior, and censorship assumptions.

Commit-reveal schemes can help for sealed bids, votes, games, and allocations. A participant first submits a hash of a choice and secret, then reveals both later; the contract verifies the hash. The design hides the choice during the commitment phase, but it introduces a reveal deadline and a policy for non-reveals. It also cannot hide facts leaked by transaction timing, amounts, or a small set of possible choices.

Do not use a manipulable spot price as the only input to a high-value decision. Select an oracle design appropriate to the asset and risk, validate freshness, and consider caps, circuit breakers, or time-weighted observations where their lag is acceptable. A time-weighted price raises the cost of a short-lived manipulation, but does not make an illiquid market trustworthy.

For first-come, first-served sales or claims, make the policy explicit. A public "first caller wins" rule rewards latency and order-flow access. If the product needs a different fairness property, use a different mechanism: allowlists, randomized allocation with verifiable rules, batches, or commit-reveal. Each adds costs in complexity, sybil resistance, capital lockup, or user friction.

Measure actual execution. Record quotes, user limits, inclusion time, revert reasons, and realized outputs using privacy-conscious telemetry. Compare outcomes against a suitable reference price and investigate unexpected reverts, failed private submissions, abnormal slippage, and liquidations around oracle updates. A metric alone does not prove sandwiching, but it can identify where an ordering risk has become a user problem.

## Mitigations and their limits

Private transaction submission is the most immediate response to public-mempool front-running. Flashbots describes its auction as a private channel for communicating preferred transaction order, including sealed bids and bundles. Its own [trust assumptions](https://docs.flashbots.net/flashbots-auction/overview#trust-assumptions) make clear that current systems are not completely trustless, private, or permissionless. "Not broadcast publicly" is a narrower claim than "hidden from every party before inclusion."

Batch auctions reduce the benefit of being one transaction earlier by collecting orders over an interval and clearing under a shared rule. They defer execution and need careful partial-fill logic. They can also relocate MEV to the party that clears the batch or selects a solver.

Intent systems let a user state an outcome, such as a maximum input and minimum return, while a solver proposes a route. They can improve routing and price execution, but solvers and the auction that chooses them become part of the system's trust and competition model. Settlement constraints must be verifiable, and surplus allocation should be clear to users.

Encrypted or threshold-encrypted mempools attempt to hide transaction contents until ordering is fixed. They face latency, decryption coordination, denial-of-service, and key-management constraints. Encryption also cannot remove MEV based on public state after execution, such as an arbitrage that responds to a confirmed price change.

Proposer-builder separation can reduce the consensus-layer pressure for validators to optimize block construction. It cannot decide whether an application exposes a user to a sandwich attack or guarantee a diverse builder market. Ethereum describes the current Builder API approach as an interim design with additional trust assumptions. Application teams still own their contract's ordering rules.

## FAQ

### Is all MEV harmful?

No. Arbitrage and liquidations can support market pricing and lending solvency. Sandwiching and displacement create a worse outcome for a specific user. MEV describes value from ordering power; its effects depend on the strategy and contract rules.

### Does a higher gas fee guarantee first position?

No. It can make a public transaction more competitive, but builders optimize whole blocks and may receive private bundles or direct payments. A higher fee can cost more without securing the intended order.

### Can a contract eliminate MEV?

Usually not. A contract can reduce a particular ordering dependency, cap user harm, or replace a first-come rule with a different allocation mechanism. Public state, changing prices, and scarce blockspace still create opportunities to react to execution.

### What should a developer do before launch?

Map calls whose outcomes depend on price, inventory, time, or caller order. Test insert-before, insert-after, and replacement scenarios; add explicit user protections; use an oracle that matches the protocol's risk; and document the remaining execution assumptions. Do not describe a product as MEV-protected merely because it avoids the public mempool.
