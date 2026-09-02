const banned = [
  "revolutionize", "revolutionary", "game-changer", "game changer",
  "unlock", "seamless", "cutting-edge", "cutting edge", "unprecedented",
  "supercharge", "amplify", "accelerate", "the future of", "elevate your",
  "lifeblood", "authentic", "the ultimate", "transform your", "limitless"
];

const prs = [
  // PR 1
  `Hashtag Web3 Adapts Platform for AI Search Engine Crawling
SINGAPORE, May 25, 2026 - Hashtag Web3 updated its server architecture and crawler policies to allow artificial intelligence search engines to index its career resources. The platform completed optimizations for Google AI Overviews, ChatGPT Search, and Perplexity.

The updates include configuring robots.txt to permit indexing by OAI-SearchBot and PerplexityBot, while blocking standard training scrapers to protect intellectual property. Hashtag Web3 also deployed a comprehensive llms.txt file containing 500 cataloged URLs across career guides and Web3 terminology. All glossary pages now render server-side without Javascript, allowing AI crawlers to parse term definitions in under 400 milliseconds.

As part of the optimization, the platform restructured article layouts to use question-based headings and 150-word standalone paragraphs. This format matches direct query patterns, which increases citation rates in AI-generated answers.`,

  // PR 2
  `Hashtag Web3 Integrates PostHog Event Tracking and Optimizes Page Speeds
SINGAPORE, May 25, 2026 - Hashtag Web3 deployed PostHog event tracking to capture real-time job seeker interactions and search intent. The integration monitors job views, application button clicks, debounced search queries, and newsletter signups while maintaining privacy-safe data standards.

During the analytics setup, developers resolved a database performance bottleneck on the glossary pages. Previously, the system compiled more than 200 markdown files into HTML on every page load, creating server delays. The update separates the list view from the full-text compiler and enforces static site generation.

The performance update reduces glossary page load times by approximately 80 percent. Users now receive search results and page updates instantly. Debounced event tracking tracks user search terms after a 500-millisecond delay, which helps map job market trends without impacting browser performance.`,

  // PR 3
  `Hashtag Web3 Automates Job Board Distribution via LinkedIn API
SINGAPORE, May 25, 2026 - Hashtag Web3 launched a scheduled posting system to distribute new Web3 job listings automatically to its LinkedIn corporate channel. The integration uses the LinkedIn Share API and OAuth authorization to publish company roles.

The system runs as a scheduled routine, reading new job listings from the Firestore database and formatting them for social sharing. The script uses secure credentials stored in Firebase Secret Manager and automatically enforces a two-second delay between posts to comply with LinkedIn rate limits.

Automatic posts include the role title, company name, salary range, and direct referral links. The automation reduces manual social media publishing time by 3 hours per week. If a post fails due to token expiration, the error-handling module logs the issue and alerts administrators for a quick secure refresh.`
];

let failed = false;

prs.forEach((pr, i) => {
  console.log(`Checking PR ${i + 1}...`);
  
  // Check emdashes
  if (pr.includes('—') || pr.includes('–')) {
    console.error(`❌ PR ${i + 1} contains an em-dash or en-dash!`);
    failed = true;
  }
  
  // Check banned phrases
  banned.forEach(word => {
    if (pr.toLowerCase().includes(word)) {
      console.error(`❌ PR ${i + 1} contains banned phrase: "${word}"`);
      failed = true;
    }
  });
});

if (!failed) {
  console.log('✅ All press releases passed verification! Zero banned words or dashes found.');
} else {
  process.exit(1);
}
