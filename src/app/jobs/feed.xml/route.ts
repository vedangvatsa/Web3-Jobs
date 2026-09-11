import { getJobs } from "@/lib/jobs";
import { getJobSlug } from "@/lib/job-slugs";
import { NextResponse } from "next/server";
import type { Job } from "@/types";

export const revalidate = 3600; // Cache for 1 hour on CDN

const MAX_ITEMS = 100;
// Cap per-item HTML so one giant posting can't bloat the whole feed.
const MAX_DESC_CHARS = 8000;

// Location strings that carry no geo signal for indexers (ATS codes,
// placeholders). Normalized to null so we omit rather than mislead.
const JUNK_LOCATION = new Set([
  "on_site",
  "onsite",
  "on-site",
  "namer",
  "apac",
  "emea",
  "latam",
  "tba",
  "tbd",
  "n/a",
  "na",
  "none",
  "tbc",
  "various",
  "multiple",
  "multiple locations",
  "to be announced",
  "to be determined",
  "flexible",
]);

function normalizeLocation(raw?: unknown): string | null {
  const loc = asText(raw).trim().replace(/\s+/g, " ");
  if (!loc) return null;
  if (JUNK_LOCATION.has(loc.toLowerCase())) return null;
  return loc;
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  try {
    return String(value);
  } catch {
    return '';
  }
}

function departmentOf(job: Job): string {
  const dept = typeof job.department === 'string'
    ? job.department
    : (job.department as unknown as { name?: unknown } | null)?.name;
  const text = asText(dept).trim();
  return text || 'Web3 / Crypto';
}

function escapeXml(unsafe: unknown): string {
  return asText(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// CDATA blocks must not contain "]]>" — split it safely if present.
function cdata(safe: string): string {
  return (safe || "").replace(/]]>/g, "]]]]><![CDATA[>");
}

// Strip dangerous markup from scraped job HTML while keeping basic
// formatting (p/ul/li/headings/links) that indexers expect.
function sanitizeDescriptionHtml(raw: string): string {
  let html = raw || "";
  // Remove executable / interactive elements entirely
  html = html.replace(/<script[\s\S]*?<\/script\s*>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style\s*>/gi, "");
  html = html.replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, "");
  html = html.replace(/<(object|embed|form|input|button|select|textarea|meta|link|base)[\s\S]*?(?:<\/\1\s*>|>)/gi, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  // Drop event-handler attributes (onclick=, onerror=, ...)
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript:/vbscript: URLs
  html = html.replace(/\s(href|src)\s*=\s*("|\')\s*javascript:[^"']*("|\')/gi, ' $1="#"');
  html = html.replace(/\s(href|src)\s*=\s*("|\')\s*vbscript:[^"']*("|\')/gi, ' $1="#"');
  // Feeds expose only the Hashtag Web3 detail page, never scraped source URLs.
  html = html.replace(/\s(?:href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\bhttps?:\/\/[^\s<>'"]+/gi, "");
  return html.trim();
}

function truncateHtmlAtBoundary(html: string, limit: number): string {
  if (html.length <= limit) return html;
  const slice = html.slice(0, limit);
  const boundaries = ["</p>", "</li>", "</ul>", "</ol>", "</h1>", "</h2>", "</h3>", "</h4>", "<br", "</blockquote>"];
  let cut = -1;
  for (const b of boundaries) {
    const i = slice.lastIndexOf(b);
    if (i > cut) cut = i;
  }
  if (cut > limit * 0.3) {
    const tag = boundaries.find((b) => slice.lastIndexOf(b) === cut);
    return slice.slice(0, cut + (tag === "<br" ? 0 : tag!.length));
  }
  return slice;
}

function toTime(value?: string): number {
  const t = value ? Date.parse(value) : NaN;
  return Number.isFinite(t) ? (t as number) : 0;
}

function buildItem(job: Job, siteUrl: string, nowRfc822: string): string {
  const slug = getJobSlug(job);
  const url = `${siteUrl}/${slug}`;
  const time = toTime(job.date);
  const pubDate = time ? new Date(time).toUTCString() : nowRfc822;
  const title = `${asText(job.title)} at ${asText(job.company)}`;
  const location = normalizeLocation(job.location);
  const department = departmentOf(job);
  // Stable, non-URL guid so slug rebakes never duplicate items downstream.
  const guid = `hashtagweb3:${job.id}`;

  const headerHtml = [
    `<p><strong>Company:</strong> ${escapeXml(job.company)}</p>`,
    `<p><strong>Position:</strong> ${escapeXml(job.title)}</p>`,
    location ? `<p><strong>Location:</strong> ${escapeXml(location)}</p>` : "",
    `<p><strong>Category:</strong> ${escapeXml(department)}</p>`,
  ]
    .filter(Boolean)
    .join("\n");

  const fullDesc = sanitizeDescriptionHtml(job.description || "");
  const bodyHtml = fullDesc ? truncateHtmlAtBoundary(fullDesc, MAX_DESC_CHARS) : "";

  const canonicalLine = `<p><a href="${url}">View full job details and apply on Hashtag Web3</a></p>`;
  const descriptionHtml = [headerHtml, bodyHtml, canonicalLine]
    .filter(Boolean)
    .join("\n");

  return `    <item>
      <title><![CDATA[${cdata(title)}]]></title>
      <link>${url}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${cdata(descriptionHtml)}]]></description>
      <category><![CDATA[${cdata(department)}]]></category>
    </item>`;
}

export async function GET() {
  const siteUrl = "https://hashtagweb3.com";
  const allJobs = await getJobs();
  // Newest first; drop anything explicitly inactive. The cache refresh
  // already retains active direct-ATS postings — this is a backstop.
  const feedJobs = allJobs
    .filter((job) => job.active !== false)
    .sort((a, b) => toTime(b.date) - toTime(a.date))
    .slice(0, MAX_ITEMS);
  const nowRfc822 = new Date().toUTCString();

  const itemsXml = feedJobs.map((job) => buildItem(job, siteUrl, nowRfc822)).join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hashtag Web3 Jobs - Verified Crypto &amp; Web3 Careers</title>
    <link>${siteUrl}/jobs</link>
    <description>Find verified Web3, smart contract, DeFi, and crypto job openings. Updated daily for builders, engineers, and operators.</description>
    <language>en-us</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${siteUrl}/jobs/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}
