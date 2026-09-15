---
title: 'Account Abstraction and EIP-4337 Explained'
ogTitle: "ACCOUNT ABSTRACTION AND EIP-4337 EXPLAINED"
description: >-
  ERC-4337 replaces traditional seed-phrase EOAs with programmable smart
  accounts. Learn how UserOperations, EntryPoint, bundlers, and paymasters
  function.
category: Technology Deep Dives
data-ai-hint: blockchain ethereum
publishedDate: '2026-03-11'
lastUpdated: "2026-09-15"
slug: account-abstraction-explained
---

Account abstraction changes how an Ethereum account authorizes an action and pays its network fee. Under [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337), the account can be a smart contract with its own validation rules. A user can still sign with a private key, but the account contract can also accept a passkey, require several signers, restrict a session key, or provide a recovery process. The Ethereum protocol does not need a new consensus rule for this model. ERC-4337 uses an EntryPoint contract and an off-chain UserOperation network instead.

The term can sound broader than the standard. Ethereum already has contract accounts, and contracts can hold ETH and tokens. The specific problem ERC-4337 addresses is that a conventional contract account cannot start an Ethereum transaction by itself. An externally owned account must submit the transaction that calls it. ERC-4337 lets a smart account act as the account represented in a user action, while a separate actor submits the underlying Ethereum transaction.

## EOAs and contract accounts

Ethereum has two account types. An [externally owned account, or EOA](https://ethereum.org/developers/docs/accounts/), is controlled by whoever holds its private key. It can initiate a transaction. Its authorization model is fixed by the protocol: the network verifies a signature, checks the nonce and checks that the account can pay for gas.

A contract account is controlled by code stored at its address. It has no private key. It can receive assets and run code when another transaction calls it, but it can send messages only while responding to that call. Deploying it also costs gas. These are protocol properties, not wallet-interface choices.

An EOA is deliberately simple. A lost key cannot be rotated by the protocol, and a valid signature from that key authorizes the transaction. Wallet software can add warnings, hardware signing, backups, or multisignature arrangements around an EOA, but the address itself still follows the EOA rules.

A smart account moves part of that policy into code. The account may define which credentials are valid, when they are valid, and which calls each credential may make. For example, an account could keep an owner key for administration and allow a session key to spend a limited amount with one application until an expiry time. It could require two of three recovery guardians to change the owner after a delay. Those are account implementation decisions, not capabilities that every ERC-4337 account automatically has.

Programmability also changes the failure modes. A flaw in account code, an unsafe upgrade path, or a recovery rule that attackers can satisfy can put all funds in the account at risk. An EOA concentrates risk in a key. A smart account spreads trust across code, credentials, recovery participants, and sometimes an upgrade administrator.

## What ERC-4337 adds

ERC-4337 defines a higher-layer path for smart accounts. Instead of placing a normal transaction directly in Ethereum's transaction pool, a client sends a `UserOperation` to a bundler. The [ERC-4337 specification](https://eips.ethereum.org/EIPS/eip-4337) calls it a pseudo-transaction because it is not an Ethereum transaction type.

A UserOperation includes the smart account address, a nonce, the call data the account should execute, gas limits and fee caps, and signature data. It can also include factory data for a first-time account deployment and paymaster data when a third party will cover gas. The meaning of the signature is defined by the smart account, not by Ethereum's fixed EOA signature check.

The operation hash binds the action to the chain ID and EntryPoint address. That requirement helps prevent the same authorization from being replayed on another chain or against another EntryPoint version. ERC-4337 also uses a nonce with a 192-bit key and a 64-bit sequence. The sequence increases within each key, so an account can separate independent ordered streams, such as ordinary actions and administrative actions.

The EntryPoint is the on-chain coordinator. Its core function is `handleOps`, which accepts a batch of packed UserOperations. During the verification phase, it can deploy an account through its factory, calls the account's `validateUserOp` function, checks available funds, and, if present, calls the paymaster. It executes the account's requested call only after validation succeeds. Excess prefunded gas is returned after execution according to the contract's accounting rules.

This separation is not cosmetic. A bundler must know before it pays to submit a bundle that an operation can cover its costs. ERC-4337 therefore separates validation, including acceptance of the fee, from the call the account wants to make. A failed application call can still consume gas. Validation success does not guarantee that a token swap, contract interaction, or other requested execution will succeed.

## Bundlers and the UserOperation path

A bundler is an off-chain node that receives UserOperations, checks them, groups them, and sends a normal Ethereum transaction calling `EntryPoint.handleOps`. The bundler pays the transaction's network fee first. The EntryPoint then reimburses the bundler's chosen beneficiary from the account deposit or a paymaster deposit.

The standard describes three checks: a check when a bundler receives an operation, another when it builds a bundle, and a final check of the complete bundle before submission. Bundlers simulate validation because smart-account validation is EVM code that can depend on state. An operation that looked valid earlier can become invalid if relevant state changes before inclusion.

That makes a bundler different from a passive relay. It needs RPC access and tracing support, must enforce simulation rules, and may reject an operation based on fee settings, gas estimates, account code, or its own service policy. A wallet that sends only to one provider is depending on that provider for timely inclusion, even though the resulting bundle is an ordinary on-chain transaction once submitted. ERC-4337's stated design goal is permissionless bundling, but a particular application's availability still depends on the bundlers and RPC infrastructure it chooses.

The separate UserOperation mempool is also not the same thing as Ethereum's public transaction mempool. ERC-4337 defines a canonical peer-to-peer mempool and permits alternative mempools with different rules. In practice, a UserOperation's propagation and acceptance can vary with bundler support. A standard Ethereum transaction can be broadcast to ordinary Ethereum nodes; an ERC-4337 UserOperation requires a compatible bundler endpoint.

## Paymasters and gas sponsorship

A paymaster is an optional contract that agrees to pay for a UserOperation instead of the smart account. It deposits ETH, or the chain's native currency, in the EntryPoint. During validation, the EntryPoint asks `validatePaymasterUserOp` whether the paymaster accepts the operation and whether its deposit can cover the maximum cost. If the paymaster returns context, the EntryPoint calls its `postOp` function after the account's execution.

This permits a product to sponsor selected actions. A paymaster might accept only a first action for an account, only calls to its own application, or only authorizations issued by its server. The policy belongs to the paymaster implementation. Sponsorship is therefore not free gas supplied by Ethereum. Someone funds the paymaster deposit and sets the conditions under which it will spend that balance.

ERC-4337 also names ERC-20 fee payment as a use case. The underlying network fee is still paid in the native currency by the bundler and settled through the EntryPoint. A token-paymaster design can charge the user a token amount, pre-charge a maximum amount, and refund any excess, while the paymaster uses its native-token deposit for the actual gas bill. The token price, exchange mechanism, permitted token, and refund rules are application-specific. A wallet should show those terms rather than describe every paymaster as equivalent to paying Ethereum directly with a stablecoin.

Paymasters take on a distinct risk: they pay gas even when the requested account execution reverts after a valid operation. They also present a denial-of-service target. ERC-4337 requires a deposit and describes a stake with an unstake delay for entities that need broader storage access. The stake is separate from the deposit used to pay fees. It is intended to make abusive identities more costly to replace, not to reimburse users after a loss.

## Security boundaries and tradeoffs

The EntryPoint is shared infrastructure. The ERC-4337 security section says it needs auditing and formal verification because all ERC-4337 accounts rely on its correct behavior. Account implementations must also check that `validateUserOp` is called by their trusted EntryPoint. A missing caller check could let an arbitrary caller reach validation logic under conditions the account did not intend.

Account code needs a narrow definition of authorization. A multisignature account must define how signatures are counted and protect signer changes. A passkey account must correctly verify the relevant signature scheme and bind the signed data to its own account and chain. A session-key account needs limits on targets, values, methods, and expiration. A recovery flow needs an unambiguous guardian set, a threshold, and a way to cancel a malicious recovery. These checks are not supplied by `handleOps`.

Upgradeability requires another decision. A proxy can make it possible to repair defects, but whoever can upgrade the implementation may gain control over the account's behavior. Storage-layout mistakes can corrupt ownership or recovery data. ERC-4337 specifically warns upgradeable smart accounts to avoid storage collisions between implementations. An account owner should know whether the account is immutable, self-upgradeable under defined rules, or controlled by an external upgrade authority.

Bundlers cannot safely accept arbitrary validation code without limits. The [ERC-7562 draft](https://eips.ethereum.org/EIPS/eip-7562) specifies validation-scope rules to protect bundlers from unpaid computation and mass invalidation. During validation it restricts access to block-dependent information, certain opcodes, and unrelated storage. It also defines reputation and throttling rules for entities such as paymasters and factories. Those limits apply to validation, not to the account's later execution call.

The restriction has a practical effect on account design. A validation rule that reads a changing global price, depends on the current block number, or relies on unrestricted external contract state may not be acceptable to a canonical UserOperation mempool. Put ordinary application logic in execution where possible. Keep validation focused on authorization, nonce handling, time bounds, and the ability to fund the operation.

There is also no universal recovery answer. Guardians can reduce the chance that one lost device permanently blocks access, but they create a social attack surface. If enough guardians collude, are compromised, or approve a deceptive request, they can take control. A recovery delay gives the current owner time to respond, but it also delays legitimate recovery. The appropriate design depends on the value at risk and who the guardians are.

## Costs, compatibility, and practical limits

Smart accounts can batch multiple calls inside one UserOperation. If all calls execute in the same transaction, the group is atomic: a failed call can cause the account's batch logic to revert. Batching may avoid separate base transaction costs, but it does not make the underlying contract calls free. ERC-4337 adds verification work, EntryPoint work, and UserOperation calldata overhead. Initial deployment adds further cost when an account is created through a factory.

Fee estimation is more involved than an EOA transfer. A UserOperation has execution gas, verification gas, and `preVerificationGas` for data and shared transaction costs. The specification applies a 10% penalty to sufficiently large unused portions of `callGasLimit` and `paymasterPostOpGasLimit`. Overstating limits can therefore cost money; understating them can cause an operation to be rejected or fail.

Support is also uneven across wallets, applications, RPC services, and networks. An application must use a compatible EntryPoint, bundler RPC methods such as `eth_sendUserOperation`, and account implementation. Contracts that assume `msg.sender` is an EOA, reject contract callers, or rely on `tx.origin` can be incompatible with smart-account calls. The application should test its entire flow, including account deployment, signature verification, sponsored actions, failure receipts, and recovery, rather than treating ERC-4337 support as a wallet-only change.

ERC-4337 is separate from [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), which adds an authorization mechanism for an EOA to set code delegation. ERC-4337 can support EIP-7702 authorizations on networks where that EIP is enabled. They solve related problems through different mechanisms: ERC-4337 supplies a UserOperation and EntryPoint path, while EIP-7702 changes what an EOA can delegate to during transaction processing. An account design needs to state which mechanism it uses, because the signing flow, deployment model, and compatibility assumptions differ.

Account abstraction gives developers more control over an account's rules. It does not remove the need to protect credentials, inspect what a signature authorizes, or understand who can change those rules. The durable question is not whether an address is called a smart wallet. It is which code validates actions, which EntryPoint it trusts, who funds gas, and which people or keys can recover or upgrade control.
