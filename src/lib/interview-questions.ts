
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

export const interviewData: {
    roles: Role[];
    appendixA: { question: string; pattern: string; }[];
    appendixB: { description: string; guide: { score: number; meaning: string; }[]; };
    disclaimer: string;
} = {
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
                                'Fungible (ERC-20): Each token is identical and interchangeable, like a dollar bill. One unit of an ERC-20 token is the same as any other unit. Used for cryptocurrencies, governance tokens, etc.',
                                'Non-Fungible (ERC-721): Each token is unique and has a distinct ID. They are not interchangeable. Used for digital collectibles, art, game items, and deeds.',
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
                                '1. Checks: First, perform all validation (e.g., `require(balance > 0)`).',
                                '2. Effects: Second, update the contract\'s internal state (e.g., `balances[msg.sender] = 0`). This is the critical step.',
                                '3. Interactions: Last, call any external contracts or send Ether.',
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
                                'It separates state from logic. A proxy contract holds the state (e.g., user balances) and has a persistent address. A logic (or implementation) contract contains the business logic.',
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
                                'Problem with Push: A simple `for` loop calling `transfer` on 10,000 addresses would exceed the block gas limit and fail. It\'s also incredibly expensive.',
                                'Merkle Tree Solution (Pull Pattern):',
                                '1. Off-chain: Generate a list of all recipient addresses and amounts. Construct a Merkle tree from this data.',
                                '2. On-chain: Store only the `merkleRoot` (a single 32-byte hash) in the airdrop contract. This is extremely gas-efficient.',
                                '3. Claiming: To claim, a user submits their address, amount, and a `merkleProof` to the contract\'s `claim` function.',
                                '4. Verification: The contract uses the provided proof to recalculate the Merkle root. If it matches the stored `merkleRoot`, the claim is valid, and the contract transfers the tokens. The contract also tracks who has already claimed to prevent replays.'
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
                                '`tx.origin` vs. `msg.sender`: `msg.sender` is the immediate caller of a function. In a simple call from an EOA, `tx.origin` and `msg.sender` are the same. However, in a chain of calls (EOA -> Contract A -> Contract B), for Contract B, `msg.sender` is Contract A\'s address, but `tx.origin` is still the EOA\'s address.',
                                'Vulnerability Scenario (Phishing):',
                                '1. A victim\'s wallet contract (`VictimWallet`) has an `owner` and a `transfer` function that uses `require(tx.origin == owner)` for authentication.',
                                '2. An attacker deploys a malicious contract (`AttackContract`) with a function that calls `VictimWallet.transfer(...)`.',
                                '3. The attacker tricks the victim (the owner) into calling a seemingly harmless function on `AttackContract` (e.g., to claim a free NFT).',
                                '4. When the victim calls `AttackContract`, `tx.origin` is the victim\'s address. The `AttackContract` then calls `VictimWallet.transfer(...)`.',
                                '5. The check `require(tx.origin == owner)` inside `VictimWallet` passes, because the original transaction initiator was the owner. The contract then transfers its funds to the attacker.',
                                'Best Practice: Never use `tx.origin` for authorization. Always use `msg.sender`.'
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
                                'A Sandwich Attack unfolds as follows:',
                                '1. A searcher sees a large user buy order for Token A on a DEX in the mempool.',
                                '2. The searcher front-runs the user by placing their own buy order for Token A with a higher gas fee, ensuring it executes first. This slightly increases the price.',
                                '3. The user\'s original buy order executes at a slightly worse price (higher slippage) than they expected.',
                                '4. The searcher then back-runs the user by immediately selling their Token A, capitalizing on the price increase they caused. The user\'s trade is "sandwiched".',
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
                        question: 'What is "slither" and what kind of issues can it find?',
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
                        question: 'What is a signature replay attack and how can it be prevented?',
                        idealAnswer: {
                            coreIdea: 'A signature replay attack occurs when an attacker intercepts a valid, signed message and "replays" it in a different context or at a later time to trigger an unauthorized action. It is prevented using nonces and domain separators.',
                            keyPoints: [
                                'Prevention Mechanisms:',
                                '1. Nonce: A per-user, incrementing number. The contract tracks each user\'s nonce. A signed message must include the user\'s current nonce. When the message is processed, the contract checks the nonce and then increments it, ensuring the same signature cannot be used again.',
                                '2. Domain Separator (EIP-712): A unique hash identifying the specific contract and chain. This prevents a signature created for one dApp from being replayed on a different, malicious one.',
                                '3. Deadline/Expiry: Including a timestamp or block number after which the signature is no longer valid.'
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
                                'Attack Scenario:',
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
                                'You define an invariant or property that should always be true (e.g., "the total supply of the token should never decrease" or "no user can withdraw more than they deposited").',
                                'The fuzzer then calls your functions with random data for thousands or millions of iterations, trying to find a sequence of calls that breaks the invariant.',
                                'Popular tools for this are Echidna (from Trail of Bits) and the built-in fuzzing capabilities of Foundry.'
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
                                'Report Structure:',
                                '1. Title & Severity: Give the finding a clear name and a CVSS-based severity score (e.g., Critical, High, Medium).',
                                '2. Executive Summary: A one-paragraph explanation of the vulnerability and its potential impact, written for a semi-technical audience.',
                                '3. Technical Details: A precise explanation of the bug, including the specific contracts and lines of code involved.',
                                '4. Proof of Concept: A coded test case (using Foundry or Hardhat) that demonstrates how to exploit the vulnerability. This is the gold standard.',
                                '5. Recommendation: Clear, actionable steps the developers can take to fix the bug.',
                                'Communication Strategy:',
                                '1. Private Disclosure: First, communicate the finding privately to the client\'s lead engineer or security contact, often in a secure channel.',
                                '2. Clarity over Jargon: Explain the business impact clearly. "This bug allows an attacker to steal all user funds" is better than "This leads to an arithmetic overflow in the rewards calculation".',
                                '3. Collaborative Tone: Frame it as a collaborative effort to improve security, not as a judgment of their code. Offer to have a call to walk them through the PoC.',
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
                            ]
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
                                'Causes: The user submitted a transaction with a `maxFeePerGas` that is below the current network base fee, so validators have no incentive to include it.',
                                'UI Solutions:',
                                '1. Detection: Store the transaction hash in `localStorage`. On page load, check the status of any pending transactions using `provider.getTransaction`.',
                                '2. Feedback: Display a clear "Pending Transaction" indicator in the UI.',
                                '3. Actions: Provide "Speed Up" and "Cancel" buttons.',
                                '   - Speed Up: Re-submit the same transaction with the same nonce but a higher gas fee.',
                                '   - Cancel: Submit a new, zero-value transaction to your own address with the same nonce and a higher gas fee. This will invalidate the original transaction.'
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
                        question: 'What is a "dead-man\'s switch" in a smart contract?',
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
                                'The Problem: Finding all NFTs owned by a user would require querying the `Transfer` events of every single NFT contract, which is impossible on the client side.',
                                'Solution Architecture:',
                                '1. Data Source: Use a specialized NFT API provider (like Reservoir, Alchemy NFT API, or SimpleHash). These services index all NFT data across the chain and provide a simple REST or GraphQL API.',
                                '2. API Call: On the frontend, make a single API call to this service, passing in the user\'s address. E.g., `GET /users/{address}/tokens/v6`.',
                                '3. Data Transformation: The API returns a clean JSON object containing an array of all NFTs the user owns, including the contract address, token ID, name, image URL, and attributes.',
                                '4. Rendering: Map over this array in the React component to display the NFTs. Implement pagination or infinite scroll to handle large collections efficiently.',
                                '5. Alternative: If a third-party API is not desirable, you would need to host your own indexer using The Graph protocol, but this is a much heavier lift.'
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
                                'Standard Proxy: A single proxy contract points to a single logic contract.',
                                'Diamond Proxy: A single proxy contract can have multiple facets. When a function is called on the diamond, it looks up which facet is responsible for that function signature and `delegatecall`s to it.',
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
                                'The Problem with `personal_sign`: It just signs a hash of a string. Wallets display this to the user as an opaque hex string, e.g., `0x...`. The user has no way of knowing what they are actually agreeing to.',
                                'How EIP-712 Works:',
                                '1. Structured Data: The dApp defines a data structure with named and typed fields (e.g., `domain`, `message`, `types`).',
                                '2. Readable in Wallet: When `eth_signTypedData_v4` is called, wallets like MetaMask can parse this structure and display it to the user in a human-readable format (e.g., "Sign message: From: 0x123, To: 0x456, Amount: 100").',
                                '3. Domain Separator: It includes a `domain` separator that ties the signature to a specific dApp, preventing a signature from being replayed and used on a different, malicious dApp.',
                                'Why it Matters: It turns signing from a blind action into an informed one, dramatically improving security and user trust. It is the gold standard for off-chain message signing.'
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
                        redFlags: ['Not have heard of Account Abstraction or EIP-4337.', 'Confusing it with simple meta-transactions.'],
                        scoringRubric: { 1: 'Is not aware of EIP-4337.', 3: 'Understands the high-level goal of better wallets but cannot define the specific roles.', 5: 'Clearly defines UserOperation, Bundler, and Paymaster and explains how they work together to enable gas abstraction.' },
                        expectedTime: '150 seconds'
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
                Foundation: [
                    {
                        id: 'CM-F-01',
                        difficulty: 'Foundation',
                        category: 'Strategy',
                        question: 'What do you believe is the primary goal of a community manager in a Web3 project?',
                        idealAnswer: {
                            coreIdea: 'The primary goal is to foster a self-sustaining, positive, and engaged community that feels a sense of ownership, turning passive users into active contributors and advocates.',
                            keyPoints: [
                                'It\'s not just about answering questions or moderating chat. It\'s about cultivating a strong culture.',
                                'Key activities include: welcoming new members, facilitating productive discussions, creating engaging content/events, and acting as the voice of the community to the core team.',
                                'A great community provides a moat for the project that is difficult for competitors to replicate.'
                            ]
                        },
                        commonPitfalls: ['Describing the role as purely social media management or customer support.', 'Focusing only on member count instead of engagement quality.'],
                        whyThisMatters: ['This question reveals if the candidate understands the strategic importance of community in Web3, versus a more traditional marketing view.'],
                        followUps: ['How would you measure the "health" of a community?', 'What are some projects you think have excellent communities, and why?'],
                        redFlags: ['Answers are focused on vanity metrics like "number of Discord members".', 'Does not mention fostering a sense of ownership.'],
                        scoringRubric: { 1: 'Describes a basic social media manager role.', 3: 'Understands the community aspect but focuses on tactical tasks rather than strategic goals.', 5: 'Articulates a clear strategic vision for community as a core asset and driver of project success.' },
                        expectedTime: '90 seconds'
                    },
                    {
                        id: 'CM-F-02',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is a DAO, and how does it relate to a community?',
                        idealAnswer: {
                            coreIdea: 'A DAO (Decentralized Autonomous Organization) is an internet-native organization where control is distributed among its members. The community IS the organization.',
                            keyPoints: [
                                'Unlike a traditional company, a DAO\'s rules are encoded in smart contracts on a blockchain.',
                                'Decisions are made through proposals and voting by members, who typically hold a governance token.',
                                'The community is not just an audience; they are the stakeholders, governors, and often the contributors who run the organization.'
                            ]
                        },
                        commonPitfalls: ['Describing a DAO as just a group chat.', 'Not understanding the role of tokens in governance.'],
                        whyThisMatters: ['Many Web3 communities are DAOs or have DAO-like properties. The CM must understand this structure.'],
                        followUps: ['What are some challenges in DAO governance?', 'How do you encourage participation in governance?'],
                        redFlags: ['Unable to explain decentralization or governance.', 'Thinks a DAO is the same as a Facebook group.'],
                        scoringRubric: { 1: 'Does not know what a DAO is.', 3: 'Explains it is a decentralized group but misses the autonomous/governance aspects.', 5: 'Clearly defines DAO, mentioning smart contracts, governance, and shared ownership.' },
                        expectedTime: '60 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'CM-I-01',
                        difficulty: 'Intermediate',
                        category: 'Practical',
                        question: 'The project\'s Discord server is being overwhelmed with FUD (Fear, Uncertainty, and Doubt) after a market downturn. What are your immediate steps?',
                        idealAnswer: {
                            coreIdea: 'The strategy is to respond with empathy, transparency, and calm leadership, while actively managing the conversation to prevent panic from spiraling.',
                            keyPoints: [
                                '1. Acknowledge & Empathize: Publicly acknowledge the market situation and the community\'s concerns. Show empathy. "We understand it\'s a tough time in the market and many of you are concerned."',
                                '2. Create a Dedicated Channel: Funnel the conversation into a specific channel (e.g., `#market-discussion`) to contain the FUD and not let it dominate all channels.',
                                '3. Be Transparent & Visible: Increase communication from the core team. Provide updates on development progress to show that the team is still building regardless of market price.',
                                '4. Host an AMA: Schedule an impromptu AMA with the founders to address concerns directly and project confidence.',
                                '5. Moderate, Don\'t Censor: Remove clear spam or personal attacks, but allow for legitimate concern and criticism. Overly aggressive censorship will backfire and make the team look like they are hiding something.'
                            ]
                        },
                        commonPitfalls: ['Ignoring the FUD and hoping it goes away.', 'Banning users who express concern.', 'Making price predictions or giving financial advice.'],
                        whyThisMatters: ['Crisis management is a core competency for a Web3 CM.', 'How a project handles downturns is a major test of its community and leadership.'],
                        followUps: ['How do you differentiate between legitimate FUD and a coordinated attack?', 'What is your long-term strategy to build a resilient community that can withstand market volatility?'],
                        redFlags: ['Suggesting to delete all negative messages.', 'Becoming defensive or argumentative with users.'],
                        scoringRubric: { 1: 'Suggests ignoring or censoring the FUD.', 3: 'Offers a reasonable but reactive plan (e.g., answer questions).', 5: 'Provides a proactive, multi-step plan that includes empathy, containment, and transparent communication.' },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'CM-I-02',
                        difficulty: 'Intermediate',
                        category: 'Strategy',
                        question: 'What are three key metrics you would use to track the health of a Discord community?',
                        idealAnswer: {
                            coreIdea: 'Healthy communities are measured by engagement and quality of interaction, not just size. Metrics should reflect this.',
                            keyPoints: [
                                '1. Active Members Ratio (DAU/MAU): What percentage of members are active on a daily or weekly basis? A high ratio indicates a sticky, engaged community, not just a large, dormant one.',
                                '2. Message Quality & Sentiment: Are conversations productive and positive? This is qualitative but can be tracked by looking at the ratio of helpful answers to questions, the complexity of topics discussed, and general sentiment.',
                                '3. Conversion to Contribution: How many community members are moving up the ladder from passive lurker to active contributor (e.g., participating in governance, submitting a bounty, helping others)? This shows the community is a successful funnel for talent.'
                            ]
                        },
                        commonPitfalls: ['Focusing solely on total member count.', 'Not being able to name specific engagement metrics.', 'Failing to mention qualitative aspects.'],
                        whyThisMatters: ['Shows that the candidate thinks about community health in a sophisticated, data-informed way.'],
                        followUps: ['What tools would you use to track these metrics?', 'How would you use these metrics to change your community strategy?'],
                        redFlags: ['Only suggesting "number of members" as a metric.'],
                        scoringRubric: { 1: 'Cannot name any meaningful metrics.', 3: 'Names basic metrics like member count or number of messages.', 5: 'Provides nuanced metrics that focus on engagement quality and user journey, not just vanity numbers.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'CM-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Design a program to identify and empower "super-contributors" within your community to help you scale your efforts.',
                        idealAnswer: {
                            coreIdea: 'A successful program formalizes a path for passionate members to take on more responsibility and be rewarded for it, creating a scalable, decentralized community moderation and growth engine.',
                            keyPoints: [
                                'Program Name: "Protocol Ambassadors" or "Community Champions".',
                                '1. Identification: Systematically track helpful and active members. Look for those who consistently answer questions, provide thoughtful feedback, and embody the project\'s culture.',
                                '2. Formal Roles & Responsibilities: Create tiered roles (e.g., "Chat Helper", "Content Creator", "Language Moderator"). Give them specific responsibilities and the necessary permissions (e.g., Discord roles).',
                                '3. Incentives & Rewards: Reward them for their contributions. This can include a mix of monthly stipends (paid in stablecoins or the native token), exclusive access to the team, special swag, or a unique NFT badge.',
                                '4. Communication: Create a private Discord channel for the ambassadors to coordinate with each other and the core team.',
                            ]
                        },
                        commonPitfalls: ['Relying on volunteers without any rewards, which leads to burnout.', 'Giving too much power to unvetted members too quickly.'],
                        whyThisMatters: ['A single CM cannot scale to manage a community of thousands.', 'This demonstrates the ability to think about building decentralized, scalable systems for community management.'],
                        followUps: ['How would you handle a situation where an ambassador becomes toxic or inactive?', 'What tools would you use to track contributor activity?'],
                        redFlags: ['No clear plan for identifying or rewarding contributors.', 'Thinking that community management doesn\'t need to scale.'],
                        scoringRubric: { 1: 'Has no ideas on how to scale community efforts.', 3: 'Suggests asking for volunteers but has no formal structure or incentive plan.', 5: 'Designs a clear, structured program with roles, responsibilities, and a sustainable incentive model.' },
                        expectedTime: '150 seconds'
                    },
                    {
                        id: 'CM-A-02',
                        difficulty: 'Advanced',
                        category: 'Risk',
                        question: 'A community member has a detailed and well-reasoned governance proposal that the core team strongly disagrees with. How do you handle this situation?',
                        idealAnswer: {
                            coreIdea: 'The CM must act as a neutral facilitator, ensuring the community member is heard and the process is fair, while also clearly communicating the core team\'s perspective without being dismissive.',
                            keyPoints: [
                                '1. Acknowledge and Platform: Do not shut down the conversation. Publicly acknowledge the effort put into the proposal and ensure it gets a fair hearing in the governance forum and on a community call.',
                                '2. Facilitate Debate: Encourage a robust but respectful debate. Ensure both sides are arguing with data and principles, not emotion.',
                                '3. Present the Team\'s View: Work with the core team to write a clear, public response explaining their reasoning for disagreeing. This response should be respectful and address the proposal\'s points directly.',
                                '4. Trust the Process: Ultimately, the CM\'s role is to uphold the governance process. If the proposal goes to a vote, the CM ensures the vote is conducted fairly, regardless of the team\'s preference. The community\'s decision is final.'
                            ]
                        },
                        commonPitfalls: ['Ignoring the proposal.', 'Using the team\'s influence to shut down the discussion.', 'Taking sides emotionally.'],
                        whyThisMatters: ['This is a major test of a CM\'s ability to navigate the tension between the core team and the decentralized community.', 'It shows whether they are a "company shill" or a true community advocate and a neutral facilitator.'],
                        followUps: ['What if the proposal is malicious but cleverly disguised?', 'What happens if the community votes against the team\'s wishes? How do you manage the aftermath?'],
                        redFlags: ['Suggesting to simply ignore or ban the user.', 'Showing an inability to remain neutral.'],
                        scoringRubric: { 1: 'Suggests censoring the member.', 3: 'Allows the discussion but doesn\'t have a clear plan for managing the conflict.', 5: 'Provides a clear framework for facilitating a difficult conversation, respecting the community member, and upholding the integrity of the governance process.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'CM-E-01',
                        difficulty: 'Expert',
                        category: 'Strategy',
                        question: 'How does the role of a Community Manager change pre-product-market-fit versus post-product-market-fit?',
                        idealAnswer: {
                            coreIdea: 'The role evolves from cultivating a small group of true believers into managing a large, diverse digital nation-state, with a greater focus on scalable systems and governance.',
                            keyPoints: [
                                'Pre-Product-Market Fit (Cultivating the Spark):',
                                '- The focus is on quality over quantity. The goal is to build a tight-knit community of early adopters who can provide high-quality feedback.',
                                '- The CM is deeply involved in product feedback, acting as an extension of the product team.',
                                '- The vibe is more like a private club or research group.',
                                'Post-Product-Market Fit (Managing the Nation):',
                                '- The focus is on scalability. The CM builds systems (like the ambassador program) to handle growth.',
                                '- The role shifts more towards facilitating governance, helping the now large and diverse community make complex decisions.',
                                '- The CM becomes a public figurehead, representing the DAO and its culture to the wider world.',
                                '- The primary challenge becomes maintaining the core culture as thousands of new, less-informed users join.'
                            ]
                        },
                        commonPitfalls: ['Believing the role stays the same at all stages.', 'Not understanding the shift from product feedback to governance facilitation.'],
                        whyThisMatters: ['This is a senior-level question that tests strategic understanding of a project\'s entire lifecycle.', 'It separates candidates who are tactical operators from those who are strategic leaders.'],
                        followUps: ['What are the biggest risks when a community scales too quickly?', 'How do you transition a community from being led by the core team to being truly community-led?'],
                        redFlags: ['Unable to articulate any difference in the role based on project maturity.'],
                        scoringRubric: { 1: 'Thinks the job is the same regardless of scale.', 3: 'Understands that the community gets bigger but can\'t articulate how the CM\'s strategic focus must change.', 5: 'Clearly explains the evolution from a product-focused cultivator to a governance-focused facilitator and system-builder.' },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'CM-E-02',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'Design a framework for managing a DAO\'s treasury to fund community initiatives. How would you structure the process from idea to execution?',
                        idealAnswer: {
                            coreIdea: 'A robust grants framework should be structured, transparent, and empower the community to make funding decisions, while protecting the treasury from frivolous spending.',
                            keyPoints: [
                                '1. Grants Committee: Establish a grants committee, elected by the DAO, to do the initial review and vetting of proposals. This prevents full token-holder votes on every small idea.',
                                '2. Proposal Lifecycle: Define a clear lifecycle: `Draft` -> `Discussion` -> `Committee Review` -> `Temperature Check (Snapshot)` -> `On-Chain Vote`.',
                                '3. Budgeting: Propose a quarterly budget for the grants program that is approved by the DAO. This allocates a specific amount of the treasury for community initiatives.',
                                '4. Milestone-Based Payments: For larger grants, structure payments based on the successful delivery of milestones. This reduces risk. The committee would be responsible for verifying milestone completion before releasing the next tranche of funds.',
                                '5. Transparency & Reporting: All funded projects must provide regular public updates. The grants committee provides a quarterly report to the DAO on how funds were spent and the ROI of the initiatives.'
                            ]
                        },
                        commonPitfalls: ['Proposing that every small grant goes to a full DAO vote.', 'Having no process for vetting proposals.', 'Not including any accountability or reporting for funded projects.'],
                        whyThisMatters: ['Treasury management and capital allocation are the most important functions of a DAO.', 'This question tests the ability to design robust, decentralized governance processes.'],
                        followUps: ['How do you prevent the grants committee from becoming a centralized point of failure?', 'What tools would you use to manage this process?'],
                        redFlags: ['Suggesting a process with no accountability or oversight.', 'Failing to consider the operational burden of voting on every small grant.'],
                        scoringRubric: { 1: 'Suggests a chaotic, unstructured process.', 3: 'Proposes a basic grant program but misses key elements like a committee or milestone payments.', 5: 'Designs a sophisticated, multi-stage governance framework that balances decentralization with efficiency and accountability.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'on-chain-data-analyst',
            role: 'On-chain Data Analyst',
            snapshot: 'The on-chain detective. Uses tools like Dune Analytics to query, analyze, and visualize blockchain data to drive strategy.',
            coreCompetencies: ['SQL Mastery', 'Data Visualization', 'Blockchain Data Structures', 'Statistical Analysis', 'Dune/Nansen Proficiency'],
            questions: {
                Foundation: [
                    {
                        id: 'DA-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the difference between an Externally Owned Account (EOA) and a Contract Account?',
                        idealAnswer: {
                            coreIdea: 'EOAs are controlled by users with private keys, while Contract Accounts are controlled by their code.',
                            keyPoints: [
                                'An EOA is what people typically call a "wallet" (like MetaMask). It has a private key that can sign transactions to initiate actions.',
                                'A Contract Account is a smart contract deployed on the blockchain. It does not have a private key and can only execute code when it is called by an EOA or another contract.',
                                'In a transaction table, you can often distinguish them because an EOA will appear in the `from` field, but a contract address might appear in the `to` field when it is being interacted with.'
                            ]
                        },
                        commonPitfalls: ['Thinking contracts can start transactions on their own.'],
                        whyThisMatters: ['This is the most fundamental distinction in Ethereum account types and is crucial for understanding transaction data.'],
                        followUps: ['How can you identify if an address is a contract or an EOA using data?', 'What is account abstraction (EIP-4337)?'],
                        redFlags: ['Not knowing the difference.', 'Confusing the roles of each account type.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands one is a user and one is a contract but can\'t explain the technical difference.', 5: 'Clearly explains the role of private keys and transaction initiation.' },
                        expectedTime: '60 seconds'
                    },
                    {
                        id: 'DA-F-02',
                        difficulty: 'Foundation',
                        category: 'Practical',
                        question: 'What are the core tables you would query in Dune Analytics to analyze ERC-721 (NFT) transfer activity?',
                        idealAnswer: {
                            coreIdea: 'You would primarily use the `erc721.evt_Transfer` table, and potentially join it with `prices.usd` to get USD values.',
                            keyPoints: [
                                '`erc721.evt_Transfer`: This table contains a row for every ERC-721 `Transfer` event emitted on the blockchain.',
                                'Key columns include: `contract_address`, `from`, `to`, `tokenId`, and `evt_block_time`.',
                                'To analyze sales, you would often need to join this with a marketplace-specific table, like `opensea.trades`, to get the sale price.',
                                '`prices.usd`: This table can be used to convert any crypto price (like ETH) to USD at the time of the transaction.'
                            ]
                        },
                        commonPitfalls: ['Looking for a single "nft_sales" table that doesn\'t exist in the raw data.', 'Not understanding that transfers are events.'],
                        whyThisMatters: ['Shows a practical understanding of how on-chain data is structured in major analytics platforms.'],
                        followUps: ['How would you differentiate a sale from a simple wallet-to-wallet transfer?'],
                        redFlags: ['Does not know that on-chain activity is analyzed by looking at events.'],
                        scoringRubric: { 1: 'Does not know where to start.', 3: 'Knows to look for "transfers" but is unsure of the specific tables or structure.', 5: 'Correctly identifies `erc721.evt_Transfer` and can describe its key columns and how to use them.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'DA-I-01',
                        difficulty: 'Intermediate',
                        category: 'Practical',
                        question: 'You want to calculate the Daily Active Users (DAU) for Uniswap. How would you write a SQL query in Dune to do this?',
                        idealAnswer: {
                            coreIdea: 'You need to query the `uniswap.transactions` table, count the distinct number of `from` addresses, and group them by day.',
                            keyPoints: [
                                'Use `COUNT(DISTINCT "from")` to count unique wallets.',
                                'Cast the `block_time` to a date using `DATE_TRUNC(\'day\', block_time)`.',
                                'Group by this truncated date.',
                                'Order the results by date to see the trend.'
                            ],
                            example: `SELECT 
    date_trunc('day', block_time) AS day,
    count(distinct "from") AS dau
FROM
    uniswap_v3."transactions"
GROUP BY
    1
ORDER BY
    1 DESC
LIMIT 100;`
                        },
                        commonPitfalls: ['Counting all transactions instead of distinct users (`COUNT(*)` vs `COUNT(DISTINCT ...)`).', 'Forgetting to truncate the timestamp to group by day.'],
                        whyThisMatters: ['DAU is one of the most basic and important metrics for any protocol. This is a fundamental query for any on-chain analyst.'],
                        followUps: ['How would you modify this to calculate Monthly Active Users (MAU)?', 'This query includes bots. How might you try to filter for "real" users?'],
                        redFlags: ['Unable to write a basic SELECT/GROUP BY query.', 'Not knowing to use `DISTINCT`.'],
                        scoringRubric: { 1: 'Cannot write the query.', 3: 'Writes a query that is syntactically close but logically flawed (e.g., misses `DISTINCT`).', 5: 'Writes a correct and clean query and can explain each part.' },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'DA-I-02',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is a "sybil attack" in the context of airdrops, and how can on-chain data be used to detect it?',
                        idealAnswer: {
                            coreIdea: 'A sybil attack is when a single entity creates a large number of fake wallets to farm an airdrop multiple times. On-chain data can be used to find patterns that suggest these wallets are all controlled by the same person.',
                            keyPoints: [
                                'The goal of the attacker is to get a disproportionate share of the token allocation.',
                                'Detection techniques using on-chain data:',
                                '- Funding Source: All the wallets were funded from the same central wallet around the same time.',
                                '- Activity Patterns: All wallets perform the exact same sequence of actions to qualify for the airdrop.',
                                '- Withdrawal Pattern: After the airdrop, all wallets send their tokens to the same central deposit address (e.g., on an exchange).',
                                '- Graph Analysis: Using graph analysis to visualize the flow of funds can make these clustered relationships obvious.'
                            ]
                        },
                        commonPitfalls: ['Thinking it\'s impossible to detect.', 'Only focusing on the funding source.'],
                        whyThisMatters: ['Airdrop farming and sybil attacks are a major problem for projects.', 'This demonstrates the candidate\'s ability to think like a detective and use data to uncover non-obvious behavior.'],
                        followUps: ['What are some ways a sophisticated sybil attacker might try to hide their tracks?', 'If you identify a cluster of sybil wallets, what would you recommend the project do?'],
                        redFlags: ['Being unaware of sybil attacks.', 'Having no ideas on how to detect them using data.'],
                        scoringRubric: { 1: 'Is unaware of the concept.', 3: 'Can define a sybil attack but has limited ideas on detection.', 5: 'Clearly defines the attack and provides multiple, concrete data-driven methods for identifying sybil clusters.' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'DA-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'What is Total Value Locked (TVL) and how is it a potentially misleading metric?',
                        idealAnswer: {
                            coreIdea: 'TVL measures the total value of assets deposited in a DeFi protocol, but it can be easily manipulated and does not reflect actual usage or revenue.',
                            keyPoints: [
                                'What it is: TVL represents the collateral locked in DeFi protocols. It\'s a measure of the capital base.',
                                'Why it\'s misleading:',
                                '1. Double Counting: A single dollar can be counted multiple times as it moves through "money lego" protocols. (e.g., Deposit ETH in Lido to get stETH, deposit stETH in Aave, borrow USDC, deposit USDC in Curve). The same initial capital is counted at each step.',
                                '2. Mercenary Capital: High token incentives can attract large amounts of "mercenary" TVL that provides no real value and leaves as soon as the incentives dry up.',
                                '3. Doesn\'t equal Usage: A protocol can have high TVL but very few users or transactions.',
                                'Better metrics to look at in conjunction with TVL are protocol revenue, daily active users, and the TVL-to-market cap ratio.'
                            ]
                        },
                        commonPitfalls: ['Taking TVL at face value as the most important metric.', 'Not understanding how assets can be rehypothecated and double-counted.'],
                        whyThisMatters: ['Demonstrates a sophisticated understanding of DeFi metrics and the ability to think critically about data, not just report it.'],
                        followUps: ['Which protocols do you think have a "healthier" TVL than others, and why?', 'How would you calculate protocol revenue?'],
                        redFlags: ['Believing TVL is the ultimate measure of a protocol\'s success.', 'Unable to explain why it can be a vanity metric.'],
                        scoringRubric: { 1: 'Does not know what TVL is.', 3: 'Can define TVL but thinks it is the most important metric.', 5: 'Clearly defines TVL and articulates multiple reasons why it is a flawed or incomplete metric.' },
                        expectedTime: '150 seconds'
                    },
                    {
                        id: 'DA-A-02',
                        difficulty: 'Advanced',
                        category: 'Knowledge',
                        question: 'Explain what a "trace" is in blockchain data and how it differs from a simple transaction.',
                        idealAnswer: {
                            coreIdea: 'A trace provides a detailed, step-by-step execution path of a transaction, including all internal calls between contracts. A simple transaction record only shows the top-level `from` and `to` addresses.',
                            keyPoints: [
                                'A single transaction can trigger a cascade of internal calls. For example, a user calls a yield aggregator contract, which then calls a Uniswap contract, which then calls a token contract.',
                                'The standard transaction receipt only shows the user calling the aggregator.',
                                'Traces (or internal transactions) expose this entire call stack, showing every contract interaction and value transfer that happened "inside" the top-level transaction.',
                                'Analyzing traces is essential for understanding complex DeFi interactions, MEV, or debugging contract logic.'
                            ]
                        },
                        commonPitfalls: ['Confusing traces with event logs.', 'Not understanding the concept of internal calls.'],
                        whyThisMatters: ['This is an advanced data concept. The ability to work with traces separates junior from senior on-chain analysts.'],
                        followUps: ['What kind of analysis would require traces instead of just event logs?', 'What tools or nodes are required to get access to full trace data? (e.g., Erigon, Parity-Tracer)'],
                        redFlags: ['Does not know what a trace or internal transaction is.'],
                        scoringRubric: { 1: 'Is unaware of traces.', 3: 'Understands it shows "more detail" but cannot articulate the concept of internal calls.', 5: 'Clearly explains the difference between a transaction and a trace and provides a concrete example of a complex DeFi interaction.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'DA-E-01',
                        difficulty: 'Expert',
                        category: 'Practical',
                        question: 'How do you decode the `data` field of a transaction to identify the function that was called and its parameters?',
                        idealAnswer: {
                            coreIdea: 'The `data` field contains the function selector and the ABI-encoded arguments. You need the contract\'s ABI to decode it.',
                            keyPoints: [
                                'The first 4 bytes (8 hex characters) of the `data` field are the function selector. This is derived from the first 4 bytes of the Keccak-256 hash of the function\'s signature (e.g., `transfer(address,uint256)`).',
                                'The rest of the `data` field contains the function arguments, which are ABI-encoded. This means they are serialized into 32-byte words.',
                                'To decode it, you need the contract\'s ABI (Application Binary Interface), which is a JSON file describing the contract\'s functions.',
                                'In a tool like Dune, you can use built-in functions like `erc20.parse_token_transfer` or manually match the function selector from a table of known function hashes (`ethereum.signatures`). For complex, custom functions, you might need to use off-chain tools like Python with Web3.py.'
                            ]
                        },
                        commonPitfalls: ['Not knowing the `data` field is structured.', 'Thinking you can read the arguments without the ABI.'],
                        whyThisMatters: ['This is a core skill for advanced on-chain analysis, allowing the analyst to go beyond pre-decoded tables and analyze any contract interaction.'],
                        followUps: ['What is the difference between an indexed and non-indexed event topic?', 'How would you find all transactions that called a specific function on a contract?'],
                        redFlags: ['Has no idea what the transaction `data` field contains.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands that it contains the function and arguments but cannot explain how to decode it.', 5: 'Clearly explains the function selector, ABI encoding, and the process of decoding using an ABI.' },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'DA-E-02',
                        difficulty: 'Expert',
                        category: 'Strategy',
                        question: 'A protocol wants to measure "user stickiness" or retention. Design a cohort analysis to show this. What would be your x-axis, y-axis, and key insight?',
                        idealAnswer: {
                            coreIdea: 'A cohort analysis groups users by when they first interacted with the protocol and then tracks their activity over subsequent weeks or months. This is the best way to measure true retention.',
                            keyPoints: [
                                'Query Design:',
                                '1. First, create a CTE (Common Table Expression) to find the first transaction date for every user (`MIN(block_time)` grouped by `from`). This defines their cohort (e.g., "January 2024 Cohort").',
                                '2. Join this back to the main transaction table.',
                                '3. Calculate the time difference between each subsequent transaction and their first transaction date to determine activity in Week 1, Week 2, etc.',
                                '4. Pivot the data to create the cohort chart.',
                                'Chart:',
                                '- X-axis: Time since first interaction (Week 0, Week 1, Week 2...).',
                                '- Y-axis: Retention Rate % ( (Active users in Week N from cohort) / (Total users in cohort) ).',
                                '- Series: Each line on the chart would represent a different cohort (e.g., Jan, Feb, Mar).',
                                'Key Insight: We can see if product changes are improving retention over time. For example, if the March cohort has a higher Week 4 retention than the January cohort, it suggests recent changes are making the product stickier.'
                            ]
                        },
                        commonPitfalls: ['Proposing a simple DAU chart, which doesn\'t show retention.', 'Struggling with the SQL logic needed for cohorting.'],
                        whyThisMatters: ['This is a standard but powerful analysis from Web2 that is highly applicable to Web3. It shows the candidate can go beyond simple vanity metrics to measure what really matters: whether users are sticking around.'],
                        followUps: ['What defines an "active" user for this protocol?', 'How might a large airdrop skew the results of this analysis?'],
                        redFlags: ['Does not know what a cohort analysis is.', 'Cannot explain how to group users by their join date.'],
                        scoringRubric: { 1: 'Cannot explain cohort analysis.', 3: 'Understands the concept but struggles to articulate how to implement it in SQL.', 5: 'Clearly and correctly describes the entire process from data querying to chart design and how to interpret the results.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'defi-protocol-engineer',
            role: 'DeFi Protocol Engineer',
            snapshot: 'A specialized smart contract developer with deep knowledge of financial primitives and economic security. Builds complex DeFi systems.',
            coreCompetencies: ['Advanced Solidity', 'Financial Primitives (AMMs, Lending)', 'Economic Security', 'Gas Optimization', 'Formal Verification'],
            questions: {
                Foundation: [
                    {
                        id: 'DEFI-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is an AMM (Automated Market Maker) and how does the constant product formula (`x * y = k`) work?',
                        idealAnswer: {
                            coreIdea: 'An AMM is a type of decentralized exchange (DEX) that allows users to trade against a pool of tokens instead of a traditional order book. The constant product formula is the algorithm that determines the price.',
                            keyPoints: [
                                '`x` is the reserve of Token A, `y` is the reserve of Token B.',
                                '`k` is a constant that must remain the same (before fees).',
                                'When a user adds Token A to the pool (`x` increases), a proportional amount of Token B must be removed (`y` decreases) to keep `k` constant.',
                                'The price of a token at any given moment is the ratio of the reserves (`y / x`).'
                            ]
                        },
                        commonPitfalls: ['Confusing an AMM with an order book exchange.', 'Unable to explain how a trade changes the reserves.'],
                        whyThisMatters: ['This is the foundational concept of the most popular type of DEX, like Uniswap. It is DeFi 101.'],
                        followUps: ['What is slippage in this context?', 'What is the role of liquidity providers?'],
                        redFlags: ['Not knowing what an AMM is.', 'Failing to grasp the basic `x*y=k` concept.'],
                        scoringRubric: { 1: 'Cannot explain an AMM.', 3: 'Understands it\'s a DEX but struggles with the formula.', 5: 'Clearly explains the constant product formula and its effect on token price during a swap.' },
                        expectedTime: '90 seconds'
                    },
                    {
                        id: 'DEFI-F-02',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is Total Value Locked (TVL)?',
                        idealAnswer: {
                            coreIdea: 'TVL represents the total value of all assets deposited by users into a DeFi protocol. It\'s a key metric used to gauge the size and adoption of a protocol.',
                            keyPoints: [
                                'Assets can include tokens deposited for lending, liquidity provision in an AMM, or collateral for minting stablecoins.',
                                'It is typically measured in USD.',
                                'A higher TVL generally indicates greater trust and usage of the protocol.',
                                'However, it can be a vanity metric if the capital is "mercenary" and only there for high temporary rewards.'
                            ],
                        },
                        commonPitfalls: ['Confusing TVL with market cap or trading volume.'],
                        whyThisMatters: ['TVL is the most commonly cited metric for the overall health of the DeFi ecosystem and individual protocols.'],
                        followUps: ['Why might TVL be a misleading metric?', 'Where would you go to find the TVL for various protocols? (e.g., DeFiLlama)'],
                        redFlags: ['Does not know what TVL stands for or what it represents.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Can define it but is unclear on what assets it includes.', 5: 'Clearly defines TVL and can also mention its limitations as a metric.' },
                        expectedTime: '60 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'DEFI-I-01',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is impermanent loss and who is affected by it?',
                        idealAnswer: {
                            coreIdea: 'Impermanent loss is the difference in value between holding two tokens in an AMM liquidity pool versus just holding them in your wallet. It affects liquidity providers (LPs).',
                            keyPoints: [
                                'It occurs when the price of the tokens in the pool changes from the time you deposited them.',
                                'The greater the price change, the larger the impermanent loss.',
                                'The "loss" is "impermanent" because if the token prices return to their original ratio, the loss disappears. However, if you withdraw your liquidity while there is a price divergence, the loss becomes permanent.',
                                'LPs are compensated for this risk by earning trading fees. The hope is that the fees earned will be greater than any impermanent loss incurred.'
                            ]
                        },
                        commonPitfalls: ['Thinking it\'s a permanent loss from the start.', 'Believing it means you have less money in USD terms (it\'s a loss relative to HODLing).', 'Not understanding that it happens in both price directions (up or down).'],
                        whyThisMatters: ['It is the primary financial risk that liquidity providers face.', 'A DeFi engineer must understand the risks their users are taking on.'],
                        followUps: ['How do concentrated liquidity AMMs (like Uniswap V3) affect impermanent loss?', 'What are some strategies to mitigate impermanent loss?'],
                        redFlags: ['Confusing it with simple investment loss.', 'Being unable to explain who it affects.'],
                        scoringRubric: { 1: 'Has not heard of it.', 3: 'Knows it affects LPs but cannot explain why or how it happens.', 5: 'Clearly defines IL as a loss relative to HODLing and explains its relationship to price divergence and trading fees.' },
                        expectedTime: '120 seconds'
                    },
                    {
                        id: 'DEFI-I-02',
                        difficulty: 'Intermediate',
                        category: 'Design',
                        question: 'You are designing a lending protocol. Why is it critical to use a reliable price oracle? What are the risks of using a single, on-chain source like a Uniswap pool for price data?',
                        idealAnswer: {
                            coreIdea: 'Price oracles are critical for lending protocols to determine the value of collateral and check if loans are under-collateralized and need to be liquidated. Using a manipulatable price source is a major security risk.',
                            keyPoints: [
                                'Why it\'s critical: The protocol must know the real-time USD value of collateral to maintain solvency. If it undervalues collateral, it can\'t issue loans. If it overvalues collateral, it will issue loans that are actually under-collateralized, leading to bad debt.',
                                'Risks of a single DEX pool oracle:',
                                '1. Price Manipulation: An attacker can use a flash loan to execute a huge trade on the DEX pool, momentarily spiking the price of the collateral asset.',
                                '2. Attack: The attacker then uses the artificially-inflated asset as collateral to borrow a large amount of another asset from the lending protocol and absconds with the funds, leaving the protocol with worthless collateral.',
                                'Better solution: Use a decentralized oracle network like Chainlink, which aggregates prices from dozens of off-chain and on-chain sources, making it resistant to manipulation from a single source.'
                            ]
                        },
                        commonPitfalls: ['Not understanding the link between collateral value and protocol solvency.', 'Thinking that a DEX price is always the "true" price.'],
                        whyThisMatters: ['Oracle manipulation is one of the most common and costly attack vectors in DeFi history.'],
                        followUps: ['What is a TWAP oracle and how does it try to solve this problem?', 'What are the trade-offs of using Chainlink vs an on-chain oracle?'],
                        redFlags: ['Not seeing the risk in using a single DEX as a price source.', 'Unable to explain what an oracle is.'],
                        scoringRubric: { 1: 'Does not understand the role of oracles.', 3: 'Knows oracles are for prices but cannot explain the manipulation risk.', 5: 'Clearly explains the risk of price manipulation via flash loans and recommends a robust solution like Chainlink.' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'DEFI-A-01',
                        difficulty: 'Advanced',
                        category: 'Risk',
                        question: 'Describe how a flash loan works and how it can be used to attack a protocol.',
                        idealAnswer: {
                            coreIdea: 'A flash loan is an uncollateralized loan that must be borrowed and repaid within the same blockchain transaction. They are a powerful tool for arbitrage but also for exploiting economic vulnerabilities in protocols.',
                            keyPoints: [
                                'How it works: Protocols like Aave allow anyone to borrow massive amounts of capital with zero collateral, under the condition that it is returned by the end of the transaction. If it\'s not returned, the entire transaction reverts.',
                                'Attack Vector: An attacker can use this massive, temporary capital to manipulate markets and exploit vulnerable protocols.',
                                'Example (Oracle Manipulation):',
                                '1. Attacker borrows $1M USDC via a flash loan.',
                                '2. They use the $1M USDC to buy a low-liquidity token on a DEX, causing its price to spike.',
                                '3. They use that now artificially-inflated token as collateral on a lending protocol with a weak oracle.',
                                '4. They borrow a different asset against this collateral.',
                                '5. They repay the $1M USDC flash loan, all in one atomic transaction. They are left with a profit from the asset they borrowed.'
                            ]
                        },
                        commonPitfalls: ['Thinking a flash loan can last longer than one transaction.', 'Not understanding that atomicity is what makes it risk-free for the lender.'],
                        whyThisMatters: ['Flash loans are a unique DeFi primitive and the primary tool used in many major economic exploits.', 'Engineers must design protocols that are resistant to flash loan-based attacks.'],
                        followUps: ['Are flash loans inherently bad?', 'What are some "good" use cases for flash loans? (e.g., arbitrage, collateral swapping)'],
                        redFlags: ['Not knowing what a flash loan is.', 'Unable to construct a plausible attack scenario.'],
                        scoringRubric: { 1: 'Does not know what a flash loan is.', 3: 'Understands it\'s a quick loan but can\'t explain the attack vector or atomicity.', 5: 'Clearly explains the concept of atomicity and provides a detailed example of a flash loan-based exploit.' },
                        expectedTime: '180 seconds'
                    },
                    {
                        id: 'DEFI-A-02',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Explain the architecture of a concentrated liquidity AMM like Uniswap V3. How does it improve capital efficiency?',
                        idealAnswer: {
                            coreIdea: 'Uniswap V3 allows liquidity providers to "concentrate" their capital within specific price ranges, rather than providing it across the entire price curve from zero to infinity. This dramatically improves capital efficiency.',
                            keyPoints: [
                                'The Problem with V2: In a standard `x*y=k` AMM, most of the liquidity sits unused because the assets trade within a relatively narrow price band. The capital that supports prices from $0.01 to $0.50 for an asset trading at $100 is essentially wasted.',
                                'V3 Solution: LPs can choose a specific price range to provide liquidity for (e.g., for ETH-USDC, provide liquidity only between $3000 and $4000).',
                                'Capital Efficiency: This means the same amount of capital can support a much larger volume of trades within that range, leading to higher fee earnings for LPs.',
                                'Trade-offs: If the price moves outside an LP\'s chosen range, their position becomes inactive and stops earning fees. It also makes impermanent loss more pronounced.'
                            ]
                        },
                        commonPitfalls: ['Not understanding the concept of providing liquidity across an infinite price curve in V2.', 'Confusing concentrated liquidity with a traditional order book.'],
                        whyThisMatters: ['Concentrated liquidity was a major innovation in DeFi and is the current industry standard for AMMs.', 'Shows a deep understanding of modern DeFi architecture.'],
                        followUps: ['How does this affect impermanent loss for LPs?', 'What are the challenges of building a market making strategy on Uniswap V3?'],
                        redFlags: ['Unable to explain the difference between V2 and V3 liquidity provisioning.', 'Not understanding the concept of capital efficiency.'],
                        scoringRubric: { 1: 'Does not know the difference between V2 and V3.', 3: 'Understands the concept of price ranges but struggles to explain why it improves capital efficiency.', 5: 'Clearly explains the inefficiency of the infinite price curve and how V3 solves it, while also noting the trade-offs.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'DEFI-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'You are designing a new lending protocol. What are the pros and cons of using an isolated lending model vs. a shared pool model?',
                        idealAnswer: {
                            coreIdea: 'The choice between isolated lending and a shared pool model is a fundamental design trade-off between capital efficiency and risk contagion.',
                            keyPoints: [
                                'Shared Pool Model (e.g., Aave, Compound):',
                                '- Pros: High capital efficiency. All deposited assets are in one big pool and can be used as collateral to borrow any other asset.',
                                '- Cons: High risk contagion. If one low-quality asset in the pool becomes insolvent or is exploited, it can drain the entire protocol and cause losses for all lenders, even those who didn\'t interact with the risky asset.',
                                'Isolated Lending Model (e.g., Silo, Euler):',
                                '- Pros: Risk is isolated. Each lending market is a distinct pair (e.g., ETH-USDC). A bad debt event in one pool does not affect any other pool. This allows the protocol to list riskier, long-tail assets without endangering the entire system.',
                                '- Cons: Lower capital efficiency. Liquidity is fragmented across many pools. A user cannot use their collateral from one pool to borrow an asset from a a different pool.'
                            ]
                        },
                        commonPitfalls: ['Only being familiar with the shared pool model.', 'Not understanding the risk contagion aspect of shared pools.'],
                        whyThisMatters: ['This is a core architectural decision for any lending protocol.', 'It shows a deep understanding of DeFi risk management and protocol design trade-offs.'],
                        followUps: ['How could you design a hybrid system that gets some of the benefits of both?', 'What kind of assets are better suited for an isolated lending model?'],
                        redFlags: ['Being unaware that different lending models exist.', 'Unable to articulate the trade-offs between capital efficiency and risk.'],
                        scoringRubric: { 1: 'Is only aware of one model.', 3: 'Can describe both models but struggles to explain the pros and cons.', 5: 'Clearly articulates the capital efficiency vs. risk contagion trade-off and can name examples of each.' },
                        expectedTime: '240 seconds'
                    },
                    {
                        id: 'DEFI-E-02',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is a Liquid Staking Derivative (LSD) and what role does it play in DeFi?',
                        idealAnswer: {
                            coreIdea: 'An LSD is a token that represents ETH that has been staked in the Ethereum Proof-of-Stake consensus mechanism. It allows stakers to get liquidity on their staked ETH, which would otherwise be locked.',
                            keyPoints: [
                                'The Problem: Staking ETH directly requires locking it up, making it illiquid and unable to be used in DeFi.',
                                'The Solution (e.g., Lido, Rocket Pool): Users deposit ETH into a liquid staking protocol and receive a derivative token in return (e.g., stETH from Lido).',
                                'DeFi Integration: This stETH token is a standard ERC-20 that can be traded, used as collateral in lending protocols, or used for yield farming, all while still earning the underlying ETH staking rewards.',
                                'Role in DeFi: LSDs have become a foundational "money lego". They massively increase the capital efficiency of the entire ecosystem by allowing staked assets to be productive in DeFi.'
                            ]
                        },
                        commonPitfalls: ['Confusing liquid staking with simple staking.', 'Not understanding why it improves capital efficiency.'],
                        whyThisMatters: ['LSDs are one of the largest and most important sectors in all of DeFi. Understanding them is critical for any senior DeFi engineer.'],
                        followUps: ['What are the centralization risks associated with a dominant LSD provider like Lido?', 'How does the peg of an LSD like stETH to ETH be maintained? What happens if it de-pegs?'],
                        redFlags: ['Not knowing what an LSD is.', 'Unable to explain its purpose.'],
                        scoringRubric: { 1: 'Does not know what an LSD is.', 3: 'Understands it\'s related to staking but can\'t explain the liquidity or capital efficiency aspects.', 5: 'Clearly defines LSDs, explains their role as a DeFi primitive, and can discuss the risks and benefits.' },
                        expectedTime: '180 seconds'
                    }
                ]
            }
        },
        {
            id: 'l2-rollups-engineer',
            role: 'L2 / Rollups Engineer',
            snapshot: 'Works on the scaling infrastructure for blockchains. Implements and optimizes rollup technology, sequencers, and bridges.',
            coreCompetencies: ['Distributed Systems', 'Cryptography', 'Go/Rust', 'EVM Deep Knowledge', 'Protocol Design'],
            questions: {
                Foundation: [
                    {
                        id: 'L2-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the primary goal of a Layer 2 (L2) scaling solution?',
                        idealAnswer: {
                            coreIdea: 'The primary goal is to increase the transaction throughput (scalability) and reduce the transaction costs of a Layer 1 blockchain like Ethereum, without sacrificing its security or decentralization.',
                            keyPoints: [
                                'L2s achieve this by processing transactions off-chain in a separate execution environment.',
                                'They then bundle or "roll up" many transactions into a single batch and post a compressed version of this data back to the L1.',
                                'The L1 is only responsible for data availability and security, while the L2 handles the expensive computation.',
                            ]
                        },
                        commonPitfalls: ['Thinking L2s are entirely separate blockchains.', 'Not understanding that L2s inherit their security from the L1.'],
                        whyThisMatters: ['This is the fundamental "why" behind the entire L2 ecosystem.'],
                        followUps: ['What is the "blockchain trilemma" and how do L2s attempt to solve it?', 'Name two major L2s on Ethereum.'],
                        redFlags: ['Does not know what an L2 is.', 'Confuses L2s with sidechains.'],
                        scoringRubric: { 1: 'Incorrect.', 3: 'Knows L2s are for scaling but can\'t explain how.', 5: 'Clearly explains the off-chain execution model and inheriting security from L1.' },
                        expectedTime: '60 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'L2-I-01',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is the key difference between an Optimistic Rollup and a ZK-Rollup?',
                        idealAnswer: {
                            coreIdea: 'The key difference is their security model and how they prove the validity of off-chain transactions to the L1. Optimistic Rollups use fraud proofs (innocent until proven guilty), while ZK-Rollups use validity proofs (guilty until proven innocent).',
                            keyPoints: [
                                'Optimistic Rollups (e.g., Arbitrum, Optimism): Assume all transactions are valid by default. There is a "challenge period" (e.g., 7 days) where anyone can submit a "fraud proof" to challenge a transaction. If the proof is valid, the fraudulent transaction is reverted.',
                                'ZK-Rollups (e.g., zkSync, Polygon zkEVM): Proactively generate a cryptographic "validity proof" (a SNARK or STARK) for every batch of transactions. This proof mathematically guarantees that all transactions are valid. The L1 just needs to verify this single, small proof.',
                                'Main Trade-off: Optimistic rollups have a long withdrawal period (the 7-day challenge window), while ZK-rollup withdrawals are nearly instant. However, ZK-rollups are more computationally intensive and technologically complex.'
                            ]
                        },
                        commonPitfalls: ['Confusing fraud proofs with validity proofs.', 'Not understanding the implication for withdrawal times.'],
                        whyThisMatters: ['This is the most important distinction in the L2 space and defines the major architectural trade-offs.'],
                        followUps: ['Why would a project choose to build on an Optimistic Rollup today, given the advantages of ZK-Rollups?', 'What is a "sequencer" in the context of a rollup?'],
                        redFlags: ['Cannot differentiate between the two.', 'Believing both have the same security model.'],
                        scoringRubric: { 1: 'Does not know the difference.', 3: 'Can name them but struggles to explain the proof mechanisms.', 5: 'Clearly explains the fraud proof vs. validity proof models and their trade-offs regarding withdrawal times and complexity.' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'L2-A-01',
                        difficulty: 'Advanced',
                        category: 'Architecture',
                        question: 'What is a "sequencer" in a rollup, and what are the centralization concerns associated with it?',
                        idealAnswer: {
                            coreIdea: 'A sequencer is the node responsible for ordering transactions, creating blocks on the L2, and posting the compressed data to the L1. In most current rollups, the sequencer is a single, centralized entity run by the rollup team, which introduces risks.',
                            keyPoints: [
                                'Responsibilities: Transaction ordering, block production, posting to L1.',
                                'Centralization Risks:',
                                '1. Censorship: A centralized sequencer could refuse to include a user\'s transactions in a block.',
                                '2. MEV Extraction: The sequencer has ultimate control over transaction ordering, allowing it to extract all the MEV from the system.',
                                '3. Liveness Failure: If the centralized sequencer goes down, the entire rollup halts. Users cannot make new transactions.',
                                'Mitigations: Most rollups have a "force inclusion" mechanism on L1 that allows users to bypass a censoring sequencer, but this is slow and expensive. The long-term solution is decentralized sequencer networks.'
                            ]
                        },
                        commonPitfalls: ['Thinking the sequencer also validates transactions (in ZK-rollups, that\'s the prover).', 'Not being aware of the censorship or liveness risks.'],
                        whyThisMatters: ['This is the biggest centralization problem facing L2s today.', 'Shows a deep understanding of the practical realities and risks of current rollup implementations.'],
                        followUps: ['What are some proposed designs for decentralized sequencers?', 'How does a shared sequencer model like Espresso work?'],
                        redFlags: ['Believing current rollups are fully decentralized.', 'Not knowing what a sequencer does.'],
                        scoringRubric: { 1: 'Does not know what a sequencer is.', 3: 'Defines the sequencer but cannot articulate the centralization risks.', 5: 'Clearly explains the sequencer\'s role and provides a detailed breakdown of censorship, MEV, and liveness risks.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'L2-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'Explain the concept of "Data Availability" (DA) and the "Data Availability Problem". How do modular DA layers like Celestia aim to solve this?',
                        idealAnswer: {
                            coreIdea: 'Data Availability is the guarantee that the transaction data for a rollup has been published and is available for anyone to inspect. The DA Problem is that posting this data to Ethereum L1 is the biggest cost for rollups. Modular DA layers aim to provide a cheaper alternative.',
                            keyPoints: [
                                'Why DA Matters: For an optimistic rollup, nodes must be able to download the transaction data to check for fraud. If the data is not available, a malicious sequencer could post an invalid state root and nobody could create a fraud proof to challenge it.',
                                'The DA Problem: Posting `calldata` to Ethereum is expensive and accounts for ~80-90% of a rollup\'s total cost.',
                                'Modular DA Solution (e.g., Celestia):',
                                '1. Celestia is a blockchain optimized for one thing: ordering and making data available. It does not handle smart contract execution.',
                                '2. Rollups can post their transaction data to Celestia instead of Ethereum L1 at a fraction of the cost.',
                                '3. Celestia uses a technique called Data Availability Sampling (DAS), which allows light nodes to verify that all the data is available by just sampling a few small pieces of it. This allows the network to scale securely.',
                                'This creates a "modular stack": Execution on the L2, Settlement on Ethereum, and Data Availability on Celestia.'
                            ]
                        },
                        commonPitfalls: ['Confusing data availability with data storage.', 'Thinking Celestia is a general-purpose L1.'],
                        whyThisMatters: ['The modular blockchain thesis is at the forefront of scalability research.', 'Shows an expert-level understanding of the entire blockchain stack and its bottlenecks.'],
                        followUps: ['What are the security trade-offs of using a separate DA layer instead of Ethereum?', 'How did EIP-4844 (Proto-Danksharding) on Ethereum address the DA problem?'],
                        redFlags: ['Not understanding why rollups need to post data to an L1.', 'Being unaware of the concept of a modular blockchain.'],
                        scoringRubric: { 1: 'Does not know what data availability is.', 3: 'Understands the cost issue but cannot explain the security implications or the modular solution.', 5: 'Clearly explains the DA problem, the security requirements, and how modular DA layers with DAS work.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'zero-knowledge-engineer',
            role: 'Zero-Knowledge Engineer',
            snapshot: 'Works at the cutting edge of cryptography, building privacy and scaling solutions using ZK-SNARKs and ZK-STARKs.',
            coreCompetencies: ['Advanced Cryptography', 'Circom/Cairo', 'Rust/C++', 'Mathematical Proficiency', 'ZKP Theory'],
            questions: {
                Foundation: [
                    {
                        id: 'ZK-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'In simple terms, what is a Zero-Knowledge Proof (ZKP)?',
                        idealAnswer: {
                            coreIdea: 'A ZKP is a cryptographic method where one party (the prover) can prove to another party (the verifier) that they know a piece of information, without revealing the information itself.',
                            keyPoints: [
                                'It must satisfy three properties: Completeness (a true statement can always be proven), Soundness (a false statement cannot be proven), and Zero-Knowledge (the verifier learns nothing except that the statement is true).',
                                'A common analogy is Ali Baba\'s cave, where someone proves they know a secret password to a magic door without revealing the password.',
                            ]
                        },
                        commonPitfalls: ['Getting lost in technical jargon.', 'Unable to explain the core "proof without revealing" concept simply.'],
                        whyThisMatters: ['This is the foundational concept of the entire field.'],
                        followUps: ['What are the two main applications of ZKPs in Web3 today? (Scaling and Privacy)'],
                        redFlags: ['Cannot explain the concept in simple terms.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands it\'s about privacy but can\'t explain the prover/verifier model.', 5: 'Clearly explains the core concept and can provide an analogy like Ali Baba\'s cave.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'ZK-I-01',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is the difference between a ZK-SNARK and a ZK-STARK?',
                        idealAnswer: {
                            coreIdea: 'They are two different types of validity proofs, with different trade-offs in terms of proof size, prover/verifier time, and cryptographic assumptions.',
                            keyPoints: [
                                'ZK-SNARK (Succinct Non-Interactive Argument of Knowledge):',
                                '- Pros: Very small proof size, making them cheap to verify on-chain.',
                                '- Cons: Requires a "trusted setup" for each circuit, which is a potential centralization vector. They are also not quantum-resistant.',
                                'ZK-STARK (Scalable Transparent Argument of Knowledge):',
                                '- Pros: Does not require a trusted setup ("transparent"). It is also quantum-resistant.',
                                '- Cons: Larger proof size, making them more expensive to verify on-chain compared to SNARKs.',
                                'In short: SNARKs are smaller but require trust; STARKs are bigger but are trustless and quantum-safe.'
                            ]
                        },
                        commonPitfalls: ['Mixing up the properties of each.', 'Not understanding what a trusted setup is.'],
                        whyThisMatters: ['The choice between SNARKs and STARKs is a major architectural decision for ZK systems.'],
                        followUps: ['What is a "trusted setup" ceremony and why is it a potential vulnerability?', 'Which systems use SNARKs vs. STARKs today?'],
                        redFlags: ['Cannot differentiate between them.', 'Does not know what "transparent" means in the context of STARKs.'],
                        scoringRubric: { 1: 'Does not know the difference.', 3: 'Knows they are different proof types but confuses their properties.', 5: 'Clearly explains the trade-offs regarding proof size, trusted setup, and quantum resistance.' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'ZK-A-01',
                        difficulty: 'Advanced',
                        category: 'Practical',
                        question: 'What is an "arithmetic circuit" in the context of ZKPs?',
                        idealAnswer: {
                            coreIdea: 'An arithmetic circuit is a way of representing a computation as a series of basic arithmetic operations (addition and multiplication). This is the first step in converting a program into a format that a ZK proof system can understand.',
                            keyPoints: [
                                'A ZKP system cannot directly prove a statement about a program written in a language like Python or JavaScript.',
                                'The program\'s logic must first be converted into a system of mathematical equations.',
                                'An arithmetic circuit breaks down the computation into a sequence of "gates," where each gate is either an addition or multiplication operation.',
                                'This circuit is then converted into a polynomial equation system (e.g., R1CS - Rank-1 Constraint System), which is what the ZKP system actually proves.',
                                'Languages like Circom are used to write these circuits.'
                            ]
                        },
                        commonPitfalls: ['Thinking ZKPs work on source code directly.', 'Not understanding the transformation process.'],
                        whyThisMatters: ['This is the fundamental process of how a computation is made "provable". Any ZK engineer must understand this workflow.'],
                        followUps: ['What is R1CS and how does it relate to a circuit?', 'What are some of the challenges of writing efficient circuits?'],
                        redFlags: ['Has no knowledge of the circuit/program transformation.', 'Confuses it with an electrical circuit.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands a program needs to be converted but can\'t explain circuits.', 5: 'Clearly explains that computation must be flattened into arithmetic gates and then into polynomial constraints.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'ZK-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is the Fiat-Shamir transformation and why is it important for making proofs non-interactive?',
                        idealAnswer: {
                            coreIdea: 'The Fiat-Shamir transformation is a cryptographic technique used to convert an interactive proof system (which requires back-and-forth communication between the prover and verifier) into a non-interactive proof system (where the prover can generate a single proof string that anyone can verify).',
                            keyPoints: [
                                'In an interactive proof, the verifier sends random challenges to the prover at various steps.',
                                'The key insight of Fiat-Shamir is to replace the verifier\'s random challenges with the output of a cryptographic hash function.',
                                'The prover simulates the entire interaction by themselves. At each step where they would receive a challenge from the verifier, they instead calculate a hash of all the public data and the messages they\'ve generated so far in the proof. The output of this hash serves as the "random" challenge.',
                                'This allows the prover to generate a complete proof in one go, which can be posted on a blockchain or sent to a verifier to be checked asynchronously.',
                                'It is a foundational technique that makes SNARKs and STARKs practical for use in systems like blockchains.'
                            ]
                        },
                        commonPitfalls: ['Being unable to explain how the hash function replaces the verifier.'],
                        whyThisMatters: ['This is a core concept in modern cryptography and is fundamental to how practical ZKPs work.'],
                        followUps: ['What are the security assumptions of the Fiat-Shamir heuristic? (i.e., the Random Oracle Model)'],
                        redFlags: ['Has never heard of the transformation.', 'Does not understand the difference between interactive and non-interactive proofs.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands the goal is to make proofs non-interactive but cannot explain the mechanism.', 5: 'Clearly explains how a hash function is used to replace the verifier\'s random challenges, enabling non-interactivity.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'token-economist',
            role: 'Token Economist / Tokenomics Designer',
            snapshot: 'Architects the economic and incentive systems of a protocol. A blend of economist, game theorist, and strategist.',
            coreCompetencies: ['Economics', 'Game Theory', 'Mechanism Design', 'Financial Modeling', 'Behavioral Psychology'],
            questions: {
                Foundation: [
                    {
                        id: 'TOK-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What are the three most important components of a tokenomics model?',
                        idealAnswer: {
                            coreIdea: 'The three core components are Supply, Distribution, and Utility.',
                            keyPoints: [
                                'Supply: How many tokens will exist? Is the supply fixed (like BTC) or inflationary (like ETH)? This determines the scarcity of the asset.',
                                'Distribution: Who gets the tokens initially? How are they allocated between the team, investors, and the community? This determines the initial decentralization.',
                                'Utility: What can you do with the token? Does it have a purpose beyond speculation, such as governance, staking, or paying fees? This creates organic demand.'
                            ]
                        },
                        commonPitfalls: ['Only focusing on supply.', 'Confusing utility with price speculation.'],
                        whyThisMatters: ['This is the basic framework for analyzing any crypto asset.'],
                        followUps: ['Give an example of a project with good utility.', 'What is a "vesting schedule" and why is it important for distribution?'],
                        redFlags: ['Cannot name these three components.', 'Has a purely speculative view of token value.'],
                        scoringRubric: { 1: 'Cannot answer.', 3: 'Names one or two components but cannot explain them well.', 5: 'Clearly defines and explains Supply, Distribution, and Utility.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'TOK-I-01',
                        difficulty: 'Intermediate',
                        category: 'Design',
                        question: 'Describe a "vote-escrowed" (ve) token model. What problem does it try to solve?',
                        idealAnswer: {
                            coreIdea: 'The ve-token model, pioneered by Curve, is designed to align long-term incentives by rewarding users who lock their governance tokens for longer periods of time with greater voting power and a larger share of protocol revenue.',
                            keyPoints: [
                                'The Problem: Standard governance tokens give the same voting power to short-term speculators as they do to long-term believers. This can lead to short-term oriented governance.',
                                'How it works:',
                                '1. Users lock their base token (e.g., CRV) for a chosen period (e.g., 1 week to 4 years).',
                                '2. They receive a non-transferable `veToken` (e.g., `veCRV`) in return.',
                                '3. The longer the lock-up period, the more `veTokens` they receive per base token.',
                                '4. This `veToken` balance, which decays over time, is used for voting and claiming fees, not the original token.',
                                'Result: It incentivizes long-term commitment and gives more power to those with the most skin in the game.'
                            ]
                        },
                        commonPitfalls: ['Thinking veTokens are transferable.', 'Not understanding the time-decay aspect.'],
                        whyThisMatters: ['This is one of the most important and widely adopted innovations in tokenomics design.', 'It demonstrates a sophisticated understanding of incentive alignment.'],
                        followUps: ['What are the potential downsides of a ve-model?', 'How did Uniswap V3 positions (NFTs) offer an alternative form of long-term alignment?'],
                        redFlags: ['Has not heard of ve-tokenomics.', 'Cannot explain why locking tokens is beneficial for governance.'],
                        scoringRubric: { 1: 'Is unaware of the model.', 3: 'Understands it involves locking but can\'t explain the benefits or mechanics.', 5: 'Clearly explains how the model aligns long-term incentives and can describe the mechanics of locking and voting power.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'TOK-A-01',
                        difficulty: 'Advanced',
                        category: 'Risk',
                        question: 'What is a "death spiral" in the context of an algorithmic stablecoin that uses a two-token model (e.g., Terra/Luna)?',
                        idealAnswer: {
                            coreIdea: 'A death spiral is a reflexive, self-reinforcing feedback loop where the price of a stablecoin de-pegs, causing mass creation of the collateral token, which crashes its price, which in turn further erodes confidence in the stablecoin, leading to a total collapse.',
                            keyPoints: [
                                'The Mechanism: The algorithmic stablecoin (e.g., UST) is designed to be redeemable for $1 worth of the volatile collateral token (e.g., LUNA).',
                                'The Spiral:',
                                '1. The stablecoin (UST) loses its peg and falls to $0.98 due to market pressure.',
                                '2. Arbitrageurs see an opportunity: they buy UST for $0.98 and redeem it for $1.00 worth of LUNA, which they immediately sell for a profit.',
                                '3. This redemption process mints a huge amount of new LUNA, increasing its supply and crashing its price.',
                                '4. As the price of LUNA (the collateral) plummets, confidence in the system collapses. More people sell UST, pushing its price even lower.',
                                '5. This triggers even more redemptions, more LUNA minting, and a faster crash, until both tokens are worthless.'
                            ]
                        },
                        commonPitfalls: ['Not understanding the reflexive relationship between the two tokens.'],
                        whyThisMatters: ['This was the mechanism behind one of the largest collapses in crypto history.', 'It shows a deep understanding of the inherent risks in under-collateralized and algorithmic stablecoin designs.'],
                        followUps: ['Can this type of system ever be sustainable?', 'How do over-collateralized stablecoins like DAI avoid this problem?'],
                        redFlags: ['Is unaware of the Terra/Luna collapse.', 'Cannot explain the feedback loop between the two assets.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands it was a collapse but cannot explain the mechanics.', 5: 'Clearly and accurately describes the reflexive feedback loop and the arbitrage mechanism that drives the spiral.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'TOK-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'You are designing the tokenomics for a new Layer 1 blockchain. What are the key parameters you would need to define for its staking and inflation model to balance security and sustainability?',
                        idealAnswer: {
                            coreIdea: 'The goal is to design an inflation and fee model that provides enough rewards to incentivize a sufficient percentage of the token supply to be staked for security, without creating excessive inflation that devalues the token for holders.',
                            keyPoints: [
                                'Key Parameters to Define:',
                                '1. Target Staking Ratio: What percentage of the total supply do we want to be staked for the network to be considered secure? (e.g., 67%).',
                                '2. Inflation Rate: Design a dynamic inflation rate. The rate should be high when the staking ratio is below the target (to encourage more staking) and low when the ratio is above the target.',
                                '3. Fee Burn Mechanism (e.g., EIP-1559): A portion of transaction fees should be burned. This creates a deflationary pressure that can offset inflation, especially during periods of high network usage.',
                                '4. Validator Commission: What percentage of staking rewards can validators take as a commission? This needs to be high enough to make running a validator profitable but low enough not to deter delegators.',
                                '5. Unbonding Period: How long should tokens be locked after a user unstakes? A longer period (e.g., 21 days) increases security by making it harder to attack the network, but it reduces liquidity and is worse for UX.',
                                'Balancing Act: It\'s a constant trade-off. High inflation provides high security but hurts token value. Low inflation is good for value but might not be enough to secure the network. The fee burn mechanism is crucial for finding a long-term equilibrium.'
                            ]
                        },
                        commonPitfalls: ['Suggesting a fixed, static inflation rate.', 'Not considering the role of fee burns.', 'Ignoring the unbonding period as a security parameter.'],
                        whyThisMatters: ['This is the core economic design problem for any Proof-of-Stake network.', 'It demonstrates the ability to think about a complex, multi-variable system and its trade-offs.'],
                        followUps: ['How would you model the potential outcomes of your chosen parameters?', 'What are the risks of a liquid staking derivative on your new L1?'],
                        redFlags: ['Failing to understand the relationship between staking rewards, inflation, and security.', 'Proposing a simplistic model with no dynamic adjustments.'],
                        scoringRubric: { 1: 'Does not understand the basic concepts.', 3: 'Can discuss inflation and staking but cannot structure a coherent model.', 5: 'Designs a sophisticated, dynamic model and clearly articulates the trade-offs between each parameter.' },
                        expectedTime: '300 seconds'
                    }
                ]
            }
        },
        {
            id: 'backend-web3-engineer',
            role: 'Backend Web3 Engineer',
            snapshot: 'Builds and maintains the off-chain infrastructure that supports dApps, such as indexers, APIs, and relayers.',
            coreCompetencies: ['Node.js/Go/Rust', 'Databases (SQL/NoSQL)', 'API Design', 'Infrastructure (Docker, K8s)', 'Ethers.js/Viem'],
            questions: {
                Foundation: [
                    {
                        id: 'BE-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'Why does a dApp need a backend server? Can\'t everything be done on the client and the blockchain?',
                        idealAnswer: {
                            coreIdea: 'While simple dApps can run without a backend, most complex applications need one for tasks that are impractical or impossible to do on-chain or on the client, such as data indexing, notifications, and managing private keys.',
                            keyPoints: [
                                'Data Indexing: Querying historical data directly from the blockchain is very slow. A backend is needed to index on-chain data into a fast database that the frontend can query easily.',
                                'Notifications: Blockchains cannot "push" data to users. A backend server is needed to monitor the chain for events and send notifications (e.g., via email or push notification) to users.',
                                'Complex Computations: Running complex or private computations off-chain before submitting a result to the chain is often more efficient.',
                                'Managing Keys: For services that need to submit transactions on behalf of users or the protocol, a secure backend is needed to manage the private keys.'
                            ]
                        },
                        commonPitfalls: ['Thinking a backend is always required.', 'Not being able to name specific examples of off-chain tasks.'],
                        whyThisMatters: ['This question tests the candidate\'s understanding of the full dApp architecture and the limitations of the blockchain.'],
                        followUps: ['What is The Graph and how does it relate to this?', 'Describe how you would build a service to notify a user when their loan is close to liquidation.'],
                        redFlags: ['Believing everything can or should be done on-chain.'],
                        scoringRubric: { 1: 'Cannot explain the need for a backend.', 3: 'Gives vague reasons like "performance".', 5: 'Provides specific, concrete examples like indexing, notifications, and key management.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'BE-I-01',
                        difficulty: 'Intermediate',
                        category: 'Architecture',
                        question: 'You need to build an API to serve data about NFT ownership. Would you query the blockchain directly in your API handlers or use an intermediary indexing service? Explain your reasoning.',
                        idealAnswer: {
                            coreIdea: 'You should absolutely use an intermediary indexing service. Querying the blockchain directly from API handlers is slow, unreliable, and will not scale.',
                            keyPoints: [
                                'Why Direct Queries Fail:',
                                '- Slow: RPC calls to a node can be slow, especially for historical data. An API handler would time out.',
                                '- Rate Limits: Public RPC providers have strict rate limits that a production API would quickly exceed.',
                                '- Complex Logic: Calculating current ownership requires processing all historical `Transfer` events, which is too complex for a single API call.',
                                'The Indexing Solution:',
                                '1. An indexer (either a self-hosted one using The Graph or a third-party API like Reservoir) listens to all on-chain events in real-time.',
                                '2. It processes these events and stores the computed state (e.g., current owner of each NFT) in a fast, traditional database (like PostgreSQL).',
                                '3. Your backend API then queries this database, which is extremely fast and scalable.'
                            ]
                        },
                        commonPitfalls: ['Suggesting direct RPC calls.', 'Not understanding the performance difference between an RPC call and a database query.'],
                        whyThisMatters: ['This is a fundamental architectural decision for any Web3 backend.', 'Shows an understanding of building scalable and performant off-chain systems.'],
                        followUps: ['What are the pros and cons of building your own indexer with The Graph vs. using a third-party API?', 'How would you ensure your indexed data is correct and hasn\'t missed any blocks?'],
                        redFlags: ['Advocating for querying the node directly in the API.', 'Not knowing what an indexer is.'],
                        scoringRubric: { 1: 'Suggests direct RPC calls.', 3: 'Knows direct calls are bad but is vague on the solution.', 5: 'Clearly explains why direct calls fail and details the architecture of using an indexer and a database.' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'BE-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Design a reliable system for submitting transactions to the blockchain from a backend service (a "relayer"). What are the key challenges you need to handle?',
                        idealAnswer: {
                            coreIdea: 'A reliable relayer needs to handle nonce management, gas price estimation, and transaction monitoring/re-submission to ensure transactions are mined in a timely and cost-effective manner.',
                            keyPoints: [
                                'Key Components:',
                                '1. Transaction Queue: Use a robust queue (like RabbitMQ or a database table) to manage pending transactions.',
                                '2. Nonce Manager: The biggest challenge. You must strictly track the nonce for the relayer\'s address to prevent conflicts. A dedicated service or a database row with a transaction lock is needed to ensure only one process can get the next nonce at a time.',
                                '3. Gas Price Oracle: A service that monitors network conditions and recommends optimal gas prices (`maxFeePerGas`, `maxPriorityFeePerGas`) for timely inclusion.',
                                '4. Transaction Monitor: After a transaction is submitted, a separate process must monitor its status. If it gets "stuck" (doesn\'t get mined), the system needs to automatically re-submit it with a higher gas price and the same nonce.',
                                '5. Error Handling & Alerting: The system needs robust logging and alerting for when transactions fail or get stuck for too long.'
                            ]
                        },
                        commonPitfalls: ['Underestimating the difficulty of nonce management.', 'Not having a plan for stuck transactions.', 'Suggesting a simple `await provider.sendTransaction()` in a loop.'],
                        whyThisMatters: ['Building a relayer is a very common but difficult backend task.', 'This question separates candidates with real production experience from those with only theoretical knowledge.'],
                        followUps: ['How would you handle a situation where your node goes down and you lose track of the last successful nonce?', 'How can you parallelize transaction submission from a single wallet?'],
                        redFlags: ['Believing nonce management is trivial.', 'Having no strategy for handling stuck or failed transactions.'],
                        scoringRubric: { 1: 'Proposes a naive, unworkable solution.', 3: 'Identifies some challenges like gas or nonces but doesn\'t have a robust architectural design.', 5: 'Designs a comprehensive, resilient system covering the queue, nonce management, gas oracle, and monitoring/resubmission.' },
                        expectedTime: '240 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'BE-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is a "re-org" (chain reorganization) and how must a backend indexer be designed to handle it?',
                        idealAnswer: {
                            coreIdea: 'A re-org is when a blockchain node discovers a new, longer valid chain, causing it to discard the blocks from its previous canonical chain. A robust indexer must be able to detect re-orgs and roll back its database state to a point before the divergence.',
                            keyPoints: [
                                'How it happens: Due to network latency, two miners might solve a block at roughly the same time, creating a temporary fork. The network eventually converges on one, longer chain.',
                                'The Problem for Indexers: An indexer might process several blocks from the "losing" chain. When the re-org happens, the data it has indexed is now from orphaned blocks and is incorrect.',
                                'Design Solution:',
                                '1. Store Block Hashes: The indexer must store the `blockHash` along with every piece of data it indexes.',
                                '2. Detect Re-orgs: While processing a new block, the indexer checks if the new block\'s `parentHash` matches the hash of the last block it processed. If not, a re-org has occurred.',
                                '3. Rollback State: The indexer must delete all data from its database that was associated with the now-orphaned block hashes until it finds a common ancestor block.',
                                '4. Re-index: After rolling back, it can start indexing the blocks from the new, correct chain.',
                                'For this reason, services often wait for a few blocks ("confirmations") before considering a transaction final.'
                            ]
                        },
                        commonPitfalls: ['Not knowing what a re-org is.', 'Thinking transactions are final after one block.', 'Not having a strategy for rolling back state.'],
                        whyThisMatters: ['This is a critical reliability issue for any service that provides on-chain data.', 'Demonstrates an expert understanding of how blockchains work at a fundamental level.'],
                        followUps: ['How many blocks of confirmation are generally considered safe on Ethereum?', 'How does Proof-of-Stake finality change the calculus for re-orgs?'],
                        redFlags: ['Is unaware of re-orgs.', 'Has no design for handling them, which would lead to a permanently corrupted database.'],
                        scoringRubric: { 1: 'Does not know what a re-org is.', 3: 'Understands the concept but has no clear idea how to handle it in an indexer.', 5: 'Clearly explains re-orgs and designs a robust system for detection and state rollback.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'cryptography-engineer',
            role: 'Cryptography Engineer',
            snapshot: 'A highly specialized role focused on designing and implementing the cryptographic protocols that secure a blockchain.',
            coreCompetencies: ['Applied Cryptography', 'Mathematical Proofs', 'Protocol Security', 'Low-level Programming (C++/Rust)'],
            questions: {
                Foundation: [
                    {
                        id: 'CRY-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the difference between symmetric and asymmetric cryptography?',
                        idealAnswer: {
                            coreIdea: 'Symmetric cryptography uses the same key for both encryption and decryption, while asymmetric cryptography uses a pair of keys: a public key for encryption and a private key for decryption.',
                            keyPoints: [
                                'Symmetric (e.g., AES): Fast and efficient. The challenge is securely sharing the single secret key between parties.',
                                'Asymmetric (e.g., RSA, ECDSA): Slower but solves the key distribution problem. The public key can be shared openly, while the private key remains secret. This is the foundation of blockchain wallets.'
                            ]
                        },
                        commonPitfalls: ['Mixing up which key does what in asymmetric crypto.'],
                        whyThisMatters: ['This is the most fundamental concept in modern cryptography.'],
                        followUps: ['Which type is used for digital signatures and how does that work?', 'Why don\'t we use asymmetric cryptography for everything?'],
                        redFlags: ['Cannot differentiate between the two.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands the single vs. dual key concept but is fuzzy on details.', 5: 'Clearly explains both systems and their primary trade-offs (speed vs. key distribution).' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'CRY-I-01',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What is a cryptographic hash function, and what are its key properties?',
                        idealAnswer: {
                            coreIdea: 'A hash function is a mathematical algorithm that takes an input of any size and produces a fixed-size, unique output string (a "hash").',
                            keyPoints: [
                                'Key Properties:',
                                '1. Deterministic: The same input will always produce the same output.',
                                '2. Pre-image Resistance: It should be computationally infeasible to find the original input given only the hash output.',
                                '3. Second Pre-image Resistance (Collision Resistance): It should be computationally infeasible to find two different inputs that produce the same hash output.',
                                '4. Avalanche Effect: A tiny change in the input should produce a drastically different output hash.',
                                'These properties are what make blockchains tamper-evident.'
                            ]
                        },
                        commonPitfalls: ['Confusing hashing with encryption.', 'Not being able to name the key properties.'],
                        whyThisMatters: ['Hash functions are a fundamental building block of blockchains, used in everything from block creation to Merkle trees.'],
                        followUps: ['What is a Merkle tree and how does it use hashing?', 'What hash function does Bitcoin use?'],
                        redFlags: ['Thinks hashing is reversible.', 'Does not understand collision resistance.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Can explain it produces a unique output but cannot name the security properties.', 5: 'Clearly defines a hash function and correctly lists its key cryptographic properties.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'CRY-A-01',
                        difficulty: 'Advanced',
                        category: 'Knowledge',
                        question: 'What is Elliptic Curve Cryptography (ECC) and why is it preferred over RSA for blockchains?',
                        idealAnswer: {
                            coreIdea: 'ECC is a type of asymmetric cryptography based on the algebraic structure of elliptic curves over finite fields. It is preferred over RSA because it offers the same level of security with much smaller key sizes.',
                            keyPoints: [
                                'The security of RSA relies on the difficulty of factoring large numbers, while ECC relies on the difficulty of the Elliptic Curve Discrete Logarithm Problem (ECDLP).',
                                'For a similar level of security, an ECC key can be much smaller. For example, a 256-bit ECC key provides comparable security to a 3072-bit RSA key.',
                                'Why this matters for blockchains: Smaller key sizes mean smaller signatures and faster computations, which translates to less data stored on-chain and less gas consumed per transaction. This efficiency is critical in a resource-constrained environment like a blockchain.'
                            ]
                        },
                        commonPitfalls: ['Not understanding the key size vs. security trade-off.', 'Unable to explain why smaller keys are beneficial.'],
                        whyThisMatters: ['ECC is the basis of the digital signature algorithm (ECDSA) used by Bitcoin and Ethereum. Understanding why it was chosen is crucial.'],
                        followUps: ['What is ECDSA?', 'What are some of the potential vulnerabilities or concerns with ECC (e.g., patent issues, potential for backdoors in certain curves)?'],
                        redFlags: ['Has never heard of ECC.', 'Cannot explain the benefit of smaller key sizes.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Knows ECC is used but cannot explain why it is better than RSA.', 5: 'Clearly explains the security-to-key-size ratio advantage and its importance for blockchain efficiency.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'CRY-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is a "pairing-based" cryptosystem and what new capabilities does it enable?',
                        idealAnswer: {
                            coreIdea: 'Pairing-based cryptography uses a mathematical map called a bilinear pairing on elliptic curves. This pairing allows for operations that are not possible with standard ECC, most notably enabling more advanced ZK-SNARK constructions.',
                            keyPoints: [
                                'A bilinear pairing takes two points from two different elliptic curve groups and maps them to a third group, with special properties that allow for multiplication of exponents in the clear.',
                                'This "multiplicative" property is what allows for the construction of succinct and efficiently verifiable zero-knowledge proofs (ZK-SNARKs).',
                                'While standard ECDSA is sufficient for signatures, pairing-friendly curves (like BLS12-381) are required for many advanced ZK systems.',
                                'Other capabilities include BLS signatures (which are aggregatable) and identity-based encryption.'
                            ]
                        },
                        commonPitfalls: ['Unable to explain what a pairing enables (the multiplicative property).'],
                        whyThisMatters: ['This is at the cutting edge of applied cryptography in Web3. It is the foundation for most modern ZK-Rollups and privacy systems.'],
                        followUps: ['What is the difference between a BLS signature and an ECDSA signature?', 'Why are pairing-friendly curves often considered less secure or "exotic" compared to standard curves?'],
                        redFlags: ['Has not heard of pairings.', 'Confuses them with standard ECC.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Knows pairings are related to ZKPs but cannot explain why.', 5: 'Clearly explains that pairings enable a multiplicative operation which is the key to building many ZK-SNARKs.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'dao-operations',
            role: 'DAO Operations / Governance',
            snapshot: 'Manages the day-to-day functioning of a DAO. Facilitates governance, manages projects, and ensures smooth operation.',
            coreCompetencies: ['Project Management', 'Communication', 'Governance Processes', 'Treasury Management', 'Community Facilitation'],
            questions: {
                Foundation: [
                    {
                        id: 'DAO-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the purpose of a DAO\'s governance token?',
                        idealAnswer: {
                            coreIdea: 'A governance token grants its holders voting rights, allowing them to participate in the decision-making process of the DAO.',
                            keyPoints: [
                                'It represents a share of control over the protocol.',
                                'Holders can create proposals and vote on proposals submitted by others.',
                                'Proposals can cover anything from changing a parameter in a smart contract to allocating funds from the treasury.',
                                'The weight of a member\'s vote is often proportional to the number of tokens they hold.'
                            ],
                        },
                        commonPitfalls: ['Thinking the token is just for speculation.', 'Confusing governance rights with direct profit-sharing.'],
                        whyThisMatters: ['This is the core mechanism of DAO governance.'],
                        followUps: ['What are the potential problems with 1-token-1-vote governance?', 'What is a "quorum" in a DAO vote?'],
                        redFlags: ['Does not know what a governance token is used for.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Says "for voting" but cannot elaborate.', 5: 'Clearly explains the concept of voting rights, proposal creation, and weighted voting.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'DAO-I-01',
                        difficulty: 'Intermediate',
                        category: 'Strategy',
                        question: 'What are some common causes of voter apathy in DAOs, and how would you try to increase participation?',
                        idealAnswer: {
                            coreIdea: 'Voter apathy is caused by a combination of high complexity, low individual impact, and lack of incentives. Increasing participation requires simplifying the process and creating better incentives.',
                            keyPoints: [
                                'Causes:',
                                '- High Complexity: Proposals are often too technical or long for the average token holder to understand.',
                                '- Low Impact: Small token holders feel their vote doesn\'t matter.',
                                '- Lack of Incentive: Voting costs gas and time with no direct reward.',
                                'Solutions:',
                                '- Delegation: Allow users to delegate their voting power to a trusted community member (a "delegate") who can vote on their behalf.',
                                '- Clear Summaries: Create easy-to-understand summaries of complex proposals (e.g., TL;DRs).',
                                '- Gasless Voting: Use off-chain voting tools like Snapshot for "temperature check" votes before the final, binding on-chain vote.',
                                '- Incentives: Some DAOs experiment with rewards for active voters.'
                            ]
                        },
                        commonPitfalls: ['Blaming the users for being lazy.', 'Suggesting solutions that increase centralization.'],
                        whyThisMatters: ['Low voter turnout is a major existential risk for DAOs.', 'This question tests the candidate\'s understanding of practical governance challenges.'],
                        followUps: ['What are the pros and cons of delegation?', 'How do you balance making it easy to vote with ensuring voters are well-informed?'],
                        redFlags: ['Has no ideas for improving participation.', 'Suggests making voting mandatory.'],
                        scoringRubric: { 1: 'Is unaware of voter apathy as a problem.', 3: 'Identifies the problem but has weak or generic solutions.', 5: 'Provides multiple, specific, practical solutions like delegation and Snapshot.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'DAO-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'Describe how a DAO can use a multisig wallet for treasury management. What are the pros and cons compared to fully on-chain governance?',
                        idealAnswer: {
                            coreIdea: 'A multisig wallet is a smart contract that requires multiple signers to approve a transaction. DAOs use it as a practical and secure way to manage their treasury, balancing speed and safety.',
                            keyPoints: [
                                'How it works: A DAO can set up a Gnosis Safe with, for example, a 4-of-7 signature requirement. The 7 signers are trusted community members. To spend treasury funds, a proposal is made, and at least 4 of the 7 signers must approve the transaction.',
                                'Pros:',
                                '- More Nimble: Faster for operational spending than a full on-chain vote for every transaction.',
                                '- Gas-Efficient: Cheaper than on-chain voting.',
                                '- Security: Protects against a single key being compromised.',
                                'Cons:',
                                '- Centralization: It introduces a trusted, centralized committee. The DAO members must trust the multisig signers not to collude or act maliciously.',
                                '- Scalability: It doesn\'t scale to thousands of voters.',
                                'Common Pattern: DAOs often use a hybrid approach: major strategic decisions go to a full on-chain vote, while smaller, operational grants are managed by an elected multisig committee.'
                            ]
                        },
                        commonPitfalls: ['Thinking a multisig is the same as on-chain governance.', 'Not understanding the trust assumptions.'],
                        whyThisMatters: ['This is the most common treasury management pattern for DAOs.', 'Shows an understanding of the practical trade-offs between decentralization and operational efficiency.'],
                        followUps: ['How would you design a process for electing and rotating multisig signers?', 'What is a "Rage Quit" mechanism and how does it protect minority token holders?'],
                        redFlags: ['Does not know what a multisig is.', 'Unable to articulate the pros and cons.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands what a multisig is but cannot explain its role in DAO governance.', 5: 'Clearly explains the pros and cons and describes the common hybrid model.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'DAO-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'What is a "legal wrapper" for a DAO, and why might a DAO choose to use one?',
                        idealAnswer: {
                            coreIdea: 'A legal wrapper is a traditional legal entity (like a foundation or LLC) that is controlled by the DAO. It is used to provide legal personhood for the DAO, enabling it to interact with the real world and providing liability protection for its members.',
                            keyPoints: [
                                'The Problem: Without a legal entity, a DAO might be treated as a "general partnership" by default in many jurisdictions. This means every member could be held personally and fully liable for the actions of the DAO.',
                                'The Solution: The DAO votes to establish a traditional legal entity (e.g., a foundation in the Cayman Islands or a Limited Cooperative Association in the US). This entity can then:',
                                '- Limit Liability: Protects members from personal liability.',
                                '- Sign Contracts: Enter into real-world contracts (e.g., for services, employment, office space).',
                                '- Hold IP: Own intellectual property like trademarks and copyrights.',
                                '- Pay Taxes: Provide a clear framework for paying taxes.',
                                'The legal entity is controlled by the DAO through its on-chain governance.'
                            ]
                        },
                        commonPitfalls: ['Thinking a DAO doesn\'t need to interact with the legal system.', 'Confusing the DAO with its legal wrapper.'],
                        whyThisMatters: ['This is at the forefront of DAO governance and operations, bridging the gap between the decentralized world and the traditional legal system.'],
                        followUps: ['What are some of the popular jurisdictions for creating DAO legal wrappers?', 'What are the challenges in ensuring the legal entity truly remains under the control of the on-chain governance?'],
                        redFlags: ['Believing that DAOs exist in a legal vacuum.', 'Not understanding the concept of personal liability for members of a general partnership.'],
                        scoringRubric: { 1: 'Is unaware of the legal issues.', 3: 'Understands the liability problem but is unaware of the legal wrapper solution.', 5: 'Clearly explains the liability problem and how a legal wrapper solves it, providing concrete examples of what it enables.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'security-devsecops',
            role: 'Security / DevSecOps for Web3',
            snapshot: 'Secures the full stack of a Web3 company, from the smart contracts to the cloud infrastructure and frontend.',
            coreCompetencies: ['Smart Contract Auditing', 'Infrastructure Security', 'CI/CD Pipelines', 'Incident Response', 'Threat Modeling'],
            questions: {
                Foundation: [
                    {
                        id: 'SEC-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the single most important security risk for a dApp frontend?',
                        idealAnswer: {
                            coreIdea: 'The most critical risk is a frontend compromise that tricks users into signing malicious transactions or giving away their assets.',
                            keyPoints: [
                                'An attacker could compromise the website\'s domain, hosting, or code repository.',
                                'They could then replace the legitimate smart contract address with a malicious one, causing users to send funds to the attacker.',
                                'Alternatively, they could change the UI to ask for a malicious approval (e.g., `setApprovalForAll`) that gives the attacker control over all of the user\'s NFTs or tokens.',
                                'This is why users should always verify contract addresses and be wary of suspicious signature requests.'
                            ]
                        },
                        commonPitfalls: ['Only focusing on smart contract bugs.', 'Not considering the off-chain components.'],
                        whyThisMatters: ['Many major "hacks" are actually frontend exploits, not smart contract bugs.', 'A DevSecOps role requires thinking about the whole stack, not just the on-chain part.'],
                        followUps: ['What measures can be taken to protect against this?', 'How can IPFS be used to host a more secure frontend?'],
                        redFlags: ['Does not see the frontend as a major attack surface.'],
                        scoringRubric: { 1: 'Cannot identify any risks.', 3: 'Mentions generic web security issues but not crypto-specific ones.', 5: 'Clearly explains the specific risk of tricking users into signing malicious transactions.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'SEC-I-01',
                        difficulty: 'Intermediate',
                        category: 'Design',
                        question: 'You are setting up a CI/CD pipeline for a smart contract project. What security checks would you integrate?',
                        idealAnswer: {
                            coreIdea: 'A secure CI/CD pipeline should automatically run a suite of security analysis tools on every commit or pull request to catch vulnerabilities early.',
                            keyPoints: [
                                '1. Linting: Use a linter like `solhint` to enforce code style and catch common low-level issues.',
                                '2. Static Analysis (SAST): Integrate a tool like `Slither`. This will scan the code for known vulnerability patterns without executing it.',
                                '3. Unit & Fuzz Testing: Run the full test suite using `Foundry` or `Hardhat`. This should include comprehensive unit tests and fuzz tests for key functions.',
                                '4. Coverage Reports: Generate a test coverage report and fail the build if coverage drops below a certain threshold (e.g., 95%).',
                                '5. Secret Scanning: Use a tool to scan for accidentally committed private keys or API keys.'
                            ]
                        },
                        commonPitfalls: ['Only suggesting unit tests.', 'Not including static analysis.', 'Forgetting about secret scanning.'],
                        whyThisMatters: ['Automating security checks is a core part of the DevSecOps philosophy.', 'It creates a baseline level of security and prevents simple bugs from making it to production.'],
                        followUps: ['How would you handle a high number of false positives from a tool like Slither?', 'At what point in the development cycle would you recommend a full manual audit?'],
                        redFlags: ['Has no concept of a secure CI/CD pipeline.', 'Unable to name specific security tools for each stage.'],
                        scoringRubric: { 1: 'Suggests only running tests.', 3: 'Mentions one or two tools but cannot design a comprehensive pipeline.', 5: 'Designs a multi-stage pipeline including linting, static analysis, testing, and secret scanning.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'SEC-A-01',
                        difficulty: 'Advanced',
                        category: 'Practical',
                        question: 'What is an "incident response plan" for a DeFi protocol, and what are the key components?',
                        idealAnswer: {
                            coreIdea: 'An incident response plan is a pre-defined set of procedures for what to do when a security exploit is discovered. The goal is to mitigate the damage, communicate clearly, and recover as quickly as possible.',
                            keyPoints: [
                                'Key Components:',
                                '1. War Room: A designated, secure communication channel (e.g., a private Signal group) for the core team and security researchers to coordinate.',
                                '2. Triage & Mitigation: The first step is to confirm the exploit and, if possible, pause the contracts to prevent further losses. This requires having a pausable mechanism built into the contracts from the start.',
                                '3. Communication: A designated spokesperson to handle public communication. The strategy is usually to first announce that an issue is being investigated, and then provide a full post-mortem after the facts are known.',
                                '4. Post-Mortem: A detailed, transparent report explaining what happened, how it happened, the financial impact, and what steps will be taken to prevent it from happening again.',
                                '5. Recovery: A plan for compensating affected users if funds were lost.'
                            ]
                        },
                        commonPitfalls: ['Focusing only on the technical fix.', 'Underestimating the importance of communication.', 'Not having a plan *before* an incident happens.'],
                        whyThisMatters: ['How a team responds to a hack is a defining moment.', 'A good plan can save a project\'s reputation, while a bad one can destroy it.'],
                        followUps: ['Who should be in the war room?', 'What are the pros and cons of having a "pause" function in a smart contract?'],
                        redFlags: ['No clear plan.', 'Advocating for hiding the hack from the community.'],
                        scoringRubric: { 1: 'Has no plan.', 3: 'Focuses only on fixing the bug but not on communication or mitigation.', 5: 'Provides a comprehensive plan covering war room, mitigation, communication, and post-mortem.' },
                        expectedTime: '240 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'SEC-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'What is a "timelock" contract and how does it improve the security and predictability of protocol governance?',
                        idealAnswer: {
                            coreIdea: 'A timelock is a smart contract that forces a delay between when a governance proposal is passed and when its code can be executed. This gives the community time to react to potentially malicious or dangerous proposals.',
                            keyPoints: [
                                'How it works: Administrative control of a protocol is given to a Timelock contract, not directly to an EOA or multisig.',
                                '1. A governance proposal to, for example, upgrade a contract, is passed.',
                                '2. The passed proposal is then submitted to the Timelock contract, which queues it.',
                                '3. The transaction cannot be executed until a pre-defined delay (e.g., 48 hours) has passed.',
                                'Benefits:',
                                '- Security: It gives users a window of time to exit the protocol if they see a malicious upgrade has been approved (e.g., one that would drain funds).',
                                '- Predictability: It allows teams and users to prepare for upcoming changes.',
                                '- Trust: It signals that the team cannot make instantaneous, arbitrary changes to the protocol, which builds user trust.'
                            ]
                        },
                        commonPitfalls: ['Confusing a timelock with a vesting schedule.', 'Thinking the delay is for technical reasons, not security/governance reasons.'],
                        whyThisMatters: ['Timelocks are a standard and critical component of secure, decentralized governance.', 'Demonstrates an expert-level understanding of protocol safety mechanisms.'],
                        followUps: ['What are the potential downsides of a long timelock delay?', 'How would you design a timelock that allows for emergency cancellations?'],
                        redFlags: ['Does not know what a timelock is.', 'Unable to explain its security benefits.'],
                        scoringRubric: { 1: 'Is unaware of timelocks.', 3: 'Understands it creates a delay but can\'t explain the security implications.', 5: 'Clearly explains how a timelock prevents immediate malicious upgrades and gives users time to exit.' },
                        expectedTime: '180 seconds'
                    }
                ]
            }
        },
        {
            id: 'nft-gamefi-pm',
            role: 'NFT / GameFi Product Manager',
            snapshot: 'A specialized PM focused on the unique challenges of NFT collections and blockchain-based games.',
            coreCompetencies: ['Game Design', 'Virtual Economies', 'Community Building', 'NFT Standards', 'Live-ops Management'],
            questions: {
                Foundation: [
                    {
                        id: 'GAME-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the key value proposition of using NFTs for in-game assets compared to traditional game databases?',
                        idealAnswer: {
                            coreIdea: 'The key value proposition is true digital ownership. NFTs allow players to own their in-game assets in a way that is independent of the game itself.',
                            keyPoints: [
                                'Traditional: In-game items are just entries in a company\'s private database. The company can delete them, change them, or ban your account at any time. You don\'t truly own them.',
                                'NFTs: The item is a token on a public blockchain, held in the player\'s personal crypto wallet. The game developer cannot take it away. The player can sell it on any open marketplace, or even potentially use it in other games in the future.'
                            ],
                        },
                        commonPitfalls: ['Only focusing on the ability to sell items for real money.'],
                        whyThisMatters: ['This is the fundamental "why" of Web3 gaming.'],
                        followUps: ['What are some of the user experience challenges this creates for mainstream gamers?', 'What does "interoperability" mean for game assets?'],
                        redFlags: ['Unable to explain the concept of true ownership.', 'Thinks NFTs are only about speculation.'],
                        scoringRubric: { 1: 'Cannot explain the difference.', 3: 'Focuses only on the "play-to-earn" aspect.', 5: 'Clearly articulates the concept of true digital ownership and its implications.' },
                        expectedTime: '90 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'GAME-I-01',
                        difficulty: 'Intermediate',
                        category: 'Design',
                        question: 'You are designing an NFT mint. What are three common minting mechanics you could consider?',
                        idealAnswer: {
                            coreIdea: 'There are several standard mechanics to manage the demand and distribution of an NFT mint.',
                            keyPoints: [
                                '1. Allowlist / Whitelist: A list of specific wallet addresses are given early or guaranteed access to mint, often at a lower price. This rewards early community members and prevents gas wars.',
                                '2. Public Sale (Fixed Price): A simple first-come, first-served sale at a fixed price. Can lead to "gas wars" where everyone tries to mint at once, driving up network fees.',
                                '3. Dutch Auction: The mint price starts high and gradually decreases over time until the collection is sold out. This is a price discovery mechanism designed to find the market-clearing price.',
                                '4. Free Mint: The NFTs are free to mint (plus gas fees). This is used to build a wide community quickly, with the project planning to earn revenue from secondary market royalties.'
                            ]
                        },
                        commonPitfalls: ['Only knowing about public sales.', 'Not understanding the purpose of an allowlist.'],
                        whyThisMatters: ['The mint mechanic is a critical part of a project\'s go-to-market strategy.', 'Shows practical knowledge of the NFT space.'],
                        followUps: ['What are the pros and cons of a Dutch Auction vs. a fixed-price sale?', 'How would you technically implement an allowlist? (e.g., Merkle Tree)'],
                        redFlags: ['Is only aware of one type of mint.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Can name one or two mechanics but can\'t explain their purpose.', 5: 'Names at least three mechanics and clearly explains the strategic reason for using each one.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'GAME-A-01',
                        difficulty: 'Advanced',
                        category: 'Strategy',
                        question: 'The "Play-to-Earn" (P2E) model has been heavily criticized. What were its main flaws, and what is the "Play-and-Own" model that is emerging to replace it?',
                        idealAnswer: {
                            coreIdea: 'P2E created unsustainable economies that felt more like a job ("grind") than a game. The "Play-and-Own" model prioritizes creating a fun game first, with ownership as a feature that enhances the experience, not as the primary goal.',
                            keyPoints: [
                                'Flaws of P2E (e.g., Axie Infinity):',
                                '- Unsustainable Inflation: The game economy relied on a constant influx of new players buying the assets sold by older players. When new player growth slowed, the token price crashed.',
                                '- Focus on Earning, Not Fun: The gameplay often became a repetitive grind for rewards, which is not enjoyable for most players.',
                                '- Extraction: It attracted extractors and bots, not genuine players.',
                                'The "Play-and-Own" Model:',
                                '- Fun First: The primary goal is to build a high-quality, engaging game that people would want to play even without any rewards.',
                                '- Ownership as a Bonus: The ability to truly own and trade your assets is a powerful feature that enhances the game, but it is not the core loop.',
                                '- Sustainable Economy: The economy is designed to be more balanced, often with "sinks" that remove currency from the game to balance the "faucets" that create it.'
                            ]
                        },
                        commonPitfalls: ['Defending the old P2E model without acknowledging its flaws.', 'Not being able to articulate the "fun first" philosophy of the new model.'],
                        whyThisMatters: ['This is the most important strategic conversation in the Web3 gaming space today.', 'Shows the candidate is up-to-date with the evolution of the industry and thinks critically about sustainable design.'],
                        followUps: ['How would you design a token sink for an in-game economy?', 'Can a game be successful without any "earn" component at all?'],
                        redFlags: ['Believes P2E economies are sustainable.', 'Does not understand the importance of game design and fun.'],
                        scoringRubric: { 1: 'Is unaware of the criticisms of P2E.', 3: 'Can criticize P2E but struggles to define the "Play-and-Own" alternative.', 5: 'Clearly articulates the flaws of P2E and the "fun first" philosophy of the Play-and-Own model.' },
                        expectedTime: '240 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'GAME-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'You are designing the economy for a new Web3 game. How would you balance the on-chain and off-chain components for performance and decentralization?',
                        idealAnswer: {
                            coreIdea: 'The optimal design is a hybrid approach. Keep high-value, low-frequency actions on-chain to leverage the security and ownership benefits of the blockchain, while keeping high-frequency, low-value actions off-chain for performance and good UX.',
                            keyPoints: [
                                'On-Chain (Slow, Secure, Decentralized):',
                                '- Asset Ownership: The core NFTs representing valuable items (characters, land, rare weapons) must be on-chain.',
                                '- Key Economic Actions: Major actions like crafting a rare item, breeding new characters, or trading on the marketplace should be on-chain transactions.',
                                '- Governance: Voting on game balance changes should be on-chain.',
                                'Off-Chain (Fast, Centralized, Good UX):',
                                '- Game State: The moment-to-moment gameplay logic (e.g., player position, combat calculations) should be handled by a traditional game server.',
                                '- Soft Currency: Low-value in-game currencies (like "gold") can be managed off-chain in a standard database and only "bridged" to the chain when the user wants to cash out.',
                                '- Matchmaking & Social: Player matchmaking, chat, and friend lists should be off-chain.',
                                'The Bridge: A reliable system is needed to bridge the state between the off-chain game server and the on-chain smart contracts.'
                            ]
                        },
                        commonPitfalls: ['Suggesting everything should be on-chain.', 'Not having a clear reason for why certain components are on-chain vs. off-chain.'],
                        whyThisMatters: ['This is the core architectural challenge of Web3 game design.', 'It shows the candidate can think through complex trade-offs between decentralization, performance, and user experience.'],
                        followUps: ['What are the security risks of this hybrid model?', 'How would you prevent a player from hacking the off-chain server to give themselves an advantage?'],
                        redFlags: ['Proposing a "fully on-chain" game without understanding the performance implications.', 'Unable to articulate the trade-offs.'],
                        scoringRubric: { 1: 'Does not understand the need for off-chain components.', 3: 'Understands the hybrid model but has a weak rationale for the separation.', 5: 'Clearly defines what should go on-chain vs. off-chain and provides a strong justification based on trade-offs.' },
                        expectedTime: '300 seconds'
                    }
                ]
            }
        },
        {
            id: 'legal-compliance',
            role: 'Legal / Compliance Associate, Web3',
            snapshot: 'Navigates the complex and evolving regulatory landscape of crypto. Advises on securities law, AML, and corporate structuring.',
            coreCompetencies: ['Securities Law (Howey Test)', 'AML/KYC Regulations', 'DAO Legal Wrappers', 'IP Law for NFTs', 'Privacy Law'],
            questions: {
                Foundation: [
                    {
                        id: 'LEG-F-01',
                        difficulty: 'Foundation',
                        category: 'Knowledge',
                        question: 'What is the "Howey Test" and why is it relevant to crypto?',
                        idealAnswer: {
                            coreIdea: 'The Howey Test is a four-prong test created by the U.S. Supreme Court to determine if a transaction qualifies as an "investment contract" and is therefore subject to securities laws. It is the primary framework the SEC uses to analyze whether a crypto token is a security.',
                            keyPoints: [
                                'The four prongs are:',
                                '1. An investment of money',
                                '2. In a common enterprise',
                                '3. With a reasonable expectation of profits',
                                '4. To be derived from the efforts of others.',
                                'Many crypto tokens, especially those sold in ICOs to fund development, risk meeting all four prongs and being classified as unregistered securities.'
                            ]
                        },
                        commonPitfalls: ['Not being able to name the four prongs.', 'Thinking it only applies to stocks.'],
                        whyThisMatters: ['This is the single most important legal concept in the US crypto space. Any legal or compliance professional must know it inside and out.'],
                        followUps: ['How might a project design its token launch to minimize the risk of being classified as a security?', 'What is the significance of the recent Ripple ruling?'],
                        redFlags: ['Has not heard of the Howey Test.', 'Unable to list its core components.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Knows it relates to securities but cannot explain the test.', 5: 'Clearly defines the test, lists all four prongs, and explains its relevance to token sales.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'LEG-I-01',
                        difficulty: 'Intermediate',
                        category: 'Knowledge',
                        question: 'What are the primary AML/KYC obligations for a centralized crypto exchange?',
                        idealAnswer: {
                            coreIdea: 'Centralized exchanges operating in most jurisdictions are considered Money Service Businesses (MSBs) or Virtual Asset Service Providers (VASPs) and are subject to the same AML/KYC regulations as traditional financial institutions.',
                            keyPoints: [
                                '1. Customer Identification Program (CIP): They must perform KYC (Know Your Customer) to verify the identity of their users (e.g., collecting government ID and proof of address).',
                                '2. Transaction Monitoring: They must monitor transactions for suspicious activity that could indicate money laundering or terrorist financing.',
                                '3. Reporting: They are required to file Suspicious Activity Reports (SARs) with financial intelligence units (like FinCEN in the US) for certain transactions.',
                                '4. Sanctions Screening: They must screen users and transactions against global sanctions lists (like the OFAC list).'
                            ]
                        },
                        commonPitfalls: ['Thinking crypto is completely unregulated.', 'Confusing AML with general data privacy.'],
                        whyThisMatters: ['This is the core of compliance for any centralized crypto company.'],
                        followUps: ['How do these obligations apply to a decentralized protocol like Uniswap?', 'What is the "Travel Rule" for crypto transactions?'],
                        redFlags: ['Believes exchanges have no compliance obligations.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Understands they need to do KYC but cannot list other obligations.', 5: 'Lists and explains the core pillars of a crypto AML program (CIP, monitoring, reporting, screening).' },
                        expectedTime: '150 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'LEG-A-01',
                        difficulty: 'Advanced',
                        category: 'Design',
                        question: 'A DAO wants to hire a full-time developer and pay them a salary. What are the legal and operational challenges, and how could a "DAO legal wrapper" help solve them?',
                        idealAnswer: {
                            coreIdea: 'The challenge is that a DAO is not a recognized legal entity, making it impossible to sign an employment contract or manage payroll. A legal wrapper provides the necessary legal personhood to solve this.',
                            keyPoints: [
                                'The Challenges:',
                                '- No Legal Personhood: The DAO itself cannot sign an employment agreement.',
                                '- Liability: Without a legal structure, the DAO could be deemed a general partnership, making all token holders personally liable for its debts and obligations.',
                                '- Payroll & Taxes: It\'s unclear how to handle payroll taxes and employment obligations for a contributor paid from a decentralized treasury.',
                                'The Legal Wrapper Solution:',
                                '1. The DAO votes to establish a traditional legal entity (e.g., a foundation in the Cayman Islands or a Limited Cooperative Association in the US).',
                                '2. This legal entity can then enter into a standard employment contract with the developer.',
                                '3. The DAO can send funds from its treasury to the legal entity\'s bank account to cover the fiat salary and payroll taxes.',
                                '4. The legal entity shields the DAO members from personal liability.'
                            ]
                        },
                        commonPitfalls: ['Thinking DAOs can just sign contracts directly.', 'Not understanding the liability risk of a general partnership.'],
                        whyThisMatters: ['This is a critical issue for any DAO that wants to mature and interact with the traditional world.', 'It shows an understanding of how to bridge the gap between Web3 and the existing legal system.'],
                        followUps: ['What are some popular jurisdictions for these legal wrappers?', 'What are the risks of the legal wrapper not acting in accordance with the DAO\'s votes?'],
                        redFlags: ['Does not see any legal issue with a DAO hiring an employee.', 'Is unaware of the concept of a legal wrapper.'],
                        scoringRubric: { 1: 'Does not see a problem.', 3: 'Identifies the problems but is unaware of the legal wrapper solution.', 5: 'Clearly explains the challenges and how a legal wrapper provides a solution for contracts, liability, and payroll.' },
                        expectedTime: '240 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'LEG-E-01',
                        difficulty: 'Expert',
                        category: 'Knowledge',
                        question: 'Explain the legal distinction between a "utility token" and a "security token." What are the key factors a regulator would consider?',
                        idealAnswer: {
                            coreIdea: 'The distinction, which is often blurry, hinges on the token\'s primary purpose and the expectations of its purchasers. A utility token is primarily for use within a network, while a security token primarily represents an investment in an enterprise.',
                            keyPoints: [
                                'Utility Token:',
                                '- Purpose: Its main function is to grant access to a product or service (e.g., FIL for storage on Filecoin).',
                                '- Marketing: Marketed as a product for users, not as an investment for speculators.',
                                '- State of Network: Ideally, the network is live and functional at the time of the token sale, so the token has immediate utility.',
                                'Security Token:',
                                '- Purpose: Represents an ownership stake, a debt, or a right to future profits.',
                                '- Expectation of Profit: Purchasers are primarily motivated by the expectation of profit from the efforts of the development team.',
                                '- Marketing: Often marketed with language about price appreciation and investment returns.',
                                'Regulators focus on the economic realities of the transaction, not what the project calls its token. They apply the Howey Test to determine if it\'s a security.'
                            ]
                        },
                        commonPitfalls: ['Thinking that calling a token a "utility token" is a magical legal shield.', 'Not focusing on the expectation of the purchaser.'],
                        whyThisMatters: ['This is the central regulatory battle in crypto. The classification has massive legal and compliance implications.'],
                        followUps: ['Can a token start as a security and later become a utility token (the "Hinman test" theory)?', 'How does airdropping a token instead of selling it affect the analysis?'],
                        redFlags: ['Believes the name "utility token" is all that matters.', 'Does not anchor their analysis in the Howey Test.'],
                        scoringRubric: { 1: 'Is unaware of the distinction.', 3: 'Understands the basic difference but cannot articulate the key factors.', 5: 'Clearly explains the distinction based on purpose and expectation of profit, referencing the Howey Test and the importance of economic reality.' },
                        expectedTime: '240 seconds'
                    }
                ]
            }
        },
        {
            id: 'product-manager-web3',
            role: 'Product Manager, Web3',
            snapshot: 'Defines the what and why of a decentralized product, balancing user needs, technical constraints, and community governance.',
            coreCompetencies: ['User Research', 'Roadmapping', 'Technical Literacy', 'Tokenomics', 'Community Communication', 'Data Analysis'],
            questions: {
                Foundation: [
                    {
                        id: 'PM-F-01',
                        difficulty: 'Foundation',
                        category: 'Strategy',
                        question: 'How is being a Product Manager in Web3 different from Web2?',
                        idealAnswer: {
                            coreIdea: 'The core PM skills are the same, but the context is radically different. The key shifts are from managing users to managing owners, from centralized roadmaps to community governance, and from private data to public on-chain data.',
                            keyPoints: [
                                'Users vs. Owners: Your users are often token holders with a financial stake and a say in governance. This makes the relationship more complex and political.',
                                'Roadmap: You can\'t just set a roadmap. You need to build consensus with the community and often get major features approved via governance proposals.',
                                'Data: You don\'t have access to rich, private user analytics. You must learn to use public on-chain data (e.g., from Dune) to understand user behavior.',
                                'Composability: Your product is an open "money lego." You have to think about how other developers will build on top of your protocol.'
                            ]
                        },
                        commonPitfalls: ['Thinking the job is exactly the same.', 'Not mentioning the role of governance or the community.'],
                        whyThisMatters: ['This is a foundational question to see if the candidate understands the fundamental paradigm shift required to be a PM in Web3.'],
                        followUps: ['Which of these differences excites you the most?', 'Which do you think will be the most challenging for you?'],
                        redFlags: ['Unable to articulate any significant differences.', 'Downplays the importance of the community.'],
                        scoringRubric: { 1: 'Sees no difference.', 3: 'Mentions one difference, like crypto payments.', 5: 'Clearly explains multiple key differences, focusing on ownership, governance, and open data.' },
                        expectedTime: '120 seconds'
                    }
                ],
                Intermediate: [
                    {
                        id: 'PM-I-01',
                        difficulty: 'Intermediate',
                        category: 'Design',
                        question: 'You want to gather user feedback for a new DeFi feature. How would you do it in a world where your users are pseudonymous?',
                        idealAnswer: {
                            coreIdea: 'You have to meet the users where they are and combine qualitative and quantitative methods, while respecting the pseudonymous nature of the community.',
                            keyPoints: [
                                '1. Qualitative (Community):',
                                '   - Governance Forums & Discord: Start a discussion thread in the official channels to get initial feedback on the concept.',
                                '   - Community Calls: Host a community call to present the idea and have a live Q&A session.',
                                '   - User Interviews: Actively recruit engaged community members for 1-on-1 feedback calls. You can offer a small token reward for their time.',
                                '2. Quantitative (On-chain Data):',
                                '   - Wallet Analysis: Analyze the on-chain behavior of your current users. What other protocols do they use? How large are their wallets? This can help you build user personas (e.g., "DeFi Degen", "Retail User").',
                                '   - A/B Testing (with Feature Flags): For larger protocols, you can use feature flags to roll out a new feature to a small subset of users and compare their on-chain behavior to a control group.'
                            ]
                        },
                        commonPitfalls: ['Suggesting traditional methods like email surveys, which don\'t work for pseudonymous users.', 'Only relying on on-chain data and ignoring qualitative feedback.'],
                        whyThisMatters: ['User research is a core PM skill, but it needs to be adapted for the Web3 context.', 'Shows the candidate can think creatively about gathering insights.'],
                        followUps: ['How do you ensure the feedback you get is representative and not just from the loudest voices?', 'How would you build a "user persona" in Web3?'],
                        redFlags: ['Has no idea how to approach user research with pseudonymous users.', 'Suggests methods that violate user privacy.'],
                        scoringRubric: { 1: 'Does not know.', 3: 'Suggests only one method (e.g., "ask in Discord").', 5: 'Proposes a multi-pronged approach combining qualitative community feedback with quantitative on-chain analysis.' },
                        expectedTime: '180 seconds'
                    }
                ],
                Advanced: [
                    {
                        id: 'PM-A-01',
                        difficulty: 'Advanced',
                        category: 'Strategy',
                        question: 'What is a "product moat" in Web3? How do you build a defensible product when your code is open source and can be easily forked?',
                        idealAnswer: {
                            coreIdea: 'In Web3, a product moat is not built on proprietary code, but on intangible assets like liquidity, brand, community, and integrations.',
                            keyPoints: [
                                'The Problem: Anyone can copy your smart contract code (a "fork").',
                                'Building a Moat:',
                                '1. Liquidity: For DeFi protocols, having the deepest liquidity is a powerful moat. Traders will always go where the best prices and lowest slippage are. This creates a network effect.',
                                '2. Community & Brand: A strong, vibrant community and a trusted brand are very difficult to fork. Users are loyal to the community and the brand they trust.',
                                '3. Integrations: Being integrated into many other protocols creates high switching costs. If your stablecoin is the most widely accepted collateral in DeFi, it\'s very hard to displace.',
                                '4. Team & Governance: A world-class team and a robust, fair governance process can be a moat. The community trusts the team to continue innovating and steering the protocol effectively.'
                            ]
                        },
                        commonPitfalls: ['Thinking that a feature is a moat.', 'Not understanding that code can be forked.'],
                        whyThisMatters: ['This is a fundamental strategic question for any Web3 project.', 'It tests the candidate\'s ability to think about long-term competitive advantage in an open-source world.'],
                        followUps: ['Analyze the moat of Uniswap vs. Sushiswap.', 'Is first-mover advantage a strong moat in Web3?'],
                        redFlags: ['Believes that having a better feature is enough to win.', 'Does not understand the power of liquidity as a moat.'],
                        scoringRubric: { 1: 'Does not understand what a moat is.', 3: 'Mentions brand or community but cannot explain the other, more powerful moats.', 5: 'Clearly explains that moats are not based on code and details several key moats like liquidity, brand, and integrations.' },
                        expectedTime: '240 seconds'
                    }
                ],
                Expert: [
                    {
                        id: 'PM-E-01',
                        difficulty: 'Expert',
                        category: 'Design',
                        question: 'You are the PM for a new protocol. You need to launch a governance token. Design the token distribution strategy, considering the team, investors, and the community. Justify your allocation percentages.',
                        idealAnswer: {
                            coreIdea: 'A good token distribution must balance rewarding the core team and early investors with ensuring the majority of the supply goes to the community over time to achieve credible decentralization.',
                            keyPoints: [
                                'Example Allocation:',
                                '- Community/Ecosystem: 50-60% This is the largest and most important bucket. The majority should be reserved for the community, distributed over many years via liquidity mining, grants, and airdrops. This ensures long-term community ownership.',
                                '- Core Team & Advisors: 15-20% This is standard to reward the builders. It MUST be subject to a long vesting schedule (e.g., 4-year vest with a 1-year cliff) to ensure long-term alignment.',
                                '- Investors (Seed, VCs): 15-20% Rewards early backers. Also must be subject to a similar vesting schedule.',
                                '- Foundation/Treasury: 5-10% A portion reserved for a foundation for operational expenses, audits, and legal costs.',
                                'Justification: This structure signals that the project is committed to eventual community ownership, while still providing strong incentives for the team and investors who took the initial risk. The long vesting schedules prevent insiders from dumping on the community early on.'
                            ]
                        },
                        commonPitfalls: ['Giving too large a share to the team/investors.', 'Having no vesting schedule.', 'Not reserving the largest portion for the community.'],
                        whyThisMatters: ['Token distribution is one of the most critical and scrutinized decisions a project makes.', 'It reflects the project\'s values and its commitment to decentralization.'],
                        followUps: ['How would you design an airdrop to reward genuine early users while filtering out sybil attackers?', 'What are the pros and cons of a "fair launch" with no team or investor allocation?'],
                        redFlags: ['Proposes an allocation that is heavily skewed towards insiders.', 'Does not see the importance of vesting schedules.'],
                        scoringRubric: { 1: 'Does not know how to approach this.', 3: 'Provides an allocation but with poor justification or problematic percentages.', 5: 'Designs a well-reasoned allocation with clear justifications for each stakeholder group and strong vesting terms for insiders.' },
                        expectedTime: '300 seconds'
                    }
                ]
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

  
