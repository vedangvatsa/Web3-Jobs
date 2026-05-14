/**
 * Schedule 3 viral video posts to LinkedIn via Buffer using litterbox URLs.
 * These URLs have proper content-length headers that Buffer requires.
 * 
 * Run: BUFFER_ACCESS_TOKEN=xxx npx tsx scripts/social/reschedule-videos.ts
 */

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';

const VIDEOS = [
  {
    id: 'coinbase_pizza',
    videoUrl: 'https://litter.catbox.moe/rvdjd0.mp4',
    text: `The narrative is shifting in 2026.

Crypto isn't just about trading anymore. It's about moving money forward at the speed of the internet.

The industry is hiring for real infrastructure roles.

Browse 600+ Web3 roles today: hashtagweb3.com`,
  },
  {
    id: 'crypto_sweats',
    videoUrl: 'https://litter.catbox.moe/2uif2n.mp4',
    text: `Having the 'Crypto Sweats'?

Stop doomscrolling the charts and start building the infrastructure.

The best way to survive market volatility is to get paid a steady salary in fiat (or stablecoins) to build the next generation of financial rails.

Find roles: hashtagweb3.com`,
  },
  {
    id: 'self_help_singh',
    videoUrl: 'https://litter.catbox.moe/3o0wby.mp4',
    text: `Crypto anxiety is a choice. Building is a career.

If the daily volatility is giving you anxiety, step away from the trading terminal and step into the builder economy.

Web3 companies are hiring across all departments. You don't need to be a trader to make it in this industry.

Apply today: hashtagweb3.com`,
  },
];

async function gql(query: string, variables: any) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<any>;
}

async function run() {
  if (!TOKEN) { console.error('BUFFER_ACCESS_TOKEN required'); process.exit(1); }

  // Schedule 8 hours apart starting tomorrow 9:30 IST (04:00 UTC)
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 1);
  baseDate.setUTCHours(4, 0, 0, 0);

  for (let i = 0; i < VIDEOS.length; i++) {
    const video = VIDEOS[i];
    const slot = new Date(baseDate.getTime() + i * 8 * 60 * 60 * 1000);
    
    console.log(`\n📹 Scheduling LinkedIn: ${video.id} at ${slot.toISOString()}`);
    
    const result = await gql(`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess { post { id } }
          ... on MutationError { message }
        }
      }
    `, {
      input: {
        channelId: LINKEDIN_ID,
        text: video.text,
        schedulingType: 'automatic',
        mode: 'customScheduled',
        dueAt: slot.toISOString(),
        assets: {
          videos: [{ url: video.videoUrl }],
        },
      },
    });

    if (result.errors) {
      console.error('  ❌ ERROR:', JSON.stringify(result.errors));
    } else {
      const post = result.data?.createPost;
      if (post?.post?.id) {
        console.log(`  ✅ Scheduled (ID: ${post.post.id})`);
      } else {
        console.log(`  ❌ Failed: ${post?.message || 'unknown'}`);
      }
    }
  }

  console.log('\nDone.');
}

run().catch(console.error);
