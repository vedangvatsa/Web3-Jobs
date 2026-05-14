/**
 * Schedule 3 viral video posts directly to Buffer right now.
 * Run with: BUFFER_ACCESS_TOKEN=xxx npx tsx scripts/social/schedule-videos.ts
 */

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const INSTAGRAM_ID = '69c5b180af47dacb695b611e';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';

interface VideoPost {
  id: string;
  videoUrl: string;
  linkedin: string;
  instagram: string;
}

const VIDEOS: VideoPost[] = [
  {
    id: 'post_viral_coinbase_pizza',
    videoUrl: 'https://files.catbox.moe/dveosg.mp4',
    linkedin: `The narrative is shifting in 2026.

Crypto isn't just about trading anymore. It's about moving money forward at the speed of the internet.

The industry is hiring for real infrastructure roles.

Browse 600+ Web3 roles today: hashtagweb3.com`,
    instagram: `The narrative is shifting in 2026.

Crypto isn't just about trading. It's about moving money forward at the speed of the internet.

Browse 600+ Web3 roles: hashtagweb3.com

#web3 #crypto #jobs #career`,
  },
  {
    id: 'post_viral_crypto_sweats',
    videoUrl: 'https://files.catbox.moe/fqvqr7.mp4',
    linkedin: `Having the 'Crypto Sweats'?

Stop doomscrolling the charts and start building the infrastructure.

The best way to survive market volatility is to get paid a steady salary in fiat (or stablecoins) to build the next generation of financial rails.

Find roles: hashtagweb3.com`,
    instagram: `Having the 'Crypto Sweats'?

Stop doomscrolling the charts and start building the infrastructure.

Find roles: hashtagweb3.com

#crypto #web3 #career #developer`,
  },
  {
    id: 'post_viral_self_help_singh',
    videoUrl: 'https://files.catbox.moe/zs8lq5.mp4',
    linkedin: `Crypto anxiety is a choice. Building is a career.

If the daily volatility is giving you anxiety, step away from the trading terminal and step into the builder economy.

Web3 companies are hiring across all departments. You don't need to be a trader to make it in this industry.

Apply today: hashtagweb3.com`,
    instagram: `Crypto anxiety is a choice. Building is a career.

Step away from the charts and step into the builder economy.

Apply today: hashtagweb3.com

#crypto #web3 #funny #jobs`,
  },
];

async function gqlRequest(query: string, variables: any) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<any>;
}

function generateSlots(count: number): Date[] {
  const slots: Date[] = [];
  const hours = [1, 9, 17]; // IST hours
  const d = new Date();
  d.setDate(d.getDate() + 1); // Start from tomorrow
  d.setMinutes(0, 0, 0);

  while (slots.length < count) {
    for (const h of hours) {
      const slot = new Date(d);
      if (h < 6) {
        slot.setUTCHours(19, 30, 0, 0);
        slot.setDate(slot.getDate() - 1);
      } else {
        const utcHour = h - 6;
        slot.setUTCHours(utcHour, 30, 0, 0);
      }

      const now = new Date();
      if (slot > now && slots.length < count) {
        slots.push(new Date(slot));
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return slots;
}

async function run() {
  if (!TOKEN) {
    console.error('BUFFER_ACCESS_TOKEN is required');
    process.exit(1);
  }

  const slots = generateSlots(VIDEOS.length * 2); // enough for LI + IG
  let slotIdx = 0;

  for (const video of VIDEOS) {
    // LinkedIn
    const liSlot = slots[slotIdx++];
    console.log(`\nScheduling LinkedIn: ${video.id} at ${liSlot.toISOString()}`);
    const liData = await gqlRequest(`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess { post { id } }
          ... on MutationError { message }
        }
      }
    `, {
      input: {
        channelId: LINKEDIN_ID,
        text: video.linkedin,
        schedulingType: 'automatic',
        mode: 'customScheduled',
        dueAt: liSlot.toISOString(),
        assets: {
          videos: [{ url: video.videoUrl }],
        },
      },
    });

    if (liData.errors) {
      console.error('  ERROR:', JSON.stringify(liData.errors));
    } else {
      const result = liData.data?.createPost;
      if (result?.post?.id) {
        console.log(`  SUCCESS (ID: ${result.post.id})`);
      } else {
        console.log(`  FAILED: ${result?.message || 'unknown'}`);
      }
    }

    // Instagram
    const igSlot = slots[slotIdx++];
    console.log(`Scheduling Instagram: ${video.id} at ${igSlot.toISOString()}`);
    const igData = await gqlRequest(`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess { post { id } }
          ... on MutationError { message }
        }
      }
    `, {
      input: {
        channelId: INSTAGRAM_ID,
        text: video.instagram,
        schedulingType: 'automatic',
        mode: 'customScheduled',
        dueAt: igSlot.toISOString(),
        assets: {
          videos: [{ url: video.videoUrl }],
        },
        metadata: {
          instagram: { type: 'reel', shouldShareToFeed: true },
        },
      },
    });

    if (igData.errors) {
      console.error('  ERROR:', JSON.stringify(igData.errors));
    } else {
      const result = igData.data?.createPost;
      if (result?.post?.id) {
        console.log(`  SUCCESS (ID: ${result.post.id})`);
      } else {
        console.log(`  FAILED: ${result?.message || 'unknown'}`);
      }
    }
  }

  console.log('\nDone scheduling video posts.');
}

run().catch(console.error);
