---
title: 'Creating Dynamic NFTs'
image: >-
  https://images.unsplash.com/photo-1639221314358-2291fb903405?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxuZnR8ZW58MHx8fHwxNzU0OTQ5Njc2fDA&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: creating dynamic nfts step guide
description: >-
  Go beyond static JPEGs. This guide explores the world of Dynamic NFTs (dNFTs)
  and shows you how to create NFTs that can change and evolve based on.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---
The first generation of NFTs was commonly presented as a static image, video, or collectible. That description is incomplete. An NFT is a token with ownership rules and, often, a pointer to metadata. Under the ERC-721 metadata extension, `tokenURI(tokenId)` returns a URI for a token and that URI may point to a JSON document containing a name, description, image, and other fields [ERC-721](https://eips.ethereum.org/EIPS/eip-721). The image is only one part of the experience.

A dynamic [NFT](/what-are-nfts), often called a dNFT, is an NFT whose displayed metadata, attributes, or application behavior can change according to defined rules. The token ID does not become a different token when its state changes. What changes is the answer a contract gives through `tokenURI`, the JSON found at that URI, or the way an application interprets on-chain state. That distinction needs to be clear before you promise that an NFT will "evolve."

Dynamic behavior can be useful for games, credentials, memberships, event participation, or an artwork with defined states. It can also confuse holders if the update rules, operator permissions, and history are hidden. The design problem is not merely how to change an image. It is how to state what may change, who can cause the change, which data source is trusted, and how marketplaces and applications learn that a new version exists.

### Differences Between Static and Dynamic NFTs

The useful contrast is not "on-chain equals dynamic" and "IPFS equals static." Both simplifications are wrong. A contract can return a fixed IPFS URI forever. A contract can return a URI based on on-chain state. A server can serve altered JSON at the same HTTPS address. Each choice gives owners a different guarantee.

| Feature | Static NFT | Dynamic NFT |
| --- | --- | --- |
| Metadata behavior | The metadata URI and the content it resolves to are intended to stay fixed. | The contract or metadata service is designed to return different metadata after a valid state change. |
| Source of change | No planned update path after minting. | Defined rules, such as a game action, a governance decision, a verified event, or an authorized administrator. |
| Holder expectation | The media and attributes are presented as a stable record. | Holders should be able to inspect the conditions, permissions, and past updates. |
| Example design | A single artwork with a permanent metadata file. | A game character whose level and equipment change after recorded gameplay events. |

Metadata is normally JSON. OpenSea, for example, reads an ERC-721 token's metadata from the URI returned by `tokenURI`; the metadata controls the name, media, description, and displayed traits [OpenSea Docs](https://docs.opensea.io/docs/metadata-standards). That is why a change to the JSON can alter what a marketplace displays even though the ownership record on the [blockchain](/what-is-a-blockchain) remains the same.

Storage changes the promise you make. IPFS content identifiers, or CIDs, are derived from content. IPFS explains that any change to content produces a different CID, while the same content added with the same settings produces the same CID [IPFS Docs](https://docs.ipfs.tech/concepts/content-addressing/). If a token points directly to `ipfs://.../sunny.json`, changing the JSON requires a new CID and usually a new URI or a directory arrangement that the contract can select from. That makes version changes visible. An HTTPS URL can keep the same address while returning new content, which may be appropriate for a dynamic design but gives the operator greater control.

Before writing code, decide whether change is part of the value proposition. A membership badge that updates after verified attendance has a clear reason to be dynamic. A collectible sold as an archival artwork may not. Do not add a mutable metadata path merely because it is technically possible. A permanent feature and an administrator-controlled feature make different promises to a buyer.

### The Role of Blockchain Oracles

A smart contract cannot directly call a normal web API to ask for today's weather, a sports score, or a device reading. Ethereum documentation explains that smart contracts cannot access off-chain information by default; an oracle supplies external information through an on-chain component and off-chain infrastructure [ethereum.org](https://ethereum.org/en/developers/docs/oracles/). A dNFT that responds to the physical world therefore needs a defined bridge between the data source and contract state.

An oracle is not a truth machine. It introduces a source, an operator model, an update cadence, a failure mode, and a cost. Ethereum's oracle documentation calls out correctness, availability, and incentives as separate concerns [ethereum.org](https://ethereum.org/en/developers/docs/oracles/). For a dNFT, turn those concerns into explicit product decisions:

- Which source is authoritative for the event?
- Is the update a one-time result, a periodic feed, or a user-triggered request?
- What happens when the source is late, unavailable, or returns an unexpected value?
- Can the state move backward, or is it monotonic?
- Who can retry an update, pause it, or correct a source error?
- What history can a holder inspect to see why an attribute changed?

For some use cases, an oracle is unnecessary. A game character can level up based on actions already recorded by the contract. A ticket can change state after an event organizer signs an approved on-chain transaction. A membership can change after a vote in the same protocol. Use off-chain data only when the state genuinely depends on something outside the chain.

Do not copy legacy provider tutorials without checking their current status. Chainlink's current documentation says that Chainlink Functions sunset on June 30, 2026, and directs builders to its newer runtime environment [Chainlink Docs](https://docs.chain.link/chainlink-functions). The general lesson applies to any provider: validate supported networks, billing, service limits, update mechanisms, and maintenance status before building a token around it.

### Real-World Design Examples

The following are design patterns, not claims about deployed products. They show the rule that makes the NFT dynamic.

- **Living avatar:** An avatar can have a set of visual states, such as rainy, cold, or clear weather. The contract must define the geographic input, the weather source, the update frequency, the fallback state, and whether the owner can choose the location. A vague promise that an avatar follows "your weather" leaves too many unanswered questions.
- **Sports collectible:** A collectible can show verified statistics after a completed game. The project needs a licensed and authoritative data source, a rule for corrections, and a decision about whether a later stat correction changes the token. A score update is easy to imagine; the data rights and correction policy are the harder parts.
- **Property record interface:** An NFT can reference documents or maintenance status for a physical asset, but the NFT itself does not prove legal ownership of the property. Any project that represents a real-world right must explain the legal agreement, the registry that governs the right, and the role of the token holder. Metadata alone cannot create that connection.
- **RPG character:** A character can gain attributes, equipment, or art states after gameplay events. This is often the cleanest dynamic design because the game rules can be enforced on-chain or the trusted game operator can have narrowly defined permissions. State how transfers affect progress and whether the owner can take the character to another application.

The best example is small enough to audit. Start with three states and one reason to move between them. A weather collectible with Sunny, Cloudy, and Rainy states is easier to test than a character with hundreds of traits and several external feeds. You can add complexity after you have proved the update path, metadata rendering, and access controls.

### Workflow for Building a Dynamic NFT

Creating a dNFT combines NFT implementation, state design, metadata management, and sometimes an oracle or automation service. Work through the following sequence before minting a public collection.

#### 1. Define possible states and the state transition rules

List every state the token may reach. For a weather design, that may be `Sunny`, `Cloudy`, and `Rainy`. For a game item, it might be `LevelOne`, `LevelTwo`, and `LevelThree`. For each transition, write the trigger, the required input, who submits it, the expected result, and whether reversal is allowed.

Keep state compact. Instead of storing the text "Rainy" in every token, a contract can store a small enum or numeric value and map it to a metadata URI. The contract should reject inputs outside the allowed range. If all tokens share one global state, store it once. If each token has an independent state, map the token ID to its state. These are design choices with different gas and product consequences.

Write a plain-language policy alongside the technical design. Tell holders whether states can change after transfer, whether an administrator can intervene, whether the project can end updates, and what happens if the external source stops. This text should agree with the code. If it cannot, reduce the claim.

#### 2. Prepare media and metadata

Create the images, animations, and JSON for each state. Give each metadata file a stable, readable name and test that every `image` URI resolves. Include the fields your target application expects. OpenSea's documentation provides a minimal JSON example with `name`, `description`, and `image`, and explains that traits are read from token metadata [OpenSea Docs](https://docs.opensea.io/docs/metadata-standards).

Use content-addressed storage when you want a state asset to be verifiable. Upload each approved state file, record the resulting CID, and keep a local manifest that links the state name to its CID. Do not treat an IPFS gateway URL as the identifier. The CID identifies the content; a gateway is one way to retrieve it.

If the collection must support corrections or future art, publish a version policy. You might permit a corrected metadata file only through a new URI and an on-chain event. You might reserve an HTTPS metadata service for operational status. What you should not do is quietly replace an asset that buyers were led to believe was fixed.

#### 3. Build the contract around `tokenURI`

Use a current, tested ERC-721 implementation as the starting point. OpenZeppelin provides ERC-721 contracts with the core and metadata extensions, and its API describes `tokenURI` as the function that returns the URI for a token [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/5.x/api/token/erc721). Your contract can override `tokenURI` to choose a URI from the current state.

The basic shape is straightforward:

```solidity
enum Weather { Sunny, Cloudy, Rainy }

mapping(uint256 tokenId => Weather) private weatherOf;
mapping(Weather state => string uri) private metadataFor;

function tokenURI(uint256 tokenId) public view override returns (string memory) {
    _requireOwned(tokenId);
    return metadataFor[weatherOf[tokenId]];
}
```

Production code needs more than this sketch. Add minting rules, an authorized update path, emitted events, input validation, and tests. Decide whether a single update changes every token or only a token selected by the verified event. Make sure the `tokenURI` result is a view into state, rather than a value that a backend must separately remember to change.

#### 4. Restrict update authority

The update function is the most sensitive part of the contract. It decides who can alter the holder's displayed asset or its utility. A simple prototype might give one owner account permission to call `setWeather`. A production design often needs narrower roles, a multisignature owner, a delay, or a contract that accepts validated oracle responses.

OpenZeppelin documents `Ownable` for single-administrator control and `AccessControl` for separate roles such as a minter or moderator [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/5.x/access-control). Use the least privilege that fits the design. An account allowed to submit a weather update should not automatically gain the ability to mint unlimited tokens, change the whole metadata registry, or transfer ownership. Document the privileged addresses and publish a way for holders to see changes to those permissions.

#### 5. Connect and test the trigger

For off-chain data, configure the oracle or provider using its current documentation, then test the full sequence on a supported test network: request, off-chain retrieval, returned response, validation, state update, event emission, and metadata refresh. Test failed requests, stale data, duplicate callbacks, malformed values, unauthorized calls, and a source that reports a value outside your supported states.

If updates are scheduled, decide who pays for the transaction and what happens when the balance is insufficient. If updates are user-triggered, guard against a user causing repeated paid requests. A contract cannot update itself without a transaction; an externally owned account, another contract, or an automation service must call the relevant function [ethereum.org](https://ethereum.org/en/developers/docs/oracles/).

#### 6. Signal metadata changes and test display behavior

Returning a new URI does not guarantee that every marketplace immediately refreshes its cache. ERC-4906 defines optional `MetadataUpdate` and `BatchMetadataUpdate` events so third parties can detect that token JSON metadata changed [ERC-4906](https://eips.ethereum.org/EIPS/eip-4906). Implement the extension when it suits your collection, emit the event at the point of change, and still test your target wallet and marketplace behavior.

OpenSea likewise instructs creators to emit the relevant event when metadata changes [OpenSea Docs](https://docs.opensea.io/docs/metadata-standards). Check the contract on an explorer, resolve the metadata URI directly, inspect the JSON, and confirm that the display updates in the applications your holders use. Record the test process before launch so the team can diagnose the first live update.

### Challenges in Building Dynamic NFTs

Dynamic NFTs have more moving parts than a fixed metadata collection. Every state transition can create a transaction cost. Each additional oracle, server, administrator, or indexer creates a dependency. Each mutable parameter creates a question about holder expectations. The engineering task is to keep those dependencies explicit and limited.

- **Cost:** On-chain state changes consume gas. Frequent per-token updates may be impractical for a large collection. Consider whether an application can render a live view from a signed or indexed data source, whether only milestones need on-chain updates, or whether a lower-cost network meets the product requirements. Explain the tradeoff to holders.
- **Data quality:** The contract will follow the data it receives. A wrong or unavailable source can produce a wrong or stale state. Ethereum's oracle guidance identifies both correctness and availability as oracle risks [ethereum.org](https://ethereum.org/en/developers/docs/oracles/). Define a fallback state and an incident process before the first failed update.
- **Centralization:** An administrator who can replace metadata or set any state has meaningful power over the asset. State that power plainly. Limit it with roles, multisignature control, delays, or a documented plan to remove the privilege when appropriate.
- **Interoperability:** Different wallets and marketplaces may cache data differently or ignore optional extensions. Design a useful application experience without assuming every third party will render every trait, event, or media type immediately.
- **Security:** An update function, callback, or external data parser is attack surface. Test access control, input ranges, repeated requests, and failure paths. Have an independent reviewer examine code that controls valuable assets before a public launch.

### Understanding Dynamic NFTs as a Builder

A dynamic NFT is a compact exercise in [Web3](/what-is-web3) product design: smart-contract state, data sources, access control, metadata standards, user communication, and operations meet in one asset. The useful skill is not memorizing a provider's tutorial. It is being able to explain the full rule set to a holder, implement the rule set with clear permissions, and test what happens when the outside world does not behave as expected.

That skill applies beyond NFTs. The same questions appear in token-gated memberships, on-chain games, credentials, and any application that combines a smart contract with off-chain information. Build the smallest changing asset that proves the design, then make each later feature earn its complexity.
