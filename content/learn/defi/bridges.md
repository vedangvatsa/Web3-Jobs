---
title: "Bridges and Cross-Chain Transfers"
description: "How tokens move between blockchains, why bridge hacks are the costliest in crypto, and how to evaluate bridge security."
order: 6
readTime: "7 min"
difficulty: "intermediate"
prerequisites: ["dexs"]
quiz:
  - question: "Why can't you simply send ETH from Ethereum to Solana?"
    options:
      - "Solana doesn't support ETH"
      - "Each blockchain is a separate ledger with no native ability to verify the state of another chain"
      - "ETH is only compatible with EVM chains"
      - "You need a special wallet"
    correct: 1
    explanation: "Blockchains are isolated state machines. Ethereum validators have no way to verify what happened on Solana, and vice versa. A bridge acts as the intermediary that locks tokens on one chain and issues equivalent tokens on the other."
  - question: "In a lock-and-mint bridge, what happens to your original ETH when you bridge it to Arbitrum?"
    options:
      - "It is destroyed and re-created on Arbitrum"
      - "It is locked in a smart contract on Ethereum, and a wrapped representation is minted on Arbitrum"
      - "It is converted to MATIC automatically"
      - "It is sent to the bridge operator's wallet"
    correct: 1
    explanation: "Your real ETH stays locked in a contract on Ethereum. On Arbitrum, the bridge mints 'Wrapped ETH' (a synthetic token that represents a claim on the locked ETH). When you bridge back, the wrapped token is burned and the original ETH is unlocked."
  - question: "Why have bridge hacks resulted in some of the largest losses in crypto history?"
    options:
      - "Bridges process more transactions than DEXs"
      - "Bridge contracts hold massive pools of locked assets — if the contract is exploited, the attacker gets everything in the pool"
      - "Bridges don't use smart contracts"
      - "Hackers prefer attacking bridges for ideological reasons"
    correct: 1
    explanation: "The Ronin Bridge hack ($625M, 2022) and Wormhole hack ($320M, 2022) both exploited the bridge's validation mechanism. Because bridges custody billions in locked tokens, a single vulnerability grants access to the entire pool."
  - question: "What is a validator-based bridge?"
    options:
      - "A bridge that uses the same validators as Ethereum"
      - "A bridge where a set of independent validators observe transactions on Chain A and sign attestations that Chain B uses to release funds"
      - "A bridge that requires no trust assumptions"
      - "A centralized exchange that operates on two chains"
    correct: 1
    explanation: "Validator bridges (like Wormhole's Guardian network) use a committee of validators who watch both chains. When enough validators confirm a deposit on Chain A, they produce a signed message that Chain B's contract accepts to release tokens. The security depends entirely on how many validators must be compromised."
  - question: "What is the safest way to bridge assets between Ethereum and an L2 like Arbitrum?"
    options:
      - "Use any third-party bridge for speed"
      - "Use the native (canonical) bridge operated by the L2 itself, which inherits Ethereum's security"
      - "Send tokens through a centralized exchange"
      - "There is no safe way"
    correct: 1
    explanation: "L2 native bridges (like Arbitrum's official bridge) settle transactions through Ethereum's own consensus. While slower (7-day withdrawal period for optimistic rollups), they inherit Ethereum's full security guarantees rather than relying on a separate set of validators."
---

## The Problem: Isolated Blockchains

Ethereum, Solana, Avalanche, and Arbitrum each maintain their own independent ledger. There is no built-in mechanism for one chain to verify what happened on another. If you hold ETH on Ethereum but want to use a DEX on Arbitrum, you need a way to move that value across chains.

This is what **bridges** do.

## How Lock-and-Mint Bridges Work

The most common bridge design:

1. **Lock:** You send 1 ETH to a bridge smart contract on Ethereum. The contract locks your ETH.
2. **Verify:** The bridge's off-chain validators (or relayers) observe the deposit and confirm it happened.
3. **Mint:** The bridge's contract on the destination chain (e.g., Arbitrum) mints 1 "Wrapped ETH" — a synthetic token that represents a claim on the locked ETH.
4. **Redeem:** When you want to return, you burn the wrapped token on Arbitrum. The bridge unlocks your original ETH on Ethereum.

The critical assumption: the wrapped token is only valuable if the locked ETH on Ethereum actually exists and the bridge contract is secure.

## Why Bridges Are the Biggest Hack Targets

Bridge contracts are honeypots. They custody enormous amounts of locked tokens in a single contract. If an attacker finds one vulnerability, they drain the entire pool.

| Bridge Hack | Date | Amount Stolen | Attack Vector |
|---|---|---|---|
| Ronin (Axie Infinity) | Mar 2022 | $625M | Compromised 5 of 9 validator keys |
| Wormhole | Feb 2022 | $320M | Forged a validation signature on Solana |
| Nomad | Aug 2022 | $190M | Faulty Merkle root allowed anyone to drain funds |
| Harmony Horizon | Jun 2022 | $100M | Compromised 2 of 5 multisig signers |

The pattern: most bridge hacks target the **validation layer** — the mechanism that decides whether a deposit on Chain A actually happened before releasing funds on Chain B.

## Bridge Architectures Compared

**Validator/Multisig Bridges** (e.g., Wormhole, Multichain): A committee of validators watches both chains. Security depends on how many validators an attacker must compromise. If only 2-of-5 signatures are needed (like Harmony), a single compromised team is enough.

**Optimistic Bridges** (e.g., Across, native L2 bridges): Assume transactions are valid unless challenged. A single honest watcher can flag fraud within a challenge window (typically 7 days). More secure but slower.

**ZK Bridges** (emerging): Use zero-knowledge proofs to mathematically verify a transaction occurred on Chain A without trusting any validators. This is the most trust-minimized approach but is still early-stage.

## Practical Advice

1. **Use native L2 bridges when possible.** The Arbitrum, Optimism, and Base native bridges inherit Ethereum's security. The trade-off is speed — optimistic rollup withdrawals take 7 days.
2. **For speed, use audited third-party bridges.** Across and Stargate have strong security track records. Always check their audit history.
3. **Never bridge more than you need.** Bridges are inherently riskier than staying on a single chain. Minimize exposure.
4. **Check wrapped token liquidity.** If a bridge is compromised, wrapped tokens become worthless instantly. Wrapped tokens with deep DEX liquidity are safer because you can exit faster.

## Key takeaways

- Bridges enable cross-chain transfers by locking tokens on one chain and minting representations on another.
- Bridge contracts hold massive pools of locked assets, making them the highest-value targets in crypto.
- Bridge security depends on the validation mechanism: multisig (weakest), optimistic (medium), ZK proofs (strongest).
- Native L2 bridges are the safest option for Ethereum-to-L2 transfers, at the cost of speed.
