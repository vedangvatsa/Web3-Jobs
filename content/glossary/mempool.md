---
term: Mempool
slug: mempool
category: technical
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80'
description: >-
  The memory pool where unconfirmed transactions wait before being included in
  blocks, visible to all network nodes and creating opportunities for MEV
  extraction.
relatedTerms:
  - gas-fee
  - mev
  - transaction
  - mining
synonyms:
  - transaction pool
  - tx pool
  - pending transactions
---

Mempool refers to the memory pool where unconfirmed blockchain transactions wait before being included in blocks, serving as a staging area visible to all network nodes. When you submit a transaction on Ethereum or Bitcoin, it first broadcasts to the peer-to-peer network where each node maintains its own mempool containing pending transactions. Miners and validators then select which transactions to include in the next block, typically prioritizing those with higher fees attached. This transparency creates opportunities for MEV extraction, where actors can observe pending transactions and strategically insert their own to profit. Services like mempool.space allow users to monitor Bitcoin's mempool in real time, helping them optimize transaction fees during periods of congestion. Understanding mempool mechanics is essential for blockchain developers, protocol engineers, and MEV researchers.

## How the Mempool Works

The mempool operates as a decentralized queue:

- **Transaction Broadcasting**: When you create and sign a transaction, your wallet broadcasts it to connected blockchain nodes. These nodes verify the transaction's validity (correct signature, sufficient balance, proper nonce) and, if valid, add it to their local mempool and relay it to peers.

- **Peer-to-Peer Propagation**: The transaction spreads through the network via gossip protocol. Within seconds, most nodes have received and stored the transaction in their mempool, though propagation isn't instantaneous.

- **Fee-Based Prioritization**: Nodes typically order their mempool by fee (gas price on Ethereum). When a validator is selected to propose a block, they fill it with the highest-fee transactions from their mempool.

- **Block Inclusion**: Once included in a block and that block is confirmed, the transaction is removed from all nodes' mempools. Until then, it remains pending.

- **Replacement and Expiration**: Transactions can be replaced (via RBF on Bitcoin or higher nonce transactions on Ethereum) or eventually dropped if fees are too low and they remain unconfirmed too long.

Mempools are local to each node; there is no single canonical mempool, though nodes tend to have similar contents due to transaction propagation.

## Mempool Visibility

Anyone can monitor the mempool, creating both opportunities and risks:

- **Public Transparency**: Services like Etherscan's pending transactions, Blocknative's mempool explorer, or running a full node let you see unconfirmed transactions. You can observe what trades are about to execute, what NFTs are being purchased, or what contracts are being deployed.

- **Strategic Implications**: This visibility enables:
- **Front-running**: Seeing a large buy order and submitting your own buy with higher fees to execute first.
- **Back-running**: Executing your transaction immediately after someone else's to profit from its effects.
- **Sandwich Attacks**: Front-running and back-running the same transaction to extract maximum value.
- **Just-In-Time Liquidity**: Adding liquidity right before a swap and removing immediately after.

- **Privacy Concerns**: Your transactions are visible before confirmation. Actors can infer strategies, holdings, or intentions from pending transactions.

- **MEV Industry**: An industry has emerged around mempool monitoring and transaction ordering, collectively called MEV (Maximal Extractable Value).

## Transaction Ordering

Who decides transaction order within blocks affects value distribution:

- **First-Come-First-Served (FCFS)**: Theoretically, transactions are ordered by arrival time. In practice, this is rarely true.

- **Fee-Based Ordering**: Validators maximize revenue by prioritizing higher-fee transactions. During congestion, this becomes an auction where users bid for block space.

- **MEV-Boost and Builders**: On Ethereum post-Merge, specialized "block builders" construct optimized blocks (including profitable MEV transactions) and bid to have validators include their blocks. This separates block construction from validation.

- **Private Transaction Pools**: Services like Flashbots, Eden, BloXroute offer private mempools where transactions aren't publicly broadcast until inclusion, preventing front-running.

- **Censorship and Selection**: Validators can choose which transactions to include, exclude, or order. While generally they maximize fees, other criteria might influence selection.

## Mempool Congestion

During high network activity, mempools overflow:

- **Fee Markets**: When demand exceeds block space, users bid against each other with higher fees. On Ethereum during NFT drops or market crashes, gas prices can spike significantly.

- **Transaction Delays**: Low-fee transactions remain pending for hours or days during congestion. Eventually, they're dropped and must be resubmitted with higher fees.

- **Network Degradation**: Extremely large mempools stress node resources. Nodes with limited memory might drop transactions arbitrarily.

- **Backlog Dynamics**: Once congestion starts, it can persist as users keep submitting new high-priority transactions, preventing the backlog from clearing.

- **Strategic Timing**: Users who must transact during congestion should monitor mempool size and adjust fees accordingly. Tools like EthGasStation or Blocknative provide fee estimates based on current mempool state.

## Transaction Replacement

Many blockchains allow replacing pending transactions:

- **Replace-By-Fee (RBF)**: Bitcoin's mechanism for replacing unconfirmed transactions by submitting a new transaction with the same inputs but higher fees.

- **Nonce Reuse**: On Ethereum, transactions have nonces (sequential numbers). Submitting a new transaction with the same nonce and higher gas price replaces the pending one.

- **Use Cases**: 
- Unsticking transactions with too-low fees.
- Canceling transactions (by replacing with a 0-value transaction to yourself).
- Updating transaction parameters if conditions change.

- **Risks**: Replacement isn't guaranteed; if the original transaction confirms before the replacement propagates, you've created two transactions.

## Mempool-Related Attacks

The visible mempool enables various attack vectors:

- **Front-Running**: Observing a profitable transaction (large DEX trade moving prices) and submitting your own transaction with higher fees to execute first.

- **Sandwich Attacks**: Placing transactions before and after a victim's trade, buying before to pump the price, then selling after the victim buys at the inflated price.

- **Uncle Bandit Attacks**: Exploiting blockchain reorganizations to steal value from invalidated blocks.

- **Time-Bandit Attacks**: Theoretical attacks where validators reorganize multiple blocks to extract MEV from past transactions.

- **Generalized Front-Running**: Automated bots monitoring mempools for any profitable transaction and attempting to exploit it.

These attacks are economically rational for profit-seeking actors but harm user experience and can be seen as unfair value extraction.

## MEV and Block Builders

Post-Ethereum Merge, the mempool changed:

- **PBS (Proposer-Builder Separation)**: Block construction is separated from block proposal. Builders compete to create the most profitable blocks (including MEV), bidding to have validators include their blocks.

- **Private Order Flow**: Sophisticated users and applications send transactions to builders privately via Flashbots Protect or similar services, avoiding public mempool exposure.

- **Builder Competition**: Multiple builders compete, theoretically ensuring validators get maximum revenue while users can opt into or out of MEV extraction.

- **Censorship Concerns**: Builders' power to include/exclude transactions raises censorship questions, especially as a few major builders dominate.

- **MEV Supply Chain**: Complex infrastructure has emerged, searchers find MEV opportunities, builders construct blocks, relays enable communication, validators propose blocks, each taking a cut of extracted value.

This evolved system is more efficient but more complex than simple fee-based transaction ordering.

## Monitoring the Mempool

Various tools provide mempool visibility:

- **Block Explorers**: Etherscan, Blockchain.com show pending transactions, though with limitations on freshness and completeness.

- **Specialized Services**: Blocknative, Eden Network, Flashbots provide detailed mempool analytics, real-time notifications, and historical data.

- **Full Nodes**: Running your own node gives complete control over mempool visibility, though requiring technical expertise and infrastructure.

- **Pending Transaction Bots**: Telegram or Discord bots alerting on specific pending transactions (whale trades, contract deployments, token transfers).

- **MEV Dashboards**: Services tracking MEV activity, showing successful front-runs, sandwiches, arbitrage opportunities, and value extracted.

For traders and protocols, mempool monitoring has become essential competitive intelligence.

## Career Opportunities

The mempool and MEV ecosystem create specialized careers:

- **MEV Searchers** write bots finding profitable opportunities in pending transactions. Successful searchers can earn significant annual incomes.

- **Block Builder Operators** run infrastructure constructing optimized blocks. These technical roles pay well at leading builder operations.

- **Smart Contract Engineers** building MEV-resistant protocols or MEV-capturing systems earn competitive salaries at DeFi protocols.

- **Quantitative Researchers** model mempool dynamics, MEV strategies, and transaction ordering at funds and researchers, typically earning competitive salaries.

- **Protocol Economists** design mechanisms minimizing harmful MEV while capturing beneficial MEV for protocols, earning competitive salaries.

- **Infrastructure Engineers** at mempool monitoring services build real-time data pipelines, paying competitive salaries.

## Privacy Solutions

Protecting against mempool exploitation:

- **Private Transaction Pools**: Flashbots Protect, Eden Network, and others offer transaction submission bypassing public mempool.

- **Threshold Encryption**: Proposals for encrypting transactions until included in blocks, only then decrypting. Preserves orderability without exposing content.

- **Submarine Sends**: Cryptographic techniques allowing transactions to commit to actions without revealing content until later.

- **Batch Auctions**: Collecting orders over time periods, revealing all simultaneously, preventing front-running within batches.

- **Time-Weighted Average Price (TWAP)**: Breaking large orders into many small ones over time reduces per-transaction front-running impact.

As MEV extraction has grown, privacy-preserving transaction submission has become important for serious traders and protocols.

## The Future of Mempools

Mempool architecture is evolving:

- **Encrypted Mempools**: Research into fully encrypted mempools where validators can order transactions without seeing content.

- **Fair Ordering**: Protocols attempting to define and enforce "fair" transaction ordering resistant to manipulation.

- **Cross-Domain MEV**: As multi-chain applications proliferate, MEV opportunities spanning multiple blockchains create complex extraction scenarios.

- **Regulatory Attention**: MEV and front-running are attracting regulator interest, potentially leading to requirements around transaction handling.

- **MEV Redistribution**: Mechanisms returning captured MEV to users or protocols rather than extractors/validators.

- **Application-Layer Solutions**: Apps building in MEV resistance at the smart contract layer rather than relying on mempool changes.

The mempool will remain an important but contested part of blockchain infrastructure.

## Best Practices

Working through the mempool effectively:

- **Monitor Gas Prices**: Check current mempool state before submitting transactions. Don't overpay or underpay for gas.

- **Use Private Pools for Sensitive Transactions**: If being front-run would be costly, use Flashbots Protect or similar services.

- **Set Appropriate Slippage Tolerance**: For DEX trades, slippage limits prevent sandwich attacks from excessive extraction.

- **Consider Timing**: If your transaction isn't time-sensitive, wait for low congestion periods to save on fees.

- **Understand Replacement**: Know how to replace or cancel stuck transactions on your blockchain.

- **Be Paranoid**: Assume actors are watching the mempool. Design strategies accordingly.

## Work through Blockchain Infrastructure

The mempool sits at the intersection of blockchain architecture, theory, and market microstructure. Understanding its dynamics is essential for anyone building applications, trading strategically, or working on blockchain infrastructure. If you're interested in blockchain systems, MEV, or protocol design, explore blockchain engineering opportunities at infrastructure providers, DeFi protocols, and MEV organizations. These roles require deep technical knowledge and offer substantial compensation for those who master the complex dynamics of transaction ordering and value extraction.
