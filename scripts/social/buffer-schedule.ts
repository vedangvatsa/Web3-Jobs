import * as fs from 'fs';
import * as path from 'path';

const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const orgId = process.env.BUFFER_ORG_ID || '69c5b0f799d3bd8de475e25a';
const linkedinId = '69c5b139af47dacb695b5feb';
const instagramId = '69c5b180af47dacb695b611e';
const baseUrl = 'https://raw.githubusercontent.com/vedangvatsa123/Web3-Jobs/main/';

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
    const imageUrl = baseUrl + post.image;
    const dueAt = times[i].toISOString();

    for (const cid of [linkedinId, instagramId]) {
      const isLI = cid === linkedinId;
      const text = isLI ? post.linkedin.text : post.instagram.text;
      
      console.log(`Scheduling ${post.id} for ${isLI ? 'LinkedIn' : 'Instagram'} (${cid}) at ${dueAt}...`);
      
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
                  id
                }
                ... on MutationError {
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              organizationId: orgId,
              channelId: cid,
              text: text,
              media: {
                picture: imageUrl,
                thumbnail: imageUrl
              },
              schedulingType: 'individual',
              mode: 'customSchedule',
              dueAt: dueAt
            }
          }
        })
      });

      const data = await res.json();
      if (data.errors) {
        console.error('  Result: ERROR', JSON.stringify(data.errors));
      } else {
        const result = data.data.createPost;
        console.log('  Result:', result.id ? `SUCCESS (ID: ${result.id})` : `FAILED (${result.message})`);
      }
    }
  }
}

run().catch(console.error);
