---
term: "Sandwich Attack"
slug: "sandwich-attack"
category: "security"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80"
description: "An MEV exploit where an attacker observes pending transactions and strategically places their own transactions before and after to profit from price movements."
relatedTerms: ["mev", "front-running", "mempool", "security"]
synonyms: ["frontrun-backrun", "MEV attack", "transaction ordering"]
---

**Sandwich attacks** profit from transaction ordering. Alice submits swap transaction on Uniswap: wants to swap 1 ETH for USDC. Sandwich attacker sees pending transaction in mempool. Attacker submits transaction first: buys ETH, drives price up. Alice's transaction executes at worse price (more USDC required). Attacker's second transaction executes: sells ETH at higher price, profits. Alice overpays. Attacker profits from "sandwiching" Alice's transaction. Sandwich attacks cost users millions annually. Most DeFi transactions are susceptible. Fixing sandwich attacks is major research area.

## Sandwich Attack Mechanics

Step-by-step:

**1. Observe**: Attacker sees Alice's pending swap in mempool.

**2. Front-Run**: Attacker submits buy transaction BEFORE Alice's swap, buying same asset, driving price up.

**3. Victim Executes**: Alice's swap executes at worse price (price already moved up by attacker's front-run).

**4. Profit**: Attacker's second transaction executes AFTER, selling at higher price, capturing difference.

**5. Profit Calculation**: Attacker profits from price movement caused by sandwich.

Sandwich attacks are MEV extraction through transaction ordering.

## Sandwich Attack Example

Concrete example:

ETH/USDC pool: 100 ETH, 200,000 USDC. ETH price = $2,000.

Alice wants to buy 10 ETH (should pay ~$20,000 USDC).

Attacker:
1. Buys 5 ETH (pays ~$9,804 USDC). Pool now: 95 ETH, 209,804 USDC. Price: $2,208.
2. Alice buys 10 ETH (pays ~$20,735 USDC). Pool now: 85 ETH, 230,539 USDC. Price: $2,712.
3. Attacker sells 5 ETH (receives ~$13,560 USDC). Pool now: 90 ETH, 216,979 USDC.

Attacker profit: $13,560 - $9,804 = $3,756.
Alice loss: $20,735 - $20,000 = $735.

Attacker profits at Alice's expense.

## Sandwich Attack Scale

Real impact:

**Daily Cost**: Billions annually lost to sandwich attacks and MEV.

**User Loss**: Average user loses small amount per transaction.

**Whale Impact**: Large trades lose more (higher slippage).

**Protocol Impact**: Some protocols lose significant revenue to sandwich attacks.

Sandwich attacks are massive economic problem in DeFi.

## Sandwich Attack Vulnerabilities

Where attacks occur:

**Public Mempools**: Bitcoin and Ethereum expose pending transactions. Obvious target.

**DEXs**: Any DEX with public mempool vulnerable.

**Auctions**: Batch auctions vulnerable if transactions visible before batching.

**Bridges**: Some bridge transactions vulnerable.

Most DeFi transactions vulnerable to sandwich attacks.

## Sandwich Attack Defenses

Mitigation strategies:

**Private Mempools**: Hide pending transactions from public. Flashbots Relay model.

**MEV-Burn**: Require attackers to burn MEV extraction profits.

**Intent-Based**: Users specify intents not transactions. Solvers execute, preventing sandwich ordering.

**Encrypted Mempools**: Encrypt transactions until after ordering.

**Threshold Encryption**: Encrypt until threshold reached, deterministic ordering.

**Slippage Protection**: Fail transaction if price worse than threshold (prevents extreme sandwich).

Different defenses have different tradeoffs.

## Career Opportunities

MEV creates roles:

**MEV Researchers** studying attack patterns earn $130,000-$320,000+.

**Security Engineers** building MEV defenses earn $120,000-$300,000+.

**Protocol Designers** creating sandwich-resistant protocols earn $130,000-$320,000+.

**Searchers** finding profitable MEV opportunities earn $100,000-$500,000+ (variable).

**Flashbots Engineers** building MEV infrastructure earn $130,000-$320,000+.

## Best Practices

Protecting against sandwich attacks:

**Slippage Limits**: Set strict slippage limits preventing extreme overpayment.

**Private Transactions**: Use private relay (Flashbots) preventing public mempool exposure.

**Batch Swaps**: Split large swaps into smaller chunks reducing MEV.

**Off-Peak Trading**: Trade during lower MEV periods when fewer searchers active.

**Intent Markets**: Use intent-based systems when available.

## The Future of Sandwich Attacks

Evolution:

**Better Defenses**: More protocols implementing MEV-resistant mechanisms.

**Encrypted Execution**: Encrypted execution engines preventing sandwich attacks.

**Intent-Based Dominance**: Shift toward intent-based systems reducing ordering attacks.

**Encrypted Mempools**: More chains moving toward encrypted mempools.

**MEV Redistribution**: Fair MEV distribution mechanisms benefiting users.

## Prevent Sandwich Exploitation

Sandwich attacks are serious MEV problem affecting DeFi users. Understanding sandwich attacks helps you protect your transactions. If you're interested in MEV or DeFi security, explore [MEV careers](/) at Flashbots and protocol teams. These roles focus on building fair, sandwich-resistant trading.
