/**
 * Buffer Auto-Refill Script
 * 
 * Checks how many posts are pending in Buffer queue.
 * If fewer than 10, schedules the next batch of posts.
 * 
 * Run with: npx tsx scripts/social/buffer-refill.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const ORG_ID = process.env.BUFFER_ORG_ID || '69c5b0f799d3bd8de475e25a';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const INSTAGRAM_ID = '69c5b180af47dacb695b611e';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';

const STATE_FILE = path.join(__dirname, 'buffer-refill-state.json');
const SCHEDULE_FILE = path.join(__dirname, 'content-schedule.json');

interface RefillState {
  linkedin: { lastIndex: number; lastScheduledAt: string };
  instagram: { lastIndex: number; lastScheduledAt: string };
}

function loadState(): RefillState {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    linkedin: { lastIndex: -1, lastScheduledAt: '' },
    instagram: { lastIndex: -1, lastScheduledAt: '' },
  };
}

function saveState(state: RefillState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

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

async function getQueueCount(channelId: string): Promise<number> {
  // Try to get pending posts count
  const data = await gqlRequest(`
    query GetPosts($input: PostsInput!) {
      posts(input: $input) {
        edges {
          node { id }
        }
        totalCount
      }
    }
  `, {
    input: {
      channelId,
      status: 'scheduled',
    }
  });

  if (data.errors) {
    // If the query fails, assume we need to refill
    console.log('Could not query queue count, assuming refill needed');
    return 0;
  }

  return data.data?.posts?.totalCount ?? data.data?.posts?.edges?.length ?? 0;
}

async function schedulePost(
  channelId: string,
  text: string,
  imageUrl: string,
  dueAt: string,
  isInstagram: boolean
) {
  const input: any = {
    channelId,
    text,
    schedulingType: 'automatic',
    mode: 'customScheduled',
    dueAt,
  };

  if (imageUrl) {
    input.assets = {
      images: [{ url: imageUrl, thumbnailUrl: imageUrl }],
    };
  }

  if (isInstagram) {
    input.metadata = {
      instagram: { type: 'post', shouldShareToFeed: true },
    };
  }

  const data = await gqlRequest(`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id } }
        ... on MutationError { message }
      }
    }
  `, { input });

  if (data.errors) {
    console.error('  ERROR:', JSON.stringify(data.errors));
    return false;
  }

  const result = data.data?.createPost;
  if (result?.post?.id) {
    console.log(`  SUCCESS (ID: ${result.post.id})`);
    return true;
  } else {
    console.log(`  FAILED: ${result?.message || 'unknown'}`);
    return false;
  }
}

async function run() {
  const schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
  const state = loadState();

  console.log('--- Buffer Auto-Refill ---');
  console.log(`Total posts in schedule: ${schedule.length}`);

  // Check queue counts
  const liCount = await getQueueCount(LINKEDIN_ID);
  const igCount = await getQueueCount(INSTAGRAM_ID);

  console.log(`LinkedIn queue: ${liCount} pending`);
  console.log(`Instagram queue: ${igCount} pending`);

  // Buffer free plan = 10 posts per channel
  // Refill if fewer than 5 pending (to stay ahead)
  const REFILL_THRESHOLD = 5;
  const BATCH_SIZE = 5; // Schedule 5 at a time (to not exceed 10 limit)

  // Generate time slots starting from now + 1 hour
  const now = new Date();
  const generateSlots = (count: number): Date[] => {
    const slots: Date[] = [];
    // Start from next standard slot (1am, 9am, 5pm IST)
    const hours = [1, 9, 17]; // IST hours
    let d = new Date(now);
    d.setMinutes(0, 0, 0);
    
    // Find next slot
    const istOffset = 5.5 * 60 * 60 * 1000;
    while (slots.length < count) {
      for (const h of hours) {
        const slot = new Date(d);
        slot.setUTCHours(h - 5, h === 1 ? 30 : 30, 0, 0); // Convert IST to UTC
        // IST offset: subtract 5:30
        const utcHour = h < 6 ? h + 24 - 6 : h - 6;
        const utcMin = 30;
        slot.setUTCHours(utcHour, utcMin, 0, 0);
        
        if (slot > now && slots.length < count) {
          slots.push(slot);
        }
      }
      d.setDate(d.getDate() + 1);
    }
    return slots;
  };

  // Refill LinkedIn
  if (liCount < REFILL_THRESHOLD) {
    const toSchedule = Math.min(BATCH_SIZE, 10 - liCount);
    console.log(`\nRefilling LinkedIn: scheduling ${toSchedule} posts...`);
    const slots = generateSlots(toSchedule);
    
    for (let i = 0; i < toSchedule; i++) {
      const idx = (state.linkedin.lastIndex + 1 + i) % schedule.length;
      const post = schedule[idx];
      const dueAt = slots[i].toISOString();
      
      console.log(`  ${post.id} at ${dueAt}`);
      const success = await schedulePost(
        LINKEDIN_ID,
        post.linkedin.text,
        post.imageUrl || '',
        dueAt,
        false
      );
      if (success) {
        state.linkedin.lastIndex = idx;
        state.linkedin.lastScheduledAt = dueAt;
      }
    }
  } else {
    console.log('LinkedIn queue OK, no refill needed');
  }

  // Refill Instagram (with offset for shuffling)
  if (igCount < REFILL_THRESHOLD) {
    const toSchedule = Math.min(BATCH_SIZE, 10 - igCount);
    console.log(`\nRefilling Instagram: scheduling ${toSchedule} posts...`);
    const slots = generateSlots(toSchedule);
    
    for (let i = 0; i < toSchedule; i++) {
      // Instagram uses offset 3 for shuffling
      const baseIdx = (state.instagram.lastIndex + 1 + i) % schedule.length;
      const shuffledIdx = (baseIdx + 3) % schedule.length;
      const post = schedule[shuffledIdx];
      const dueAt = slots[i].toISOString();
      
      console.log(`  ${post.id} at ${dueAt}`);
      const success = await schedulePost(
        INSTAGRAM_ID,
        post.instagram.text,
        post.imageUrl || '',
        dueAt,
        true
      );
      if (success) {
        state.instagram.lastIndex = baseIdx;
        state.instagram.lastScheduledAt = dueAt;
      }
    }
  } else {
    console.log('Instagram queue OK, no refill needed');
  }

  saveState(state);
  console.log('\nRefill complete. State saved.');
}

run().catch(console.error);
