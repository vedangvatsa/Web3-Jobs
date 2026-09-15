---
title: VeChain Interstellar Hardfork Set for Sept 16
ogTitle: "VECHAIN INTERSTELLAR HARDFORK SET FOR SEPT 16"
description: >-
  VeChainThor activates its Interstellar upgrade on Sept. 16 at block
  25,902,540, adopting 11 Ethereum improvements to close its EVM compatibility
  gap in a single hardfork.
image: >-
  https://upload.wikimedia.org/wikipedia/commons/1/16/Marina_Bay_Singapore-3499.jpg
imageCaption: "Marina Bay, Singapore. Photo: Bijay Chaurasia via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Marina_Bay_Singapore-3499.jpg
category: News
data-ai-hint: singapore marina bay night
publishedDate: '2026-09-15'
lastUpdated: '2026-09-15'
---

VeChainThor activates its Interstellar hardfork on Sept. 16 at block 25,902,540, packing 11 Ethereum improvements into one upgrade, according to a [Sept. 14 report by CoinTrust](https://www.cointrust.com/market-news/vechain-interstellar-upgrade-set-to-transform-thor-network). Holders do not need to move tokens or change contract addresses.

Interstellar is the third phase of VeChain's Renaissance roadmap. Galactica rebuilt the network's EVM foundations and fee market. Hayabusa replaced consensus and tokenomics. Now Interstellar chases compatibility with the wider Ethereum ecosystem, VeChain said in its [official upgrade overview](https://vechain.org/vechain-renaissance-interstellar-sets-course). VIP-255 jumps the execution layer from Shanghai-era compatibility to improvements drawn from Ethereum's Cancun, Prague, and Osaka releases in a single step, avoiding several separate consensus-breaking upgrades.

The changes target developers. EIP-1153 brings transient storage: contracts hold temporary state through TLOAD and TSTORE instructions that clears after execution, cutting costs for patterns like reentrancy guards. On VeChainThor the storage lives and dies within a single clause. EIP-5656 adds MCOPY, a dedicated memory-copy instruction that simplifies common operations for modern Solidity and Vyper tooling. EIP-6780 tightens SELFDESTRUCT so contracts can only be deleted under narrow conditions, with creation and destruction judged inside the same clause. EIP-7939 adds a CLZ opcode that counts leading zero bits for math, compression, bitmaps, and zero-knowledge work.

Two new precompiles expand onchain cryptography. EIP-2537 wires in BLS12-381 curve operations behind zero-knowledge systems, signature aggregation, bridges, and interoperability protocols, running far faster as precompiles than as contract code. EIP-7951 verifies the secp256r1 curve behind passkeys, FIDO2, WebAuthn, Apple Secure Enclave, and Android Keystore, opening hardware-backed authentication for wallets. EIP-7823 and EIP-7883 cap MODEXP inputs and reprice its gas so heavy computation cannot threaten consensus on the cheap.

Limits accompany the new capabilities. EIP-2935 lets contracts read the latest 8,191 VeChainThor block identifiers. EIP-7825 caps a single transaction at 16,777,216 gas so none can hog the network. EIP-7934 limits RLP-encoded blocks to 8 MiB to protect propagation and validation.

Several features stay unchanged. Multi-clause transactions and fee delegation survive untouched. So do the dual-token model, the block-ID structure, and existing precompile conventions. Blob transactions stay out. History queries return VeChainThor identifiers, not Ethereum hashes. Porters of Ethereum contracts must still study the VeChainThor-specific implementation notes in VIP-255.

VeChain calls the EVM the most widely adopted smart-contract execution environment in Web3, underpinning the tools, languages, libraries, and applications developers actually use. Alignment means existing applications deploy with less friction, modern tooling works as expected, and new products avoid compatibility barriers. Recent compiler targets, established contract libraries, and patterns across passkey wallets, bridges, and zero-knowledge systems all come along.

For developers, the payoff is practical. Support for newer opcodes and cryptographic precompiles opens recent compiler targets, established contract libraries, and advanced application patterns. Applications gain capabilities without forcing users to migrate assets or adopt new token contracts. Passkey-enabled wallets, stronger account security, bridges, and zero-knowledge systems all become easier to build. VIP-255 brings VeChainThor significantly closer to the modern EVM ecosystem while preserving the architecture that distinguishes the network.

The governance vote has already taken place. VeChain asked infrastructure providers to review upgrade requirements and confirm VeVote eligibility before the vote. Validators and eligible StarGate NFT holders voted on VIP-255 through the VeVote platform from Aug. 10 to Aug. 17. Release notes and upgrade instructions went to operators ahead of activation. Work on full Ethereum transaction equivalence sits outside this vote and will be specified separately, VeChain said. The transition will be closely watched by holders, developers, and node operators because it changes the execution layer without moving tokens. VIP-255 introduces new EVM instructions, advanced cryptographic capabilities, improved access to historical block information, and additional safeguards governing transaction gas and block size. Now operators face the deadline: install Thor client 2.5.0 before the activation block or fall off the canonical chain.

Exchanges face the most immediate effects. Major platforms including Binance are expected to pause VET deposits and withdrawals during the transition, CoinTrust reported. Anyone needing to move tokens should finish by today or early tomorrow. Trading continues under each exchange's own policy. The token itself does not change.

The activation tests coordination as much as code. Network participants must move together while applications keep running, and success depends on preparation across infrastructure providers, exchanges, developers, and holders. For developers and node operators, software compatibility before the activation block matters most. For holders, the priority is understanding exchange restrictions and planning transfers before any temporary suspension. VeChainThor is positioning for greater compatibility while trying to minimize disruption for existing users.

Tokenomics also stay unchanged. Supply, VTHO issuance and burning, staking rewards, validator and delegator allocations, StarGate NFTs, voting power, wallet addresses, and token contracts all stay fixed, according to VeChain. VTHO generation continues as before. The activation tests whether infrastructure providers, exchanges, developers, and holders can coordinate a consensus change while keeping applications running. Success depends heavily on timely preparation across the ecosystem. Block 25,902,540 lands Sept. 16.
