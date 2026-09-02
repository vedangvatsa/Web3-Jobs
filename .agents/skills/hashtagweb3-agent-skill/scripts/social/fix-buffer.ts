import * as fs from 'fs';

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const ORG_ID = '69c5b0f799d3bd8de475e25a';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const INSTAGRAM_ID = '69c5b180af47dacb695b611e';

async function gql(query: string, variables: any) {
 const res = await fetch('https://api.buffer.com/graphql', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
 body: JSON.stringify({ query, variables })
 });
 return res.json();
}

async function fixQueue() {
 for (const channelId of [LINKEDIN_ID, INSTAGRAM_ID]) {
 console.log(`\nFetching queue for ${channelId}...`);
 
 const data = await gql(`
 query GetPosts($orgId: OrganizationId!, $channelId: String!) {
 posts(input: { organizationId: $orgId, channelId: $channelId, status: "scheduled" }) {
 edges {
 node { id text dueAt }
 }
 }
 }
 `, { orgId: ORG_ID, channelId });

 if (data.errors) {
 console.error(data.errors);
 continue;
 }

 const posts = data.data.posts.edges.map((e: any) => e.node);
 console.log(`Found ${posts.length} pending posts.`);
 
 // Sort by dueAt so we can space them out properly
 posts.sort((a: any, b: any) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

 // Re-schedule them 8 hours apart starting from the earliest one, OR starting from 5PM today if earliest is already passed
 let baseTime = new Date('2026-05-09T11:30:00.000Z'); // 5 PM IST today
 
 for (let i = 0; i < posts.length; i++) {
 const p = posts[i];
 const newDueAt = baseTime.toISOString();
 
 if (p.dueAt !== newDueAt) {
 console.log(`Updating post ${p.id} from ${p.dueAt} to ${newDueAt}...`);
 
 const updateRes = await gql(`
 mutation UpdatePost($input: UpdatePostInput!) {
 updatePost(input: $input) {
... on PostActionSuccess { post { id } }
... on MutationError { message }
 }
 }
 `, {
 input: {
 organizationId: ORG_ID,
 id: p.id,
 dueAt: newDueAt
 }
 });
 
 if (updateRes.errors) {
 console.error(`Error updating ${p.id}:`, updateRes.errors);
 } else {
 console.log(`  Success.`);
 }
 } else {
 console.log(`Post ${p.id} already at correct time ${newDueAt}.`);
 }

 // Add 8 hours for the next slot
 baseTime.setHours(baseTime.getHours() + 8);
 }
 }
}

fixQueue();
