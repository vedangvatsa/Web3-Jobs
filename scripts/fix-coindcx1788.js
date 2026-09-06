const fs = require("fs");
const path = require("path");

const descsPath = path.join(__dirname, "../content/job-descriptions.json");
const descs = JSON.parse(fs.readFileSync(descsPath, "utf8"));

const cleanHtml = `<p>At CoinDCX, we are on a mission to lead the change towards a decentralised world, and we believe our employees are at the heart of it.</p>
<p>Our journey over the past five years has been exhilarating as we have made significant strides — from becoming a unicorn to being a compliant exchange, onboarding over 15 million users, to launching an innovative self-custodial DeFi app. Now, we are ready to bring our finance skills into play and help drive our efforts to innovate and expand the VDA, Web3 and blockchain space. As part of our finance team, you will be responsible for maintaining the financial records of the firm, regulating cash flow across all departments, and handling overseas accounts while at the same time maintaining focus on Indian clients.</p>
<p>If you're familiar with financial coding and GST & RBI regulations in relation to cryptocurrency, you are exactly who we're looking for!</p>
<p>With 2+ crore Indians trusting us, our ultimate goal is to make VDA accessible to every Indian and we're looking for equally talented VDA and Web3 enthusiasts to join us in our journey to bring in this change together. Coin your trust in us as we create magic together!</p>

<h3>Who You Are</h3>
<ul>
  <li>Even if you don't know everything about VDA, you love to learn and solve for it</li>
  <li>You take ownership and have a thirst for excellence</li>
  <li>You have a result-oriented and impact-driven mindset</li>
  <li>You grow while helping others grow with you</li>
  <li>You have an attention to detail and passion for quality</li>
  <li>You thrive on change</li>
  <li>You're passionate about everything VDA and Web3.0</li>
  <li>You love exploring new ideas to build something useful</li>
  <li>You are always curious to learn more</li>
</ul>

<h3>Role Summary</h3>
<p>We are looking for an experienced <strong>Associate Director - Finance</strong> to strengthen and scale the finance function of a fast-growing, technology-led Web3 and VDA business.</p>
<p>This is a critical finance leadership role with responsibility across financial consolidation and reporting, reconciliations, controllership, treasury and accounts payable, internal controls, and finance transformation. The role will partner closely with the Head of Finance and senior leadership to strengthen governance, improve reporting quality, and build scalable finance processes.</p>

<h3>Key Responsibilities</h3>
<h4>1. Financial Consolidation & Reporting</h4>
<ul>
  <li>Lead the month-end and year-end close, group consolidation, and financial reporting across multiple entities.</li>
  <li>Drive intercompany reconciliations, eliminations, consolidation adjustments, and standardisation of accounting and reporting practices.</li>
  <li>Oversee critical reconciliations across intercompany balances, VDA/crypto assets, INR/fiat balances, banks, customer assets and liabilities, exchanges, and other key accounts.</li>
  <li>Ensure timely identification, investigation, and resolution of reconciliation breaks, aged items, and reporting differences.</li>
  <li>Drive automation and process improvements to enable faster closes and stronger financial insights.</li>
</ul>

<h4>2. Treasury & Accounts Payable Management</h4>
<ul>
  <li>Oversee cash and liquidity management, banking operations, fund movements, and payment governance.</li>
  <li>Strengthen accounts payable, vendor payments, ageing, and payment controls.</li>
  <li>Improve cash visibility, forecasting, automation, and efficiency across treasury and payment processes.</li>
  <li>Build strong ownership, review mechanisms, and controls across treasury and AP operations.</li>
</ul>

<h4>3. Internal Controls & Finance Process Transformation</h4>
<ul>
  <li>Strengthen ICFR, internal controls, and governance across key finance processes.</li>
  <li>Identify control gaps, operational risks, and process inefficiencies and drive sustainable remediation.</li>
  <li>Drive automation and standardisation across finance systems, reconciliations, and operational processes.</li>
  <li>Partner with Technology, Data, and business teams on ERP optimisation and finance transformation initiatives.</li>
  <li>Support internal and external audits and ensure timely closure of audit observations.</li>
</ul>

<h4>4. Strategic Finance & IPO Readiness</h4>
<ul>
  <li>Support strategic initiatives including fundraising, M&A, financial due diligence, and new business initiatives.</li>
  <li>Partner with senior leadership on complex financial, accounting, and business matters.</li>
  <li>Help build finance processes, reporting, and governance capabilities aligned with a larger and more mature organisation.</li>
  <li>Exposure to IPO readiness, financial reporting, and governance will be an added advantage.</li>
</ul>

<h3>You'll Excel If You Have</h3>
<h4>Experience</h4>
<ul>
  <li>8-10 years of relevant post-qualification experience in finance, controllership, accounting, financial reporting, or consolidation.</li>
  <li>Strong experience in consolidation, financial reporting, reconciliations, ICFR/internal controls, and audit management.</li>
  <li>Experience in treasury management and accounts payable oversight will be preferred.</li>
  <li>Experience in a Big 4 and/or high-growth, technology-led or complex business environment will be an advantage.</li>
  <li>Exposure to Fintech, Financial Services, Payments, Crypto/VDA or similar industries will be preferred.</li>
</ul>

<h4>Education</h4>
<ul>
  <li>Chartered Accountant (CA) is mandatory.</li>
  <li>An additional MBA or relevant professional qualification will be an advantage.</li>
</ul>

<h4>Systems & Technology</h4>
<ul>
  <li>Strong understanding of finance systems, ERP platforms, and finance process automation.</li>
  <li>Experience in finance transformation, process improvement, or ERP implementation.</li>
  <li>Oracle NetSuite experience will be preferred.</li>
  <li>Interest in leveraging automation, analytics, and AI to improve finance processes and controls.</li>
</ul>

<h4>Leadership & Mindset</h4>
<ul>
  <li>Strong leadership and people-management capabilities.</li>
  <li>Ability to operate both strategically and hands-on in a fast-paced environment.</li>
  <li>Strong analytical, problem-solving, and stakeholder management skills.</li>
  <li>High ownership, accountability, and focus on execution.</li>
  <li>A builder mindset with the ability to standardise, scale, and continuously improve finance processes and teams.</li>
</ul>

<h3>You'll Know You're Winning When</h3>
<p>Within 12-18 months, you will be expected to:</p>
<ul>
  <li>Strengthen and scale group consolidation, financial reporting, and critical reconciliation processes.</li>
  <li>Improve the quality, accuracy, and timeliness of financial reporting and month-end closure.</li>
  <li>Build stronger treasury, payment governance, and finance controls.</li>
  <li>Develop a high-performing finance team with clear ownership and accountability.</li>
  <li>Strengthen finance systems and processes to support the organisation's next phase of growth.</li>
</ul>

<h3>Hiring Process</h3>
<p>Here's what your journey with us looks like:</p>
<ul>
  <li><strong>Application Review:</strong> We assess for skills, alignment, and intent</li>
  <li><strong>Recruiter Connect:</strong> A short conversation to understand you better</li>
  <li><strong>Functional Round(s):</strong> Deep dive into your approach, craft, and problem-solving</li>
  <li><strong>Assignment / Simulation Round:</strong> A take-home task or live problem-solving exercise to understand how you think and execute in real scenarios (depends on role)</li>
  <li><strong>Culture & Values Discussion:</strong> A conversation to understand our ways of working and how you thrive best</li>
  <li><strong>Founder Conversation (Optional):</strong> For certain roles and senior levels, you may meet our founders to explore strategic alignment and long-term fit</li>
</ul>

<h3>Where We Work</h3>
<p>We believe the best ideas emerge when people build together. Collaboration, speed, and trust come alive when teams share the same space.</p>
<p>We operate as a work-from-office organisation. This role is based out of our Mumbai office, where energy, alignment, and innovation move in real time.</p>

<h3>Perks That Empower You</h3>
<p>We believe great people deserve great experiences.</p>
<ul>
  <li><strong>Design Your Own Benefits:</strong> Flexible perks to match your lifestyle</li>
  <li><strong>Unlimited Wellness Leaves:</strong> Rest and recharge as you need</li>
  <li><strong>Mental Wellness Support:</strong> Access to therapy and wellness resources</li>
  <li><strong>Learning Sessions:</strong> Bi-weekly learning and growth opportunities</li>
</ul>

<h3>Ready to Build What's Next?</h3>
<p>If you're looking for a role that gives you direct access to high-stakes decisions, deep impact, and a chance to build the future of finance, this is it.</p>
<p>Join CoinDCX and help us make crypto accessible to every Indian, together.</p>`;

descs["coindcx-1788"] = cleanHtml;
descs["coindcx1788"] = cleanHtml;

fs.writeFileSync(descsPath, JSON.stringify(descs, null, 2));
console.log("Successfully updated content/job-descriptions.json!");

const skillPath = path.join(__dirname, "../.agents/skills/hashtagweb3-agent-skill/content/job-descriptions.json");
if (fs.existsSync(skillPath)) {
  fs.writeFileSync(skillPath, JSON.stringify(descs, null, 2));
  console.log("Synced to agent skill job-descriptions.json!");
}
