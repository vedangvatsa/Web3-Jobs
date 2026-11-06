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
    text: `1/ 10 free resources to learn smart contract auditing and security in 2026.

From basic reentrancy and storage collisions to flash loan attacks, fuzzing, and formal verification:

A complete breakdown 🧵👇`,
    imageUrl: 'https://iili.io/ntfa09s.png',
  },
  {
    text: `2/ Damn Vulnerable DeFi

- Industry standard DeFi security wargame
- Flash loan and price oracle attacks
- Governance exploits and ERC4626 vault inflation
- Hands-on Foundry exploit tests

https://www.damnvulnerabledefi.xyz`,
    imageUrl: 'https://iili.io/ntnC0rb.png',
  },
  {
    text: `3/ OpenZeppelin: Ethernaut

- Interactive EVM wargame in your browser
- Reentrancy and delegatecall storage collisions
- Authorization bypass and selfdestruct quirks
- 30+ hands-on hacking levels

https://ethernaut.openzeppelin.com`,
    imageUrl: 'https://iili.io/ntnCv3J.png',
  },
  {
    text: `4/ Cyfrin Updraft: Smart Contract Security

- Complete manual code review methodology
- Static analysis with Slither and Aderyn
- Invariant testing and fuzzing with Echidna
- Full self-paced video course by Patrick Collins

https://updraft.cyfrin.io/courses/security`,
    imageUrl: 'https://iili.io/ntnCL4s.png',
  },
  {
    text: `5/ Secureum: Security Pitfalls & RACE Quizzes

- Security Pitfalls 101 and 201 checklists
- Audit Findings 101 and 201 summaries
- 100+ RACE audit questions and answers
- Essential study material for junior auditors

https://secureum.substack.com`,
    imageUrl: 'https://iili.io/ntnnKaj.png',
  },
  {
    text: `6/ Solodit: Web3 Vulnerability Search

- 15,000+ searchable audit findings
- Reports from Trail of Bits, Spearbit, and OpenZeppelin
- Filter by protocol, severity, and bug type
- Reference index for writing audit reports

https://solodit.cyfrin.io`,
    imageUrl: 'https://iili.io/ntnnoZP.png',
  },
  {
    text: `7/ RareSkills: Smart Contract Security Guide

- In-depth guide covering 30+ EVM attack vectors
- Read-only reentrancy and ERC777 hook bugs
- Signature replay and malleable signatures
- Precision loss and rounding exploits

https://www.rareskills.io/post/smart-contract-security`,
    imageUrl: 'https://iili.io/ntnnVFs.png',
  },
  {
    text: `8/ SunWeb3Sec: DeFiHackLabs

- 200+ reproducible PoC exploit test cases
- Replicates historical DeFi hacks in Foundry
- Step-by-step transaction traces and root causes
- Practical lab to study real-world exploits

https://github.com/SunWeb3Sec/DeFiHackLabs`,
    imageUrl: 'https://iili.io/ntnn6Hx.png',
  },
  {
    text: `9/ Trail of Bits: Building Secure Contracts

- Security engineering guidelines from top auditors
- Automated analysis checklists for CI/CD
- Slither, Echidna, and Medusa testing setups
- Invariant testing best practices

https://github.com/crytic/building-secure-contracts`,
    imageUrl: 'https://iili.io/ntno3xI.png',
  },
  {
    text: `10/ QuillAudits: QuillCTF

- Scenario-based smart contract security challenges
- Real audit findings converted into CTF levels
- Flash loan arbitrage and access control bugs
- Complete Foundry solutions and writeups

https://quillctf.super.site`,
    imageUrl: 'https://iili.io/ntnoRs9.png',
  },
  {
    text: `11/ Paradigm CTF Archives

- The gold standard of competitive EVM hacking
- Advanced MEV, arbitrage, and curve math exploits
- EVM bytecode disassembly and compiler edge cases
- Source code and official solution writeups

https://github.com/paradigmxyz/paradigm-ctf-2023`,
    imageUrl: 'https://iili.io/ntnoWs1.png',
  },
  {
    text: `12/ Recommended roadmap:

1. Foundations: Ethernaut, RareSkills
2. DeFi Exploits: Damn Vulnerable DeFi, QuillCTF
3. Tooling & Fuzzing: Cyfrin Updraft, Trail of Bits
4. Real-World Analysis: Secureum, Solodit, DeFiHackLabs

Save this thread for reference 🔖`,
    imageUrl: 'https://iili.io/nt30umx.png',
  },
  {
    text: `13/ Follow @hashtag_web3 for curated Web3 engineering guides, security breakdowns, and open roles.

Join our Telegram for daily updates:

https://t.me/hashtag_ai`,
    imageUrl: null, // Omitted so native Telegram link card preview is rendered
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

async function threadsApi(route, body) {
  const token = process.env.THREADS_ACCESS_TOKEN;
  assert.ok(token, 'THREADS_ACCESS_TOKEN missing');
  const res = await fetch(`https://graph.threads.net/v1.0/${route}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}` },
    body: body ? new URLSearchParams(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Threads HTTP ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  }
  return data;
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

  if (platform === 'both' || platform === 'threads') {
    try {
      account = await threadsApi('me?fields=id,username');
      console.log(`Threads Account: @${account.username} (ID: ${account.id})`);
      assert.equal(account.username.toLowerCase(), THREADS_ACCOUNT);
    } catch (err) {
      if (platform === 'both') {
        console.warn(`\n⚠️ Warning: Threads direct API check failed: ${err.message}`);
        console.warn('Proceeding with X-only if requested, or update THREADS_ACCESS_TOKEN.\n');
      } else {
        throw err;
      }
    }
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

async function postThreads(account) {
  console.log('\n=== POSTING THREAD TO THREADS (@hashtagweb3) ===');
  let previousId = null;
  const permalinks = [];

  for (let i = 0; i < tweets.length; i++) {
    const item = tweets[i];
    console.log(`\nPosting Threads post ${i + 1}/${tweets.length}...`);

    const params = {
      text: item.text,
      ...(previousId ? { reply_to_id: previousId } : {}),
    };

    if (item.imageUrl) {
      params.media_type = 'IMAGE';
      params.image_url = item.imageUrl;
    } else {
      params.media_type = 'TEXT';
    }

    const container = await threadsApi(`${account.id}/threads`, params);
    assert.ok(container.id, 'Threads container ID missing');
    console.log(`  Container created (ID: ${container.id}). Waiting for media processing...`);

    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      const statusRes = await threadsApi(`${container.id}?fields=status,error_message`);
      if (statusRes.status === 'FINISHED') {
        ready = true;
        break;
      }
      if (statusRes.status === 'ERROR' || statusRes.status === 'EXPIRED') {
        throw new Error(`Container processing failed: ${statusRes.status} ${statusRes.error_message || ''}`);
      }
      await sleep(3000);
    }
    assert.ok(ready, 'Threads container processing timed out');

    console.log('  Publishing container...');
    const publishRes = await threadsApi(`${account.id}/threads_publish`, {
      creation_id: container.id,
    });
    assert.ok(publishRes.id, 'Threads publication ID missing');
    previousId = publishRes.id;

    const postDetails = await threadsApi(`${publishRes.id}?fields=id,permalink`);
    console.log(`  ✅ Post ${i + 1}/${tweets.length} published: ${postDetails.permalink || publishRes.id}`);
    permalinks.push(postDetails.permalink || publishRes.id);

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
