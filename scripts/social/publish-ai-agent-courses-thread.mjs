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
    text: `1/ 10 free courses to learn AI agents in 2026.

From basic tool calling and ReAct loops to multi-agent swarms, MCP protocols, and production architectures:

A complete breakdown 🧵👇`,
    imageUrl: 'https://iili.io/nQJEOzX.png',
  },
  {
    text: `2/ Hugging Face: AI Agents Course

- ReAct loops and smolagents
- Tool calling and agent actions
- Multi-agent workflows with LangGraph
- Capstone project and certification

https://huggingface.co/learn/agents-course`,
    imageUrl: 'https://iili.io/nQJwmOv.png',
  },
  {
    text: `3/ LangChain Academy: Intro to LangGraph

- State graphs and cyclical agent loops
- Persistent memory and checkpointers
- Human-in-the-loop controls
- Tracing and debugging with LangSmith

https://academy.langchain.com/courses/intro-to-langgraph`,
    imageUrl: 'https://iili.io/nQJeb5u.png',
  },
  {
    text: `4/ DeepLearning.AI: Multi AI Agent Systems with crewAI

- Role-based agent design
- Task delegation and execution chains
- Inter-agent communication
- Custom tools in Python

https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/`,
    imageUrl: 'https://iili.io/nQJk30P.png',
  },
  {
    text: `5/ Anthropic: Building Effective Agents

- Routing and orchestrator-worker patterns
- Evaluator-optimizer feedback loops
- Practical tool use implementation
- Model Context Protocol (MCP) integrations

https://github.com/anthropics/courses`,
    imageUrl: 'https://iili.io/nQJkAgt.png',
  },
  {
    text: `6/ Microsoft: AI Agents for Beginners

- Core agent architecture and patterns
- Multi-agent orchestration with AutoGen
- Semantic Kernel design patterns
- 10 hands-on coding lessons

https://github.com/microsoft/ai-agents-for-beginners`,
    imageUrl: 'https://iili.io/nQJk0X4.png',
  },
  {
    text: `7/ DeepLearning.AI: Agentic Design Patterns with AutoGen

- Conversational multi-agent setups
- Sandboxed code execution
- Reflection and error-recovery loops
- Human-agent collaboration

https://www.deeplearning.ai/short-courses/ai-agentic-design-patterns-with-autogen/`,
    imageUrl: 'https://iili.io/nQJkehx.png',
  },
  {
    text: `8/ UC Berkeley RDI: LLM Agents (CS294)

- Planning, search, and tree reasoning
- Multi-agent game theory and consensus
- Tool augmented agents and RAG
- Safety, alignment, and verification

https://rdi.berkeley.edu/llm-agents/f24`,
    imageUrl: 'https://iili.io/nQJkQQR.png',
  },
  {
    text: `9/ The Agentic Web by Vedang Vatsa

- 8 layers of the agent stack
- Agent commerce protocols (ACP, AP2, x402)
- MCP architecture and practical tools
- Deploying autonomous agent workflows

https://veda.ng/agentic`,
    imageUrl: 'https://iili.io/nQJv9vn.png',
  },
  {
    text: `10/ DeepLearning.AI: Building Agentic RAG with LlamaIndex

- Router agents and tool selection
- Multi-document query planning
- Sub-question decomposition
- Financial research agent project

https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/`,
    imageUrl: 'https://iili.io/nQJv5GV.png',
  },
  {
    text: `11/ DeepLearning.AI: Functions, Tools and Agents with LangChain

- Function calling mechanics from scratch
- Structured data extraction
- ReAct reasoning loops in Python
- Building custom tool routers

https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/`,
    imageUrl: 'https://iili.io/nQJvMZv.png',
  },
  {
    text: `12/ Recommended roadmap:

1. Foundations: Hugging Face, Microsoft
2. Workflows: LangGraph, crewAI
3. Architecture: Anthropic, veda.ng
4. Production: LlamaIndex, AutoGen, Berkeley

Save this thread for reference 🔖`,
    imageUrl: 'https://iili.io/nQJvrMl.png',
  },
  {
    text: `13/ Join one of the largest AI News and Updates groups on Telegram:

Daily breakdowns, open-source models, agent research, and news.

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
    // Buffer X channel
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

    // Also inspect other channels in Buffer organization to see if Threads is connected in Buffer
    try {
      const orgData = await bufferGql(
        'query ($org: OrganizationId!) { channels(input: {organizationId: $org}) { id name service isDisconnected isLocked } }',
        { org: channel.organizationId }
      );
      const orgChannels = orgData.channels || [];
      console.log('Buffer Channels in Organization:');
      for (const ch of orgChannels) {
        console.log(`  - ${ch.name} (${ch.service}): ID=${ch.id}, disconnected=${ch.isDisconnected}`);
      }
    } catch (e) {
      console.log('Could not list organization channels:', e.message);
    }
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

    // Poll container status
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

    // Publish container
    console.log('  Publishing container...');
    const publishRes = await threadsApi(`${account.id}/threads_publish`, {
      creation_id: container.id,
    });
    assert.ok(publishRes.id, 'Threads publication ID missing');
    previousId = publishRes.id;

    // Fetch permalink
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

  console.log(`=== AI AGENT COURSES THREAD PUBLISHER ===`);
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
