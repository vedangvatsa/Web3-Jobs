---
title: EigenLayer Activated Mainnet Slashing in April 2025
description: EigenLayer activated its slashing upgrade on Ethereum mainnet on April 17, 2025, adding operator sets and unique stake allocation while leaving each AVS responsible for its own penalty rules.
image: https://storage.ghost.io/c/7b/c8/7bc8df38-c791-4269-be3e-d1e51bd3114c/content/images/2025/04/Slashing.png
category: News
data-ai-hint: EigenLayer slashing operator sets
publishedDate: '2026-09-12'
lastUpdated: '2026-09-12'
---

EigenLayer activated its slashing upgrade on Ethereum mainnet on April 17, 2025. The release introduced the protocol machinery for an Autonomous Verifiable Service, or AVS, to slash an operator's specifically allocated stake after the operator has joined that AVS's operator set. Eigen Labs described the launch in its [April 17 announcement](https://www.eigenlabs.org/blog/slashing-goes-live/); the underlying design is set out in the Eigen Foundation's merged [ELIP-002 proposal](https://github.com/eigenfoundation/ELIPs/blob/main/ELIPs/ELIP-002.md).

The date matters because the original release did not turn every restaked position into slashable collateral overnight. Eigen Labs said before activation that operators and stakers would not be enrolled automatically in AVSs' new terms. An operator must opt into a slashable operator set and have an allocation that is both active and associated with that set. That distinction separates the existence of the protocol feature from the amount of stake an individual AVS can actually penalize.

Slashing is the mechanism through which an AVS can impose an economic penalty when it concludes that an operator failed a service commitment. EigenLayer's own material describes possible commitments broadly, including incorrect computation and liveness failures. It does not establish a universal list of offenses such as double-signing, nor does it make a particular AVS's criteria part of EigenLayer's core rules. The AVS designs the condition, tells operators what it is, and uses the protocol's slashing path if it decides a slash is warranted.

That is a more consequential limitation than the launch language suggests. The core protocol can measure allocation, registration, and stake accounting. It does not independently determine whether an RPC node met an uptime target, whether a cross-chain message was handled correctly, or whether an offchain computation was wrong. Those judgments, their evidence, and any appeal or veto process sit with the AVS unless the AVS has chosen to encode them elsewhere. ELIP-002 is explicit that an AVS may slash an eligible operator for any reason, and that EigenLayer itself provides no veto mechanism.

## What changed on mainnet

The April 2025 upgrade added two linked primitives: operator sets and what EigenLayer calls Unique Stake. The [proposal](https://github.com/eigenfoundation/ELIPs/blob/main/ELIPs/ELIP-002.md#features) describes an operator set as a pair of an AVS address and an identifier. An AVS can create more than one set, choose which restaking strategies are relevant to each, and use a registrar contract to apply its own rules to operator registration.

An operator set is therefore more than a list of machines. It is the protocol boundary at which an AVS can register an operator, accept a specified allocation as security, and later slash that allocation. An AVS might use separate sets for different tasks or hardware requirements, but that is an implementation choice. EigenLayer's launch post used examples involving proof generation and proof verification; they were examples rather than a list of live network roles.

Unique Stake is the accounting rule intended to prevent the same portion of an operator's delegated stake from securing two operator sets at once. Operators allocate a proportion of a strategy's stake to an operator set. For a given strategy, allocations cannot exceed the operator's available magnitude, so an allocated portion is exclusive to that set while it remains allocated. The proposal says this gives an AVS a view of security that another AVS cannot also slash, while allowing the operator to keep other stake unallocated or assign it elsewhere.

The word "unique" should not be read as a promise that every asset behind an operator is isolated from every outcome. It refers to the protocol's allocation of a given strategy's slashable proportion to one operator set. A staker delegates assets to an operator, and EigenLayer's accounting then applies the operator's relevant allocation and slashing factors to the staker's position. In its staker guide, Eigen Labs said that changes to an operator's AVS allocations can affect all of that operator's delegated stakers. Delegation is therefore a choice of operator as well as a choice of restaking asset.

The mainnet implementation introduced the `AllocationManager` contract as the entry point for AVS metadata, operator-set registration, allocation and slashing. The project's [contract documentation](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md) says that an AVS must register metadata before creating operator sets. It also records that an operator has to be registered for a set, the set has to include the relevant strategy, and the operator must have a nonzero current allocation before that allocation can be slashed.

These checks are useful boundaries, but they do not validate an AVS's operational claim. In practical terms, the allocation manager decides whether the AVS has authority over an eligible allocation; the AVS's slasher decides whether to exercise that authority. Readers assessing a service's security should therefore distinguish the amount of allocated stake, which is an onchain accounting fact, from the reliability claim made by the AVS, which depends on its software, monitoring, governance, and response process.

## Opt-in has several steps

Eigen Labs' pre-launch guidance stated that operators already running an AVS were not automatically opted into that AVS's slashable operator sets. The protocol flow also makes clear why an AVS announcement alone is not enough to create slashable security.

First, the AVS must create an operator set and identify the strategies it will accept. It may configure a registrar to reject operators that do not meet its requirements. An operator then allocates slashable magnitude to the set and registers for it. According to the [AllocationManager documentation](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md#registerforoperatorsets), registering an operator with active allocations makes those allocations immediately slashable. The AVS registrar call must succeed for registration to complete.

The allocation itself is not necessarily immediate. On mainnet, the protocol documentation lists a 126,000-block allocation-configuration delay, approximately 17.5 days, before a change to an operator's allocation delay takes effect. The allocation delay selected by an operator then determines when a newly requested allocation becomes active. Eigen Labs told stakers before the launch that the initial allocation process took about 17.5 days, describing the period as time for delegators to respond to a new risk choice.

This produces an important reporting distinction. A dashboard can show an AVS, an operator set, and a registered operator without proving that meaningful slashable stake is active. Conversely, a reported total for delegated stake does not reveal how much of that stake is allocated to a particular operator set. The relevant figure for a particular AVS is the eligible allocation within that set, not the operator's headline delegation total.

The proposal also permits an AVS to add or remove strategies from an operator set. The contract documentation notes a consequence that is easy to miss: if an operator has already allocated a strategy to a set, adding that strategy to the set can make the existing allocation instantly slashable. Operators cannot treat allocation as a one-time configuration that remains economically identical if an AVS later changes the set's strategy list.

## Exit does not immediately remove exposure

The launch changed withdrawal treatment as well as AVS registration. Eigen Labs said on April 2, 2025 that queued withdrawals would take 14 days after the upgrade, so AVSs could account for stake pending withdrawal. The current contract documentation specifies `MIN_WITHDRAWAL_DELAY_BLOCKS` of 100,800 blocks on mainnet, described as roughly 14 days.

Queued withdrawal shares can remain subject to a slash that occurs before the withdrawal is completable. The [DelegationManager documentation](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/DelegationManager.md#queuewithdrawals) says the amount received at completion may be lower if slashing occurred. It also explains that the protocol calculates the relevant slashing factor at the withdrawal's completion block. A withdrawal queue is consequently not a way to freeze the asset amount at the moment a staker elects to leave.

Deregistering from an operator set has a similar property. The AllocationManager documentation says a deregistered operator remains slashable until the deallocation delay has passed. The mainnet deallocation delay is listed as 100,800 blocks, again roughly 14 days. An operator can signal that it is leaving a set, but the security allocated to that set is kept available during the delay so an operator cannot complete a task, exit immediately, and evade a later penalty.

There are two different actions here: deregistration and deallocation. Deregistration removes the operator from the current member list; deallocation changes the amount that is slashable. The proposal says deregistration does not itself queue a deallocation. Treating them as the same action would overstate how quickly exposure disappears.

The timing rules also constrain an AVS's security estimate. A service can observe active allocations, but it must account for pending deallocations and withdrawals when deciding what work to assign. EigenLayer's `getMinimumSlashableStake` view is designed to provide a minimum estimate for a future block while taking planned reductions into account, according to the [AllocationManager documentation](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md#evaluating-how-much-of-the-allocation-is-slashable). That is a protocol tool, not a guarantee that an AVS's own offchain fault detector will be correct.

## Who sets the rules and where funds go

EigenLayer provides the accounting and execution route, but it does not standardize fault definitions across AVSs. Eigen Labs' AVS guide says conditions are tied to specific operator sets but sit outside the EigenLayer protocol. An AVS can adopt onchain proofs, a multisignature process, a committee, a challenge period, or another mechanism. The quality of those safeguards is not established merely because the AVS uses EigenLayer's slashing contracts.

That division of responsibility corrects a claim often made about the launch. There was no protocol-wide veto committee installed to freeze or cancel disputed slashes. ELIP-002 instead says AVSs may build delays or veto periods into their own designs to address bugs, improper slashing, or fraud. Whether such a control exists, who controls it, and how it can be used are facts to verify in the individual AVS's documentation and contracts.

The initial model was slash-and-burn. Eigen Labs later announced on June 5, 2025 that redistribution was live on its Holesky, Sepolia and Hoodi testnets, allowing AVSs to create a new type of operator set that could direct slashed non-native-ETH assets to a fixed recipient. The [testnet announcement](https://www.eigenlabs.org/blog/redistribution-is-live-on-testnet/) said native ETH was not eligible for redistribution in that release and that a redistributing operator set had to be created with that property from the start.

The project's current contract documentation reflects both ordinary and redistributing operator sets. It says an ordinary set uses the default burn address, while a redistributing set may specify a recipient. It also says native ETH cannot be added to a redistributing operator set. This means a claim that EigenLayer slashing generally "reallocates" collateral is incomplete: the destination depends on the operator-set type and asset, and the later redistribution feature was separate from the April launch.

The implementation has another asset-specific limit. The DelegationManager documentation says that slashed ERC-20 strategy shares are handled through a delayed burn-or-redistribution resolution flow. For native ETH, slashed beacon-chain ETH shares accrue in accounting, but the document says there is no equivalent delayed clearing or redistribution execution route, because forced validator exits require Ethereum's Pectra functionality. A reader should not assume that an onchain slashing event produces the same immediate asset movement for every restaked asset.

## What the launch established, and what it did not

Eigen Labs identified LayerZero and Infura's Decentralized Infrastructure Network as launch partners in its April 17 post. The company said LayerZero was implementing slashing on testnet and that Infura's DIN was implementing it for verifiable service-level agreements. Those are the companies' stated plans and use cases, rather than evidence that every operator in either network had already accepted live penalty terms on the launch date.

The launch did establish an enforceable route from an AVS-authorized slash to an operator's eligible allocation. The contract documentation says the AllocationManager reduces an operator's allocation magnitude during a slash, and the DelegationManager updates delegated-share accounting and identifies shares for burning or redistribution. That is a material addition to a restaking system in which an AVS wants collateral attached to an operator's service commitment.

It did not establish that all restaked ETH or liquid staking tokens were automatically exposed, that all AVSs use the same objective offenses, or that EigenLayer adjudicates every dispute. It also did not make an AVS's advertised stake total interchangeable with the collateral allocated to the specific operator set doing the work. The proposal's design makes those variables visible as separate concepts; reporting on an AVS's security should keep them separate too.

For operators and delegators, the durable record is the set of onchain choices: which operator set an operator joined, which strategies and proportions it allocated, whether an allocation is active, and whether a deallocation or withdrawal is still within its slashable delay. For an AVS, the remaining questions are outside the generic protocol release: what it calls a fault, who can invoke a slash, what evidence is required, whether there is a challenge process, and how a successful slash is resolved. The April 2025 activation supplied the shared accounting layer for those choices; it did not answer them for every service.
