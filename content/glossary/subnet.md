---
term: Subnet
slug: subnet
category: blockchain-fundamentals
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80'
description: >-
  A custom blockchain running on top of a validator network, sharing security
  with the base network while enabling specialized applications and custom
  configurations.
relatedTerms:
  - sidechain
  - layer2
  - validator
  - blockchain
synonyms:
  - subchain
  - custom blockchain
  - application-specific chain
lastUpdated: 2026-09-04
---

## Definition

A subnet is a separate blockchain environment with its own rules, state, and validator requirements, usually created within a wider network architecture. The word is most closely associated with Avalanche, where a subnet is a dynamic set of validators that cooperatively validate one or more blockchains. A subnet can run an application-specific chain with its own virtual machine, fees, permissions, and token design.

The term does not guarantee shared security. The security of a subnet depends on who validates it, what stake backs those validators, and which network rules require them to participate. In Avalanche's Primary Network model, validators of a custom subnet must also validate the Primary Network and meet its staking requirements. That relationship does not mean every validator of the parent network validates the custom chain.

Projects use subnets when they need different execution rules or predictable capacity without changing a public main chain.

## How It Works

An operator chooses the subnet's membership and validation rules, subject to the host network's protocol. Validators join the subnet by staking or registering as required and run the software needed to validate its chain. The validator set reaches consensus on the blocks for that chain. Its decisions are separate from the state and block production of other chains.

The chain can run an Ethereum Virtual Machine-compatible environment, a custom virtual machine, or another execution design. Its rules can define which transactions are valid, whether addresses need permission, how fees are paid, and how software upgrades occur. A permissioned subnet might require validators and users to pass an identity check. A public one might allow any user to submit transactions while requiring operators to meet a staking threshold.

Assets and messages can move between chains through a bridge or interoperability protocol. That connection needs its own verification model. A chain cannot simply treat an asset on another chain as local without a contract or protocol that locks, burns, verifies, or represents it. The subnet also needs its own explorer, RPC endpoints, wallets, indexing, and operational monitoring.

## Concrete Example

Suppose a game launches a subnet with an EVM-compatible chain. The game uses a token called GEM to pay transaction fees, and it wants players to complete actions in a few seconds without competing with unrelated mainnet activity. The team deploys its game contracts on the subnet and recruits validators that meet the network's requirements.

When a player crafts an item, the transaction changes only the subnet's state. The subnet validators agree on the block and charge GEM for the fee. The main chain does not execute that game transaction. A player who wants to bring a stablecoin from the main chain uses the designated bridge. The bridge locks or escrows the original asset under its rules and issues a corresponding representation on the subnet.

If the game chain has few validators or the bridge is poorly secured, the player's risk is not equal to holding the original asset on the main chain. The custom chain's convenience comes with separate security and operations to evaluate.

## Limitations And Risks

Launching a subnet does not automatically provide the economic security of a large public network. A small validator set may be easier to disrupt, censor, or corrupt. Validator rewards must be sufficient to keep operators online. If the chain requires specialized hardware or compliance checks, the validator set may become concentrated.

Cross-chain bridges are frequent sources of loss and complexity. The bridge may rely on multisignature operators, light-client verification, or another trust model. A failure in the bridge can affect assets represented on the subnet even if the subnet consensus remains sound. Liquidity can also fragment when users and applications are spread across many chains.

Custom rules increase maintenance work. Teams must handle upgrades, node software, RPC availability, wallet support, indexing, and incident response. Permissioned designs may meet operational requirements but reduce open participation and censorship resistance.

## Relevant Distinctions

In Avalanche terminology, a subnet is the validator group, while a blockchain is the ledger that group validates. In common discussion, "subnet" often refers to the whole custom chain. Keeping the distinction clear matters when describing validator security.

A subnet differs from a sidechain. A sidechain is broadly an independent chain connected to another chain, usually with its own validator security. A subnet may have specific membership ties to a parent network, but its degree of shared security depends on the protocol. It also differs from a layer 2 rollup. A rollup normally posts data or proofs to a layer 1 and relies on that layer for key settlement or dispute functions. A subnet generally reaches its own consensus and finality. Parachains and Cosmos zones can resemble subnets in purpose, but their shared-security and interoperability rules are not identical.
