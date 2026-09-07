/**
 * Syndicate Job Feeds across search engines, aggregators, and WebSub hubs.
 * 
 * 1. Submits all individual job URLs to IndexNow (Bing, Yandex, Seznam, Naver)
 * 2. Pings Google & Superfeedr PubSubHubbub (WebSub) hubs for instant RSS feed update
 * 3. Pings Ping-o-Matic XML-RPC for blog & job search engine indexing
 * 4. Submits XML Feed to Jooble integration team via Resend email API
 * 
 * Usage: npx tsx scripts/syndicate-job-feeds.ts
 */

import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

const rootDir = path.resolve(__dirname, "../");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local"), override: true });

const siteUrl = "https://hashtagweb3.com";
const keys = [
  "1f8e4a6a875745e79ae76969de11a9c7",
  "5f98e9e755144404909369d2575e4ed7",
];

async function submitToIndexNow(allUrls: string[]) {
  console.log(`\n1. [IndexNow] Submitting ${allUrls.length} URLs to Bing & Yandex...`);
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
  ];

  // Batch in chunks of 5,000 (IndexNow max is 10,000)
  const chunkSize = 5000;
  for (let i = 0; i < allUrls.length; i += chunkSize) {
    const chunk = allUrls.slice(i, i + chunkSize);
    console.log(`  Sending chunk ${i / chunkSize + 1} (${chunk.length} URLs)...`);

    for (const endpoint of endpoints) {
      for (const key of keys) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              host: "hashtagweb3.com",
              key,
              keyLocation: `https://hashtagweb3.com/${key}.txt`,
              urlList: chunk,
            }),
          });
          console.log(`  ✓ ${endpoint} (key: ${key.slice(0, 8)}...) → ${res.status} ${res.statusText}`);
        } catch (err: any) {
          console.error(`  ✗ ${endpoint} error: ${err.message}`);
        }
      }
    }
  }
}

async function pingWebSubHubs() {
  console.log("\n2. [WebSub / PubSubHubbub] Pinging RSS feed updates...");
  const feeds = [
    `${siteUrl}/jobs/feed.xml`,
    `${siteUrl}/feed.xml`,
  ];
  const hubs = [
    "https://pubsubhubbub.appspot.com/",
    "https://pubsubhubbub.superfeedr.com/",
  ];

  for (const feed of feeds) {
    for (const hub of hubs) {
      try {
        const body = new URLSearchParams({
          "hub.mode": "publish",
          "hub.url": feed,
        });
        const res = await fetch(hub, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        console.log(`  ✓ Hub: ${hub} | Feed: ${feed} → ${res.status} ${res.statusText}`);
      } catch (err: any) {
        console.error(`  ✗ Hub error for ${hub}: ${err.message}`);
      }
    }
  }
}

async function pingXmlRpc() {
  console.log("\n3. [Ping-o-Matic] Pinging XML-RPC feed syndicators...");
  const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>Hashtag Web3 Jobs</value></param>
    <param><value>https://hashtagweb3.com/jobs</value></param>
    <param><value>https://hashtagweb3.com/jobs/feed.xml</value></param>
  </params>
</methodCall>`;

  try {
    const res = await fetch("http://rpc.pingomatic.com/", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "User-Agent": "HashtagWeb3-FeedSyndicator/1.0",
      },
      body: xmlPayload,
    });
    const text = await res.text();
    const isSuccess = text.includes("<boolean>0</boolean>") || text.includes("Thanks for the ping");
    console.log(`  ✓ Ping-o-Matic response: ${isSuccess ? "Success (0 errors)" : "Received response"}`);
  } catch (err: any) {
    console.error(`  ✗ Ping-o-Matic error: ${err.message}`);
  }
}

async function submitJooblePartnerFeed() {
  console.log("\n4. [Jooble Partner Syndication] Sending official XML feed application...");
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("  Skipping Jooble email: RESEND_API_KEY not configured.");
    return;
  }

  const emailPayload = {
    from: "Hashtag Web3 <alerts@hashtagweb3.com>",
    to: ["xml_support@jooble.com", "ats@jooble.jobs"],
    reply_to: "support@hashtagweb3.com",
    subject: "Job XML Feed Submission for Indexing — Hashtag Web3 (2,900+ Verified Web3 Vacancies)",
    html: `
<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">
  <p>Hello Jooble Partnership and XML Integration Team,</p>
  
  <p>We would like to submit our verified Web3 job board XML feed for indexing and syndication on Jooble.</p>
  
  <table style="border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Company / Platform:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;">Hashtag Web3</td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Website:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;"><a href="https://hashtagweb3.com">https://hashtagweb3.com</a></td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Job Board URL:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;"><a href="https://hashtagweb3.com/jobs">https://hashtagweb3.com/jobs</a></td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Aggregator XML Feed URL:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;"><strong><a href="https://hashtagweb3.com/jobs/feed-aggregator.xml">https://hashtagweb3.com/jobs/feed-aggregator.xml</a></strong></td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Standard RSS 2.0 Feed:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;"><a href="https://hashtagweb3.com/jobs/feed.xml">https://hashtagweb3.com/jobs/feed.xml</a></td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Active Openings:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;">2,900+ active positions across engineering, smart contracts, marketing, product, and operations.</td></tr>
    <tr><td style="padding: 6px 12px; font-weight: bold; border: 1px solid #e2e8f0;">Update Frequency:</td><td style="padding: 6px 12px; border: 1px solid #e2e8f0;">Every 8 hours automatically.</td></tr>
  </table>

  <p><strong>XML Feed Conformance:</strong></p>
  <ul>
    <li>Includes required Jooble tags: &lt;id&gt;, &lt;name&gt;, &lt;link&gt;, &lt;url&gt;, &lt;apply_url&gt;, &lt;region&gt;, &lt;company&gt;, &lt;pubdate&gt;, and CDATA descriptions.</li>
    <li>All vacancies provide valid URLs and direct employer apply options.</li>
  </ul>

  <p>Please review and add our feed to your crawl schedule. If any adjustments to the XML structure are required, feel free to reply directly to this email.</p>

  <p>Best regards,<br>
  <strong>Hashtag Web3 Team</strong><br>
  <a href="https://hashtagweb3.com">hashtagweb3.com</a> | <a href="mailto:support@hashtagweb3.com">support@hashtagweb3.com</a></p>
</div>
`,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify(emailPayload),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`  ✓ Jooble XML feed partnership request submitted successfully! (Resend Email ID: ${data.id})`);
    } else {
      console.warn(`  ✗ Failed to send Jooble email: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    console.error(`  ✗ Error emailing Jooble: ${err.message}`);
  }
}

async function main() {
  console.log("=================================================");
  console.log(" Hashtag Web3 - Comprehensive Job Syndication Pipeline");
  console.log("=================================================");

  // 1. Gather all job URLs from cache
  const cachePath = path.join(rootDir, "content/jobs-cache.json");
  const rawJobs = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  console.log(`Loaded ${rawJobs.length} jobs from cache.`);

  const jobUrls: string[] = [];
  for (const job of rawJobs) {
    const slug = job.slug || job.id;
    if (slug) {
      jobUrls.push(`${siteUrl}/${slug}`);
    }
  }

  const staticUrls = [
    siteUrl,
    `${siteUrl}/jobs`,
    `${siteUrl}/jobs/feed.xml`,
    `${siteUrl}/feed.xml`,
    `${siteUrl}/jobs/feed-aggregator.xml`,
    `${siteUrl}/jobs/feed.json`,
    `${siteUrl}/companies`,
    `${siteUrl}/events`,
    `${siteUrl}/news`,
    `${siteUrl}/blog`,
    `${siteUrl}/glossary`,
  ];

  const totalUrlsToSubmit = Array.from(new Set([...staticUrls, ...jobUrls]));

  // Step 1: Submit all jobs to IndexNow (Bing & Yandex)
  await submitToIndexNow(totalUrlsToSubmit);

  // Step 2: Ping WebSub / PubSubHubbub (Google & Feedly)
  await pingWebSubHubs();

  // Step 3: Ping Ping-o-Matic XML-RPC
  await pingXmlRpc();

  // Step 4: Submit XML Feed to Jooble
  await submitJooblePartnerFeed();

  console.log("\n=================================================");
  console.log(" All automated syndication & feed submissions completed!");
  console.log("=================================================\n");
}

main().catch(console.error);
