---
term: Proof of Burn
slug: proof-of-burn
category: blockchain-fundamentals
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A consensus or verification mechanism where participants destroy
  cryptocurrency to prove their commitment and earn rewards or rights,
  eliminating the need for computational work.
relatedTerms:
  - consensus
  - proof-of-work
  - proof-of-stake
  - blockchain
synonyms:
  - PoB
  - burn mechanism
  - token burning
lastUpdated: 2026-09-04
---

Proof of Burn, or PoB, is a consensus design in which participants permanently destroy tokens to obtain a chance to create blocks or another protocol right. The burned tokens are sent to an address with no usable private key, or to a contract that removes them from circulation. The transaction is visible on the chain, so the protocol can verify that the economic cost was paid. The intended idea is that a participant who has sacrificed value has an incentive to support the network.

## How It Works

A PoB protocol defines an accepted burn transaction and a formula for turning burns into mining or validation weight. A participant sends the required tokens to the designated unspendable address. Nodes check that the transaction follows the burn rules and record its amount and time. The consensus algorithm uses that record to select a block producer or calculate the producer's probability of selection.

The weight may be proportional to the amount burned, but a simple permanent total would favor the earliest and wealthiest participants indefinitely. Some systems therefore make burn weight decay over time. A participant must burn again to maintain influence. Other designs award a fixed right after a burn, use burns only during a launch phase, or require burning one token to earn a right on another chain.

Burning has a real cost because the sender cannot later withdraw the tokens. The cost is intended to make attacks expensive. In practice, security depends on the token's market value, how easily an attacker can buy it, the selection formula, and the cost of acquiring enough influence. Destroying a low-value or newly issued token may not provide much economic security.

## Concrete Example

Slimcoin was an early cryptocurrency that used proof of burn alongside other mechanisms. In its design, a holder could send Slimcoin to a provably unspendable address. The burn created a virtual mining stake called burn weight. That weight gave the holder a chance to create blocks for a period, with its influence declining as it aged.

Suppose two participants burned different amounts under a similar design. Alice burns 100 tokens and Bob burns 10 tokens at the same time. Alice receives more selection weight, so she is more likely to create a block and earn its reward. If the protocol makes burn weight decay, both must make another irreversible burn later to keep their relative influence. The exact probability, reward schedule, and decay rate are protocol-specific. There is no universal PoB formula.

## Limitations And Risks

PoB destroys capital rather than locking it. This can make participation unattractive because the participant cannot recover the tokens by leaving the network. Proof of stake usually locks assets that can be withdrawn later if the validator follows the rules. PoB has no equivalent of returning the original stake. Block rewards must compensate participants enough to justify repeated burns, but generous rewards can increase inflation or concentrate rewards among large burners.

Distribution is a persistent issue. People with more capital can burn more and gain more influence. A protocol can use caps or decay to limit this advantage, but those rules may create other incentives or be difficult to calibrate. If the burn token is also the reward token, a falling token price can weaken the cost of acquiring influence and reduce the security budget.

The label "burn address" needs care. An address is only provably unspendable if no one can know or derive its private key. A project-controlled address is not a burn address, even if its operator says the assets will not be used. Contract burns also rely on the contract code actually making the tokens unrecoverable.

PoB remains relatively uncommon as a primary consensus mechanism. Its security has received less operational testing than the major proof-of-work and proof-of-stake systems. A chain can also use burns as one component of a broader design, so a burn transaction alone does not reveal how consensus is secured.

## Relevant Distinctions

Proof of burn is different from ordinary token burning. Many projects burn fees, remove tokens from a treasury, or destroy tokens to reduce supply. Those actions may affect token economics but do not select block producers or secure consensus. PoB uses the verified destruction as an input to protocol rights.

It also differs from proof of work. Proof of work consumes electricity and hardware effort repeatedly to create a measurable cost. PoB consumes tokens once and uses that history as evidence of cost. Proof of stake locks tokens as collateral and can slash some of them for misconduct. In PoB, the initial cost is irreversible regardless of later behavior. These designs all seek to make network control costly, but their incentives, resource use, and withdrawal options differ.
