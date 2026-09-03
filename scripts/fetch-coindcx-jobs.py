import urllib.request, json, re, os

url = 'https://careers.coindcx.com/opportunities/openings'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

bid_match = re.search(r'"buildId":"([^"]+)"', html)
bid = bid_match.group(1) if bid_match else 'GQbDBQVMYIBrxA3ondjW4'

data_url = f'https://careers.coindcx.com/_next/data/{bid}/opportunities/openings.json'
req_data = urllib.request.Request(
    data_url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'x-nextjs-data': '1'
    }
)
with urllib.request.urlopen(req_data) as resp:
    data = json.loads(resp.read().decode('utf-8'))

raw_jobs = data['pageProps']['initialNextHireState']['careersJobsList']

cache_path = os.path.join(os.getcwd(), 'content/jobs-cache.json')
with open(cache_path, 'r') as f:
    cache_data = json.load(f)

non_coindcx = [j for j in cache_data if j.get('company', '').lower() != 'coindcx']
ingested = []

for j in raw_jobs:
    req_id = j.get('requisitionId')
    if not req_id: continue
    title = j.get('requisitionTitle') or 'Role at CoinDCX'
    dept = j.get('orgUnitName') or 'CoinDCX'
    locs = j.get('officeLocationNames') or []
    loc_str = ', '.join(locs) if locs else 'Bangalore, India'
    job_link = f'https://careers.coindcx.com/opportunities/openings?jobId={req_id}'
    
    role_word = title.lower().replace('senior', '').replace('lead', '').replace('manager', '').strip().split()[0] if title else 'job'
    slug = f'coindcx{req_id}'
    
    ingested.append({
        'id': f'coindcx-{req_id}',
        'title': title,
        'company': 'CoinDCX',
        'location': loc_str,
        'type': 'Full-time',
        'date': '2026-09-03',
        'source': 'CoinDCX Official Portal [coindcx]',
        'link': job_link,
        'applyUrl': job_link,
        'department': dept,
        'skills': ['Web3', 'Crypto', 'Exchange', 'Fintech', 'Trading'],
        'slug': slug
    })

updated = ingested + non_coindcx
with open(cache_path, 'w') as f:
    json.dump(updated, f, indent=2)

print(f'✓ [CoinDCX Official Portal]: Ingested {len(ingested)} official job openings from https://careers.coindcx.com/opportunities/openings!')