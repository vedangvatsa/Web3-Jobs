---
title: Tether says 15 mining firms back its MDK automation layer for Bitcoin mines
ogTitle: "TETHER SAYS 15 MINING FIRMS BACK ITS MDK AUTOMATION LAYER FOR BITCOIN MINES"
description: Tether announced Oct. 24 that 15 mining operators, ASIC manufacturers and pools committed to build integrations with its open-source Mining Development Kit, aimed at making mining fleets controllable by shared software and AI agents.
image: /images/news/tethermdk.jpg
imageCaption: "An Avalon ASIC Bitcoin mining machine. Photo: Zhang Nangeng via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Avalon-An_ASIC_base_bitcoin_machine.jpg
category: News
data-ai-hint: ASIC Bitcoin miner
publishedDate: '2026-10-26'
lastUpdated: '2026-10-26'
---

Fifteen Bitcoin mining companies, ASIC manufacturers and mining pools have committed to build and maintain integrations with Tether's Mining Development Kit, the company said in an [announcement dated Oct. 24](https://tether.io/news/tethers-mdk-gains-broad-industry-backing-to-accelerate-the-next-generation-of-bitcoin-mining-automation/). The MDK is an open-source framework that gives mining hardware, pools and applications a common interface, so software written once can reach machines from different vendors.

The commitment list includes Bitdeer, Bitmain, Canaan, MicroBT, Foundry Digital, Luxor Technology, F2Pool, OCEAN, Proto (Block, Inc.), SpiderPool, EMCD, Heatbit, Elektron Energy, ACME Swisstech and Stratum V2. Each participant will build and maintain an MDK Worker, a translation layer that exposes the functions it chooses through the kit's shared interface. Companies keep control of their own systems and do not have to replace existing technology, the announcement said.

Tether CEO Paolo Ardoino framed the problem as one of machines speaking incompatible languages. "We are entering a period where software will increasingly operate physical infrastructure, not simply report on it," he said in the [announcement](https://tether.io/news/tethers-mdk-gains-broad-industry-backing-to-accelerate-the-next-generation-of-bitcoin-mining-automation/). "That does not work at scale if every machine speaks a different language. Mining is one of the clearest examples of this problem today."

A large mining site can run thousands of machines from multiple manufacturers, connected to different pools and managed through separate software. Tether's pitch is that once a common layer exists, developers can build monitoring tools or AI agents against MDK instead of engineering a new integration for every manufacturer. Tether said its QVAC mining agent already operates on MDK as an early demonstration. The announcement gives no participating-fleet capacity, share of Bitcoin hashrate or measured savings.

[CryptoSlate's Oct. 25 report](https://cryptoslate.com/paolo-ardoino-wants-ai-to-run-bitcoin-mines-who-gets-permission-to-act/) examined what the kit's reference code actually allows. The v0.11 example agent can reboot a named device or change its power mode among low, normal, high and sleep, and it pauses for human approval before executing those write actions. The Gateway plugin documents a default two-minute approval window, with an unanswered request resolving to rejection. Site operators must still establish who among their staff is entitled to approve a command, the report noted.

The same CryptoSlate review found differences between the tagged v0.11 release and newer code on the main branch. In the v0.11 tag, a Worker's network command interface dispatches requests without checking the caller's key, so network reachability and site controls become the practical boundary. At a later main-branch snapshot, Workers require admitted caller keys unless an explicit allowAll setting is enabled. With those checks active, revoking a key restricts later requests but does not establish that work already sent to a machine is cancelled.

The permission question runs through the reference code in detail. The v0.11 action tool accepts one named device and offers two operations, reboot or change power mode, with the handler checking which modes a device supports before sending the command. The tool is classified as a write, so the agent's execution loop emits a pending-approval event and pauses before invoking it; a rejection prevents the call. The Gateway agent plugin documents a default two-minute approval window, with an unanswered request resolving to rejection. The plugin binds sessions and approvals to the identity that created them, but when no user identity is supplied, requests fall back to a shared local operator, and an approval pause in that configuration does not distinguish one person from another. A mine that wants named accountability must therefore wire its own identity checks into the approval surface.

The same report noted that the v0.11 security policy handles fixes on a best-effort basis for the latest main commit, and that older commits or tagged releases may not receive them. A changelog labelled v0.12 describes Kernel roles for reading, writing and administration, opt-in MCP write tools, and declared verification of device state, changes that operators only get by updating. Release authority stays with the project: the governance document gives the core team final authority over releases, with a Lead Maintainer holding technical authority over merges and release planning and a Community Manager controlling strategic direction and the roadmap. An integration commitment does not grant a participant any say over what ships next.

MDK will reach version 0.11 at the Plan B Forum in Lugano on Oct. 23 and 24, with a first stable 1.0 release targeted by the end of 2026, Tether said. The kit is open source now, so manufacturers, pools and developers can begin testing integrations and building Workers before 1.0 ships. Tether said the initial 15 commitments are an early step and that the kit remains open to any manufacturer, pool, operator or developer.
