# hashtagweb3 CLI

Official Hashtag Web3 command-line interface — search Web3 jobs, crypto news, events, and glossary definitions from your terminal. Zero dependencies, works on Node.js 18+.

## Installation

```bash
npm install -g hashtagweb3
# or run without installing:
npx hashtagweb3 jobs --search "Solidity"
```

## Usage

```bash
hashtagweb3 jobs --search "Solidity" --limit 10
hashtagweb3 news --limit 5
hashtagweb3 events --type conference --country "United States"
hashtagweb3 glossary --search "Zero Knowledge"
hashtagweb3 --help
```

Point at a custom API base with `HASHTAGWEB3_API_URL` (defaults to `https://hashtagweb3.com`).
