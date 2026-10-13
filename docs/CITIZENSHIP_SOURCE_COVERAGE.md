# Citizenship source coverage

Reviewed 2026-10-12 UTC. The system clock returned `2026-10-12T19:35:01Z` at the initial review and `2026-10-12T19:56:52Z` at the full-list expansion. `checkedAt` records this review date, not a law's publication date.

`content/citizenship.json` contains **14 countries, 26 route records and 36 official source records**. All **13 Henley-listed countries** are covered, plus Vanuatu. This comprises 11 active defined-investment programs, two discretionary routes and one announced program with intake unverified. Three countries and five official sources were added in the full-list expansion; the total increase from the original three-country baseline is eleven countries.

## Coverage

The [Henley reference list](https://www.henleyglobal.com/citizenship-investment) was reopened before this expansion. Its thirteen country entries are Austria, Malta, Türkiye, Antigua and Barbuda, Dominica, Grenada, Saint Kitts and Nevis, Saint Lucia, Argentina, Jordan, Naoero (Nauru), Egypt, and São Tomé and Príncipe. All are included. Henley establishes list membership; official sources support the route facts, classifications and statuses. Vanuatu is additional coverage.

| Country | Routes | Lowest listed threshold, before additional fees | Principal official source |
| --- | ---: | --- | --- |
| Dominica | 2 | USD 200,000 | [CBIU](https://www.cbiu.gov.dm/investment-options/economic-diversification-fund/) |
| Antigua and Barbuda | 2 | USD 230,000 | [CIU](https://cip.gov.ag/investment-options/ndf/) |
| Türkiye | 3 | USD 400,000 | [Investment Office](https://www.invest.gov.tr/en/investmentguide/pages/acquiring-property-and-citizenship.aspx) |
| Grenada, added | 2 | USD 235,000 | [Investment Migration Agency](https://imagrenada.gd/becoming-a-citizen/) |
| Saint Kitts and Nevis, added | 2 | USD 250,000 | [CIU](https://ciu.gov.kn/sustainable-island-state-contribution/) |
| Saint Lucia, added | 2 | USD 240,000 | [CIP](https://www.cipsaintlucia.com/citizenship-by-investment) |
| Nauru, added | 1 | USD 115,000 regular contribution | [Naoero Program Office brochure, pp. 20 to 21](https://www.ecrcp.gov.nr/files/N_Brochure_260811_3_Digital.pdf) |
| São Tomé and Príncipe, added | 1 | USD 90,000 | [Citizenship Unit](https://cip.gov.st/donation-to-the-national-transformation-fund) |
| Egypt, added | 4 | USD 250,000 | [Cabinet Citizenship Unit](https://www.egyptcitizenship.gov.eg/ECI/InvestmentProgram/List.aspx) |
| Jordan, added | 3 | JOD 350,000, qualifying existing business only | [Ministry of Investment](https://invest.jo/en/ready-doing-business/jordanian-citizenship-through-investment) |
| Vanuatu, added | 1 | USD 130,000 DSP selling-price floor | [Citizenship Office](https://vancitizenship.gov.vu/index.php/citizenship/fees-and-charges) |
| Austria, added | 1 | No fixed investment threshold; discretionary | [Interior Ministry](https://www.bmi.gv.at/406/verleihung.aspx) |
| Malta, added | 1 | No fixed investment threshold; discretionary merit | [Community Malta Agency](https://komunita.gov.mt/wp-content/uploads/2026/02/Citizenship-by-Naturalisation-on-the-Basis-of-Merit.pdf) |
| Argentina, added | 1 | Operative threshold unverified; announced terms in capital note | [Economy Ministry announcement](https://www.argentina.gob.ar/noticias/luis-caputo-anuncio-la-puesta-en-marcha-del-programa-de-ciudadania-por-inversion-de) |

Existing Dominica thresholds, fees and holding periods were rechecked. Antigua now includes its approved-property route and the published USD 8,500 main-applicant due-diligence and USD 300 passport fees. Türkiye now includes the official bank-deposit and government-bond alternatives.

## Source decisions and gaps

- Nauru's August 2026 official brochure explicitly gives USD 115,000 as the regular contribution and USD 90,000 as a temporary offer. The contribution page says applications must be filed before **31 December 2026**. The JSON amount remains the regular threshold; the capital note gives the offer and deadline. No time-dependent price field or renderer change is needed. Henley's USD 120,000 / USD 95,000 figures were not substituted for these primary-source figures.
- São Tomé's official single-applicant donation is USD 90,000; USD 5,000 submission and USD 750 document charges are separate. Its family donation is USD 95,000. The official eligibility page contains inconsistent age text, so detailed dependant ages are omitted. Commercial pages that describe themselves as unofficial were used only to locate `cip.gov.st`.
- Grenada's detailed application table itemises USD 5,000 due diligence and USD 1,000 interview, while its FAQ labels USD 6,000 as due diligence. Both descriptions are disclosed without inventing a combined fee. The 2025 regulations confirm the restricted USD 270,000 shared-tourism route; USD 350,000 is the general approved-project threshold. The five-year resale-to-CBI condition is supported by the 2019 amendment Act.
- Saint Lucia's older FAQ still shows superseded prices. The current investment page and 2024 Gazette support USD 240,000 NEF. The 2026 regulations support USD 8,000 due diligence and a separate USD 350,000 financial-resources declaration. Only NEF and National Action Bonds are listed; current property and enterprise rules are more extensive than these selected routes.
- Egypt's direct HTTPS and HTTP connections timed out. The actual Arabic authority pages were retrieved through Jina Reader: [investment routes](https://r.jina.ai/https://www.egyptcitizenship.gov.eg/ECI/InvestmentProgram/List.aspx) and [application steps](https://r.jina.ai/https://www.egyptcitizenship.gov.eg/ECI/StaticContent/View.aspx?cid=5). The JSON links to the original authority. The USD 450,000 business route explicitly comprises USD 350,000 invested capital plus a USD 100,000 non-refundable grant. Deposit repayment is in EGP, not USD. The USD 10,000 application fee is additional on every route.
- Jordan remains in JOD. Its JOD 350,000 route requires three audited years of qualifying assets and Jordanian employment outside the Capital Governorate; it is not a new passive investment. Temporary-passport and property-residence paths on the same ministry page are excluded. That page does not publish application fees.
- Vanuatu's scanned DSP regulations were opened and OCR-read. The USD 130,000 amount is the applicant-facing minimum selling price, not the lower remittance to government. The current fee page gives USD 5,000 FIU due diligence; the older regulation's USD 2,000 figure is not used. The separate Form D text on the fee page is not conflated with DSP. Other Vanuatu routes were not added without equivalent route-specific verification.
- Türkiye's official page provides thresholds and holding conditions but no complete fee schedule. Amounts were not estimated. Existing null fields remain null, and all processing fields are null rather than estimated timelines.

## Full-list classifications

| Entry | Published classification and evidence |
| --- | --- |
| Austria | `Discretionary` status; `Exceptional contribution` kind. The [Interior Ministry](https://www.bmi.gv.at/406/verleihung.aspx) describes individual assessment under section 10(6), federal-government confirmation of exceptional services in Austria's special interest, and economic-achievement criteria. Mere money transfers are expressly insufficient. It specifies no fixed investment threshold, so both amount and currency are null. |
| Malta | `Discretionary` status; `Merit` kind. The [agency's February 2026 guide](https://komunita.gov.mt/wp-content/uploads/2026/02/Citizenship-by-Naturalisation-on-the-Basis-of-Merit.pdf) and the opened [current SL 188.06](https://legislation.mt/eli/sl/188.6/eng/pdf) support the merit process. The regulations delete the former direct-investment provisions and investment schedule through Legal Notice 159 of 2025. Amount and currency are null; the eight-month residence requirement is explicitly sourced. |
| Argentina | `Intake unverified` status; `Announced investment` kind. The [2 October 2026 government announcement](https://www.argentina.gob.ar/noticias/luis-caputo-anuncio-la-puesta-en-marcha-del-programa-de-ciudadania-por-inversion-de) proposes USD 350,000 contribution or USD 800,000 bond routes, with intake to become operational during Q4 2026. The [ministry's legal-framework explanation](https://www.argentina.gob.ar/noticias/los-extranjeros-que-realicen-inversiones-relevantes-en-el-pais-podran-solicitar-la) covers Decrees 366/2025 and 524/2025. The standing amount and currency are null because an operative, available route remains unverified; the official announced figures are accurately labelled in the capital note. |

No country from the reference list is excluded. The three additional records do not imply three additional active, priced CBI programs. For Argentina, `Intake unverified` describes the evidence gap, not a claim that the program is closed or that intake cannot have opened. The official site search returned the program announcement and legal-framework news; the reviewed [naturalisation service](https://www.argentina.gob.ar/servicio/obtener-ciudadania-argentina-por-naturalizacion) describes the separate two-year residence route and does not establish investment-program intake.

## Integration and checks

- Program, route and source object keys are unchanged. `amount` and `currency` now also accept null. New kinds are `Exceptional contribution`, `Merit` and `Announced investment`; new statuses are `Discretionary` and `Intake unverified`. These distinctions also appear in summaries because a listing may omit status metadata.
- There are 23 numeric route thresholds and three null-threshold records. Null never means zero. Austria and Malta have no fixed investment price; Argentina has officially announced figures but no verified operative threshold. Numeric sorting and minimum calculations must omit nulls and group published currencies.
- The first eleven country-code mappings were checked in the initial pass. The added records use `AT`, `MT` and `AR`; this content-only expansion does not infer passport access from a country code.
- PASS: JSON parsing, original key shapes, all thirteen reference-list countries plus Vanuatu, status counts, unique slugs/codes/source IDs, positive or null thresholds, paired null currencies, source references, HTTPS URLs and UTC review dates.
- The initial eleven-country pass passed `npm run test:citizenship` (5 tests) and `npm run typecheck -- --incremental false`. These are historical results, not a test claim for the nullable fourteen-country version. This expansion validates JSON internals only while UI integration is in progress.
- PASS: copy review against `.agents` antislop core/copywriting, with source-backed amounts, no promotional rankings, access counts or processing estimates, and no em/en dashes.
- Full build and browser integration belong to the combined UI/content verification. This content task edits only the JSON and this document.

### Combined verification

The final fourteen-country version uses only `/citizenship`. All former country URLs permanently redirect to their card anchors. Five citizenship tests, TypeScript, the complete fast prebuild gates, production build and postbuild passed on the integration branch. Production browser checks passed for all fourteen cards, nullable thresholds, region/route filters, three-country comparisons, official sources, passport navigation, generated public data, root-only sitemaps and crawler previews. All 32 social suffixes preserve queries and card fragments; unknown countries return 404. Tests covered mobile and desktop, both themes, keyboard interaction and enlarged text. The directory uses alphabetical ordering and displays no source-review dates; dates remain in source data and sitemap metadata.
