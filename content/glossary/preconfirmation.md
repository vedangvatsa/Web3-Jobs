---
term: "Preconfirmation"
slug: "preconfirmation"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd58?w=1200&q=80"
description: "A commitment from validators or sequencers to include a transaction in an upcoming block, providing fast certainty before final confirmation."
relatedTerms: ["sequencer", "mev", "rollup", "confirmation"]
synonyms: ["preconf", "early commitment", "soft confirmation"]
---

**Preconfirmations (preconfs)** are commitments from validators or sequencers to include transactions in future blocks. Preconfs provide faster certainty than waiting for block inclusion. Example: Sequencer commits to including your transaction in next block. You know it will be included before block is published. Preconfs enable low-latency applications and better UX. They are being explored for Ethereum L1 and L2s. Understanding preconfs is important for latency-sensitive applications.

## How Preconfirmations Work

Mechanics:

**Commitment**: Validator or sequencer signs commitment to include transaction.

**Penalty**: If commitment violated, signer is slashed or penalized.

**Fast Response**: User receives preconf in milliseconds.

**Inclusion**: Transaction included in committed block.

Preconfs provide fast, credible commitments.

## Benefits

Advantages:

**Low Latency**: Near-instant transaction certainty.

**Better UX**: Improves user experience for interactive apps.

**MEV Mitigation**: Can reduce MEV by ordering transactions early.

**Predictability**: Users know execution price before finality.

Preconfs improve blockchain UX significantly.

## Preconf Risks

Challenges:

**Slashing Enforcement**: Must enforce penalties for violations.

**Centralization**: Preconf providers can become centralized.

**Partial Commitments**: Preconfs don't guarantee finality.

**Trust**: Users must trust preconf providers.

Preconfs add trust assumptions.

## Use Cases

Applications:

**DeFi Trading**: Fast confirmation for time-sensitive trades.

**Gaming**: Low-latency game actions.

**Payments**: Instant payment confirmation.

**NFT Minting**: Guarantee mint inclusion during high demand.

Preconfs suit latency-sensitive apps.

## L2 Preconfs

Rollup implementation:

**Sequencer Preconfs**: Sequencers commit to transaction ordering.

**Fast Finality**: Instant soft finality before L1 posting.

**UX Improvement**: Better than waiting for L1 finality.

L2s are natural fit for preconfs.

## Career Opportunities

Preconf roles:

**Protocol Engineers** earn $130,000-$320,000+.

**MEV Researchers** earn $140,000-$340,000+.

**Infrastructure Engineers** earn $120,000-$300,000+.

## Best Practices

Using preconfs:

**Check Penalties**: Ensure penalty mechanisms are strong.

**Monitor Violations**: Track preconf violation rates.

**Diversify Providers**: Use multiple preconf providers.

## The Future of Preconfirmations

Trends:

**L1 Preconfs**: Ethereum L1 preconf protocols.

**L2 Adoption**: More rollups offering preconfs.

**Standardization**: Industry standards for preconfs.

## Commit to Fast Inclusion

Preconfirmations provide fast transaction certainty before finality. They improve UX and enable new applications. If you're interested in UX or infrastructure, explore [infrastructure careers](/) at sequencer teams.
