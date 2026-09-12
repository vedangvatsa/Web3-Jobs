---
title: Decentralized Social Graphs and Online Identity
image: /images/andrea-de-santis-zwd435-ewb4-unsplash.jpg
data-ai-hint: portable social identity and open social protocols
description: >-
  How open social protocols separate accounts, relationships, data, clients,
  storage, and moderation, with Farcaster, Lens, and AT Protocol examples.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

A social graph is the record of relationships and activity that makes a social product useful. It can include an account profile, follows, posts, replies, reactions, blocks, groups, lists, and reputation signals. In a conventional social network, one company usually controls the account system, data store, ranking, moderation tools, developer API, and client application. Leaving that company may mean leaving the audience and history built there.

An open social protocol separates some of those layers. It gives accounts and social records a format that more than one application can read or write. A person might use one client for a public feed, another for communities, and a third for creation tools without starting from zero each time. That is the practical promise. It is narrower than "users own social media" and more useful than a slogan.

Portability is a property that has to be inspected. Can an account be recovered? Can a person move providers? Are follows and posts represented in a public or exportable format? Can a different client write those records? Are media files included? What does an app still control: discovery, notifications, ranking, ads, moderation, or a proprietary feature set? A protocol can make an account portable while leaving much of the experience in the hands of individual apps.

## The layers that get confused

Start by separating six layers. The identity layer answers which account controls an action. The social-data layer holds records such as posts and follows. The storage and replication layer decides where those records live and how they spread. The client layer turns records into a feed, profile, or message composer. The discovery layer provides search, recommendations, and ranking. The moderation layer labels, filters, reports, and removes harmful material in a given context.

Centralized networks often bundle all six. The bundle can produce a smooth product because one organization can change the database, client, and rules at once. It also makes the organization the gatekeeper for API access, account recovery, and data export. An open protocol unbundles some of that control. It does not make the hard layers disappear.

For example, a protocol may let anyone read public follow records, but a new client still needs an index to answer "who should I show next?" It may let a person keep an account identifier, but a mobile client still needs push notifications. It may make posts available to several applications, while each application has its own rules for abuse, adult content, harassment, or illegal material. A graph alone is not a complete social product.

The term "decentralized" also covers different architectures. A blockchain-based account registry, a federation of independently run servers, and a peer-to-peer content network all distribute control differently. They should not be judged as if they make the same tradeoffs. The useful questions are who can modify a record, who can censor or hide it, who bears storage cost, how a person recovers access, and which organizations users must trust.

## Identity is not the whole graph

An account identifier gives a social action an author. It does not carry a following by itself. The following is a separate record. Posts, reactions, profiles, and blocks are separate records too. This sounds obvious, but it explains why changing a profile picture on one app does not prove that all social context has moved with you.

A portable social identity needs stable control and a recovery path. A portable social graph also needs durable, interpretable records and a way for other software to sync them. A portable audience then depends on whether other clients recognize the same relationship semantics. If one app treats a follow as a subscription, another treats it as a friend request, and a third ignores it, the data may travel while the product behavior does not.

Public data creates a privacy tradeoff. A graph that many clients can index can also make it easier for third parties to collect and correlate activity. A person who reuses one account across work, politics, fandom, and financial activity gives observers a convenient link between those contexts. Separate accounts, limited public metadata, and careful disclosure help, but none is automatic. Open access to data is not the same thing as privacy.

## Farcaster uses a hybrid design

Farcaster is an example of a protocol that puts a limited set of account actions onchain and most social activity offchain. Its [architecture documentation](https://docs.farcaster.xyz/learn/architecture/overview) says accounts, storage rent, and connected-app keys use contracts on OP Mainnet, while public messages, follows, reactions, and profile updates are handled on its offchain Snapchain network. The split is deliberate: identity and authorization require stronger consistency, while frequent social writes need lower cost and faster handling.

An account receives a Farcaster ID, or FID, when its owner creates it through the protocol's account contracts. The [account documentation](https://docs.farcaster.xyz/learn/what-is-farcaster/accounts) says an account can add separate keys for apps and can set a recovery address. Those features matter more than a profile NFT story. App-specific keys let a user grant one client authority to write messages without handing it the same key that controls account ownership. A recovery address is an explicit trust choice rather than a hidden support-process decision.

Farcaster accounts interact by signing messages. The protocol's [message documentation](https://docs.farcaster.xyz/learn/what-is-farcaster/messages) lists casts, reactions, links such as follows, profile data, and verifications as message types. These messages are replicated through the network. A client can therefore build a profile or feed from the same underlying account and link records another client uses.

That does not mean all data lasts forever. Farcaster requires an account to acquire storage, and its documentation describes limits and pruning when capacity is exceeded or expires. Storage policy is an important reality check. A social protocol has to decide who pays for data that millions of people may want to read. Permanent public storage is expensive. Cheap ephemeral storage may make old work disappear. Neither outcome is neutral for creators or developers.

Farcaster's hybrid design also leaves visible points of trust. Users rely on smart-contract behavior for account and key management, on the protocol network for message availability, and on client applications for discovery and moderation. An app can still hide an account from its own feed, revoke an app-specific key, or decide not to support a particular feature. A portable account does not force every client to distribute every message.

## Lens provides onchain social primitives

Lens takes another approach. Its [current documentation](https://lens.xyz/docs) describes Lens Chain as an Ethereum layer 2 stack with a social protocol and storage nodes. The protocol exposes onchain building blocks for groups, feeds, graphs, and usernames. Its rules system lets developers define how those primitives interact, including access and monetization behavior.

The design emphasis is composability. If a graph, group, or feed is represented through shared protocol primitives, different applications can build on the same state rather than negotiating a private API with a dominant social network. A client can offer a new interface or a focused community without asking people to recreate every relationship inside that client.

Onchain state has costs. Every record written to a chain has execution, storage, and indexing consequences. Lens uses storage nodes alongside the chain, which shows that "onchain" is not a complete storage answer. Builders need to know which fields are authoritative on the chain, which live in protocol storage, how media is addressed, and what happens if an indexer or storage provider is unavailable. The marketing word "composable" does not answer those operational questions.

Custom rules can give communities useful control. A group could require a credential, a membership payment, an invite, or a reputation condition before someone posts. A creator could choose how a feed accepts submissions. But rule flexibility can also create fragmentation. A client needs to explain which rules apply, which transactions a user is approving, and who can alter those rules. A social graph that is technically open but impossible to understand is not a strong user-rights model.

Farcaster and Lens both involve blockchain systems, but the comparison should stop at the mechanisms. They use different account, storage, and social-data choices. Do not repeat older descriptions that say Farcaster keeps all social data in its prior Hub architecture or that Lens makes every social action an NFT on Polygon. Protocols change. Read the current documentation and inspect the specific records your product needs before selecting either stack.

## Open social does not require a blockchain

The AT Protocol shows another route. Its [protocol specification](https://atproto.com/specs/atp) defines an open social-web protocol with self-authenticating data and identity, personal data servers, relays, and application-specific services. An account is rooted in a DID, while a human-readable handle can change. Public content is stored in cryptographically verifiable repositories. Applications interoperate by reading and writing records that follow published Lexicon schemas.

AT Protocol separates a person's data host from the client and from the network-wide services that aggregate or search data. The specification says personal data servers host accounts, manage repositories and key material, and proxy client requests. Relays collect records from many hosts. Application-view services can provide features such as search and feeds. This makes a useful point: moving account hosting is different from eliminating operators. There are still services to run, and their behavior matters.

The protocol does not impose one universal model for follows, avatars, or other social conventions. Applications define those through schemas. That flexibility lets developers add features without waiting for a central API owner. It also means interoperability depends on adopting the same schemas. A record can be publicly available and still have no meaning to a client that does not support its type.

This is why "open protocol" should not be used as shorthand for a political or technical outcome. It describes an interface and a data model. The outcome depends on whether independent implementations exist, whether users can move, whether documentation is stable, and whether service operators use their discretion fairly.

## Moderation remains local and necessary

Open social systems cannot avoid moderation by moving records outside one company database. Someone still decides what appears in a feed, what triggers an account warning, how reports are handled, and how illegal content is addressed. A protocol may preserve a signed record while a client refuses to show it. That is not a contradiction. It is a boundary between data availability and editorial responsibility.

AT Protocol makes this separation explicit. Its specification defines labels as separately signed metadata that can be used for moderation and badging. A client can subscribe to labelers, apply its own filters, or offer users choices. This can create a broader range of moderation approaches than one global rulebook. It can also create incompatible safety expectations. A person may be protected in one client and exposed in another.

Builders should publish their moderation scope. Say whether the application merely renders protocol data, operates a report queue, applies labels from third parties, blocks known abuse, removes content from search, or bans users from its own services. Give users tools to block, mute, filter, and report. Preserve evidence and an appeal path where your policy or law requires it. "The protocol is neutral" is not an adequate safety plan for a product that ranks, recommends, or sends notifications.

Spam is another systems problem. Open write access can make automated posting cheap. Rate limits, account costs, proof of human review, reputation signals, storage fees, and client-side filtering each impose a different burden. Farcaster's account storage requirement is one example of a protocol-level economic constraint. A community client may use additional filters. The right combination depends on who the community serves and how much friction it can accept.

## What developers should verify

Choose a social protocol by working through the user journey, not by comparing logos. Create an account. Add a second client. Revoke a client key. Recover the account. Export or migrate the records. Post with an attachment. Follow and unfollow a test account. Block it. Delete a post. Let storage expire in a test environment if the protocol permits it. Then inspect what each client actually does.

Document the answers to practical questions. Who controls the root account? Can an app write only through delegated keys? What is the recovery process and its delay? Which records are public? What data is pruned? What is the cost model? How does a new client obtain an index? Can content be deleted from the canonical store, or only hidden? Which moderation signals does the client consume? What happens if a service provider disappears?

For users, the plain version is enough: you may be able to change apps without losing the identifier and some relationships, but you still need to protect account keys and choose applications whose safety and privacy policies you accept. For builders, the responsibility is larger. Portability requires careful record formats, recovery, storage, indexing, permission design, and honest disclosure of the parts that remain centralized. That is the work that turns an open social graph into something people can rely on.
