const fs = require("fs");
const path = require("path");

const descsPath = path.join(__dirname, "../content/job-descriptions.json");
const descs = JSON.parse(fs.readFileSync(descsPath, "utf8"));

const cleanHtml = `<h3>About Us</h3>
<p>Founded 20 years ago and headquartered in Chicago, the DV Group of financial services firms has grown to more than 600 people operating throughout North America, Europe, and Asia. Since spinning out of a large brokerage firm in 2016, DV Trading has rapidly scaled as an independent proprietary trading firm utilizing its own capital, trading strategies, and risk management methodologies to provide liquidity to worldwide financial markets and hedging opportunities to commodity producers and users. Today, DV Group affiliates include two broker-dealers, a cryptocurrency market making firm (DV Chain), and a burgeoning investment adviser.</p>

<h3>Overview</h3>
<p>In this role, you will work directly with our Development, Trading, and IT organizations to ensure that trading operations are optimized and healthy. You will work on continuously improving our ability to identify and resolve issues related to trading, as well as provide world-class support to traders. You will also help drive strategic projects across the firm, with a focus on improving our trading operations and the technology that supports our traders.</p>

<h3>Job Responsibilities</h3>
<ul>
  <li>Monitor and manage trading platforms across multiple crypto and financial markets.</li>
  <li>Monitor and support Linux production trading environments.</li>
  <li>Work directly with trade teams assisting with onboarding new trading opportunities.</li>
  <li>Collaborate with technical and non-technical stakeholders to help drive business initiatives.</li>
  <li>Identify and solve complex operational and infrastructure problems that most cannot.</li>
  <li>Drive automation and process improvements across trading infrastructure.</li>
</ul>

<h3>Requirements</h3>
<ul>
  <li>Experience in a trade support or trading operations role.</li>
  <li>Strong knowledge of the Linux operating system.</li>
  <li>Knowledge of networking concepts including TCP/IP and Multicast.</li>
  <li>Intermediate Bash scripting and core Python development ability (prior experience with large Python projects preferred).</li>
  <li>Ability to trace order event streams using logs and packet captures.</li>
  <li>Ability to operate effectively in a fast-paced, entrepreneurial environment.</li>
</ul>

<p><em>DV Chain is proud to be an equal opportunity employer and committed to creating an inclusive environment for all employees.</em></p>`;

descs["greenhouse-dvchain-4523955004"] = cleanHtml;
descs["engineer250"] = cleanHtml;

fs.writeFileSync(descsPath, JSON.stringify(descs, null, 2));
console.log("Successfully updated content/job-descriptions.json for engineer250!");

const skillPath = path.join(__dirname, "../.agents/skills/hashtagweb3-agent-skill/content/job-descriptions.json");
if (fs.existsSync(skillPath)) {
  fs.writeFileSync(skillPath, JSON.stringify(descs, null, 2));
  console.log("Synced to agent skill job-descriptions.json!");
}
