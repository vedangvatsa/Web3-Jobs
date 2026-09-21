# @hashtag_web3_/sdk

Official TypeScript & JavaScript SDK for [Hashtag Web3](https://hashtagweb3.com). Reads the same **static `/data/*` catalogs** as the website and CLI (filter client-side).

## Installation

```bash
npm install @hashtag_web3_/sdk
```

## Quickstart

```typescript
import { HashtagWeb3Client } from '@hashtag_web3_/sdk';

const client = new HashtagWeb3Client();

const jobs = await client.getJobs({ search: 'Solidity', limit: 10 });
const news = await client.getNews(5);
const term = await client.getGlossaryTerm('Zero Knowledge');
```

Optional `baseUrl` overrides the site origin (default `https://hashtagweb3.com`). Legacy REST `/api/v1/*` is not used.
