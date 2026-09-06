const fs = require("fs");
const path = require("path");

const descsPath = path.join(__dirname, "../content/job-descriptions.json");
const descs = JSON.parse(fs.readFileSync(descsPath, "utf8"));

const cleanHtml = `<p>At CoinDCX, our mission is clear — to make crypto and blockchain accessible to every Indian and enable them to participate in the future of finance.</p>
<p>As India's first crypto unicorn valued at $2.45B, we are reshaping the financial ecosystem by building safe, transparent, and scalable products that power adoption at scale.</p>
<p>We believe that change starts together. It begins with bold ideas, relentless execution and people who want to build what's next.</p>
<p>If you're driven by purpose and thrive in environments where your work defines the next chapter of an industry, you'll feel right at home here.</p>

<h3>What You'll Do</h3>
<p>As a Security Architect in our team, you'll be working with a lot of cross-functional partners like Product, Engineering, Security, and Marketing all the while delivering critical solutions and experiences. You will be responsible for the following key areas:</p>
<ul>
  <li><strong>IAM Strategy & Architecture:</strong> Align and operate enterprise IAM strategy, target architecture, and operating model inline with business, security, and cloud-first objectives.</li>
  <li><strong>Identity Governance & Lifecycle:</strong> Run operational processes to maintain end-to-end identity lifecycle processes covering Joiner-Mover-Leaver (JML), access requests and approvals, provisioning/deprovisioning, RBAC, role management, and periodic access reviews.</li>
  <li><strong>Authentication & Access Management:</strong> Ensure alignment of operations with SSO, MFA, Conditional Access, federation, and secure access patterns across SaaS applications, cloud platforms, and enterprise systems.</li>
  <li><strong>Non-Human & Machine Identities:</strong> Govern service accounts, workload identities, API credentials, automation identities, machine-to-machine access, and emerging AI/agentic identities.</li>
  <li><strong>Privileged Access Management:</strong> Secure operations and monitoring covering privileged identities, JIT/JEA access, credential management, session controls, privileged access monitoring, and integration with enterprise PAM solutions.</li>
  <li><strong>Cloud & Endpoint Identity:</strong> Design identity solutions across the organization's cloud and end-user environment.</li>
  <li><strong>Technology Evaluation & Implementation:</strong> Lead IAM requirements, RFI/RFP, vendor evaluations, PoCs, technology selection, and implementation planning, while assessing the evolution of the current JumpCloud-based environment.</li>
  <li><strong>IAM Standards & Governance:</strong> Establish IAM policies, standards, reference architectures, integration patterns, operational processes, and identity/application ownership models.</li>
  <li><strong>Stakeholder & Compliance Management:</strong> Partner with Security, Infrastructure, Cloud, DevOps, HR, Engineering, Compliance, and Application teams to drive secure IAM operations.</li>
</ul>

<h3>You'll Excel in This Role If You Have</h3>
<ul>
  <li>Bachelor's degree in Computer Science, Information Technology, or a related technical field.</li>
  <li>12+ years of experience in Information Security and supporting technologies.</li>
  <li>7+ years designing enterprise IAM architectures.</li>
  <li>Experience building IAM programs from strategy through implementation.</li>
  <li>Strong experience in cloud-native environments and identity governance.</li>
  <li>Preferred certifications such as CEH, CISSP, CCSP, or IAM/vendor-specific certifications such as SailPoint, Saviynt, Okta, CyberArk, AWS, or equivalent.</li>
  <li>Strong understanding of Identity and Access Management (IAM) concepts, including authentication, authorization, identity lifecycle, federation, and access governance.</li>
  <li>Experience designing and delivering IAM solutions across cloud, SaaS, and enterprise environments.</li>
  <li>Good understanding of IAM standards and technologies such as SSO, MFA, SAML, OAuth/OIDC, SCIM, RBAC, and directory services.</li>
  <li>Experience with identity lifecycle management, access governance, privileged access, and periodic access reviews.</li>
  <li>Exposure to cloud, application, API, machine, and other non-human identity use cases is desirable.</li>
  <li>Familiarity with leading IAM, IGA, or PAM platforms and experience participating in technology evaluation, PoCs, or implementations.</li>
  <li>Ability to translate business and security requirements into practical, scalable IAM solutions.</li>
  <li>Strong communication and stakeholder management skills, with the ability to work effectively with both technical and business teams.</li>
  <li>Strong problem-solving and analytical skills, with the ability to manage multiple priorities and drive initiatives in a fast-paced environment.</li>
</ul>

<h3>Perks That Empower You</h3>
<p>Our benefits are designed to make a lasting impact on your life, giving you the freedom to create a work-life balance that truly suits you.</p>
<ul>
  <li><strong>Design Your Own Benefit:</strong> Tailor your perk package to fit your unique needs. Whether you're eyeing a new gadget or welcoming a furry friend into your life, our flexible benefits ensure that you can prioritize what matters most to you.</li>
  <li><strong>Unlimited Wellness Leaves:</strong> We believe in the power of well-being. Take the time you need to recharge, knowing that your health is our priority. With unlimited wellness leaves, you can return refreshed, ready to build and grow.</li>
  <li><strong>Mental Wellness Support:</strong> Your mental health is as important as your professional growth. Benefit from access to health experts, free counseling sessions, monthly wellness workshops, and regular team outings, all designed to help you stay balanced and connected.</li>
  <li><strong>Bi-Weekly Learning Sessions:</strong> These sessions are more than just updates — they're opportunities to fuel your growth. Stay ahead with the latest industry knowledge, sharpen your skills, and accelerate your career in an ever-evolving landscape.</li>
</ul>`;

descs["coindcx-1789"] = cleanHtml;
descs["coindcx1789"] = cleanHtml;

fs.writeFileSync(descsPath, JSON.stringify(descs, null, 2));
console.log("Successfully updated content/job-descriptions.json for coindcx1789!");

const skillPath = path.join(__dirname, "../.agents/skills/hashtagweb3-agent-skill/content/job-descriptions.json");
if (fs.existsSync(skillPath)) {
  fs.writeFileSync(skillPath, JSON.stringify(descs, null, 2));
  console.log("Synced to agent skill job-descriptions.json!");
}
