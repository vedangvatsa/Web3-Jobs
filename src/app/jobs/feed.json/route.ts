import { getJobs } from "@/lib/jobs";
import { getJobSlug } from "@/lib/job-slugs";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const siteUrl = "https://hashtagweb3.com";
  const allJobs = await getJobs();
  const feedJobs = allJobs.slice(0, 100);

  const items = feedJobs.map((job) => {
    const slug = getJobSlug(job);
    const url = `${siteUrl}/${slug}`;
    const applyUrl = job.link || url;

    return {
      id: url,
      url,
      external_url: applyUrl,
      title: `${job.title} at ${job.company}`,
      content_text: `${job.title} at ${job.company} (${job.location || "Remote"}). Apply at: ${applyUrl}`,
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
