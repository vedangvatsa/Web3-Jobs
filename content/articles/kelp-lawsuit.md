---
title: KelpDAO Sues LayerZero Over $292M Bridge Exploit
ogTitle: "KELPDAO SUES LAYERZERO OVER $292M BRIDGE EXPLOIT"
description: Evercrest Technologies, the company behind KelpDAO, filed suit in British Columbia against LayerZero and its CEO over the April rsETH bridge exploit.
image: /images/news/kelp-lawsuit.jpg
imageCaption: "The British Columbia Supreme Court building in Vancouver. Photo: Roy Luck via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Sloping%20green%20roof%2C%20BC%20Supreme%20Court%20Building%20(5945882501).jpg
category: News
data-ai-hint: BC Supreme Court building Vancouver
publishedDate: '2026-09-27'
lastUpdated: '2026-09-27'
---

Evercrest Technologies, the company behind KelpDAO, has sued LayerZero Labs, its Canadian affiliate and chief executive Bryan Pellegrino in British Columbia over the April exploit that drained 116,500 rsETH, worth about $292 million, from Kelp's bridge. KelpDAO announced the filing on Thursday, and the notice of civil claim landed in the Supreme Court of British Columbia, [CoinDesk wrote](https://www.coindesk.com/business/2026/09/25/kelpdao-sues-layerzero-for-the-largest-exploit-2026-has-seen-so-far).

The filing alleges negligent misrepresentation, negligence and defamation, and seeks aggravated and punitive damages on top of ordinary damages. Evercrest says Kelp users have withdrawn more than $650 million since the attack, [CryptoSlate reported](https://cryptoslate.com/nearly-15-billion-is-moving-off-layerzero-now-a-292-million-lawsuit-puts-its-security-model-on-trial/).

"The exploit was a direct result of LayerZero's failures, including a failure to disclose weaknesses and risks inherent in LayerZero's own technology," KelpDAO said in [its statement](https://www.coindesk.com/business/2026/09/25/kelpdao-sues-layerzero-for-the-largest-exploit-2026-has-seen-so-far). The protocol also accused LayerZero of failing to stop attackers from getting inside its security systems, then shifting the blame after the money was gone. "Rather than take responsibility, over the last few months, LayerZero and Mr. Pellegrino publicly blamed us for their failures," the statement said.

Pellegrino answered within hours. "Evercrest (KelpDAO) filed a notice of civil claim today in BC against myself and LZ," he [wrote](https://www.coindesk.com/business/2026/09/25/kelpdao-sues-layerzero-for-the-largest-exploit-2026-has-seen-so-far). "The claim continues to be meritless. I will meet them in Vancouver and defend myself accordingly."

The two sides agree on the shape of the attack but not on who owns the failure. On April 18, intruders tricked LayerZero's verifier into approving a forged cross-chain transfer, [according to CryptoSlate](https://cryptoslate.com/nearly-15-billion-is-moving-off-layerzero-now-a-292-million-lawsuit-puts-its-security-model-on-trial/). LayerZero's incident report traces the intrusion to March, when a developer was socially engineered into cloning a malicious GitHub repository. The attackers then reached LayerZero's RPC environment, poisoned two internal nodes and knocked an external RPC provider offline, so the verifier signed a message built on false source-chain data.

That forged message opened Kelp's bridge. Because Kelp's bridge needed approval from a single verifier, LayerZero's own, one signature was enough to release 116,500 rsETH. The on-chain check worked as designed, since the signature was valid and simply attested to false information.

LayerZero's report divides the fault along those lines. It assigns the choice of how many verifiers to require to the application, and the compromised RPC layer to LayerZero as its operator. The report is the company's own account, not a court finding.

Evercrest's claim targets what happened before the hack. The company alleges LayerZero reviewed and approved the single-verifier setup in writing, including telling Kelp in February 2024 there was "no problem" with a default configuration. The suit further alleges LayerZero warned another developer, USDT0, about risks in default verifier setups while withholding a comparable warning from Kelp. Those allegations have yet to be tested in court.

LayerZero's version puts the configuration choice on Kelp. Its account says the application had previously used a two-of-two setup and moved to one-of-one, [the CryptoSlate account notes](https://cryptoslate.com/nearly-15-billion-is-moving-off-layerzero-now-a-292-million-lawsuit-puts-its-security-model-on-trial/). A court will now have to weigh the written-approval claims against that history.

Since the attack, LayerZero has changed the defaults at issue. Its verifier now refuses to sign on any channel where it is the only required signer, and the company requires multiple independent RPC sources across providers and geographies. By Aug. 4, it had moved default pathways on both versions of its endpoint to a minimum of three verifiers, while applications can still build custom setups at the protocol level. In May, the company had already said letting its own verifier act alone on high-value transfers was a mistake, and it maintained the incident touched about 0.14 percent of the applications on its network.

Customers moved faster than the courts. By Aug. 4, projects tied to roughly $14.5 billion in assets had announced moves from LayerZero to Chainlink's CCIP, nearly 50 times the amount stolen. BitGo accounted for the largest share, with WBTC making up about $7.4 billion of the tally, and it named CCIP its exclusive cross-chain provider for WBTC and the default for future BitGo-issued assets. Mantle, Kelp's rsETH and Lombard added billions more, and Chainlink puts the total near $15 billion. Kelp says its own migration remains underway, so announced value and completed transfers are separate measures.

Wyoming's Stable Token Commission went further than an announcement. It fully moved its FRNT state-issued token off LayerZero in August and signed a multi-year deal making CCIP its exclusive cross-chain provider. Commission CISO Keith Lawhorn said Sept. 14 that the review began because of the Kelp attack and found problems with access controls, private key management and incident disclosures, findings LayerZero has partly disputed.

The fallout spread well beyond the bridge. The exploit forced Aave, the largest decentralized lending pool, to borrow $300 million to meet withdrawal demand, and days later about $20 billion in total value locked had been erased, [CoinDesk noted](https://www.coindesk.com/business/2026/09/25/kelpdao-sues-layerzero-for-the-largest-exploit-2026-has-seen-so-far). KelpDAO said it has since moved to protect user assets, including migrating rsETH's bridge to a more secure cross-chain standard. "But we also need to correct the record, and hold LayerZero and Mr. Pellegrino accountable for the harm they have caused us and the broader DeFi ecosystem," the protocol said. LayerZero remains a large network, spanning 96 chains with $9.5 billion in bridged volume over the past 30 days, according to DefiLlama figures [in the report](https://cryptoslate.com/nearly-15-billion-is-moving-off-layerzero-now-a-292-million-lawsuit-puts-its-security-model-on-trial/).
