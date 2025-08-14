
export interface Question {
    id: string;
    difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert';
    category: 'Knowledge' | 'Practical' | 'Debugging' | 'Design' | 'Architecture' | 'Risk' | 'Strategy' | 'Communication';
    question: string;
    idealAnswer: {
        coreIdea: string;
        keyPoints: string[];
        example?: string;
    };
    commonPitfalls: string[];
    whyThisMatters: string[];
    followUps: string[];
    redFlags: string[];
    scoringRubric: {
        1: string;
        3: string;
        5: string;
    };
    expectedTime: string;
}

export interface Role {
    id: string;
    role: string;
    snapshot: string;
    coreCompetencies: string[];
    questions: {
        Foundation: Question[];
        Intermediate: Question[];
        Advanced: Question[];
        Expert: Question[];
    };
}

export const interviewData = {
    roles: [
        {
            id: 'solidity-developer',
            role: 'Solidity / Smart Contract Developer (EVM)',
            snapshot: 'Designs, builds, and deploys the on-chain logic for dApps. Outputs are secure, gas-efficient smart contracts. Core tools include Solidity, Hardhat/Foundry, and Ethers.js.',
            coreCompetencies: [
                'Solidity Proficiency',
                'EVM Knowledge',
                'Security Best Practices',
                'Gas Optimization',
                'Testing (Unit, Forking)',
                'Debugging',
                'ERC Standards',
                'Upgradability Patterns'
            ],
            questions: {
                Foundation: [
                    {
                        id: 'SOL-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the difference between `storage`, `memory`, and `calldata` in Solidity?',
                        idealAnswer: {
                            coreIdea: 'They are three different data locations in the EVM, each with distinct costs, persistence, and modification rules.',
                            keyPoints: [
                                '`storage`: Persistent data stored on the blockchain. Most expensive to write to and read from. State variables are in storage by default.',
                                '`memory`: Temporary data location that exists only during function execution. Cheaper than storage. Used for complex computations and temporary variables.',
                                '`calldata`: Non-modifiable, temporary data location for external function arguments. It is the cheapest data location as it avoids copying data.',
                                'Rule of thumb: Use `calldata` for external function arguments, `memory` for temporary variables within functions, and `storage` for state that needs to persist across transactions.'
                            ],
                        },
                        commonPitfalls: [
                            'Confusing `calldata` and `memory`. Using `memory` for external function arguments when `calldata` would be more efficient.',
                            'Unnecessarily writing intermediate calculations to `storage`, which is very gas-intensive.',
                            'Not understanding that `calldata` is read-only.'
                        ],
                        whyThisMatters: [
                            'Understanding data locations is fundamental to gas optimization.',
                            'Incorrect usage can lead to extremely high transaction costs or buggy code.'
                        ],
                        followUps: [
                            'When would you choose `memory` over `calldata` for a function argument?',
                            'How does the EVM handle memory allocation during a function call?'
                        ],
                        redFlags: [
                            'Unable to explain the gas cost differences.',
                            'Believing `calldata` can be modified.',
                            'Not knowing which data types are value types vs. reference types.'
                        ],
                        scoringRubric: {
                            1: 'Cannot differentiate between the three.',
                            3: 'Correctly defines them but is unclear on gas costs or when to use each.',
                            5: 'Clearly explains all three with correct cost and mutability properties, and provides a clear example of when to use each.'
                        },
                        expectedTime: '60-90 seconds'
                    },
                    {
                        id: 'SOL-F-02',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is a function modifier and can you provide a simple example?',
                        idealAnswer: {
                            coreIdea: 'A modifier is reusable code that can be attached to a function to change its behavior, typically used to enforce access control or other preconditions.',
                            keyPoints: [
                                'Modifiers are declared with the `modifier` keyword.',
                                'They can execute code before and/or after the function body runs. The `_` symbol in a modifier indicates where the function body is executed.',
                                'The most common use case is for access control, like an `onlyOwner` check.',
                                'Other uses include input validation or adding a reentrancy guard.'
                            ],
                            example: `// Solidity ^0.8.x
address public owner;
modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _; // Function body executes here
}
function changeOwner(address _newOwner) public onlyOwner {
    owner = _newOwner;
}`
                        },
                        commonPitfalls: [
                            'Forgetting the `_` placeholder, which prevents the function body from executing.',
                            'Using modifiers for complex logic that should be in the function itself.',
                        ],
                        whyThisMatters: [
                            'Modifiers are a fundamental pattern for writing clean, reusable, and secure code.',
                            'They help prevent code duplication for common checks.'
                        ],
                        followUps: [
                            'How can a modifier receive arguments?',
                            'What are the gas implications of using a modifier vs. an internal function call?'
                        ],
                        redFlags: [
                            'Not understanding the role of the `_` symbol.',
                            'Thinking modifiers can return values.'
                        ],
                        scoringRubric: {
                            1: 'Does not know what a modifier is.',
                            3: 'Understands it\'s for checks but cannot write a correct example or explain the `_`.',
                            5: 'Provides a clear definition and a correct code example, explaining the `_` and common use cases.'
                        },
                        expectedTime: '60 seconds'
                    },
                    {
                        id: 'SOL-F-03',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What are ERC-20 and ERC-721, and what is the key difference between them?',
                        idealAnswer: {
                            coreIdea: 'They are two standard interfaces for tokens on Ethereum. ERC-20 is for fungible tokens, while ERC-721 is for non-fungible tokens (NFTs).',
                            keyPoints: [
                                '**Fungible (ERC-20):** Each token is identical and interchangeable, like a dollar bill. One unit of an ERC-20 token is the same as any other unit. Used for cryptocurrencies, governance tokens, etc.',
                                '**Non-Fungible (ERC-721):** Each token is unique and has a distinct ID. They are not interchangeable. Used for digital collectibles, art, game items, and deeds.',
                                'The key technical difference is that ERC-20\'s `balanceOf` returns a `uint256` (how many tokens an address has), while ERC-721\'s `ownerOf` takes a `tokenId` and returns an `address` (who owns this specific token).',
                            ],
                        },
                        commonPitfalls: [
                            'Confusing fungible and non-fungible.',
                            'Thinking ERC-721 tokens can have decimals or be split.',
                        ],
                        whyThisMatters: [
                            'Token standards are the foundation of interoperability in DeFi and NFTs.',
                            'A developer must know which standard to use for a given application.'
                        ],
                        followUps: [
                            'What is ERC-1155 and what problem does it solve?',
                            'How does the `approve` function work in these standards?',
                        ],
                        redFlags: [
                            'Inability to define fungibility.',
                            'Mixing up the core functions of each standard.'
                        ],
                        scoringRubric: {
                            1: 'Cannot explain the difference.',
                            3: 'Knows ERC-20 is for "coins" and ERC-721 is for "NFTs" but lacks technical depth.',
                            5: 'Clearly explains fungibility and the key functional differences between the standards.'
                        },
                        expectedTime: '90 seconds'
                    },
                    {
                        id: 'SOL-F-04',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the purpose of `view` and `pure` functions?',
                        idealAnswer: {
                            coreIdea: 'They are function-mutability specifiers that indicate whether a function reads from or modifies the blockchain state.',
                            keyPoints: [
                                '`view` functions promise not to modify the state. They can read state variables, but cannot write to them.',
                                '`pure` functions promise not to even read the state. They only operate on their input parameters and local variables.',
                                'Both `view` and `pure` functions do not consume gas when called externally (i.e., from outside the blockchain) because they do not create a transaction.',
                                'When called internally (from another function within the same contract), they do consume a small amount of gas.'
                            ],
                        },
                        commonPitfalls: [
                            'Thinking `view` and `pure` functions never cost gas.',
                            'Using `view` when `pure` would suffice.',
                            'Forgetting to label functions correctly, which can lead to compilation warnings or inefficient gas usage.'
                        ],
                        whyThisMatters: [
                            'Correctly using `view` and `pure` is a signal of a disciplined developer and can save gas.',
                            'It clearly communicates the function\'s intent to other developers and auditors.'
                        ],
                        followUps: [
                            'Can a `view` function call a `pure` function? What about the other way around?',
                            'What happens if you try to modify a state variable inside a `view` function?'
                        ],
                        redFlags: [
                            'Not understanding the difference between them.',
                            'Believing they are interchangeable.',
                        ],
                        scoringRubric: {
                            1: 'Cannot define `view` or `pure`.',
                            3: 'Knows they relate to not modifying state, but confuses the difference between reading and not reading state.',
                            5: 'Clearly defines both, explains the gas implications of external vs. internal calls, and understands the hierarchy.'
                        },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'SOL-I-01',
                        difficulty: 'Intermediate',
                        category: 'Security',
                        question: 'Explain the Checks-Effects-Interactions pattern and why it is crucial for preventing reentrancy attacks.',
                        idealAnswer: {
                            coreIdea: 'It\'s a programming pattern that dictates the order of operations within a function to mitigate reentrancy vulnerabilities.',
                            keyPoints: [
                                '1. **Checks:** First, perform all validation (e.g., `require(balance > 0)`).',
                                '2. **Effects:** Second, update the contract\'s internal state (e.g., `balances[msg.sender] = 0`). This is the critical step.',
                                '3. **Interactions:** Last, call any external contracts or send Ether.',
                                'By updating the state *before* the external call, the contract\'s state is consistent even if the external contract calls back (re-enters). The re-entrant call will fail the initial "check" because the state has already been updated.'
                            ],
                            example: `// Vulnerable to reentrancy
function withdraw_bad() public {
    uint amount = balances[msg.sender];
    require(amount > 0);
    (bool success, ) = msg.sender.call{value: amount}(""); // Interaction before Effect
    require(success);
    balances[msg.sender] = 0; // Effect
}

// Secure with Checks-Effects-Interactions
function withdraw_good() public {
    uint amount = balances[msg.sender];
    // 1. Check
    require(amount > 0);
    // 2. Effect
    balances[msg.sender] = 0; 
    // 3. Interaction
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}`
                        },
                        commonPitfalls: [
                            'Performing checks after interactions.',
                            'Updating state variables after an external call.',
                            'Not recognizing that sending Ether is an interaction.'
                        ],
                        whyThisMatters: [
                            'Reentrancy is one of the most common and devastating vulnerabilities in smart contracts.',
                            'Following this pattern is a fundamental security best practice.'
                        ],
                        followUps: [
                            'What is a "read-only" reentrancy attack?',
                            'How does a reentrancy guard or mutex work as an alternative?',
                            'Why is using `.transfer()` or `.send()` no longer the recommended protection against reentrancy?'
                        ],
                        redFlags: [
                            'Not knowing what reentrancy is.',
                            'Thinking the order of operations doesn\'t matter.',
                            'Believing that `transfer()` is a complete solution.'
                        ],
                        scoringRubric: {
                            1: 'Cannot explain the pattern or reentrancy.',
                            3: 'Understands the concept of reentrancy but struggles to articulate the pattern correctly.',
                            5: 'Clearly explains the pattern, the vulnerability it prevents, and can write or analyze code demonstrating it.'
                        },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'SOL-I-02',
                        difficulty: 'Intermediate',
                        category: 'Architecture',
                        question: 'What is an upgradeability proxy pattern, and how does `delegatecall` enable it?',
                        idealAnswer: {
                            coreIdea: 'An upgradeability proxy pattern allows a smart contract\'s logic to be updated while preserving its state and address, using a proxy contract that forwards calls to a separate logic contract.',
                            keyPoints: [
                                'It separates state from logic. A **proxy contract** holds the state (e.g., user balances) and has a persistent address. A **logic (or implementation) contract** contains the business logic.',
                                'Users interact with the proxy contract\'s address.',
                                'The proxy uses `delegatecall` to execute the logic from the implementation contract *in the context of the proxy\'s storage*. This means the logic contract can read and write to the proxy\'s state.',
                                'To upgrade, a new logic contract is deployed, and the proxy is updated to point to the new logic contract\'s address. The state and address remain unchanged.',
                            ]
                        },
                        commonPitfalls: [
                            'Confusing `delegatecall` with a regular `call`.',
                            'Not understanding the risks, such as storage layout collisions.',
                            'Thinking the state is stored in the logic contract.'
                        ],
                        whyThisMatters: [
                            'Smart contracts are immutable, making bug fixes or feature additions impossible without a pattern like this.',
                            'It is the industry standard for building maintainable and evolving protocols.'
                        ],
                        followUps: [
                            'What is the difference between the Transparent Proxy Pattern and the UUPS pattern?',
                            'What is a storage collision and how do you prevent it?',
                            'What are the centralization risks of an upgradable contract?'
                        ],
                        redFlags: [
                            'Believing smart contracts can be directly edited after deployment.',
                            'Not being able to explain what `delegatecall` does.',
                            'Ignoring the security and governance implications.'
                        ],
                        scoringRubric: {
                            1: 'Does not understand that contracts are immutable or how they can be upgraded.',
                            3: 'Understands the proxy concept but is fuzzy on the details of `delegatecall` or state separation.',
                            5: 'Clearly explains the separation of state and logic, the role of `delegatecall`, and can discuss the trade-offs.'
                        },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'SOL-I-03',
                        difficulty: 'Intermediate',
                        category: 'Gas Optimization',
                        question: 'When packing structs for gas efficiency, how should you order the variables? Give an example.',
                        idealAnswer: {
                            coreIdea: 'Variables in a struct should be ordered from the smallest data type to the largest, so the EVM can pack smaller variables into a single 256-bit storage slot.',
                            keyPoints: [
                                'The EVM operates on 32-byte (256-bit) words. Writing to a new storage slot is very expensive (`SSTORE` opcode).',
                                'If multiple variables can fit into a single 32-byte slot, the compiler will "pack" them together.',
                                'To enable packing, declare variables smaller than 32 bytes next to each other. The optimal order is by size (e.g., `uint64`, `uint64`, `uint128`, `uint256`).'
                            ],
                            example: `// Inefficient: Uses 3 storage slots
struct Unpacked {
    uint128 a; // Slot 1
    uint256 b; // Slot 2
    uint128 c; // Slot 3
}

// Efficient: Uses 2 storage slots
struct Packed {
    uint128 a; // Slot 1 (gets packed with c)
    uint128 c; // Slot 1
    uint256 b; // Slot 2
}`
                        },
                        commonPitfalls: [
                            'Thinking variable order doesn\'t matter.',
                            'Applying this logic to memory/calldata variables, where it is often less efficient due to EVM word alignment.',
                            'Not knowing the sizes of common data types (`address` is 20 bytes, `bool` is 1 byte, etc).'
                        ],
                        whyThisMatters: [
                            'Storage optimization is a major source of gas savings.',
                            'Demonstrates a deeper understanding of how the EVM works under the hood.'
                        ],
                        followUps: [
                            'Does this packing apply to constants?',
                            'How are dynamic arrays and mappings handled in storage?',
                        ],
                        redFlags: [
                            'Randomly ordering variables in structs.',
                            'Being unaware of storage slot packing.',
                        ],
                        scoringRubric: {
                            1: 'Is unaware of struct packing.',
                            3: 'Knows that smaller variables should be grouped but cannot explain why or give a clear example.',
                            5: 'Clearly explains storage slots, packing, and provides a correct example of optimal ordering.'
                        },
                        expectedTime: '90 seconds'
                    }
                ],
                Advanced: [
                     {
                        id: 'SOL-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Describe how you would design a gas-efficient airdrop contract to distribute an ERC-20 token to 10,000 addresses.',
                        idealAnswer: {
                            coreIdea: 'A standard loop-based push airdrop is infeasible due to gas limits. The best approach is a pull-based pattern using a Merkle tree to verify eligibility off-chain.',
                            keyPoints: [
                                '**Problem with Push:** A simple `for` loop calling `transfer` on 10,000 addresses would exceed the block gas limit and fail. It\'s also incredibly expensive.',
                                '**Merkle Tree Solution (Pull Pattern):**',
                                '1. **Off-chain:** Generate a list of all recipient addresses and amounts. Construct a Merkle tree from this data.',
                                '2. **On-chain:** Store only the `merkleRoot` (a single 32-byte hash) in the airdrop contract. This is extremely gas-efficient.',
                                '3. **Claiming:** To claim, a user submits their address, amount, and a `merkleProof` to the contract\'s `claim` function.',
                                '4. **Verification:** The contract uses the provided proof to recalculate the Merkle root. If it matches the stored `merkleRoot`, the claim is valid, and the contract transfers the tokens. The contract also tracks who has already claimed to prevent replays.'
                            ],
                        },
                        commonPitfalls: [
                            'Suggesting a simple `for` loop, showing a lack of understanding of gas limits.',
                            'Not considering how to prevent a user from claiming multiple times.',
                            'Being unable to explain what a Merkle proof is or how it works at a high level.'
                        ],
                        whyThisMatters: [
                            'This pattern is critical for any large-scale token distribution.',
                            'It demonstrates an advanced understanding of gas optimization and off-chain/on-chain trade-offs.'
                        ],
                        followUps: [
                            'What are the potential UX challenges with a Merkle-based claim?',
                            'How would you handle a scenario where the initial airdrop data was incorrect?',
                            'Are there alternative patterns, like signing messages off-chain?'
                        ],
                        redFlags: [
                            'Insisting that a loop would work.',
                            'Not understanding what a Merkle tree is used for.',
                            'Failing to consider replay protection for claims.'
                        ],
                        scoringRubric: {
                            1: 'Suggests a naive loop-based approach.',
                            3: 'Mentions a pull pattern but cannot explain Merkle trees or the implementation details.',
                            5: 'Clearly explains the Merkle tree approach, its gas efficiency, and the on-chain vs. off-chain components.'
                        },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'SOL-A-02',
                        difficulty: 'Advanced',
                        category: 'Knowledge',
                        question: 'What is the "CREATE2" opcode and what are its primary use cases?',
                        idealAnswer: {
                            coreIdea: 'CREATE2 is an opcode that allows for the creation of a contract at a deterministic address, an address that can be known in advance of deployment.',
                            keyPoints: [
                                'A normal `CREATE` opcode generates an address based on the deployer\'s address and their nonce. This is not predictable.',
                                '`CREATE2` generates an address based on the deployer\'s address, a `salt` (an arbitrary value), and the `init_code` hash of the contract being deployed.',
                                'Because the address is predictable, it allows for counterfactual deployment: you can interact with an address (e.g., send funds to it) before the contract has actually been deployed there.',
                                'Primary use cases include state channels, Layer 2 scaling solutions, and upgradeable proxy factories where a single factory can deploy many instances to predictable addresses.'
                            ],
                        },
                        commonPitfalls: [
                            'Confusing the inputs for CREATE vs CREATE2.',
                            'Not understanding the concept of counterfactual deployment.'
                        ],
                        whyThisMatters: [
                            'CREATE2 is a powerful, low-level feature that enables many advanced architectural patterns.',
                            'It is fundamental to the operation of many scaling and state-channel systems.'
                        ],
                        followUps: [
                            'How could CREATE2 be used to build a more user-friendly smart contract wallet?',
                            'What are the security implications of being able to re-deploy a contract to the same address after it has self-destructed?'
                        ],
                        redFlags: [
                            'Not knowing that contract addresses can be pre-determined.',
                            'Having no idea what use cases it enables.'
                        ],
                        scoringRubric: {
                            1: 'Has not heard of CREATE2.',
                            3: 'Knows it creates a predictable address but cannot explain how or why that is useful.',
                            5: 'Clearly explains how the address is derived and provides strong examples of its use cases, like state channels.'
                        },
                        expectedTime: '120 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'SOL-E-01',
                        difficulty: 'Expert',
                        category: 'Architecture',
                        question: 'Explain the concept of `tx.origin` and describe a scenario where its use leads to a security vulnerability.',
                        idealAnswer: {
                            coreIdea: '`tx.origin` is a global variable in Solidity that returns the address of the externally owned account (EOA) that originally started the transaction. Its use for authorization is dangerous and makes contracts vulnerable to phishing attacks.',
                            keyPoints: [
                                '**`tx.origin` vs. `msg.sender`:** `msg.sender` is the immediate caller of a function. In a simple call from an EOA, `tx.origin` and `msg.sender` are the same. However, in a chain of calls (EOA -> Contract A -> Contract B), for Contract B, `msg.sender` is Contract A\'s address, but `tx.origin` is still the EOA\'s address.',
                                '**Vulnerability Scenario (Phishing):**',
                                '1. A victim\'s wallet contract (`VictimWallet`) has an `owner` and a `transfer` function that uses `require(tx.origin == owner)` for authentication.',
                                '2. An attacker deploys a malicious contract (`AttackContract`) with a function that calls `VictimWallet.transfer(...)`.',
                                '3. The attacker tricks the victim (the owner) into calling a seemingly harmless function on `AttackContract` (e.g., to claim a free NFT).',
                                '4. When the victim calls `AttackContract`, `tx.origin` is the victim\'s address. The `AttackContract` then calls `VictimWallet.transfer(...)`.',
                                '5. The check `require(tx.origin == owner)` inside `VictimWallet` passes, because the original transaction initiator was the owner. The contract then transfers its funds to the attacker.',
                                '**Best Practice:** Never use `tx.origin` for authorization. Always use `msg.sender`.'
                            ],
                        },
                        commonPitfalls: [
                            'Confusing `tx.origin` with `msg.sender`.',
                            'Thinking `tx.origin` is safe for authentication.',
                            'Not being able to construct a clear attack scenario.'
                        ],
                        whyThisMatters: [
                            'This is a classic but critical vulnerability that demonstrates a deep understanding of the EVM\'s call context.',
                            'It is a major red flag if a developer uses `tx.origin` for authorization.'
                        ],
                        followUps: [
                            'Are there any legitimate, non-authentication uses for `tx.origin`?',
                            'How does this relate to the concept of meta-transactions?',
                        ],
                        redFlags: [
                            'Stating that `tx.origin` and `msg.sender` are always the same.',
                            'Defending the use of `tx.origin` for authentication.',
                        ],
                        scoringRubric: {
                            1: 'Does not know what `tx.origin` is.',
                            3: 'Knows it\'s different from `msg.sender` but cannot explain the vulnerability clearly.',
                            5: 'Clearly defines both variables, explains the phishing attack vector with precision, and states the best practice.'
                        },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'SOL-E-02',
                        difficulty: 'Expert',
                        category: 'Risk',
                        question: 'What is Maximal Extractable Value (MEV) and how can a "sandwich attack" affect a user of a DEX?',
                        idealAnswer: {
                            coreIdea: 'MEV is the profit a block producer can make by reordering, inserting, or censoring transactions within a block. A sandwich attack is a common MEV strategy that exploits this power.',
                            keyPoints: [
                                'Block producers (validators) have the power to decide the order of transactions in a block.',
                                'MEV "searchers" are bots that monitor the public mempool for profitable opportunities.',
                                'A **Sandwich Attack** unfolds as follows:',
                                '1. A searcher sees a large user buy order for Token A on a DEX in the mempool.',
                                '2. The searcher **front-runs** the user by placing their own buy order for Token A with a higher gas fee, ensuring it executes first. This slightly increases the price.',
                                '3. The user\'s original buy order executes at a slightly worse price (higher slippage) than they expected.',
                                '4. The searcher then **back-runs** the user by immediately selling their Token A, capitalizing on the price increase they caused. The user\'s trade is "sandwiched".',
                            ],
                        },
                        commonPitfalls: [
                            'Thinking MEV is only about front-running.',
                            'Not understanding the role of the mempool.',
                            'Believing MEV is always a bad thing (e.g., arbitrage is a form of MEV that improves market efficiency).'
                        ],
                        whyThisMatters: [
                            'MEV is a fundamental and unavoidable reality of transparent blockchains.',
                            'It represents an "invisible tax" on users and impacts dApp design, especially for DEXs.'
                        ],
                        followUps: [
                            'What are some strategies to mitigate sandwich attacks for users and for DEX designers?',
                            'What is Flashbots and how does it attempt to democratize MEV and reduce its negative externalities?',
                            'How do encrypted mempools change the MEV game?',
                        ],
                        redFlags: [
                            'Being unaware of MEV.',
                            'Not understanding how transaction ordering can be manipulated.',
                        ],
                        scoringRubric: {
                            1: 'Has not heard of MEV.',
                            3: 'Understands front-running but cannot clearly explain the mechanics of a sandwich attack.',
                            5: 'Clearly explains MEV, the sandwich attack sequence, and can discuss mitigation strategies and the broader implications.'
                        },
                        expectedTime: '180 seconds'
                    }
                ],
            }
        },
        {
            id: 'smart-contract-auditor',
            role: 'Smart Contract Auditor',
            snapshot: 'Specializes in finding security vulnerabilities in smart contract code. Outputs are detailed audit reports. Adversarial mindset is key.',
            coreCompetencies: ['Deep EVM/Solidity Knowledge', 'Common Attack Vectors', 'Static/Dynamic Analysis', 'Formal Verification', 'Gas Optimization Exploits', 'Economic Exploit Analysis'],
            questions: {
                Foundation: [
                     {
                        id: 'AUD-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the primary purpose of a smart contract audit?',
                        idealAnswer: {
                            coreIdea: 'The primary purpose is to identify security vulnerabilities, design flaws, and potential economic exploits in smart contract code before it is deployed to production, where it will manage user funds.',
                            keyPoints: [
                                'It is an independent review by third-party security experts.',
                                'It aims to find issues that developers, who have a constructive mindset, might miss.',
                                'The output is an audit report that lists findings, their severity, and recommendations for fixes.',
                                'A secondary purpose is to provide a signal of trust and security to potential users and investors.'
                            ]
                        },
                        commonPitfalls: ['Thinking an audit is a guarantee that a contract is 100% bug-free.', 'Believing an audit is just about running automated tools.'],
                        whyThisMatters: ['Understanding the goal of an audit is the first step to being a good auditor.', 'It sets the context for all other security-related work.'],
                        followUps: ['What is the difference between a manual audit and using a static analysis tool?', 'What are some well-known audit firms in the space?'],
                        redFlags: ['Stating that an audit "proves" a contract is safe.', 'Underestimating the role of manual code review.'],
                        scoringRubric: { 1: 'Doesn\'t know.', 3: 'Says "to find bugs" without mentioning security or user funds.', 5: 'Clearly explains the goal of identifying vulnerabilities to protect user funds and build trust.' },
                        expectedTime: '60 seconds'
                    },
                    {
                        id: 'AUD-F-02',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is a "slither" and what kind of issues can it find?',
                        idealAnswer: {
                            coreIdea: 'Slither is a static analysis framework for Solidity, developed by Trail of Bits. It analyzes source code without running it to find potential vulnerabilities and code quality issues.',
                            keyPoints: [
                                'It has a suite of pre-built "detectors" for common vulnerabilities like reentrancy, uninitialized storage pointers, and use of `tx.origin`.',
                                'It provides a "printer" framework for outputting information about the contract, such as its inheritance graph or function summaries.',
                                'It can be integrated into CI/CD pipelines to automatically scan code on every commit.',
                                'It is a powerful tool but is not a substitute for manual review, as it can have false positives and cannot detect complex economic logic flaws.'
                            ],
                        },
                        commonPitfalls: ['Thinking Slither is a dynamic analysis tool.', 'Believing that a "clean" Slither run means the contract is secure.'],
                        whyThisMatters: ['It is a standard tool in every auditor\'s toolkit.', 'Knowing its capabilities and limitations is essential for an efficient audit process.'],
                        followUps: ['Name two other static analysis tools.', 'Describe a vulnerability that Slither would likely miss.'],
                        redFlags: ['Has never heard of Slither.', 'Confuses it with tools like Mythril (dynamic analysis) or Echidna (fuzzing).'],
                        scoringRubric: { 1: 'Does not know what Slither is.', 3: 'Knows it\'s a security tool but is unclear on what it does or its category (static analysis).', 5: 'Clearly defines Slither, its uses, and its limitations.' },
                        expectedTime: '90 seconds'
                    }
                ], 
                Intermediate: [
                    {
                        id: 'AUD-I-01',
                        difficulty: 'Intermediate',
                        category: 'Debugging',
                        question: 'You are auditing a simple staking contract. What is the first thing you check for regarding the ERC-20 token being staked?',
                        idealAnswer: {
                            coreIdea: 'Check if the token is a standard ERC-20 or if it has non-standard features like fees-on-transfer, or is susceptible to re-basing.',
                            keyPoints: [
                                'A fee-on-transfer token (like Safemoon) will cause `balanceOf(this)` to increase by less than the `amount` transferred in.',
                                'If the contract calculates rewards based on this difference, it can be exploited or lead to incorrect reward calculations.',
                                'Rebasing tokens (like stETH before V2) change their supply, which can break accounting logic if the contract only stores a `uint` balance instead of shares.',
                                'The first step is always to read the token contract\'s code to understand its behavior fully.'
                            ]
                        },
                        commonPitfalls: ['Only checking for standard ERC-20 functions.', 'Assuming all tokens behave identically.'],
                        whyThisMatters: ['Interaction with non-standard tokens is a major source of bugs and exploits in DeFi.', 'Shows the auditor thinks about external dependencies, not just the contract in isolation.'],
                        followUps: ['How would you design a staking contract to safely handle fee-on-transfer tokens?', 'What tools could you use to quickly identify a non-standard ERC-20?'],
                        redFlags: ['Not considering the token\'s implementation at all.', 'Believing all ERC-20 tokens are the same.'],
                        scoringRubric: {
                            1: 'Doesn\'t know to check the token contract.',
                            3: 'Mentions checking for token behavior but cannot specify what to look for.',
                            5: 'Immediately identifies fee-on-transfer and rebasing as primary concerns and explains the potential issues.'
                        },
                        expectedTime: '90 seconds'
                    },
                    {
                        id: 'AUD-I-02',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is the signature replay attack and how can it be prevented?',
                        idealAnswer: {
                            coreIdea: 'A signature replay attack occurs when an attacker intercepts a valid, signed message and "replays" it in a different context or at a later time to trigger an unauthorized action. It is prevented using nonces and domain separators.',
                            keyPoints: [
                                '**Prevention Mechanisms:**',
                                '1. **Nonce:** A per-user, incrementing number. The contract tracks each user\'s nonce. A signed message must include the user\'s current nonce. When the message is processed, the contract checks the nonce and then increments it, ensuring the same signature cannot be used again.',
                                '2. **Domain Separator (EIP-712):** A unique hash identifying the specific contract and chain. This prevents a signature created for one dApp from being replayed on another.',
                                '3. **Deadline/Expiry:** Including a timestamp or block number after which the signature is no longer valid.'
                            ]
                        },
                        commonPitfalls: ['Only mentioning nonces without domain separators.', 'Not understanding why both are needed for full protection.'],
                        whyThisMatters: ['This is a critical vulnerability in systems that use off-chain signatures for actions like permit-style approvals or meta-transactions.'],
                        followUps: ['Explain EIP-2612 (Permit) and how it uses these concepts.', 'How can a user "cancel" a signature they have given out?'],
                        redFlags: ['Not being aware of signature replay as a vulnerability.', 'Suggesting that simply checking the signature is enough.'],
                        scoringRubric: { 1: 'Is unaware of the attack.', 3: 'Mentions nonces as a solution but cannot explain domain separators or the full context.', 5: 'Clearly explains the attack and describes multiple prevention mechanisms (nonce, EIP-712, deadline).' },
                        expectedTime: '120 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'AUD-A-01',
                        difficulty: 'Advanced',
                        category: 'Risk',
                        question: 'Explain the concept of oracle manipulation. How would you attack a lending protocol that uses a Uniswap v2 TWAP oracle for a low-liquidity token?',
                        idealAnswer: {
                            coreIdea: 'Oracle manipulation is when an attacker artificially influences the price feed used by a protocol to profit, for example, by borrowing assets against over-valued collateral.',
                            keyPoints: [
                                'Uniswap v2 TWAP (Time-Weighted Average Price) oracles are vulnerable to manipulation, especially over short periods and with low liquidity pairs.',
                                'An attacker can manipulate the price by executing a large trade in one block, which heavily skews the spot price.',
                                '**Attack Scenario:**',
                                '1. The attacker takes out a large flash loan of Token A.',
                                '2. They swap the large amount of Token A for Token B (the low-liquidity collateral) on the Uniswap v2 pair, drastically pumping the price of Token B.',
                                '3. In the same transaction, they go to the lending protocol. The protocol\'s oracle now reports an artificially high price for Token B.',
                                '4. The attacker deposits their now "highly valuable" Token B as collateral and borrows the maximum amount of another asset (e.g., stablecoins).',
                                '5. They repay the flash loan. The price of Token B returns to normal, but the attacker has absconded with the borrowed assets, leaving the protocol with undercollateralized debt.'
                            ]
                        },
                        commonPitfalls: ['Thinking TWAP is invulnerable.', 'Not understanding the role of flash loans in making such attacks capital-efficient.'],
                        whyThisMatters: ['Oracle security is critical for all DeFi protocols.', 'This question tests the ability to think about economic exploits, not just code-level bugs.'],
                        followUps: ['How does a Uniswap v3 TWAP oracle improve on this?', 'What is a better way to get a price feed for a lending protocol? What are the tradeoffs?'],
                        redFlags: ['Believing on-chain prices cannot be manipulated.', 'Failing to construct the attack sequence correctly.'],
                        scoringRubric: {
                            1: 'Does not know what an oracle is.',
                            3: 'Understands oracles can be manipulated but cannot explain the specific mechanism of a flash loan attack.',
                            5: 'Clearly and correctly lays out the entire sandwich attack sequence and can discuss mitigation strategies.'
                        },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'AUD-A-02',
                        difficulty: 'Advanced',
                        category: 'Practical',
                        question: 'What is fuzzing (or property-based testing) in the context of smart contracts? Name a tool used for it.',
                        idealAnswer: {
                            coreIdea: 'Fuzzing is an automated testing technique where a tool generates a large number of random inputs for a function to find edge cases that violate a defined property or cause the code to crash.',
                            keyPoints: [
                                'Unlike unit testing, where you provide specific inputs, fuzzing explores a much wider input space automatically.',
                                'You define an **invariant** or **property** that should always be true (e.g., "the total supply of the token should never decrease" or "no user can withdraw more than they deposited").',
                                'The fuzzer then calls your functions with random data for thousands or millions of iterations, trying to find a sequence of calls that breaks the invariant.',
                                'Popular tools for this are **Echidna** (from Trail of Bits) and the built-in fuzzing capabilities of **Foundry**.'
                            ]
                        },
                        commonPitfalls: ['Confusing fuzzing with static analysis or formal verification.', 'Thinking it can find all bugs.'],
                        whyThisMatters: ['It is a powerful technique for finding subtle bugs and edge cases that are difficult to predict with manual testing.', 'Shows a commitment to deep, automated testing beyond simple unit tests.'],
                        followUps: ['Describe a good invariant for a simple AMM contract.', 'What are the limitations of fuzzing?'],
                        redFlags: ['Not knowing what fuzzing is.', 'Unable to name a relevant tool.'],
                        scoringRubric: { 1: 'Does not know what fuzzing is.', 3: 'Understands it\'s about random inputs but cannot explain invariants or name a tool.', 5: 'Clearly defines property-based testing, explains how invariants work, and names Foundry or Echidna as the tool.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'AUD-E-01',
                        difficulty: 'Expert',
                        category: 'Communication',
                        question: 'You are auditing a complex protocol and find a subtle but critical flaw. How do you structure your audit report and communicate this finding to the client?',
                        idealAnswer: {
                            coreIdea: 'The communication of a finding is as important as the finding itself. The report must be clear, evidence-based, and provide actionable recommendations without causing unnecessary panic.',
                            keyPoints: [
                                '**Report Structure:**',
                                '1. **Title & Severity:** Give the finding a clear name and a CVSS-based severity score (e.g., Critical, High, Medium).',
                                '2. **Executive Summary:** A one-paragraph explanation of the vulnerability and its potential impact, written for a semi-technical audience.',
                                '3. **Technical Details:** A precise explanation of the bug, including the specific contracts and lines of code involved.',
                                '4. **Proof of Concept:** A coded test case (using Foundry or Hardhat) that demonstrates how to exploit the vulnerability. This is the gold standard.',
                                '5. **Recommendation:** Clear, actionable steps the developers can take to fix the bug.',
                                '**Communication Strategy:**',
                                '1. **Private Disclosure:** First, communicate the finding privately to the client\'s lead engineer or security contact, often in a secure channel.',
                                '2. **Clarity over Jargon:** Explain the business impact clearly. "This bug allows an attacker to steal all user funds" is better than "This leads to an arithmetic overflow in the rewards calculation".',
                                '3. **Collaborative Tone:** Frame it as a collaborative effort to improve security, not as a judgment of their code. Offer to have a call to walk them through the PoC.',
                            ]
                        },
                        commonPitfalls: ['Writing a vague report.', 'Failing to provide a proof of concept.', 'Publicly disclosing the vulnerability before the team has had a chance to fix it.', 'Being overly academic or accusatory in tone.'],
                        whyThisMatters: ['An audit\'s value is in its ability to drive remediation.', 'Effective communication builds trust and ensures critical vulnerabilities are understood and fixed correctly.'],
                        followUps: ['How do you handle a situation where the client disagrees with the severity of your finding?', 'What is your process for re-auditing the fix?'],
                        redFlags: ['Advocating for public disclosure before a fix is implemented.', 'Not understanding the importance of a proof of concept.', 'Poor writing or communication skills.'],
                        scoringRubric: {
                            1: 'Suggests just sending an email saying "there\'s a bug".',
                            3: 'Describes a decent report structure but misses key elements like a PoC or a communication plan.',
                            5: 'Provides a professional, detailed, and empathetic approach covering both the technical report and the human communication aspect.'
                        },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'AUD-E-02',
                        difficulty: 'Expert',
                        category: 'Architecture',
                        question: 'Describe how "unbounded loops" in view functions can become a vector for a Denial of Service (DoS) attack, even if they don\'t consume transaction gas.',
                        idealAnswer: {
                            coreIdea: 'Even though view functions don\'t consume transaction gas when called externally, they still consume computational resources on the node processing the call. An attacker can craft a view function call with an unbounded loop that is so computationally expensive it will time out or crash the node, effectively creating a DoS attack on third-party services (like block explorers or dApp frontends) that rely on that node.',
                            keyPoints: [
                                'An external call to a `view` function is typically handled by a single public RPC node (e.g., from Alchemy or Infura).',
                                'If a contract has a `view` function like `getAllOwners()` that loops through an array of unknown size, an attacker can make this array extremely large.',
                                'When a dApp frontend or an indexing service calls this `getAllOwners()` function, the node will attempt to execute the loop. This can take an enormous amount of time and CPU, causing the request to time out.',
                                'If many services rely on this call, the attacker can effectively make the dApp unusable for everyone by overloading the public nodes that serve its data. This is a DoS attack at the infrastructure layer, not the consensus layer.'
                            ],
                        },
                        commonPitfalls: ['Thinking that since `view` calls are "free," they can\'t be a problem.', 'Focusing only on on-chain transaction gas costs.'],
                        whyThisMatters: ['This demonstrates a sophisticated understanding of the entire Web3 stack, including the role of off-chain infrastructure like RPC nodes.', 'It shows the ability to think about attack vectors beyond direct loss of funds.'],
                        followUps: ['What is a better pattern for retrieving a large list of items from a contract?', 'How do services like Etherscan protect themselves from this?'],
                        redFlags: ['Insisting that `view` functions can never be part of an attack because they are gasless.', 'Having no concept of off-chain infrastructure.'],
                        scoringRubric: { 1: 'Does not understand the question.', 3: 'Recognizes that a long loop is bad but cannot articulate the specific DoS vector against off-chain services.', 5: 'Clearly explains the DoS attack on RPC nodes and distinguishes it from a consensus-level attack.' },
                        expectedTime: '180 seconds'
                    }
                ]
            }
        },
        {
            id: 'frontend-dapp-engineer',
            role: 'Frontend dApp Engineer',
            snapshot: 'Builds user interfaces that interact with smart contracts. Creates seamless and safe user experiences for dApps. Master of React, Ethers.js/Viem.',
            coreCompetencies: ['React/Next.js', 'Ethers.js/Viem', 'Wallet Integration', 'State Management', 'Web3 UX', 'GraphQL'],
            questions: {
                Foundation: [
                    {
                        id: 'FE-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is a "provider" in Ethers.js or Viem and what is its role?',
                        idealAnswer: {
                            coreIdea: 'A provider is a class that provides a read-only connection to the Ethereum blockchain, allowing you to query its state.',
                            keyPoints: [
                                'It allows you to do things like get the current block number, look up a transaction, or call `view` functions on a smart contract.',
                                'It does not have access to private keys and cannot sign transactions.',
                                'Common providers include `JsonRpcProvider` (connecting to a node like Infura/Alchemy) and `BrowserProvider` (connecting to the user\'s wallet provider like MetaMask).',
                            ],
                        },
                        commonPitfalls: ['Confusing a provider with a signer.'],
                        whyThisMatters: ['This is the most basic building block for any dApp frontend.'],
                        followUps: ['What is a "signer" and how is it different from a provider?'],
                        redFlags: ['Not knowing what a provider is.'],
                        scoringRubric: { 1: 'Incorrect.', 3: 'Understands it connects to the blockchain but confuses it with a signer.', 5: 'Clearly distinguishes between provider (read) and signer (write/sign).'},
                        expectedTime: '60 seconds'
                    },
                    {
                        id: 'FE-F-02',
                        difficulty: 'Foundation',
                        category: 'Practical',
                        question: 'How do you format a number from a `uint256` value, like an ERC-20 token balance, for display in a UI?',
                        idealAnswer: {
                            coreIdea: 'You use the `formatUnits` function (from Ethers.js or Viem) along with the token\'s `decimals` value.',
                            keyPoints: [
                                'ERC-20 token amounts are stored as large integers to avoid floating-point errors. You need to know the token\'s `decimals` (usually 18 for tokens like ETH or USDC, but can be different) to convert it to a human-readable format.',
                                'You first fetch the token\'s decimals from its contract.',
                                'Then, you use `ethers.utils.formatUnits(balance, decimals)` or `viem.formatUnits(balance, decimals)` to get a formatted string representation (e.g., "123.45").',
                            ],
                            example: `// Ethers.js
import { ethers } from "ethers";
const balance = 1000000000000000000n; // 1 ETH in wei
const formattedBalance = ethers.formatUnits(balance, 18); // "1.0"`
                        },
                        commonPitfalls: ['Trying to divide the BigInt by 10**18 directly in JavaScript, which can lead to precision loss.', 'Assuming all tokens have 18 decimals.'],
                        whyThisMatters: ['Correctly handling token balances is a fundamental task for any DeFi frontend.'],
                        followUps: ['How would you do the reverse operation (parsing units)?', 'Where do you get the `decimals` value from?'],
                        redFlags: ['Treating the raw `uint256` balance as the display value.', 'Not being aware of the `decimals` property.'],
                        scoringRubric: { 1: 'Does not know how to format the balance.', 3: 'Knows it needs to be divided but is unsure of the correct method or the role of decimals.', 5: 'Correctly identifies the need for `formatUnits` and the token\'s decimals value.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'FE-I-01',
                        difficulty: 'Intermediate',
                        category: 'Practical',
                        question: 'A user reports their transaction is "stuck" as pending. What are the possible causes and how could you handle this in the UI?',
                        idealAnswer: {
                            coreIdea: 'A stuck transaction is usually caused by setting a gas price that is too low for the current network conditions. The UI should provide options to speed up or cancel the transaction.',
                            keyPoints: [
                                '**Causes:** The user submitted a transaction with a `maxFeePerGas` that is below the current network base fee, so validators have no incentive to include it.',
                                '**UI Solutions:**',
                                '1. **Detection:** Store the transaction hash in `localStorage`. On page load, check the status of any pending transactions using `provider.getTransaction`.',
                                '2. **Feedback:** Display a clear "Pending Transaction" indicator in the UI.',
                                '3. **Actions:** Provide "Speed Up" and "Cancel" buttons.',
                                '   - **Speed Up:** Re-submit the same transaction with the same nonce but a higher gas fee.',
                                '   - **Cancel:** Submit a new, zero-value transaction to your own address with the same nonce and a higher gas fee. This will invalidate the original transaction.'
                            ]
                        },
                        commonPitfalls: ['Not knowing how to cancel a transaction.', 'Forgetting the role of the nonce.'],
                        whyThisMatters: ['Handling transaction states gracefully is a key part of good Web3 UX.', 'Demonstrates practical knowledge beyond simple happy-path development.'],
                        followUps: ['How does a nonce work?', 'Where would you get the recommended gas fees for a speed-up transaction?'],
                        redFlags: ['Not knowing what a nonce is or why a transaction would be stuck.'],
                        scoringRubric: { 1: 'Is unaware of stuck transactions.', 3: 'Understands the cause (low gas) but not the solution (resubmitting with same nonce).', 5: 'Clearly explains the cause, the role of the nonce, and how to implement both "Speed Up" and "Cancel" functionality.'},
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'FE-I-02',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is the purpose of a "dead-man\'s switch" in a smart contract?',
                        idealAnswer: {
                            coreIdea: 'A dead-man\'s switch is a mechanism that triggers an action if a specific condition is NOT met within a certain timeframe, essentially acting as a fail-safe.',
                            keyPoints: [
                                'It is designed to activate if the contract owner or operator becomes inactive (e.g., loses their keys).',
                                'A common implementation involves the owner having to call a "keep-alive" function periodically.',
                                'If the "keep-alive" function is not called before a deadline, the switch is triggered, and a secondary action, like transferring ownership to a backup address or unlocking funds for beneficiaries, is executed.',
                                'This is useful for inheritance planning, multisig recovery, or ensuring a protocol doesn\'t become frozen if an admin key is lost.'
                            ]
                        },
                        commonPitfalls: ['Confusing it with a timelock.', 'Thinking it\'s a common pattern for everyday use.'],
                        whyThisMatters: ['Demonstrates knowledge of more advanced, safety-critical smart contract patterns.', 'Shows an understanding of the operational risks of key management.'],
                        followUps: ['How would you implement a simple dead-man\'s switch?', 'What are the gas implications of this pattern?'],
                        redFlags: ['Not knowing what a dead-man\'s switch is.'],
                        scoringRubric: { 1: 'Has not heard of the concept.', 3: 'Understands the general idea of a fail-safe but cannot explain the implementation pattern.', 5: 'Clearly explains the keep-alive mechanism and provides relevant use cases.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'FE-A-01',
                        difficulty: 'Advanced',
                        category: 'Architecture',
                        question: 'How would you design a frontend to display a user\'s entire NFT collection, including images and metadata, across multiple contracts?',
                        idealAnswer: {
                            coreIdea: 'Reading this data on-the-fly from the chain is too slow. The correct approach is to use an indexing service API, like Reservoir, SimpleHash, or a custom-built solution with The Graph.',
                            keyPoints: [
                                '**The Problem:** Finding all NFTs owned by a user would require querying the `Transfer` events of every single NFT contract, which is impossible on the client side.',
                                '**Solution Architecture:**',
                                '1. **Data Source:** Use a specialized NFT API provider (like Reservoir, Alchemy NFT API, or SimpleHash). These services index all NFT data across the chain and provide a simple REST or GraphQL API.',
                                '2. **API Call:** On the frontend, make a single API call to this service, passing in the user\'s address. E.g., `GET /users/{address}/tokens/v6`.',
                                '3. **Data Transformation:** The API returns a clean JSON object containing an array of all NFTs the user owns, including the contract address, token ID, name, image URL, and attributes.',
                                '4. **Rendering:** Map over this array in the React component to display the NFTs. Implement pagination or infinite scroll to handle large collections efficiently.',
                                '5. **Alternative:** If a third-party API is not desirable, you would need to host your own indexer using The Graph protocol, but this is a much heavier lift.'
                            ]
                        },
                        commonPitfalls: ['Proposing to query the blockchain directly.', 'Not thinking about performance issues like pagination.', 'Failing to consider where the NFT metadata (images) is hosted.'],
                        whyThisMatters: ['Demonstrates an understanding of the practical limitations of direct blockchain queries.', 'Shows knowledge of the Web3 frontend stack beyond just Ethers.js.'],
                        followUps: ['How would you handle broken image links or metadata that doesn\'t conform to the standard?', 'What are the pros and cons of using a centralized API provider like Reservoir vs. a decentralized one like The Graph?'],
                        redFlags: ['Suggesting a solution that involves iterating through contracts on the client.', 'Having no awareness of indexing solutions.'],
                        scoringRubric: { 1: 'Proposes an unworkable on-chain solution.', 3: 'Understands direct queries are bad but doesn\'t know the specific tools/APIs to use.', 5: 'Immediately identifies the need for an indexing API, names specific examples, and can discuss the data flow.'},
                        expectedTime: '150 seconds'
                    },
                    {
                        id: 'FE-A-02',
                        difficulty: 'Advanced',
                        category: 'Knowledge',
                        question: 'What is a "diamond proxy" (EIP-2535), and how does it differ from a standard transparent proxy?',
                        idealAnswer: {
                            coreIdea: 'A diamond proxy is an advanced upgradeable proxy pattern that allows a single proxy contract to use logic from multiple implementation contracts (called "facets").',
                            keyPoints: [
                                '**Standard Proxy:** A single proxy contract points to a single logic contract.',
                                '**Diamond Proxy:** A single proxy contract can have multiple facets. When a function is called on the diamond, it looks up which facet is responsible for that function signature and `delegatecall`s to it.',
                                'This allows for modular development where different parts of a large system can be upgraded independently.',
                                'It also helps to overcome the 24kb contract size limit by splitting the logic across multiple implementation contracts.'
                            ]
                        },
                        commonPitfalls: ['Confusing it with a simple multisig.', 'Not understanding how the function selector routing works.'],
                        whyThisMatters: ['It is a powerful pattern for building very large, complex, and modular on-chain systems.', 'Shows knowledge of cutting-edge smart contract architecture.'],
                        followUps: ['What are the trade-offs of using a diamond proxy in terms of gas and complexity?', 'How does the "diamond loupe" feature work?'],
                        redFlags: ['Has never heard of the diamond standard.', 'Believing a proxy can only have one implementation.'],
                        scoringRubric: { 1: 'Does not know what a diamond proxy is.', 3: 'Understands it allows multiple logic contracts but cannot explain how or why.', 5: 'Clearly explains the function selector lookup, modularity, and contract size benefits.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Expert: [
                     {
                        id: 'FE-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'You are building a dApp that requires users to sign messages for off-chain actions (e.g., voting, placing orders on an off-chain order book). Describe the EIP-712 standard and explain why it is superior to signing a simple string with `personal_sign`.',
                        idealAnswer: {
                            coreIdea: 'EIP-712 is a standard for signing typed structured data. It is vastly superior to `personal_sign` because it presents the data to the user in a readable, structured format, preventing phishing attacks where the user is tricked into signing a malicious but unreadable hexadecimal string.',
                            keyPoints: [
                                '**The Problem with `personal_sign`:** It just signs a hash of a string. Wallets display this to the user as an opaque hex string, e.g., `0x...`. The user has no way of knowing what they are actually agreeing to.',
                                '**How EIP-712 Works:**',
                                '1. **Structured Data:** The dApp defines a data structure with named and typed fields (e.g., `domain`, `message`, `types`).',
                                '2. **Readable in Wallet:** When `eth_signTypedData_v4` is called, wallets like MetaMask can parse this structure and display it to the user in a human-readable format (e.g., "Sign message: From: 0x123, To: 0x456, Amount: 100").',
                                '3. **Domain Separator:** It includes a `domain` separator that ties the signature to a specific dApp, preventing a signature from being replayed and used on a different, malicious dApp.',
                                '**Why it Matters:** It turns signing from a blind action into an informed one, dramatically improving security and user trust. It is the gold standard for off-chain message signing.'
                            ]
                        },
                        commonPitfalls: ['Not knowing what EIP-712 is.', 'Thinking `personal_sign` is "good enough".', 'Failing to mention the domain separator and replay protection.'],
                        whyThisMatters: ['This is a critical security and UX primitive for building sophisticated dApps.', 'Shows expert-level knowledge of wallet interactions and user safety.'],
                        followUps: ['How does the backend verify an EIP-712 signature?', 'What is "blind signing" and why should it always be avoided?'],
                        redFlags: ['Advocating for the use of `personal_sign` for structured data.', 'Being unaware of the phishing risks associated with signing opaque data.'],
                        scoringRubric: { 1: 'Does not know what EIP-712 is.', 3: 'Understands it makes signatures more readable but cannot explain why that is important for security or mention the domain separator.', 5: 'Clearly explains the security benefits over `personal_sign`, the role of the domain separator, and the overall improvement in user experience.'},
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'FE-E-02',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is EIP-4337 (Account Abstraction) and what are the roles of the `UserOperation`, `Bundler`, and `Paymaster`?',
                        idealAnswer: {
                            coreIdea: 'EIP-4337 is a specification that achieves Account Abstraction without a core protocol change, enabling smart contract wallets with advanced features like gas abstraction and social recovery.',
                            keyPoints: [
                                'It introduces a higher-level mempool for `UserOperation` objects, which are pseudo-transaction objects.',
                                '`UserOperation`: A struct sent by a user that describes their desired action. It gets sent to a separate mempool.',
                                '`Bundler`: A node that bundles multiple `UserOperation`s from the mempool into a single transaction and sends it to a global `EntryPoint` contract on-chain.',
                                '`Paymaster`: An optional smart contract that can agree to pay for a user\'s gas fees. This enables "gasless" transactions, where a dApp can sponsor its users\' transactions to improve UX.',
                                'The goal is to make a user\'s wallet itself a smart contract, unlocking features not possible with simple EOAs (Externally Owned Accounts).'
                            ]
                        },
                        commonPitfalls: ['Thinking EIP-4337 is a change to the Ethereum consensus layer.', 'Not understanding the relationship between the bundler and the paymaster.'],
                        whyThisMatters: ['Account Abstraction is considered the next major step in improving Web3 user experience.', 'Understanding its components is key to building next-generation dApps.'],
                        followUps: ['How does social recovery work in a smart contract wallet?', 'What are the challenges for bundlers in terms of DoS resistance?'],
                        redFlags: ['Not having heard of Account Abstraction or EIP-4337.', 'Confusing it with simple meta-transactions.'],
                        scoringRubric: { 1: 'Is not aware of EIP-4337.', 3: 'Understands the high-level goal of better wallets but cannot define the specific roles.', 5: 'Clearly defines UserOperation, Bundler, and Paymaster and explains how they work together to enable gas abstraction.' }
                    }
                ]
            }
        },
        {
            id: 'product-manager-web3',
            role: 'Product Manager, Web3',
            snapshot: 'Defines the product vision and roadmap in a decentralized context. Balances user needs, technical constraints, and community governance.',
            coreCompetencies: ['User Research', 'Roadmapping', 'Tokenomics Understanding', 'Community Governance', 'Technical Literacy', 'Data Analysis'],
             questions: {
                Foundation: [
                    {
                        id: 'PM-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is a DAO, and how does it differ from a traditional company in terms of product decision-making?',
                        idealAnswer: {
                            coreIdea: 'A DAO is a Decentralized Autonomous Organization, an internet-native organization owned and managed by its members. Product decisions are made collectively through a transparent governance process, not top-down by executives.',
                            keyPoints: [
                                '**Traditional Company:** A product manager gets roadmap approval from a small group of stakeholders (CEO, Head of Product). The process is internal and opaque.',
                                '**DAO:** A product manager must build consensus within a global, public community. Major decisions are made via governance proposals that are debated and voted on by token holders.',
                                'The PM\'s role shifts from a decider to a facilitator and persuader. They must be able to articulate the "why" of a feature to a diverse audience and incorporate community feedback.',
                            ]
                        },
                        commonPitfalls: ['Defining a DAO in purely technical terms without understanding the social implications.', 'Underestimating the difficulty of community-led governance.'],
                        whyThisMatters: ['This is the fundamental context shift for a Web3 PM.', 'Demonstrates understanding of the unique stakeholder environment.'],
                        followUps: ['What are the pros and cons of DAO-based governance for product development?', 'How would you handle a situation where the community votes against a feature you strongly believe in?'],
                        redFlags: ['Believing the PM can dictate the roadmap without community input.', 'Dismissing governance as just a formality.'],
                        scoringRubric: { 1: 'Cannot define a DAO.', 3: 'Defines a DAO but cannot articulate how it changes the PM role.', 5: 'Clearly explains the shift from top-down decision-making to community consensus building.'},
                        expectedTime: '90 seconds'
                    },
                    {
                        id: 'PM-F-02',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is "Total Value Locked" (TVL) and why is it an important metric for a DeFi protocol?',
                        idealAnswer: {
                            coreIdea: 'TVL represents the total value of all assets deposited by users into a DeFi protocol\'s smart contracts. It is a key indicator of the protocol\'s adoption and perceived trust.',
                            keyPoints: [
                                'It measures the total capital that is currently being utilized within a protocol for activities like lending, staking, or providing liquidity.',
                                'A higher TVL generally indicates greater user trust and a stronger network effect.',
                                'It is often used as a primary metric to compare the market share and health of different DeFi protocols.',
                                'However, TVL can be misleading as it can be inflated by a protocol\'s own token rewards (high yield farming incentives).'
                            ],
                        },
                        commonPitfalls: ['Confusing TVL with market cap.', 'Thinking high TVL always means a protocol is safe or profitable.'],
                        whyThisMatters: ['TVL is the most commonly cited metric in DeFi and a PM must understand what it represents and its limitations.'],
                        followUps: ['What other metrics would you use alongside TVL to get a more complete picture of a protocol\'s health?', 'How can a protocol\'s tokenomics design artificially inflate its TVL?'],
                        redFlags: ['Not knowing what TVL is.', 'Being unable to explain its significance.'],
                        scoringRubric: { 1: 'Cannot define TVL.', 3: 'Knows it relates to value but is unclear on its meaning or importance.', 5: 'Clearly defines TVL, explains its role as a measure of trust, and can articulate its limitations.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'PM-I-01',
                        difficulty: 'Intermediate',
                        category: 'Strategy',
                        question: 'You want to add a new fee-generating feature to a DeFi protocol. Your developers say it\'s technically feasible. What are your next steps before starting development?',
                        idealAnswer: {
                            coreIdea: 'In Web3, technical feasibility is not enough. The next steps involve community buy-in and governance, as the users are also the owners.',
                            keyPoints: [
                                '1. **Community Temperature Check:** Draft an informal proposal and post it on the project\'s governance forum (e.g., Discourse). The goal is to gather initial feedback, address concerns, and build consensus.',
                                '2. **Formal Proposal:** Based on the feedback, write a formal, detailed governance proposal. This should include the technical specification, the potential revenue impact, and any trade-offs.',
                                '3. **Engage in Debate:** Actively participate in the discussion on the forum and on community calls, answering questions and defending the proposal with data.',
                                '4. **Snapshot Vote:** If consensus seems strong, move the proposal to a formal, binding on-chain or off-chain (Snapshot) vote.',
                                '5. **Development:** Only begin development once the proposal has been approved by the token holders (the DAO).',
                            ]
                        },
                        commonPitfalls: ['Assuming the PM can just add the feature to the roadmap and start building.', 'Underestimating the importance of community consensus.'],
                        whyThisMatters: ['This is the core difference between Web2 and Web3 product management.', 'Demonstrates an understanding that you are building *with* a community, not just *for* them.'],
                        followUps: ['What do you do if a controversial proposal fails to pass the vote?', 'How do you balance the desires of large token holders ("whales") vs. smaller users?'],
                        redFlags: ['Describing a purely Web2-style product process.', 'Ignoring the role of the DAO and token holders.'],
                        scoringRubric: { 1: 'Does not understand the role of governance.', 3: 'Mentions needing to talk to the community but doesn\'t describe the formal proposal and voting process.', 5: 'Clearly lays out the entire governance lifecycle from temperature check to vote.'},
                        expectedTime: '150 seconds'
                    },
                    {
                        id: 'PM-I-02',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is impermanent loss and how would you explain it to a non-technical user?',
                        idealAnswer: {
                            coreIdea: 'Impermanent loss is the difference in value between holding two tokens in an AMM liquidity pool versus just holding them in your wallet. It happens when the price of the tokens in the pool changes.',
                            keyPoints: [
                                '**Simple Analogy:** "Imagine you put $50 of ETH and $50 of USDC into a pool. If the price of ETH doubles, the pool has to rebalance, so you end up with less ETH and more USDC than you started with. If you withdraw at that moment, the total value of your assets might be less than if you had just held your original ETH and USDC. This difference is the impermanent loss. It becomes a permanent loss only if you withdraw at that unfavorable time."',
                                'It is caused by the AMM\'s algorithm always selling the token that is going up in price and buying the one that is going down to maintain a 50/50 value balance.',
                                'Liquidity providers are compensated for this risk by earning trading fees.'
                            ]
                        },
                        commonPitfalls: ['Thinking it\'s a permanent loss from the start.', 'Being unable to explain it simply.', 'Believing trading fees always outweigh impermanent loss.'],
                        whyThisMatters: ['This is a fundamental risk in DeFi that every PM in the space must understand and be able to communicate clearly to users.'],
                        followUps: ['What types of liquidity pools are most/least exposed to impermanent loss?', 'How do concentrated liquidity AMMs (like Uniswap V3) affect impermanent loss?'],
                        redFlags: ['Not knowing what impermanent loss is.', 'Making the explanation overly complex and mathematical.'],
                        scoringRubric: { 1: 'Cannot define impermanent loss.', 3: 'Understands it has to do with price changes but the explanation is confusing.', 5: 'Provides a clear, simple definition or analogy and correctly identifies that it\'s a risk compensated by fees.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Advanced: [
                     {
                        id: 'PM-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Your protocol is suffering from low liquidity. Design a tokenomics incentive program to attract liquidity providers. What are the risks?',
                        idealAnswer: {
                            coreIdea: 'The standard approach is a liquidity mining program, where Liquidity Providers (LPs) are rewarded with the protocol\'s native governance token in addition to trading fees. However, this must be designed carefully to avoid creating a "mercenary capital" problem.',
                            keyPoints: [
                                '**Program Design:**',
                                '1. **Target Pools:** Identify the most critical trading pairs that need liquidity.',
                                '2. **Emission Rate:** Allocate a certain number of tokens from the treasury to be distributed as rewards per day/week.',
                                '3. **Vesting/Lockups (Optional but recommended):** Consider vesting or locking the emitted token rewards to encourage long-term alignment and prevent immediate selling pressure.',
                                '**Risks:**',
                                '1. **Inflation:** The new token emissions will inflate the supply, which can suppress the token price if not met with corresponding demand or value accrual.',
                                '2. **Mercenary Capital:** Yield farmers will provide liquidity only to earn and immediately sell the rewards, creating constant sell pressure and leaving as soon as a better yield appears elsewhere.',
                                '3. **Impermanent Loss:** LPs are still exposed to impermanent loss, and the token rewards must be high enough to compensate for this risk.',
                            ]
                        },
                        commonPitfalls: ['Suggesting just "giving away tokens" without thinking about the economic consequences.', 'Not understanding the concept of mercenary capital.', 'Forgetting about impermanent loss.'],
                        whyThisMatters: ['This tests the PM\'s understanding of tokenomics and incentive design, which is a core Web3 product skill.', 'Shows the ability to think about second-order effects of product decisions.'],
                        followUps: ['How could you evolve this program to reward loyal LPs more than short-term farmers?', 'What metrics would you track on a Dune dashboard to measure the success of this program?'],
                        redFlags: ['Being unaware of the risks of liquidity mining.', 'Proposing a plan with an unsustainably high inflation rate.'],
                        scoringRubric: { 1: 'Cannot explain liquidity mining.', 3: 'Describes the basic concept but fails to identify the major risks like inflation and mercenary capital.', 5: 'Provides a clear plan and thoughtfully discusses the risks and potential mitigation strategies (like vesting).'},
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'PM-A-02',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'You are designing a new NFT marketplace. What is your strategy regarding creator royalties?',
                        idealAnswer: {
                            coreIdea: 'NFT royalty enforcement is a contentious issue. A successful strategy requires a clear stance and mechanisms that align incentives for creators and traders, as royalties are generally not enforceable on-chain.',
                            keyPoints: [
                                '**Stance:** Acknowledge that royalties are largely voluntary. The strategy should be to strongly incentivize paying them.',
                                '**Product Features:**',
                                '1. **Clear UI:** Prominently display the creator\'s set royalty percentage. Make paying it the default, easy option. Show collectors if they have a history of honoring royalties.',
                                '2. **Creator Tools:** Offer tools for creators to enforce royalties via a smart contract blocklist/allowlist (e.g., OpenSea\'s Operator Filter Registry), but be transparent about the centralization tradeoffs.',
                                '3. **Incentives:** Create a system that provides benefits to collectors who pay royalties, such as access to future airdrops, exclusive content from the creator, or a special badge on their profile.',
                                '**Go-to-Market:** Build a brand as a creator-friendly marketplace to attract top artists, which in turn attracts collectors.'
                            ]
                        },
                        commonPitfalls: ['Assuming royalties can be forced at the smart contract level for all sales.', 'Ignoring the needs and motivations of traders who seek low fees.'],
                        whyThisMatters: ['The royalty debate is a core issue in the NFT space. A PM must have a nuanced understanding of the technical, economic, and cultural factors at play.'],
                        followUps: ['What are the pros and cons of using an on-chain enforcement mechanism?', 'How do you compete with zero-royalty marketplaces like Blur?'],
                        redFlags: ['Being unaware of the royalty debate.', 'Believing EIP-2981 enforces royalty payments.'],
                        scoringRubric: { 1: 'Is unaware that royalty enforcement is an issue.', 3: 'Understands the debate but doesn\'t have a clear product strategy.', 5: 'Clearly articulates a multi-pronged strategy that considers UI, creator tools, and incentives.' }
                    }
                ],
                Expert: [
                    {
                        id: 'PM-E-01',
                        difficulty: 'Expert',
                        category: 'Strategy',
                        question: 'You are the PM for a new Layer 2 network. What is your go-to-market strategy to attract both developers and users to your ecosystem, competing against established L2s like Arbitrum and Optimism?',
                        idealAnswer: {
                            coreIdea: 'A successful GTM strategy requires a multi-pronged approach focusing on a unique value proposition, developer experience (DevEx), and bootstrapping a core community. Competing on fees alone is not enough.',
                            keyPoints: [
                                '**Phase 1: Differentiate & Build for Developers**',
                                '1. **Technical Niche:** Define a clear technical advantage. Are we the fastest for a specific use case (e.g., gaming)? The cheapest for DeFi transactions? The most EVM-compatible ZK-rollup?',
                                '2. **Superior DevEx:** Provide best-in-class documentation, SDKs, and tutorials. Make it incredibly easy for developers to migrate their dApps.',
                                '3. **Grant Program:** Launch a well-funded grant program to pay high-quality developer teams to build foundational protocols (a native DEX, lending protocol, etc.) on your network. A network is useless without dApps.',
                                '**Phase 2: Bootstrap Users & Liquidity**',
                                '1. **Airdrop:** Design a targeted airdrop to active users of other L2s and dApps to incentivize them to bridge assets and try your network.',
                                '2. **Liquidity Mining:** Launch a token incentive program (as discussed in PM-A-01) for the foundational DeFi protocols to attract capital and create a functional on-chain economy.',
                                '3. **Narrative & Community:** Build a strong narrative around your niche (e.g., "The Home for On-Chain Gaming"). Foster an active, helpful community on Discord and Twitter to support new users and developers.',
                            ]
                        },
                        commonPitfalls: ['Focusing only on users and not developers.', 'Suggesting a purely marketing-based approach without considering the need for a technical edge.', 'Underestimating the network effects of established L2s.'],
                        whyThisMatters: ['This is a CEO-level question that tests strategic thinking about building a multi-sided platform.', 'It requires understanding the entire Web3 ecosystem and the flywheels of growth.'],
                        followUps: ['How would you measure the success of your grant program?', 'How would you design the airdrop to avoid Sybil attacks (one person using many wallets)?'],
                        redFlags: ['Having no clear plan to attract developers first.', 'Believing that a small technical improvement is enough to win without a strong go-to-market plan.'],
                        scoringRubric: { 1: 'Suggests simple marketing like "run some ads".', 3: 'Identifies the need to attract both users and devs but provides a generic plan.', 5: 'Provides a sophisticated, phased strategy that addresses the cold-start problem by focusing on a niche, developer experience, and targeted incentives.'},
                        expectedTime: '240 seconds'
                    },
                    {
                        id: 'PM-E-02',
                        difficulty: 'Expert',
                        category: 'Risk',
                        question: 'Describe the "Lindy Effect" and how it applies to evaluating the risk of a DeFi protocol.',
                        idealAnswer: {
                            coreIdea: 'The Lindy Effect is a theory that the future life expectancy of a non-perishable thing like a technology is proportional to its current age. For DeFi, it means that the longer a protocol has been live and operating without a critical bug, the more likely it is to be secure and continue to exist in the future.',
                            keyPoints: [
                                'A protocol that has been live for 3+ years (e.g., Uniswap, Aave) has been battle-tested against countless potential attackers and market conditions. Its continued existence is a strong signal of its robustness.',
                                'A new protocol, even with multiple audits, is inherently riskier because its code and economic model have not yet been proven "in the wild".',
                                'As a PM, this means you should be more cautious when integrating with or building on top of new, unproven protocols. You should weight the "Lindy" factor heavily in your risk assessment.',
                                'It is a heuristic for trust in a trust-minimized environment. The longer something has survived, the more implicit trust it has earned.'
                            ],
                        },
                        commonPitfalls: ['Not knowing the term.', 'Dismissing it as irrelevant compared to audits.'],
                        whyThisMatters: ['It is a key mental model used by experienced participants to assess risk in a rapidly changing ecosystem.', 'It shows a deep, nuanced understanding of how trust is built over time in Web3.'],
                        followUps: ['Can you name a protocol that failed despite having audits, proving the Lindy Effect?', 'How does this concept conflict with the need for innovation?'],
                        redFlags: ['Having no framework for assessing protocol risk beyond a simple audit checkmark.'],
                        scoringRubric: { 1: 'Has not heard of the Lindy Effect.', 3: 'Understands the general concept of "older is better" but can\'t articulate it as the Lindy Effect.', 5: 'Clearly explains the Lindy Effect and applies it directly to the risk assessment of DeFi protocols.' },
                        expectedTime: '120 seconds'
                    }
                ]
            }
        },
        {
            id: 'community-manager',
            role: 'Community Lead / Community Manager',
            snapshot: 'The heart and soul of a Web3 project. Manages Discord, fosters culture, and serves as the bridge between users and the core team.',
            coreCompetencies: ['Communication', 'Empathy', 'Crisis Management', 'Content Creation', 'Deep Project Knowledge', 'Moderation'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'on-chain-data-analyst',
            role: 'On-chain Data Analyst',
            snapshot: 'The on-chain detective. Uses tools like Dune Analytics to query, analyze, and visualize blockchain data to drive strategy.',
            coreCompetencies: ['SQL Mastery', 'Data Visualization', 'Blockchain Data Structures', 'Statistical Analysis', 'Dune/Nansen Proficiency'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'defi-protocol-engineer',
            role: 'DeFi Protocol Engineer',
            snapshot: 'A specialized smart contract developer with deep knowledge of financial primitives and economic security. Builds complex DeFi systems.',
            coreCompetencies: ['Advanced Solidity', 'Financial Primitives (AMMs, Lending)', 'Economic Security', 'Gas Optimization', 'Formal Verification'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'l2-rollups-engineer',
            role: 'L2 / Rollups Engineer',
            snapshot: 'Works on the scaling infrastructure for blockchains. Implements and optimizes rollup technology, sequencers, and bridges.',
            coreCompetencies: ['Distributed Systems', 'Cryptography', 'Go/Rust', 'EVM Deep Knowledge', 'Protocol Design'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'zero-knowledge-engineer',
            role: 'Zero-Knowledge Engineer',
            snapshot: 'Works at the cutting edge of cryptography, building privacy and scaling solutions using ZK-SNARKs and ZK-STARKs.',
            coreCompetencies: ['Advanced Cryptography', 'Circom/Cairo', 'Rust/C++', 'Mathematical Proficiency', 'ZKP Theory'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'token-economist',
            role: 'Token Economist / Tokenomics Designer',
            snapshot: 'Architects the economic and incentive systems of a protocol. A blend of economist, game theorist, and strategist.',
            coreCompetencies: ['Economics', 'Game Theory', 'Mechanism Design', 'Financial Modeling', 'Behavioral Psychology'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'backend-web3-engineer',
            role: 'Backend Web3 Engineer',
            snapshot: 'Builds and maintains the off-chain infrastructure that supports dApps, such as indexers, APIs, and relayers.',
            coreCompetencies: ['Node.js/Go/Rust', 'Databases (SQL/NoSQL)', 'API Design', 'Infrastructure (Docker, K8s)', 'Ethers.js/Viem'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'cryptography-engineer',
            role: 'Cryptography Engineer',
            snapshot: 'A highly specialized role focused on designing and implementing the cryptographic protocols that secure a blockchain.',
            coreCompetencies: ['Applied Cryptography', 'Mathematical Proofs', 'Protocol Security', 'Low-level Programming (C++/Rust)'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'dao-operations',
            role: 'DAO Operations / Governance',
            snapshot: 'Manages the day-to-day functioning of a DAO. Facilitates governance, manages projects, and ensures smooth operation.',
            coreCompetencies: ['Project Management', 'Communication', 'Governance Processes', 'Treasury Management', 'Community Facilitation'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'security-devsecops',
            role: 'Security / DevSecOps for Web3',
            snapshot: 'Secures the full stack of a Web3 company, from the smart contracts to the cloud infrastructure and frontend.',
            coreCompetencies: ['Smart Contract Auditing', 'Infrastructure Security', 'CI/CD Pipelines', 'Incident Response', 'Threat Modeling'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'nft-gamefi-pm',
            role: 'NFT / GameFi Product Manager',
            snapshot: 'A specialized PM focused on the unique challenges of NFT collections and blockchain-based games.',
            coreCompetencies: ['Game Design', 'Virtual Economies', 'Community Building', 'NFT Standards', 'Live-ops Management'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'legal-compliance',
            role: 'Legal / Compliance Associate, Web3',
            snapshot: 'Navigates the complex and evolving regulatory landscape of crypto. Advises on securities law, AML, and corporate structuring.',
            coreCompetencies: ['Securities Law (Howey Test)', 'AML/KYC Regulations', 'DAO Legal Wrappers', 'IP Law for NFTs', 'Privacy Law'],
            questions: {
                Foundation: [],
                Intermediate: [],
                Advanced: [],
                Expert: []
            }
        }
    ],
    appendixA: [
        {
            question: "Describe a time you disagreed with a team decision. What did you do?",
            pattern: "Look for the STAR method (Situation, Task, Action, Result). Ideal answers show constructive, data-driven disagreement and an ability to 'disagree and commit' if the final decision goes another way."
        },
        {
            question: "Walk me through the most complex project you've worked on.",
            pattern: "Assesses communication and ability to simplify complexity. They should be able to explain the project's goal, their specific role, the challenges, and the outcome clearly."
        },
        {
            question: "How do you stay up-to-date with the rapid changes in the Web3 space?",
            pattern: "Look for specific sources (e.g., Twitter lists, newsletters like Week in Ethereum News, podcasts like Bankless, research forums like ethresear.ch). Shows genuine passion and initiative."
        },
        {
            question: "Tell me about a time you had to learn a new technology quickly.",
            pattern: "Crucial for Web3. Ideal answers describe a structured process: starting with docs, building a small project, seeking feedback, and iterating. It demonstrates their learning methodology."
        },
        {
            question: "What is a Web3 project you admire, and what would you improve about it?",
            pattern: "Tests critical thinking and product sense. The admiration part shows what they value. The improvement part shows they can think critically and are not just a 'fan'."
        }
    ],
    appendixB: {
        description: "This rubric provides a general framework for scoring answers. Calibrate with your interview team to ensure consistency. The goal is not just to find correct answers, but to understand the candidate's thought process, depth of knowledge, and communication skills.",
        guide: [
            { score: 1, meaning: "Incorrect or Vague: The candidate provides a factually incorrect, dangerously incomplete, or nonsensical answer. They show a fundamental misunderstanding of the core concept." },
            { score: 2, meaning: "Partially Correct: The candidate has some pieces right but misses key details or has significant misconceptions. The answer is not sufficient for a production environment." },
            { score: 3, meaning: "Mostly Correct: The candidate understands the concept and can provide a mostly correct definition but struggles with nuance, trade-offs, or practical application. This is often a baseline for junior roles." },
            { score: 4, meaning: "Correct and Nuanced: The candidate provides a correct and precise answer, can articulate the 'why' behind it, and can discuss some of the trade-offs or related concepts. They can connect theory to practice." },
            { score: 5, meaning: "Expert / Teacher: The candidate not only gives a correct and nuanced answer but can also explain it with exceptional clarity using analogies or examples. They can discuss related edge cases, historical context, and future directions. They could teach the concept to others." }
        ]
    },
    disclaimer: "This question bank is for educational purposes only and is not a substitute for a comprehensive, real-world interview process. It is not legal or financial advice. All code snippets are examples and should not be used in production without extensive testing and auditing."
};
