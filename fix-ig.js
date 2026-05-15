const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const instagramId = '69c5b180af47dacb695b611e';
const text = 'We fear risks that don’t exist anymore, and follow rules from a different era.\n\nThe market changed. Your opportunities did too.\n\nRemote roles: t.me/web3hiring';

const dueAt = new Date();
dueAt.setDate(dueAt.getDate() + 1);
dueAt.setHours(19, 30, 0, 0);

const input = {
  channelId: instagramId,
  text,
  schedulingType: 'automatic',
  mode: 'customScheduled',
  dueAt: dueAt.toISOString(),
  assets: {
    images: [{
      url: 'https://iili.io/BZt2Las.jpg',
      thumbnailUrl: 'https://iili.io/BZt2Las.jpg'
    }]
  },
  metadata: { instagram: { type: 'post', shouldShareToFeed: true } }
};

fetch('https://api.buffer.com/graphql', {
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
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)));
