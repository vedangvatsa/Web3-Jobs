---
title: "Understanding ERC-20 Code"
description: "How standard tokens work under the hood using mappings and events."
order: 3
readTime: "9 min"
difficulty: "intermediate"
prerequisites: ["first-contract"]
quiz:
  - question: "What data structure does an ERC-20 contract use to keep track of everyone's token balances?"
    options:
      - "An array of addresses"
      - "A SQL database"
      - "A mapping linking addresses to integers (mapping(address => uint256))"
      - "A linked list"
    correct: 2
    explanation: "A mapping acts like a dictionary. It links a specific wallet address directly to a uint256 number representing their balance. The tokens do not live in your wallet; they live as a number in the contract's mapping."
  - question: "In Solidity, what is an 'event' used for?"
    options:
      - "To schedule a transaction for the future"
      - "To emit a log to the blockchain that external apps (like frontends or block explorers) can listen to"
      - "To trigger a function automatically"
      - "To pause the contract"
    correct: 1
    explanation: "Events provide a cheap way to log activity. When a transfer happens, the contract emits a Transfer event. Etherscan and frontend UIs listen for these events to update transaction histories."
  - question: "What does the require() statement do in a transfer function?"
    options:
      - "It pays the gas fee"
      - "It checks if the sender has enough balance; if not, it reverts the transaction"
      - "It requires the receiver to accept the transfer"
      - "It asks the owner for permission"
    correct: 1
    explanation: "The require(balances[msg.sender] >= amount) statement ensures you cannot send more tokens than you own. If the condition is false, the transaction fails."
  - question: "What does uint256 stand for?"
    options:
      - "Universal Integer 256"
      - "Unsigned Integer of 256 bits (cannot be negative)"
      - "Union Integer"
      - "Unique Identifier"
    correct: 1
    explanation: "An unsigned integer cannot hold negative numbers. 256 bits means it can hold incredibly large numbers, which is necessary for handling token decimals."
  - question: "Why do most ERC-20 tokens have 18 decimals?"
    options:
      - "Because Ethereum (ETH) has 18 decimals"
      - "Because 18 is the maximum allowed by Solidity"
      - "To make the math harder"
      - "Because the ERC-20 standard requires exactly 18"
    correct: 0
    explanation: "Most tokens use 18 decimals to mirror ETH (1 ETH = 10^18 wei). Solidity does not support decimals/floats natively, so a token balance of '1' is actually represented as '1,000,000,000,000,000,000' in the code."
---

## Tokens are just spreadsheets

When people say "I have 100 USDC in my wallet," they are technically wrong. The USDC is not in their wallet. The USDC smart contract simply has a spreadsheet, and next to their wallet address, the number is 100.

An ERC-20 token is a standardized smart contract. Because every ERC-20 contract has the exact same function names (like `transfer` and `balanceOf`), wallets like MetaMask know exactly how to interact with all of them.

Let's look at the core logic of a token contract.

## The Core Data Structure: Mappings

To keep track of balances, Solidity uses a `mapping`. A mapping is like a dictionary or a hash table.

```solidity
contract SimpleToken {
    // This creates a dictionary linking an address to a number
    mapping(address => uint256) public balanceOf;
    
    // Total supply of the token
    uint256 public totalSupply;
    
    // Token metadata
    string public name = "HashtagToken";
    string public symbol = "HTG";
    uint8 public decimals = 18;
}
```

In the `balanceOf` mapping:
- The Key is an `address` (e.g., `0xabc...`)
- The Value is a `uint256` (an unsigned integer, meaning no negative numbers).

If you call `balanceOf[0xabc...]`, it returns the token balance of that address.

## The Transfer Function

How do tokens move? We just subtract from one address in the mapping and add to another.

```solidity
    // An event we will trigger when tokens move
    event Transfer(address indexed from, address indexed to, uint256 value);

    function transfer(address _to, uint256 _amount) public returns (bool) {
        // 1. Check: Does the sender have enough tokens?
        require(balanceOf[msg.sender] >= _amount, "Not enough tokens");

        // 2. Execute: Subtract from sender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _amount;

        // 3. Execute: Add to receiver
        balanceOf[_to] = balanceOf[_to] + _amount;

        // 4. Log: Emit an event for the outside world
        emit Transfer(msg.sender, _to, _amount);

        return true;
    }
```

### Breaking down the transfer

1. **`require`**: This is our security check. If the caller (`msg.sender`) tries to send 100 tokens but only has 50, the `require` statement fails. The transaction reverts, no gas is spent on execution, and no balances change.
2. **Math**: We directly modify the `balanceOf` mapping. The sender loses tokens, the receiver gains them.
3. **`emit Transfer(...)`**: Blockchains are closed systems. To let frontends (like Etherscan or your React app) know that a transfer happened without them having to constantly read the contract state, we emit an **event**. Apps listen for these events to update UI histories.

## The Decimals Problem

Solidity **does not support floating point numbers (decimals)**. You cannot have `1.5` tokens in the code.

To fix this, tokens use very large integers. When you define `decimals = 18` in the contract, it tells the frontend (like MetaMask) to move the decimal point 18 places to the left when showing the number to the user.

If you want to transfer exactly 1 token, you must pass the number `1000000000000000000` (1 followed by 18 zeros) to the `transfer` function. The smart contract handles the massive integer, but MetaMask formats it nicely as "1.00" for the user.

## Key takeaways

- Tokens do not live in wallets; they live in a `mapping` inside a smart contract.
- Transferring tokens just means doing math: subtracting from the sender's mapping balance and adding to the receiver's.
- `require` statements protect against invalid actions (like spending more than you have).
- Events are emitted so off-chain apps know when things happen.
- Solidity has no decimals. It uses massive integers, and the frontend handles the visual formatting.
