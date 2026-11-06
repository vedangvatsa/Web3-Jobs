#!/usr/bin/env node
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const X_CHANNEL = '6ab62682ea19ca0bdee284bd';
const X_ACCOUNT = 'hashtag_web3';
const THREADS_ACCOUNT = 'hashtagweb3';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const tweets = [
  {
    text: `1/ Ten free courses to learn smart contract auditing and security in 2026.

Core curriculum covering EVM internals, invariant fuzzing, formal verification, and DeFi exploits.

Breakdown of the top platforms and resources:`,
    imageUrl: 'https://iili.io/ntYH3uf.png',
  },
  {
    text: `2/ Cyfrin Updraft: Smart Contract Security

- Manual code review methodology
- Static analysis with Slither and Aderyn
- Invariant testing and fuzzing with Echidna
- 60+ video lessons by Patrick Collins

https://updraft.cyfrin.io/courses/security`,
    imageUrl: 'https://iili.io/ntunmba.png',
  },
  {
    text: `3/ OpenZeppelin: Ethernaut

- Browser-based EVM security wargame
- Reentrancy and delegatecall storage quirks
- Authorization bypass and selfdestruct vectors
- 30+ smart contract hacking levels

https://ethernaut.openzeppelin.com`,
    imageUrl: 'https://iili.io/ntnCv3J.png',
  },
  {
    text: `4/ Damn Vulnerable DeFi

- DeFi security wargame by The Red Guild
- Flash loan arbitrage and price oracle attacks
- Governance exploits and ERC4626 inflation bugs
- Hands-on Foundry exploit test suites

https://www.damnvulnerabledefi.xyz`,
    imageUrl: 'https://iili.io/ntnC0rb.png',
  },
  {
    text: `5/ Secureum: Security Bootcamp Lectures

- 8-epoch video curriculum by Rajeev Gopalakrishna
- EVM architecture and Solidity pitfalls 101/201
- 100+ audit findings, checklists, and RACE quizzes
- Audit techniques and automated tooling guides

https://www.youtube.com/@SecureumVideos`,
    imageUrl: 'https://iili.io/ntRrxOG.png',
  },
  {
    text: `6/ Hashtag Web3: Web3 Security & Auditing Track

- Structured Web3 security curriculum
- Reentrancy, oracle attacks, and governance bugs
- Contract testing with Foundry and fuzzing
- 8 modules with practical knowledge checks

https://hashtagweb3.com/web3-security`,
    imageUrl: 'https://iili.io/nt5slLb.png',
  },
  {
    text: `7/ Alchemy University: Ethereum Security Track

- EVM execution model and storage slot layout
- Reentrancy, access control, and flash loans
- Cryptographic hashing and signature verification
- Interactive browser coding sandbox

https://university.alchemy.com/overview/ethereum`,
    imageUrl: 'https://iili.io/ntAQU57.jpg',
  },
  {
    text: `8/ DeFiHackLabs: Web3 Security Bootcamp

- 8-week structured security syllabus
- Reproducible Foundry PoCs for 200+ DeFi hacks
- Transaction traces and root cause analysis
- Hands-on attack lab assignments

https://github.com/DeFiHackLabs/DeFiHackLabs-Ethereum-Web3-Security-BootCamp`,
    imageUrl: 'https://iili.io/ntuoYmu.png',
  },
  {
    text: `9/ Trail of Bits: Building Secure Contracts

- Smart contract security engineering guidelines
- Automated analysis checklists for CI/CD
- Slither, Echidna, and Medusa testing setups
- Invariant testing best practices

https://github.com/crytic/building-secure-contracts`,
    imageUrl: 'https://iili.io/ntno3xI.png',
  },
  {
    text: `10/ Owen Thurm: Smart Contract Auditing Series

- Commercial audit walkthroughs by Guardian Audits
- Live vulnerability hunting and severity triage
- Manual code review workflows on active protocols
- Report drafting and client communication

https://www.youtube.com/@0xOwenThurm`,
    imageUrl: 'https://iili.io/ntuoNIa.png',
  },
  {
    text: `11/ Chainlink: Smart Contract Security Bootcamp

- Developer security bootcamp series
- Oracle manipulation defense and price feed risks
- Cross-chain security patterns with CCIP
- Defensive architecture for DeFi protocols

https://chain.link/bootcamps`,
    imageUrl: 'https://iili.io/ntuoyv9.png',
  },
  {
    text: `12/ 4-phase self-study roadmap:

1. Foundations: Alchemy University, Ethernaut
2. Auditing Core: Cyfrin Security, Trail of Bits
3. Deep Theory: Hashtag Web3, Secureum
4. Exploits: Damn Vulnerable DeFi, DeFiHackLabs, Guardian Audits`,
    imageUrl: 'https://iili.io/ntYPtVa.png',
  },
  {
    text: `13/ Follow @hashtag_web3 for curated Web3 security guides and breakdowns.

Join our Telegram channels:

• Web3 Jobs: https://t.me/web3hiring
• Web3 Events: https://t.me/eventsweb3
• Web3 News Feed: https://t.me/web3newsfeed
• Web3 Networking Group: https://t.me/hashtagweb3`,
    imageUrl: null, // Omitted so native Telegram preview card expands
  },
];

async function bufferGql(query, variables = {}) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  assert.ok(token, 'BUFFER_ACCESS_TOKEN missing');
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Buffer API error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function verifyAccounts(platform) {
  let channel = null;
  let account = null;

  if (platform === 'both' || platform === 'x') {
    const data = await bufferGql(`
      query Channels {
        channels {
          id
          service
          name
        }
      }
    `);
    channel = data?.channels?.find(c => c.id === X_CHANNEL && c.service === 'twitter');
    assert.ok(channel, `X channel ${X_CHANNEL} not found in Buffer account`);
    console.log(`Verified X Channel: ${channel.name} (${channel.id})`);
  }

  if (platform === 'both' || platform === 'threads') {
    const token = process.env.THREADS_ACCESS_TOKEN;
    if (!token) {
      console.warn('THREADS_ACCESS_TOKEN missing. Threads posting will be skipped.');
    } else {
      const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${token}`);
      const json = await res.json();
      if (json.error) {
        console.warn(`Threads token invalid or expired: ${json.error.message}. Threads posting will be skipped.`);
      } else {
        account = json;
        console.log(`Verified Threads Account: @${account.username} (${account.id})`);
      }
    }
  }

  return { channel, account };
}

async function postX() {
  console.log('\n--- Posting complete thread to X (@hashtag_web3) via Buffer ---');

  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    console.log(`\nPosting Tweet ${i + 1}/${tweets.length}...`);
    console.log(`Preview:\n${t.text.split('\n')[0]}...`);

    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          post {
            id
            status
          }
        }
      }
    `;

    const metadata = {
      now: true,
    };
    if (t.imageUrl) {
      metadata.attachment = {
        photo: {
          url: t.imageUrl,
        },
      };
    }

    const variables = {
      input: {
        channelId: X_CHANNEL,
        schedulingType: 'now',
        text: t.text,
        metadata,
      },
    };

    const data = await bufferGql(mutation, variables);
    console.log(`✅ Tweet ${i + 1} published (Buffer Post ID: ${data?.createPost?.post?.id})`);

    if (i < tweets.length - 1) {
      await sleep(2500);
    }
  }

  console.log(`\n🎉 SUCCESS! Complete 13-tweet thread published to X @${X_ACCOUNT}`);
  return `https://x.com/${X_ACCOUNT}`;
}

async function postThreads(account) {
  const token = process.env.THREADS_ACCESS_TOKEN;
  assert.ok(token, 'THREADS_ACCESS_TOKEN missing');
  const userId = account.id;

  console.log(`\n--- Posting complete thread to Threads (@${account.username}) ---`);
  let previousContainerId = null;
  const permalinks = [];

  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    console.log(`\nPublishing Threads post ${i + 1}/${tweets.length}...`);

    const params = new URLSearchParams({
      access_token: token,
      text: t.text,
    });

    if (t.imageUrl) {
      params.set('media_type', 'IMAGE');
      params.set('image_url', t.imageUrl);
    } else {
      params.set('media_type', 'TEXT');
    }

    if (previousContainerId) {
      params.set('reply_to_id', previousContainerId);
    }

    const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      body: params,
    });
    const createJson = await createRes.json();
    if (!createJson.id) {
      throw new Error(`Failed to create Threads container for post ${i + 1}: ${JSON.stringify(createJson)}`);
    }
    const containerId = createJson.id;
    console.log(`  Container created: ${containerId}. Waiting 3s to publish...`);
    await sleep(3000);

    const pubParams = new URLSearchParams({
      access_token: token,
      creation_id: containerId,
    });
    const pubRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
      method: 'POST',
      body: pubParams,
    });
    const pubJson = await pubRes.json();
    if (!pubJson.id) {
      throw new Error(`Failed to publish Threads post ${i + 1}: ${JSON.stringify(pubJson)}`);
    }

    const postId = pubJson.id;
    previousContainerId = postId;
    console.log(`  ✅ Published Threads post ${i + 1} (ID: ${postId})`);

    const metaRes = await fetch(`https://graph.threads.net/v1.0/${postId}?fields=permalink&access_token=${token}`);
    const metaJson = await metaRes.json();
    if (metaJson.permalink) {
      permalinks.push(metaJson.permalink);
      console.log(`  Permalink: ${metaJson.permalink}`);
    }

    if (i < tweets.length - 1) {
      await sleep(2000);
    }
  }

  console.log(`\n🎉 SUCCESS! Complete Threads thread published: ${permalinks[0]}`);
  return permalinks[0];
}

async function main() {
  const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'publish';
  const platform = process.argv.find(arg => arg.startsWith('--platform='))?.split('=')[1] || 'both';

  console.log(`=== SMART CONTRACT AUDITING THREAD PUBLISHER ===`);
  console.log(`Mode: ${mode} | Platform: ${platform}\n`);

  const { channel, account } = await verifyAccounts(platform);

  if (mode === 'preflight') {
    console.log('\n✅ Preflight check complete!');
    if (channel) console.log(`  - X channel verified: @${X_ACCOUNT} (${X_CHANNEL})`);
    if (account) console.log(`  - Threads account verified: @${account.username}`);
    else console.log(`  - Threads: Direct API token expired / not available`);
    return;
  }

  const results = {};

  if (platform === 'both' || platform === 'x') {
    results.x = await postX();
  }

  if (platform === 'both' || platform === 'threads') {
    if (account) {
      results.threads = await postThreads(account);
    } else {
      console.warn('\n⚠️ Skipping Threads because THREADS_ACCESS_TOKEN is expired or unavailable.');
    }
  }

  console.log('\n=======================================');
  console.log('PUBLICATION SUMMARY:');
  if (results.x) console.log(`  X (@${X_ACCOUNT}): ${results.x}`);
  if (results.threads) console.log(`  Threads (@${THREADS_ACCOUNT}): ${results.threads}`);
  console.log('=======================================');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
}
