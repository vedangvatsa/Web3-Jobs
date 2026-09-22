import { getJobs } from '@/lib/jobs';
import { getPublicJobUrl } from '@/lib/job-slugs';
import { buildFeedDescription } from '@/lib/job-guides';
import { getRecentFeedJobs } from '@/lib/job-feed-helpers';
import { NextResponse } from 'next/server';
import type { Job } from '@/types';

export const revalidate = 3600; // Revalidate every hour

/**
 * Jora-shaped XML feed (<jobs><job> per support.jora.com spec).
 * Mandatory: title, id, description (HTML), url. Highly preferable:
 * location, jobtype, listed/closing dates, salary, organisation.
 * All links stay on hashtagweb3.com; descriptions carry no outbound URLs.
 */

const COUNTRY_ISO: Record<string, string> = {
  'united states': 'US', usa: 'US', 'united states of america': 'US',
  'united kingdom': 'GB', uk: 'GB', england: 'GB',
  canada: 'CA', australia: 'AU', singapore: 'SG', germany: 'DE',
  france: 'FR', netherlands: 'NL', india: 'IN', ireland: 'IE',
  spain: 'ES', switzerland: 'CH', uae: 'AE', 'united arab emirates': 'AE',
  dubai: 'AE', japan: 'JP', brazil: 'BR', italy: 'IT', portugal: 'PT',
  poland: 'PL', sweden: 'SE', norway: 'NO', denmark: 'DK', finland: 'FI',
  austria: 'AT', belgium: 'BE', 'hong kong': 'HK', 'south korea': 'KR',
  korea: 'KR', vietnam: 'VN', thailand: 'TH', indonesia: 'ID',
  malaysia: 'MY', philippines: 'PH', 'new zealand': 'NZ', israel: 'IL',
  turkey: 'TR', 'türkiye': 'TR', mexico: 'MX', argentina: 'AR', chile: 'CL',
  colombia: 'CO',
};

function cdata(value: unknown): string {
  return String(value || '').replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function splitLocation(location: string): { city?: string; country?: string } {
  const raw = (location || '').trim();
  if (!raw || /remote/i.test(raw) && !/,/.test(raw)) return {};
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].toLowerCase();
    const iso = COUNTRY_ISO[last];
    const city = parts[0].includes('/') ? undefined : parts[0];
    return { city, country: iso };
  }
  if (/remote/i.test(raw)) return {};
  return { city: raw.includes('/') ? undefined : raw };
}

function mapJobType(job: Job): string {
  const text = `${(job as Job & { type?: unknown }).type || ''} ${job.title} ${job.department || ''}`.toLowerCase();
  if (/part-time|parttime|intern/.test(text)) return 'Part time';
  if (/contract|freelance|consultant|temporary|casual/.test(text)) return 'Contract';
  return 'Full time';
}

function parseSalary(salary: unknown): { type: string; min: string; max: string; currency: string } | null {
  if (typeof salary !== 'string') return null;
  const m = salary.match(/([A-Z]{3})?\s*\$?\s*([\d,]+)\s*-\s*(?:([A-Z]{3})\s*)?\$?\s*([\d,]+)\s*per\s*(year|month|week|day|hour)/i);
  if (!m) return null;
  const currency = (m[1] || m[3] || '').toUpperCase();
  if (!currency) return null;
  const period = m[5].toLowerCase();
  const type = period === 'year' ? 'yearly' : period === 'month' ? 'monthly' : period === 'week' ? 'weekly' : period === 'day' ? 'daily' : 'hourly';
  return { type, min: m[2].replace(/,/g, ''), max: m[4].replace(/,/g, ''), currency };
}

function isoDate(dateStr?: string, plusDays = 0): string {
  const base = dateStr ? Date.parse(dateStr) : Date.now();
  const ts = Number.isFinite(base) ? base : Date.now();
  return new Date(ts + plusDays * 24 * 3600 * 1000).toISOString();
}

export async function GET() {
  const siteUrl = 'https://hashtagweb3.com';
  const feedJobs = (await getRecentFeedJobs(await getJobs())).slice(0, 250);

  const jobNodes = feedJobs.map((job) => {
    const url = `${getPublicJobUrl(job, siteUrl)}?utm_source=jora&utm_medium=xml&utm_campaign=feed`;
    const location = (job.location || 'Remote').trim();
    const { city, country } = splitLocation(location);
    const description = buildFeedDescription(job)
      .replace(/https?:\/\/[^\s<>'"]+/gi, '')
      .replace(/&amp;/g, '&');
    const salary = parseSalary((job as Job & { salary?: unknown }).salary);
    const listed = isoDate(job.date);
    const closing = isoDate(job.date, 60); // Jora default expiry when absent

    return `  <job>
    <title><![CDATA[${cdata(job.title)}]]></title>
    <id><![CDATA[${cdata(job.id)}]]></id>
    <listed_date>${listed}</listed_date>
    <closing_date>${closing}</closing_date>
    <organisation><![CDATA[${cdata(job.company)}]]></organisation>
    <location><![CDATA[${cdata(location)}]]></location>${city ? `\n    <city><![CDATA[${cdata(city)}]]></city>` : ''}${country ? `\n    <country>${country}</country>` : ''}
    <description><![CDATA[${description}]]></description>${salary ? `\n    <salary>
      <type>${salary.type}</type>
      <min>${salary.min}</min>
      <max>${salary.max}</max>
      <currency>${salary.currency}</currency>
    </salary>` : ''}
    <jobtype><![CDATA[${mapJobType(job)}]]></jobtype>
    <url><![CDATA[${url}]]></url>
  </job>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<jobs>
${jobNodes.join('\n')}
</jobs>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
    },
  });
}
