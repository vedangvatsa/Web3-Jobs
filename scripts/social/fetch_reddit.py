import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    "https://www.reddit.com/r/cryptomemes/top.json?t=month&limit=10", 
    headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Web3JobsBot/1.0"}
)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        raw_data = response.read().decode()
        print(f"Response length: {len(raw_data)}")
        data = json.loads(raw_data)
        if "data" in data and "children" in data["data"]:
            for post in data["data"]["children"]:
                print(f"Title: {post['data'].get('title')}")
                print(f"URL: {post['data'].get('url')}")
                print("---")
        else:
            print("Unexpected JSON structure:", str(data)[:500])
except Exception as e:
    print(f"Error: {e}")
