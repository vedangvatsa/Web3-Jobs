---
title: "Upgradeable Contracts and Proxy Patterns"
description: "How to write and audit upgradeable smart contracts using proxy patterns."
order: 8
readTime: "10 min"
difficulty: "advanced"
prerequisites: ["erc20", "security"]
quiz:
  - question: "Why can't smart contracts be updated directly?"
    options:
      - "The EVM doesn't support code changes."
      - "Once deployed, smart contract code is immutable — it cannot be changed."
      - "Only the contract owner can update them."
      - "Updates require a hard fork."
    correct: 1
    explanation: "Smart contracts are deployed as bytecode at a fixed address. The EVM provides no mechanism to modify deployed code. Proxy patterns work around this by separating storage from logic."
  - question: "What is the main security risk of proxy-based upgradeable contracts?"
    options:
      - "They use more gas."
      - "The upgrade admin can replace the contract logic with malicious code, effectively rugging all users."
      - "They are incompatible with DeFi."
      - "They cannot hold ETH."
    correct: 1
    explanation: "Whoever controls the upgrade key can swap the implementation contract for anything — including code that drains all funds. This is why upgrade mechanisms must be secured with timelocks and multisigs."
---

## The Immutability Problem

Smart contracts are immutable. Once deployed, the code cannot be changed. This is a feature (users can trust the code won't change) and a bug (if you find a vulnerability, you can't patch it).

In practice, most protocols need upgradability — to fix bugs, add features, or respond to governance decisions. Proxy patterns solve this.

## How Proxy Patterns Work

The core idea: separate the **contract you call** (the proxy) from the **code that runs** (the implementation).

1. Users interact with the **Proxy** contract (fixed address, holds all storage).
2. The Proxy uses `delegatecall` to forward execution to the **Implementation** contract.
3. `delegatecall` executes the implementation's code but uses the proxy's storage and context.
4. To upgrade, you deploy a new implementation and tell the proxy to point to it.

The user's experience never changes — they always interact with the same address. But the logic behind that address can be swapped.

## Common Proxy Patterns

### Transparent Proxy (OpenZeppelin)
The most widely used pattern. Key rules:
- The admin can upgrade the implementation but cannot call implementation functions.
- Regular users can call implementation functions but cannot upgrade.
- This separation prevents the admin from accidentally calling implementation functions.

### UUPS (Universal Upgradeable Proxy Standard)
The upgrade logic lives in the implementation contract itself, not in the proxy:
- Smaller proxy contract (cheaper to deploy).
- The implementation must include the upgrade function.
- If you deploy an implementation without the upgrade function, the contract becomes permanently non-upgradeable (a dangerous foot-gun).

### Diamond Pattern (EIP-2535)
Multiple implementation contracts ("facets") share a single proxy:
- Each function can be routed to a different facet.
- Enables modular architecture for complex protocols.
- More complex to audit but more flexible.

## Storage Collision: The Silent Killer

The most dangerous pitfall in proxy upgrades is **storage collision**. Since the proxy and implementation share storage, they must use the same storage layout.

If Version 1 has:
```
slot 0: address owner
slot 1: uint256 balance
```

And Version 2 changes to:
```
slot 0: uint256 totalSupply // ← COLLISION: overwrites owner!
slot 1: address owner
```

The new code reads slot 0 as `totalSupply`, but it still contains the old `owner` address. This corrupts state silently and can be catastrophic.

**Rules to prevent collision:**
- Never reorder or remove existing storage variables.
- Only append new variables at the end.
- Use storage gaps (reserved empty slots) to leave room for future variables.
- Use tools like OpenZeppelin's Upgrade Plugins which automatically check for collisions.

## Security Considerations

### Who Controls Upgrades?
The upgrade key is the most powerful permission in a protocol. Best practices:
- **Multisig:** Require multiple signatures (e.g., 3/5 Gnosis Safe).
- **Timelock:** Enforce a delay (24-48 hours) between initiating and executing an upgrade. This gives users time to exit if they disagree.
- **Governance:** For mature protocols, upgrades should require token-holder votes.

### Audit Checklist for Proxy Contracts
1. Verify the proxy pattern (Transparent, UUPS, or Diamond).
2. Check who controls the upgrade admin — is it a multisig with a timelock?
3. Verify storage layout compatibility between versions.
4. Ensure the implementation's `initialize()` function can only be called once.
5. Check for `selfdestruct` in the implementation (it would destroy the implementation, not the proxy, but can still cause issues).

### The Wormhole Bridge Hack
In February 2022, Wormhole's bridge was exploited for $320 million. The attacker exploited an uninitialized implementation contract — the implementation had an `initialize()` function that was never called, allowing the attacker to call it and take ownership.

**Lesson:** Always initialize your implementation contracts, even though they are never called directly.

## Key Takeaways

- Proxy patterns enable upgradability by separating storage (proxy) from logic (implementation).
- Storage collisions are the most common and dangerous upgrade bug.
- The upgrade admin key is the most powerful permission — secure it with multisig + timelock.
- Always initialize implementation contracts.
- Use OpenZeppelin's upgrade tools to catch storage layout errors automatically.
