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
    signal: AbortSignal.timeout(60000),
  });
  const data = await res.json();
  if (!res.ok || data.errors?.length || !data.data) {
    throw new Error(`Buffer error: ${JSON.stringify(data.errors || data)}`);
  }
  return data.data;
}

async function verifyAccounts(platform) {
  console.log('--- Verifying accounts ---');
  let channel = null;
  let account = null;

  if (platform === 'both' || platform === 'x') {
    const res = await bufferGql(
      'query ($id: ChannelId!) { channel(input: {id: $id}) { id name service organizationId isDisconnected isLocked } }',
      { id: X_CHANNEL }
    );
    channel = res.channel;
    console.log(`X Channel on Buffer: ${channel.name} (${channel.id}), service: ${channel.service}`);
    assert.equal(channel.name.replace(/^@/, '').toLowerCase(), X_ACCOUNT);
    assert.equal(channel.service, 'twitter');
    assert.equal(channel.isDisconnected, false);
    assert.equal(channel.isLocked, false);
  }

  return { channel, account };
}

async function postX() {
  console.log('\n=== POSTING THREAD TO X (@hashtag_web3 via Buffer) ===');

  const thread = tweets.map((t) => {
    const item = { text: t.text };
    if (t.imageUrl) {
      item.assets = [{ image: { url: t.imageUrl } }];
    }
    return item;
  });

  const input = {
    channelId: X_CHANNEL,
    mode: 'shareNow',
    schedulingType: 'automatic',
    needsApproval: false,
    text: tweets[0].text,
    assets: thread[0].assets,
    metadata: {
      twitter: {
        thread,
      },
    },
  };

  const mutation = `mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
          status
          externalLink
        }
      }
      ... on MutationError {
        message
      }
    }
  }`;

  console.log('Sending thread creation mutation to Buffer...');
  const data = await bufferGql(mutation, { input });
  const result = data.createPost;
  if (!result.post?.id) {
    throw new Error(`Buffer post creation rejected: ${result.message || JSON.stringify(result)}`);
  }

  const postId = result.post.id;
  console.log(`✅ Buffer post created (ID: ${postId})`);

  console.log('Waiting for Buffer to publish and return live X permalink...');
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(4000);
    const postQuery = `query GetPost($id: PostId!) {
      post(input: {id: $id}) {
        id
        status
        externalLink
        error { message }
      }
    }`;
    const check = await bufferGql(postQuery, { id: postId });
    const post = check.post;
    console.log(`  Attempt ${attempt + 1}: status = ${post?.status}`);

    if (post?.status === 'sent' && post.externalLink) {
      console.log(`\n🎉 SUCCESS! X Thread is LIVE: ${post.externalLink}`);
      return post.externalLink;
    }
    if (post?.status === 'error') {
      throw new Error(`Buffer publication failed: ${post.error?.message}`);
    }
  }

  console.log(`ℹ️ Post is queued in Buffer. Monitor ID ${postId}`);
  return `Buffer Post ID: ${postId}`;
}

async function main() {
  const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'publish';
  const platform = process.argv.find(arg => arg.startsWith('--platform='))?.split('=')[1] || 'x';

  console.log(`=== SMART CONTRACT AUDITING THREAD PUBLISHER ===`);
  console.log(`Mode: ${mode} | Platform: ${platform}\n`);

  const { channel } = await verifyAccounts(platform);

  if (mode === 'preflight') {
    console.log('\n✅ Preflight check complete!');
    if (channel) console.log(`  - X channel verified: @${X_ACCOUNT} (${X_CHANNEL})`);
    return;
  }

  const results = {};

  if (platform === 'both' || platform === 'x') {
    results.x = await postX();
  }

  console.log('\n=======================================');
  console.log('PUBLICATION SUMMARY:');
  if (results.x) console.log(`  X (@${X_ACCOUNT}): ${results.x}`);
  console.log('=======================================');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
}
