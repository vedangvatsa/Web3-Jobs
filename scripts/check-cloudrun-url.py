import json, time, base64, urllib.request, urllib.parse, subprocess

key = json.load(open('/Users/vedang/Downloads/web3-jobs-aggregator-cdc8cf2ff03c.json'))
open('/tmp/key.pem', 'w').write(key['private_key'])
now = int(time.time())
header = base64.urlsafe_b64encode(json.dumps({'alg':'RS256','typ':'JWT'}).encode()).decode().rstrip('=')
payload = base64.urlsafe_b64encode(json.dumps({
    'iss': key['client_email'],
    'aud': key['token_uri'],
    'iat': now,
    'exp': now + 3600,
    'scope': 'https://www.googleapis.com/auth/cloud-platform'
}).encode()).decode().rstrip('=')

to_sign = f'{header}.{payload}'
open('/tmp/to_sign.txt', 'w').write(to_sign)
sig = subprocess.check_output(['openssl', 'dgst', '-sha256', '-sign', '/tmp/key.pem', '/tmp/to_sign.txt'])
sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip('=')
assertion = f'{to_sign}.{sig_b64}'

data = urllib.parse.urlencode({'grant_type':'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion':assertion}).encode()
req = urllib.request.Request(key['token_uri'], data=data)
res = json.loads(urllib.request.urlopen(req).read())
token = res['access_token']

req2 = urllib.request.Request('https://run.googleapis.com/v1/namespaces/web3-jobs-aggregator/services', headers={'Authorization': f'Bearer {token}'})
try:
    services_res = json.loads(urllib.request.urlopen(req2).read())
    print("\n--- CLOUD RUN SERVICES ---")
    for s in services_res.get('items', []):
        name = s.get('metadata', {}).get('name')
        url = s.get('status', {}).get('url')
        print(f"Service Name: {name} | Live URL: {url}")
except Exception as e:
    print(f"Error fetching Cloud Run services: {e}")
