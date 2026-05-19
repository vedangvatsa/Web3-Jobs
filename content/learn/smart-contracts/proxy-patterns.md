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
  - question: "How does a proxy contract work at the EVM level?"
    options:
      - "It copies the implementation contract's code."
      - "It uses delegatecall to execute the implementation contract's code in the context of the proxy's storage, allowing the logic to be swapped while keeping the same address and state."
      - "It creates a new contract for every function call."
      - "It uses a different blockchain."
    correct: 1
    explanation: "delegatecall is the key EVM opcode. When a proxy receives a call, it uses delegatecall to run the implementation contract's code but reads and writes to the proxy's own storage. This means you can swap the implementation (upgrade the logic) without changing the proxy address or losing stored data."
  - question: "What is 'storage collision' in proxy contracts?"
    options:
      - "When two users try to write at the same time."
      - "When the proxy and implementation contract accidentally use the same storage slot for different variables, causing data corruption."
      - "When the contract runs out of storage."
      - "When two contracts have the same address."
    correct: 1
    explanation: "Because delegatecall executes implementation code against proxy storage, both contracts must agree on which storage slots hold which data. If the proxy stores the admin address in slot 0 and the implementation stores a user balance in slot 0, they overwrite each other — silently corrupting critical data."
  - question: "What is the difference between Transparent Proxy and UUPS patterns?"
    options:
      - "They are the same."
      - "In Transparent Proxy, the upgrade logic lives in the proxy contract; in UUPS, the upgrade logic lives in the implementation contract — making UUPS cheaper to deploy and more gas-efficient."
      - "UUPS is older."
      - "Transparent Proxy doesn't use delegatecall."
    correct: 1
    explanation: "Transparent Proxy puts upgrade functions in the proxy itself (higher deploy cost, simpler). UUPS puts upgrade functions in the implementation (cheaper deploy, but if you deploy an implementation without the upgrade function, the contract becomes permanently non-upgradeable). UUPS is now the recommended OpenZeppelin pattern."
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

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- User -->
 <rect x="20" y="80" width="120" height="60" rx="10" fill="#f0f9ff" stroke="#3b82f6" stroke-width="2"/>
 <text x="80" y="105" text-anchor="middle" font-size="13" fill="#1e40af">User</text>
 <text x="80" y="122" text-anchor="middle" font-size="11" fill="#64748b">calls transfer()</text>

 <!-- Arrow User → Proxy -->
 <line x1="140" y1="110" x2="220" y2="110" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowB)"/>

 <!-- Proxy -->
 <rect x="220" y="60" width="160" height="100" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
 <text x="300" y="90" text-anchor="middle" font-size="14" font-weight="600" fill="#1e40af">Proxy</text>
 <text x="300" y="108" text-anchor="middle" font-size="11" fill="#64748b">Fixed address</text>
 <text x="300" y="123" text-anchor="middle" font-size="11" fill="#64748b">Holds all storage</text>
 <text x="300" y="148" text-anchor="middle" font-size="10" fill="#3b82f6">delegatecall →</text>

 <!-- Arrow Proxy → Implementation -->
 <line x1="380" y1="110" x2="460" y2="110" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrowG)"/>

 <!-- Implementation -->
 <rect x="460" y="60" width="160" height="100" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
 <text x="540" y="90" text-anchor="middle" font-size="14" font-weight="600" fill="#166534">Implementation</text>
 <text x="540" y="108" text-anchor="middle" font-size="11" fill="#64748b">Has the logic</text>
 <text x="540" y="123" text-anchor="middle" font-size="11" fill="#64748b">Swappable</text>

 <!-- Upgrade arrow -->
 <rect x="660" y="80" width="120" height="60" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
 <text x="720" y="105" text-anchor="middle" font-size="12" font-weight="600" fill="#92400e">New Version</text>
 <text x="720" y="120" text-anchor="middle" font-size="10" fill="#b45309">upgrade points here</text>
 <path d="M660,110 L630,90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowO)"/>

 <!-- Label -->
 <text x="400" y="200" text-anchor="middle" font-size="12" fill="#94a3b8">Runs implementation code, but reads/writes proxy storage</text>

 <defs>
 <marker id="arrowB" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6"/></marker>
 <marker id="arrowG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
 <marker id="arrowO" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#f59e0b"/></marker>
 </defs>
</svg>
</div>

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
