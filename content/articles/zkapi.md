---
title: Ethereum Foundation launches zkAPI private metered credits on mainnet
ogTitle: "ETHEREUM FOUNDATION LAUNCHES ZKAPI PRIVATE METERED CREDITS ON MAINNET"
description: The Ethereum Foundation said on Oct. 1, 2026 that zkAPI, a zero-knowledge system for paying metered APIs without linking requests to payer identity, is live on Ethereum mainnet.
image: /images/news/zkapi.jpg
imageCaption: "Ethereum price chart. Photo: Wikideas1 via Wikimedia Commons (CC BY 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Ethereum%20price.webp
category: News
data-ai-hint: ethereum price chart
publishedDate: '2026-10-05'
lastUpdated: '2026-10-05'
---

The Ethereum Foundation [announced on Oct. 1](https://blog.ethereum.org/2026/10/01/introducing-zkapi) that zkAPI, a system for paying metered APIs without linking requests to payer identity, is live on Ethereum mainnet. The design was co-authored by Davide Crapis and Vitalik Buterin, and the Open Anonymity Project built the client, server and contracts with the Foundation.

A user makes one deposit, in ETH or USDC, into the vault contract at 0x4386fdbda35d995beb3bf8625118ec5982ec81fe. That single on-chain transaction funds a private balance, and later API spending draws on it through proofs instead of an account. ForkLog [described the launch](https://forklog.com/en/ethereum-foundation-launches-zkapi-for-private-ai-payments/) on Oct. 2 as a way to buy model calls and other metered service without attaching a lasting identity to each request.

The balance exists as a private note recorded among commitments in a Merkle tree 32 levels deep. Proofs use Groth16 on the BN254 curve, with Poseidon hashing the commitments and nullifiers, and the server checks each spend proof off chain. Every spend publishes a nullifier, a one-way serial derived from the note secret, so a repeated spend of the same balance shows up as a duplicate.

When the proof checks out, the post says, the server mints a fresh API key that is short-lived and capped in dollars. The key lives only in the memory of the device, and prompts travel straight from the device to the AI provider under it. After expiry the provider side records metered use in a signed receipt, and the server deducts the actual usage rather than the reserved cap.

That split divides what each party can see. The payment server learns that a valid payment exists and the dollar total per session, never the identity or the content. The model provider sees prompts and responses, since it runs the inference, but not who paid. Public chain observers see deposits, closes and withdrawals without learning what any balance paid for.

Two routes lead out of a prepaid balance. In a mutual close the wallet presents a server signature authorizing the withdrawal, and the vault pays the remainder to a destination bound into the proof. The escape withdrawal needs no such clearance, and instead parks the note as a pending payout subject to a challenge window of 86,400 seconds, or 24 hours. CryptoSlate [examined both paths](https://cryptoslate.com/vitalik-inspired-ai-payment-system-can-send-expired-deposits-to-its-treasury/) in its Oct. 4 analysis of the withdrawal rules.

A challenge, the analysis explains, replays an original request proof carrying the same nullifier as the attempted exit. A valid challenge submitted before the deadline cancels the pending payout and restores the note to the active set without imposing a separate monetary fine. The mechanism guards settlement against exits from states that already authorized service, while the accuracy of the metered bill stays a separate question.

Notes expire. The mainnet manifest sets a 30-day note lifetime, rounded upward to a day boundary in code, and an active note past expiry becomes eligible for a treasury claim of its full recorded deposit. A note already sitting in pending-withdrawal status does not qualify for that active-note claim. For prepaid users the practical effect is a deadline on completing an exit from a usable balance.

The vault owner holds a pause switch with defined limits. While paused, deposits, mutual closes and new escape initiations are blocked. Finalization of pending escapes, challenges and expiry claims carry no such gate, so a user who already started an escape stands differently from one who still needs to start it. No use of the pause has been established.

The local client speaks the standard OpenAI and Ollama interfaces from the user's own machine, so existing apps point at localhost. A simpler proxy mode relays requests through the server, though the relay then sees traffic.

AI chat and agents come first because prompts often carry health, money and personal material. Beyond them the team names blockchain RPC queries, image and video jobs, VPN and bandwidth time, and machine-to-machine task spend as services the same contracts can front. ForkLog [listed the same set](https://forklog.com/en/ethereum-foundation-launches-zkapi-for-private-ai-payments/) while noting that providers keep their pricing, rate limits and infrastructure.

Privacy has stated edges. The provider still sees request contents and network metadata such as IP address, and sessions can link through timing, repeated personal details, writing style or reused documents. The developers point users toward a VPN or Tor with a fresh circuit per session for the network side. Content privacy needs its own layer, such as local or confidential-compute models.

Under the native billing documents, an ETH deposit is accounted in whole gwei rather than converted to stable value. Dollar-priced inference settles through a pinned Chainlink ETH to dollar round bound into the authorization, and the accepted rate stays fixed through settlement and recovery.

The manifest points at Groth16 artifacts whose documentation says one party generated the keys, with no multiparty ceremony held to date. Matching hashes establish which files are in use, while destruction of the setup secrets stays a separate trust premise. The manifest calls the integration experimental and not production-audited.
