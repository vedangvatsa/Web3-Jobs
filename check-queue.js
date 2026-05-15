const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const linkedinId = '69c5b139af47dacb695b5feb';
const instagramId = '69c5b180af47dacb695b611e';

async function fetchQueue(channelId) {
  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        query GetChannel($channelId: String!) {
          channel(input: { id: $channelId }) {
            pendingCount
          }
        }
      `,
      variables: { channelId }
    })
  });
  return res.json();
}

async function run() {
  const li = await fetchQueue(linkedinId);
  console.log('LI', li.data.channel.pendingCount);
  
  const ig = await fetchQueue(instagramId);
  console.log('IG', ig.data.channel.pendingCount);
}

run();
