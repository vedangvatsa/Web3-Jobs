import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/events-server';
import { getEventSlug } from '@/lib/events';

export const revalidate = 3600;

const MAX_ITEMS = 200;

function asText(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function escapeXml(value: unknown): string {
  return asText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value: string): string {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

function feedDescription(event: { description: string; city?: string; country?: string; location: string }): string {
  const description = asText(event.description)
    .replace(/\s(?:href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/https?:\/\/[^\s<>'"]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const place = [event.location, event.city, event.country].filter(Boolean).join(', ');
  return [place ? `Location: ${place}` : '', description].filter(Boolean).join('\n\n');
}

export async function GET() {
  const siteUrl = 'https://hashtagweb3.com';
  const today = new Date().toISOString();
  const events = (await getEvents())
    .filter((event) => event.endDate >= today)
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
    .slice(0, MAX_ITEMS);

  const items = events.map((event) => {
    const slug = getEventSlug(event);
    const url = `${siteUrl}/${slug}`;
    const timestamp = Date.parse(event.startDate);
    const pubDate = Number.isFinite(timestamp) ? new Date(timestamp).toUTCString() : new Date().toUTCString();
    const description = feedDescription(event);

    return `    <item>
      <title><![CDATA[${cdata(event.name)}]]></title>
      <link>${url}</link>
      <guid isPermaLink="false">hashtagweb3:event:${escapeXml(event.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${cdata(description)}]]></description>
      <category><![CDATA[${cdata(event.city || 'Web3 Events')}]]></category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hashtag Web3 Events</title>
    <link>${siteUrl}/events</link>
    <description>Upcoming Web3 conferences, meetups, hackathons, and workshops.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/events/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
    },
  });
}
