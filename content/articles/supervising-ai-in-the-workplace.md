---
title: 'Supervising AI in the Workplace: Human Oversight, Rules, and Practical Setup'
data-ai-hint: manager reviewing AI system output
description: >-
  Supervising AI in the workplace means keeping a trained person able to
  understand, check, and stop AI that affects work. Learn who must supervise,
  what the EU AI Act, US DOL guidance, and NIST require, and how to set up
  oversight that holds up in an audit.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

Supervising AI in the workplace means a trained person can understand what the system does, check its output before it affects people, and stop or correct it when needed. The person is accountable for the outcome, not the model.

This guide explains what supervision covers, who must do it, how it works in practice, what the law requires in the EU and the US, and how to build a setup you can defend to workers, auditors, and regulators.

## What is supervising AI in the workplace

Supervision is the set of human and technical measures that keep AI within its intended limits while it is in use.

It includes:

- **Governance.** Who owns the system, who can change it, and who can pause it. Roles are written down and assigned to real people.
- **Monitoring.** Logging inputs, outputs, tool calls, and decisions so you can trace why an action happened.
- **Review.** Checking outputs for accuracy, bias, and safety before they drive a significant decision such as hiring, performance rating, task allocation, pay, discipline, or termination.
- **Intervention.** The ability to disregard, override, or halt the system. For high-risk systems under the EU AI Act, this includes a stop button or similar procedure that leaves the system in a safe state. Source: Regulation (EU) 2024/1689, Article 14 paragraphs 1 to 4(e) at https://artificialintelligenceact.eu/article/14/ and official text at https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689

Supervision does not end at design or training. Article 14 requires effective oversight during the period of use. The provider must create conditions for oversight, and the deployer must assign it to natural persons with competence, training, and authority. See also Article 26(2) on deployer duties. Oversight measures must be proportionate to risk, autonomy, and context of use.

NIST frames the same idea as human-led risk management across the AI life cycle. The AI Risk Management Framework 1.0, released January 26, 2023, organizes work into Govern, Map, Measure, and Manage. Documentation must explain knowledge limits and how output may be used and overseen by humans. Source: https://www.nist.gov/itl/ai-risk-management-framework and https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf

ISO/IEC 42001:2023 covers the same ground for an AI management system. It requires an organization to define scope, assign leadership, assess risks, control the AI system life cycle, and run performance evaluation and improvement. Annex A lists controls for policies, human oversight, data management, and supplier oversight. Certification is voluntary, valid for three years with annual surveillance, and does not replace EU AI Act duties. Source: https://www.iso.org/standard/42001

## Who this guide is for

- **Managers and founders** who decide where AI assists work. You need to know which decisions still need a human check and how to prove that check happened.
- **People operations, HR, and ops leads** who run hiring, scheduling, performance, and support tools. You own the workflow where AI sits, even when a vendor built the model.
- **Builders and IT** who configure models, prompts, or agents that act on worker or candidate data. You choose permissions, logging, and approval gates.
- **Web3 teams** with distributed staff and on-chain systems. You combine off-chain AI for sourcing, support, or risk monitoring with on-chain logs and contracts that can enforce limits.

If you only use AI for low-risk help such as drafting a job description or summarizing notes a human wrote, supervision can be light. If AI ranks candidates, monitors performance, assigns shifts, or sets pay, you need formal oversight.

## How supervision works: mechanics, not marketing

### 1. Three levels of human control

Teams use these levels to match oversight to risk. NIST and EU guidance both point to proportional oversight.

- **Human in the loop.** The system proposes, a person approves before any significant action. Use for hiring screens, pay changes, and discipline. Highest friction, strongest control.
- **Human on the loop.** The system acts within pre-approved bounds but a person monitors live, reviews samples, and can intervene. Use for high-volume help desk drafts or shift suggestions where harm is reversible.
- **Human in command.** The organization sets policy, training, and audit that bounds the system over time. A person does not check each output, but the system cannot take significant actions and all uses are logged for later review. Use for low-risk writing help or internal knowledge search.

Pick the level by impact. An AI that suggests training modules needs less review than one that flags workers for performance action.

### 2. Where supervision sits in the workflow

Map every step where AI touches worker or candidate data.

- **Input.** What data the system sees. Resume text, keystrokes, video, warehouse sensor feeds, or performance history. Inputs shape outputs, so limit collection to what is job-related.
- **Processing.** Parser, matcher, ranker, or generative model. Record model name, version, and instructions for use. Note if the tool generates a score, tag, or ranking.
- **Output and hand-off.** How the result moves to a person. Is it a draft, a shortlist with reasons, or an auto-reject? Auto-actions need tighter gates.
- **Decision and log.** Who approved, when, and why. Keep the log immutable for a retention window so an auditor can replay the chain.

### 3. What the system must let a person do

EU Article 14(4) lists five abilities the deployer must have, as appropriate and proportionate:

- Understand capacities and limitations and monitor the operation including anomalies and unexpected performance.
- Stay aware of automation bias, the tendency to over-rely on the output, especially for information or recommendations.
- Correctly interpret the output using available tools and methods.
- Decide not to use the system or disregard, override, or reverse its output in any particular situation.
- Intervene or interrupt with a stop control that leaves the system in a safe state.

For remote biometric identification in Annex III point 1(a) cases, Article 14(5) adds a two-person rule. No action on an identification may be taken unless verified and confirmed by at least two competent persons. This does not apply where Union or national law treats it as disproportionate for law enforcement, migration, border control, or asylum.

### 4. The vendor is not the owner of risk

You own the outcome of a tool you deploy. On July 12, 2024, the US District Court for the Northern District of California ruled in Mobley v. Workday, Inc., No. 3:23-cv-00770, that a vendor providing AI screening tools can be an agent of the employer under Title VII and related laws. The court later allowed the agent theory to proceed, and by mid-2025 the court addressed collective certification questions. Workday denies wrongdoing. The point for you is that both provider and deployer can face claims. See EEOC technical assistance of May 18, 2023 on assessing adverse impact, and EEOC ADA guidance of May 2022.

You cannot shift liability by contract. Put vendor cooperation on audits, logging, data, and notice duties in writing before you buy.

## Rules you must follow

### United States - DOL principles and best practices

The US Department of Labor issued Artificial Intelligence and Worker Well-being: Principles for Developers and Employers on May 16, 2024, and detailed Principles and Best Practices on October 16, 2024. The documents are non-binding but map directly to existing law. Release: https://www.dol.gov/newsroom/releases/osec/osec20241016

Eight principles:

1. Centering worker empowerment. Get early and regular input from workers and, where unionized, bargain in good faith on design, testing, training, use, and oversight.
2. Ethically developing AI. Set standards that protect civil rights, safety, and performance. Do impact assessments and independent audits and publish results. Build systems that allow ongoing human oversight and retrospective review. Explain operation so non-technical users can understand it.
3. Establishing governance and human oversight. Create governance structures accountable to leadership, incorporate worker input, train staff broadly, and ensure meaningful human oversight for significant employment decisions. Document those decisions, procedures for human review, and remedies for adverse impacts.
4. Ensuring transparency. Give advance notice of what is used, what data is collected and why, and how it is used. Let workers view and request correction of identifiable data without retaliation.
5. Protecting labor and employment rights. Do not use AI to chill organizing or reduce health, safety, wages, break time, or benefits. Audit for adverse impacts by race, color, national origin, religion, sex, disability, age, and genetic information, and make results available in appropriate form.
6. Using AI to enable workers. Pilot before full deployment, limit monitoring to the least invasive means for a defined business purpose, and share productivity gains with workers where feasible.
7. Supporting workers impacted by AI. Provide training, prioritize internal redeployment, and connect with workforce systems for upskilling.
8. Ensuring responsible use of worker data. Minimize collection and retention, secure data, and get informed consent before sharing outside the business.

The October 2024 best practices repeat a clear line: do not rely on AI systems, or on information collected through electronic monitoring, to make significant employment decisions without meaningful human oversight.

On January 20, 2025 and January 23, 2025, executive orders revoked prior AI executive orders and related guidance pages. Several EEOC and DOL pages were removed or archived. Federal anti-discrimination statutes did not change. Title VII, the Americans with Disabilities Act, and the Age Discrimination in Employment Act still apply whether the decision involved a human or a system. See https://www.eeoc.gov/laws/guidance/select-issues-assessing-adverse-impact-software-algorithms-and-artificial-intelligence-used and iTutorGroup consent judgment of August 2023 on age bias for context.

### New York City - Local Law 144

Passed in 2021, effective January 1, 2023, enforced from July 5, 2023 by the Department of Consumer and Worker Protection. It applies when an automated employment decision tool substantially assists or replaces discretionary decisions for roles in New York City. The tool includes machine learning, statistical modeling, data analytics, or AI that generates a score, tag, or ranking.

Requirements:

- A bias audit by an independent auditor within one year before use. Calculate selection rates and impact ratios for race or ethnicity and sex categories aligned to EEO-1 Component 1 and the four-fifths method in 29 CFR 1607.4D.
- A public summary on your careers site.
- Notice to each candidate or employee 10 business days before use, with data sources and retention information and how to request an alternative process.

The law requires you to have and publish an audit. It does not require a passing score. Published audits often show impact ratios below 0.80 or large unknown groups, which signals where to investigate. ACLU tracker: https://github.com/aclu-national/tracking-ll144-bias-audits Official page: https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page

### Illinois and other states

- **Illinois Artificial Intelligence Video Interview Act, 820 ILCS 42, effective January 1, 2020.** For AI analysis of video interviews of Illinois applicants: give notice that AI may be used, explain how it works and what general characteristics it uses, get consent, limit sharing to those with expertise to evaluate fitness, and delete the video and copies within 30 days of a request including backups. If selection rests solely on AI for who gets an in-person interview, report race and ethnicity data to the Department of Commerce and Economic Opportunity by December 31 each year. Source: https://law.justia.com/codes/illinois/chapter-820/act-820-ilcs-42/
- **Illinois HB 3773 amending 775 ILCS 5/2-102, effective January 1, 2026.** Defines AI to include generative AI, bars AI that causes discrimination or uses ZIP codes as a proxy, and requires notice when AI is used for recruitment, hiring, promotion, renewal, training selection, discharge, discipline, or terms of employment. Enforcement by the Illinois Department of Human Rights.
- **Maryland, effective 2020.** Requires written consent before facial recognition in interviews. Code: Md. Lab. and Empl. Sec. 3-717.
- **Colorado Artificial Intelligence Act, SB 24-205, signed 2024, effective February 1, 2026.** Requires reasonable care to avoid algorithmic discrimination for high-risk systems including employment, with impact assessments and disclosures.

### EU - the EU AI Act

Regulation (EU) 2024/1689 entered into force August 1, 2024. Source: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689

- **High-risk list.** Annex III point 4 lists employment AI as high-risk. It covers AI used for recruitment or selection, especially to place targeted job ads, to analyse and filter applications, and to evaluate candidates, plus AI used to make decisions on promotion, termination, task allocation, or monitoring of performance. No minimum threshold.
- **What high-risk means.** Articles 9 to 15 require a risk management system, data governance, technical documentation, logging under Article 12, accuracy testing, and human oversight under Articles 14 and 26, plus transparency to deployers under Article 13. Deployers have duties under Article 26 and 50 to use the system per instructions, assign oversight to competent people, ensure input data is relevant, monitor operation, inform the provider of serious incidents, and inform workers that they are subject to an AI system.
- **Prohibited practices.** Article 5 prohibits emotion inference in work and education from February 2, 2025. A video tool that claims to detect enthusiasm or stress from a face or voice in a work context is prohibited, not just high-risk.
- **Dates.** Prohibitions applied February 2, 2025. General-purpose AI rules applied August 2, 2025. High-risk obligations for Annex III apply August 2, 2026, with the Digital Omnibus Regulation (EU) 2026/1744 deferring standalone Annex III compliance to December 2, 2027 and certain Annex I systems to 2028. Treat August 2, 2026 as the planning date until counsel confirms the deferral for your system. Build logging, documentation, and oversight now. Phasing depends on whether the system is embedded or standalone. See timeline at https://artificialintelligenceact.eu/implementation-timeline/
- **Penalties.** Article 99 sets fines for high-risk violations up to 15 million euros or 3 percent of worldwide annual turnover, whichever is higher. Higher for prohibited practices. Member state authorities, data protection authorities, and labor inspectorates can enforce, alongside GDPR Article 22 which already limits solely automated decisions with legal or similar effect.

### NIST AI Risk Management Framework 1.0

Released January 26, 2023. Voluntary, but referenced by regulators and auditors. Use it to structure your program. See https://www.nist.gov/itl/ai-risk-management-framework

- **Govern.** Set roles, policies, accountability, and worker input. Define who can grant, change, or revoke AI authority.
- **Map.** List where AI touches decisions, who is affected, and what harm could occur. Include context and intended use for each system.
- **Measure.** Test accuracy and bias with sliced tests by group. Track precision and recall by requisition and stage, not only overall. Retest when you change criteria, thresholds, or model versions. Keep knowledge limits documented.
- **Manage.** Put controls in place: human review before adverse action, logs, appeal paths, and periodic audits. Update controls when monitoring shows drift.

The companion Generative AI Profile NIST AI 600-1, released July 26, 2024, adds guidance on hallucinations, provenance, and grounding for generative tools. Source: https://doi.org/10.6028/NIST.AI.600-1

## Pros and cons

**Where supervision helps:**

- **Fewer bad decisions at scale.** A single screen checked once can affect hundreds of applicants. A human check catches parsing failures, mis-ranked candidates, and test drift before offers go out.
- **Better record quality.** Logs of inputs, outputs, approvals, and overrules give you answers during a complaint or audit. SHRM reported in February 2025 that 43 percent of organizations now use AI in HR, up from 26 percent in 2024, with 64 percent of those using it in recruiting, so documentation gaps grow with volume.
- **Higher worker trust.** Advance notice, plain-language reasons, and a clear path to review reduce disputes. Pew Research Center found 66 percent of Americans would not want to apply to an employer that uses AI to help make hiring decisions, and 71 percent oppose AI making a final decision. Transparency and review narrow that gap. Source: https://www.pewresearch.org/internet/2023/04/20/ai-in-hiring-and-evaluating-workers-what-americans-think/
- **Reuse across systems.** The same inventory, impact assessment, and approval flow can cover hiring, scheduling, and support bots, which cuts later build cost.

**Limits and trade-offs:**

- **Time and cost.** In-loop review slows high-volume workflows and needs staffing. Treat it as operating cost, not a one-time project.
- **Automation bias.** People tend to favor the model suggestion, especially under time pressure. NIST and Article 14 call this out. Counter it by showing the basis for the score, offering reasons to disagree, and rotating reviewers.
- **Data tension.** You need group data to test impact, but privacy rules limit what you can collect. Collect only what the law allows, disclose it, and keep testing data separate from the hiring decision where possible.
- **False confidence.** A published bias audit does not prove fairness. Audits often leave 18 to 25 percent of race or ethnicity as unknown, and they test only the period and groups reported. They show where to look, not that risk is zero.
- **Model drift.** Performance shifts as pools, policies, or prompts change. Supervision must be ongoing, not a pre-launch check.

## How to set up supervision: a seven-step plan

### 1. Inventory every worker-impacting system

List each tool, owner, purpose, data sources, model or rules version, and where the output appears in decisions. Mark whether it only assists a human or substantially assists or replaces a decision. That distinction triggers Local Law 144 and Annex III.

Add columns for on-chain proof if you use Web3 hiring: GitHub, verified contract addresses, Dune dashboards, and governance history. Note what the model does not see.

### 2. Choose assistive defaults first

Start low-risk while you build the program:

- Draft job descriptions with AI, then edit for accuracy and inclusive language before posting.
- Generate interview questions tied to six to eight must-have skills.
- Summarize interview notes a human wrote. Do not score a take-home or interview before a human has rated it.

Keep ranking as assistive. Show a shortlist with job-related reasons a human can verify. If you auto-reject, require a documented, job-related criterion and a second human check for edge cases.

### 3. Assign real owners and train them

- Assign two roles per system: a system owner who controls configuration and a reviewer who can overrule before adverse action. Both need training on capabilities, limits, and failure signs.
- For video or monitoring tools, confirm consent and deletion duties for Illinois and Maryland and the EU prohibition on emotion inference in work.
- Log who holds each role and when training was completed. Reviewers must be able to explain decisions without quoting a proprietary score alone.

### 4. Build guardrails in the system and in contracts

- **Allow list and caps.** Limit which APIs and on-chain contracts an agent can call. Cap spend per day and restrict data exports.
- **Pause and rollback.** Give operators a stop control and a clear path to undo a bad batch, such as reopening a req or reinstating a schedule.
- **Grounding.** Require retrieval from trusted sources before a generative tool acts. Keep prompts, tools, retrieved context, and model version with each action.
- **Vendor terms.** Require model cards, data sheets, training data description, groups tested, bias results with selection rates and impact ratios, logging for traceability, and cooperation with your independent audit. Local Law 144 puts the audit duty on you, so require data access.

### 5. Run your own bias and quality checks

Do not rely on a vendor PDF.

- Pull 6 to 12 months of data by requisition. Calculate selection rates by race or ethnicity and sex for each stage where AI ran. Flag any impact ratio below 0.80 under the four-fifths method for review. EEOC explains the example: 80 White and 40 Black applicants take a test, 48 White and 12 Black advance, selection rates 60 percent and 30 percent, ratio 30/60 = 0.50 below 0.80, which triggers job-relatedness analysis. See https://www.eeoc.gov/laws/guidance/select-issues-assessing-adverse-impact-software-algorithms-and-artificial-intelligence-used
- Measure accuracy: precision of those advanced, recall of those hired that the model would have advanced, and 90-day retention. If recall is low, the model discards good candidates.
- Slice by age band and location where lawful. Retest after any change to description, threshold, or model version.
- Document data period, counts including unknown, auditor name and independence, model version, criteria, and next audit date within one year. Keep version history.

### 6. Notify workers and candidates plainly

Write a notice a person can act on. Include:

- That you use an automated tool, what it does, and at which stage.
- Job-related criteria and data considered.
- Retention period, how to request an alternative process, and for Illinois video cases how to request deletion within 30 days.
- For New York City roles, give notice 10 business days before use and link the audit summary on your careers site.
- For Illinois roles under HB 3773 after January 1, 2026, confirm notice for each listed employment purpose where AI is used.
- For EU roles, state that workers are subject to an AI system and explain its role per Articles 13, 26, and 50, and never use prohibited emotion inference in work.

Keep the notice human-readable. Log the date sent and link the full audit PDF.

### 7. Monitor, log, and review on a cadence

- **Monthly.** Time to fill, time to screen, recruiter hours saved, offer acceptance rate, 90-day retention, and pass-through rates by stage and by group with impact ratios. Pause automation for a req if ratios drop and no job-related justification exists.
- **Quarterly.** Sampled human review of outputs: parsing errors, confabulated skills, and overrides with reasons. Review appeal and accommodation requests.
- **Annually.** Independent bias audit within one year for NYC roles, broader impact assessment for all hiring systems, and management review per NIST Govern and ISO 42001 Clause 9.

Retain logs, notices, audit summaries, and version history per counsel advice. For EU high-risk systems, keep logging per Article 12, technical documentation per Article 11, and a serious-incident process per Article 73.

## A short Web3 checklist before you widen AI use

- Your job post lists must-haves that predict on-chain safety: Foundry or Hardhat, fuzz and invariant tests, OpenZeppelin use without blind copy, and written trade-offs.
- Your application asks for proof links up front: GitHub, verified contract addresses, audit or bounty reports, and a short note on trade-offs.
- Your screen does not filter out a candidate who lacks a keyword but shows direct proof, such as a merged pull request to a major protocol.
- You pay for take-homes over two hours and score on correctness, security, coverage, and clarity, not on AI-generated style.
- Any agent that moves funds or votes uses an allow list, daily caps, and a contract-enforced time lock, with every transaction auditable on chain.

## Limitations and trade-offs you should not hide

- Supervision helps only if the reviewer can say no. A rubber stamp does not meet meaningful oversight under DOL or EU tests.
- Human reviewers bring their own bias. Use scorecards, blind review of work samples, and paired review for high-stakes calls.
- Small pools make ratios unstable. A requisition with 30 applicants can show a ratio of 0.50 from noise. Test at the family or quarterly level where you have enough cases and keep human review for small pools.
- Regulation is converging but not uniform. What is notice-only in one state is high-risk with logging and oversight in the EU. Design to the most demanding standard that applies to your candidates.

## FAQ

**What does supervising AI mean day to day?**
A named person checks the system's work at the right stage, can explain the basis for a decision, and can stop or correct the system before harm spreads. The team logs what was checked and why.

**Do we need a person to check every output?**
No. Match review to risk. An AI that drafts a help article needs sampled review. An AI that ranks applicants or flags a worker for discipline needs review before the adverse action. Batch or sampling review is acceptable for low-risk steps, not for significant employment decisions without additional controls.

**Is a human in the loop enough by itself?**
No. EU Article 14 and NIST both reject a single checkbox. You need trained people, clear instructions, logging, testing for bias and accuracy, and a stop control. Over-reliance warnings and review of automation bias are required controls, not optional notes.

**When should an AI agent not act on its own?**
When its confidence is low, when data sources disagree, when gas or cost is unusually high, when it meets a contract or pool it has not seen before, or when the action is irreversible such as moving treasury funds or rejecting a candidate. Policy should be pause and ask for approval, with a global pause any operator can trigger.

**Are autonomous agents already running hiring or performance alone?**
Parts are assisted, such as summarizing notes or drafting schedules. Most teams keep hiring decisions, pay, and discipline behind human approval and contract gates. That is the pattern regulators expect.

**Does the EEOC four-fifths rule mean a ratio above 0.80 is safe?**
No. 0.80 is a flag, not proof of lawfulness. A ratio above 0.80 can still be unlawful if the criterion is not job-related, and a ratio below 0.80 can be lawful if you show job-relatedness and no equally effective alternative with less impact. Use 0.80 to decide where to investigate.

**Can we use video AI that scores facial expressions or tone?**
Avoid it. Validity is weak, candidate trust is low, and rules are strict. Illinois requires detailed notice and consent plus deletion on request, Maryland requires written consent for facial recognition, and the EU bans emotion inference in work from February 2, 2025. Use human interviews with a consistent scorecard and limit recording retention.

**Who is liable if the vendor's model is biased?**
You are, as the employer or employment agency. Mobley v. Workday shows vendors can also face liability as agents, but that does not remove your duty. Contracts should require vendor cooperation with audits, logging, and disclosure of training and testing.

**Does ISO 42001 certification satisfy the EU AI Act?**
No. ISO 42001 gives you an AI management system that aligns with many AI Act controls, but it does not replace conformity assessment or deployer duties. Treat it as a foundation for documentation and audits.

**We use Workday, Greenhouse, or Lever. Do we already comply?**
Not by default. Those platforms provide the ATS and optional AI features, but compliance depends on which features you enable, how you configure criteria, what data you collect, and whether you ran an independent audit within the past year, published the summary, and gave timely notice. Inventory what you turned on and run the seven steps.

**What record should we keep for an audit?**
Data period and reqs covered, total applicants and counts by group including unknown, selection rates and impact ratios by race or ethnicity and sex, auditor name and independence, model version, criteria used, notices sent with dates, human overrules with reasons, and next audit date. Keep version history to show what changed and when.

*Sources and further reading: Regulation (EU) 2024/1689 Articles 5, 12 to 15, 26, 50, 99 and Annex III point 4 at https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689 and https://artificialintelligenceact.eu/article/14/ ; Digital Omnibus Regulation (EU) 2026/1744; NYC DCWP Automated Employment Decision Tools page, Rule, and FAQ at https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page ; 820 ILCS 42 and 775 ILCS 5/2-102 as amended by HB 3773; Md. Lab. & Empl. Sec. 3-717; Colorado SB 24-205; EEOC Technical Assistance on Assessing Adverse Impact under Title VII, May 18, 2023 and ADA guidance May 2022; DOL AI Principles May 16, 2024 and AI Best Practices October 16, 2024 at https://www.dol.gov/newsroom/releases/osec/osec20241016 ; NIST AI RMF 1.0 January 26, 2023 at https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf and Generative AI Profile NIST AI 600-1 July 26, 2024 at https://doi.org/10.6028/NIST.AI.600-1 ; SHRM Talent Trends February 2025; Pew Research Center April 20, 2023 at https://www.pewresearch.org/internet/2023/04/20/ai-in-hiring-and-evaluating-workers-what-americans-think/ ; EEOC v. iTutorGroup consent judgment August 2023; Mobley v. Workday, No. 3:23-cv-00770 (N.D. Cal.).*
