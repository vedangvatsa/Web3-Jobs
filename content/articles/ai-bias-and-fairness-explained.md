---
title: AI Bias and Fairness Explained
image: 'https://picsum.photos/seed/ai-bias/1200/630'
data-ai-hint: unbalanced scale
description: >-
  A clear explanation of how bias gets into AI systems and why it matters. Learn
  about the different types of bias and the strategies used to build fairer AI.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

AI bias happens when a system makes systematic errors that favor one group over another. It is not about a model having opinions. It is about data, design choices, and deployment decisions that produce uneven outcomes at scale. Once deployed, those outcomes can affect hiring, healthcare, credit, and criminal justice.

This matters because AI decisions are often treated as neutral. NIST frames it directly in NIST Special Publication 1270, published March 2022: it is not possible to achieve zero risk of bias in any AI system. The task is to identify, measure, and manage it across the lifecycle.

### Who this guide is for

- Builders who train, evaluate, or buy models and need to check them before deployment.
- Product, hiring, and risk teams that use AI scores to make decisions about people.
- Policy, compliance, and operations staff responsible for documenting and overseeing AI under frameworks like the NIST AI Risk Management Framework and the EU AI Act.
- Everyday users who want to spot when a tool is producing skewed results.

If you commission, design, deploy, or rely on an AI system, you are in scope for this work.

### What AI bias is, in concrete terms

NIST defines three categories that interact. They are useful because they force you to look beyond the dataset.

**1. Systemic bias.** Procedures and norms in institutions that advantage some groups and disadvantage others. Examples include historic hiring patterns, segregated healthcare access, or lending histories shaped by prior discrimination. The system learns the pattern even without an explicit label for race or gender.

**2. Statistical and computational bias.** Errors from how data are sampled, measured, and modeled when the sample does not represent the population. These occur without intent. Examples include undercounting certain groups, using a proxy that is weaker for one group than another, or overfitting to the majority.

**3. Human-cognitive bias.** How people perceive and use system outputs, or embed assumptions in problem formulation and labeling. Examples include confirmation bias when reviewing model recommendations, anchoring on a score, or choosing what counts as "success" in a way that reflects a narrow viewpoint.

A frequent misunderstanding is that bias is only a data problem. Data matters, but bias also enters through problem definition, objective functions, evaluation, and human oversight.

### How bias gets in

#### Data

**Historical bias.** The data reflect past decisions that were themselves uneven. Train on that history without correction, and the model repeats it.

**Representation bias.** Some groups are missing or thin in the dataset. The model sees few examples, so it performs worse for them.

**Measurement and label bias.** The thing you want to predict is hard to observe, so you use a proxy. If the proxy means something different across groups, the model learns the wrong signal.

Concrete, verified case: a hospital risk algorithm studied in Science on October 25, 2019 by Obermeyer, Powers, Vogeli, and Mullainathan. The system was used to identify patients for high-risk care management. It predicted healthcare costs to estimate need. At the same risk score, Black patients were sicker than White patients as shown by counts of chronic conditions and lab markers. The cause: Black patients generated lower costs than White patients at the same level of health due to unequal access and use of care, so costs were a poorer proxy for need for Black patients. The authors estimated that fixing the label choice to use health measures rather than costs would raise the share of Black patients automatically flagged for extra help from 17.7 percent to 46.5 percent. The manufacturer later replicated the finding on a national dataset of 3,695,943 commercially insured patients.

**Other data risks:** selection bias from scraping or platform sampling, labeler disagreement across annotators, and leakage where a seemingly neutral field encodes a protected attribute.

#### Algorithm and objective design

Even with decent data, the objective can introduce bias.

- Optimizing for overall accuracy rewards the majority group. Errors on a smaller group count less in the average, so the model can be accurate overall and poor for that group.
- Optimizing for profit or efficiency can penalize groups correlated with lower revenue or higher past costs, as in loan pricing that uses neighborhood-level signals that track prior economic constraints.
- Data dredging and repeated hyperparameter tuning can make a model look accurate on a held-out set while hiding subgroup failures.

These are statistical and computational biases. They interact with systemic bias in the training data.

#### Human factors

Human decisions shape each stage:

- **Pre-design:** choosing who counts as the target population, what outcome to predict, and what trade-off to accept.
- **Design and annotation:** deciding taxonomies, label definitions, and which features are available. Annotator bias and inconsistent instructions create reporting bias.
- **Deployment:** automation bias where reviewers overtrust scores, selective adherence where reviewers follow the model only when it confirms their judgment, and missing context when a model trained in one setting is used in another.

NIST SP 1270 stresses a socio-technical view for this reason. The model is one part of a larger system that includes people, procedures, and incentives.

### What it looks like in practice

The following cases are well documented. Each has been checked against the primary source cited.

**Hiring at Amazon, 2014 to 2017.** Reported by Reuters on October 10, 2018 based on five people familiar with the effort. Amazon built experimental models in its Edinburgh engineering hub to score resumes from one to five stars, trained on resumes submitted to the company over ten years. Most came from men, reflecting the tech workforce at the time. The system taught itself that male-associated patterns predicted success. It penalized resumes containing the word "women's," as in "women's chess club captain," and downgraded graduates of two all-women's colleges. The team edited the models to make them neutral to those specific terms but could not guarantee other proxies would not emerge. The company disbanded the team by the start of 2017. Recruiters had considered the recommendations but never relied solely on them, and the tool was never used by recruiters to make final decisions, according to Amazon's statement at the time.

Takeaway: a tilted training sample plus a ranking objective reproduced prior hiring history. Neutralizing a few keywords did not fix the underlying sampling and objective problem.

**Criminal justice risk scoring, COMPAS in Broward County, Florida.** Investigated by ProPublica in "Machine Bias," May 23, 2016. ProPublica collected COMPAS scores for more than 7,000 defendants scored in 2013 and 2014 and tracked re-arrest over two years. It found that Black defendants who did not reoffend were classified as higher risk at about twice the rate of White defendants who did not reoffend. White defendants who did reoffend were more often classified as low risk than Black defendants who did reoffend. Northpointe, now Equivant, disputed the bias finding and pointed to predictive parity, showing that at a given score, reoffending rates were similar across groups.

Both claims can be true at once. Subsequent modeling work formalized this as an impossibility trade-off. Chouldechova in 2017 and Kleinberg, Mullainathan, and Raghavan in 2016 showed that when base rates of the outcome differ across groups, a score cannot satisfy calibration within groups and equal false positive and false negative rates at the same time unless the classifier is perfect or base rates are equal. Teams must choose which definition matches the harm they are trying to prevent and document the residual gap on the other definitions.

**Healthcare, as above.** The 2019 Science study is the clearest example of proxy choice as bias. Costs are convenient and available in claims data. They predict utilization fairly well overall, so a model built on costs looks accurate in aggregate. Yet large racial gaps remain when the outcome is need.

**Face recognition, NIST Face Recognition Vendor Test.** NIST FRVT Part 3, Demographic Effects, released December 2019, tested 189 algorithms from 99 developers on 18 million images of 8 million people. It found that false positive rates, incorrect matches between photos of different people, varied across demographics for many algorithms. False negatives, failures to match two photos of the same person, were strongly tied to image quality factors such as lighting and pose. Top-performing algorithms had differentials that were small in absolute terms, often below 0.5 percent overall, and for the most accurate systems demographic differences were undetectable. Lower-performing algorithms showed larger relative gaps, up to orders of magnitude in worst cases. The lesson: accuracy and demographic variation differ widely by vendor, and image collection standards often matter more than abstract claims of bias.

**Financial services, Apple Card.** Complaints in November 2019 alleged that Goldman Sachs, which underwrote Apple Card, granted lower credit limits to women. The New York State Department of Financial Services reviewed several thousand pages of records and analyzed underwriting data for about 400,000 New York applicants. In its March 23, 2021 report, NYDFS found no evidence of unlawful disparate treatment or disparate impact, concluding that women and men with equivalent credit characteristics had similar outcomes and that decisions were consistent with stated credit policy. The department also flagged deficiencies in customer service and transparency that undermined trust, and noted broader concerns about legacy bias in credit data and the limits of traditional scores. The case shows that a neutral policy can still produce surprising individual outcomes when credit files differ within a household, and that explainability and appeals matter.

### Why "remove the sensitive attribute" does not work

Excluding race, gender, or other protected fields from training data does not make a model blind to them. Models learn from proxies that correlate with those attributes, such as zip code, school attended, name, employment gaps, credit history length, or health spending. Research on text-embedding resume screeners and registry audits continues to find this pattern. If a proxy is correlated with the outcome differently across groups due to past inequality, the model will still produce uneven results. Detecting proxies requires explicit testing, not assumption.

### Fairness is not one number

In the fairness literature, a model can be evaluated in several ways. The three most used group metrics are:

- **Demographic or statistical parity:** P(Y-hat = 1 | A = 0) = P(Y-hat = 1 | A = 1). The share receiving the favorable prediction is equal across groups. It asks about predictions, not accuracy. It makes sense when the label itself is contaminated or when equal access is the policy goal, but it can conflict with accuracy when base rates legitimately differ.

- **Equalized odds and equal opportunity:** equalized odds requires equal true positive rates and equal false positive rates across groups, P(Y-hat = 1 | Y = y, A = 0) = P(Y-hat = 1 | Y = y, A = 1) for y = 0,1. Equal opportunity is the true positive rate part only. These metrics condition on ground truth, so they reward accuracy for everyone who qualifies. They are common in risk assessment and diagnosis.

- **Predictive parity and calibration:** at a given predicted score, actual outcomes are similar across groups. Calibration, P(Y = 1 | S = s, A = 0) = P(Y = 1 | S = s, A = 1), means a score means the same thing for each group.

As noted above, these cannot all hold when base rates differ except in edge cases. NIST AI RMF and ISO/IEC TR 24027:2021, which catalogs bias types and fairness metrics, both advise that the choice be explicit, justified, and revisited over time. The choice should follow from the harm you most want to avoid: who bears the cost of a false positive versus a false negative, and what recourse they have.

### How to build fairer systems

Use a lifecycle approach. Bias checks should appear at pre-design, development, evaluation, and after deployment.

#### 1. Data practices

- **Audit who is counted.** Profile training data by source, time window, geography, and subgroup coverage. Report gaps and why they exist. Document data sheets for datasets.
- **Check the label.** Validate that the proxy you optimize for predicts what you think it does for each group. Replace costs with health need, arrest with offense, or clicks with stated goals where feasible, or adjust with additional signals such as avoidable costs or active chronic conditions as the Obermeyer study did.
- **Measure proxies.** Compute correlations between candidate features and protected attributes. Flag zip code, school, healthcare expenditure patterns, and text n-grams. Treat flagged features as candidates for removal, transformation, or constraint.
- **Fix representation honestly.** Options include targeted collection, stratified sampling, reweighting underrepresented examples, or generating synthetic data. None are free. Synthetic data can preserve errors if the generator is itself tilted. Reweighting helps only if the additional weight reflects real population prevalence.

#### 2. Modeling techniques

- **Pre-processing:** reweigh or resample training cases, remove or mask correlated features, learn representations that are independent of A.
- **In-processing:** add fairness constraints to the objective, such as equalized odds penalties, or use adversarial debiasing where a predictor is trained to perform well on the main task while an adversary that tries to infer A from predictions is made to fail. Research in Nature Machine Intelligence and later multi-adversarial work shows this can reduce reliance on A while largely preserving accuracy, but it can hurt calibration and requires careful tuning.
- **Post-processing:** adjust thresholds per group to meet a chosen metric, or apply calibration and rejection rules. Threshold adjustments are auditable and often simpler than retraining, but they require ongoing monitoring because distributions drift.

No method dominates. Pilot with held-out slices, view accuracy and chosen fairness metric across slices, and document the Pareto trade-off.

#### 3. Evaluation before you ship

- **Slice metrics.** Report performance disaggregated by race, gender, age, disability, language, and intersectional groups where sample allows. Report false positive and false negative rates, not just AUC.
- **Separate image quality from demographic effect.** For face or speech systems, control for lighting, pose, microphone type, and language variety. NIST found many false negative gaps were explained by quality.
- **Test for proxies and adversarial cases.** Probe with pairs that differ only in a name or zip code. Check stability across time and site.
- **External validation.** Run an independent replication on data the training team has not seen, as the healthcare manufacturer did on 3.7 million records.

A practical gate: if a model shows higher error for any protected group beyond the tolerance you set and documented, do not release it until you understand why and can mitigate or explain.

#### 4. People and process

- **Diverse teams and reviewers.** Lived experience helps spot missing groups and labeling flaws, but diversity without process does not fix bias by itself. Pair reviewer diversity with checklists, blinded review of recommendations, and participatory design sessions with affected users.
- **Human-centered design.** Use methods referenced in ISO 9241-210:2019 to involve users throughout, not only at the end, and to keep traceability of decisions.
- **Documentation.** Write a model card that states intended use, training data composition, metrics by group, known limits, and chosen fairness definition with rationale. Update it when data or use shifts.

#### 5. Governance and compliance

- **Map to a framework.** NIST AI RMF 1.0, released January 2023, organizes work into Govern, Map, Measure, and Manage. Bias is managed under Map, Measure, and Govern, where you set fairness goals and justify metric choice. Use the companion Playbook for implementation tasks.
- **Meet legal duties.** In the EU, the AI Act, Regulation (EU) 2024/1689, published July 12, 2024 and in force August 1, 2024, treats many uses discussed here as high-risk, including CV screening, credit scoring, and healthcare triage listed in Annex III. High-risk systems must have risk management, data governance that examines and mitigates bias, human oversight, logging, and technical documentation per Articles 9 through 15 and Annex IV. Bans on prohibited practices applied from February 2, 2025, general-purpose AI transparency from August 2, 2025, and most high-risk duties from August 2, 2026, with extensions to August 2, 2027 for embedded systems in regulated products. Check the EUR-Lex official text for your exact use case.
- **Provide recourse.** Allow affected people to contest automated decisions, receive a readable explanation, and request human review. Keep audit trails of inputs, thresholds, and overrides.

### Trade-offs to state plainly

- Fixing one fairness metric often moves another. For recidivism and loan defaults, improving equalized odds can reduce calibration. There is no single "fair" setting.
- Stricter parity can lower overall accuracy, but the size of the loss varies. The Science healthcare case cut racial bias by about 84 percent after correction while still predicting need well, showing that large gains are possible when the label is corrected.
- Small subgroups create uncertainty. Confidence intervals are wider, and disaggregated metrics can be noisy. Larger, better-sampled evaluation sets are often needed before drawing conclusions.
- Models decay. Population, policy, and care practices change, so fairness measured today is not fairness next quarter. Continuous monitoring is required, not a one-time test.

### How to get started

A short checklist that follows the sources above:

1. Define the decision and harms. Who benefits from a correct prediction, who is hurt by each type of error, and what remedy exists. Choose a primary fairness metric that matches that harm and document why.
2. Inventory your data. Record where each field came from, who is underrepresented, and which labels are proxies. Test proxy leakage with correlation and model-based checks.
3. Build sliced evaluation before you train. Set thresholds for acceptable gaps in error rates by group and require them to pass before deployment.
4. Try label or threshold fixes first. As in the healthcare case, correcting the outcome variable or applying group-specific thresholds is often simpler and more defensible than complex in-processing.
5. Run an independent fairness audit on unseen data and publish a model card with metrics by group, limits, and residual risks.
6. Plan monitoring and appeals. Log predictions and overrides, track drift in subgroup performance monthly, and provide a path for individuals to challenge outcomes with human review.

### Frequently Asked Questions

**1. Can we eliminate bias by removing sensitive data from the training set?**
No. Models learn correlated proxies such as zip code, school, healthcare spending patterns, or language in a resume. Removing the protected field does not remove the information carried by its proxies. The NIST SP 1270 guidance recommends explicit proxy testing and label validation rather than relying on blinding.

**2. Is AI bias always harmful?**
Not in the statistical sense. A model that identifies a genetic marker that varies in prevalence across groups is detecting a real pattern. It becomes harmful bias when that pattern, or a proxy for it, leads to unfair or discriminatory decisions or limits opportunity. The distinction depends on the use, the affected groups, and whether appropriate safeguards and justifications are in place.

**3. Who is responsible when biased AI causes harm?**
Responsibility is shared across those who commission, build, deploy, and use the system. In the United States, regulators assess both disparate treatment, intentional use of a protected attribute, and disparate impact, a neutral policy that produces unequal outcomes without sufficient justification. In the EU, the AI Act allocates duties to providers and deployers of high-risk systems. Contracts should state who owns data governance, testing, documentation, monitoring, and appeals, and organizations should keep records that allow an audit.

**4. How can users spot bias when using a tool?**
Look for patterns across many outputs, not one answer. If an image generator shows only men as CEOs or doctors, or a resume helper assigns higher scores to one demographic when other qualifications are held constant, that indicates skew. Try paired prompts that change only a name or gendered term, check sources and confidence scores, and report systematic skew to the provider. Useful signals include whether the tool explains its recommendation, provides citations, and allows you to override or correct it.

Building fairer AI is not about achieving perfect neutrality. It is about choosing the right fairness objective for the decision, measuring gaps for the people affected, correcting data and proxy problems at the source, and keeping humans accountable for oversight. The practices are documented, the trade-offs are known, and the expectations are now written into measurement standards and law. Applying them consistently is the work.
