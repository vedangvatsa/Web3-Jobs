---
term: "Intent-Based Architecture"
slug: "intent-based-architecture"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80"
description: "A blockchain design where users specify intents (what they want) rather than transactions (exact steps), allowing solvers to find optimal execution paths."
relatedTerms: ["mev", "dex", "order-book", "solver"]
synonyms: ["intent execution", "solver-based execution", "intent framework"]
---

**Intent-based architecture** lets users specify intents (desired outcomes) rather than transactions (exact execution paths). Traditional: User submits transaction "swap 1 ETH for USDC". Intent-based: User specifies "I want 2000 USDC, willing to pay up to 1 ETH". Solvers compete to fulfill intent finding best execution path. Intents enable solvers to optimize: find best DEX prices, combine swaps, route through protocols. Better execution than user finding path manually. Intent-based systems enable MEV elimination—solvers extract value, not validators. Solvers are new class of infrastructure replacing traditional sequencers. Intent-based architecture represents potential major shift in DeFi.

## Intent Specification

What intents look like:

**Simple Intent**: "Swap 1 ETH for at least 2000 USDC"

**Complex Intent**: "Borrow 1000 USDC at <5% APY, use to buy tokens X and Y with portfolio weights 60/40"

**Time-Based**: "Swap 1000 USDC to 0.5 ETH, execute by tomorrow"

**Conditional**: "If ETH drops below $1500, buy 1 ETH"

**Composable**: Chain intents enabling complex strategies

Intents are flexible way to express desires.

## Solver Mechanism

How solvers work:

**Intent Pooling**: Users submit intents to intent pool (like mempool).

**Solver Competition**: Multiple solvers observe intents, compete for fulfillment.

**Optimization**: Each solver finds best execution path for intent.

**Bid Submission**: Solvers submit bids including execution path and value transfer to user.

**Auction**: Intents allocated to highest bidder (most value for user).

**Execution**: Winning solver executes intent on-chain.

Solver competition drives value to users.

## Intent-Based Examples

Real implementations:

**CoW Protocol**: Batch auction using intent-like orders (CoW = Coincidence of Wants).

**MEV Burn**: Fairness-driven solver selection burning MEV.

**Uniswap Intent Router**: Research exploring intent routing.

**Flashbots Threshold Encryption**: Private intent submission with decryption.

**Anoma**: Protocol-level intent settlement (research stage).

Intent-based systems emerging across DeFi.

## Benefits Over Traditional

Comparing approaches:

| Aspect | Traditional | Intent-Based |
|--------|-----------|--------------|
| **Execution** | User chooses | Solvers optimize |
| **MEV** | Validators extract | Solvers compete (burned) |
| **Front-Running** | Possible | Prevented (solver picks) |
| **UX** | Complex routing | Simple intent |
| **Cost** | User pays slippage | Competition drives value |
| **Customization** | Limited | Flexible |

Intent-based offers significant advantages.

## Intent Privacy

Confidentiality considerations:

**Private Intent Submission**: Encrypt intents preventing observation before solving.

**Threshold Encryption**: Decrypt only after committed to solution.

**Trusted Execution**: Use TEEs (Trusted Execution Environments) for confidential solving.

**Privacy Preservation**: Prevent MEV by hiding intents until commitment.

Privacy critical for intent-based systems to prevent sniping.

## Challenges

Obstacles:

**Solver Centralization**: If few solvers, concentration risk.

**Intent Complexity**: Complex intents hard to express and solve.

**Latency**: Solving intents adds latency vs immediate execution.

**Solver Trust**: Must trust solvers execute intents as specified.

**Standardization**: Need standards for expressing and comparing intents.

Intent-based architecture still research stage with open challenges.

## Career Opportunities

Intent-based systems create roles:

**Protocol Designers** designing intent systems earn $140,000-$340,000+.

**Solver Engineers** building solvers earn $130,000-$320,000+.

**Cryptographers** enabling privacy earn $150,000-$380,000+.

**Researchers** studying intent systems earn $140,000-$340,000+.

**Smart Contract Engineers** implementing intents earn $120,000-$300,000+.

## Best Practices

Using intent systems:

**Express Clearly**: Make intents as specific as possible.

**Monitor Solvers**: Understand solver reputation and incentives.

**Privacy**: Use encrypted submissions when available.

**Fallbacks**: Have backup execution plan if intent unfulfilled.

## The Future of Intent-Based

Evolution:

**Standardization**: Industry standards for intent expression.

**Cross-Chain**: Intents spanning multiple chains.

**Decentralized Solvers**: More distributed solver networks.

**Privacy Default**: Encrypted intents becoming standard.

**Mainstream Adoption**: Shift from transactions to intents.

## Express Desired Outcomes

Intent-based architecture enables users to specify outcomes rather than execution paths. Solvers compete to optimize execution. Revolutionary potential for MEV elimination and UX improvement. If you're interested in solver infrastructure or MEV, explore [MEV careers](/) at solver teams and protocol research. These roles focus on next-generation execution infrastructure.
