---
title: 'How to Use AI in Hiring: A Practical Guide for Hiring Managers and Founders'
data-ai-hint: hiring manager reviewing candidates
description: >-
  A practical guide to using AI in hiring without creating legal or trust problems. Learn where AI helps, where it adds risk, what NYC, Illinois, and EU rules require, and a seven-step setup with bias checks and human oversight.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

AI in hiring refers to software that helps write job descriptions, source candidates, screen resumes, rank applicants, schedule interviews, and track decisions. A person still makes the hire, but the system shapes who gets seen and how quickly you move.

This guide explains what these tools do, who should use them, how they work in practice, what helps and what hurts, what the law requires in the United States and the EU, and how to set up a process you can defend.

## What is AI in hiring

AI in hiring is a set of tools inside your applicant tracking system and around it.

Common uses include:

- **Drafting and targeting.** Generate a first draft of a job description from a prompt and past postings, then check it for missing skills. Some platforms also target ads to lookalike audiences based on past applicants.
- **Resume parsing and search.** Convert a PDF or DOCX into structured fields and match keywords to the job requirements you set. Most systems filter and store, a few also score or rank.
- **Screening and ranking.** Score candidates 1 to 5 stars or place them in tiers based on keywords, years of experience, or a model trained on prior hires. This is the highest risk step.
- **Assessments and video interviews.** Score take-home tests, games, or recorded video for language patterns or facial signals. Illinois and New York City treat this as an automated employment decision tool when it substantially assists a decision.
- **Scheduling and communication.** Chatbots answer candidate questions, schedule interviews, and send status updates. This has lower legal risk and high time savings.
- **Background, reference, and close.** Summarize notes, draft offer letters, and check for inconsistent data before a human approves.

None of these tools verify truth. You provide the criteria, you train or configure the model, and you remain responsible for the outcome.

## Who this guide is for

- **Founders and hiring managers** making 5 to 50 hires per year who need to move fast without adding legal risk.
- **Recruiters and people operations** running Greenhouse, Ashby, Lever, Workday, or similar systems and deciding which AI features to turn on.
- **Web3 teams** hiring across time zones where proof of work matters: GitHub, verified contracts, Dune dashboards, and governance history. AI can help with admin, but it cannot judge on-chain work well.

If you make one-off hires with direct referrals and no ATS, AI adds less value than a clean job post and a structured interview.

If you screen hundreds of applicants per role in New York City, Illinois, Colorado, or the EU, you need the compliance steps in this guide.

## How it works: mechanics, not marketing

### 1. The data and the model

Most hiring tools are not general intelligence. They are narrow classifiers:

- A parser extracts text and maps it to fields: title, employer, skills, dates.
- A matching layer compares extracted terms to the job description you wrote. It looks for exact phrases you listed.
- A scoring layer, when enabled, applies a model trained on historical hiring data to predict fit. This is where historical bias carries forward if you do not test for it.

Amazon's experimental resume tool from 2014 to 2017 is the canonical example. Reuters reported on October 10, 2018, based on five sources, that the system learned to penalize resumes that included the word "women's" and graduates of two women's colleges. Amazon said the tool was never used for final decisions and the team disbanded it in 2017. NIST and civil society comments now cite this case when they describe training-data bias.

### 2. The funnel where AI sits

- **Sourcing.** The system shows your ad to candidates similar to past applicants or employees. If your past pool was narrow, targeting can narrow future pools.
- **Application.** The ATS stores every resume and makes it searchable by keyword. CareerOneStop and the U.S. Department of Labor note that failure to parse tables, columns, text boxes, or graphics is a common reason a qualified resume is not found.
- **Screen and rank.** If you enable ranking, the tool orders candidates and may auto-reject below a threshold. This step creates adverse impact risk under Title VII when a neutral rule hits one group harder without a job-related justification.
- **Interview.** Video or game-based tools can generate scores before a human interview. Some analyze speech patterns or facial signals. Validity for these signals in hiring is contested and some jurisdictions require separate consent.
- **Decision and record keeping.** The ATS logs scores, stages, and reasons. That log is what an audit will review later.

### 3. How employers actually use AI now

Use has risen quickly, but use is uneven:

- SHRM surveyed 2,040 HR professionals in February 2025 and found 43 percent of organizations now use AI in HR tasks, up from 26 percent in 2024. Among those users, 64 percent apply it to recruiting, interviewing, and hiring. The most common tasks were job description generation at about 65 percent, resume screening at about 34 percent, and pre-screen interviews at about 7 percent. Eighty-eight percent cited time savings as the main reason. Source: https://www.shrm.org/topics-tools/research/2025-talent-trends/ai-in-hr and https://shrm-res.cloudinary.com/image/upload/AI/2024-Talent-Trends-Survey_Artificial-Intelligence-Findings.pdf
- HireVue's global survey of more than 4,000 HR leaders in February 2025 reported adoption among HR professionals rose from 58 percent in 2024 to 72 percent in 2025. Source: https://www.hirevue.com/press-release/hirevues-2025-ai-report-shows-the-majority-of-hr-leaders-trust-ai-hiring-decisions
- LinkedIn's Future of Recruiting survey of more than 1,000 talent professionals across about 23 countries reported teams using AI save about 20 percent of the work week, roughly one full workday, but only 25 percent felt confident measuring quality of hire. Source: https://business.linkedin.com/talent-solutions/resources/future-of-recruiting
- ResumeBuilder's survey of 948 business leaders in October 2024 found about 82 percent of companies that use AI in hiring apply it to resume review. Source: https://www.resumebuilder.com/7-in-10-companies-will-use-ai-in-the-hiring-process-in-2025-despite-most-saying-its-biased/
- Candidate views differ. Pew Research Center found 66 percent of Americans would not want to apply for a job with an employer that uses AI to help make hiring decisions, 71 percent oppose AI making a final decision, and 41 percent oppose AI reviewing applications. Only 47 percent thought AI would be better than humans at treating all applicants the same. Sources: https://www.pewresearch.org/internet/2023/04/20/ai-in-hiring-and-evaluating-workers-what-americans-think/ and 2025 to 2026 Pew updates summarized at https://www.sqmagazine.co.uk/ai-recruitment-statistics/

These numbers explain the gap you must manage. Employers buy for speed. Candidates worry about fairness and opacity.

## Pros and cons

**Where AI helps:**

- **Faster admin.** Drafting job descriptions, scheduling, and answering routine questions can move from hours to minutes. SHRM users report this as the clearest return.
- **Consistent process.** A structured screen with the same criteria for every resume reduces variation between reviewers, when you keep the criteria job-related.
- **Better reach when used narrowly.** Sourcing assistants can surface candidates from wider pools if you audit who they surface.
- **Cleaner records.** Automatic logging of stages, scores, and reasons helps you answer questions later and run audits.

**Limits and trade-offs:**

- **Bias can scale.** A small bias in a model can affect thousands of applicants. EEOC guidance from May 18, 2023, under Title VII, explains that the four-fifths rule is one way to check adverse impact. Their example: 80 White and 40 Black applicants take a test, 48 White and 12 Black advance. The selection rate is 60 percent for White and 30 percent for Black. The impact ratio is 30/60 or 0.50, below 0.80, which flags potential adverse impact for further review. The rule is a flag, not proof of a violation, but it triggers the need to show the test is job-related and consistent with business necessity. Source: https://www.eeoc.gov/laws/guidance/select-issues-assessing-adverse-impact-software-algorithms-and-artificial-intelligence-used
- **Vendor tools are your responsibility.** On April 9, 2024, the EEOC filed an amicus brief in Mobley v. Workday, Inc., No. 3:23-cv-00770 (N.D. Cal.), arguing a vendor that provides screening tools can be an agent or employment agency under federal law. The court later allowed the agent theory to proceed in July 2024. The case, filed February 21, 2023, alleges bias based on race, age over 40, and disability. As of July 2026, the ADEA collective was conditionally certified in May 2025 with an opt-in deadline of March 7, 2026, and the court denied most dismissal motions in June 2026. No settlement or payout has been confirmed. Workday denies wrongdoing. The point for you: you cannot shift liability to a vendor. If you use the tool, you own the outcome.
- **Video and emotion claims are fragile.** Tools that infer personality or emotions from faces or voice have weak validity and face specific bans. Illinois requires detailed consent and deletion rights, Maryland requires written consent for facial recognition in interviews, and the EU AI Act prohibits emotion inference in work and education from February 2, 2025.
- **Hallucinations and confabulation.** Generative models can invent a skill or a citation that reads as true. If you let a model rewrite a resume bullet or a job requirement, you must verify every fact before you publish or store it.
- **Overreliance.** SHRM reported in March 2026 that among organizations using AI in HR, 57 percent of HR professionals in regulated states were unaware of local AI laws. Speed without governance creates exposure that grows with hiring volume.

## Rules you must follow

### United States - federal

EEOC enforces Title VII, the Americans with Disabilities Act, the Age Discrimination in Employment Act, and other statutes. Two EEOC documents matter:

- **Title VII technical assistance, May 18, 2023.** If a tool has an adverse impact on a protected group, you must be able to show it is job-related and consistent with business necessity and that no equally effective, less discriminatory alternative exists. You are also responsible for a vendor's tool you choose to use.
- **ADA guidance, May 2022, and EEOC-DOJ joint statements.** Tools must provide reasonable accommodation, and they must not screen out a qualified person with a disability based on how the tool measures them. An August 2023 consent judgment with iTutorGroup resolved claims that its software automatically rejected applicants based on age, a reminder that age bias in hiring tools can lead to enforcement.

The EEOC removed some AI-related hiring guidance pages in January 2025 after the January 20, 2025 revocation of prior executive orders and the January 23, 2025 Executive Order on Removing Barriers to American Leadership in AI. Federal anti-discrimination statutes did not change. The laws still apply whether the decision involved AI or a human.

### New York City - Local Law 144

Local Law 144, passed in 2021, took effect January 1, 2023, with enforcement by the Department of Consumer and Worker Protection starting July 5, 2023. It applies to employers and employment agencies using an automated employment decision tool to substantially assist or replace discretionary decisions for positions in New York City.

Requirements:

- A bias audit by an independent auditor within one year before you use the tool. The audit must calculate selection rates for race or ethnicity and sex categories reported on the EEO-1 Component 1, and impact ratios against the most selected group, consistent with 29 CFR 1607.4D.
- A public summary of the audit results on your careers site.
- Notice to each candidate or employee 10 business days before you use the tool, with instructions to request an alternative selection process and information on the data sources and retention.

The law requires you to have and publish an audit. It does not require the tool to pass. The summary will show ratios below 0.80 when they occur. That transparency is the point. See the official page and rule: https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page and https://rules.cityofnewyork.us/rule/automated-employment-decision-tools-updated/ and the FAQ at https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf

An ACLU tracker collects published audits at https://github.com/aclu-national/tracking-ll144-bias-audits. Reports from 2024 and 2025 note that audit quality and publication rates have been uneven, so posting alone does not prove low risk.

### Illinois

- **Artificial Intelligence Video Interview Act, 820 ILCS 42, effective January 1, 2020.** If you ask Illinois-based applicants to record a video and you use AI to analyze it, you must before the interview: notify the applicant that AI may be used, explain how the AI works and what general types of characteristics it uses, and obtain consent. You may not share the video except with people whose expertise is necessary to evaluate fitness, and you must delete the video and all copies within 30 days of an applicant's request, including backup copies. If you rely solely on AI to decide who gets an in-person interview, you must collect and report race and ethnicity data to the Department of Commerce and Economic Opportunity by December 31 each year. Source: https://law.justia.com/codes/illinois/chapter-820/act-820-ilcs-42/
- **HB 3773 amending the Illinois Human Rights Act, 775 ILCS 5/2-102, effective January 1, 2026.** This broader law defines AI to include generative AI, prohibits using AI that causes a discriminatory effect based on a protected class or that uses ZIP codes as a proxy, and requires notice when AI is used for recruitment, hiring, promotion, renewal, training selection, discharge, discipline, or terms of employment. Enforcement sits with the Illinois Department of Human Rights. Many employers expect implementing rules before the date, but the statute's notice and nondiscrimination duties are already written.
- **Maryland, effective 2020,** requires written consent before using facial recognition during an interview. Colorado's Artificial Intelligence Act, signed in 2024, takes effect February 1, 2026, and requires reasonable care to avoid algorithmic discrimination for high-risk systems including employment, with impact assessments and disclosures.

### EU - the EU AI Act

Regulation (EU) 2024/1689 entered into force August 1, 2024.

- **High-risk listing.** Annex III point 4 lists employment AI as high-risk. It covers AI used for recruitment or selection, in particular to place targeted job advertisements, to analyse and filter applications, and to evaluate candidates, and AI used to make decisions on promotion, termination, task allocation, or monitoring of performance. There is no de minimis use threshold. Source text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689
- **What high-risk means.** Articles 9 to 15 require a risk management system, data governance, technical documentation, logging under Article 12, accuracy testing, human oversight under Article 14, and transparency to deployers under Article 13. Deployers (employers) have duties under Articles 26 and 50 to use the system per instructions, assign oversight to competent people, ensure input data is relevant, monitor operation, inform the provider of serious incidents, and inform candidates they are subject to an AI system.
- **Prohibited practices, applicable February 2, 2025.** Article 5 prohibits emotion inference in work and education contexts. A resume screener that claims to detect enthusiasm or stress from a face or voice in an interview is prohibited in that setting, not just high-risk.
- **Dates.** High-risk obligations for general-purpose AI and for prohibited practices began in 2025. Standalone high-risk systems under Annex III originally had a compliance date of August 2, 2026. A Digital Omnibus Regulation (EU) 2026/1744 now defers standalone Annex III compliance to December 2, 2027. Treat August 2, 2026 as the planning date until your counsel confirms the deferral applies to your system, and start logging, documentation, and oversight now. Phasing is complex and your timeline depends on whether the system is embedded or standalone.
- **Penalties.** Article 99 sets penalties for high-risk violations up to 15 million euros or 3 percent of worldwide annual turnover, whichever is higher, and higher for prohibited practices. Member state authorities, data protection authorities, and labour inspectorates can enforce, alongside GDPR Article 22 which already limits solely automated decisions with legal or similar effect.

### The NIST AI Risk Management Framework

NIST AI RMF 1.0, released January 26, 2023, is voluntary and is referenced by US regulators. It organizes work into four functions: Govern, Map, Measure, Manage. See https://www.nist.gov/itl/ai-risk-management-framework and the publication at https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf. The companion Generative AI Profile NIST AI 600-1, released July 26, 2024, adds guidance on hallucinations and provenance for generative tools: https://doi.org/10.6028/NIST.AI.600-1

Use it to structure your program. Map where AI touches a decision, measure bias and accuracy with sliced tests by group, manage with human review before adverse action, and govern with clear roles, documentation, and vendor controls.

## How to use AI in hiring: a seven-step setup

### 1. Map every automated step

List each tool and what it does to a candidate record. Mark whether it only assists a human or it substantially assists or replaces a decision. Local Law 144 and Annex III both hinge on that distinction. Keep an inventory with owner, data sources, model version, and where the output appears in the workflow.

For Web3 teams, add two columns: does the step see on-chain proof, and can it explain why a candidate with nontraditional experience was ranked low.

### 2. Choose assistive defaults

Start with low-risk uses:

- Draft job descriptions and then edit for accuracy and inclusive language.
- Generate interview questions tied to the six to eight skills you listed.
- Summarize interview notes that a human wrote, not scores that replace the human.

Keep screening as assistive. Show a shortlist with reasons a human can verify, rather than auto-rejecting below a hidden threshold. If you do auto-reject, require a documented, job-related criterion you could explain to a candidate and a second human review for edge cases.

### 3. Vet vendors before you buy

Ask for:

- The intended use and instructions for use, including data the model was trained on and groups tested.
- Bias test results by race or ethnicity, sex, and age where available, with selection rates and impact ratios using the four-fifths method. Do not accept a statement that the tool is bias-free.
- Model cards, data sheets, and logging capability for Article 12 style traceability: who saw the score, when, and what action followed.
- Whether the vendor will cooperate with your independent audit and provide aggregated data. Local Law 144 puts the duty on you, not the vendor, so put cooperation in the contract.

Check references from customers in your size band. Review the public bias audit summaries on the ACLU tracker to see how peers disclose.

### 4. Run your own bias and quality checks

You need internal tests, not just a vendor PDF:

- Pull the last 6 to 12 months of applicant data by requisition. Calculate selection rates by race or ethnicity and sex for each stage where AI ran. Flag any impact ratio below 0.80 for review.
- Slice by other features you track: age band, education source, or location, where lawful to collect. Illinois and NYC limit collection to lawful bases, so follow counsel on what you store.
- Measure accuracy, not just fairness. Track precision: of those the model advanced, how many received an interview and an offer. Track recall: of those hired, how many the model would have advanced. If recall is low, the model is discarding good candidates.
- Re-test when you change the job description, the threshold, or the model version. Models drift as pools change.

Document every check: data period, group definitions, numbers included and excluded as unknown, auditor name if independent, and next audit date within one year.

### 5. Add human oversight that can change the outcome

Human oversight must be real, not a rubber stamp:

- Assign a trained reviewer who can overrule the system before an adverse action such as a rejection or a no-interview decision.
- Show the reviewer the same information the model saw, plus what it did not see, such as portfolio links, on-chain history, or transferable skills.
- Log the reason for each overrule. Review logs monthly for patterns.
- Require that a human conducts any interview evaluation that involves restricted signals such as face or voice. Do not use emotion inference in work contexts in the EU, and avoid it elsewhere given validity and consent issues.

For developers, add a technical review step that AI cannot do: check pinned repos, read tests, verify a contract on Etherscan, or review a Dune query. That proof of work should outweigh a keyword score.

### 6. Notify candidates in plain language

Write the notice a candidate can act on. Include:

- That you use an automated tool, what it does, and at which stage.
- The job-related criteria it uses and the data it considers.
- How long you retain data, how to request an alternative process, and for Illinois video cases, how to request deletion within 30 days.
- For New York City roles, provide notice 10 business days before use and a link to the audit summary on your careers site.
- For Illinois roles covered by HB 3773 after January 1, 2026, confirm you gave notice for each listed employment purpose where AI is used.

Keep the notice human-readable. Link to the full audit PDF and log the date you sent it.

### 7. Measure what matters and keep records

Track these monthly:

- Time to fill, time to screen, and recruiter hours saved, alongside quality metrics: offer acceptance rate, 90-day retention, and hiring manager satisfaction.
- Pass-through rates by stage and by group, with impact ratios. If a ratio drops below 0.80, pause automation for that requisition and review the criterion.
- Candidate experience: response rate to AI outreach, drop-off after disclosure, and appeal or accommodation requests.

Retain logs, notices, audit summaries, and version history for the period your counsel advises. For vendor incidents, document the serious incident and notice to the provider as Article 26 requires in the EU.

## A short Web3 checklist before you turn a feature on

- Your job post lists must-haves that predict on-chain safety: Foundry or Hardhat, tests including fuzz and invariant tests, OpenZeppelin use without blind copy, and a habit of documenting risk.
- Your application asks for proof links up front: GitHub, verified contract addresses, audit or bounty reports, and a short write-up of trade-offs.
- Your screen does not filter out candidates who lack a keyword but show direct proof, such as a merged pull request to a major protocol.
- You pay for take-homes that take more than two hours and you score them on correctness, security, coverage, and clarity, not on AI-generated style.

## Limitations and trade-offs

- Audits do not guarantee fairness. A passed audit shows impact ratios above 0.80 for the period and groups tested. It does not prove the model is valid, nor does it test groups reported as unknown. About 18 to 25 percent of candidates often fall in unknown for race or ethnicity in published audits, which limits what the numbers can say.
- Data minimization conflicts with auditing. You need group data to test impact, but privacy rules limit what you can collect. Collect only what the law allows, disclose it, and keep it separate from the hiring decision.
- Vendor transparency varies. Some vendors share model cards and agree to independent audits. Others share only a summary. If a vendor cannot explain training data and testing, treat that as a reason to limit use.
- Small sample sizes make ratios unstable. A requisition with 30 applicants can show a ratio of 0.50 that reflects noise. Test at the requisition family or quarterly level where you have enough cases, and keep human review for small pools.
- Regulation is converging but not uniform. What is notice-only in one state is high-risk with logging and oversight in the EU. Design to the most demanding standard that applies to your candidates.

## FAQ

**Do we need an AI hiring tool at all if we hire fewer than 20 people per year?**
Often no. A clear job description, a single-column ATS workflow, and a structured interview with a scorecard will beat a ranking model at small scale. Add a drafting assistant and scheduling bot first. Turn on screening models only when volume makes manual review error-prone.

**Does the EEOC's four-fifths rule mean a ratio above 0.80 is safe?**
No. The EEOC describes 0.80 as a rule of thumb to flag potential adverse impact. A ratio above 0.80 can still be unlawful if the test is not job-related, and a ratio below 0.80 can be lawful if you can show job-relatedness and no equally effective alternative. Use 0.80 to decide where to investigate, not as a pass or fail line.

**What makes a tool an AEDT under NYC Local Law 144?**
A tool that substantially assists or replaces discretionary decision making for an employment decision in New York City. The DCWP rule uses a broad definition that includes machine learning, statistical modeling, data analytics, and AI that generates a simplified output such as a score, tag, or ranking. If your ATS orders candidates or recommends who advances, assume it can be an AEDT and get a determination from counsel.

**Can we use video interview AI that scores facial expressions or tone?**
Avoid it. Validity is weak, candidate trust is low, and consent and prohibition rules are strict. Illinois requires detailed notice and consent plus deletion on request, Maryland requires written consent for facial recognition, and the EU prohibits emotion inference in work since February 2, 2025. Use human interviews with a consistent scorecard and, if you record, get consent and limit retention.

**Who is liable if the vendor's model is biased?**
You are, as the employer or employment agency. The Mobley v. Workday litigation shows the EEOC's view that vendors can also face liability as agents, but that does not remove your duty. Contracts should require vendor cooperation with audits, logging, and disclosure of training and testing.

**How does the EU AI Act affect a US company hiring in the EU?**
If you have candidates or employees in the EU and you use AI for recruitment, screening, or performance, that use is high-risk under Annex III point 4. You must meet provider duties if you build the system and deployer duties under Articles 26 and 50 if you use a vendor's system, including human oversight, data relevance, monitoring, and candidate transparency. The prohibitions on emotion inference already apply, and high-risk obligations for standalone systems are deferred to December 2, 2027 under the Digital Omnibus, but logging and governance work should start now. Confirm dates with counsel for your specific system.

**We use Workday, Greenhouse, or Lever. Do we already comply?**
Not by default. Those platforms offer ATS and AI features, but compliance depends on which features you enable, how you configure criteria, what data you collect, and whether you ran an independent bias audit within the past year and published the summary with timely notice. Check your enabled features against the inventory and run the seven steps above.

**How do we explain an AI screen to a rejected candidate?**
Keep it specific. State the stage, the job-related criteria used, that a human reviewed the decision, and how to request a re-evaluation or an accommodation. Do not cite a proprietary score alone. Point to the public audit summary and your notice page for more detail.

**What record should we keep for an audit?**
Data period and requisitions covered, total applicants and counts by group including unknown, selection rates and impact ratios by race or ethnicity and sex, auditor name and independence statement, model version, criteria used, notices sent with dates, human overrules with reasons, and next audit date. Keep version history so you can show what changed and when.

*Sources and further reading: EEOC Technical Assistance on Assessing Adverse Impact under Title VII, May 18, 2023 and ADA guidance May 2022; NYC DCWP Automated Employment Decision Tools page and Rule and FAQ; 820 ILCS 42 Artificial Intelligence Video Interview Act and 775 ILCS 5/2-102 as amended by HB 3773; Maryland Labor and Employment Sec. 3-717; Colorado SB 24-205; Regulation (EU) 2024/1689 Annex III point 4 and Articles 5, 9 to 15, 26, 50, 99 on EUR-Lex; NIST AI Risk Management Framework 1.0 January 26, 2023 and Generative AI Profile NIST AI 600-1 July 2024 at nist.gov; SHRM Talent Trends February 2025 and March 2026 reports; Pew Research Center April 20, 2023 and 2025 to 2026 updates; HireVue Global Guide to AI in Hiring February 2025; LinkedIn Future of Recruiting 2025.*
