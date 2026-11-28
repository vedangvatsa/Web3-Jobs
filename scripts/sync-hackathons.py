import urllib.request
import json
import os
import re
from datetime import datetime, timezone

REPO = "/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
CONTENT_DIR = os.path.join(REPO, "content")
OUT_FILE = os.path.join(CONTENT_DIR, "hackathons-runtime.json")
EVENTS_FILE = os.path.join(CONTENT_DIR, "events-runtime.json")

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
hackathons = []
seen_titles = set()

def normalize_title(t):
    return re.sub(r'[^a-z0-9]', '', t.lower())

def is_past_hackathon(period_str):
    if not period_str:
        return False
    s = period_str.strip()
    today = datetime.now(timezone.utc).date()
    
    # Check for past years e.g. 2020-2025
    years = re.findall(r'\b(202[0-5]|201\d)\b', s)
    future_years = re.findall(r'\b(202[6-9]|20[3-9]\d)\b', s)
    if years and not future_years:
        return True

    # Look for range ending in date: e.g. 'Sep 04 - Sep 16, 2026' or 'Nov 05 - Nov 07, 2026'
    parts = s.split('-')
    end_part = parts[-1].strip()
    
    m = re.search(r'([A-Za-z]{3,9})\s+(\d{1,2}),?\s*(\d{4})', end_part)
    if m:
        mon_str, day_str, yr_str = m.groups()
        try:
            dt = datetime.strptime(f'{mon_str[:3]} {day_str} {yr_str}', '%b %d %Y').date()
            return dt < today
        except Exception:
            pass

    m2 = re.search(r'(\d{1,2}),?\s*(\d{4})', end_part)
    if m2:
        day_str, yr_str = m2.groups()
        m_start = re.search(r'([A-Za-z]{3,9})', parts[0])
        if m_start:
            mon_str = m_start.group(1)
            try:
                dt = datetime.strptime(f'{mon_str[:3]} {day_str} {yr_str}', '%b %d %Y').date()
                return dt < today
            except Exception:
                pass

    return False

# 1. Flagship Web3 Ecosystem Hackathons
curated = [
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
        "id": "arbitrum-stylus",
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
        "id": "berachain-pol-buildathon",
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
        "id": "near-chain-signatures",
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
    },
    {
        "id": "polygon-village-hackathon",
        "title": "Polygon Village Builder Grants & Hackathon",
        "organizer": "Polygon Labs",
        "url": "https://polygon.technology/village",
        "prizePool": "$250,000",
        "submissionPeriod": "Rolling Cohorts 2026",
        "location": "Online / Global",
        "ecosystem": "Polygon",
        "format": "Online",
        "description": "Build consumer dApps, DeFi protocols, and AggLayer cross-chain liquidity solutions with Polygon Village grants and technical support.",
        "tags": ["Polygon", "AggLayer", "ZK", "EVM"],
        "featured": True
    },
    {
        "id": "avalanche-summit-hackathon",
        "title": "Avalanche Subnet & L1 Hackathon",
        "organizer": "Ava Labs",
        "url": "https://avax.network",
        "prizePool": "$175,000",
        "submissionPeriod": "2026 Schedule",
        "location": "Hybrid & Online",
        "ecosystem": "Avalanche",
        "format": "Hybrid",
        "description": "Build custom application-specific blockchains using Avalanche Subnets, Teleporter cross-subnet messaging, and high-throughput Avalanche L1s.",
        "tags": ["Avalanche", "Subnets", "Teleporter", "Solidity"],
        "featured": True
    },
    {
        "id": "sui-overflow-hackathon",
        "title": "Sui Overflow Global Hackathon",
        "organizer": "Sui Foundation",
        "url": "https://sui.io",
        "prizePool": "$500,000",
        "submissionPeriod": "Global Virtual Sprint",
        "location": "Online / Global",
        "ecosystem": "Sui",
        "format": "Online",
        "description": "Compete across Move smart contract tracks, DeFi, gaming, infrastructure, and mobile applications built on Sui's object-centric blockchain.",
        "tags": ["Sui", "Move", "Gaming", "DeFi"],
        "featured": True
    },
    {
        "id": "aptos-code-collision",
        "title": "Aptos Code Collision Global Hackathon",
        "organizer": "Aptos Foundation",
        "url": "https://aptosfoundation.org",
        "prizePool": "$500,000",
        "submissionPeriod": "2026 Circuit",
        "location": "Online / Global",
        "ecosystem": "Aptos",
        "format": "Online",
        "description": "Build high-throughput Web3 applications using Aptos Move. Tracks include DeFi, NFTs, Social, Gaming, and Institutional Web3.",
        "tags": ["Aptos", "Move", "Ecosystem", "DeFi"],
        "featured": True
    },
    {
        "id": "filecoin-data-economy",
        "title": "Filecoin & IPFS Decentralized Storage Hackathon",
        "organizer": "Protocol Labs",
        "url": "https://filecoin.io",
        "prizePool": "$100,000",
        "submissionPeriod": "2026 Online",
        "location": "Online / Global",
        "ecosystem": "Filecoin",
        "format": "Online",
        "description": "Build verifiable compute, decentralized storage pipelines, and FVM (Filecoin Virtual Machine) smart contracts.",
        "tags": ["Filecoin", "IPFS", "DePIN", "Storage"],
        "featured": True
    }
]

for h in curated:
    norm = normalize_title(h['title'])
    if norm not in seen_titles:
        seen_titles.add(norm)
        hackathons.append(h)

# 2. Extract hackathons from events-runtime.json
if os.path.exists(EVENTS_FILE):
    try:
        with open(EVENTS_FILE) as f:
            events_data = json.load(f)
        for e in events_data:
            name = (e.get('name') or e.get('title') or '').strip()
            desc = (e.get('description') or '').strip()
            if any(k in name.lower() for k in ['hackathon', 'hack sprint', 'buildathon', 'hacker space']) or \
               'hackathon' in desc.lower()[:300]:
                norm = normalize_title(name)
                if norm and norm not in seen_titles:
                    seen_titles.add(norm)
                    org = e.get('organizer', {}).get('name') if isinstance(e.get('organizer'), dict) else (e.get('organizer') or 'Web3 Host')
                    clean_desc = desc.split('\n')[0].replace('#', '').strip() if desc else f"Web3 developer hackathon hosted by {org}."
                    hackathons.append({
                        "id": f"event-{e.get('slug') or e.get('id')}",
                        "title": name,
                        "organizer": org,
                        "url": e.get('url') or e.get('registrationUrl') or 'https://hashtagweb3.com/events',
                        "prizePool": "Bounties & Prizes" if e.get('price') == 'Free' else (e.get('price') or "Prizes & Grants"),
                        "submissionPeriod": e.get('month') or "Upcoming 2026",
                        "location": e.get('city') or e.get('location') or "Global / Online",
                        "ecosystem": "Multi-Chain",
                        "format": "In-Person" if e.get('city') else "Online",
                        "description": clean_desc[:220],
                        "tags": ["Hackathon", "Web3", e.get('city') or "Global", "Developers"],
                        "featured": False
                    })
    except Exception as e:
        print(f"Error reading events-runtime: {e}")

# 3. Devpost Multi-Page Crawl (Search queries + Pages 1-12)
for p in range(1, 15):
    url = f"https://devpost.com/api/hackathons?page={p}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            items = data.get('hackathons', [])
            if not items:
                break
            for h in items:
                title = h.get('title', '').strip()
                norm = normalize_title(title)
                if not norm or norm in seen_titles:
                    continue
                seen_titles.add(norm)
                clean_prize = re.sub(r'<[^>]+>', '', h.get('prize_amount', '$0')).strip()
                loc = h.get('displayed_location', {}).get('location') or 'Online / Global'
                is_online = (loc.lower() == 'online')
                
                # Check for ecosystem tag
                eco = "Multi-Chain"
                t_lower = title.lower()
                if 'solana' in t_lower: eco = "Solana"
                elif 'ethereum' in t_lower or 'eth' in t_lower: eco = "Ethereum"
                elif 'polygon' in t_lower: eco = "Polygon"
                elif 'ai' in t_lower: eco = "AI x Web3"
                elif 'near' in t_lower: eco = "NEAR"
                elif 'base' in t_lower: eco = "Base"

                hackathons.append({
                    "id": f"devpost-{h.get('id')}",
                    "title": title,
                    "organizer": h.get('organization_name') or 'Devpost Partner',
                    "url": h.get('url'),
                    "prizePool": clean_prize if clean_prize and clean_prize != '$0' else 'Prizes & Grants',
                    "submissionPeriod": h.get('submission_period_dates', '2026 Schedule'),
                    "location": 'Online / Global' if is_online else loc,
                    "ecosystem": eco,
                    "format": "Online" if is_online else "Hybrid / In-Person",
                    "description": f"Global hackathon and developer challenge hosted on Devpost. Compete for {clean_prize} in prizes and ecosystem recognition.",
                    "tags": ["Devpost", eco, "Hackathon", "Developers"],
                    "featured": True if clean_prize and any(k in clean_prize for k in ['100,000', '120,000', '50,000', '250,000']) else False
                })
    except Exception as e:
        print(f"Devpost page {p} error: {e}")
        break

# Filter out past events
hackathons = [h for h in hackathons if not is_past_hackathon(h.get('submissionPeriod', ''))]

with open(OUT_FILE, 'w') as f:
    json.dump(hackathons, f, indent=2)

print(f"Successfully synced {len(hackathons)} hackathons to {OUT_FILE}!")
