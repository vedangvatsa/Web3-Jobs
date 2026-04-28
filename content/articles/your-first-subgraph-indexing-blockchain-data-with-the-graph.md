---

title: "Your First Subgraph: Indexing Blockchain Data with The Graph"
image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZGF0YXxlbnwwfHx8fDE3NTUwMzYzNzV8MA&lib=rb-4.0.3"
description: "Learn how to build a subgraph using The Graph Protocol. This guide provides a step-by-step tutorial on how to index smart contract data and serve it via a."
category: "Getting Started"

publishedDate: "2026-03-11"
lastUpdated: "2026-04-28"
---

Building a decentralized application (dApp) requires two key components: smart contracts, which serve as the on-chain backend, and a user interface, which functions as the off-chain frontend. A significant hurdle for dApp developers is retrieving data from the [blockchain](/what-is-a-blockchain) for display on the frontend. Accessing data directly from a [smart contract](/what-are-smart-contracts) can be slow and inefficient, presenting a challenge for development.

**The Graph** addresses this issue. It is a decentralized protocol designed for indexing and querying blockchain data. With The Graph, developers can specify the data they need from smart contracts, outline how to process this data, and retrieve it efficiently via a **GraphQL API**.

Understanding how to build a "subgraph" is essential for any full-stack [Web3](/what-is-web3) developer. This article outlines the step-by-step process for creating a subgraph.

### The Need for Subgraphs

When displaying a list of all the [NFTs](/what-are-nfts) owned by a user, accessing this information directly from the blockchain can be cumbersome. The process involves:

1. Searching through every `Transfer` event emitted by your NFT contract.
2. Filtering for events where the user is the recipient.
3. Tracking any NFTs the user has transferred away.
4. Compiling the list of tokens they currently own.

This method is slow and complicated on the client-side. A subgraph performs all these operations server-side and offers a straightforward API to retrieve the necessary data, such as "all NFTs owned by this address."

### Core Components of a Subgraph

A subgraph project consists of three primary files:

1. **Subgraph Manifest (`subgraph.yaml`):** This configuration file informs The Graph which smart contracts to monitor (the `dataSource`), which events to track, and which functions (referred to as "handlers") to execute in response to those events.

2. **Schema (`schema.graphql`):** This GraphQL schema file defines the data structure to store and query. For instance, an `NFT` entity may have properties like `id`, `owner`, and `tokenURI`.

3. **Mappings (`src/mapping.ts`):** This code transforms blockchain data into the defined entities within the schema. Written in AssemblyScript (a subset of TypeScript), you create a "handler" function for each event of interest. When The Graph detects an event, it executes your handler function, which processes the event data, creates or updates entities, and stores them in the database.

### Step-by-Step Guide to Building a Simple Subgraph

To illustrate, we will build a subgraph for a basic ERC-721 NFT contract.

**Prerequisites:** Ensure Node.js and npm are installed. Install The Graph CLI globally using the following command:

```bash
npm install -g @graphprotocol/graph-cli
```

**Step 1: Initialize the Subgraph**

The Graph CLI can create a new subgraph from an existing contract address. Locate an NFT contract on a testnet, such as Sepolia Etherscan, and retrieve its address.

```bash
graph init --from-contract <CONTRACT_ADDRESS> --network sepolia my-nft-subgraph
```

The CLI will analyze the contract and generate a basic template for the three core files based on the contract's events.

**Step 2: Define Your Schema (`schema.graphql`)**

Next, define the data you wish to save. For tracking each NFT and its current owner, use the following schema:

```graphql
type Token @entity {
  id: ID! # The token ID
  tokenURI: String!
  owner: User!
}

type User @entity {
  id: ID! # The user's address
  tokens: [Token!]! @derivedFrom(field: "owner")
}
```

- The `@entity` directive indicates that `Token` and `User` will be treated as top-level data entities.
- The `@derivedFrom` directive establishes a relationship, linking the `tokens` field of the `User` entity to the `owner` field of the `Token` entity.

**Step 3: Write the Mapping Logic (`src/mapping.ts`)**

After initializing, the CLI will create a boilerplate handler function for the `Transfer` event. Complete the function as follows:

```typescript
import { Transfer as TransferEvent } from "../generated/MyNFT/MyNFT";
import { Token, User } from "../generated/schema";

export function handleTransfer(event: TransferEvent): void {
  // Find or create the User (the recipient of the NFT)
  let to = User.load(event.params.to.toHex());
  if (!to) {
    to = new User(event.params.to.toHex());
    to.save();
  }
  
  // Find or create the Token
  let tokenId = event.params.tokenId.toString();
  let token = Token.load(tokenId);
  if (!token) {
    token = new Token(tokenId);
    // Optionally call the contract to get the tokenURI
    // let contract = MyNFT.bind(event.address)
    // token.tokenURI = contract.tokenURI(event.params.tokenId)
    token.tokenURI = "/placeholder.json"; // Placeholder for simplicity
  }
  
  // Update the owner of the token
  token.owner = to.id;
  token.save();
}
```

This function activates with each `Transfer` event. It creates a `User` entity for the new owner if it does not exist, creates a `Token` entity if it's the first instance of this token, and updates the token's `owner` field to reflect the new user.

**Step 4: Deploy the Subgraph**

1. **Authenticate:** Use the command:
   ```bash
   graph auth --studio <YOUR_DEPLOY_KEY>
   ```
2. **Codegen & Build:** Execute:
   ```bash
   graph codegen && graph build
   ```
3. **Deploy:** Run:
   ```bash
   graph deploy --studio <SUBGRAPH_NAME>
   ```

Upon deployment to The Graph's hosted service (the "Subgraph Studio"), it will begin indexing data from your selected contract. After syncing, you’ll have a GraphQL endpoint that your dApp can use to query NFT and owner data efficiently.

Building subgraphs is a fundamental step toward becoming a full-stack Web3 developer. It bridges your on-chain logic with the off-chain user experience, enabling the development of fast, data-rich decentralized applications.

### The Web3 Opportunity

The Web3 sector is growing rapidly, with demand for qualified talent significantly outpacing supply. Compared to traditional tech, Web3 offers advantages such as higher compensation, equity opportunities, fully remote roles, and the chance to reshape technology.

### Market Context

The [Web3 job](/web3-jobs-for-beginners) market operates under dynamics distinct from Web2, influenced by the decentralized nature of blockchain organizations and a persistent global talent shortage.

| Role                      | Average Salary Range      | Total Compensation Range       |
|---------------------------|---------------------------|--------------------------------|
| Senior Solidity Engineer   | Significant value         | Significant value               |
| Product Manager            | Significant value         | Significant value               |
| Business Development Lead   | Significant value         | Significant value               |

**Compensation:** Web3 roles typically command higher pay than equivalent Web2 positions. Senior Solidity engineers often see total compensation that reflects significant value, while product managers and business development leads earn compensation within a significant range. Many compensation packages include token allocations alongside traditional equity.

**Remote-First Culture:** Most Web3 organizations operate fully or primarily remote, with teams spread across multiple time zones. This structure creates opportunities for talent in regions traditionally underserved by tech hiring, such as Southeast Asia, Latin America, and Africa.

**Growth Trajectory:** Career advancement occurs more rapidly in Web3 due to swift company scaling and a continuous talent shortage. Mid-level professionals often achieve senior or lead positions within a relatively short timeframe of entering the sector.

**Equity Upside:** Token and equity packages are common, providing significant wealth-building potential for early team members in successful protocols.

### Step-by-Step Transition Strategy

#### Step 1: Build a Web3 Knowledge Foundation

Allow 4-8 weeks to learn the fundamentals of blockchain technology, including:

- How blockchain functions
- Various blockchain architectures
- Smart contracts and their applications
- Key concepts such as [DeFi](/what-is-defi), NFTs, and [DAOs](/what-is-a-dao)
- The current Web3 ecosystem and its key players

#### Step 2: Acquire Relevant Skills

Tailor your skill acquisition to your desired role:

- **Engineers:** Focus on learning [Solidity](/best-programming-languages-for-blockchain-development), JavaScript/TypeScript, and Web3 libraries (ethers.js, web3.js).
- **Product Managers:** Understand token economics, protocol governance, and strategies for user growth in Web3.
- **Business Development:** Gain skills in market analysis, partnership strategy, and navigating the regulatory space.
- **Community/Operations:** Develop skills in community building, Discord management, and governance.

#### Step 3: Build Your Portfolio

Create tangible evidence of your Web3 capabilities by:

- Contributing to open-source projects in the Web3 space.
- Developing a small dApp or smart contract.
- Writing articles on Web3 topics on platforms like Medium or Twitter.
- Getting involved in DAOs or community projects.
- Participating in hackathons.

#### Step 4: Network in Web3

Engagement in the Web3 community is easily accessible:

- Join Discord channels of projects that interest you.
- Attend Web3 conferences (Consensus, Devcon, ETHDenver).
- Engage with Web3 builders and thought leaders on Twitter/X.
- Participate in governance discussions.
- Attend local Web3 meetups.

#### Step 5: Apply Strategically

Target roles that use your existing expertise combined with your new Web3 knowledge:

- If you are a backend engineer, seek blockchain infrastructure roles.
- If you are a product manager, look for protocol product roles.
- If you are in sales or business development, consider Web3 business development roles.

### Web3-Specific Challenges

**Volatility Risk:** The inherent volatility of the crypto market can affect job stability, particularly at early-stage startups with limited runway. Professionals entering Web3 should maintain a reserve of 6-12 months’ living expenses, negotiate base salaries in fiat currency instead of tokens, and aim to join projects with established revenue models or significant treasury backing.

**Regulatory Uncertainty:** The regulatory framework for blockchain companies continues to evolve across major jurisdictions. It is essential to verify that the team has competent legal counsel and is proactively engaging with regulators instead of operating in legal grey areas.

**Due Diligence:** Not every Web3 project is legitimate. Conduct thorough research on the founding team's history, review audit reports for smart contracts, verify treasury holdings on-chain, and communicate with current or former team members before accepting any offers.

**Learning Curve:** The technical learning curve can be steep for non-developers new to blockchain concepts. However, the Web3 community is generally open and supportive, offering active Discord channels, free educational resources, and mentorship programs across major protocols.

## FAQ

**Q: Do I need to be a blockchain expert to work in Web3?**  
A: No. The Web3 ecosystem requires more than just engineers. Positions in marketing, community management, product design, legal, and operations are also in high demand. Existing skills in these areas can transition smoothly to Web3 with the addition of blockchain context, such as understanding wallets, DAOs, and the importance of decentralization.

**Q: How much can I earn in Web3?**  
A: Compensation in Web3 typically exceeds Web2 counterparts. Base salaries average higher, with roles like Solidity engineers and smart contract auditors commanding significant premiums due to scarcity of talent. Total compensation packages often consist of signing bonuses, equity in early-stage protocols, and potential token allocations that may appreciate. Senior engineers at well-funded protocols can earn significant value.

**Q: Is it risky to transition to Web3?**  
A: Every career change carries inherent risks, and Web3 is no exception due to market volatility and variable project lifecycles. You can mitigate this risk by targeting well-funded, established protocols with proven revenue rather than speculative early-stage ventures. Ensure your base salary is in fiat currency to reduce exposure to token price fluctuations. Professionals who view Web3 as a sustainable career move rather than a quick profit opportunity tend to build lasting roles.

**Q: How long does the transition take?**  
A: Most professionals can achieve a meaningful transition to Web3 within 2-6 months of focused effort. Engineers and product managers generally transition faster due to the direct applicability of their core skills. Non-technical roles, such as marketing and community management, can transition within 4-8 weeks with dedicated self-study. Actively engaging with the community, such as through portfolio projects or open-source contributions, significantly accelerates the process.

**Q: What if the crypto market crashes?**  
A: Historically, bear markets have provided prime opportunities to enter the Web3 sector. As speculative hype diminishes, teams refocus on building substantial products, prioritizing the acquisition of talent over token valuations. Infrastructure firms, security companies, and developer tooling providers continue hiring regardless of market conditions. Engineers who contributed during past bear markets are among the most sought-after professionals today. A downturn can reduce competition for roles and lead to better equity terms for new hires.

## Key Takeaways

- Web3 offers substantial compensation premiums, accelerated career growth, and the chance to contribute to transformative technology across various industries.
- Most professionals can transition to Web3 within 2-6 months of concentrated effort, with engineers and product managers typically moving the fastest due to the direct applicability of their skills.
- Your existing domain expertise holds significant value in Web3. Focus on augmenting your knowledge with blockchain-specific context, including wallets, smart contracts, tokenomics, and DAOs.
- Networking through Discord communities and engaging on Twitter, along with showcasing visible portfolio projects on platforms like GitHub, consistently outperforms formal certifications when seeking Web3 roles.
- Join well-funded, established protocols with proven revenue streams to navigate the volatility risk associated with the sector. Negotiate base salaries in fiat currency to further mitigate risk.
- The Web3 community remains remarkably open and supportive, providing access to mentorship programs, educational resources, and active developer networks across all major protocols. 

By approaching your career transition into Web3 with a strategic mindset and using your existing skills, you can thrive in this rapidly evolving industry.
