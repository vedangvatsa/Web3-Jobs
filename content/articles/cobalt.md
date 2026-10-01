---
title: Base Activates Cobalt Upgrade With Conditional Transactions
ogTitle: "BASE ACTIVATES COBALT UPGRADE WITH CONDITIONAL TRANSACTIONS"
description: Base put its third 2026 upgrade live on mainnet, adding Validity Transactions that wait for preset conditions plus new issuer controls for its B20 token standard.
image: /images/news/cobalt.jpg
imageCaption: "Coinbase CEO Brian Armstrong (center) with Tim Draper and Jason Calacanis in 2017. Photo: Steve Jurvetson via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Cryptocurrency%20Cachet%20(38552330941).jpg
category: News
data-ai-hint: Brian Armstrong Coinbase panel 2017
publishedDate: '2026-10-01'
lastUpdated: '2026-10-01'
---

Base activated its Cobalt upgrade on mainnet on Sept. 30, the third network upgrade of 2026 for the Coinbase-incubated Ethereum layer 2. The release brings Validity Transactions for traders and three additions to the chain's B20 token standard, [the Base engineering team wrote](https://blog.base.dev/cobalt).

Validity Transactions change how a signed transaction waits its turn. A user signs once and submits through a dedicated method, base_sendRawTransactionValidity, attaching conditions such as a minimum account balance, a value stored in a contract or a block-number deadline. The sequencer holds the transaction and checks the conditions against chain state as each block is built, so the trader does not need to poll or resend.

The team's worked example is a swap that should run only once a pool price clears 4,000 USDC and before block 1,157,000. While the price sits at 3,950 USDC the transaction stays ineligible. When the price reaches 4,011 USDC it qualifies, and inclusion lands in block 1,156,990 at a pool price of 4,012 USDC. Had block 1,157,000 arrived first, the transaction would never have been included at all.

Privacy is part of the pitch. Base says the setup keeps submissions private until they land, and the conditions themselves are not recorded on chain. Meeting the conditions still guarantees nothing: predicates are inclusion conditions, not a promise of a block slot or successful execution, [Unchained noted](https://unchainedcrypto.com/bases-cobalt-upgrade-lets-token-issuers-move-seized-balances-instead-of-burning-them/) in its reading of the developer docs. The trader picks the trade and sets the terms; the network only judges eligibility.

The most debated change concerns seized balances. Cobalt adds seizeWithMemo, which lets an administrator authorized by a token issuer reassign a holder's balance as a transfer carrying an on-chain memo. The record shows the source, the destination, the amount and the note, for example a recovery wallet receiving 500 shares marked with a ticket number.

Seizure is strictly opt-in per token. The function does nothing until an issuer names which holders can be seized and grants the permission to specific administrators. Base does not start or direct these transfers, and the docs describe the result plainly as a transfer rather than a burn. The new call supersedes burnBlocked from the earlier Beryl upgrade, which could only destroy a blocked holder's tokens and now sits deprecated though still callable.

Issuers also gain composite policies. Two to four existing allowlists or blocklists, including lists maintained by outside parties such as a KYC provider, can be combined with AND or OR logic. A fund token might demand both KYC clearance and accreditation, with each check read live from its source list at transfer time. Until now an issuer spanning several lists had to keep its own merged copy in sync with off-chain software, a copy that could drift out of date.

The third B20 piece handles corporate actions. Scheduled multiplier updates, aligned with the ERC-8056 standard, let an issuer set a multiplier change in advance and cancel it until it takes effect. A 2x split slated for Oct. 1 at 00:00 UTC would make wallets show 100 raw units as 200 shares, with no tokens minted or burned and transfers working exactly as before. Raw balances and transfer behavior stay untouched; only the displayed denomination moves.

Cobalt continues a run of upgrades this year. Azul arrived in May as Base's first independent upgrade after separating its cycle from the Optimism Superchain framework, and Beryl followed in June with the B20 standard itself, [The Crypto Times recounted](https://www.cryptotimes.io/2026/10/01/base-launches-cobalt-upgrade-with-new-trading-and-tokenization-tools/) in its coverage of the launch. B20 stays compatible with ERC-20 while adding issuer features, and Base has already used it for Coinbase-issued tokenized stocks backed by shares held with a regulated custodian.

The rollout was not just code. Base's status page listed a mainnet maintenance window from 18:00 to 20:00 UTC on Sept. 30, and the team flagged its X accounts the same day. Developers face real homework: indexers must move to the new B20 ABI for the hard fork, while issuers get updated best-practice guides for policy combinations, multiplier scheduling and authorized seizure flows.

What comes next is already sketched. Base plans 200-millisecond blocks, down from two seconds, alongside native smart-account support with gas sponsorship and transaction batching, plus developer-experience updates tracking a subset of Ethereum's Glamsterdam improvements.
