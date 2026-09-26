import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getEvents } from '../src/lib/events-server';
import { formatEventDate, getEventSlug, normalizeCountry } from '../src/lib/events';
import { EVENTS_REPLY_MARKUP, queueEventMirror, deliverEventMirrors, type EventMirrorQueue } from './lib/telegram-event-mirror';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_EVENTS_CHANNEL_ID || process.env.TELEGRAM_HW3_GROUP_ID;
const threadId = process.env.TELEGRAM_THREAD_ID;
const mirrorChannelId = process.env.TELEGRAM_EVENTS_MIRROR_CHANNEL_ID;
const dryRun = process.argv.includes('--dry-run');
const statePath = path.join(process.cwd(), `.telegram-events-posted-${(channelId || '').replace(/[^a-zA-Z0-9]/g, '')}.json`);
const cooldownPath = path.join(process.cwd(), `.telegram-events-last-${(channelId || '').replace(/[^a-zA-Z0-9]/g, '')}.json`);
const cooldownHours = 4;
const mirrorPath = path.join(process.cwd(), `.telegram-events-mirrors-${(channelId || '').replace(/[^a-zA-Z0-9]/g, '')}.json`);
const mirrors: EventMirrorQueue = fs.existsSync(mirrorPath) ? JSON.parse(fs.readFileSync(mirrorPath, 'utf8')) : {};
function saveMirrors(): void {
  const temporary = `${mirrorPath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(mirrors, null, 2)}\n`);
  fs.renameSync(temporary, mirrorPath);
}
const web3Title = /\b(web3|crypto|blockchain|bitcoin|btc|ethereum|eth\w*|defi|solana|arbitrum|optimism|base|polygon|chainlink|avalanche|avax|zk|zero knowledge|onchain|on-chain|token|stablecoin|wallet|dapp|smart contract|hackathon)\b/i;

if (!dryRun && (!botToken || !channelId || !threadId)) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN, TELEGRAM_EVENTS_CHANNEL_ID, or TELEGRAM_THREAD_ID');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function eventPlace(event: { location?: string; city?: string; country?: string; attendanceMode?: string }): string {
  const location = (event.location || '').trim();
  if (event.attendanceMode === 'online' || /^(?:online|virtual|remote|zoom|google meet|webinar)$/i.test(location)) {
    return 'Online';
  }
  const generic = new Set(['global', 'virtual', 'online', 'tba', 'tbd', 'worldwide', 'remote', 'hybrid', 'various']);
  const city = generic.has((event.city || '').trim().toLowerCase()) ? '' : (event.city || '').trim();
  const normalized = normalizeCountry(event.country);
  const country = normalized === 'United States' ? 'USA' : normalized;
  const place = city && country
    ? (city.toLowerCase() === country.toLowerCase() ? city : `${city}, ${country}`)
    : (city || country || 'Online');
  const parts = place.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) return parts[0];
  return place;
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
    if (!dryRun && mirrorChannelId) {
      const failures = await deliverEventMirrors(mirrors, botToken!, saveMirrors);
      if (failures.length) throw new Error(`Event mirror pending: ${failures.join('; ')}`);
    }
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
  const candidates = available.length >= 1 ? available : upcoming;
  const selected = candidates.slice(0, 3);
  if (!selected.length) throw new Error('No upcoming events available to post.');

  const message = selected.map((event) => {
    const url = `https://hashtagweb3.com/${getEventSlug(event)}/tg`;
    const date = formatEventDate(event.startDate, event.endDate).replace(/ - /g, '–').replace(/, \d{4}/g, '');
    const place = eventPlace(event);
    const name = escapeHtml(event.name);
    return `• <a href="${url}">${name}</a> in ${escapeHtml(place)} on ${escapeHtml(date)}`;
  }).join('\n\n');

  if (dryRun) {
    console.log(`Event destinations: ${channelId || '(group)'} topic ${threadId || '(unset)'}${mirrorChannelId ? ` + ${mirrorChannelId}` : ''}`);
    console.log(
      message.replace(/<a href="[^"]*">([^<]*)<\/a>/g, '$1').replace(/<\/?[^>]+>/g, ''),
    );
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
      disable_web_page_preview: true,
      link_preview_options: { is_disabled: true },
      reply_markup: EVENTS_REPLY_MARKUP,
    }),
  });
  const data = await response.json();
  if (!data.ok || !Number.isInteger(data.result?.message_id) || data.result.message_id <= 0) throw new Error('Telegram event post failed or returned no message receipt');

  if (mirrorChannelId) {
    queueEventMirror(mirrors, channelId!, data.result.message_id, mirrorChannelId);
    saveMirrors();
  }

  selected.forEach((event) => posted.add(event.id));
  fs.writeFileSync(statePath, JSON.stringify([...posted].slice(-500), null, 2));
  fs.writeFileSync(cooldownPath, JSON.stringify({ postedAt: new Date().toISOString() }));
  console.log(`Posted ${selected.length} events to ${channelId} topic ${threadId}; message ID ${data.result.message_id}.`);
  if (mirrorChannelId) {
    const failures = await deliverEventMirrors(mirrors, botToken!, saveMirrors);
    if (failures.length) throw new Error(`Group post succeeded; event mirror pending: ${failures.join('; ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
