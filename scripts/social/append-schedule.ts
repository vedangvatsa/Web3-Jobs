import * as fs from 'fs';
import * as path from 'path';

const SCHEDULE_FILE = path.join(__dirname, 'content-schedule.json');

const postsData = [
  // Top 5 LinkedIn Rewrites
  {
    tempUrl: 'https://o.uguu.se/RsbJnyzi.jpg',
    text: 'This illusion takes a second…\n\nBut finding a Web3 job doesn’t.\n\nBrowse roles: hashtagweb3.com'
  },
  {
    tempUrl: 'https://d.uguu.se/HurZdxcT.jpg',
    text: 'Honest OOOs are the best OOOs.\n\nJob searches should be the same. No fluff, just reality.\n\nFind your next role: hashtagweb3.com'
  },
  {
    tempUrl: 'https://h.uguu.se/JNvGqdtW.jpg',
    text: 'CT scan of people who held Bitcoin when it was $15K in 2022. 🧠💎\n\nFind roles where this mindset is rewarded: hashtagweb3.com'
  },
  {
    tempUrl: 'https://n.uguu.se/clizRtwr.jpg',
    text: 'If your boss is using ChatGPT to email you, it might be time to move on.\n\nFresh remote roles: t.me/web3hiring'
  },
  {
    tempUrl: 'https://d.uguu.se/xtyPYvot.jpg',
    text: 'We fear risks that don’t exist anymore, and follow rules from a different era.\n\nThe market changed. Your opportunities did too.\n\nRemote roles: t.me/web3hiring'
  },
  // Top 5 Reddit Memes
  {
    tempUrl: 'https://o.uguu.se/XiwPvfLH.jpg',
    text: '"Why do you want to work here?"\n\nAre we still pretending we don’t just work for money?\n\nSkip the corporate theater. Browse transparent Web3 roles: hashtagweb3.com'
  },
  {
    tempUrl: 'https://n.uguu.se/cTkHJJcs.jpg',
    text: 'The traditional job market is a desert right now.\n\nBut you don\'t have to be a persistent cactus.\n\nDrink from the oasis of new Web3 roles dropping daily → t.me/web3hiring'
  },
  {
    tempUrl: 'https://d.uguu.se/aozivPtt.jpg',
    text: '"Entry-level role. Requires 5 years of experience." 🚩\n\nIf a job description feels like a trap, it probably is.\n\nFind roles built for reality, not impossible wishlists: hashtagweb3.com'
  },
  {
    tempUrl: 'https://h.uguu.se/FjDMYBXW.jpg',
    text: 'Getting ghosted after a 4-round interview isn\'t "character building." It\'s just bad process.\n\nTime to stop settling for companies that don\'t respect your time.\n\nDiscover verified Web3 companies actively hiring → hashtagweb3.com'
  },
  {
    tempUrl: 'https://d.uguu.se/GUMxVTTu.jpg',
    text: 'Some company cultures wave red flags so big they cast a shadow.\n\nIf your workplace feels like this... it\'s time to quietly start looking.\n\nWe\'ve got your exit plan right here: t.me/web3hiring'
  }
];

async function uploadToFreeimage(imageUrl: string): Promise<string | null> {
  const apiKey = process.env.FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5';

  try {
    const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': 'NodeBot/1.0' } });
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('source', base64);
    formData.append('type', 'base64');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json() as any;

    if (data.status_code === 200) {
      return data.image?.url || data.image?.display_url;
    }
  } catch (e: any) {
    console.error('Error uploading to freeimage:', e.message);
  }
  return null;
}

async function run() {
  console.log('--- Appending Memes to content-schedule.json ---');
  
  let schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
  const startIndex = schedule.length + 1; // start ID index
  
  for (let i = 0; i < postsData.length; i++) {
    const post = postsData[i];
    console.log(`\nUploading image ${i+1}...`);
    const permUrl = await uploadToFreeimage(post.tempUrl);
    
    if (permUrl) {
      console.log(`Uploaded: ${permUrl}`);
      
      const newPost = {
        id: `post_meme_${Date.now()}_${i}`,
        imageUrl: permUrl,
        linkedin: { text: post.text },
        instagram: { text: post.text },
        twitter: { text: post.text },
        bluesky: { text: post.text }
      };
      
      schedule.push(newPost);
    } else {
      console.log(`Failed to upload ${post.tempUrl}`);
    }
  }
  
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
  console.log(`\n✅ Successfully appended posts to content-schedule.json! New total: ${schedule.length}`);
}

run().catch(console.error);
