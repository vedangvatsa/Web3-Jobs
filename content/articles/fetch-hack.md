---
title: Same Attacker Drained Fetch.ai Converter and Minted NuNet Tokens in $2M Exploit
ogTitle: "SAME ATTACKER DRAINED FETCH.AI CONVERTER AND MINTED NUNET TOKENS IN $2M EXPLOIT"
description: Security firms tied a Sept. 19 attack on Fetch.ai and NuNet to one wallet, with about 8.7 million FET drained and 408.5 million NTX minted for a combined $2 million in affected assets.
image: /images/news/fetch-hack.jpg
imageCaption: "Server racks in a data room. The Fetch.ai converter drain and NuNet mint were linked to one recipient wallet. Photo: The National Archives (UK) via Wikimedia Commons (CC BY 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:A_view_of_the_server_room_at_The_National_Archives.jpg
category: News
data-ai-hint: server racks in data center
publishedDate: '2026-09-20'
lastUpdated: '2026-09-20'
---

The same attacker hit two AI-focused crypto projects on Sept. 19, draining funds from Fetch.ai and minting new tokens through NuNet in incidents that security firms value at close to $2 million combined, [Coinpedia reported](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/) on Sept. 20.

Blockaid said the attacker drained about $1.56 million worth of FET from a Fetch.ai token converter on Ethereum, [according to one Sept. 20 account](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html) published Sept. 20. The firm identified the exploiter wallet as starting 0x1572 and ending c362, and tied that wallet to both sides of the incident.

The FET transfer emptied the converter in a single call. The attacker used a valid conversion-authorizer signature to call the conversionIn function on TokenConversionManagerV3, which released the converter remaining FET inventory, [the same account states](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html). About 8.7 million FET moved in that step, valued at roughly $1.53 million at the time.

Guavy tied the two legs to that shared wallet in its Sept. 20 writeup. The same wallet that received the stolen funds is what links both attacks to a single actor, and the security team has published the exploiter addresses publicly along with an example transaction, [that writeup states](https://guavy.com/wire/crypto/fetch-ai-and-nunet-hit-with-2m-crypto-heist-5sIDZf6wBk7VfddDPBSjRV). The post adds that other projects and exchanges can use those addresses to flag and block further movement.

Onchain Lens separately flagged the same pattern from transaction data. FET had been drained from the Fetch.ai token converter on Ethereum and the same cluster later received newly minted tokens from the NuNet deployer, [OrangeX noted](https://www.orangex.com/news/articles/fetch-ai-converter-nunet-reported-exploit-fet-ntx) on Sept. 20 in its summary of the two monitoring alerts. Neither monitoring post by itself names the underlying cause of the breach.

The NuNet leg created tokens rather than moving an existing balance. The same wallet that received the Fetch.ai funds then received a large NTX mint from the NuNet deployer account, estimated at roughly $452,000, [Blockaid estimated](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html). A second account of the incident puts the mint at 408.5 million unauthorized NTX tokens worth around $463,000, [that account listed](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/).

Ethereum records fix the amounts and the shared destination with more precision than the early dollar estimates. A successful converter transaction at 20:21:47 UTC on Sept. 19 transferred about 8.72 million FET, [the Blockscout record shows](https://eth.blockscout.com/tx/0xfe12c63b322d52727c615f3342222138d1563400a9880cebb516a9a162ac69e2). A second transaction at 20:50:11 UTC minted about 408.53 million NTX to the same recipient, [the companion record lists](https://eth.blockscout.com/tx/0xe14442f6171d8a652e79d44336e58c00cdab271bdb69c668493d420e03ee13ab). The two transactions landed 28 minutes and 24 seconds apart.

OrangeX calculated the gap from those two timestamps and cautioned that the records establish amounts and destination while attribution rests on the monitoring reports, [its Sept. 20 writeup explains](https://www.orangex.com/news/articles/fetch-ai-converter-nunet-reported-exploit-fet-ntx). PeckShield valued the FET at approximately $1.53 million and the NTX at $462,730 in the same window. The combined activity across the wallet cluster reached approximately $2.01 million.

PeckShield added that the exploiter had since swapped the stolen funds for 546.36 ETH, worth roughly $1.44 million at the time of its post, [one incident report records](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/). One flash summary gave the same swap figure and dollar value in [its Sept. 20 post](https://bingx.com/en/flash-news/post/peckshield-fetch-ai-and-nunet-hit-by-same-attacker-about-m-in-tokens-stolen-and-minted). Those proceeds reflect a later step and are not added on top of the roughly $2 million asset estimate.

Blockaid published the exploiter wallet addresses along with an example transaction so other projects and exchanges could flag and block further movement, [according to that incident report](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/). The disclosure lets venues screen deposits tied to the flagged cluster before the ETH moves again. No exchange freeze had been confirmed in the reports available on Sept. 20.

One flash summary framed the incident as smart-contract and token-minting risk. It noted potential pressure on affected tokens through confidence shocks, forced selling, and heightened scrutiny, and read the NTX slide of about 65 percent as acute short-term stress, [that summary notes](https://bingx.com/en/flash-news/post/peckshield-fetch-ai-and-nunet-hit-by-same-attacker-about-m-in-tokens-stolen-and-minted).

The two token movements carry different accounting effects. The FET transaction moved an existing balance out of the converter, while the NTX transaction created additional tokens, [OrangeX observed](https://www.orangex.com/news/articles/fetch-ai-converter-nunet-reported-exploit-fet-ntx). That split means converter balances and token issuance need separate counts, as do the first valuations and what was later realized through swaps.

NuNet price damage was sharp and immediate. NTX hit an all-time low at $0.000328 on Sept. 20 and changed hands near $0.0004 at press time, down more than 70 percent over 24 hours, [one hosted report documents](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html). One tracker comparison in [another report](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/) puts the NTX crash at 65 to 70 percent, while [a market summary](https://bingx.com/en/flash-news/post/peckshield-fetch-ai-and-nunet-hit-by-same-attacker-about-m-in-tokens-stolen-and-minted) cites a drop of about 65 percent.

FET fell far less over the same period. The token dropped about 5 percent while the wider market sold off, with most major assets lower and total crypto market capitalization down 4 percent, [that hosted report notes](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html). [A second version](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/) records a larger FET slide of around 10 percent. The gap reflects different measurement times across trackers rather than a single agreed print.

September was already costly before this incident. Starknet lending protocol Nostra lost $3.5 million to a manipulated oracle three days earlier, [that same hosted report recalls](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html). DeFiLlama had logged roughly $331 million in losses across 17 incidents this month before the Fetch.ai drain, most of it from the $320 million Liquid Network incident. Fetch.ai and NuNet push the month past $333 million.

As of the Sept. 20 reports, neither Fetch.ai nor NuNet had released an official statement addressing the exploit, [one report stated](https://coinpedia.org/news/hacker-steals-2-million-from-fetch-ai-nunet-in-single-attack/). The scope of the misconfiguration and whether user funds or related contracts remain exposed could not be confirmed from the available posts. Security researchers tracking the case urged holders and active users of tokens from either system to stay cautious until the teams confirm what happened and whether the platforms are safe to use again.

BeInCrypto said it had reached out to Fetch.ai and NuNet for comment, [in that syndicated version](https://finance.yahoo.com/markets/crypto/articles/fetch-ai-nunet-exploited-2-061332635.html).
