---
title: Gas Optimization Techniques for Solidity Developers
image: >-
  https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmZWV8ZW58MHx8fHwxNzU1MDM2ODM3fDA&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: gas optimization techniques
description: >-
  A practical guide for Ethereum developers on how to write more gas-efficient
  smart contracts. Learn techniques to reduce the execution cost of your.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---
On the [Ethereum](/what-is-ethereum) [blockchain](/what-is-a-blockchain), every computational step has a financial cost known as gas. Gas is a constraint on [smart contract](/what-are-smart-contracts) development, not an optional concern to address after a contract is finished. A capable [Solidity](/best-programming-languages-for-blockchain-development) developer has to produce code that is secure, functional, and economical to execute. High gas costs can make decentralized applications impractical. Well-targeted optimization can reduce the cost paid by users and give an application an advantage over a more expensive alternative.

That does not make lower gas an end in itself. A contract that saves gas by weakening authorization, dropping a required state update, or obscuring important logic is not an improvement. The useful standard is narrower: preserve the intended behavior, then remove unnecessary work from the execution path. This requires attention to where data lives, how often persistent state changes, and whether a cheaper construct expresses the same rule.

The techniques below focus on common Solidity decisions. Each has a clear trade-off. A change should be adopted because the contract's behavior and limits make it safe, not because an isolated pattern is fashionable.

## Start with the execution path

Gas is paid when a function executes, so the first unit of analysis is a specific path through a specific function. Before changing code, identify the action that is costly to the user: creating a record, updating a balance, processing an item in a loop, or checking access before a state change. Then identify the operations that occur on that path.

This is more disciplined than treating every line as equally important. A one-time administrative function and a public function called repeatedly may deserve different levels of attention. An optimization is meaningful when it affects an execution path that matters to the contract's users or to the contract's operation.

The comparison must also be fair. Test the same inputs, the same authorization state, and the same logical branch before deciding that one version is cheaper. A function that skips work is not equivalent to a function that correctly performs it. Keep functional tests in place while reviewing gas use, especially when a change moves calculations between storage, `memory`, and `calldata`.

It is useful to write down the contract's invariants before optimizing. An invariant is simply a condition the code must continue to preserve. Examples include a value never falling below its required minimum, only an authorized caller being able to make a change, or a total being updated consistently with its components. The optimization work then has a boundary: reduce unnecessary cost without violating those conditions.

## 1. Minimize state changes

State modifications in the Ethereum Virtual Machine (EVM) are among the most expensive operations. Reading data has a lower cost, while writing or changing storage can be costly. The `SSTORE` opcode writes to storage and is the most expensive operation in this discussion; a single `SSTORE` can consume a significant amount of gas.

The basic technique is to minimize storage writes. If a function performs several calculations on one state variable, read the value once into a local variable, perform the calculations locally, and write the final result back to storage once. The following example shows the intended contrast. The initial value only makes the subtraction safe for the example; the important point is the number of storage-changing statements.

```solidity
uint256 myStateVar = 10;

// Inefficient: 3 SSTORE operations
function calculateBad() public {
    myStateVar += 1; // SSTORE 1
    myStateVar *= 2; // SSTORE 2
    myStateVar -= 5; // SSTORE 3
}

// Efficient: 1 SSTORE operation
function calculateGood() public {
    uint256 local_myStateVar = myStateVar; // SLOAD (cheap)
    local_myStateVar += 1;
    local_myStateVar *= 2;
    local_myStateVar -= 5;
    myStateVar = local_myStateVar; // SSTORE (once)
}
```

The pattern is simple, but its limits matter. A local variable is appropriate only when the intermediate values do not need to become persistent state. If another operation must observe an intermediate state, postponing every write would change the contract's behavior. The goal is not to move state into a local variable mechanically. It is to identify a sequence of calculations that logically produces one final state change.

The same reasoning applies to loops. A loop that repeatedly updates one persistent counter can often accumulate a local total and store it after the loop. In contrast, a loop that must record a separate result for each item still requires those distinct state changes. The contract's data model decides whether aggregation is valid.

```solidity
uint256 total;

function addAll(uint256[] calldata increments) external {
    uint256 localTotal = total;

    for (uint256 i = 0; i < increments.length; i++) {
        localTotal += increments[i];
    }

    total = localTotal;
}
```

This example follows the same rule as the earlier one: calculate with a local value and write the final result once. It should not be copied into a function that needs a durable record for every increment. Gas work begins with the meaning of the state, not with a preference for a particular syntax.

## 2. Choose data types for storage layout

The choice of data types in Solidity can materially affect gas use because the EVM packs storage into 256-bit, or 32-byte, slots. When several state values can fit into one slot, the contract can use fewer storage slots. That is why the type and ordering of state fields deserve review.

When multiple unsigned integer variables appear in a `struct` or as contiguous state variables, smaller types such as `uint128` or `uint64` can be preferable if their values are within their limits. The EVM can pack smaller values into a single 32-byte storage slot, reducing gas use. The condition about limits is essential. A smaller type is only correct when the contract's valid range fits inside it.

```solidity
// Inefficient: Uses two 32-byte slots
struct BadStruct {
    uint256 a; // Slot 1
    uint256 b; // Slot 2
}

// Efficient: Uses one 32-byte slot
struct GoodStruct {
    uint128 a; // Slot 1, first 128 bits
    uint128 b; // Slot 1, last 128 bits
}
```

The example is about persistent storage, not a general rule that smaller integers are always cheaper. For local variables in `memory` or `calldata`, using the full `uint256` is typically more cost-effective because the EVM handles 32-byte words efficiently. A type decision therefore has to begin with the variable's location and expected range.

| Location or use | Useful question | Main concern |
| --- | --- | --- |
| Persistent state | Can compatible values share a 32-byte slot? | Storage layout and the range each value must support |
| Local `memory` value | Does the calculation need a temporary, modifiable value? | Clarity and correct calculation rather than storage packing |
| External `calldata` value | Is the input read without modification? | Avoiding unnecessary allocation and copying |

Packing is also a design decision, not a license to narrow values without review. A value that later exceeds its chosen range creates a correctness problem that overwhelms any gas benefit. Document the intended range in the code or surrounding specification when it is not obvious. The reader maintaining the contract should be able to see why a `uint128` or `uint64` is sufficient.

## 3. Use `calldata` for eligible external inputs

For an `external` function that receives dynamic data such as `string` or `bytes`, use `calldata` rather than `memory` when the function only needs to read the argument. `calldata` is a read-only, non-persistent area for function arguments. `memory`, by contrast, is modifiable.

The gas advantage is direct: `calldata` avoids the memory allocation and copying needed when an argument is placed in `memory`. This is a small declaration change with a clear precondition. It is appropriate only when the function does not need to modify the supplied value.

```solidity
// Inefficient when the string is only read
function doSomething(string memory _myString) external {
    bytes(_myString).length;
}

// Efficient when the string is only read
function doSomethingWithCalldata(string calldata _myString) external {
    bytes(_myString).length;
}
```

The examples use different function names only to make the distinction visible. In real code, the correct choice depends on the function's intended behavior. If the implementation needs a modifiable local copy, `memory` remains the appropriate location. If it only reads an external dynamic argument, `calldata` states that intent and avoids work that the function does not need.

This pattern applies to more than strings. The same question applies whenever an external function accepts dynamic input: is the argument read in place, or is a modifiable copy necessary? The answer should follow the function's behavior, not a blanket rule that every parameter belongs in the same location.

## 4. Prefer custom errors to `require` strings

Custom errors, introduced in Solidity 0.8.4, provide a more gas-efficient way to handle failed conditions than `require` statements with strings. The familiar form `require(condition, "Error string")` stores the error string on-chain, which creates gas cost. A custom error avoids storing that string data and can produce considerable gas savings.

The change is not merely syntactic. A useful error names the failed condition, so callers and reviewers can still understand why the function rejected an action. The error should be as precise as the rule it represents. A vague error may be cheaper than a long string, but it can make the contract harder to operate and review.

```solidity
address owner;

// Inefficient
function restrictedWithString() public {
    require(msg.sender == owner, "Caller is not the owner");
}

// Efficient
error NotOwner();

function restrictedWithCustomError() public {
    if (msg.sender != owner) {
        revert NotOwner();
    }
}
```

Use the same care with an error condition as with any access-control rule. The condition must remain correct, and the failure path must remain understandable to those integrating with the contract. The gas benefit does not justify removing useful distinctions between different failure cases. Separate custom errors can preserve those distinctions without returning to long string messages.

## 5. Use `unchecked` only when arithmetic is demonstrably safe

Solidity 0.8.0 automatically checks arithmetic for overflow and underflow. Those checks add a small gas cost. When an operation cannot overflow or underflow under the contract's stated conditions, an `unchecked` block can remove the check and save gas.

The word "cannot" carries the burden of proof. The developer must be able to explain why the relevant bounds make the arithmetic safe. A loop counter is a common example when the loop condition establishes the limit. In the following form, the increment is inside `unchecked`, while the condition `i < length` supplies the reason that `i` will not overflow during the loop.

```solidity
function sum(uint256[] calldata values) external pure returns (uint256 total) {
    uint256 length = values.length;

    for (uint256 i = 0; i < length;) {
        total += values[i];

        unchecked {
            ++i;
        }
    }
}
```

The `unchecked` block should be as narrow as possible. It should contain only the arithmetic for which safety has been established. In the example, the addition to `total` remains checked; the example does not assume that the sum of arbitrary inputs is safe. Restricting the block makes the reasoning visible and reduces the risk of unintentionally disabling checks on unrelated calculations.

Use this feature cautiously. An unexpected overflow or underflow can create serious security vulnerabilities. It is not enough that a value seems unlikely to reach a limit in ordinary use. The relevant question is whether the contract's own checks, types, and bounds prevent it under every allowed call path. If that explanation is not clear, keep Solidity's default checks.

## Review optimization as a change to contract design

The five techniques above affect different parts of the EVM cost model, but they follow one discipline: remove work only after confirming that it is unnecessary. Storage writes are expensive, so consolidate them when a single final state change is correct. Storage slots are limited to 32-byte words, so pack compatible persistent values when their ranges allow it. External dynamic inputs can stay in `calldata` when they are read-only. Revert paths can use custom errors instead of stored strings. Arithmetic checks can be omitted only where safety is established.

Each change should be reviewed against four questions:

1. Does the optimized version preserve every required state transition?
2. Does it preserve authorization and failure behavior that callers rely on?
3. Are all range assumptions explicit and tested at their boundaries?
4. Does a comparison of the same execution path show the intended gas reduction?

These questions guard against two common mistakes. The first is optimizing code that is not a meaningful source of cost. The second is treating a lower cost as proof of correctness. In contract work, a saving has value only if the contract still enforces the intended rules.

Readability also has a cost and a benefit. A future maintainer should be able to tell why a local variable exists, why two fields use smaller integer types, or why arithmetic is unchecked. The code examples in this article make those choices visible through structure and names. When the reason is not evident, a short comment can prevent a later change from undoing a required assumption.

Gas optimization is a technical discipline rather than a collection of tricks. It requires an understanding of how the EVM handles storage, data locations, failure paths, and arithmetic, together with equal attention to functionality and security. Applied carefully, these techniques can reduce unnecessary execution cost without making the contract harder to trust.
