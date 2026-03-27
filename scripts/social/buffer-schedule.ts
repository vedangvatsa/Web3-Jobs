import * as fs from 'fs';
import * as path from 'path';

const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const orgId = process.env.BUFFER_ORG_ID || '69c5b0f799d3bd8de475e25a';
const linkedinId = '69c5b139af47dacb695b5feb';
const instagramId = '69c5b180af47dacb695b611e';

// Public image URLs hosted on freeimage.host (permanent, no auth needed)
const imageUrls: Record<string, string> = {
  'post_1_family_meme': 'https://iili.io/qZY8H5F.jpg',
  'post_2_capital_chart': 'https://iili.io/qZYSqhb.jpg',
  'post_3_l2_chart': 'https://iili.io/qZYS04p.jpg',
  'post_4_gas_meme': 'https://iili.io/qZYSOG4.jpg',
  'post_5_btc_etf': 'https://iili.io/qZYSm91.jpg',
  'post_6_stablecoin': 'https://iili.io/qZYUaR9.jpg',
};

async function run() {
  const schedulePath = path.join(__dirname, 'content-schedule.json');
  const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  
  // Slots: 1am, 9am, 5pm IST starting Mar 28
  const times = [
    new Date('2026-03-28T01:00:00+05:30'),
    new Date('2026-03-28T09:00:00+05:30'),
    new Date('2026-03-28T17:00:00+05:30'),
    new Date('2026-03-29T01:00:00+05:30'),
    new Date('2026-03-29T09:00:00+05:30'),
    new Date('2026-03-29T17:00:00+05:30')
  ];

  console.log('--- Buffer GraphQL Scheduling ---');
  for (let i = 0; i < schedule.length; i++) {
    const post = schedule[i];
    const imageUrl = imageUrls[post.id];
    const dueAt = times[i].toISOString();

    for (const cid of [linkedinId, instagramId]) {
      const isLI = cid === linkedinId;
      const text = isLI ? post.linkedin.text : post.instagram.text;
      
      console.log(`\nScheduling ${post.id} for ${isLI ? 'LinkedIn' : 'Instagram'} at ${dueAt}...`);
      
      // Build input — Instagram needs metadata.instagram.type
      const input: any = {
        channelId: cid,
        text: text,
        schedulingType: 'automatic',
        mode: 'customScheduled',
        dueAt: dueAt,
      };

      // Add image if we have a public URL
      if (imageUrl) {
        input.assets = {
          images: [{
            url: imageUrl,
            thumbnailUrl: imageUrl,
          }]
        };
      }

      // Instagram requires post type metadata
      if (!isLI) {
        input.metadata = {
          instagram: {
            type: 'post',
            shouldShareToFeed: true,
          }
        };
      }

      const res = await fetch('https://api.buffer.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                ... on PostActionSuccess {
                  post {
                    id
                  }
                }
                ... on MutationError {
                  message
                }
              }
            }
          `,
          variables: { input }
        })
      });

      const data = await res.json() as any;
      if (data.errors) {
        console.error('  ERROR:', JSON.stringify(data.errors));
      } else {
        const result = data.data?.createPost;
        if (result?.post?.id) {
          console.log(`  ✅ SUCCESS (ID: ${result.post.id})`);
        } else if (result?.message) {
          console.log(`  ❌ FAILED: ${result.message}`);
        } else {
          console.log('  ⚠️ Unexpected:', JSON.stringify(data));
        }
      }
    }
  }
}

run().catch(console.error);
