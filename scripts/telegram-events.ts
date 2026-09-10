import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getEvents } from '../src/lib/events-server';
import { formatEventDate, getEventSlug } from '../src/lib/events';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_EVENTS_CHANNEL_ID || process.env.TELEGRAM_HW3_GROUP_ID;
const threadId = process.env.TELEGRAM_THREAD_ID;
const dryRun = process.argv.includes('--dry-run');
const statePath = path.join(process.cwd(), `.telegram-events-posted-${(channelId || '').replace(/[^a-zA-Z0-9]/g, '')}.json`);
const cooldownPath = path.join(process.cwd(), `.telegram-events-last-${(channelId || '').replace(/[^a-zA-Z0-9]/g, '')}.json`);
const cooldownHours = 6;
const web3Title = /\b(web3|crypto|blockchain|bitcoin|btc|ethereum|eth\w*|defi|solana|arbitrum|optimism|base|polygon|chainlink|avalanche|avax|zk|zero knowledge|onchain|on-chain|token|stablecoin|wallet|dapp|smart contract|hackathon)\b/i;

if (!dryRun && (!botToken || !channelId || !threadId)) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN, TELEGRAM_EVENTS_CHANNEL_ID, or TELEGRAM_THREAD_ID');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadIds(filePath: string): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch {
    return new Set();
  }
}

function onCooldown(): boolean {
  if (process.argv.includes('--force')) return false;
  try {
    const { postedAt } = JSON.parse(fs.readFileSync(cooldownPath, 'utf8'));
    return Date.now() - new Date(postedAt).getTime() < cooldownHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

async function main() {
  if (onCooldown()) {
    console.log('Events digest is still on cooldown.');
    return;
  }

  const posted = loadIds(statePath);
  const events = await getEvents();
  const upcoming = events.filter((event) =>
    new Date(event.startDate).getTime() > Date.now() &&
    (event.source === 'curated-premier' || web3Title.test(event.name))
  );
  const available = upcoming.filter((event) => !posted.has(event.id));
  const candidates = available.length ? available : upcoming;
  const selected = candidates.slice(0, 1);
  if (!selected.length) throw new Error('No upcoming events available to post.');

  const lines = selected.map((event) => {
    const url = `https://hashtagweb3.com/${getEventSlug(event)}?utm_source=telegram&utm_medium=social&utm_campaign=events_digest`;
    return `<a href="${url}"><b>${escapeHtml(event.name)}</b></a>\n${escapeHtml(formatEventDate(event.startDate, event.endDate))} · ${escapeHtml(event.location)}`;
  });
  const message = lines.join('\n');

  if (dryRun) {
    console.log(message.replace(/<[^>]+>/g, ''));
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      message_thread_id: Number(threadId),
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'More Events',
            url: 'https://hashtagweb3.com/events/tg',
          },
        ]],
      },
    }),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram API error: ${JSON.stringify(data)}`);

  selected.forEach((event) => posted.add(event.id));
  fs.writeFileSync(statePath, JSON.stringify([...posted].slice(-500), null, 2));
  fs.writeFileSync(cooldownPath, JSON.stringify({ postedAt: new Date().toISOString() }));
  console.log(`Posted ${selected.length} event to ${channelId} topic ${threadId}; message ID ${data.result.message_id}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
