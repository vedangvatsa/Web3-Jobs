---
title: VeChain Interstellar Hardfork Set for Sept 16
ogTitle: "VECHAIN INTERSTELLAR HARDFORK SET FOR SEPT 16"
description: >-
  VeChainThor activates its Interstellar upgrade on Sept. 16 at block
  25,902,540, adopting 11 Ethereum improvements to close its EVM compatibility
  gap in a single hardfork.
image: >-
  https://upload.wikimedia.org/wikipedia/commons/1/16/Marina_Bay_Singapore-3499.jpg
category: News
data-ai-hint: singapore marina bay night vechain foundation
publishedDate: '2026-09-15'
lastUpdated: '2026-09-15'
---

Tomorrow morning, VeChainThor rewrites its execution layer. The Interstellar hardfork activates Sept. 16 at block 25,902,540, packing 11 Ethereum improvements into one upgrade, according to a [Sept. 14 report by CoinTrust](https://www.cointrust.com/market-news/vechain-interstellar-upgrade-set-to-transform-thor-network). Holders do not need to move tokens or change contract addresses.

Interstellar closes a trilogy. Galactica rebuilt the network's EVM foundations and fee market. Hayabusa replaced consensus and tokenomics. Now Interstellar chases compatibility with the wider Ethereum ecosystem, VeChain said in its [official upgrade overview](https://vechain.org/vechain-renaissance-interstellar-sets-course). VIP-255 jumps the execution layer from Shanghai-era compatibility to improvements drawn from Ethereum's Cancun, Prague, and Osaka releases in a single step, avoiding several separate consensus-breaking upgrades.

The headline features serve developers directly. EIP-1153 brings transient storage: contracts hold temporary state through TLOAD and TSTORE instructions that clears after execution, cutting costs for patterns like reentrancy guards. On VeChainThor the storage lives and dies within a single clause. EIP-5656 adds MCOPY, a dedicated memory-copy instruction that simplifies common operations for modern Solidity and Vyper tooling. EIP-6780 tightens SELFDESTRUCT so contracts can only be deleted under narrow conditions, with creation and destruction judged inside the same clause. EIP-7939 adds a CLZ opcode that counts leading zero bits for math, compression, bitmaps, and zero-knowledge work.

Interstellar is the third act of a trilogy. Galactica rebuilt the network's EVM foundations and fee market. Hayabusa replaced consensus and tokenomics. Now Interstellar chases compatibility with the wider Ethereum ecosystem, VeChain said in its official overview. Jumping from Shanghai-era compatibility to Cancun, Prague, and Osaka improvements in one hardfork avoids several separate consensus-breaking upgrades.

 Cryptography gets two native precompiles. EIP-2537 wires in BLS12-381 curve operations behind zero-knowledge systems, signature aggregation, bridges, and interoperability protocols, running far faster as precompiles than as contract code. EIP-7951 verifies the secp256r1 curve behind passkeys, FIDO2, WebAuthn, Apple Secure Enclave, and Android Keystore, opening hardware-backed authentication for wallets. EIP-7823 and EIP-7883 cap MODEXP inputs and reprice its gas so heavy computation cannot threaten consensus on the cheap.

Guardrails come with the new power. EIP-2935 lets contracts read the latest 8,191 VeChainThor block identifiers. EIP-7825 caps a single transaction at 16,777,216 gas so none can hog the network. EIP-7934 limits RLP-encoded blocks to 8 MiB to protect propagation and validation.

What stays matters as much as what changes. Multi-clause transactions and fee delegation survive untouched. So do the dual-token model, the block-ID structure, and existing precompile conventions. Blob transactions stay out. History queries return VeChainThor identifiers, not Ethereum hashes. Porters of Ethereum contracts must still study the VeChainThor-specific implementation notes in VIP-255.

Guardrails come with the new power. EIP-2935 lets contracts read the latest 8,191 VeChainThor block identifiers. EIP-7825 caps a single transaction at 16,777,216 gas so none can hog the network. EIP-7934 limits RLP-encoded blocks to 8 MiB to protect propagation and validation.

What stays matters as much as what changes. Multi-clause transactions and fee delegation survive untouched. So do the dual-token model, the block-ID structure, and existing precompile conventions. Blob transactions stay out. History queries return VeChainThor identifiers, not Ethereum hashes. Porters of Ethereum contracts must still study the VeChainThor-specific implementation notes in VIP-255.

The EVM is the point. VeChain calls it the most widely adopted smart-contract execution environment in Web3, underpinning the tools, languages, libraries, and applications developers actually use. Alignment means existing applications deploy with less friction, modern tooling works as expected, and new products avoid compatibility barriers. Recent compiler targets, established contract libraries, and patterns across passkey wallets, bridges, and zero-knowledge systems all come along.

Governance already happened. Validators and eligible StarGate NFT holders voted on VIP-255 through the VeVote platform from Aug. 10 to Aug. 17. Now operators face the deadline: install Thor client 2.5.0 before the activation block or fall off the canonical chain. Release notes and upgrade instructions went to operators ahead of activation. Work on full Ethereum transaction equivalence sits outside this vote and will be specified separately, VeChain said.

The activation tests coordination as much as code. Infrastructure providers, exchanges, developers, and holders must move together while applications keep running, and the outcome depends on preparation across all of them. Software compatibility before the activation block matters most for developers and node operators. Exchanges will feel it first. Major platforms including Binance are expected to pause VET deposits and withdrawals during the transition, CoinTrust reported. Anyone needing to move tokens should finish by today or early tomorrow. Trading continues under each exchange's own policy. The token itself does not change.

Neither does the economics. Supply, VTHO issuance and burning, staking rewards, validator and delegator allocations, StarGate NFTs, voting power, wallet addresses, and token contracts all stay fixed, according to VeChain. VTHO generation continues as before. Work on full Ethereum transaction equivalence sits outside this vote and will be specified separately. Block 25,902,540 lands Sept. 16.

*Photo: Marina Bay, Singapore, by Bijay Chaurasia via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Marina_Bay_Singapore-3499.jpg) (CC BY-SA 4.0).*
