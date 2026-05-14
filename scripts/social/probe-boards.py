#!/usr/bin/env python3
"""
Probe Greenhouse, Lever, and Ashby APIs for 100+ new Web3 company board slugs.
Only outputs boards that return at least 1 job posting.
"""
import json
import urllib.request
import ssl
import sys

ctx = ssl.create_default_context()

# Candidate boards to test — these are real Web3/crypto companies
# Format: (platform, board_slug, display_name)
CANDIDATES = [
    # --- Greenhouse ---
    ("greenhouse", "chainalysis", "Chainalysis"),
    ("greenhouse", "circleinternetfinancial", "Circle"),
    ("greenhouse", "bitmex", "BitMEX"),
    ("greenhouse", "paxos", "Paxos"),
    ("greenhouse", "traderepublic", "Trade Republic"),
    ("greenhouse", "worldcoin", "World"),
    ("greenhouse", "bitstamp", "Bitstamp"),
    ("greenhouse", "crossmint", "Crossmint"),
    ("greenhouse", "dydx", "dYdX"),
    ("greenhouse", "ethereum", "Ethereum Foundation"),
    ("greenhouse", "eigenlayer", "EigenLayer"),
    ("greenhouse", "halborn", "Halborn"),
    ("greenhouse", "thegraph", "The Graph"),
    ("greenhouse", "talos", "Talos"),
    ("greenhouse", "wintermute", "Wintermute"),
    ("greenhouse", "wormhole", "Wormhole"),
    ("greenhouse", "ankr", "Ankr"),
    ("greenhouse", "celo", "Celo"),
    ("greenhouse", "chainlink", "Chainlink"),
    ("greenhouse", "smartcontractresearch", "Chainlink Labs"),
    ("greenhouse", "consensys", "ConsenSys"),
    ("greenhouse", "filecoin", "Filecoin"),
    ("greenhouse", "hashicorp", "HashiCorp"),
    ("greenhouse", "lukka", "Lukka"),
    ("greenhouse", "mara", "MARA Holdings"),
    ("greenhouse", "marathon", "Marathon Digital"),
    ("greenhouse", "mercurial", "Mercurial"),
    ("greenhouse", "metaplex", "Metaplex"),
    ("greenhouse", "moonbeam", "Moonbeam"),
    ("greenhouse", "sygnum", "Sygnum"),
    ("greenhouse", "thetaedge", "Theta Network"),
    ("greenhouse", "trm", "TRM Labs"),
    ("greenhouse", "wyre", "Wyre"),
    ("greenhouse", "xapo", "Xapo"),
    ("greenhouse", "yuga", "Yuga Labs"),
    ("greenhouse", "yugalabs", "Yuga Labs"),
    ("greenhouse", "spire", "Spire"),
    ("greenhouse", "bakkt", "Bakkt"),
    ("greenhouse", "superlumio", "Superlumio"),
    ("greenhouse", "unstoppable", "Unstoppable Domains"),
    ("greenhouse", "unstoppabledomains", "Unstoppable Domains"),
    ("greenhouse", "fireblocksinc", "Fireblocks"),
    ("greenhouse", "celestia", "Celestia"),
    ("greenhouse", "breeze", "Breeze Cash"),
    ("greenhouse", "moonpay", "MoonPay"),
    ("greenhouse", "m0", "M0"),
    ("greenhouse", "monadfoundation", "Monad"),
    ("greenhouse", "monad", "Monad"),
    ("greenhouse", "kucoin", "KuCoin"),
    ("greenhouse", "htx", "HTX"),
    ("greenhouse", "rabbithole", "RabbitHole"),
    ("greenhouse", "0xproject", "0x"),
    ("greenhouse", "notional", "Notional Finance"),
    ("greenhouse", "synthetix", "Synthetix"),
    ("greenhouse", "aaveLabs", "Aave Labs"),
    ("greenhouse", "lido", "Lido"),
    ("greenhouse", "lidofinance", "Lido"),
    ("greenhouse", "euler", "Euler Finance"),
    ("greenhouse", "pendle", "Pendle"),
    ("greenhouse", "marinade", "Marinade Finance"),
    ("greenhouse", "across", "Across Protocol"),
    ("greenhouse", "acrossprotocol", "Across Protocol"),
    ("greenhouse", "hop", "Hop Protocol"),
    ("greenhouse", "nomic", "Nomic Foundation"),
    ("greenhouse", "nomicfoundation", "Nomic Foundation"),
    # --- Lever ---
    ("lever", "chainalysis", "Chainalysis"),
    ("lever", "circle", "Circle"),
    ("lever", "dydx", "dYdX"),
    ("lever", "worldcoin", "World"),
    ("lever", "wormhole", "Wormhole"),
    ("lever", "trmlabs", "TRM Labs"),
    ("lever", "bitstamp", "Bitstamp"),
    ("lever", "copper", "Copper.co"),
    ("lever", "wintermute", "Wintermute"),
    ("lever", "talos", "Talos"),
    ("lever", "phantom", "Phantom"),
    ("lever", "halborn", "Halborn"),
    ("lever", "lukka", "Lukka"),
    ("lever", "marathondigital", "Marathon Digital"),
    ("lever", "bakkt", "Bakkt"),
    ("lever", "chainstack", "Chainstack"),
    ("lever", "thegraph", "The Graph"),
    ("lever", "mantle", "Mantle"),
    ("lever", "zkSync", "zkSync"),
    ("lever", "matterLabs", "Matter Labs (zkSync)"),
    ("lever", "boba", "Boba Network"),
    ("lever", "loopring", "Loopring"),
    ("lever", "xapo", "Xapo"),
    ("lever", "ancient8", "Ancient8"),
    ("lever", "douro", "Douro Labs"),
    ("lever", "fermah", "Fermah"),
    ("lever", "lightcone", "Lightcone"),
    ("lever", "massive", "Massive"),
    ("lever", "magicblock", "MagicBlock"),
    ("lever", "noiselab", "Noise Labs"),
    ("lever", "passes", "Passes"),
    ("lever", "perena", "Perena"),
    ("lever", "walrus", "Walrus"),
    ("lever", "trueanomaly", "True Anomaly"),
    ("lever", "ooble", "Ooble Studio"),
    # --- Ashby ---
    ("ashby", "Chainalysis", "Chainalysis"),
    ("ashby", "circle", "Circle"),
    ("ashby", "dydx", "dYdX"),
    ("ashby", "worldcoin", "World"),
    ("ashby", "World", "World"),
    ("ashby", "wormhole", "Wormhole"),
    ("ashby", "Wintermute", "Wintermute"),
    ("ashby", "Talos", "Talos"),
    ("ashby", "TRMLabs", "TRM Labs"),
    ("ashby", "trmlabs", "TRM Labs"),
    ("ashby", "halborn", "Halborn"),
    ("ashby", "Mantle", "Mantle"),
    ("ashby", "Matter-Labs", "Matter Labs (zkSync)"),
    ("ashby", "unstoppabledomains", "Unstoppable Domains"),
    ("ashby", "celestia-labs", "Celestia"),
    ("ashby", "M0", "M0"),
    ("ashby", "m0", "M0"),
    ("ashby", "monad", "Monad"),
    ("ashby", "Monad", "Monad"),
    ("ashby", "fermah", "Fermah"),
    ("ashby", "lightcone", "Lightcone"),
    ("ashby", "perena", "Perena"),
    ("ashby", "walrus", "Walrus"),
    ("ashby", "magicblock", "MagicBlock"),
    ("ashby", "Ancient8", "Ancient8"),
    ("ashby", "chainstack", "Chainstack"),
    ("ashby", "douro-labs", "Douro Labs"),
    ("ashby", "breeze", "Breeze Cash"),
    ("ashby", "passes", "Passes"),
    ("ashby", "xapo", "Xapo"),
    ("ashby", "noise", "Noise Labs"),
    ("ashby", "massive", "Massive"),
    ("ashby", "ooble", "Ooble Studio"),
    ("ashby", "YugaLabs", "Yuga Labs"),
    ("ashby", "Bakkt", "Bakkt"),
    ("ashby", "Lido", "Lido"),
    ("ashby", "Pendle", "Pendle"),
    ("ashby", "Across", "Across Protocol"),
    ("ashby", "NomicFoundation", "Nomic Foundation"),
    ("ashby", "EulerFinance", "Euler Finance"),
]

def check_greenhouse(slug):
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=false"
    req = urllib.request.Request(url, headers={"User-Agent": "Web3Jobs/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            data = json.loads(resp.read().decode())
            return len(data.get("jobs", []))
    except:
        return -1

def check_lever(slug):
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Web3Jobs/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            data = json.loads(resp.read().decode())
            return len(data)
    except:
        return -1

def check_ashby(slug):
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "Web3Jobs/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            data = json.loads(resp.read().decode())
            return len(data.get("jobs", []))
    except:
        return -1

checkers = {
    "greenhouse": check_greenhouse,
    "lever": check_lever,
    "ashby": check_ashby,
}

results = []
for platform, slug, name in CANDIDATES:
    count = checkers[platform](slug)
    if count > 0:
        results.append((platform, slug, name, count))
        print(f"  ✅ {platform}/{slug} ({name}): {count} jobs", flush=True)
    elif count == 0:
        print(f"  ⬚  {platform}/{slug} ({name}): 0 jobs (exists but empty)", flush=True)
    else:
        pass  # silently skip failures

print(f"\n=== FOUND {len(results)} ACTIVE BOARDS ===")
for platform, slug, name, count in sorted(results, key=lambda x: -x[3]):
    print(f"  {platform:12s}  {slug:30s}  {name:30s}  {count} jobs")

# Output as JSON for easy import
with open("scripts/social/new-boards.json", "w") as f:
    json.dump(results, f, indent=2)
