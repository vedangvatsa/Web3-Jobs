import urllib.request
import json
import os
from datetime import datetime, timezone

REPO = "/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
CONTENT_DIR = os.path.join(REPO, "content")
OUT_FILE = os.path.join(CONTENT_DIR, "dashboard-metrics.json")

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

# Color palettes
stable_colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#64748b', '#a855f7']
chain_colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
sector_colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b', '#e11d48']
agentic_colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b', '#a855f7']

# 1. Stablecoins from DefiLlama
stables_url = 'https://stablecoins.llama.fi/stablecoins?includePrices=true'
req = urllib.request.Request(stables_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as r:
    stables_raw = json.loads(r.read())

pegged = stables_raw.get('peggedAssets', [])
total_stablecoin_mcap = sum(a.get('circulating', {}).get('peggedUSD', 0) for a in pegged)

top_assets = []
for idx, a in enumerate(pegged[:8]):
    circ = a.get('circulating', {}).get('peggedUSD', 0)
    top_assets.append({
        'name': a.get('name'),
        'symbol': a.get('symbol'),
        'amount': f"${circ/1e9:.2f}B",
        'rawAmount': circ,
        'share': round((circ / total_stablecoin_mcap) * 100, 1),
        'chains': len(a.get('chains', [])),
        'color': stable_colors[idx % len(stable_colors)]
    })

# 2. Chain market share for stablecoins
chains_url = 'https://stablecoins.llama.fi/stablecoinchains'
req = urllib.request.Request(chains_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as r:
    chains_raw = json.loads(r.read())

sorted_chains = sorted(chains_raw, key=lambda x: x.get('totalCirculatingUSD', {}).get('peggedUSD', 0), reverse=True)
top_chains = []
for idx, c in enumerate(sorted_chains[:8]):
    circ = c.get('totalCirculatingUSD', {}).get('peggedUSD', 0)
    top_chains.append({
        'name': c.get('name'),
        'amount': f"${circ/1e9:.2f}B",
        'rawAmount': circ,
        'share': round((circ / total_stablecoin_mcap) * 100, 1),
        'color': chain_colors[idx % len(chain_colors)]
    })

# 3. Overall Chain TVL (Layer 1s & Layer 2s)
tvl_chains = []
try:
    tvl_url = 'https://api.llama.fi/v2/chains'
    req_tvl = urllib.request.Request(tvl_url, headers=headers)
    with urllib.request.urlopen(req_tvl, timeout=15) as r:
        tvl_raw = json.loads(r.read())
    sorted_tvl = sorted(tvl_raw, key=lambda x: x.get('tvl', 0), reverse=True)
    total_tvl = sum(x.get('tvl', 0) for x in sorted_tvl)
    for idx, c in enumerate(sorted_tvl[:8]):
        val = c.get('tvl', 0)
        tvl_chains.append({
            'name': c.get('name'),
            'tokenSymbol': c.get('tokenSymbol') or c.get('name')[:3].upper(),
            'tvl': f"${val/1e9:.2f}B",
            'rawTvl': val,
            'share': round((val / total_tvl) * 100, 1) if total_tvl else 0,
            'color': chain_colors[idx % len(chain_colors)]
        })
except Exception as e:
    print(f"Error fetching TVL chains: {e}")

# 4. Top DEXs 24h Trading Volume
dexs_list = []
total_dex_24h = "$6.37B"
try:
    dex_url = 'https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
    req_dex = urllib.request.Request(dex_url, headers=headers)
    with urllib.request.urlopen(req_dex, timeout=15) as r:
        dex_raw = json.loads(r.read())
    raw_dex_tot = dex_raw.get('total24h', 0)
    if raw_dex_tot:
        total_dex_24h = f"${raw_dex_tot/1e9:.2f}B"
    valid_dexs = [p for p in dex_raw.get('protocols', []) if p.get('total24h') is not None]
    sorted_dexs = sorted(valid_dexs, key=lambda x: x.get('total24h', 0), reverse=True)
    for idx, p in enumerate(sorted_dexs[:6]):
        v24 = p.get('total24h', 0)
        dexs_list.append({
            'name': p.get('name'),
            'volume24h': f"${v24/1e6:.1f}M" if v24 < 1e9 else f"${v24/1e9:.2f}B",
            'raw24h': v24,
            'change_1d': p.get('change_1d'),
            'chains': p.get('chains', [])[:3]
        })
except Exception as e:
    print(f"Error fetching DEXs: {e}")

# 5. Top Protocol Fees & Revenue Generators (24h)
fees_list = []
total_fees_24h = "$62.2M"
try:
    fees_url = 'https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
    req_fees = urllib.request.Request(fees_url, headers=headers)
    with urllib.request.urlopen(req_fees, timeout=15) as r:
        fees_raw = json.loads(r.read())
    raw_fees_tot = fees_raw.get('total24h', 0)
    if raw_fees_tot:
        total_fees_24h = f"${raw_fees_tot/1e6:.1f}M"
    valid_fees = [p for p in fees_raw.get('protocols', []) if p.get('total24h') is not None]
    sorted_fees = sorted(valid_fees, key=lambda x: x.get('total24h', 0), reverse=True)
    for idx, p in enumerate(sorted_fees[:6]):
        f24 = p.get('total24h', 0)
        fees_list.append({
            'name': p.get('name'),
            'category': p.get('category') or 'Protocol',
            'fee24h': f"${f24/1e6:.2f}M" if f24 >= 1e6 else f"${f24/1e3:.1f}k",
            'rawFee': f24,
            'change_1d': p.get('change_1d')
        })
except Exception as e:
    print(f"Error fetching Fees: {e}")

# 6. Web3 DeFi Sector Breakdown
sectors_list = []
try:
    proto_url = 'https://api.llama.fi/protocols'
    req_proto = urllib.request.Request(proto_url, headers=headers)
    with urllib.request.urlopen(req_proto, timeout=15) as r:
        proto_raw = json.loads(r.read())
    cats = {}
    for p in proto_raw:
        c = p.get('category')
        if not c or c in ['CEX', 'Canonical Bridge']:
            continue
        tvl = p.get('tvl', 0) or 0
        cats[c] = cats.get(c, 0) + tvl
    tot_sector_tvl = sum(cats.values())
    sorted_cats = sorted(cats.items(), key=lambda x: x[1], reverse=True)[:6]
    for idx, (cat_name, cat_tvl) in enumerate(sorted_cats):
        sectors_list.append({
            'name': cat_name,
            'tvl': f"${cat_tvl/1e9:.2f}B",
            'rawTvl': cat_tvl,
            'share': round((cat_tvl / tot_sector_tvl) * 100, 1) if tot_sector_tvl else 0,
            'color': sector_colors[idx % len(sector_colors)]
        })
except Exception as e:
    print(f"Error fetching Sectors: {e}")

# 7. Recent Security Incidents / Web3 Exploits
recent_hacks = []
try:
    hacks_url = 'https://api.llama.fi/hacks'
    req_hacks = urllib.request.Request(hacks_url, headers=headers)
    with urllib.request.urlopen(req_hacks, timeout=15) as r:
        hacks_raw = json.loads(r.read())
    sorted_hacks = sorted(hacks_raw, key=lambda x: x.get('date', 0), reverse=True)[:5]
    for h in sorted_hacks:
        amt = h.get('amount', 0)
        dt = datetime.fromtimestamp(h.get('date', 0), timezone.utc).strftime('%b %d, %Y')
        recent_hacks.append({
            'name': h.get('name'),
            'date': dt,
            'amount': f"${amt/1e6:.2f}M" if amt >= 1e6 else f"${amt/1e3:.0f}k",
            'technique': h.get('technique') or 'Smart Contract Exploit',
            'chain': h.get('targetType') or 'Multi-chain'
        })
except Exception as e:
    print(f"Error fetching Hacks: {e}")

# 8. Tokenized Real-World Assets (RWA.xyz benchmark data)
rwa_treasuries = [
    {
        'name': 'BlackRock BUIDL',
        'issuer': 'BlackRock / Securitize',
        'symbol': 'BUIDL',
        'tvl': '$2.85B',
        'share': 19.3,
        'chains': 'Ethereum, Aptos, Arbitrum, Avalanche',
        'yieldApy': '4.65%'
    },
    {
        'name': 'Circle USYC',
        'issuer': 'Circle',
        'symbol': 'USYC',
        'tvl': '$2.42B',
        'share': 16.4,
        'chains': 'Ethereum, Solana',
        'yieldApy': '4.70%'
    },
    {
        'name': 'Franklin OnChain US Gov Money Fund',
        'issuer': 'Franklin Templeton',
        'symbol': 'BENJI',
        'tvl': '$1.86B',
        'share': 12.6,
        'chains': 'Polygon, Stellar, Arbitrum, Aptos',
        'yieldApy': '4.52%'
    },
    {
        'name': 'Ondo Short-Term US Gov Treasuries',
        'issuer': 'Ondo Finance',
        'symbol': 'OUSG',
        'tvl': '$1.35B',
        'share': 9.1,
        'chains': 'Ethereum, Solana, Polygon',
        'yieldApy': '4.60%'
    },
    {
        'name': 'Superstate Short Duration US Gov',
        'issuer': 'Superstate',
        'symbol': 'USTB',
        'tvl': '$780M',
        'share': 5.3,
        'chains': 'Ethereum',
        'yieldApy': '4.58%'
    },
    {
        'name': 'Hashnote US Yield Coin',
        'issuer': 'Hashnote',
        'symbol': 'USYC',
        'tvl': '$610M',
        'share': 4.1,
        'chains': 'Ethereum, Canton',
        'yieldApy': '4.72%'
    }
]

# 9. Visa Onchain Analytics: Agentic Payments Module
# Source: https://visaonchainanalytics.com/agentic-payments
agentic_payments = {
    'totalVolume': '$59.21M',
    'organicVolume': '$35.41M',
    'medianTxnSize': '$0.0100',
    'totalTransactions': '303.66M',
    'buyerWallets': '1.06M',
    'merchantWallets': '398,288',
    'protocolBreakdown': [
        {
            'protocol': 'x402 Protocol',
            'totalVolume': '$58.78M',
            'organicVolume': '$34.98M',
            'transactions': '298.97M',
            'medianTxn': '$0.0100',
            'buyerWallets': '847,039',
            'merchantWallets': '323,126',
            'share': 99.3,
            'color': '#3b82f6'
        },
        {
            'protocol': 'MPP (Machine Payments)',
            'totalVolume': '$432.09k',
            'organicVolume': '$432.09k',
            'transactions': '4.70M',
            'medianTxn': '$0.0100',
            'buyerWallets': '223,686',
            'merchantWallets': '75,748',
            'share': 0.7,
            'color': '#10b981'
        }
    ],
    'serviceCategories': [
        {'name': 'AI Inference (Metered Model APIs)', 'share': 80.8, 'color': '#3b82f6'},
        {'name': 'Gaming (In-Game Autonomous Assets)', 'share': 7.9, 'color': '#8b5cf6'},
        {'name': 'Data & Oracle Feeds', 'share': 6.3, 'color': '#10b981'},
        {'name': 'Payment Routing & Settlement', 'share': 1.9, 'color': '#f59e0b'},
        {'name': 'Image & Media Generation', 'share': 1.4, 'color': '#ec4899'},
        {'name': 'Audio, Video & Infrastructure', 'share': 1.7, 'color': '#64748b'}
    ],
    'summary': 'AI agents autonomously paying for compute, data, and API services via micropayment primitives.'
}

# 10. Visa Onchain Analytics: Stablecoin Lending Module
# Source: https://visaonchainanalytics.com/lending
stablecoin_lending = {
    'totalBorrowed': '$755.14B',
    'totalRepaid': '$733.96B',
    'totalBorrowsCount': '21.39M',
    'avgDailyLoanSize': '$58,269',
    'outstandingLoans': '$16.58B',
    'topProtocols': [
        {'name': 'Aave', 'volume': '$395.8B', 'share': 52.4, 'chains': 'Ethereum, Base, Polygon, Avalanche', 'color': '#8b5cf6'},
        {'name': 'Compound', 'volume': '$55.08B', 'share': 7.3, 'chains': 'Ethereum, Arbitrum, Polygon', 'color': '#00d395'},
        {'name': 'Venus Finance', 'volume': '$41.86B', 'share': 5.5, 'chains': 'BNB Smart Chain', 'color': '#f59e0b'},
        {'name': 'Jupiter', 'volume': '$31.22B', 'share': 4.1, 'chains': 'Solana', 'color': '#3b82f6'},
        {'name': 'Spark (Sky / Maker)', 'volume': '$19.18B', 'share': 2.5, 'chains': 'Ethereum', 'color': '#ec4899'},
        {'name': 'Morpho & Others', 'volume': '$211.99B', 'share': 28.2, 'chains': 'Ethereum, Multi-chain', 'color': '#64748b'}
    ],
    'topStablecoinsBorrowed': [
        {'symbol': 'USDC', 'volume': '$430.4B', 'share': 57.0, 'color': '#2775ca'},
        {'symbol': 'USDT', 'volume': '$279.4B', 'share': 37.0, 'color': '#26a17b'},
        {'symbol': 'PYUSD & Others', 'volume': '$45.3B', 'share': 6.0, 'color': '#64748b'}
    ]
}

# 11. Visa Onchain Analytics: Transactions & Signal-to-Noise Filtering
# Source: https://visaonchainanalytics.com/transactions
transactions_signal = {
    'totalGrossVolume': '$371.97T',
    'adjustedVolume': '$8.96T',
    'totalGrossTransactions': '41.54B',
    'adjustedTransactions': '3.98B',
    'retailAdjustedVolume': '$109.31B',
    'retailAdjustedCount': '2.90B',
    'botFilteredRatio': '97.6%',
    'sub100DollarTransferRatio': '68.2%',
    'topPairsAdjusted': [
        {'pair': 'USDT on Tron', 'volume': '$6.06T', 'txns': '1.37B', 'share': 67.6, 'color': '#ef4444'},
        {'pair': 'USDT on Ethereum', 'volume': '$983.3B', 'txns': '140.6M', 'share': 11.0, 'color': '#6366f1'},
        {'pair': 'USDC on Ethereum', 'volume': '$511.7B', 'txns': '59.9M', 'share': 5.7, 'color': '#3b82f6'},
        {'pair': 'USDT on BSC', 'volume': '$422.1B', 'txns': '951.4M', 'share': 4.7, 'color': '#f59e0b'},
        {'pair': 'USDC on Solana', 'volume': '$357.8B', 'txns': '346.3M', 'share': 4.0, 'color': '#10b981'}
    ]
}

# 12. Assemble complete dataset
data = {
    'updatedAt': datetime.now(timezone.utc).isoformat(),
    'overview': {
        'totalStablecoinMarketCap': f"${total_stablecoin_mcap/1e9:.2f} Billion",
        'tokenizedTreasuriesMarketCap': "$14.80 Billion",
        'visaAdjustedVolume30d': "$1.79 Trillion",
        'activePaymentAddresses30d': "38.4 Million",
        'totalDeFiTvl': f"${sum(c['rawTvl'] for c in tvl_chains)/1e9:.2f}B" if tvl_chains else "$67.7B",
        'dex24hVolume': total_dex_24h,
        'fees24h': total_fees_24h,
        'agenticPaymentsTotalVolume': agentic_payments['totalVolume'],
        'lendingTotalBorrowed': stablecoin_lending['totalBorrowed'],
        'cumulativeAdjustedVolume': transactions_signal['adjustedVolume']
    },
    'topStablecoins': top_assets,
    'topSettlementChains': top_chains,
    'topDeFiChains': tvl_chains,
    'topSectors': sectors_list,
    'topDexs': dexs_list,
    'topFeeGenerators': fees_list,
    'recentHacks': recent_hacks,
    'tokenizedTreasuries': rwa_treasuries,
    'agenticPayments': agentic_payments,
    'stablecoinLending': stablecoin_lending,
    'transactionsSignal': transactions_signal,
    'sources': [
        {'name': 'Visa Onchain Analytics (All Modules)', 'url': 'https://visaonchainanalytics.com/'},
        {'name': 'Visa Agentic Payments Explorer', 'url': 'https://visaonchainanalytics.com/agentic-payments'},
        {'name': 'Visa Stablecoin Lending Tracker', 'url': 'https://visaonchainanalytics.com/lending'},
        {'name': 'RWA.xyz Institutional Tracker', 'url': 'https://app.rwa.xyz/'},
        {'name': 'DefiLlama Stablecoins & TVL', 'url': 'https://defillama.com/stablecoins'},
        {'name': 'DefiLlama DEXs & Protocols', 'url': 'https://defillama.com/dexs'},
        {'name': 'DefiLlama Security Exploits', 'url': 'https://defillama.com/hacks'}
    ]
}

with open(OUT_FILE, 'w') as f:
    json.dump(data, f, indent=2)

print(f"Synced complete multi-source dataset to {OUT_FILE}")
