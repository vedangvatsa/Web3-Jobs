---

title: "An Introduction to Foundry: The Modern Solidity Toolkit"
image: "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8Y29kaW5nfGVufDB8fHx8MTc1NDk1NDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "foundry software toolkit"
description: "A guide for Ethereum developers on Foundry, the fast, portable, and Solidity-native development toolkit that is changing how we build and test."
category: "Getting Started"
publishedDate: "2026-03-11"
lastUpdated: "2026-04-29"
---

Foundry has emerged as a modern toolkit for Ethereum development, addressing key limitations of traditional JavaScript-based frameworks like Hardhat and Truffle. These frameworks have played a significant role in the Ethereum ecosystem, but they require developers to switch between Solidity for smart contracts and JavaScript for tests and scripts. This context-switching can lead to inefficiencies and bugs.

**Foundry** redefines the development process by allowing developers to write tests directly in Solidity. This integration promotes consistency and reduces the cognitive load on developers. Foundry has quickly gained traction among Ethereum developers, thanks to its speed, portability, and modular features.

### What is Foundry?

Foundry is a suite of command-line tools designed for Ethereum application development. Its main components include:

- **Forge:** The core component that serves as a testing framework, enabling developers to write tests in Solidity. It also provides functionalities for compiling, deploying, and verifying contracts.
  
- **Cast:** A command-line utility that facilitates interaction with smart contracts. Developers can use Cast to send transactions, call functions, and retrieve data from the [blockchain](/what-is-a-blockchain) directly from the terminal.

- **Anvil:** A local testnet node akin to Hardhat Network. Anvil offers a fast local blockchain environment for testing and development.

- **Chisel:** An interactive Solidity shell (REPL) that allows developers to test snippets of Solidity code quickly without needing to create complete contracts.

### Key Advantages of Using Foundry

Foundry provides several advantages, making it a compelling choice for Ethereum developers.

1. **Solidity-Native Testing**  
   Writing tests in Solidity instead of JavaScript offers numerous benefits:
   - **No Context Switching:** Developers maintain a consistent language and mental model, enhancing development speed and intuitiveness.
   - **Performance:** Tests run significantly faster in Foundry, executing directly in the Ethereum Virtual Machine (EVM) without the overhead of a JavaScript runtime.
   - **Fuzz Testing:** Foundry supports fuzz testing, an automated process that generates random inputs to identify edge cases that could lead to failures. This capability strengthens security by rigorously testing smart contracts.

2. **Speed and Efficiency**  
   Built in Rust, Foundry is engineered for performance. The speed of compiling contracts and executing tests often surpasses that of JavaScript-based frameworks. Benchmarks indicate that Foundry can compile contracts significantly faster than Hardhat under similar conditions.

3. **Portability and Simplicity**  
   Foundry's command-line interface avoids the complexities associated with extensive JavaScript dependencies. As a result, it is easy to install and use across various development environments.

### Practical Example: Writing a Foundry Test

Consider a simple `Counter.sol` contract:

```solidity
// src/Counter.sol
contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
```

Here’s how to write a test for it in Solidity. In Foundry, tests are contracts that inherit from Foundry's standard test library.

```solidity
// test/Counter.t.sol
import "forge-std/Test.sol";
import "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
        counter.setNumber(0);
    }

    function testIncrement() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testSetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }
}
```

To execute the tests, run `forge test` in your terminal.

### Getting Started with Foundry

To begin using Foundry, follow these steps:

1. **Installation:** Install Foundry by executing a single command from the official documentation. This process is straightforward and quick.

2. **Create a New Project:** Start a new Foundry project with the command `forge init my-project`. This command sets up the necessary file structure.

3. **Learn from the Foundry Book:** The official documentation, known as the "Foundry Book," offers extensive resources detailing every aspect of the toolkit. Familiarizing yourself with this resource can enhance your proficiency.

### Performance Comparison: Foundry vs. Hardhat

The following table summarizes the performance differences between Foundry and Hardhat based on various metrics:

| Feature                   | Foundry                     | Hardhat                   |
|---------------------------|----------------------------|---------------------------|
| Compilation Speed         | Significantly faster       | Variable (depends on setup) |
| Testing Speed             | Runs directly in the EVM   | Runs in a JavaScript runtime |
| Fuzz Testing Support      | Built-in support           | Requires additional plugins |
| Command-Line Interface     | Simple and intuitive       | More complex due to dependencies |
| Local Testnet             | Anvil (fast local node)    | Hardhat Network (variable speed) |

### Why Developers are Choosing Foundry

The growing preference for Foundry among developers stems from its integration of testing and development processes. By allowing developers to remain within the Solidity environment, Foundry reduces the risk of errors that arise from context switching. Additionally, the high speed of execution and testing significantly improves productivity.

Also, the built-in fuzz testing capabilities enhance the security of smart contracts. Developers can identify vulnerabilities early in the development process, reducing the likelihood of issues in production. 

