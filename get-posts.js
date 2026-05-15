const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const linkedinId = '69c5b139af47dacb695b5feb';
const instagramId = '69c5b180af47dacb695b611e';

async function fetchQueue(channelId) {
  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        query GetPosts($channelId: String!) {
          posts(input: { channelId: $channelId, status: "scheduled" }) {
            edges { node { id text } }
          }
        }
      `,
      variables: { channelId }
    })
  });
  const data = await res.json();
  if (data.data?.posts?.edges) {
    console.log(channelId, 'Count:', data.data.posts.edges.length);
    data.data.posts.edges.forEach(e => console.log(' - ' + e.node.text.slice(0, 30).replace(/\n/g, ' ')));
  } else {
    console.log(channelId, 'No posts or error', data);
  }
}

fetchQueue(linkedinId).then(() => fetchQueue(instagramId));
