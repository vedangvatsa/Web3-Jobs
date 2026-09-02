# hashtagweb3

Official Python SDK for [Hashtag Web3](https://hashtagweb3.com) — Web3 jobs, crypto news, events, and technical glossary.

## Installation

```bash
pip install hashtagweb3
```

## Quickstart

```python
from hashtagweb3 import HashtagWeb3Client

client = HashtagWeb3Client()

# Search Web3 jobs
jobs = client.get_jobs(search="Solidity", limit=10)
print(jobs)

# Fetch crypto news
news = client.get_news(limit=5)
```
