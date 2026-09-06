const fs = require("fs");
const path = require("path");

const descsPath = path.join(__dirname, "../content/job-descriptions.json");
const descs = JSON.parse(fs.readFileSync(descsPath, "utf8"));

const cleanHtml = `<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://phantom.com">Phantom</a> is on a mission to connect the world to the freedom of open markets. Tens of millions of people all over the world use Phantom to access global markets that never close, including perpetuals, prediction markets, tokenized assets, stablecoins, and memes. Phantom users are able to discover the markets that matter and the cultural moments that shape them, building conviction through real-time data and the verified performance of top traders. With self-custody and access to open networks at its core, Phantom lets them control their financial moves in the same app they use to safely store or spend money worldwide.</p>
<p>Phantom has reached #1 in Google Play's finance category and consistently ranks in the top 50 apps across all categories. Phantom partners with many of the most trusted and influential names in finance like Hyperliquid, Stripe, Kalshi, and Visa to make the most popular and innovative financial products accessible to everyone.</p>
<p>We are around 180 people, fully remote, backed by a $150M Series C investment from a16z, Sequoia Capital, and Paradigm.</p>

<h3>Responsibilities</h3>
<p>As a Staff Backend Engineer on our Money Movement team, you will blend systems thinking with product pragmatism and a real passion for crypto. You’ll design, maintain, and evolve the backend services and APIs that connect Phantom Cash to blockchains. You understand both client-server architecture and blockchain protocols, and you know how to balance reliability, quality, and speed. You communicate clearly across pods, document rigorously, and elevate the engineering bar through execution and mentorship. Your work will make Phantom Cash feel dependable, seamless, and ready to scale.</p>

<h3>Qualifications</h3>
<ul>
  <li>Bachelor's degree in Computer Science, related technical field, or equivalent practical experience.</li>
  <li>Pragmatic engineering mindset, focused on results and user impact, not abstract purity.</li>
  <li>Proactive and outcome-oriented: anticipates problems, pushes features to completion without waiting for perfect specs.</li>
  <li>Strong communicator and pragmatic problem solver — explains complexity simply, favors progress over perfection.</li>
  <li>Node.js / NestJS at scale; event-driven design (queues, retries, idempotency).</li>
  <li>REST API architecture: versioning, pagination, error models, authentication, rate-limiting.</li>
  <li>Full-stack awareness: understands trade-offs of state management (client vs server) and latency budgets.</li>
  <li>Distributed-systems fundamentals: concurrency, ordering, retries, data consistency.</li>
</ul>

<h3>Nice to Have</h3>
<ul>
  <li>Kubernetes + AWS ops; CI/CD; observability; on-call ownership.</li>
  <li>Deep interest in crypto — keeps up with ecosystem changes, wallets, protocols, and security norms.</li>
  <li>Previous hands-on experience in crypto or fintech (exchanges, wallets, payment rails, ledgers).</li>
  <li>Smart-contract and protocol understanding: knows how on-chain programs interact with off-chain services.</li>
  <li>Blockchain integration experience — Solana preferred, EVM acceptable.</li>
  <li>Has shipped high-quality products in mature, high-bar engineering organizations.</li>
</ul>

<h3>Why Work with Us</h3>
<p>We are a team of experienced builders in the blockchain and crypto industry. Our journey began from users seeking an easy, seamless path to accessing the crypto ecosystem. This passion fueled our exponential growth, allowing us to onboard over 7M+ active users in just over three years, with our user base growing weekly. Our dedication to a secure and seamless user experience has made us the leading wallet on Solana, while our multi-chain approach enhances our platform's versatility, meeting the needs of a diverse and growing user base. By staying at the forefront of technology and user expectations, we continue to innovate and set industry standards on self-custodial crypto wallets.</p>
<p>There has never been a better time to work in crypto to help shape the future of innovation with a focus around the wallet experience!</p>
<ul>
  <li><strong>First impressions matter:</strong> Wallets are responsible for a user's first impression with crypto and onboarding new users into crypto. By ensuring that a user has a great first-time experience with crypto, we can help supercharge the growth of the entire ecosystem.</li>
  <li><strong>Make crypto easier to navigate:</strong> There is no easy way for a user to discover and navigate all that crypto has to offer. Wallets have a unique opportunity to help users not only onboard to crypto but also stay retained by exploring new things to do.</li>
  <li><strong>We live in a multi-chain world:</strong> We currently support Solana, Ethereum, Polygon, and Bitcoin with more networks to come in the near future. We are focused on creating a unified, multi-chain crypto experience for users.</li>
</ul>

<h3>Benefits</h3>
<ul>
  <li>Competitive salary and equity</li>
  <li>Comprehensive insurance (medical/dental/vision) — Employee 100% covered</li>
  <li>Stipend for your ideal remote set-up</li>
  <li>Flexible hours and a supportive remote environment</li>
  <li>Unlimited vacation: Take time when you need it (and we really mean it!)</li>
  <li>401(k) retirement plan</li>
  <li>Monthly wellness benefit</li>
  <li>Weekly meal benefit</li>
  <li>Global off-sites</li>
</ul>

<p><strong>We strongly encourage candidates of all backgrounds to apply.</strong> We believe that our work is stronger with a variety of perspectives, and we’re eager to further diversify our company. If you have a background that you feel would make an impact at Phantom, please consider applying. We’re committed to building an inclusive, supportive place for you to do the best work of your career.</p>`;

descs["ashby-phantom-01acfd54-49c2-4913-a968-fc70fcf61e12"] = cleanHtml;
descs["backend61e12"] = cleanHtml;

fs.writeFileSync(descsPath, JSON.stringify(descs, null, 2));
console.log("Successfully updated content/job-descriptions.json for backend61e12!");

const skillPath = path.join(__dirname, "../.agents/skills/hashtagweb3-agent-skill/content/job-descriptions.json");
if (fs.existsSync(skillPath)) {
  fs.writeFileSync(skillPath, JSON.stringify(descs, null, 2));
  console.log("Synced to agent skill job-descriptions.json!");
}
