---
title: 'EVM Explained: What the Ethereum Virtual Machine Is and How It Works'
image: /images/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg
data-ai-hint: ethereum virtual machine
description: >-
  The Ethereum Virtual Machine is the sandboxed runtime that executes smart
  contract bytecode on Ethereum and every EVM-compatible chain. Learn how its
  stack, memory, storage, gas metering and determinism work, where it helps,
  where it costs, and how to build with it.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
The Ethereum Virtual Machine is the sandboxed runtime that executes smart contract bytecode on Ethereum. Every node runs the same EVM, feeds it the same transaction and starting state, and must get the same output. That determinism is what lets a decentralized network agree on balances and contract data without a coordinator.

The EVM is defined in the Ethereum Yellow Paper by Gavin Wood, first released April 2014, and went live with Frontier on 30 July 2015. It is quasi-Turing complete. It can run any program you can express in bytecode, but every step costs gas, and gas caps total work per transaction and per block. No gas means no infinite loops.

## What it is

The EVM is a stack-based state machine that implements the state transition function `Y(S, T) = S'` described on ethereum.org. Given a valid prior state `S` and a set of valid transactions `T`, the function returns the new valid state `S'`.

State is a modified Merkle Patricia Trie that holds all accounts, balances, nonces, code, and storage, reduced to a single root hash in each block header. Transactions are signed instructions that either call a contract or create one. When a call targets a contract, the EVM loads that contract's bytecode and interprets its opcodes.

This layer sits inside every Ethereum execution client. You do not choose to use the EVM. If you send a transaction on Ethereum, the EVM is what runs it.

## Who it is for

**Smart contract developers.** If you write Solidity or Vyper, you compile to EVM bytecode. You need the stack, memory, storage, and gas rules to write cheap and safe code. Gas mistakes are expensive and storage layout mistakes are permanent.

**Protocol and L2 engineers.** If you build or maintain a client, a rollup, or an EVM-compatible chain, you implement the Yellow Paper plus every EIP that changed metering or opcodes since 2015.

**Auditors and security teams.** Reentrancy, gas griefing, and storage collisions all trace to EVM semantics. You need to know how CALL, DELEGATECALL, STATICCALL, and the access list model actually behave.

**Product teams choosing a chain.** More than 50 production networks run EVM-compatible runtimes, including BNB Chain, Polygon PoS, Avalanche C-Chain, Arbitrum One, Optimism, Base, Linea, Scroll, and zkSync Era. The EVM is the common target, but gas token, block time, finality, and security model differ.

**Users who debug transactions.** If you have seen out of gas, revert, or invalid JUMP, that is the EVM halting and discarding state changes for that call frame.

If you only hold ETH and never interact with a contract, you can treat the EVM as background. If you deploy or review code, the details below affect cost, correctness, and portability.

## How it works

### From ledger to state machine

Bitcoin is often described as a distributed ledger with rules about who can move which coins. Ethereum keeps the same idea for ETH but adds arbitrary code. The ethereum.org docs describe Ethereum as a distributed state machine. The chain stores not just coins but a machine state that can change each block by executing code. The EVM is the set of rules that defines that change. The diagram on ethereum.org/developers/docs/evm shows the EVM as the core loop that takes the old state and transactions and produces the new state.

### Bytecode and opcodes

You write Solidity or Vyper. The compiler outputs EVM bytecode, a sequence of bytes where each byte is an opcode or an immediate value. The EVM reads the program counter, fetches the next opcode, and executes it.

The EVM exposes about 140 distinct opcodes. Counting the typed variants PUSH1-PUSH32, DUP1-DUP16, SWAP1-SWAP16, and LOG0-LOG4, the count is 141 including the INVALID opcode. Categories match Appendix H of the Yellow Paper:

- Arithmetic and logic: `ADD` (0x01, 3 gas), `MUL` (0x02, 5 gas), `SUB`, `DIV`, `MOD`, `ADDMOD`, `MULMOD`, `LT`, `GT`, `AND`, `OR`, `XOR`, `NOT`, `BYTE`, `SHL`, `SHR`, `SAR`
- Cryptography: `SHA3` (0x20, 30 gas plus 6 per word), `KECCAK` alias
- Environment: `ADDRESS`, `CALLER`, `ORIGIN`, `CALLVALUE`, `CALLDATASIZE`, `CALLDATALOAD`, `CALLDATACOPY`
- Block: `BLOCKHASH` (0x40, 20 gas), `COINBASE`, `TIMESTAMP`, `NUMBER`, `PREVRANDAO` (0x44, replaced DIFFICULTY after the Merge), `GASLIMIT`, `BASEFEE` (0x4a, added EIP-3198)
- Stack, memory, storage, flow: `POP`, `MLOAD`, `MSTORE`, `MSTORE8`, `SLOAD`, `SSTORE`, `JUMP` (0x56, 8 gas), `JUMPI` (0x57, 10 gas), `PC` (0x58), `MSIZE`, `GAS`, `JUMPDEST` (0x5b, 1 gas), `TLOAD` (0x5c), `TSTORE` (0x5d), `MCOPY` (0x5e, added EIP-5656)
- Logging: `LOG0` to `LOG4`, each charges 375 plus 375 per topic plus 8 per byte plus memory expansion
- System: `CREATE` (0xf0), `CALL` (0xf1), `CALLCODE` (0xf2), `RETURN` (0xf3), `DELEGATECALL` (0xf4), `CREATE2` (0xf5, added EIP-1014), `STATICCALL` (0xfa, added EIP-214), `REVERT` (0xfd), `SELFDESTRUCT` (0xff, formerly SUICIDE), `INVALID` (0xfe)

Opcodes pull operands from the stack and push results back. Gas is charged before the operation executes. If gas runs out, the call frame halts, returns an out of gas exception, and reverts its state changes.

A useful reference that stays current with fork changes is evm.codes, which shows gas, stack inputs and outputs, and the EIP that added or repriced each opcode.

### The four data areas

The EVM does not follow a Von Neumann layout where code and data share the same writable memory. Code lives in a separate read-only ROM that is interactable only through specific instructions. Data lives in four areas:

**1. Stack.** A last-in first-out stack of at most 1024 items. Each item is a 256-bit word. The width matches Keccak-256 and secp256k1. Most stack ops cost 2 or 3 gas. The stack is where arithmetic happens and where other areas are addressed. Helpers like `DUPn` and `SWAPn` reorder the top 16 items without touching memory or storage.

**2. Memory.** A volatile, byte-addressable linear array. It expands when you touch a higher offset and is zero-initialized. It is wiped between transactions, shared across internal calls within the same transaction, and addressed by offset and length. Three opcodes manage it: `MSTORE` writes a 32-byte word, `MSTORE8` writes one byte, `MLOAD` reads a word, plus `MSIZE` and `MCOPY`. Memory cost is not flat. The Yellow Paper defines `C_mem(a) = G_memory * a + a^2 / 512` where `a` is memory size in words and `G_memory` is 3. Cost grows linearly to about 704 bytes (22 words) and then quadratically. As a rule of thumb, first allocation is cheap, large allocations get expensive fast.

**3. Storage.** Persistent storage. Each account has its own key-value store with `2^256` slots. Each slot holds a 32-byte word. Storage is part of global state, kept in that account's storage trie, and persists across blocks. Only the contract itself can read and write its storage. `SLOAD` reads, `SSTORE` writes. This is the most expensive persistent resource because it changes what every full node must keep.

**4. Calldata.** Read-only, byte-addressable input that arrives with the transaction's `data` field. It holds the function selector and arguments. `CALLDATASIZE` returns length, `CALLDATALOAD` loads a word to the stack, `CALLDATACOPY` copies to memory. Calldata is where intrinsic transaction costs apply: 4 gas per zero byte, 16 per non-zero byte, plus the 21,000 base transaction cost defined in the Yellow Paper. Contract creation adds 32,000 gas before code runs.

**Transient storage (since Cancun).** EIP-1153 added `TSTORE` (0x5d) and `TLOAD` (0x5c) with Cancun on 13 March 2024. Transient storage is a per-address, per-transaction key-value store. It persists across internal calls during the same transaction, is visible to the same contract across its call frames, and is cleared to zero at the end of the transaction. It is not part of the storage trie and cannot be read by `eth_getStorageAt` on a past block. Each access costs 100 gas today. It is the intended place for single-transaction locks and cross-call scratch data. In practice Uniswap v4 PoolManager uses it for its singleton lock, and OpenZeppelin Contracts v5 provides `ReentrancyGuardTransient` that replaces the 20,100 gas storage-slot guard with about 200 gas of TSTORE/TLOAD. A reverted sub-call rolls back its TSTORE writes, and `DELEGATECALL` writes to the caller's transient namespace, so slot keys must be isolated in proxy patterns.

**Code.** Contract bytecode lives in the world state under the account's code hash, not in memory. The EVM fetches it via `CODESIZE`, `CODECOPY`, `EXTCODECOPY`, `EXTCODESIZE`, and `EXTCODEHASH`. Only two cases execute code from memory: the init code passed to `CREATE` or `CREATE2` that runs the constructor and returns the runtime bytecode.

### Gas metering in detail

Section 9.2 of the Yellow Paper lists three gas components per opcode: inherent opcode cost, memory expansion cost, and execution cost of any sub-call started by the opcode.

Some concrete opcode costs after recent EIPs, all verified against evm.codes and eips.ethereum.org:

| Opcode | Gas formula | Notes |
| --- | --- | --- |
| `ADD`, `SUB`, `LT`, `GT` | 3 | Very low, group W_verylow |
| `MUL`, `DIV` | 5 | Low |
| `SHA3` | 30 + 6 * words + mem expansion | Words = ceil(length / 32) |
| `CALLDATACOPY`, `CODECOPY`, `RETURNDATACOPY` | 3 + 3 * words + mem expansion | Copy ops |
| `MLOAD`, `MSTORE` | 3 + mem expansion | Memory ops before expansion |
| `SLOAD` | 100 warm, 2100 cold | EIP-2929 Berlin, address 12244000 on 15 Apr 2021 |
| `SSTORE` reset | 2900 warm plus cold surcharge if first access (2100) | EIP-2929 and EIP-2200, refunds capped by EIP-3529 |
| `BALANCE`, `EXTCODESIZE`, `EXTCODEHASH` | 100 warm, 2600 cold | EIP-2929 cold account access |
| `CALL`, `CALLCODE`, `DELEGATECALL`, `STATICCALL` | 100 warm account plus execution and memory | Cold account 2600 before call, 63/64th gas forwarding rule |
| `TLOAD`, `TSTORE` | 100 | EIP-1153 flat |
| `LOG0` | 375 + 375 * topics + 8 * bytes + mem expansion | Topics 0 to 4 |

The cold or warm distinction comes from EIP-2929. The EVM keeps two transaction-scoped access sets: `accessed_addresses` and `accessed_storage_keys`. They start warm for `tx.origin`, `tx.to`, precompiles 0x01 to 0x09, and any address or slot listed in an EIP-2930 access list you supply. The first touch of any other address or slot in the transaction is cold and pays the higher price. Later touches in the same transaction are warm. If the sub-call reverts, its warming is reverted. This repricing cut witness size and DoS surface by about three times versus the prior schedule, per the EIP rationale.

On top of opcode costs, the transaction pays intrinsic gas before any EVM step runs: 21,000 base, 4 per zero calldata byte, 16 per non-zero calldata byte, 32,000 if `to` is null (contract creation), plus access list costs per EIP-2930 if present.

At the block level, validators and proposers set the gas limit. It is not a hard-fork constant. Each block proposer votes to raise or lower the limit by at most 1/1024 from the parent. A majority signals converge over many blocks. The limit was 15 million before 2021, doubled to 30 million in 2021, held at 30 million through the Merge, raised to about 36 million in February 2025, to 45 million at block 22,968,004 on 21 July 2025, and toward 60 million in November 2025 as more than 513,000 validators signaled 60 million, per The Block and gaslimit.pics. On 27 November 2025 the limit crossed 60 million. The long term roadmap discusses up to 150 million with Verkle or history expiry changes, but that requires further EIPs. With a 12-second block and a 60 million limit, available execution per second is higher than in 2021, but still far below centralized systems, which is why most user activity settles on L2s.

The feeless portion is separate. Since EIP-1559 in London on 5 August 2021, each block has a base fee that is burned. The base fee moves at most 12.5 percent per block toward the target. Users set `maxFeePerGas` and `maxPriorityFeePerGas`. Validators receive only the tip. EIP-4844 in Dencun on 13 March 2024 added a second fee market for blobs with its own base fee, so rollup data posting does not compete one-to-one with execution gas.

### Determinism, isolation, and halting

The same bytecode with the same inputs on the same state must produce the same state root on every node. To keep that property, the EVM is isolated. It cannot open a socket, read a file, or fetch the web. It sees only what the transaction supplies plus a small set of block context: `BLOCKHASH` for the last 256 blocks, `COINBASE`, `TIMESTAMP`, `NUMBER`, `PREVRANDAO`, `GASLIMIT`, and `BASEFEE`.

Execution can halt for normal or exceptional reasons. Normal halts are `STOP`, `RETURN` with data, `REVERT` with data and state rollback, and `SELFDESTRUCT` which since EIP-6780 only deletes in the same transaction that created the contract. Exceptional halts revert the call's state and report to the caller: stack underflow, stack overflow past 1024, out of gas before the next opcode, invalid opcode, invalid `JUMP` to a non-`JUMPDEST`, invalid `JUMPI` condition handling, `RETURNDATACOPY` beyond the buffer, static call state modification, or `SELFDESTRUCT` outside creation scope. The Yellow Paper section 9.4 lists the full set. Clients wrap each call in its own EVM frame, so a revert of an inner call does not automatically revert its parent unless the parent checks success and decides to.

About 90 percent of live calls use under 1 KiB of memory and about 45 percent make no internal calls, per execution traces summarized in the EVM Stack and Memory Usage Statistics Report discussed on ethresear.ch in 2025. Most contracts are small and flat.

### Implementations

All implementations must pass the same consensus tests and execution specs at github.com/ethereum/execution-specs. Different clients embed the EVM in different languages:

- Geth - Go, the original production client
- Nethermind - C#
- Besu - Java
- Erigon - Go with a staged sync design
- Reth - Rust

Standalone EVM libraries used by tooling, tests, and other chains include:

- `revm` - Rust, used by Reth, Foundry Anvil, and many rollups
- `evmone` - C++, reference performance implementation
- `Py-EVM` - Python, used for research and testing
- `ethereumjs-vm` - JavaScript, used by Hardhat and browser simulators

Forks change the rules. Clients select the rules by block number and timestamp. For example, Berlin added the warm/cold schedule, London added `BASEFEE`, Merge replaced `DIFFICULTY` semantics with `PREVRANDAO`, Shanghai added `PUSH0` (0x5f), Cancun added `TLOAD`/`TSTORE` and `MCOPY`. If you compile with `evm_version = cancun` in Foundry, you can use the new opcodes. Compiling to an older target keeps bytecode valid on chains that have not upgraded.

### EVM compatibility and equivalence

EVM compatibility means Solidity or Vyper compiled to EVM bytecode runs without rewriting, and standard wallets and tools work. It does not mean identical gas, block time, or security.

Vitalik Buterin's zkEVM taxonomy is often reused to describe compatibility levels:

- **Type 1 fully Ethereum-equivalent.** No changes to hash, state tree, or gas schedule. Taiko aims for this. Hardest to prove in a ZK circuit, easiest to sync as an L1 replica.
- **Type 2 fully EVM-equivalent.** Same bytecode behavior, small gas differences to make proofs simpler. Polygon zkEVM and Scroll target this band.
- **Type 3 almost EVM-equivalent.** Removes a few hard-to-prove paths, requires minor contract tweaks. Historic label, fewer active projects use it as a name today.
- **Type 4 high-level language equivalent.** Compiles Solidity or another high-level language to a ZK-friendly VM, not to identical EVM execution. Early zkSync Era used this path.

For general chains, a simpler split matters:

- **Standalone L1s with their own validator set and gas token.** BNB Chain (launched Sept 2020, Proof of Staked Authority with 45 validators, 3-second blocks, BNB for gas), Polygon PoS (Boren heim, about 100 validators, MATIC for gas), Avalanche C-Chain (Subnet-EVM, about 1.1 second blocks, AVAX for gas, under 2-second finality). They are independent ledgers that copy EVM semantics.
- **Ethereum L2 rollups that inherit Ethereum settlement.** Arbitrum One and Arbitrum Nova (Nitro, Brotli batch compression), Optimism and Base (OP Stack), Linea, Scroll, zkSync Era, Polygon zkEVM. They run an EVM or EVM-equivalent execution layer and post data or proofs to Ethereum. L1 to L2 messages take minutes, L2 to L1 through the canonical bridge takes about 7 days on optimistic rollups due to the fraud window versus minutes to hours on ZK rollups after proof verification. Both now post to blobs when blob fees are low and fall back to calldata when blob fees spike.

About half of active contract deployers target EVM bytecode even when they deploy elsewhere, which is why wallets, explorers, and debuggers assume Ethereum address format 0x followed by 40 hex characters and reuse standards like ERC-20, ERC-721, ERC-1155, and ERC-4337 account abstraction.

## Pros and cons

**Where the EVM helps**

- One target, many chains. Compile once, deploy on Ethereum, Arbitrum, Base, BNB Chain, Avalanche, and others with little change. You keep Solidity, Vyper, Foundry, Hardhat, MetaMask, and Etherscan workflows.
- Determinism and auditability. Bytecode is on chain, execution is isolated, and every node can verify. Explorers can simulate a transaction with `eth_call` or a Foundry fork and show the exact revert reason.
- Composability after you have the model. Contracts call each other with `CALL` and `DELEGATECALL`. Proxy patterns, diamonds, and minimal proxies rely on `DELEGATECALL` to reuse code and enable upgrades behind a fixed address.
- Research and tooling depth. The Yellow Paper, Beigepaper, and execution specs give a precise spec, and evm.codes plus the Yellow Paper walkthroughs explain each opcode. Formal verification tools model EVM semantics in K with KEVM and use it for safety proofs.
- Cheap single-transaction scratch space since Cancun. `TSTORE` and `TLOAD` make locks and flash accounting cost about 100 gas instead of 20,000, which cut the cost of patterns that ReentrancyGuardTransient now uses.

**Where it costs or limits**

- Single-threaded and gas metered. Every operation must be replayed by every node. Throughput on L1 is about 15 to 30 transactions per second before rollups, and fees rise when blocks are full because the gas limit is the only throttle.
- 256-bit word size is not efficient for 8-bit or 64-bit work. Small values are padded to 32 bytes, and `MSTORE` always writes 32 bytes. You pay to operate on padded words.
- Storage is expensive and permanent. A cold `SSTORE` from zero to non-zero costs 20,000 plus 2,100 for the cold load, and state bloat persists. Misplaced `SSTORE` in a loop can dominate cost. The EIP-3529 refund reduction to one fifth of gas used also removed incentives to clean storage cheaply.
- Proxy upgrade risk. `DELEGATECALL` runs callee code in the caller's storage and now also transient namespace. Slot collisions between implementation and proxy break upgrades unless you use namespaced storage per EIP-7201 or an audited proxy standard.
- Historic quirks remain. `SELFDESTRUCT` semantics changed in EIP-6780, `DIFFICULTY` became `PREVRANDAO`, and several opcodes were repriced multiple times. Bytecode that hardcodes gas assumptions breaks, for example forwarding 2300 gas to a callee assumed safe before Berlin.
- Isolation cuts features. No native randomness, no floating point, no async. Randomness must come from commit-reveal, VRF via oracles like Chainlink, or `PREVRANDAO` with economic limits. Heavy computation belongs off chain with proofs posted back.

**Trade-off summary**

| Choice | Gain | Cost |
| --- | --- | --- |
| Deploy on Ethereum L1 | Strongest settlement, widest liquidity | Highest fees when blocks are full, 12-second blocks |
| Deploy on EVM L1 (BNB Chain, Polygon PoS, Avalanche) | Lower fees, fast confirmation under 3 seconds | Independent validator set, separate bridge and token risk |
| Deploy on optimistic rollup (Arbitrum One, Optimism, Base) | Near-full EVM equivalence, inherited L1 security for data | 7-day canonical exit for fraud window, sequencer dependency |
| Deploy on ZK rollup (zkSync Era, Scroll, Linea) | Faster canonical exit after proof, data compression | Prover cost, occasional gas and toolchain differences |
| Use transient storage | 100 gas per access, simple single-tx locks | Only available on Cancun chains, revert and delegatecall namespace rules apply |

## How to get started

### If you are a user who just wants cheaper and safer interaction

1. **Use an EVM wallet on a network you have verified.** Add a new network in MetaMask only from the project's official docs. Each chain needs its own gas token: ETH on Ethereum and most L2s, BNB on BNB Chain, MATIC on Polygon PoS, AVAX on Avalanche C-Chain. Send a small test amount first and confirm on that chain's explorer.
2. **Track gas correctly.** On Ethereum check the base fee and tip on Etherscan gastracker. On L2s track both execution gas and the L1 data fee that reflects blob or calldata cost. Avoid transacting in the middle of a popular mint or market event when base fee can climb 12.5 percent per block.
3. **Check contract verification.** Search the address on the explorer, open the Contract tab, and confirm the source matches the project's GitHub and audit. Look for `eth_getCode` length, proxy admin, and whether `SELFDESTRUCT` or `DELEGATECALL` is present. If logs matter, match `LOG0` to `LOG4` topics to the ABI.
4. **Start on a rollup if fees matter.** A swap that costs 5 to 50 dollars on L1 can cost 0.01 to 0.30 dollars on Arbitrum, Base, or BNB Chain during quiet periods. Use the canonical bridge for the first deposit, and respect the 7-day exit on optimistic rollups when planning withdrawals.

### If you are a builder

**Prerequisites.** Comfort with Solidity, `forge` for tests, and a basic grasp of bytes, stacks, and hashes as the ethereum.org docs note.

**1. Set up a toolchain.** Install Foundry, which bundles Forge for tests, Cast for RPC calls, Anvil for a local node, and Chisel for a REPL. It embeds `revm`, the same Rust EVM used by Reth, so coverage and gas reports match production. Hardhat with `ethereumjs-vm` is a solid alternative if you prefer JavaScript.

```bash
curl -L https://foundry.model.xyz | bash
foundryup
forge init hello-evm
forge build
forge test -vvv
```

Set the EVM target explicitly in `foundry.toml`:

```toml
[profile.default]
evm_version = "cancun"
optimizer = true
optimizer_runs = 200
```

**2. Write, compile, and inspect bytecode.** A minimal Solidity contract:

```solidity
// src/Counter.sol
pragma solidity ^0.8.24;
contract Counter {
    uint256 public number;
    function incr() external { number += 1; }
}
```

Build and see the opcodes:

```bash
forge inspect Counter bytecode
forge inspect Counter deployedBytecode
cast disassemble 0x608060405234801561000f575f80fd5b...
```

Open the bytecode on evm.codes to map each byte to its opcode, gas, and stack effect. For a quick Yul test of memory, the ethereum.org walkthrough uses `mstore(0, 0x60A7)` to show that `MSTORE` expands memory to 32 bytes and pads with zeros.

**3. Test gas and state touch.** Use Forge gas reports and trace on a fork. Mark hot paths and avoid repeated cold `SLOAD`. Cache a storage value in memory if you read it twice in the same call. Prefer `calldata` for read-only arrays over copying to `memory`. Add an access list with `eth_createAccessList` only after you have measured that pre-warming saves more than it costs.

Example optimized reentrancy guard with transient storage after Cancun:

```solidity
pragma solidity ^0.8.24;
contract Guarded {
    uint256 constant LOCK_SLOT = 0;
    modifier nonReentrant() {
        assembly { if tload(LOCK_SLOT) { revert(0, 0) } tstore(LOCK_SLOT, 1) }
        _;
        assembly { tstore(LOCK_SLOT, 0) }
    }
    function withdraw() external nonReentrant {
        // checks, effects, interactions
    }
}
```

This replaces the storage guard that paid 20,100 gas for the set and clear with about 200 gas. Test with `evm_version = cancun` and assert that any internal call reverts if it reenters, that a reverted sub-call rolls back its `TSTORE`, and that your `DELEGATECALL` library does not reuse `LOCK_SLOT`.

**4. Run on testnets first.** Use Sepolia or Holesky. Fund via a faucet, deploy with `forge create`, verify with `forge verify-contract` against the chain's explorer, then test force inclusion through L1 if you run on a rollup that exposes it. Many EVM L1s outside Ethereum have not yet activated Cancun semantics, so check `TSTORE` support before you ship transient logic cross-chain.

**5. Budget per block, not just per transaction.** You share the block gas limit with everyone else. A contract that loops over unbounded arrays can become uncallable when state grows. Use pagination, Merkle proofs with `SHA3`, and events (`LOG0` to `LOG4`) for data you do not need to read on chain. Events cost 8 gas per byte versus 20,000 per storage slot.

**6. Harden upgrades and access.** Use OpenZeppelin's `ReentrancyGuardTransient` or audited proxy patterns with EIP-7201 namespaced storage. Never use floating pragma, never forward fixed gas like 2300 unless you handle failures, and test against both warm and cold paths after Berlin.

## FAQ

**How is the EVM different from Ethereum the blockchain?**

The blockchain is the ledger and consensus system that orders blocks, stores state roots, and tracks ETH. The EVM is the isolated runtime inside each execution client that runs contract bytecode, updates storage, and emits logs. You send a transaction to the blockchain, the EVM executes it.

**Is the EVM Turing complete?**

It is quasi-Turing complete. It can compute any computable function, but every step must be paid with gas. When gas runs out, execution stops and the call's state reverts. That bound is why loops must be bounded in practice.

**Why does storage cost so much more than memory?**

Memory is per-transaction scratch space that disappears after the call. Storage is permanent state that every full node keeps in the Merkle Patricia Trie. Writes change consensus state and affect all later blocks, so the protocol meters them heavily. A new slot write costs 20,000 gas plus a cold surcharge, while `MSTORE` costs 3 gas plus expansion.

**What happens on out of gas or an invalid jump?**

The EVM halts the current frame, discards its state changes, and returns an exception to the caller. Pending `TSTORE` writes in that frame are rolled back. If you do not check the success flag after `CALL`, `DELEGATECALL`, or `STATICCALL`, your outer contract continues with stale assumptions.

**Can I write contracts in languages other than Solidity?**

Yes, any language that compiles to EVM bytecode works. Vyper is production grade and used by Curve. Yul is the low-level intermediate Solidity can emit, useful for tight gas work. Huff and inline assembly let you hand-tune opcodes but add audit surface. All must target the same opcode set evm.codes documents.

**What does EVM compatible actually guarantee?**

It guarantees bytecode and tooling portability, not identical economics or security. Your contract can deploy, your ERC-20 transfers the same way, and MetaMask can sign, but block time, gas price, validator count, and bridge risk change per network. Standalone EVM chains use their own consensus, while rollups settle to Ethereum's consensus and derive security from data posting and proofs.

**When does transient storage beat memory versus storage?**

Use memory for data needed only within one internal call. Use transient storage for data that must be seen across internal calls in the same transaction but must not persist to the next block, such as a global lock or flash accounting delta. Use storage for state that must survive beyond the transaction. Transient storage costs 100 gas per access, memory 3 gas plus expansion, storage thousands.

**Why do gas estimates jump between a cold and warm SLOAD?**

Because of EIP-2929. The first `SLOAD` of a slot in a transaction pays 2100 gas cold and warms the slot. The next read of the same slot in the same transaction pays 100 gas warm. If you read the same slot twice without caching in memory, you waste about 2000 gas.

**What should I read next?**

Start with the ethereum.org page on the EVM, last updated 26 July 2026, then the Yellow Paper Berlin version and Appendix G and H for the fee schedule. Keep evm.codes open for opcodes and the ethereum.org walkthrough Understand the Yellow Paper's EVM Specifications for the execution context equations. For changes, read EIP-2929 for access lists, EIP-1559 for the base fee market, EIP-1153 for transient storage, and EIP-5656 for MCOPY. The execution specs at github.com/ethereum/execution-specs are the executable truth.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
4. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
5. [Ethereum EIP-4337 Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337)
6. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
7. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
8. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
9. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
10. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
