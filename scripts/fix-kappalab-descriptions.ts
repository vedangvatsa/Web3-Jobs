import fs from 'fs';
import path from 'path';

const quantTraderHtml = `<div>
<h3>About Kappa Lab:</h3>
<p>Kappa Lab is a digital-assets market maker. We provide continuous, round-the-clock liquidity across 50+ centralised and decentralised exchanges, quoting a wide range of assets. Our proprietary technology and quantitative models let us price consistently and respond quickly across every venue we trade.</p>
<p>&nbsp;</p>
<h3>About the role:</h3>
<p>As a Quantitative Trader you will join a hands-on trading team, taking ownership of live market-making strategies while researching and prototyping new ones. This is a role for someone who enjoys the challenge of achieving high performance and PnL plus the analytical side of markets and the engineering that makes trading work in practice.</p>
<p>&nbsp;</p>
<h3>What you will do:</h3>
<ul>
<li>Own live market-making strategies: tune quoting parameters, spreads, sizing and hedging, and diagnose and improve performance</li>
<li>Research, prototype and launch new quantitative strategies across venues and asset classes</li>
<li>Analyse execution quality in depth - fill quality, adverse selection, realised spreads, and trading costs</li>
<li>Work in our configuration-as-code platform, where strategy parameters are version-controlled, reviewed and deployed like software</li>
<li>Monitor live trading and manage risk through volatile market conditions</li>
<li>Work closely with engineering on the systems you trade through, and contribute code to them yourself</li>
</ul>
<p>&nbsp;</p>
<h3>What we are looking for:</h3>
<ul>
<li>Strong quantitative reasoning and real comfort applying statistics to noisy, fast-moving data</li>
<li>Production-grade Python: code others can maintain, sensible use of version control, and the ability to debug a live system under pressure</li>
<li>Evidence you can turn large market datasets into a decision and clearly explain your reasoning</li>
<li>Familiarity with cryptocurrency markets, blockchain technology, and trading concepts</li>
<li>Sound judgement about risk: knowing when to size down, hedge or stop</li>
<li>A proactive mindset and ability to spot opportunities, move fast, and make things happen</li>
</ul>
<p>&nbsp;</p>
<h3>Strongly valued:</h3>
<ul>
<li>Experience in market making, high-frequency trading, or systematic execution</li>
<li>Proficiency in Rust</li>
<li>Familiarity with DeFi and on-chain execution</li>
</ul>
<p>&nbsp;</p>
<h3>Location and Working Style:</h3>
<p>We have offices in London (UK) and Dubai (UAE) and operate on a hybrid basis.</p>
<p>&nbsp;</p>
<h3>Application process:</h3>
<p>Please submit your CV and a brief cover letter telling us about the below:</p>
<p>1. What is your personal interest in trading and/or betting? Please include any relevant experience, especially with crypto.</p>
<p>2. What software have you written yourself? Tell us about projects you have built or would like to build (can be personal or professional).</p>
<p>&nbsp;</p>
<p><i>Kappa Lab is an equal opportunities employer committed to creating an inclusive and diverse workplace. We welcome applications from all individuals and do not discriminate based on race, colour, nationality, ethnicity, religion or belief, sex, sexual orientation, gender identity or expression, marital status, pregnancy or maternity, disability, or age.</i></p>
</div>`;

const bdManagerHtml = `<div>
<h3>Company Description</h3>
<p>Kappa Lab is a digital assets market maker committed to delivering 24/7 deep liquidity and enhancing market efficiency.</p>
<h3>Role Overview</h3>
<p>As a Business Development Manager (BDM), your core responsibilities include generating qualified leads and forging strong partnerships within exchanges, projects, web3 builders and institutional partners. We also expect you to manage and enhance existing relationships, expanding our business footprint with partners.</p>
<h3>Responsibilities</h3>
<ul>
<li>Build and manage your own pipeline of leads and business opportunities.
  <ul>
    <li>Keeping track of industry and DeFi trends, key launches</li>
    <li>Assess on-chain/DeFi business opportunities</li>
  </ul>
</li>
<li>Provide detailed analysis on these opportunities - this could be a new exchange deal or market opportunity.</li>
<li>Develop existing partnerships by understanding partners' needs and devising effective solutions.
  <ul>
    <li>Relay partners' needs to the team to facilitate collaborative solution development.</li>
    <li>Design and discuss product solutions that cater to market demands.</li>
  </ul>
</li>
<li>Expand your professional network by attending industry events and conferences.</li>
</ul>
<h3>Qualifications</h3>
<ul>
<li>Crypto/Web3 native - with a strong interest and understanding of DeFi</li>
<li>Excellent communication skills both verbal and written</li>
<li>Strong follow-up discipline and ownership of next steps</li>
<li>Seniority is flexible. We value crypto-native curiosity, commercial instinct, and strong ownership, and are open to shaping the role around the right candidate.</li>
</ul>
<h3>Location & Working Style</h3>
<p>We have offices in London (UK) and Dubai (UAE) and operate on a hybrid basis.</p>
<p>&nbsp;</p>
<p><i>Kappa Lab is an equal opportunities employer committed to creating an inclusive and diverse workplace. We welcome applications from all individuals and do not discriminate on the basis of race, color, nationality, ethnicity, religion or belief, sex, sexual orientation, gender identity or expression, marital status, pregnancy or maternity, disability, or age. We value and respect the unique contributions each person brings and strive to ensure everyone can thrive and grow in our organization.</i></p>
</div>`;

function fixDescriptions() {
  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  let descriptions: Record<string, string> = {};
  if (fs.existsSync(descPath)) {
    descriptions = JSON.parse(fs.readFileSync(descPath, 'utf8'));
  }

  // Set entries for both ID and link keys
  descriptions['kappa-lab-quant-trader-297472'] = quantTraderHtml;
  descriptions['https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/?ref=aHR0cHM6Ly9hcHAuZ29oaXJlLmlvLw=='] = quantTraderHtml;
  descriptions['https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/'] = quantTraderHtml;
  descriptions['kappalabquanttrader297472'] = quantTraderHtml;
  descriptions['trader'] = quantTraderHtml;

  descriptions['kappa-lab-bd-manager-292292'] = bdManagerHtml;
  descriptions['https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/business-development-manager-market-making-292292/?ref=aHR0cHM6Ly9hcHAuZ29oaXJlLmlvLw=='] = bdManagerHtml;
  descriptions['https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/business-development-manager-market-making-292292/'] = bdManagerHtml;
  descriptions['kappalabbusinessdevelopmentmanager292292'] = bdManagerHtml;
  descriptions['bd'] = bdManagerHtml;

  fs.writeFileSync(descPath, JSON.stringify(descriptions, null, 2));
  console.log('Successfully injected rich formatted HTML job descriptions into content/job-descriptions.json');
}

fixDescriptions();
