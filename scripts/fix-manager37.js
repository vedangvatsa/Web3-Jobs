const fs = require("fs");
const path = require("path");

const descsPath = path.join(__dirname, "../content/job-descriptions.json");
const descs = JSON.parse(fs.readFileSync(descsPath, "utf8"));

const cleanHtml = `<p>BitGo is the leading infrastructure provider of digital asset solutions, delivering custody, wallets, staking, trading, financing, and settlement services from regulated cold storage. Since our founding in 2013, we have focused on enabling our clients to securely navigate the digital asset space. With a global presence and multiple Trust companies, BitGo serves thousands of institutions, including many of the industry's top brands, exchanges, and platforms, and millions of retail investors worldwide. As the operational backbone of the digital economy, BitGo handles a significant portion of Bitcoin network transactions and is the largest independent digital asset custodian and staking provider in the world. For more information, visit <a href="https://www.bitgo.com" target="_blank" rel="noopener noreferrer">www.bitgo.com</a>.</p>

<p>We are seeking an energetic and personable individual to spearhead our New York office operations!</p>

<h3>Responsibilities</h3>
<ul>
  <li>Manage all administrative and general office needs at our New York office.</li>
  <li>Oversee the successful management of local vendors and contractors.</li>
  <li>Be the primary contact between the company and building management, making sure all facility needs are met.</li>
  <li>Work with Executive Assistant on event planning including regular social events, external events, Holiday parties, and offsite retreats in partnership with Internal Events Team.</li>
  <li>Work closely with our HR/People Operations team on local Perks and Benefits programs.</li>
  <li>Greet visitors and provide a warm and pleasant experience.</li>
  <li>Ensure we remain compliant with workplace safety expectations.</li>
  <li>Work closely with our Legal team to assess risks and make informed decisions about Employee Health & Safety.</li>
  <li>Issue key cards for new employees and visitor passes to ensure secure access to the office.</li>
  <li>Promote a positive office culture by actively encouraging team members to return to the office, fostering engagement and collaboration among staff.</li>
</ul>

<h3>Requirements</h3>
<ul>
  <li>3+ years of relevant Operations and Facilities experience.</li>
  <li>Experience with facilities operations, including coordinating office moves.</li>
  <li>Empathetic leader with 2+ years of people management experience.</li>
  <li>Well versed in workplace systems, tools, and platforms.</li>
  <li>Experience working with property management teams.</li>
  <li>Experience being on call and managing through emergency situations.</li>
  <li>Strong customer service and hospitality skills.</li>
  <li>Strong project management skills.</li>
  <li>Able to work autonomously, but understand the importance of teamwork.</li>
  <li>Comfortable communicating with and driving decisions alongside our leadership team.</li>
  <li>Innovative mindset — looking to create tomorrow and constantly open to new ideas and technologies.</li>
  <li>Excited to create a world-class Workplace Experience!</li>
</ul>

<h3>Why Join BitGo?</h3>
<p>Disrupting an industry takes vision, innovation, passion, technical chops, drive to deliver, collaboration, and execution. Join a team of great people who strive for excellence and personify our corporate values of ownership, craftsmanship, and open communication. We are looking for new colleagues who bring innovative ways of thinking and problem solving, and who want to be part of the team that changes the world's financial markets.</p>

<h3>Benefits & Perks</h3>
<p>Here are some of the benefits of working at BitGo:</p>
<ul>
  <li>Competitive base salary ($85,000 – $100,000 USD), annual performance bonus, and stock options</li>
  <li>100% company-paid health insurance for employee, partner, and dependents (medical/dental/vision)</li>
  <li>401(k) company match</li>
  <li>Paid parental leave and paid vacation</li>
  <li>Free custom lunches, dinners, and snacks</li>
  <li>Computer equipment and workplace furniture stipend to suit your needs</li>
  <li>Great colleagues and inspiring startup environment</li>
</ul>

<p><em>Cryptocurrencies are the most disruptive change the financial services industry has seen in years. Join us and you'll be able to look back and say you were part of the team that transformed investing.</em></p>

<p><strong>Pay Transparency:</strong> Depending upon your leveling and location, the base salary compensation for this role averages between $85,000 – $100,000 USD. Equity, an annual performance bonus, and comprehensive benefits are also part of this package.</p>`;

descs["greenhouse-bitgo-5047468004"] = cleanHtml;
descs["manager37"] = cleanHtml;

fs.writeFileSync(descsPath, JSON.stringify(descs, null, 2));
console.log("Successfully updated content/job-descriptions.json for manager37!");

const skillPath = path.join(__dirname, "../.agents/skills/hashtagweb3-agent-skill/content/job-descriptions.json");
if (fs.existsSync(skillPath)) {
  fs.writeFileSync(skillPath, JSON.stringify(descs, null, 2));
  console.log("Synced to agent skill job-descriptions.json!");
}
