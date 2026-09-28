import path from 'path';
import dotenv from 'dotenv';
import { getEvents } from '../src/lib/events-server';
import { formatEventDate, getEventSlug, normalizeCountry } from '../src/lib/events';
import { EVENTS_REPLY_MARKUP, deliverEventMirrors, type EventMirrorQueue } from './lib/telegram-event-mirror';
import { deliverEventsOnce, selectUnpostedEvents } from './lib/telegram-event-delivery';
import { eventStatePaths, persistEventState, readEventState, writeEventState, type EventDeliveries } from './social/telegram-event-state';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_EVENTS_CHANNEL_ID || process.env.TELEGRAM_HW3_GROUP_ID;
const threadId = process.env.TELEGRAM_THREAD_ID;
const mirrorChannelId = process.env.TELEGRAM_EVENTS_MIRROR_CHANNEL_ID;
const dryRun = process.argv.includes('--dry-run');
const files = eventStatePaths(channelId || '@hashtagweb3');
const cooldownHours = 4;
async function flushMirrors(): Promise<void> {
  const mirrors = readEventState<EventMirrorQueue>(files.mirrors, {});
  const failures = await deliverEventMirrors(mirrors, botToken!, claimKey => {
    writeEventState(files.mirrors, mirrors);
    persistEventState({ validateRemote: remote => {
      if (!claimKey) return;
      const previous = (remote.get(path.basename(files.mirrors)) as EventMirrorQueue | undefined)?.[claimKey];
      if (previous?.deliveredMessageId || previous?.status === 'reserved') throw new Error('Event mirror already delivered or reserved by another run');
    } });
  });
  if (failures.length) throw new Error(`Event mirror pending: ${failures.join('; ')}`);
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
  const country = normalized === 'United States' ? 'USA'
    : normalized === 'United Arab Emirates' ? 'UAE' : normalized;
  const place = city && country
    ? (city.toLowerCase() === country.toLowerCase() ? city : `${city}, ${country}`)
    : (city || country || 'Online');
  const parts = place.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) return parts[0];
  return place;
}

function onCooldown(): boolean {
  if (process.argv.includes('--force')) return false;
  const last = readEventState<{ postedAt: string } | undefined>(files.last, undefined);
  return Boolean(last && Date.now() - Date.parse(last.postedAt) < cooldownHours * 60 * 60 * 1000);
}

async function main() {
  if (!dryRun) {
    persistEventState({ syncOnly: true });
    await flushMirrors();
  }
  const ledger = readEventState<EventDeliveries>(files.deliveries, {});
  if (Object.values(ledger).some(entry => entry.status === 'reserved')) throw new Error('Unconfirmed Telegram event delivery requires review before another send');
  if (onCooldown()) {
    console.log('Events digest is still on cooldown.');
    return;
  }

  const posted = readEventState<string[]>(files.posted, []);
  const events = await getEvents();
  const upcoming = events.filter((event) =>
    new Date(event.startDate).getTime() > Date.now() &&
    (event.source === 'curated-premier' || web3Title.test(event.name))
  );
  const selected = selectUnpostedEvents(upcoming, posted, ledger);
  if (!selected.length) { console.log('No unposted upcoming events available; skipping.'); return; }

  const message = selected.map((event) => {
    const url = `https://hashtagweb3.com/${getEventSlug(event)}/tg`;
    const date = formatEventDate(event.startDate, event.endDate, event.timezone).replace(/ - /g, '–').replace(/, \d{4}/g, '');
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

  await deliverEventsOnce({ events: selected, chatId: channelId!, threadId: Number(threadId), mirrorChannelId,
    force: process.argv.includes('--force'), send: async () => {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
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
      if (!response.ok && data.ok !== false) throw new Error('Telegram returned an unconfirmed response');
      return data;
  } });
  await flushMirrors();
}

main().catch((error) => {
  console.error((error instanceof Error ? error.message : String(error)).replaceAll(botToken || '\0', '[redacted]'));
  process.exit(1);
});
