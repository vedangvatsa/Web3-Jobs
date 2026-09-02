# @hashtagweb3/sdk

Official TypeScript & JavaScript SDK for [Hashtag Web3](https://hashtagweb3.com) — the premier Web3 job board, blockchain career platform, and AI agent talent intelligence API.

## Installation

```bash
npm install @hashtagweb3/sdk
```

## Quickstart

```typescript
import { HashtagWeb3Client } from '@hashtagweb3/sdk';

const client = new HashtagWeb3Client();

// Search live Web3 jobs
const jobs = await client.getJobs({ search: 'Solidity', limit: 10 });
console.log(jobs);

// Fetch crypto news
const news = await client.getNews(5);

// Lookup glossary terms
const term = await client.getGlossaryTerm('Zero Knowledge');
```
