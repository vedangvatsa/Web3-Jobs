import json, time, base64, urllib.request, urllib.parse, subprocess, sys

key_path = '/Users/vedang/Downloads/web3-jobs-aggregator-cdc8cf2ff03c.json'
try:
    key = json.load(open(key_path))
except Exception as e:
    print(f"Error loading key file: {e}")
    sys.exit(1)

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

req2 = urllib.request.Request('https://cloudbuild.googleapis.com/v1/projects/web3-jobs-aggregator/builds?pageSize=5', headers={'Authorization': f'Bearer {token}'})
try:
    builds_res = json.loads(urllib.request.urlopen(req2).read())
    print("\n--- RECENT CLOUD BUILDS FOR web3-jobs-aggregator ---")
    for b in builds_res.get('builds', []):
        build_id = b.get('id')
        status = b.get('status')
        created = b.get('createTime')
        print(f"Build ID: {build_id} | Status: {status} | Created: {created}")
except urllib.error.HTTPError as e:
    err_body = e.read().decode()
    print(f"HTTP Error {e.code}: {err_body}")
