---
title: 'Multisig Wallets Explained: How M-of-N Shared Control Works'
image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'
data-ai-hint: multisig wallet security
description: >-
  A multisig wallet needs M of N private keys to approve a transaction, so no single key can move funds alone. Learn how M-of-N works on Bitcoin and on Ethereum with Safe, where it helps, where it adds cost and complexity, and how to set one up safely.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

A multisig wallet is a wallet that needs approval from M of N distinct private keys before it will move funds. A 2-of-3 multisig needs any two of three listed keys. One stolen or lost key alone cannot spend, and losing one key does not lock the funds if you keep the other two and the configuration.

This guide explains what multisig is, who should use it, how it works on Bitcoin and on Ethereum, how it differs from MPC and Shamir sharing, where it helps and where it adds friction, and how to create and verify a multisig you can actually recover.

## What a multisig wallet is in one minute

A normal wallet has one private key. Whoever holds that key can sign. A multisig wallet replaces that single-key check with a quorum rule enforced by code.

- On Bitcoin the rule is part of the output script. The address commits to a script that lists N public keys and a threshold M. The network verifies M valid signatures against those keys before it accepts the spend. This has been possible since BIP-11 in 2012 via bare multisig and since BIP-16 via P2SH.
- On Ethereum and other EVM chains the rule lives in a smart contract. The Safe (formerly Gnosis Safe) contract stores a list of owner addresses and a threshold, hashes each transaction with EIP-712, checks M signatures sorted by owner address, then executes. The assets stay in the contract at a single address.

In both cases the logic is: propose transaction, collect M signatures, execute. Until the threshold is met, the transaction stays pending and no funds move.

Sources you can check: BIP-11 and BIP-16 on https://github.com/bitcoin/bips, BIP-48 for HD multisig derivation at m/48', Safe smart account overview at https://docs.safe.global/advanced/smart-account-overview and Safe contracts overview at https://github.com/safe-global/safe-contracts/blob/main/docs/overview.md

## Who this guide is for

- **Teams and treasuries.** DAOs, startups, funds, and any group where no single person should move money alone. A 3-of-5 or 4-of-7 lets you require approvals from different people or functions.
- **People securing meaningful personal savings.** If losing one device or one seed phrase would be catastrophic, a 2-of-3 distributed across two hardware wallets and one offline backup or collaborative custodian removes that single point of failure.
- **Operators who need inheritance or business continuity.** With N greater than M, one unavailable signer does not freeze the treasury. Remaining signers can still operate and then rotate keys.
- **Builders choosing a custody model.** If you must decide between on-chain multisig, threshold signatures (MPC/FROST), or Shamir sharing for backup, this guide lays out the trade-off you actually pay for.

It is less useful if you sign many small daily payments, you hold a small test balance, or you cannot operate and test a recovery procedure. A poorly run multisig can be less safe than a well-run single hardware wallet. The benefit comes from independent keys, separate locations, and a tested descriptor backup.

## How it works

### The M-of-N rule

Every multisig is an M-of-N quorum:

- N is the total number of keys or owner addresses registered.
- M is the minimum number that must sign for execution.
- Any M subset works. Order does not matter for validity, though Safe requires signatures sorted by address to prevent duplicates.

Common choices balance recovery against collusion risk. Lower M is more tolerant of lost keys but easier for an attacker who can phish M signers. Higher M is more resistant to theft but more brittle if signers disappear.

| Configuration | Keys (N) | Signatures needed (M) | Tolerates lost keys | What one compromised key does | Typical use |
| --- | --- | --- | --- | --- | --- |
| 2-of-3 | 3 | 2 | 1 | Not enough to steal alone | Personal savings, small team treasury |
| 3-of-5 | 5 | 3 | 2 | Not enough alone, needs two more | Company treasury, protocol operations |
| 2-of-2 | 2 | 2 | 0 | Not enough alone | Joint account where both must agree |
| 1-of-3 | 3 | 1 | 2 | Any single key can spend | Redundancy only, not shared control |

For most personal setups, 2-of-3 is the default because it keeps funds movable if one key is lost and keeps theft to at least two separate compromises. For larger organizations, 3-of-5 or 4-of-7 spreads authority across functions.

### How it works on Bitcoin (native, on-chain)

Bitcoin enforces multisig in script, verified by every node. You do not trust a single contract deployer to enforce the rule.

**Address types you will see:**

- **P2SH (pay-to-script-hash, addresses starting with 3).** The full script with N pubkeys and M is hashed into the address. At spend time, the redeem script and M signatures are revealed. Defined by BIP-16. All script data sits in the non-discounted part of the transaction, so fees are highest.
- **P2WSH (pay-to-witness-script-hash, addresses starting with bc1q).** The SegWit version of P2SH. The script and signatures move to the witness, which receives the SegWit discount. A 2-of-3 P2WSH input is roughly 60 percent cheaper than the same 2-of-3 in P2SH because signatures stay in the discounted witness. Current standard for compatible multisig tooling.
- **P2WSH-wrapped-in-P2SH (bc1q inside a 3 address).** Compatibility wrapper for older wallets. Less common now.
- **Taproot P2TR (addresses starting with bc1p, activated November 2021 via BIP-341, BIP-340, BIP-342).** Two paths exist. Key path uses aggregated Schnorr keys with MuSig2 for n-of-n or FROST for m-of-n, producing one key and one signature on chain that looks like a singlesig spend. Script path uses Tapscripts with OP_CHECKSIGADD, which replaces OP_CHECKMULTISIG for batch-verifiable multisig. Key path is private and cheapest, but needs an interactive signing protocol. Script path is simpler but reveals the policy at spend when that leaf is used.

Active descriptors define the wallet. A modern descriptor looks like `wsh(sortedmulti(2, xpub1/48'/0'/0'/2', xpub2/48'/0'/0'/2', xpub3/48'/0'/0'/2'))`. BIP-48 defines the HD path m/48'/coin'/account'/script' for multisig accounts. m/48'/0'/0'/2' is native SegWit P2WSH, m/48'/0'/0'/1' is P2SH-wrapped. BIP-67 defines sortedmulti so the address is deterministic regardless of xpub order. The descriptor plus checksums is the single file you need to rebuild the wallet. Without it, knowing M seed phrases is not enough to find the funds.

**Transaction lifecycle on Bitcoin:**

1. A watch-only coordinator holds the xpubs and descriptor but no private keys. Software like Sparrow, Electrum, Nunchuk, or Specter builds a PSBT (Partially Signed Bitcoin Transaction) with `walletcreatefundedpsbt` in Bitcoin Core.
2. The PSBT travels to signer 1. The hardware device shows destination, amount, change, and fee on its own screen and signs if approved. Each device checks the descriptor it was given at setup, not what the coordinator claims.
3. The PSBT travels to signer 2 (or more until M is reached). That device verifies independently and adds its signature. Keys never meet on one device.
4. The coordinator finalizes and broadcasts. Nodes verify the script and signatures. Fees are paid per vbyte. A 2-of-3 P2WSH input is about 250 vbytes versus about 110 vbytes for a singlesig P2WPKH input. A 3-of-5 can exceed 350 vbytes. A Taproot key path FROST spend stays at about 57.5 vbytes regardless of N, because only one Schnorr signature appears on chain.

Sources: Bitcoin Core multisig tutorial at https://github.com/bitcoin/bitcoin/blob/master/doc/multisig-tutorial.md, BIP-48 at https://github.com/bitcoin/bips/blob/master/bip-0048.mediawiki, Taproot BIP-341 and Schnorr BIP-340, OP_CHECKSIGADD in BIP-342, Blockstream transaction types overview at https://help.blockstream.com/education/transactions/transaction-basics/different-transaction-types

### How it works on Ethereum and EVM chains (smart contract, via Safe)

Ethereum has no native multisig opcode. The logic is a contract.

Safe is the most used implementation. As of Q4 2024 Messari measured over 30 million deployed Safe smart accounts securing over $97 billion, with about 87 percent on Ethereum mainnet. Safe reported crossing $100 billion secured in March 2024 and over 60 million accounts by Q1 2026. Market value of that secured figure moves with token prices, so track current TVS on the Safe reports rather than treating a past dollar figure as fixed.

**Core storage:**

- A linked list of owner addresses. Owners can be EOAs, other contracts, or passkey signers via modules.
- A threshold value between 1 and N. Either can be changed, but only by a transaction that itself meets the threshold.

**Transaction hash and execution:**

Safe builds an EIP-712 hash over to, value, data, operation (Call or DelegateCall), safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, and nonce plus chainId and the Safe address. Signers sign that hash off chain, or approve the hash on chain with `SignMessageLib` which then verifies via EIP-1271.

`execTransaction` is the entry point: `execTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures)`. It checks that enough gas was supplied to satisfy safeTxGas, calls any guard for pre-checks, verifies that at least M distinct owner signatures are valid and sorted by address, executes the call, calls the guard again with success, then optionally refunds the executor in `gasToken` at `gasPrice`. If safeTxGas is set to zero and the inner call fails, the whole transaction reverts and the nonce is not consumed, so you can retry. If safeTxGas is non-zero and the inner call fails, the Safe catches the error, increments the nonce anyway, and the transaction cannot be replayed. That prevents a relayer from holding a signed but unexecuted transaction.

Optional extensions sit outside the core:

- **Modules** (via `execTransactionFromModule`) bypass signature checks and execute through the Safe. Adding or removing a module itself needs M signatures. Modules handle cases like daily spending limits or recovery.
- **Guards** run checks before and after each transaction and can block it.
- **Fallback handler** receives unknown selectors via CALL, not DELEGATECALL, so it cannot write Safe storage directly. This is a deliberate isolation boundary.

**Gas you should budget:**

Four parts make up a Safe transaction: base 21,000 gas, calldata cost (16 gas per non-zero byte, 4 per zero byte), signature checks (about 7,000 gas per ECDSA signature, cheaper for on-chain approvals, variable for contract signatures), and the execution of the target call plus guard and fallback overhead. Most wallets estimate safeTxGas and then double with a buffer because the 63/64ths rule in EIP-150 means not all supplied gas forwards to the inner call. If you use a gas token refund, the formula is `(baseGas + safeTxGas) * gasPrice` paid to the refundReceiver in `gasToken` or ETH if the token is zero address. For batched transactions through `MultiSend`, gas is the sum of sub-calls.

Sources: https://docs.safe.global/advanced/smart-account-overview, https://docs.safe.global/advanced/smart-account-concepts, https://docs.safe.global/reference-smart-account/transactions/execTransaction, https://github.com/safe-global/safe-contracts/blob/main/docs/overview.md, Safe tx gas docs at https://github.com/safe-global/safe-contracts/blob/main/docs/safe_tx_gas.md

### Multisig versus MPC versus Shamir sharing

These three solve the same problem, eliminating a single point of failure, at different layers. The table matters because teams often pick the wrong trust model.

| Property | On-chain multisig (Bitcoin script or Safe) | MPC / threshold signatures | Shamir Secret Sharing (SSS) |
| --- | --- | --- | --- |
| Where policy is enforced | On chain, verified by every node | Off chain in cryptographic protocol, one signature appears on chain | Off chain, key is split then reassembled |
| On-chain visibility | Policy visible for P2SH/P2WSH and Safe. Taproot key path with MuSig2/FROST looks like singlesig | Looks like singlesig (one ECDSA or Schnorr signature) | Looks like singlesig (reassembled key signs normally) |
| Fee | Higher for traditional scripts. P2WSH 2-of-3 about 250 vbytes. Safe pays per signature check plus call | Baseline singlesig fee. 68 vB for ECDSA MPC, 57.5 vB for Schnorr FROST | Singlesig fee, but reassembly has no chain cost |
| Key ever reconstructed in one place | No. Keys never meet | No. Shares never combine into a full key | Yes, twice. At split time and at signing time the full key exists on one device. This is a temporary single point of failure |
| Key rotation | Needs a new address and an on-chain sweep to move funds | Off-chain share refresh, no new address, no fees (proactive secret sharing) | Must create new shares and move funds, old shares stay valid until funds move |
| Signing interaction | Non-interactive per signer, collect and broadcast | Interactive. MPC for ECDSA needs 1 to 9 rounds depending on protocol. FROST needs 2 rounds. Needs coordination service | Non-interactive after reassembly, but needs secure environment for reassembly |
| Auditability | High. Anyone can verify quorum on chain | Low. Observers cannot tell threshold or participants | Low. Private by default, manual audit trail only |
| Maturity | Bitcoin multisig since 2012, Safe since 2018, both widely audited | Many competing ECDSA protocols (GG18, Lindell et al. 2018 and later variants), no single agreed standard. Vendor-specific. Known exploits like BitForge, TSSHOCK, Alpha-Rays in some implementations | Simple, from 1979. Trezor Shamir Backup (SLIP-39) since 2017 offers a productized form with 20-word shares |
| Best fit | Personal cold storage, DAO treasuries where public verifiability matters, Bitcoin custody | Exchanges needing high throughput and rotation without sweeps, multi-chain custody with one policy | Low-cost offline backup for a single key, not shared control between distrusting parties. Often layered under a multisig, not instead of it |

Standard guidance from custody research is: use script or contract multisig as the base layer that is enforceable on chain, and if you need extra protection for an individual key inside that quorum, protect that single key with SSS or MPC at the key-agent layer. Do not replace a multisig quorum with SSS alone if the goal is to prevent any one compromised device from moving funds.

Sources: Unchained comparison at https://www.unchained.com/blog/mpc-vs-multisig-vs-sss, Bitcoin Magazine at https://bitcoinmagazine.com/technical/multisig-shamirs-secret-sharing-mpc-compared, Spark MPC vs multisig custody at https://www.spark.money/research/bitcoin-mpc-vs-multisig-custody and Bitcoin multisig wallets at https://www.spark.money/research/bitcoin-multisig-wallets-explained, Trezor SLIP-39 docs at https://trezor.io/learn/advanced/standards-proposals/what-is-shamir-backup, FROST RFC 9591

## Pros and cons

**Where multisig helps**

- No single key can spend alone. An attacker who steals one hardware wallet, one phone, or one seed phrase in a 2-of-3 cannot move funds. They must compromise two independent locations at the same time.
- No single person can act alone. Co-founders, treasury councils, or family members must collude to reach M. This prevents unilateral spending and insider theft.
- One lost key does not mean lost funds when N is greater than M. In a 2-of-3, lose one key and move the funds with the other two to a fresh descriptor. This is a recovery gain over singlesig.
- On-chain verifiability. For Bitcoin P2SH/P2WSH and Safe, anyone can check the quorum and which policies are active. This maps to fiduciary duties, SOC 2 access control, and audit trails.
- Policy can be granular. Safe modules let you define spending limits that one key can spend alone up to a daily cap but need full quorum above it. Bitcoin can layer timelocks like CheckSequenceVerify for similar delayed paths.

**Where it adds cost or risk**

- Higher fees per spend. Bitcoin multisig inputs carry more witness data. Ethereum Safe checks each signature and pays for inner execution. A non-batched Safe transaction costs more than a direct EOA call, often 30 to 60 percent more for a simple transfer. Batching through MultiSend and using L2s offsets this.
- Slower operations. Every transaction needs M people available, on the right device, verifying the same payload. Coordination time grows with M. Time-sensitive moves need a policy or a module that allows fast paths for small amounts.
- Interface spoofing bypasses key diversity. If the UI shown to each signer is compromised (DNS hijack, malicious browser extension, poisoned coordinator build), every signer can be shown "pay 1 ETH to team.eth" while the hash they sign says "pay 100 ETH to attacker". Hardware screens mitigate this because each device shows its own view of the destination and amount, but signers must actually read that screen.
- Targeted phishing across signers. A quorum of known signers (published Safe owners, public DAO council) can be phished in parallel. Out-of-band confirmation per transaction on a separate channel helps, but it depends on discipline, not just technology.
- Smart contract risk for EVM multisig. The contract itself is a trust point. Parity's 2017 multisig freeze locked about $150 million of ETH due to a library bug, not a key theft. Use a widely audited implementation, pin a specific singleton version, and avoid custom modules unless audited.
- Recovery requires the descriptor or Safe configuration, not just the seeds. On Bitcoin, losing the descriptor means you have the keys but not the address derivation, sorting order, or script type. Without it, funds are technically present but hard to locate. On Safe, losing track of which singleton version and chain the Safe was deployed on complicates recovery. Back up descriptor and deployment details separately from any single seed.
- Key changes require an on-chain move for traditional multisig. Rotating a Bitcoin signer or changing M-of-N needs a new address and a sweep transaction. MPC and FROST can refresh shares off chain without moving funds or changing the address. Plan rotation before you need it.
- Correlated storage kills the benefit. A 2-of-3 where two seeds sit in the same password manager, same cloud backup, or same house gives the same breach impact as singlesig. Diversity must be real: different people, different brands of hardware, different operating systems, different physical locations.

## How to get started

### Choosing a configuration

1. Count how much would be painful to lose or have stolen, and how often you will sign. Infrequent vault moves favor multisig. Frequent small payments favor a singlesig hot wallet linked to a vault.
2. Pick M and N so that loss of the most likely single event does not freeze or expose you. For personal cold storage, 2-of-3 with two hardware wallets in separate physical locations plus one geographically distant backup works for many holders. For a company or DAO, 3-of-5 across operations, security, finance, an executive, and one offline backup spreads functions and avoids two-person collusion. Document who holds what and how to reach them.
3. Decide where verifiability matters. If auditors, donors, or community members must verify the quorum on chain, use native multisig. If fees and privacy dominate and you can run an interactive signing service, threshold signatures can reduce on-chain footprint.

### For Bitcoin: a 2-of-3 P2WSH setup you can verify

1. Get three independent signing devices from at least two vendors. Examples that support PSBT and descriptors are Coldcard, Trezor Safe 3/5, Ledger Nano series, and BitBox02. Initialize each device separately and write its seed phrase to steel or paper stored in a different location. Do not photograph seeds.
2. On each device, export the xpub for the multisig path. For native SegWit this is m/48'/0'/0'/2'. Verify the xpub on the device screen, not just on the computer.
3. On a coordinator that holds no keys (Sparrow Wallet, Electrum, or Specter on a clean machine), create a new multisig wallet. Import the three xpubs, choose sortedmulti and threshold 2, and confirm it shows the correct descriptor: `wsh(sortedmulti(2, xpub1, xpub2, xpub3))`. Save the descriptor file and its checksum. The coordinator will show the first receiving address, starting with bc1q for P2WSH.
4. On each hardware device, register the wallet descriptor so the device knows the exact policy. Coldcard uses the descriptor import via SD card. Trezor and Ledger register through the coordinator. Each device will confirm the wallet fingerprint and first address. Check that all three agree on the same first address.
5. Back up the descriptor in at least two places separate from any single seed. The descriptor contains only public keys and policy, but losing it makes recovery hard. Print it, save the .json file to two offline media, and store each copy with a different seed backup. Do not co-locate a descriptor copy with every seed, but keep at least one copy reachable without assembling all seeds.
6. Test with a small amount. Send a small coin to the first address, create a small spend PSBT on the coordinator, sign on two devices by verifying the destination and fee on each device screen, finalize on the coordinator, and broadcast. Confirm the transaction on a block explorer shows a P2WSH input and that your coordinator lists the UTXO.
7. Test recovery. On a separate offline machine, import the descriptor and use two of the three seeds to rebuild the wallet and check that it derives the same addresses and can sign. If you use Electrum, Specter, or Sparrow, import the same descriptor rather than typing seeds into a hot machine. Wipe the test machine after.
8. Document rotation. Write down how you will move to a new descriptor if a device is lost or a signer leaves: create new xpub set, deploy new descriptor, sweep funds, verify on each remaining device, and destroy old descriptor copies that included the retired signer.

**Where to only use Taproot key path:** if all signers can run interactive signing software (FROST coordinator like Frostsnap) and you value privacy and the lowest fees, a MuSig2 n-of-n or FROST m-of-n P2TR descriptor produces a bc1p address with one aggregate key. This hides the quorum on chain and keeps fees near singlesig levels. Confirm that every signer in your set supports the same MuSig2/FROST version before committing funds, because mixing implementations can lock funds.

### For Ethereum and EVM chains: a Safe 2-of-3 or 3-of-5

1. Create at https://app.safe.global. Choose the network first. Check that the Safe singleton version (for example 1.4.1) matches what your chain supports and what docs.safe.global lists for that chain. The address is a proxy pointing to the singleton via the Singleton Factory, so the same address can be replicated on other chains but each deployment is separate.
2. Add owner addresses. These are existing EOAs or passkey signers. Paste addresses carefully and verify on the Safe UI that they are correct. Set the threshold. Name the Safe and save the deployment details: chain, singleton version, owners, threshold, and the Safe address itself.
3. Fund with a small test amount. Deposit a small amount of the chain's gas token and one ERC-20 you plan to use.
4. Propose a test transaction. Use the Safe Transaction Builder or send a 0.001 ETH transfer to a known address. The proposer signs the EIP-712 hash. Collect M signatures: owners sign in the Safe UI, on their hardware wallet screen (Ledger or Trezor via WalletConnect or Browser extension), or by on-chain `approveHash` if they prefer not to sign off chain.
5. Verify before executing. Each signer should check to, value, data (or decoded function call), safeTxGas, gasToken, and refundReceiver on their own device or in the Safe UI simulation. Check that the nonce matches the Safe's current nonce. Compare the decoded call against a second channel (for example a Signal group) if the amount is material.
6. Execute and review. One owner submits `execTransaction` with the collected signatures. Check the explorer: the Safe address is the sender. Confirm the inner call succeeded (status 1) and that no guard blocked it. Keep the first transactions small until every signer has practiced.
7. Plan for upgrades and limits. If you need daily small spends without full quorum, add a vetted module such as an allowances module or a Zodiac module. Adding a module itself needs M signatures, so review the module code and audit history first. Never add an unaudited module to a treasury Safe.
8. Back up the operational record. Export the Safe JSON (owners, threshold, singleton version, chainId, nonce), store it with the multisig procedure document, and note the fallback handler if set. Store this where signers can find it without asking a single person for access.

### Security practices that apply to both chains

- Back up the descriptor or Safe configuration separately from seeds. For Bitcoin, keep the output descriptor file and checksum. For Safe, keep the chain, singleton address, owner list, threshold, and any module addresses.
- Keep signer diversity real. Different people, different hardware vendors, different operating systems, different locations. Test that compromise of one laptop or one password manager does not give an attacker two keys.
- Verify on device screens. Each hardware signer must display the actual transaction hash or decoded call data. Read the screen, not just the coordinator tab.
- Confirm out of band above a threshold you define. For example, any transfer above 1,000 USDC or 0.5 BTC needs a live voice or video confirmation on a separate channel before any signature is added.
- Rehearse signer replacement. Write and test the exact steps to replace a signer: deploy new Safe with new owners, or create a new Bitcoin descriptor with a new xpub and sweep. Time how long it takes and who must be present.
- Keep spending keys low. Use a separate singlesig hot wallet or a Safe module with a daily allowance for routine small payments. Keep the quorum vault isolated and rarely connected.
- Review fee and L1 finality per chain. On Bitcoin, fees spike with demand and vbyte usage matters for multisig. On EVM, Safe transactions pay per signature and per inner call, and L2 finality depends on blob posting and batch cadence. Check a fee tracker for the chain you use before broadcasting.
- Update only from official sources. Get Safe at https://app.safe.global and docs at https://docs.safe.global. Get Bitcoin coordinators at https://sparrowwallet.com, https://electrum.org, or https://specter.solutions, and hardware firmware only from the vendor site. Verify releases by signature where offered.

## FAQ

**Is a 2-of-3 multisig less safe than a 3-of-5?**

It depends on which risk you fear more. A 3-of-5 tolerates two lost keys instead of one and needs three compromises to steal instead of two, but it is harder to coordinate and more likely that signers are unavailable. Pick based on how many independent, reachable signers you can actually maintain and how often you must sign. There is no single best threshold for every group.

**Does multisig hide how many signers I have?**

On Bitcoin P2SH and P2WSH, no. The redeem script and which keys signed are revealed at spend, so observers see N, M, and the pubkeys. On Ethereum Safe, the transaction shows the Safe address and the verification checks each signature, and the collected signatures are submitted as calldata, so observers also see how many signatures were used. Taproot key path with MuSig2 or FROST is the exception: the on-chain key and signature look like singlesig.

**Can I change the threshold later?**

On Bitcoin, no without moving funds. The threshold is baked into the scriptPubKey. You must create a new descriptor with the new M-of-N and sweep funds to new addresses. On Safe, yes with an on-chain transaction. Owners submit a Safe transaction that calls the Safe itself to change the threshold or owner list, which must itself meet the current threshold.

**What happens if we lose enough keys to fall below M?**

Funds become inaccessible at the protocol layer, not just in the UI. On Bitcoin you would need to recover the missing seeds or find another copy. On Safe you would need the missing owners to sign. That is why you test recovery and store the descriptor or Safe export in places that do not depend on a single signer.

**How is multisig different from splitting one seed phrase into shares?**

Splitting one seed with Shamir sharing gives you multiple pieces of one key. At signing time those pieces reassemble the full private key on one device, so that moment is a single point of failure. Multisig keeps distinct keys that never meet on one device. Shares protect one key. Multisig protects the quorum. Trezor's Shamir Backup (SLIP-39) uses 20-word shares for backup, but it is still a backup for singlesig, not shared on-chain control between distrusting parties.

**Do we pay more to use multisig?**

Yes per transaction, though the amount varies. Bitcoin P2WSH 2-of-3 inputs use more vbytes than singlesig. Safe pays about 7,000 gas per ECDSA signature plus base and calldata plus inner call gas. Batched transactions via MultiSend on Safe, and Taproot key path FROST on Bitcoin, reduce the marginal cost when you have many operations.

**Can one Safe control assets on many chains at the same address?**

The Proxy Factory plus Singleton Factory allows deterministic deployment to the same address on many EVM chains, but each chain holds its own Safe instance with its own balances and nonce. Changing owners on Ethereum does not change owners on Base automatically. Keep a per-chain deployment record.

**What should we set up for inheritance?**

Define two separate packages: the technical package (where each seed and descriptor copy lives, how to reach each signer, and which Safe or descriptor version was used) and the legal package (who is authorized to act). Use separate locations, sealed instructions for an executor, and a rehearsal with the people who would actually execute. Do not store all instructions with a single holder of a signing key.

**Which wallet software should we start with?**

For Bitcoin, Sparrow or Specter as coordinator plus Coldcard, Trezor Safe, Ledger, or BitBox02 as signers is a common verified path with broad PSBT and descriptor support. For EVM, Safe at https://app.safe.global with hardware wallets as owners is the most widely audited default in 2026. Both paths have step-by-step official docs you can follow without building custom tooling.

**When is MPC or FROST a better choice than plain multisig?**

When you need to rotate keys without an on-chain sweep, produce singlesig-sized private transactions at high frequency, or manage the same threshold policy across many chains without redeploying multisig contracts on each chain. If public verifiability of the quorum matters more than privacy, or if you want the simplest, most reviewed setup with open recovery tools, plain multisig remains the conservative choice.

---

*Sources: Safe smart account docs at https://docs.safe.global and contracts at https://github.com/safe-global/safe-contracts; Safe Foundation reports (March 2024 $100B secured, Q4 2024 and Q3 2024 Messari State of Safe reports, Q1 2026 quarterly report with 61.1M total Safes); Bitcoin BIPs 11, 16, 32, 48, 67, 340, 341, 342; Bitcoin Core multisig tutorial; Blockstream transaction types help page; Spark Money research on multisig, MPC, and FROST; Unchained and Bitcoin Magazine comparisons of multisig, SSS, and MPC; Trezor SLIP-39 Shamir Backup docs.*
