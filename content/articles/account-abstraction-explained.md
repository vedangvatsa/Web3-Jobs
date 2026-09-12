---
title: Account Abstraction and ERC-4337 Explained
description: >-
  ERC-4337 lets smart accounts validate UserOperations through EntryPoint,
  bundlers, and optional paymasters without a consensus-layer change.
category: Technology Deep Dives
data-ai-hint: blockchain ethereum
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
slug: account-abstraction-explained
image: >-
  https://images.unsplash.com/photo-1775994121020-86426451f8bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDYyOTAxfDB8MXxzZWFyY2h8MXx8QWNjb3VudCUyMEFic3RyYWN0aW9uJTIwRUlQLTQzMzclMjBUZWNobm9sb2d5fGVufDF8MHx8fDE3ODkxMzc1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080
---

Account abstraction changes the rule that decides whether an Ethereum account may act. A traditional externally owned account, or EOA, authorizes a transaction with one private key under protocol-defined validation rules. A smart account can use contract code to decide what authorization means: a passkey, several signatures, a recovery policy, a spending limit, a session key, or a rule written for one application.

That does not mean a smart account is a magic replacement for every wallet. It moves important decisions into software. The account can recover from a lost signing device, but it can also contain a bug. It can batch several calls, but a poorly designed batch can authorize more than the user understood. It can receive sponsored gas, but the sponsor becomes part of the transaction path. Account abstraction is useful because it makes those choices programmable. It is risky for the same reason.

[ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) is the main Ethereum standard for doing this without changing Ethereum's consensus rules. Instead of adding a new consensus transaction type, it defines a higher-layer object named a `UserOperation`, a shared EntryPoint contract, and an offchain bundler flow. The standard was created in September 2021 and is now Final. Its design lets a smart account act as a user's main account even though an EOA or another authorized top-level sender still submits the actual Ethereum transaction that reaches the chain.

## The Limitation ERC-4337 Works Around

Ethereum historically distinguishes EOAs from contract accounts. An EOA can originate a normal transaction because it has a private key that the protocol recognizes. A contract can hold ETH and tokens, maintain state, and call other contracts after it has been invoked. It cannot independently place a normal transaction into the network's transaction pool.

That split makes a simple wallet easy to describe: one secret key authorizes actions. It also makes several common requirements awkward. A user who loses that key may lose control of the account. A user who wants two trusted devices must either share a key or use a separate multisignature contract. An application that wants to pay a user's first transaction must arrange a relay flow. An approval followed by a swap generally requires two separate transactions unless the application has another authorization mechanism.

ERC-4337 keeps the base protocol's normal transaction processing intact. It places a programmable account behind a contract interface and has a bundler submit a transaction that calls EntryPoint. The smart account decides whether the proposed operation is authorized. Only after the operation passes validation does EntryPoint ask the account to execute its requested calls.

This distinction is important. ERC-4337 does not make ordinary EOAs disappear. It introduces a way to give contract accounts an EOA-like user experience through additional contracts and offchain infrastructure. The result is account abstraction at the application layer.

## The Five Parts of an ERC-4337 Transaction

An ERC-4337 action involves more than a user and a blockchain. The standard gives each participant a narrow role.

### Smart account

The smart account is the contract that represents the user. It stores or refers to the account's authorization state and implements `validateUserOp`. That function receives the proposed operation, a hash, and the amount the account must add to EntryPoint to cover missing funds. The [ERC-4337 interface](https://eips.ethereum.org/EIPS/eip-4337#smart-contract-account-interface) requires the account to check that the caller is a trusted EntryPoint and to validate authorization according to its own rules.

"Own rules" is the core feature. A simple account might validate one ECDSA signature. Another might accept a WebAuthn passkey through an appropriate verifier. A team account might require two signers. A recovery module might accept a guardian quorum after a delay. A session-key module might allow one device to call one contract with a daily spending cap. These policies are account implementation choices. ERC-4337 does not require them or audit them.

### UserOperation

A `UserOperation` describes the action the smart account wants to take. ERC-4337 deliberately avoids calling it a transaction because it is not an Ethereum consensus transaction. Its fields include the sender address, nonce, account-creation information when needed, calldata, gas limits, fee limits, optional paymaster details, and an authorization payload. The standard specifies that the account, not the protocol, defines how to interpret the `signature` field.

Before EntryPoint receives the operation onchain, a client sends it to a bundler through an RPC method such as `eth_sendUserOperation`. A bundler can simulate the operation, reject it, retain it locally, relay it to peers, or include it in a later bundle. A successful RPC response is not finality. The operation still needs a bundler to submit a normal transaction and a block producer to include that transaction.

The nonce model is more flexible than a single EOA sequence. ERC-4337 treats the UserOperation nonce as a 192-bit key plus a 64-bit sequence. An account can use different keys for independent streams, such as ordinary actions and administration. That can avoid one pending operation blocking an unrelated recovery action, provided the account and the bundler support the intended pattern.

### EntryPoint

EntryPoint is the contract that coordinates a bundle. A bundler calls `handleOps` with an array of packed operations and a beneficiary address for collected fees. EntryPoint performs validation before execution. It can create a smart account through a factory if the sender does not yet exist, calculate the maximum required payment, call `validateUserOp`, and then execute the account's requested calldata for operations that passed the checks.

This two-phase structure protects bundlers from a simple denial-of-service problem. A bundler needs to know that an operation will pay for its validation and execution before it spends resources including it. ERC-4337 therefore separates account validation from the requested call. If validation fails, EntryPoint does not execute the requested action. If execution later reverts, the gas accounting and outcome still follow the EntryPoint rules.

EntryPoint is shared infrastructure, so its security matters beyond one wallet. ERC-4337's security section says the contract needs auditing and formal verification because it is a central trust point for compliant accounts. A wallet implementation must also protect every function that should only be called by EntryPoint. An unprotected execution or recovery function can undo the benefit of a careful `validateUserOp` implementation.

### Bundler

A bundler is offchain infrastructure that accepts UserOperations, simulates their validation, groups valid operations, and pays the gas for the resulting Ethereum transaction. It is reimbursed from the account's deposit or from a paymaster deposit through EntryPoint. The bundler does not need to be trusted to authorize an operation. The account and EntryPoint enforce that onchain. The bundler still matters for availability, pricing, privacy, and inclusion.

The standard requires bundlers to simulate validation and defines checks around account creation, gas values, paymaster deposits, and state access. Simulation reduces the chance that a bundle fails because an operation was invalid. It cannot guarantee future success. State can change between simulation and inclusion. A user can send a conflicting operation, a paymaster's balance can change, or fee conditions can move beyond what the operation accepts.

The ERC-4337 specification describes a canonical UserOperation mempool and also allows alternative mempools. It does not fully specify one universal peer-to-peer network or force every bundler to accept the same business policy. In practice, an application should know which bundler service it relies on, what EntryPoint version it supports, how it handles replacement and retries, and what happens if that service is unavailable.

### Paymaster

A paymaster is an optional contract that agrees to cover an operation's gas costs instead of the smart account. It keeps a deposit in EntryPoint. During validation, EntryPoint checks that the paymaster has sufficient funds and calls `validatePaymasterUserOp` to ask whether it will sponsor that specific operation. It may call `postOp` after execution if the paymaster returned context that requires settlement work.

This can support a real product improvement. An application can sponsor a first action, a loyalty reward, or a tightly scoped interaction. The user can approve an operation without first acquiring native gas tokens. The sponsor still pays native gas to the network through the EntryPoint deposit. "Pay gas in USDC" is therefore an application-level arrangement: a paymaster may charge a user in an ERC-20 or receive an offchain authorization, while it settles the Ethereum fee in ETH or the chain's native currency.

Paymasters need strict policy. A permissive one can be drained by arbitrary calls. A token-charging one has price, allowance, and post-execution failure cases. ERC-4337 warns that malicious paymasters can create denial-of-service risks for bundlers and describes reputation and staking controls. Sponsorship should be limited by the operation's target, calldata, value, user, time window, and maximum cost, then tested against failure rather than only the happy path.

## What Happens From Click to Block

Suppose a user wants to approve a token and deposit it into a protocol. A smart-account wallet constructs a UserOperation containing the account address, encoded batch call, gas values, nonce, and account-specific authorization. If the account has not been deployed, the operation can also include factory data that lets EntryPoint create it during the same flow.

The wallet sends the operation to a bundler. The bundler runs validation in a simulated call. EntryPoint checks the account deployment path, invokes the account's validation function, and invokes the paymaster if one is specified. The operation should be rejected before propagation if the simulation cannot demonstrate that it is valid and funded under the applicable rules.

The bundler later makes an ordinary transaction to `EntryPoint.handleOps`. Ethereum validators process that transaction like any other contract call. EntryPoint validates the included operations and calls each smart account to perform the authorized work. It charges the account or paymaster deposit for the execution cost and directs the collected fees to the bundler's beneficiary address.

Atomic batching comes from the account's execution logic, not from a special ability to make unrelated operations atomic. A smart account can encode `approve` and `deposit` as calls within one UserOperation. If its code executes them atomically, either the required sequence succeeds under the contract's rules or the call reverts. An account that executes calls separately or ignores failures has different behavior. Users and auditors have to inspect the implementation.

## Counterfactual Accounts and First Use

ERC-4337 supports counterfactual account creation. A wallet can determine a future smart-account address before the account code exists, often using a factory and deterministic deployment. Someone can send assets to that address before the owner makes the first UserOperation. The first operation carries factory data, EntryPoint asks the factory to create the account, and validation then confirms that the operation is authorized.

This can improve onboarding because a user does not need a separate deployment transaction before receiving funds. It also introduces a security requirement. The factory, account initialization, and address derivation must ensure that an attacker cannot deploy an account at the expected address with different ownership rules. ERC-4337 recommends deterministic creation and explains that the generated address should depend on the initial authorization.

The factory is not a neutral helper. It is code with permissions and potential failure modes. A wallet should know the factory address, account implementation, initialization data, EntryPoint version, and upgrade policy before presenting a new account as self-custody.

## Recovery, Passkeys, and Session Keys Are Policies

Account abstraction makes recovery and alternative authentication possible. It does not prescribe a safe recovery policy. A social recovery design may let several guardians replace a lost signing key after a delay. That can be safer than a single seed phrase, but guardians can collude, become unavailable, lose their keys, or be tricked by a false recovery request. The account needs quorum rules, a delay, cancellation rights, and clear alerts.

Passkeys are also an account policy. A browser or device authenticator can produce a WebAuthn assertion. The smart account needs verification logic that accepts the right credential and binds it to a UserOperation. A passkey can remove the need to show a user a seed phrase. It does not remove backup questions, account migration, phishing risks, or the need to inspect what the wallet asks the user to approve.

Session keys are useful for games, recurring actions, and limited automation. A primary signer can authorize a temporary key to call specified contracts under limits. A good session policy has an expiry, contract allowlist, function selectors, value caps, chain scope, and revocation path. "The key can only spend a little" is not a complete policy unless the account enforces exactly what "little" means.

## ERC-4337 and EIP-7702 Are Different Tools

EIP-7702 is often described as account abstraction, but it solves a different address problem. ERC-4337 normally uses a smart contract account. EIP-7702 lets an EOA authorize a delegation indicator that points to contract code. Ethereum activated EIP-7702 as part of Pectra on 7 May 2025, as recorded in the [Ethereum fork timeline](https://ethereum.org/en/ethereum-forks/).

The [EIP-7702 specification](https://eips.ethereum.org/EIPS/eip-7702) is explicit that the delegation is persistent, not temporary for one transaction. A type `0x04` set-code transaction processes signed authorization tuples and writes a delegation indicator to the authorizing EOA's code. The owner can later change or clear that delegation through another valid authorization. The delegated code runs in the EOA's context, so changing it is a security-critical operation.

EIP-7702 can enable batching, sponsorship, and custom authorization behavior while keeping an existing EOA address. ERC-4337 can also support EIP-7702 delegated accounts in its UserOperation flow on networks where 7702 is enabled. The standards can work together. They should not be conflated. ERC-4337 provides the EntryPoint and bundler architecture. EIP-7702 adds a protocol-level transaction type and persistent code delegation for EOAs.

## The Trade-Offs to Check Before Deployment

Smart accounts add code risk. An EOA's core authorization rule is enforced by the protocol. A smart account's authorization rule is application code that needs review, tests, deployment controls, and an upgrade policy. Upgradable accounts and EIP-7702 delegates also need compatible storage layouts. ERC-4337 specifically warns about storage-layout collisions when implementations change.

They add infrastructure dependence. A user may need an RPC provider, bundler, paymaster, factory, indexer, and wallet backend. Some dependencies are replaceable. Others may be hard-coded into an account or product flow. A credible recovery plan includes alternate bundlers and a direct path to withdraw or use the account when a vendor disappears.

They add gas and complexity. Validation, deployment, paymaster checks, and batch execution have costs beyond a simple transfer. There is no one overhead number that applies to every smart account. Measure the complete UserOperation on the networks and account versions the application will actually use. Measure failure cases too, including an expired paymaster signature, a changed fee market, and a reverting downstream call.

They also add a larger signing surface. A user may see a passkey prompt, a wallet confirmation, a paymaster authorization, and a batch of low-level calls. Better authentication does not help if the interface hides a malicious transfer inside an opaque operation. Wallets should decode targets, values, approvals, permissions, and recovery changes in terms a user can check.

## Questions to Ask About a Smart Account

**Does ERC-4337 remove the need for ETH?**

No. Ethereum still charges gas in its native currency. A paymaster can deposit ETH with EntryPoint and pay on a user's behalf. A token-paymaster design can charge the user in another asset, but the paymaster is the party that settles native gas.

**Can a smart account recover every lost key?**

Only if its installed recovery policy works. ERC-4337 gives the account a place to enforce recovery logic. It does not supply guardians, choose a threshold, or decide who should be trusted.

**Is EIP-7702 a one-transaction delegation?**

No. EIP-7702 writes a persistent delegation indicator to the authorized EOA. A later authorization can replace or clear it. Users should treat a delegation approval as an account-level change, not an ordinary application permission.

**Does using a bundler make the bundler a custodian?**

Not necessarily. A correctly designed smart account validates the operation onchain, so a bundler cannot invent a valid authorization. The bundler can still delay, refuse, observe, or price the operation. Those are meaningful dependencies even when it cannot take funds.

Account abstraction is best understood as a way to write wallet policy in code. The implementation can make self-custody easier to use, or it can hide new control points behind a smoother interface. The difference is visible in the account contract, the recovery rules, the EntryPoint version, the bundler path, and the policy that decides who pays and who may act.
