---
term: Based Sequencing
slug: based-sequencing
category: technical
difficulty: advanced
image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
description: Based sequencing is a rollup design where Layer 1 validators act as the sequencer, allowing Layer 2 transactions to be included directly in L1 blocks. This approach eliminates the need for a separate sequencer operator, reducing trust assumptions and improving decentralization.
relatedTerms:
  - sequencer
  - rollup
  - layer-2
  - proposer-builder-separation
  - preconfirmation
synonyms:
  - L1-sequenced rollup
  - Ethereum-based sequencing
  - Native sequencing
---

Based Sequencing is a rollup architecture where Ethereum Layer 1 validators act as the transaction sequencer instead of relying on a dedicated centralized or decentralized sequencing mechanism. In this model, users submit their Layer 2 transactions directly to the Ethereum mempool, where L1 block proposers include and order these transactions within their blocks. This design allows rollups to inherit Ethereum's existing decentralization, censorship resistance, and liveness guarantees while maintaining scalability benefits. Taiko is one of the first major implementations of based sequencing. By eliminating the trust assumptions associated with centralized sequencers, based rollups offer stronger security alignment with Ethereum's validator set. Engineers and researchers with expertise in based sequencing architectures are increasingly sought after as more rollup projects explore this approach to achieve greater decentralization without sacrificing performance.

## How Based Sequencing Works

In a based rollup, the sequencing process follows these steps:

1. **Transaction Submission**: Users submit L2 transactions to the Ethereum mempool (or a specialized mempool) with appropriate fee incentives.
2. **Block Proposer Selection**: An Ethereum L1 validator is selected to propose the next block through the standard consensus process.
3. **Transaction Inclusion**: The proposer includes L2 transactions in their L1 block alongside regular L1 transactions.
4. **State Transition**: The rollup's state transition function processes the included transactions in the order they appear in the L1 block.
5. **Settlement**: The L2 state root is updated and the rollup state is finalized according to the rollup's proof mechanism (optimistic or ZK).

The key innovation is that **L2 transaction ordering is determined by L1 block proposers**, not by a separate sequencer. This means the rollup inherits Ethereum's validator rotation, stake distribution, and consensus guarantees.

## Benefits of Based Sequencing

Based sequencing offers several advantages over traditional sequencer models:

- **Decentralization**: No single sequencer operator controls transaction ordering. Sequencing is distributed across Ethereum's entire validator set.

- **Censorship Resistance**: Censoring L2 transactions requires censoring at the L1 level, which is significantly more difficult due to Ethereum's decentralized validator set and social accountability mechanisms.

- **Simplified Architecture**: Rollups don't need to build, maintain, or decentralize their own sequencer infrastructure, reducing technical complexity and operational overhead.

- **Reduced Trust Assumptions**: Users don't need to trust a separate sequencer entity. They only need to trust Ethereum's L1 consensus, which they are already trusting for settlement.

- **MEV Alignment**: MEV extraction from L2 transactions flows to Ethereum validators rather than a separate sequencer operator, better aligning incentives with L1.

- **Cost Efficiency**: Users only pay L1 gas fees for inclusion and rollup-specific fees for state updates.

## Challenges and Tradeoffs

While based sequencing offers strong decentralization, it comes with several tradeoffs:

- **Slower Confirmations**: Transactions must wait for L1 block inclusion, whereas centralized sequencers can provide instant soft confirmations. This makes based rollups less suitable for latency-sensitive applications like high-frequency DeFi trading or gaming.

- **No Preconfirmations**: Without a sequencer committing to future state, users can't get fast guarantees about transaction inclusion or ordering before L1 finalization.

- **MEV Competition**: L2 transactions in the L1 mempool are visible to searchers and builders, potentially exposing users to sandwich attacks and other MEV extraction that centralized sequencers could prevent through private mempools.

- **Higher Costs**: L1 block space is more expensive than off-chain sequencer processing, so based rollups may have higher per-transaction costs, especially during periods of high L1 congestion.

- **Limited Throughput**: Based rollups are constrained by L1 block space and gas limits, potentially limiting their throughput compared to rollups with high-performance sequencers.

## Based Rollups vs Traditional Sequencers

| Aspect | Based Sequencing | Centralized Sequencer | Decentralized Sequencer |
|--------|------------------|----------------------|------------------------|
| **Decentralization** | Fully decentralized (L1 validators) | Centralized (single operator) | Partially decentralized (committee) |
| **Confirmation Time** | ~12 seconds (L1 block time) | <100ms (soft confirmation) | 1-3 seconds (committee consensus) |
| **Censorship Resistance** | Very high (L1-level) | Low (operator can censor) | Medium (committee can collude) |
| **MEV Protection** | Limited (public mempool) | High (private mempool possible) | Medium (depends on design) |
| **Infrastructure Cost** | Low (reuses L1) | Medium (single server) | High (distributed network) |
| **Trust Assumptions** | Minimal (only L1) | High (trust sequencer) | Medium (trust committee) |

## Implementations and Projects

Several projects are exploring or implementing based sequencing:

- **Taiko**: One of the first based rollups, Taiko uses Ethereum validators for sequencing and focuses on being a "Type-1" (Ethereum-equivalent) ZK-rollup.

- **Spire**: A based rollup optimized for DeFi applications, accepting slightly slower confirmations in exchange for maximal decentralization.

- **Rollkit**: A modular rollup framework that supports based sequencing as one of its sequencing options.

- **Existing Rollups Considering Migration**: Several established rollups have discussed transitioning to based sequencing in the future, though they currently use centralized or partially decentralized sequencers.

The based sequencing model is still relatively early, with most implementations in testnet or early mainnet stages.

## Hybrid Models and Future Developments

To address the latency limitations of pure based sequencing, researchers are exploring hybrid models:

- **Based + Preconfirmations**: L1 validators could offer preconfirmations for L2 transactions by staking collateral that gets slashed if they don't include the transaction in their next proposed block.

- **Lookahead Sequencing**: Users could submit transactions to future block proposers, potentially getting faster guarantees.

- **Based + Fast Finality Layers**: Combining based sequencing with separate fast finality mechanisms that provide quick confirmations while still settling to the based L2 state.

- **Multi-Rollup Sequencing**: Based sequencing could enable native atomic composability between multiple based rollups, as they all share the same L1 sequencing layer.

These innovations aim to preserve the decentralization benefits of based sequencing while improving user experience through faster confirmations.

## Career Opportunities in Based Sequencing

As based rollups mature, demand is growing for engineers and researchers specializing in this architecture:

- **Based Rollup Protocol Engineers** design and implement based rollup systems, working on state transition functions, proof generation, and L1 integration.

- **MEV Researchers** study MEV dynamics in based rollups, developing strategies to protect users and optimize validator incentives.

- **Rollup Infrastructure Engineers** build supporting infrastructure like specialized mempools, RPC nodes, and monitoring tools for based rollups.

- **Blockchain Economists** model the economic incentives and game theory of based sequencing, including fee markets and validator behavior.

Career growth in this field requires deep understanding of Ethereum's consensus layer, rollup technologies, and mechanism design.

## Best Practices for Based Rollup Users

When interacting with based rollups:

- **Expect Slower Confirmations**: Plan for ~12-second confirmation times rather than instant feedback. Based rollups aren't suitable for latency-critical applications.

- **Use MEV Protection Tools**: Consider using private RPC endpoints, transaction batching, or MEV-protection services to reduce exposure to sandwich attacks.

- **Monitor L1 Gas Prices**: Your L2 transaction costs will correlate with L1 gas prices, so time transactions during periods of low L1 congestion when possible.

- **Understand Finality**: Based rollup transactions inherit Ethereum's finality guarantees. Transactions are probabilistically final after a few blocks and absolutely final after checkpoint finalization.

- **Use Decentralization**: Take advantage of the censorship resistance. Based rollups are ideal for applications where decentralization is paramount, even at the cost of some latency.

## The Future of Based Sequencing

Based sequencing represents a commitment to decentralization and alignment with Ethereum's values. As the technology matures and hybrid models emerge to address latency concerns, based rollups could become the dominant architecture for rollups prioritizing censorship resistance and minimal trust.

The success of based sequencing will depend on solving the preconfirmation challenge, managing MEV dynamics, and demonstrating that users value decentralization enough to accept longer confirmation times. If these challenges can be addressed, based rollups may become the standard for truly decentralized Layer 2 scaling.

- **Ready to build on based rollups?** Explore Taiko, study Ethereum's proposer-builder separation, and contribute to the next generation of decentralized scaling solutions.
