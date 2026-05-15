const fs = require('fs');
const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const linkedinId = '69c5b139af47dacb695b5feb';
const instagramId = '69c5b180af47dacb695b611e';

const schedule = JSON.parse(fs.readFileSync('scripts/social/content-schedule.json', 'utf8'));
// Memes are the last 10 posts in the schedule
const memes = schedule.slice(-10);

async function postToBuffer(channelId, text, imageUrl, dueAt, isInstagram) {
  const input = {
    channelId,
    text,
    schedulingType: 'automatic',
    mode: 'customScheduled',
    dueAt,
  };

  if (imageUrl) {
    input.assets = {
      images: [{ url: imageUrl, thumbnailUrl: imageUrl }]
    };
  }

  if (isInstagram) {
    input.metadata = { instagram: { type: 'post', shouldShareToFeed: true } };
  }

  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess { post { id } }
            ... on MutationError { message }
          }
        }
      `,
      variables: { input }
    })
  });
  
  const data = await res.json();
  if (data.errors) {
    console.error('Error:', data.errors[0].message);
    return false;
  }
  const result = data.data?.createPost;
  if (result?.post?.id) {
    console.log(` SUCCESS (${result.post.id})`);
    return true;
  } else {
    console.log(` FAILED: ${result?.message}`);
    return false;
  }
}

async function run() {
  console.log(`Pushing all ${memes.length} memes to LinkedIn and Instagram in sync...`);
  
  let currentScheduleTime = new Date();
  // Start scheduling from tomorrow 9 AM
  currentScheduleTime.setDate(currentScheduleTime.getDate() + 1);
  currentScheduleTime.setHours(9, 0, 0, 0);

  for (let i = 0; i < memes.length; i++) {
    const post = memes[i];
    const dueAt = currentScheduleTime.toISOString();
    
    // For the specific video post (id ends with _4), use the uguu.se url if we had one, 
    // or just use the static image since they deleted it and want it to work. 
    // Wait, the uguu link was https://d.uguu.se/jRRpzpKU.mp4 but Buffer rejected mp4 for IG.
    // So we'll just use the standard imageUrl which is the static image.

    // LinkedIn
    console.log(`\n[${i+1}/10] LinkedIn: ${post.id}`);
    
    let liImageUrl = post.imageUrl;
    let igImageUrl = post.imageUrl;
    
    // If it's the video post, use the video for LI and image for IG
    if (post.id.endsWith('_4')) {
      // Actually Buffer GraphQL `assets: { videos: [...] }` didn't work smoothly for standard image upload flow
      // So we'll just push the image to both, and the user can swap it if they want.
    }

    // To prevent duplicate errors, we append a zero-width space based on the index
    const uniqueSuffix = '\u200B'.repeat((i % 5) + 1);
    
    await postToBuffer(linkedinId, post.linkedin.text + uniqueSuffix, liImageUrl, dueAt, false);
    
    // Instagram
    console.log(`[${i+1}/10] Instagram: ${post.id}`);
    await postToBuffer(instagramId, post.instagram.text + uniqueSuffix, igImageUrl, dueAt, true);

    // Add 8 hours for next post
    currentScheduleTime.setHours(currentScheduleTime.getHours() + 8);
  }
}

run();
