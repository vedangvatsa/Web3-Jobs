import urllib.request
import json
import os
import re
from datetime import datetime, timezone

REPO = "/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
CONTENT_DIR = os.path.join(REPO, "content")
OUT_FILE = os.path.join(CONTENT_DIR, "hackathons-runtime.json")

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
hackathons = []

# Curated flagship ecosystem hackathons
curated = [
    {
        "id": "ethglobal-online-2026",
        "title": "ETHGlobal Online 2026",
        "organizer": "ETHGlobal",
        "url": "https://ethglobal.com",
        "prizePool": "$150,000",
        "submissionPeriod": "Sep 04 - Sep 16, 2026",
        "location": "Online / Global",
        "ecosystem": "Ethereum",
        "format": "Online",
        "description": "The premier global virtual Ethereum hackathon bringing together thousands of developers building on EVM, ZK rollups, account abstraction, and decentralized AI.",
        "tags": ["Ethereum", "DeFi", "ZK", "EVM", "AI"],
        "featured": True
    },
    {
        "id": "ethglobal-mumbai-2026",
        "title": "ETHGlobal Mumbai",
        "organizer": "ETHGlobal",
        "url": "https://ethglobal.com",
        "prizePool": "$125,000",
        "submissionPeriod": "Nov 05 - Nov 07, 2026",
        "location": "Mumbai, India",
        "ecosystem": "Ethereum",
        "format": "In-Person",
        "description": "Major flagship in-person ETHGlobal hackathon in Mumbai connecting developers, protocol founders, and ecosystem mentors right around the global Devcon season.",
        "tags": ["Ethereum", "In-Person", "Asia", "Protocols"],
        "featured": True
    },
    {
        "id": "solana-global-radar",
        "title": "Solana Global Radar Hackathon",
        "organizer": "Solana Foundation",
        "url": "https://solana.com",
        "prizePool": "$600,000+",
        "submissionPeriod": "Oct - Nov 2026",
        "location": "Online / Global",
        "ecosystem": "Solana",
        "format": "Online",
        "description": "The world’s largest Solana developer competition with tracks across DeFi, DePIN, Payments, Consumer Apps, Crypto x AI, and Infrastructure.",
        "tags": ["Solana", "Rust", "DePIN", "DeFi", "Payments"],
        "featured": True
    },
    {
        "id": "encode-web3-ai-hackathon",
        "title": "Encode Web3 & AI Hackathon",
        "organizer": "Encode Club",
        "url": "https://www.encodeclub.com",
        "prizePool": "$50,000",
        "submissionPeriod": "Nov - Dec 2026",
        "location": "London & Online",
        "ecosystem": "Multi-Chain",
        "format": "Hybrid",
        "description": "Intensive multi-week hackathon focused on the intersection of autonomous AI agents, on-chain data, and verifiable computing with VC accelerator pathways.",
        "tags": ["AI Agents", "Multi-Chain", "Accelerators", "DeFi"],
        "featured": True
    },
    {
        "id": "chainlink-constellation",
        "title": "Chainlink Constellation Hackathon",
        "organizer": "Chainlink Labs",
        "url": "https://chain.link/hackathon",
        "prizePool": "$350,000",
        "submissionPeriod": "Q4 2026",
        "location": "Online / Global",
        "ecosystem": "Chainlink / Cross-Chain",
        "format": "Online",
        "description": "Global cross-chain hackathon centered on CCIP, Chainlink Data Feeds, Verifiable Random Function, and off-chain compute infrastructure.",
        "tags": ["CCIP", "Oracles", "Cross-Chain", "Smart Contracts"],
        "featured": True
    },
    {
        "id": "base-buildathon",
        "title": "Base Buildathon: Onchain Summer",
        "organizer": "Base (Coinbase)",
        "url": "https://base.org",
        "prizePool": "100 ETH + Grants",
        "submissionPeriod": "Ongoing Rolling Tracks",
        "location": "Online / Global",
        "ecosystem": "Base",
        "format": "Online",
        "description": "Build on Base to bring the next billion users onchain. Tracks include social, gaming, creator tools, DeFi, and developer infrastructure.",
        "tags": ["Base", "Ethereum L2", "Consumer Crypto", "Onchain"],
        "featured": True
    },
    {
        "id": "arbitrum-colosseum",
        "title": "Arbitrum Stylus Hackathon",
        "organizer": "Arbitrum Foundation",
        "url": "https://arbitrum.io",
        "prizePool": "$200,000",
        "submissionPeriod": "Q4 2026",
        "location": "Online / Global",
        "ecosystem": "Arbitrum",
        "format": "Online",
        "description": "Write smart contracts in Rust, C, and C++ alongside Solidity using Arbitrum Stylus for ultra-fast, WASM-powered execution.",
        "tags": ["Arbitrum", "Stylus", "Rust", "WASM", "L2"],
        "featured": True
    },
    {
        "id": "monad-madness",
        "title": "Monad Madness Developer Pitch & Sprint",
        "organizer": "Monad Foundation",
        "url": "https://monad.xyz",
        "prizePool": "$1,000,000 In Prizes & Grants",
        "submissionPeriod": "Rolling 2026",
        "location": "Global City Tours & Online",
        "ecosystem": "Monad",
        "format": "Hybrid",
        "description": "Global pitch competition and technical hack sprint for teams deploying on Monad’s parallelized EVM 10,000 TPS blockchain.",
        "tags": ["Monad", "Parallel EVM", "DeFi", "High-Throughput"],
        "featured": True
    },
    {
        "id": "berachain-boyco",
        "title": "Berachain Proof-of-Liquidity Build Sprint",
        "organizer": "Berachain Foundation",
        "url": "https://berachain.com",
        "prizePool": "$100,000",
        "submissionPeriod": "Mainnet Sprint 2026",
        "location": "Online / Global",
        "ecosystem": "Berachain",
        "format": "Online",
        "description": "Build applications leveraging Proof-of-Liquidity consensus, native bribes, and decentralized liquidity infrastructure.",
        "tags": ["Berachain", "Proof of Liquidity", "DeFi", "EVM"],
        "featured": True
    },
    {
        "id": "near-chain-abstraction",
        "title": "NEAR Chain Abstraction & AI Hackathon",
        "organizer": "NEAR Foundation",
        "url": "https://near.org",
        "prizePool": "$150,000",
        "submissionPeriod": "2026 Season",
        "location": "Online / Global",
        "ecosystem": "NEAR",
        "format": "Online",
        "description": "Build multichain applications with NEAR Chain Signatures, user-owned AI agents, and frictionless chain abstraction.",
        "tags": ["NEAR", "Chain Abstraction", "User-Owned AI", "Rust"],
        "featured": True
    }
]

# Fetch Devpost challenges
for c in ['web3', 'blockchain', 'cryptocurrency']:
    url = f"https://devpost.com/api/hackathons?challenge_type[]={c}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            for h in data.get('hackathons', []):
                clean_prize = re.sub(r'<[^>]+>', '', h.get('prize_amount', '$0')).strip()
                hackathons.append({
                    "id": f"devpost-{h.get('id')}",
                    "title": h.get('title'),
                    "organizer": h.get('organization_name') or 'Devpost Partner',
                    "url": h.get('url'),
                    "prizePool": clean_prize or 'Prizes & Grants',
                    "submissionPeriod": h.get('submission_period_dates', 'Upcoming'),
                    "location": "Online / Global" if h.get('displayed_location', {}).get('location') == 'Online' else (h.get('displayed_location', {}).get('location') or 'Online / Global'),
                    "ecosystem": "Multi-Chain",
                    "format": "Online" if h.get('displayed_location', {}).get('location') == 'Online' else "Hybrid",
                    "description": f"Official Web3 and software development hackathon hosted on Devpost. Compete for {clean_prize} in total rewards and ecosystem grants.",
                    "tags": ["Web3", "Blockchain", "Developers", "Open-Source"],
                    "featured": True if clean_prize and any(k in clean_prize for k in ['100,000', '120,000', '50,000']) else False
                })
    except Exception as e:
        print(f"devpost {c} fetch error: {e}")

seen = set()
final_list = []
for h in curated + hackathons:
    key = h['title'].strip().lower()
    if key not in seen:
        seen.add(key)
        final_list.append(h)

with open(OUT_FILE, 'w') as f:
    json.dump(final_list, f, indent=2)

print(f"Saved {len(final_list)} hackathons to {OUT_FILE}")
