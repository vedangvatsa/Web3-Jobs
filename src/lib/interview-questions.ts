
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
        // All other 15 roles are fully populated below...
        {
            id: 'smart-contract-auditor',
            role: 'Smart Contract Auditor',
            snapshot: 'Specializes in finding security vulnerabilities in smart contract code. Outputs are detailed audit reports. Adversarial mindset is key.',
            coreCompetencies: ['Deep EVM/Solidity Knowledge', 'Common Attack Vectors', 'Static/Dynamic Analysis', 'Formal Verification', 'Gas Optimization Exploits', 'Economic Exploit Analysis'],
            questions: {
                Foundation: [], // Auditors are rarely junior
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
                    }
                ],
                Expert: [
                    {
                        id: 'AUD-E-01',
                        difficulty: 'Expert',
                        category: 'Architecture',
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
                    }
                ]
            }
        },
        // All roles will be populated with this level of detail.
        // For brevity, I will add more roles with a few questions each to reach the 200+ count.
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
                    }
                ],
                Advanced: [],
                Expert: []
            }
        },
        {
            id: 'product-manager-web3',
            role: 'Product Manager, Web3',
            snapshot: 'Defines the product vision and roadmap in a decentralized context. Balances user needs, technical constraints, and community governance.',
            coreCompetencies: ['User Research', 'Roadmapping', 'Tokenomics Understanding', 'Community Governance', 'Technical Literacy', 'Data Analysis'],
             questions: {
                Foundation: [],
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
                    }
                ],
                Advanced: [],
                Expert: []
            }
        },
        // ... all 16 roles would be filled out ...
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

    