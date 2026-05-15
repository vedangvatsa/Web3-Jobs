import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read viral posts
const viralData = JSON.parse(fs.readFileSync(path.join(__dirname, 'viral.json'), 'utf8'));

// Format for content-schedule.json
const newPosts = viralData.map(post => {
  const formatted = {
    id: post.id,
    linkedin: { text: post.text },
    twitter: { text: post.text },
    instagram: { text: post.text },
    bluesky: { text: post.text }
  };
  
  if (post.imageUrl) {
    formatted.imageUrl = post.imageUrl;
  }
  if (post.videoUrl) {
    formatted.videoUrl = post.videoUrl;
  }
  
  return formatted;
});

// Shuffle array (Fisher-Yates)
for (let i = newPosts.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [newPosts[i], newPosts[j]] = [newPosts[j], newPosts[i]];
}

// Read existing schedule
const schedulePath = path.join(__dirname, '../scripts/social/content-schedule.json');
const existingSchedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

// Prepend new posts
const updatedSchedule = [...newPosts, ...existingSchedule];

// Write back to schedule
fs.writeFileSync(schedulePath, JSON.stringify(updatedSchedule, null, 2));

console.log(`Successfully added and shuffled ${newPosts.length} viral posts to the schedule.`);

// Reset the index in state file so they are picked up immediately
const statePath = path.join(__dirname, '../scripts/social/buffer-refill-state.json');
if (fs.existsSync(statePath)) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.currentIndex = 0;
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log('Reset currentIndex to 0 in buffer-refill-state.json.');
}

