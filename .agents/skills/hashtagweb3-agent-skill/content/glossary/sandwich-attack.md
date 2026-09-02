---
term: Sandwich Attack
slug: sandwich-attack
category: security
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80'
description: >-
  An MEV exploit where an attacker observes pending transactions and
  strategically places their own transactions before and after to profit from
  price movements.
relatedTerms:
  - mev
  - front-running
  - mempool
  - security
synonyms:
  - frontrun-backrun
  - MEV attack
  - transaction ordering
---

Sandwich Attack refers to a form of MEV exploitation where a malicious actor monitors pending blockchain transactions and strategically positions their own trades immediately before and after a target transaction to extract profit from the resulting price movement. When a user submits a large swap on a decentralized exchange like Uniswap, an attacker can front-run by purchasing the same asset first, artificially inflating its price, then back-run by selling immediately after the victim's trade executes at a worse rate. This manipulation has become common across DeFi. The attack exploits the transparent nature of public mempools combined with the ability to pay higher gas fees for transaction priority. Understanding sandwich attacks and their prevention mechanisms is essential knowledge for smart contract auditors, protocol designers, and MEV researchers.

## Sandwich Attack Mechanics

Step-by-step:

- **1. Observe**: Attacker sees Alice's pending swap in mempool.

- **2. Front-Run**: Attacker submits buy transaction before Alice's swap, buying the same asset, driving the price up.

- **3. Victim Executes**: Alice's swap executes at a worse price due to the attacker's front-run.

- **4. Profit**: Attacker's second transaction executes after, selling at a higher price, capturing the difference.

- **5. Profit Calculation**: Attacker profits from price movement caused by the sandwich.

Sandwich attacks are MEV extraction through transaction ordering.

## Sandwich Attack Example

Concrete example:

ETH/USDC pool: 100 ETH, 200,000 USDC. ETH price = $2,000.

Alice wants to buy 10 ETH.

Attacker:
1. Buys 5 ETH. Pool now: 95 ETH, 209,804 USDC. Price: $2,208.
2. Alice buys 10 ETH. Pool now: 85 ETH, 230,539 USDC. Price: $2,712.
3. Attacker sells 5 ETH. Pool now: 90 ETH, 216,979 USDC.

Attacker profit: $13,560 - $9,804 = $3,756. Alice loss: $20,735 - $20,000 = $735.

Attacker profits at Alice's expense.

## Sandwich Attack Scale

Real impact:

- **Daily Cost**: Significant amounts lost to sandwich attacks and MEV.

- **User Loss**: Average user loses a small amount per transaction.

- **Whale Impact**: Large trades lose more due to higher slippage.

- **Protocol Impact**: Some protocols lose revenue to sandwich attacks.

Sandwich attacks are an economic problem in DeFi.

## Sandwich Attack Vulnerabilities

Where attacks occur:

- **Public Mempools**: Bitcoin and Ethereum expose pending transactions.

- **DEXs**: Any DEX with a public mempool is vulnerable.

- **Auctions**: Batch auctions are vulnerable if transactions are visible before batching.

- **Bridges**: Some bridge transactions are vulnerable.

Most DeFi transactions are vulnerable to sandwich attacks.

## Sandwich Attack Defenses

Mitigation strategies:

- **Private Mempools**: Hide pending transactions from the public.

- **MEV-Burn**: Require attackers to burn MEV extraction profits.

- **Intent-Based**: Users specify intents, preventing sandwich ordering.

- **Encrypted Mempools**: Encrypt transactions until after ordering.

- **Threshold Encryption**: Encrypt until a threshold is reached, allowing deterministic ordering.

- **Slippage Protection**: Fail transactions if the price is worse than a set threshold.

Different defenses have different tradeoffs.

## Career Opportunities

MEV creates roles:

- **MEV Researchers** studying attack patterns.

- **Security Engineers** building MEV defenses.

- **Protocol Designers** creating sandwich-resistant protocols.

- **Searchers** finding profitable MEV opportunities.

- **Flashbots Engineers** building MEV infrastructure.

## Best Practices

Protecting against sandwich attacks:

- **Slippage Limits**: Set strict slippage limits to prevent overpayment.

- **Private Transactions**: Use private relay to prevent public mempool exposure.

- **Batch Swaps**: Split large swaps into smaller chunks to reduce MEV.

- **Off-Peak Trading**: Trade during lower MEV periods when fewer searchers are active.

- **Intent Markets**: Use intent-based systems when available.

## The Future of Sandwich Attacks

Evolution:

- **Better Defenses**: More protocols implementing MEV-resistant mechanisms.

- **Encrypted Execution**: Encrypted execution engines preventing sandwich attacks.

- **Intent-Based Dominance**: Shift toward intent-based systems reducing ordering attacks.

- **Encrypted Mempools**: More chains moving toward encrypted mempools.

- **MEV Redistribution**: Fair MEV distribution mechanisms benefiting users.

## Prevent Sandwich Exploitation

Sandwich attacks are a serious MEV problem affecting DeFi users. Understanding sandwich attacks helps protect transactions. If you're interested in MEV or DeFi security, explore [MEV careers](/) at Flashbots and protocol teams. These roles focus on building fair, sandwich-resistant trading.
