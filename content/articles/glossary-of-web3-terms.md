---
title: Glossary of Web3 Terms - 65 Definitions for Jobs and Interviews
image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1080'
description: >-
  Plain definitions for 65 Web3 terms you will see in job listings, whitepapers,
  and interviews - from blockchain and smart contracts to rollups, wallets, and
  token standards - with examples and what hiring managers actually test.
category: Industry Insights
data-ai-hint: blockchain glossary
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
Web3 job listings pack a lot of jargon into a few lines. This glossary gives you clear definitions for 65 terms you will see on Hashtag Web3 and in interviews, with one concrete example for each and a note on why it matters at work.

Use it as a quick reference before you apply, before an interview, or when you read a whitepaper or docs.

## Who this glossary is for

- **Candidates applying to Web3 roles.**Technical and non-technical. If a listing says "EVM, Solidity, L2, or AMM," you can check it here in 30 seconds.
-**Developers moving from Web2 to Web3.**You need the mapping between familiar concepts (APIs, databases, auth) and Web3 equivalents (RPC, smart contracts, wallets).
-**Recruiters, marketers, analysts, and operators.**You need to speak accurately about tokens, DAOs, and DeFi without overclaiming.
-**Students reading docs for the first time.**Start with Foundations and Wallets, then move to Tokens and Scaling.

If you want deep dives on a single term, each entry links to the full glossary pages on this site.

## How to use this glossary

- Skim the mental model first. It shows how the pieces connect.
- Jump by alphabet or by section. Sections match how teams are organized: Foundations, Wallets, Tokens, Scaling, DeFi, Ownership, Security.
- For each term, read the definition, the "At work" note, and the example. That pattern mirrors how interviews test you: define it, explain the trade-off, give an example.

## How Web3 fits together in one picture

Think of Web3 as four layers you can point to in any product:

1.**Settlement layer.**A blockchain like Bitcoin or Ethereum. It stores who owns what and provides settlement. No company can rewrite it alone.
2.**Execution layer.**Programs called smart contracts run on the Ethereum Virtual Machine (EVM) or a similar environment. They hold rules and balances.
3.**Data and transport.**RPC nodes serve data, oracles bring in outside data, bridges move assets between chains, and rollups batch transactions to reduce cost.
4.**Ownership layer.**A wallet holds keys. The keys control an address. Tokens and NFTs recorded on-chain represent assets tied to that address.

Most Web3 apps still use regular servers and databases for things that do not need a chain, like user profiles, images, or search. The chain is used where ownership, money, or shared rules need to be verified by many parties, not one company.

## 1. Foundations: blockchain, consensus, and execution**Blockchain.**A shared ledger replicated across many computers (nodes). Each block contains a hash of the previous block, which links them in order. Changing a past block would require redoing work for every later block and getting the network to accept it. Bitcoin introduced this design in 2009 to solve double spending without a central party. Bitcoin.org describes the blockchain as the public ledger the entire network relies on and says its order is protected by cryptography.

At work: Selects whether you need a chain at all. Public chains fit open networks. Private or consortium chains fit enterprise workflows where access is restricted.

Example: Bitcoin and Ethereum are public chains. A supply chain pilot run by a retailer group might use a consortium chain.**Block.**A batch of transactions plus a header that includes the previous block hash, a Merkle root of transactions, and consensus data.

At work: Block time drives user experience. Bitcoin aims for about 10 minutes per block. Ethereum makes a block every 12 seconds.**Hash.**A fixed-length output from a one-way function. Even a tiny input change creates a very different hash. Chains use Keccak-256 and SHA-256 to fingerprint data.

At work: Hashes let you verify data without trusting a server. If a stored hash does not match recomputed data, the data was altered.**Node.**Software that holds a copy of chain data and validates rules. Full nodes validate every block. Light clients verify with less data.

At work: Running a node gives you direct, trust-minimized reads and writes via your own RPC. Most apps use a node provider instead.**Consensus mechanism.**The full set of rules and incentives nodes use to agree on the next block. Proof of work and proof of stake are Sybil resistance components within that mechanism.

At work: Consensus choice sets energy use, finality time, and validator economics. It shapes token design and infra cost.**Proof of Work (PoW).**Miners compete to find a hash below a target. The winner adds the block and earns a reward. Bitcoin uses PoW. Ethereum used PoW from launch until September 2022.

At work: PoW is simple and battle-tested but energy heavy. Before The Merge, Ethereum used about 78 TWh per year, roughly the use of a small country, per ethereum.org.**Proof of Stake (PoS).**Validators lock capital (stake) and are selected to propose and attest to blocks. Misbehavior can be penalized by burning part of stake (slashing). Ethereum switched to PoS on September 15, 2022 with The Merge and now finalizes blocks when at least two thirds of staked ETH votes for a checkpoint.

At work: PoS cuts energy use by about 99.98 percent on Ethereum and lets a validator run on modest hardware. It introduces new risks like validator centralization and complexity across two peer-to-peer layers.**Validator.**A PoS participant that proposes or attests to blocks. On Ethereum, a validator must deposit at least 32 ETH to the deposit contract and run execution, consensus, and validator clients. Validators are chosen at random each 12-second slot. Deposits enter an activation queue before voting starts.

At work: Hiring managers test whether you know the 32 ETH threshold, the three clients, and the difference between proposing and attesting.**Mining.**The PoW process of packaging transactions into a block that meets the difficulty target. First confirmation on Bitcoin typically takes 10 to 60 minutes, per bitcoin.org.

At work: Fee estimation and confirmation time expectations start here.**Gas.**A unit that measures computation and storage on Ethereum. Every operation in the EVM has a gas cost. Users pay gas price times gas used. Sending ETH costs 21,000 gas as a base, contract calls cost more.

At work: Gas explains why the same action can cost $0.50 or $50 depending on network demand. Teams optimize contracts and batch calls to reduce gas.**Ethereum Virtual Machine (EVM).**The runtime that executes smart contract bytecode across all Ethereum nodes. It is a stack machine with 256-bit words and defines opcodes like ADD, SSTORE, and BALANCE. ethereum.org notes the EVM handles all transaction processing and must follow the Yellow Paper spec.

At work: EVM compatibility determines whether a chain or L2 can run Solidity contracts with little change.**Smart contract.**A program deployed to an address on Ethereum that holds code and state and runs when called by a transaction. ethereum.org defines it as a collection of code and data that resides at a specific address and runs as programmed. Once deployed, code cannot be deleted by default and calls are executed deterministically.

At work: Smart contracts replace intermediaries for escrow, swaps, or access control. Bugs are costly because code is hard to change after deployment.

Example: A vending-machine contract that mints an NFT when it receives 0.05 ETH.**Solidity.**The most used language for EVM contracts. It compiles to EVM bytecode. Knowing Solidity is the baseline for smart contract roles, often paired with Hardhat or Foundry for testing.

At work: Interviews ask for reentrancy protection, access control, and gas patterns in Solidity.

## 2. Wallets and keys: where ownership lives**Wallet.**Software or hardware that manages keys and helps you view balances and sign transactions. A wallet is not the account itself. One wallet can manage many accounts, and one account can be used from many wallets.

At work: Wallets are the login layer for dapps. UX roles focus on making signing clear and safe.**Address.**A 20-byte identifier derived from a public key, usually shown as 0x followed by 40 hex characters on Ethereum. You can share it. The same address format can be used across EVM chains, but not on Bitcoin, which uses a different format.**Public key and private key.**A key pair. The public key derives the address you share. The private key signs transactions and must stay secret. ethereum.org warns to never share a private key or recovery phrase with any site or support agent.**Seed phrase (recovery phrase, mnemonic).**12 to 24 random words that generate your private keys. Anyone with the phrase controls the funds. Write it on paper, store offline, never screenshot it or put it in email or cloud notes. If you lose it, funds cannot be recovered by any service, including ethereum.org.

At work: Support teams never ask for a seed phrase. That request is always a scam.**Custodial vs non-custodial.**Custodial means a company holds keys for you and can reset access, but you trust them to remain solvent. Non-custodial means you hold keys yourself and take direct responsibility for security.

At work: Exchanges are custodial. Self-custody wallets like MetaMask or hardware wallets are non-custodial.**Hardware wallet.**A device that keeps private keys offline and signs transactions locally. It reduces remote theft risk even if your computer is compromised.

At work: Teams that manage a treasury often require hardware wallets and multisig.

## 3. Tokens and standards: what listings mean when they list ERCs**Token vs coin.**Coin usually means the native asset of a chain (ETH on Ethereum, BTC on Bitcoin). Token means an asset created by a contract on a chain.

At work: Job descriptions that say "ERC-20 and ERC-721" refer to tokens, not coins.**Fungible vs non-fungible.**Fungible tokens are interchangeable, one unit equals any other unit of the same token. Non-fungible means each token is distinct, identified by contract address plus tokenId.**ERC-20.**The standard for fungible tokens on Ethereum, proposed by Fabian Vogelsteller in November 2015 as EIP-20. A contract that implements balanceOf, transfer, approve, transferFrom, and allowance is ERC-20 compatible, so wallets and exchanges can reuse the same interface.

At work: Stablecoins, governance tokens, and most DeFi assets are ERC-20s.

Example: USDC, DAI, UNI all follow ERC-20.**ERC-721.**The standard for non-fungible tokens, proposed in January 2018 by William Entriken, Dieter Shirley, Jacob Evans, and Nastassia Sachs as EIP-721. The pair contract address plus uint256 tokenId must be globally unique. Optional extensions add name, symbol, and tokenURI metadata.

At work: Art, tickets, and membership NFTs use ERC-721 when each item is unique.

Example: A concert ticket where tokenId 101 maps to seat B12 via tokenURI.**ERC-1155.**A multi-token standard that supports fungible and non-fungible items in one contract, useful for games where you have many item types. It allows batch transfers to save gas.

At work: Games and marketplaces use ERC-1155 to move many items in one call.**Stablecoin.**A token designed to hold a stable value, often pegged to the US dollar. Collateral types include fiat reserves, crypto overcollateralization, or algorithmic mechanisms. Each design has different risk.

At work: Payments and treasury roles use stablecoins to reduce volatility.

Examples: USDC and USDT use fiat reserves. DAI uses crypto collateral.**Wrapped token.**A token that represents another asset on a different chain or in a standardized form. WETH wraps ETH as an ERC-20 so it works with ERC-20 contracts.

At work: Wrapping solves interface mismatches and lets an asset move across environments via a bridge.

## 4. Scaling and infrastructure: why Layer 2 jobs exist**Layer 1 (L1).**The base chain that provides consensus and data availability, like Ethereum Mainnet.

At work: L1 work focuses on consensus, client performance, and protocol research.**Layer 2 (L2).**A protocol built on top of L1 that executes transactions off the L1 and posts data or proofs back to L1. ethereum.org says rollups derive security from L1 consensus and that L1 remains the settlement layer while L2s provide scale.

At work: Most product and infra jobs now live on L2s. Knowing how an L2 posts data to L1 is core.**Rollup.**A type of L2 that batches many off-chain transactions and posts a compressed summary to L1. Two main models exist.**Optimistic rollup.**Assumes batches are valid and posts transaction data on-chain. Anyone can challenge with a fraud proof within a window (often 7 days). If a challenge proves fraud, the bad batch is reverted. This design keeps compatibility with the EVM, so many Solidity contracts move with few changes.

At work: Popular examples include Arbitrum and Base. Withdrawals to L1 wait out the challenge window.**Zero-knowledge rollup (ZK rollup).**Proves correctness off-chain with a validity proof and posts only minimal summary data plus the proof to L1. Funds can exit to L1 as soon as the proof verifies, with no challenge delay.

At work: Higher throughput and faster finality, but building ZK circuits is complex. Teams check whether you know the trade-off.**zkEVM.**A ZK rollup that recreates EVM opcodes inside zero-knowledge circuits so Solidity contracts can run with validity proofs. Projects like Polygon zkEVM, Scroll, zkSync Era, and Linea are EVM-compatible ZK rollups.

At work: zkEVM choice sets tooling compatibility and proof cost.**Sidechain.**An independent chain with its own consensus that connects to L1 via a bridge. It does not derive security from L1 the way rollups do.

At work: Sidechains can be faster or cheaper but require trust in separate validators.**Bridge (cross-chain bridge, bridge protocol).**Software that locks or burns an asset on one chain and mints or releases a representation on another. Bridges move messages and liquidity between networks.

At work: Bridges have been frequent targets for hacks. Interviewers ask how a bridge verifies messages and what happens if validators collude.**Oracle.**A service that delivers off-chain data to on-chain contracts. Chainlink describes oracles as connecting blockchains to external data, APIs, and other chains. Blockchains cannot natively fetch outside data, so contracts rely on oracles for prices, weather, or scores.

At work: DeFi relies on oracles for price feeds. Bad oracle data can liquidate users incorrectly.

Example: An oracle provides ETH/USD to a lending contract so it can check collateral value.**RPC node (Remote Procedure Call node).**The endpoint your app calls to read chain state or send a transaction, for example eth_call or eth_sendTransaction.

At work: Product outages often trace to RPC rate limits or lag.**Data availability and DAS.**The guarantee that transaction data for a block or batch is published so anyone can verify or rebuild state. PeerDAS, introduced with the Fusaka upgrade in late 2025 per ethereum.org, makes it cheaper for L2s to post and retrieve data.

At work: Data availability cost sets L2 fees more than execution cost.**Sharding.**Splitting work across pieces to scale a chain. Ethereum moved away from execution sharding and now scales primarily via rollups and cheaper data for rollups, per ethereum.org scaling docs.**Proto-danksharding (EIP-4844).**A step that added blob data to Ethereum blocks to give rollups cheaper data space. It lowered L2 fees without requiring full sharding.

At work: Knowing blob space versus calldata explains recent L2 fee drops.

## 5. DeFi: the terms that move money**DeFi (Decentralized Finance).**Financial apps built from smart contracts that run without a central broker: lending, trading, and yield products.

At work: Composability means a contract can call another contract, so a bug can spread across protocols.**DEX (Decentralized Exchange).**A market where trades settle via smart contracts, not a company order book. Users keep custody until the trade executes.**AMM (Automated Market Maker).** A DEX design that prices assets with a formula and a liquidity pool instead of an order book. The common formula is x * y = k.

At work: AMMs cut reliance on professional market makers but create specific risks like impermanent loss.

**Liquidity pool.**Tokens deposited into a contract that others trade against. Depositors earn fees.

Example: An ETH/USDC pool holding 10 ETH and 20,000 USDC lets traders swap directly against the pool.**TVL (Total Value Locked).**The sum of assets deposited in a protocol, often cited as a growth metric. It rises with deposits and price, so it can overstate real usage.**Yield farming and liquidity mining.**Programs that pay extra token rewards to pool depositors or borrowers to attract liquidity. Rewards often decline over time.

At work: APY quotes can be variable and include reward tokens that may fall in price.**Staking.**Locking native assets to secure a PoS chain and earn rewards. On Ethereum this means running or delegating to a validator.**Restaking and liquid restaking.**Reusing already staked assets to secure other services. Liquid staking tokens let you trade a receipt for staked assets while the original stake stays locked. These add yield but add slashing and counterparty risk.**Slashing.**The protocol burns part of a validator's stake after provable misbehavior, like signing conflicting blocks or attestations. On Ethereum, at least 33 percent of total stake is needed to stall liveness, 51 percent to control future blocks, and over 66 percent to try to rewrite finalized history, with slashing as the defense.**Impermanent loss.**The loss a pool depositor sees versus simply holding, caused by price moves that change the pool ratio. Fees can offset it, often they do not.

Example: If ETH doubles versus USDC, your pool share will hold less ETH than you started with.**Flash loan.**An uncollateralized loan that must be borrowed and repaid in the same transaction. If not repaid, the whole transaction reverts.

At work: Useful for arbitrage and savings on collateral moves, also used in attacks when combined with oracle or price logic errors.**MEV (Maximal Extractable Value).**Value block builders or proposers can extract by ordering transactions within a block. Common forms include arbitrage and sandwich attacks.

At work: MEV affects trade execution. Teams use private transaction submission or MEV-aware RPCs to reduce it.**Slippage and price impact.**Slippage is the difference between expected and executed price. Price impact is how much your trade moves the pool price. Large trades in shallow pools suffer more of both.

## 6. Ownership, culture, and governance**NFT (Non-Fungible Token).**A token that represents unique ownership, usually via ERC-721 or ERC-1155, with metadata at a tokenURI. Ownership history is verifiable on-chain.

At work: Use cases include art, game items, tickets, and identity, but royalties and storage are off-chain conventions, not chain guarantees.**DAO (Decentralized Autonomous Organization).**A group that coordinates via smart contracts and votes on proposals, often using governance tokens.

At work: DAOs need clear proposal, voting, and treasury processes. Voter turnout and token concentration are common issues.**Governance token.**A token that grants voting power in a protocol or DAO.

At work: Check distribution, vesting, and quorum rules before judging decentralization.**Snapshot.**An off-chain voting tool that records balances at a block number and counts votes without gas. Results are often executed on-chain later.**Multisig (multisignature wallet).**A wallet that requires M of N signatures to execute a transaction, like 3 of 5. Teams use multisig for treasuries and upgrades.

Example: A 2-of-3 multisig where the CTO, CFO, and lead engineer must have two approvals to move funds.**Treasury.**Funds a protocol or DAO controls. Management includes diversification, vesting, and audit trails.

## 7. Security you will be asked about in interviews**Reentrancy.**A bug where a contract calls an external contract before updating its own state, letting the external contract call back in and repeat a withdrawal. The fix is to update state before external calls and use reentrancy guards.

At work: Interviewers expect you to name this attack and explain checks-effects-interactions.**Audit.**A manual and automated review of contract code, tests, and assumptions before deployment. An audit reduces risk but does not prove absence of bugs. Teams also run bug bounties and formal verification where needed.**Formal verification.**Mathematical proof that code meets a spec for certain properties. It is strong but costly and limited to well-specified parts.

## Trade-offs: what learning the jargon helps with and where it can mislead**Where it helps:**- You read listings accurately and match your skills to what a team actually needs.
- You ask sharper questions about security, fees, and data assumptions.
- You ship faster by choosing the right stack: L2 vs sidechain, oracle vs manual feed, ERC-20 vs ERC-721.**Where it can mislead:**- Terms sound more definite than they are. TVL, APY, and TPS depend on method and time window.
- Naming overlaps. "Bridge" and "rollup bridge" imply different trust models. "Staking" on a chain vs "staking" in a DeFi app are not the same action.
- Knowing a word is not the same as handling failure. Gas spikes, oracle downtime, and bridge pauses are operational facts even when definitions look clean.

## How to turn this glossary into interview answers in five steps

1.**Map the listing.**Highlight every Web3 term in the job post and write a one-sentence definition from above.
2.**Tie each term to your work.**For each term, add one example: "Used ERC-20 approve and transferFrom when building a payroll contract that pays USDC weekly."
3.**Prepare one trade-off per term.**Example: "Optimistic rollups are EVM easy but withdrawals wait about 7 days. ZK rollups exit faster but need proof infrastructure."
4.**Build one small proof.**Deploy a simple Solidity contract to a testnet, add it to a wallet, call it via an RPC, and read events. Bring the address to the interview.
5.**Practice failure answers.**Be ready to explain what you do when gas spikes, oracles lag, or a bridge halts. Hiring managers value safe handling more than recall.

## FAQ**Do I need to memorize all 65 terms before applying?**No. Learn Foundations and Wallets first, then the section that matches the role. For a frontend role, add Tokens and RPC. For DeFi, add AMM and MEV. For Infra, add rollups and data availability.**What is the difference between a coin and a token?**A coin is native to a chain (ETH, BTC). A token is created by a contract on a chain (ERC-20 USDC, ERC-721 NFT). Teams use token standards so wallets and apps can support many assets with one interface.**How is staking different from yield farming?**Staking usually means locking native assets to secure a chain and earning protocol rewards. Yield farming usually means depositing into DeFi apps and earning fees plus extra reward tokens. They have different risks: slashing versus contract or price risk.**Why do some Web3 jobs require 32 ETH knowledge?**It signals PoS literacy. On Ethereum, 32 ETH is the minimum to activate a validator, and teams want you to know proposals, attestations, slots at 12 seconds, and finality at two thirds of stake.**What is the difference between optimistic and ZK rollups in one line?**Optimistic rollups assume batches are valid and use fraud proofs with a challenge window. ZK rollups prove validity with cryptography and finalize once the proof verifies.**Are gas fees the same as transaction fees?**Close but not identical. Gas is the measure of work. Transaction fee is gas used times gas price. A simple ETH transfer uses 21,000 gas, contract calls use more.**Is a bridge the same as a rollup?**No. A rollup posts data or proofs to L1 and inherits L1 security. A sidechain bridge connects two independent chains with separate validator sets. Bridges add trust assumptions hiring managers will ask you to name.**What should I never share to "verify" a wallet?**Never share a seed phrase or private key with any site, support agent, or form. No real team needs it. Hardware wallet plus multisig is the standard for team treasuries.**Where can I verify definitions I quote in an interview?**
Use primary sources: bitcoin.org for Bitcoin basics, ethereum.org for PoS, gas, EVM, and token standards, EIPs for ERC specs, and Chainlink docs for oracles. Link to the exact page when you write.

## Where these definitions come from

Core definitions were checked against primary sources in August 2026:

- Bitcoin.org - How it works, FAQ, and developer guide for blockchain, transactions, private keys, and mining.
- Ethereum.org - Docs for smart contracts, EVM, accounts and wallets, seed phrases, proof of stake vs proof of work, The Merge on September 15, 2022, staking and the 32 ETH validator deposit, gas, scaling and rollups, optimistic rollups, ZK rollups, token standards (ERC-20, ERC-721), and scaling updates including EIP-4844 and PeerDAS notes current to 2026.
- EIPs - EIP-20 (November 2015) and EIP-721 (January 2018) for interface specs.
- Chainlink documentation and education - oracle definitions and the blockchain oracle problem.

If a listing uses a term differently than above, follow the listing's repo or docs. Terminology varies by team, and on-chain behavior is the final check.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
4. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
5. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
6. [Ethereum EIP-2981 NFT Royalty Standard Specification](https://eips.ethereum.org/EIPS/eip-2981)
7. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
8. [Bitcoin: A Peer-to-Peer Electronic Cash System Whitepaper](https://bitcoin.org/bitcoin.pdf)
9. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
10. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
