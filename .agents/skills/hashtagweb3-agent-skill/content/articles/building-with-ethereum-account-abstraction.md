---
title: 'Building with Ethereum Account Abstraction: ERC-4337 and EIP-7702 in Practice'
image: 'https://picsum.photos/seed/aa-build/1200/630'
description: >-
  A practical guide to building with Ethereum account abstraction. Learn how ERC-4337 smart accounts and EIP-7702 delegated EOAs work, when to use each, and how to ship batching, gas sponsorship, and passkey login with working code.
category: Technology Deep Dives
data-ai-hint: blockchain ethereum
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

Account abstraction lets an Ethereum account run code to decide how it verifies a transaction. ERC-4337 provides that today through smart contract wallets and an off-chain bundler network. EIP-7702, live since the Pectra upgrade on 7 May 2025, lets an existing EOA delegate to that same code while keeping its address. This guide shows what each path does, how the pieces fit, where they help, where they cost more, and how to build with them.

## What it is

Account abstraction means your account defines its own validation logic in a contract instead of using Ethereum's single built-in rule for EOAs.

Ethereum started with two account types. An externally owned account (EOA) is a key pair. Only an EOA can start a transaction, and the protocol checks one signature scheme, ECDSA on secp256k1. A contract account holds code but cannot start a transaction. It only runs when called.

ERC-4337 removes that split without a hard fork. You deploy a smart account contract that implements `validateUserOp`. The protocol does not change. Instead you send a `UserOperation` to a separate mempool, a bundler carries it to a shared EntryPoint contract, and EntryPoint calls your account to verify and execute. EIP-7702 adds a protocol path. Your EOA signs an authorization to point its code to a delegation contract for that transaction, using type 0x04. The EntryPoint can then handle that EOA as a smart account. The result is the same set of features, with a different address model.

ERC-4337 was proposed on 29 September 2021 by Vitalik Buterin, Yoav Weiss, Dror Tirosh, Shahaf Nacson, Alex Forshtat, Kristof Gazso and Tjaden Hess. It is published as ERC-4337 and relies on EIP-712 for the UserOperation hash. EIP-7702 was included in the Pectra hard fork that activated on Ethereum mainnet at epoch 364032 on 7 May 2025 at 10:05 UTC, as documented by the Ethereum Foundation and ethereum.org.

Canonical EntryPoints you will see on mainnet and major L2s:

- v0.6: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- v0.7: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- v0.8: `0x4337084d9e255ff0702461cf8895ce9e3b5ff108`
- v0.9: `0x433709009B8330FDa32311DF1C2AFA402eD8D009` (ABI compatible with v0.7 and v0.8)

The ethereum.org account abstraction page, last updated 24 June 2026, notes that the EntryPoint deployed on 1 March 2023 has supported more than 26 million smart wallets and 170 million UserOperations on Ethereum mainnet. Aggregators that count L2s, such as BundleBear, report higher totals, more than 1.24 billion UserOperations and more than 63 million accounts that have sent at least one UserOperation across tracked chains as of mid 2026. The two numbers measure different scopes.

## Who it is for

**Users who want simpler custody.** If seed phrases, holding ETH for gas, and separate approve steps create risk, a smart wallet hides those steps. You get one address with rules you can change.

**Teams that lose users at wallet creation.** If your funnel drops when people need ETH first or need to sign three times, paymasters let you sponsor gas or let users pay in USDC, and batching turns three prompts into one.

**Builders of wallets, games, and treasury tools.** If you need session keys for a game, spending limits for a team vault, or passkey login, you write that policy in the account contract. You do not wrap every action in an EOA transaction.

**Security and enterprise teams.** If you need 2-of-3 approval above a threshold, daily limits, or time-locked recovery, you encode the policy in the account and add guardians. Guardians can be other wallets, hardware devices, or a Safe.

It is less useful if you only send occasional ETH from one EOA and you need the lowest possible gas on mainnet with no offsetting benefit from batching or sponsorship.

## How it works

### The pieces

ERC-4337 defines four roles around a singleton EntryPoint.

- **Smart account.** The contract that holds funds and implements `validateUserOp`. It checks the signature however you define it and it must ensure it can pay EntryPoint. The minimal gate is `msg.sender == ENTRYPOINT`. Many accounts also implement `execute` or `executeUserOp` for batched calls. ERC-7579 and ERC-6900 describe modular ways to add or remove validators and executors.

- **UserOperation.** A pseudo-transaction that describes what the account wants to do. It is not a normal Ethereum transaction and it does not go into the normal mempool. On chain it is passed as `PackedUserOperation`, where several gas fields are packed into bytes32 values to save calldata.

```solidity
struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode; // factory address plus factoryData, or empty
    bytes callData;
    bytes32 accountGasLimits; // verificationGasLimit and callGasLimit packed
    uint256 preVerificationGas;
    bytes32 gasFees; // maxPriorityFeePerGas and maxFeePerGas packed
    bytes paymasterAndData; // paymaster address plus limits and data
    bytes signature;
}
```

- **Bundler.** An off-chain actor that runs the UserOperation mempool, simulates each operation, bundles valid ones, and calls `EntryPoint.handleOps(ops, beneficiary)` in a normal Ethereum transaction. The bundler pays gas upfront and is repaid from the account or paymaster deposit in EntryPoint. Anyone can run a bundler. In practice most apps use hosted bundlers from Pimlico, Alchemy, Biconomy, Stackup, or Candide.

- **Factory.** A helper that creates the account at a deterministic CREATE2 address when `initCode` is present. This gives you a counterfactual address. You can receive funds before deployment.

- **Paymaster.** An optional contract that agrees to pay for the UserOperation. It holds a deposit in EntryPoint and implements `validatePaymasterUserOp` and `postOp`. Use it to sponsor gas fully or to let users pay in an ERC-20.

- **Aggregator.** An optional contract that validates an aggregated signature for a batch of UserOperations, for example BLS, to save verification cost.

### The flow

1. **Build.** You create a UserOperation in your app. For a new wallet you include factory and factoryData. For an EIP-7702 account you include an authorization tuple that points the EOA to a delegation contract. You set nonce, gas limits, and callData. The nonce is a 192-bit key plus a 64-bit sequence, so you can have parallel channels. Key 0 for normal ops and key 1 for admin ops is common.

2. **Sign.** You sign the UserOperation hash. The hash is an EIP-712 typed hash over the PackedUserOperation fields, the EntryPoint address, and chainId. That ties the signature to one chain and one EntryPoint.

3. **Send.** Your app sends it with `eth_sendUserOperation` to a bundler. The bundler checks basics: sender exists or initCode is present, verificationGasLimit below 500,000, paymaster has code and deposit if present, and fees meet its minimum.

4. **Simulate.** The bundler simulates validation by tracing EntryPoint. It runs factory creation if needed, then `account.validateUserOp`, then `paymaster.validatePaymasterUserOp` if present. It checks storage access rules defined in ERC-7562. Access to global storage is only allowed for staked entities. If simulation reverts or the time window `validAfter` to `validUntil` is not active, the bundler drops the operation.

5. **Bundle and execute.** The bundler bundles many valid UserOperations into one transaction and submits `handleOps`. EntryPoint does two loops. First a verification loop that creates accounts, checks deposits, and calls validate functions. Second an execution loop that calls the account with callData or with `executeUserOp` if the selector matches, handles paymaster `postOp`, refunds unused gas with a 10 percent penalty on large unused `callGasLimit` and `paymasterPostOpGasLimit` to prevent reserving block space, and pays the bundler beneficiary.

If verification fails for one operation, EntryPoint skips it and continues with the rest of the bundle. Bundlers track failures and may rate-limit an offending factory or paymaster using a reputation system. The stake used for reputation is not slashed. It is a spam cost.

### What EIP-7702 adds

With EIP-7702 your EOA signs an authorization that sets its code to a delegate for that round. The bundler includes that authorization in the `authorizationList` of a type 0x04 transaction. EntryPoint then treats the EOA as a smart account for that UserOperation. You keep the same address on every chain, which avoids CREATE2 address management. You can also relay 7702 delegations through the ERC-4337 mempool for better inclusion. Many wallets in 2026 use both: 7702 for address continuity and EntryPoint v0.7 or v0.8 for sponsorship and batching. The ethereum.org Pectra pages recommend using `wallet_sendCalls` (ERC-5792) and modular interfaces rather than asking users to sign raw 7702 authorizations directly.

## What it enables, with concrete examples

**Batching.** A DeFi flow that today needs approve then swap then stake can be one UserOperation with three calls. On a Safe or ZeroDev Kernel account the calls array executes atomically. If any call reverts, the whole UserOperation reverts, which simplifies error handling.

Example batch with viem and permissionless:

```ts
const hash = await bundlerClient.sendUserOperation({
  account: safeAccount,
  calls: [
    { to: usdcAddress, abi: erc20Abi, functionName: "approve", args: [router, amount] },
    { to: router, abi: routerAbi, functionName: "swapExactTokensForTokens", args: [amount, minOut, path, to, deadline] },
    { to: stakingPool, abi: poolAbi, functionName: "stake", args: [lpAmount] }
  ],
  paymaster: paymasterClient // optional
})
```

**Gas paid by someone else or in another token.** A dapp can run a verifying paymaster that checks an API signature and sponsors onboarding transactions up to a budget. Or it can run an ERC-20 paymaster that pulls USDC from the user. With Pimlico the client sets `paymasterContext: { token: USDC }` and adds an approve for the paymaster in the same batch. The paymaster pre-charges the maximum cost based on oracle prices then refunds the excess in `postOp`. OpenZeppelin documents the pattern with a Chainlink ETH/USD and token/USD feed.

For addresses, do not hardcode demo values for production. Read the paymaster address from your provider per chain.

**Recovery and key rotation.** Instead of a single seed phrase you register guardians. Safe with the Candide Social Recovery Module is a common setup. You enable the module and add guardians in one UserOperation, then a threshold of guardians can rotate the owner after a timelock.

Typical 2-of-3 setup: you list two family wallets and one hardware wallet, set threshold 2, and choose a delay such as 48 hours for Argent or 3 days for the Candide module. If you lose your phone, guardians sign a recovery proposal with EIP-712, the contract starts the timelock, the current owner can cancel if they still have access, and after the window anyone can finalize the rotation.

Example with AbstractionKit:

```ts
const enableModuleTx = srm.createEnableModuleMetaTransaction(safeAddress)
const addGuardianTx = srm.createAddGuardianWithThresholdMetaTransaction(guardianAddress, 2n)
const userOp = await smartAccount.createUserOperation(
  [enableModuleTx, addGuardianTx],
  nodeUrl,
  bundlerUrl
)
```

**Alternative signatures.** The account can verify a WebAuthn passkey, a secp256r1 key from a phone enclave, or a BLS aggregated signature instead of secp256k1. Coinbase Smart Wallet and other passkey wallets do this. The validation logic is yours. EntryPoint only checks that you returned the expected validationData. Coinbase Smart Wallet is open source at github.com/coinbase/smart-wallet, uses passkeys on P-256, and points to EntryPoint v0.6 at `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` in its implementation.

**Session keys.** A game can issue a key that is only allowed to call `move` on one contract up to a spend limit for 24 hours. The session key is stored as a modular validator. The user signs once to grant it, then the game client signs small UserOperations with that key without prompting the main key.

**Spending limits and policies.** A treasury Safe can enforce that one signature is enough below 1,000 USDC per day but 2-of-3 is required above that. You implement the check in `validateUserOp` before paying the fee.

## Pros and cons

**Where it helps**

- No single point of failure from one private key. You can replace keys, add a second device, and set guardians. This matches how people manage risk outside crypto.

- Fewer prompts and fewer stuck transactions. Batching removes the approve then swap pattern and gives atomicity.

- Easier onboarding. Paymasters remove the need to hold ETH before the first action. ERC-20 gas lets users pay with the asset they are using.

- More auth options. Passkeys and multisig become account features, not external services.

- Clear fee handling. EntryPoint guarantees the fee is paid if validation succeeds.

**Where it costs or adds risk**

- Higher gas per UserOperation. You pay for `validateUserOp`, any paymaster validation, EntryPoint bookkeeping, and `preVerificationGas` that covers bundler overhead such as calldata gas from EIP-2028, memory expansion, and EIP-7702 authorization cost of 25,000 gas when used. For simple transfers this is more than the same call from an EOA. On mainnet a single simple UserOperation can cost 30 to 60 percent more than the EOA version. Batching and L2 fees often offset it, but plan for it.

- Bundler dependency. Anyone can run a bundler but most apps rely on hosted providers today. If your bundler censors or stalls, your UserOperation waits until another picks it up. The alt mempool helps but it is newer than the normal mempool. Monitor inclusion and run a fallback bundler URL.

- EntryPoint is a single trusted contract. All accounts trust one or two canonical addresses. That concentrates audit risk. EntryPoint v0.7 and v0.8 have been audited, but any bug would affect many wallets. Check that your account gates calls with `msg.sender == ENTRYPOINT`.

- Developer complexity. You manage deposits in EntryPoint, estimate gas with `eth_estimateUserOperationGas`, handle `validAfter` and `validUntil` windows, and track 2D nonces. Tooling such as permissionless.js, viem account-abstraction, Alchemy AA SDK, and Biconomy helps, but debugging a failed UserOperation is harder than debugging a reverted transaction.

- Compatibility gaps. Not every chain runs the same EntryPoint version. Many L2s upgraded from v0.6 to v0.7 in 2024 and 2025 at different times, and v0.8 is rolling out now. EIP-7702 is live on Ethereum and major L2s since May 2025 but some sidechains trail. Your factory and paymaster must target the correct EntryPoint per chain.

- Stake and reputation rules. If your factory or paymaster touches global storage without stake, bundlers will reject it. You need to stake through EntryPoint with `addStake` and respect unstake delays, or avoid global storage in validation.

**Trade-off summary**

| Use | Gain | Cost |
| --- | --- | --- |
| One-click DeFi flows | Fewer signatures, atomic batch | Extra validation gas |
| Onboarding without ETH | Higher conversion, pay in USDC | Paymaster liveness and oracle risk |
| Passkey or multisig auth | No seed phrase exposure | More complex key management code |
| Session keys for games | No prompt on every move | Need to scope permissions tightly |
| Social recovery | Recover from loss without custody change | Guardian coordination and timelock delay |

## How to get started

### If you are a user

1. Try a smart wallet that already uses ERC-4337. Safe at safe.global, Argent, Braavos, ZeroDev-powered wallets, and Coinbase Smart Wallet all expose smart accounts. Create a wallet with a passkey, set a daily limit, and add one guardian.

2. Test a gas-sponsored action. Many apps on Base and Optimism sponsor the first UserOperation. Look for "Sponsored by Paymaster" in the confirmation. If it asks for ETH for gas, you are still on an EOA path.

3. Set up recovery early. Add two guardians on different devices or with two people you trust and set threshold 2 of 3. Run a test recovery on a small Sepolia account before you rely on it. Expect timelocks of 36 hours to 3 days depending on the module.

### If you are a builder

1. **Pick a stack.** viem with `viem/account-abstraction` plus permissionless.js is the most common. Alternatives are Alchemy AA SDK, Biconomy, ZeroDev Kernel, and Candide abstractionkit. Use the same EntryPoint version across account, bundler, and paymaster.

2. **Run on Sepolia first.** Use EntryPoint v0.7 at `0x0000000071727De22E5E9d8BAf0edAc6f37da032`. Get testnet ETH from a faucet and point your clients at a public RPC.

3. **Wire the clients.** Minimal viem plus Pimlico example for a Safe account:

```ts
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { createBundlerClient, createPaymasterClient, entryPoint07Address } from "viem/account-abstraction"
import { toSafeSmartAccount } from "permissionless/accounts"
import { createSmartAccountClient } from "permissionless"
import { privateKeyToAccount } from "viem/accounts"

const publicClient = createPublicClient({ chain: sepolia, transport: http(process.env.RPC_URL) })
const owner = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

const safeAccount = await toSafeSmartAccount({
  client: publicClient,
  owners: [owner],
  version: "1.4.1",
  entryPoint: { address: entryPoint07Address, version: "0.7" }
})

const paymasterClient = createPaymasterClient({
  transport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_KEY}`)
})

const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_KEY}`),
  paymaster: paymasterClient
})

const smartAccountClient = createSmartAccountClient({
  account: safeAccount,
  chain: sepolia,
  bundlerTransport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_KEY}`),
  paymaster: paymasterClient
})

// batch approve and swap in one UserOperation
const hash = await smartAccountClient.sendUserOperation({
  calls: [
    { to: usdcAddress, abi: erc20Abi, functionName: "approve", args: [paymasterAddress, 10_000_000n] },
    { to: routerAddress, abi: routerAbi, functionName: "swap", args: [swapParams] }
  ]
})
const receipt = await bundlerClient.waitForUserOperationReceipt({ hash })
```

4. **Handle gas correctly.** Call `bundlerClient.estimateUserOperationGas` first, then set `maxFeePerGas` and `maxPriorityFeePerGas` from the bundler gas price feed. Ensure the account or paymaster has a deposit in EntryPoint with `depositTo` or that the paymaster sponsors it. Include `preVerificationGas` with enough slack for your paymaster context size. For 7702 delegations add 25,000 gas per authorization.

5. **Add policies as modules.** For session keys or spending limits, install an ERC-7579 validator module rather than forking the account. Test the validator on a local anvil fork with simulation before mainnet.

6. **Go cross-chain deliberately.** Keep a config map of EntryPoint addresses per chain. v0.6, v0.7, and v0.8 coexist. Wallet factories from eth-infinitism publish deterministic addresses for each version, but some rollups use chain-specific pricing. Test bundler routing per chain.

**Costs to budget.** Expect one bundler transaction to wrap many UserOperations, so you share the 21,000 base cost. Per UserOperation you pay calldata for the PackedUserOperation, EntryPoint execution, your account validation, and paymaster overhead if present. For budgeting, many teams add 15 to 30 percent on top of the simulated gas for mainnet variance. On L2s the overhead is often a few cents and batching usually makes the UserOperation cheaper than three separate EOA transactions.

## FAQ

**Is ERC-4337 the same as EIP-7702?**

No. ERC-4337 is an application-layer standard. No consensus change. It uses the alt mempool and EntryPoint. EIP-7702 is a protocol change in Pectra that lets an EOA delegate to a contract with a type 0x04 transaction. They work together. You can delegate your EOA with 7702 and still send UserOperations through ERC-4337 for batching and sponsorship.

**Do I still need ETH for gas?**

Not necessarily. With a sponsoring paymaster the dapp can pay fully. With an ERC-20 paymaster you pay in USDC or another token. The paymaster still pays ETH to the bundler and EntryPoint under the hood. If no paymaster is used, your smart account needs a deposit in EntryPoint or ETH to cover the fee.

**Can I keep my current EOA address?**

With ERC-4337 alone you get a new contract address derived with CREATE2. With EIP-7702 you can keep the same EOA address and delegate it to smart account code. Most wallets that want address continuity now support both.

**Is a smart account less safe than an EOA?**

It moves risk, it does not remove it. You remove the single-key failure but you add code risk in your validation logic and shared trust in EntryPoint and any paymaster or factory you use. Use audited account implementations from eth-infinitism, Safe, or OpenZeppelin, gate sensitive functions with `msg.sender == ENTRYPOINT`, and avoid custom crypto in validation.

**What happens if my bundler goes down?**

UserOperations live in the alt mempool. If one bundler is down, another can include your operation as long as it follows the shared ERC-7562 rules and supports your EntryPoint version. Run two bundler URLs in production, for example Pimlico and Alchemy or Biconomy, and retry on `FailedOp` with a higher fee.

**How is the nonce different?**

ERC-4337 uses a 2D nonce, 192-bit key and 64-bit sequence. You read it with `EntryPoint.getNonce(sender, key)`. This lets you have parallel channels so one stuck UserOperation on key 0 does not block a recovery operation on key 1.

**Do I need to deploy EntryPoint myself?**

No. Use the canonical addresses. For local development you deploy a copy, but for testnet and mainnet use `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` for v0.6, `0x0000000071727De22E5E9d8BAf0edAc6f37da032` for v0.7, and `0x4337084d9e255ff0702461cf8895ce9e3b5ff108` for v0.8 where available. Bundlers whitelist these.

**What should I read next?**

Start with the spec at eips.ethereum.org/EIPS/eip-4337, the ethereum.org roadmap page on account abstraction, and the docs at docs.erc4337.io. For implementation look at eth-infinitism/account-abstraction on GitHub, the permissionless.js docs, Safe Core, and OpenZeppelin account-abstraction contracts. The awesome-account-abstraction list curates current bundlers and paymasters.

