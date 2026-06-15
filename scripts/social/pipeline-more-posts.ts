import * as fs from 'fs';
import * as path from 'path';

const SCHEDULE_FILE = path.join(__dirname, 'content-schedule.json');
const UPLOAD_STATE_FILE = path.join(__dirname, 'upload-state.json');
const BULK_CONTENT_FILE = path.join(__dirname, 'bulk-content.json');

async function run() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 50;

  if (!fs.existsSync(SCHEDULE_FILE)) {
    console.error('❌ No content-schedule.json found');
    process.exit(1);
  }
  if (!fs.existsSync(UPLOAD_STATE_FILE)) {
    console.error('❌ No upload-state.json found');
    process.exit(1);
  }
  if (!fs.existsSync(BULK_CONTENT_FILE)) {
    console.error('❌ No bulk-content.json found');
    process.exit(1);
  }

  const schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
  const uploadStateRaw = JSON.parse(fs.readFileSync(UPLOAD_STATE_FILE, 'utf8'));
  const uploadState = uploadStateRaw.uploaded || uploadStateRaw;
  const bulkContent = JSON.parse(fs.readFileSync(BULK_CONTENT_FILE, 'utf8'));

  // Get all currently scheduled imageUrls to avoid duplicates
  const scheduledUrls = new Set(schedule.map((s: any) => s.imageUrl).filter(Boolean));

  console.log(`Current schedule size: ${schedule.length} posts`);
  console.log(`Total uploaded images in state: ${Object.keys(uploadState).length}`);

  let added = 0;
  const keys = Object.keys(uploadState).sort();

  for (const filename of keys) {
    if (added >= limit) break;

    const uploads = uploadState[filename];
    if (!uploads || uploads.length === 0) continue;

    // Use the first successful upload URL
    const imageUrl = uploads[0].url;
    if (scheduledUrls.has(imageUrl)) continue;

    // Extract index from filename (e.g. name-0092.png)
    const match = filename.match(/-(\d{4})\.png$/);
    if (!match) continue;

    const idx = parseInt(match[1]) - 1;
    const post = bulkContent[idx];
    if (!post) continue;

    // Format texts
    let linkedinText = '';
    let instagramText = '';
    let twitterText = '';

    if (post.type === 'stat') {
      const statLine = post.stat && post.stat !== '—' ? `\n🔥 ${post.stat} - ${post.statLabel}\n` : '';
      linkedinText = `📊 ${post.headline}\n${statLine}\n${post.body}\n\nFind your next Web3 role at hashtagweb3.com`;
      instagramText = `📊 ${post.headline}\n${statLine}\n${post.body}\n\nFind your next Web3 role at hashtagweb3.com\n\n#web3 #crypto #blockchain #jobs #careers`;
      twitterText = `📊 ${post.headline}\n${statLine}\nJobs: hashtagweb3.com`;
    } else if (post.type === 'tip') {
      const tipsList = post.tips.map((t: string) => `• ${t}`).join('\n');
      linkedinText = `💡 ${post.headline}:\n\n${tipsList}\n\nFind your next Web3 role at hashtagweb3.com`;
      instagramText = `💡 ${post.headline}:\n\n${tipsList}\n\nFind your next Web3 role at hashtagweb3.com\n\n#web3 #crypto #blockchain #jobs #careers`;
      twitterText = `💡 ${post.headline}:\n${post.tips.slice(0, 2).map((t: string) => `• ${t}`).join('\n')}\nMore: hashtagweb3.com`;
    } else if (post.type === 'chart') {
      const barsList = post.bars.map((b: any) => `• ${b.label}: ${b.display}`).join('\n');
      linkedinText = `📈 ${post.headline}:\n\n${barsList}\n\n${post.footer}\n\nFind your next Web3 role at hashtagweb3.com`;
      instagramText = `📈 ${post.headline}:\n\n${barsList}\n\n${post.footer}\n\nFind your next Web3 role at hashtagweb3.com\n\n#web3 #crypto #blockchain #jobs #careers`;
      twitterText = `📈 ${post.headline}:\n${post.bars.slice(0, 3).map((b: any) => `• ${b.label}: ${b.display}`).join('\n')}\nMore: hashtagweb3.com`;
    }

    const newScheduledItem = {
      id: `post_bulk_${idx + 1}`,
      image: `scripts/social/output/bulk/${filename}`,
      imageUrl: imageUrl,
      linkedin: { text: linkedinText },
      instagram: { text: instagramText },
      twitter: { text: twitterText },
      bluesky: { text: twitterText }
    };

    schedule.push(newScheduledItem);
    scheduledUrls.add(imageUrl);
    added++;
  }

  if (added > 0) {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2), 'utf8');
    console.log(`\n✅ Successfully appended ${added} new posts to content-schedule.json!`);
    console.log(`New total in content-schedule.json: ${schedule.length}`);
  } else {
    console.log('\nNo new uploads found to pipeline.');
  }
}

run().catch(console.error);
