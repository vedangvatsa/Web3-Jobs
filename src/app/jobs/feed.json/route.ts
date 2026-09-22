import { getJobs } from "@/lib/jobs";
import { getPublicJobUrl } from "@/lib/job-slugs";
import { buildFeedDescription } from "@/lib/job-guides";
import { buildFeedPlainExcerpt, preloadFeedJobDescriptions } from "@/lib/job-feed-helpers";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

function toTime(value?: string): number {
  const t = value ? Date.parse(value) : NaN;
  return Number.isFinite(t) ? (t as number) : 0;
}

export async function GET() {
  const siteUrl = "https://hashtagweb3.com";
  const allJobs = await getJobs();
  const feedJobs = allJobs
    .filter((job) => job.active !== false)
    .sort((a, b) => toTime(b.date) - toTime(a.date))
    .slice(0, 100);
  await preloadFeedJobDescriptions(feedJobs);

  const items = feedJobs.map((job) => {
    const url = getPublicJobUrl(job, siteUrl);
    const excerpt = buildFeedPlainExcerpt(job);
    const contentHtml = buildFeedDescription(job, 2000);

    return {
      id: url,
      url,
      title: `${job.title} at ${job.company}`,
      content_text: excerpt
        ? `${job.title} at ${job.company} (${job.location || "Remote"}). ${excerpt}`
        : `${job.title} at ${job.company} (${job.location || "Remote"}). Apply at: ${url}`,
      content_html: contentHtml,
      date_published: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
      authors: [{ name: job.company }],
      tags: [job.department || "Web3", "Crypto", "Blockchain"].filter(Boolean),
    };
  });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Hashtag Web3 Jobs Feed",
    home_page_url: `${siteUrl}/jobs`,
    feed_url: `${siteUrl}/jobs/feed.json`,
    description: "Verified Web3, smart contract, DeFi, and crypto job openings.",
    items,
  };

  return NextResponse.json(feed, {
    status: 200,
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}
