import fs from 'node:fs';
import {postingSlot, isPostingWindow} from './posting-slot.mjs';
const [slot, date] = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync('scripts/social/job-video-state.json', 'utf8'));
const timing = postingSlot(slot, date);
const slugs = state.slots[timing.key] || [];
const completed = slugs.length === 2 && slugs.every(slug => ['instagram', 'youtube', 'tiktok'].every(platform => state.jobs[slug]?.receipts[platform]?.status === 'sent'));
console.log(`videos=${!completed && isPostingWindow(timing)}`);
