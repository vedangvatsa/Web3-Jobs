
import type { DigitalNomadVisa } from '@/types';

export const visaData: DigitalNomadVisa[] = [
  {
    country: 'Albania',
    continent: 'Europe',
    minIncome: 820,
    visaLength: '1 year, renewable up to 5',
    description: 'Known for its affordable cost of living and beautiful Adriatic coast, Albania\'s"Unique Permit" is a very accessible option for remote workers.',
    requirements: [
      'Proof of remote work for a foreign company.',
      'Minimum annual income of ~$10,000 (~$820/month).',
      'Proof of accommodation and health insurance.',
      'Clean criminal record.'
    ]
  },
  {
    country: 'Antigua and Barbuda',
    continent: 'North America',
    minIncome: 4167,
    visaLength: 'Up to 2 years',
    description: 'The Nomad Digital Residence (NDR) program allows remote workers to live in a Caribbean paradise. The visa is valid for up to two years.',
    requirements: [
      'Proof of remote work for a non-local company.',
      'Annual income of at least $50,000 USD (~$4,167/month).',
      'Health insurance coverage.',
      'Clean criminal record.'
    ]
  },
  {
    country: 'Argentina',
    continent: 'South America',
    minIncome: 0,
    visaLength: '180 days, renewable',
    description: 'Argentina\'s visa allows nomads to stay for 180 days, renewable for another 180. It offers access to Buenos Aires\' extensive cultural and culinary life.',
    requirements: [
      'Work remotely for a foreign company.',
      'Demonstrate sufficient funds (no fixed minimum is published).',
      'Available to nationals of visa-waiver countries.',
      'Valid passport and clean criminal record.',
    ]
  },
  {
    country: 'Armenia',
    continent: 'Asia',
    minIncome: 0,
    visaLength: '1 year, renewable',
    description: 'Armenia offers a very accessible path by allowing remote workers to register as sole proprietors. The country has a simple, low-tax system. No minimum income is stated.',
    requirements: [
      'Obtain a residency permit by registering as a self-employed person.',
      'No minimum income requirement to register.',
      'Open a local bank account.',
      'Provide an address in Armenia.'
    ]
  },
  {
    country: 'Aruba',
    continent: 'North America',
    minIncome: 0,
    visaLength: 'Up to 90 days',
    description: 'Aruba\'s"One Happy Workation" program allows a stay of up to 90 days. While not a long-term visa, it\'s an attractive option for short stays.',
    requirements: [
      'Hold a passport from an eligible country (e.g., US).',
      'Proof of remote work for a non-Aruban company.',
      'Sufficient funds to support the stay (no specific amount).'
    ]
  },
  {
    country: 'Bahamas',
    continent: 'North America',
    minIncome: 0,
    visaLength: '1 year',
    description: 'The Bahamas Extended Access Travel Stay (BEATS) program allows professionals and students to work or study remotely from the islands for up to one year.',
    requirements: [
      'Valid passport.',
      'Proof of remote work or student status.',
      'Sufficient funds to support yourself during your stay.',
      'No specific minimum income is required.'
    ]
  },
  {
    country: 'Barbados',
    continent: 'North America',
    minIncome: 4167,
    visaLength: '12 months, renewable',
    description: 'The"Barbados Welcome Stamp" allows remote workers to live on the island for 12 months, with an option to renew. It\'s one of the most popular Caribbean programs.',
    requirements: [
      'Proof of remote employment or self-employment.',
      'Annual income of at least $50,000 USD (~$4,167/month).',
      'Health insurance valid in Barbados.',
    ]
  },
  {
    country: 'Belize',
    continent: 'North America',
    minIncome: 6250,
    visaLength: '6 months, non-extendable',
    description: 'Belize\'s"Work Where You Vacation" program (Long Stay Visitor Permit) allows a stay of up to 6 months, aimed at professionals who want to enjoy the country\'s natural beauty.',
    requirements: [
      'Citizen or permanent resident of the EU, UK, USA, or Canada.',
      'Proof of employment with a foreign company.',
      'Annual income of at least $75,000 USD for individuals (~$6,250/month), or $100,000 with dependents.',
      'Health insurance with at least $50,000 USD coverage.'
    ]
  },
  {
    country: 'Bermuda',
    continent: 'North America',
    minIncome: 0,
    visaLength: '1 year, renewable',
    description: 'The"Work From Bermuda" certificate allows remote workers to live in this self-governing British territory for one year. No minimum income is specified, but the cost of living is high.',
    requirements: [
      'Proof of remote employment or enrollment in higher education.',
      'Sufficient funds to support your stay.',
      'Health insurance and a clean criminal record.'
    ]
  },
  {
    country: 'Brazil',
    continent: 'South America',
    minIncome: 1500,
    visaLength: '1 year, renewable',
    description: 'Brazil\'s digital nomad visa allows for an initial stay of one year, renewable for another year. The income requirement is one of the most reasonable.',
    requirements: [
      'Proof of remote work status.',
      'Monthly income of at least $1,500 USD from foreign sources, OR a bank balance of at least $18,000.',
      'Clean criminal record and health insurance.'
    ]
  },
   {
    country: 'Bulgaria',
    continent: 'Europe',
    minIncome: 0,
    visaLength: '12 months, renewable',
    description: 'Bulgaria offers a Type D Visa through a freelance permit. It boasts a low cost of living, a growing tech scene in Sofia, and a 10% flat tax rate.',
    requirements: [
      'Obtain a freelance permit from the Employment Agency.',
      'Prove sufficient financial means (no fixed amount is published).',
      'Non-EU/EEA national.',
      'Bulgaria is a full Schengen member since January 2025 (air/sea borders opened March 2024).'
    ]
  },
  {
    country: 'Cabo Verde',
    continent: 'Africa',
    minIncome: 1630,
    visaLength: '6 months, renewable',
    description: 'The Cabo Verde Remote Working Program allows a stay of six months, renewable for another six. It targets remote workers from Europe, North America, and ECOWAS countries. Note: the program portal has been offline - verify availability before applying.',
    requirements: [
      'Proof of remote work and sufficient funds.',
      'Average bank balance of at least €1,500 (~$1,630 USD) over the last 6 months.',
      'Valid passport and travel insurance.',
    ]
  },
  {
    country: 'Cambodia',
    continent: 'Asia',
    minIncome: 0,
    visaLength: 'Up to 1 year',
    description: 'While there is no specific nomad visa, Cambodia\'s E-Class Business Visa is a popular long-term option for remote workers. It is extendable for up to one year.',
    requirements: [
      'Initially a 30-day visa, extendable for 1, 3, 6, or 12 months.',
      'No official income requirements.',
      'Requires obtaining a Cambodian work permit to work legally.'
    ]
  },
  {
    country: 'Colombia',
    continent: 'South America',
    minIncome: 1200,
    visaLength: 'Up to 2 years',
    description: 'Colombia offers a digital nomad visa (V-Nómadas Digitales) valid for up to two years. The income requirement is based on 3x the Colombian monthly minimum wage.',
    requirements: [
      'Passport from a visa-exempt country.',
      'Proof of remote work for a foreign company.',
      'Monthly income of at least 3x SMMLV (COP 5,252,715 in 2026, ~$1,200 USD) for each of the last 3 months.',
      'Health insurance with coverage in Colombia.'
    ]
  },
  {
    country: 'Costa Rica',
    continent: 'North America',
    minIncome: 3000,
    visaLength: '1 year, renewable',
    description: 'Costa Rica\'s"Estancia por Teletrabajo" visa is for one year, extendable for a second. Nomads are exempt from income tax and can enjoy the"Pura Vida" lifestyle.',
    requirements: [
      'Proof of remote work for a foreign entity.',
      'Stable monthly income of at least $3,000 USD ($5,000 for families).',
      'Health insurance covering the duration of the stay.'
    ]
  },
  {
    country: 'Croatia',
    continent: 'Europe',
    minIncome: 4200,
    visaLength: 'Up to 18 months',
    description: 'Croatia offers a temporary residence permit for nomads, granting up to 18 months (shorter grants can be extended once). It\'s known for its beautiful coastline.',
    requirements: [
      'Proof of remote work for a foreign company.',
      'Monthly income of at least €3,622.50 (2.5x the average Croatian net salary, recalculated annually).',
      'Proof of accommodation and health insurance.',
      'Clean criminal record check.'
    ]
  },
  {
    country: 'Curacao',
    continent: 'North America',
    minIncome: 0,
    visaLength: '6 months, renewable',
    description: 'The @HOME in Curaçao program allows remote workers to stay on the island for up to six months, with a possible six-month extension.',
    requirements: [
      'Proof of remote work or ability to support oneself financially.',
      'No specific minimum income is listed.',
      'Valid passport and health insurance.',
    ]
  },
  {
    country: 'Cyprus',
    continent: 'Europe',
    minIncome: 3800,
    visaLength: '1 year, renewable for two',
    description: 'Cyprus attracts nomads with its sunny weather and strategic location. The permit is for one year, renewable for two more. You are not subject to local income tax.',
    requirements: [
      'Proof of remote work for clients or an employer outside Cyprus.',
      'Net monthly income of at least €3,500 (~$3,800 USD).',
      'Proof of accommodation and health insurance.',
      'Clean criminal record.'
    ]
  },
  {
    country: 'Czech Republic',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Up to 1 year',
    description: 'The Czech Republic offers a long-term visa for business (Zivno), popular among freelancers. It requires a trade license and proof of funds rather than a monthly income.',
    requirements: [
      'A trade license (Zivnostenske opravneni)',
      'Proof of funds of CZK 156,500 (~$6,800 USD, 50x the subsistence minimum) - not a monthly income test',
      'Proof of accommodation and a clean criminal record',
      'Extensions are limited to the first year; longer stays require switching to a residence permit'
    ]
  },
  {
    country: 'Dominica',
    continent: 'North America',
    minIncome: 4167,
    visaLength: 'Up to 18 months',
    description: 'Dominica\'s"Work in Nature" (WIN) visa allows a stay of up to 18 months, targeting professionals who want to work surrounded by the island\'s lush nature.',
    requirements: [
      'Proof of remote work.',
      'Expected annual income of $50,000 USD (~$4,167/month).',
      'Health insurance.',
    ]
  },
  {
    country: 'Ecuador',
    continent: 'South America',
    minIncome: 1410,
    visaLength: '2 years, renewable once',
    description: 'Ecuador offers a professional, technical, or artisanal visa (Rentista) for up to two years. It\'s a great option for those seeking adventure in a biodiverse country.',
    requirements: [
      'Proof of a stable income from foreign sources.',
      'Minimum monthly income of three unified basic salaries ($1,410 USD, based on the 2025 SBU of $470).',
      'Clean criminal record and health insurance.',
    ]
  },
  {
    country: 'Estonia',
    continent: 'Europe',
    minIncome: 4300,
    visaLength: 'Up to 1 year',
    description: 'Estonia was a pioneer, launching one of the first dedicated digital nomad visas. It allows you to work remotely for a company registered abroad for up to one year.',
    requirements: [
      'Proof of remote work contract or business registration.',
      'Monthly income of at least €3,960 (~$4,300 USD, calculated as €132 per day) for the last 6 months.',
      'Health insurance for Estonia.'
    ]
  },
  {
    country: 'Georgia',
    continent: 'Europe',
    minIncome: 2000,
    visaLength: 'Up to 1 year',
    description: 'Georgia\'s"Remotely from Georgia" program allows citizens of 95 countries to stay and work for at least 180 days and up to a year. It\'s known for its simple application and low cost of living.',
    requirements: [
      'Citizen of one of the 95 eligible countries.',
      'Proof of remote work.',
      'Monthly income of at least $2,000 USD.',
      'Travel health insurance for the entire stay.'
    ]
  },
  {
    country: 'Germany',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Up to 3 years',
    description: 'Germany offers a freelance residence permit (Aufenthaltserlaubnis, §21 AufenthG) allowing self-employed remote workers to live in the country for up to 3 years. There is no fixed minimum income; viability of your freelance activity is assessed case-by-case.',
    requirements: [
      'Evidence the freelance activity is economically viable (clients, contracts, financing).',
      'Applicants under 45 must show adequate pension provision.',
      'German health insurance and registered address (Anmeldung).'
    ]
  },
  {
    country: 'Greece',
    continent: 'Europe',
    minIncome: 3800,
    visaLength: '2 years, renewable',
    description: 'Greece\'s digital nomad visa offers a two-year stay with a potential for extension and a 50% tax break for up to 7 years, providing access to a beautiful Mediterranean lifestyle.',
    requirements: [
      'Work remotely for a foreign employer or your own foreign-registered company.',
      'Net monthly income of €3,500 (~$3,800 USD).',
      'Clean criminal record and health insurance.'
    ]
  },
  {
    country: 'Grenada',
    continent: 'North America',
    minIncome: 3083,
    visaLength: '1 year, renewable',
    description: 'Grenada\'s Remote Employment Act of 2021 allows a one-year stay, renewable for another year. It caters to those looking for a quiet Caribbean work-life balance.',
    requirements: [
      'Proof of remote work for a non-Grenadian company.',
      'Annual income of at least $37,000 USD (~$3,083/month).',
      'Valid passport and health insurance.',
    ]
  },
  {
    country: 'Hungary',
    continent: 'Europe',
    minIncome: 3250,
    visaLength: '1 year, renewable once',
    description: 'Hungary\'s"White Card" is a residence permit for digital nomads. It allows a stay of one year, extendable for one more. It targets high-income remote workers.',
    requirements: [
      'Proof of remote work contract outside of Hungary.',
      'Monthly income of at least €3,000 (~$3,250 USD) for the last 6 months.',
      'Cannot have shares in a Hungarian company.',
      'Proof of accommodation.'
    ]
  },
  {
    country: 'Iceland',
    continent: 'Europe',
    minIncome: 7200,
    visaLength: 'Up to 180 days',
    description: 'Iceland offers a long-term visa for remote workers with a very high income requirement. It\'s for high-earning professionals looking to experience Iceland\'s unique nature.',
    requirements: [
      'Must not be an EU/EEA/EFTA citizen.',
      'Proof of remote work for a foreign company.',
      'Monthly income of 1,000,000 ISK (approx. $7,200 USD).',
      'Health insurance valid in Iceland.'
    ]
  },
  {
    country: 'Indonesia',
    continent: 'Asia',
    minIncome: 5000,
    visaLength: 'Up to 1 year (renewable)',
    description: 'Indonesia\'s E33G Remote Worker KITAS allows digital nomads to live in Bali and beyond for up to one year. A shorter B211A Visit Visa (up to 180 days) is also available with lower requirements.',
    requirements: [
      'E33G KITAS: Annual income of at least $60,000 USD ($5,000/month).',
      'B211A Visit Visa: Proof of $2,000 USD in savings (up to 180 days).',
      'Proof of employment or business ownership outside Indonesia.',
      'Valid passport with at least 6 months validity.',
      'Proof of health insurance and clean criminal record.'
    ]
  },
  {
    country: 'Ireland',
    continent: 'Europe',
    minIncome: 0,
    visaLength: '90 days (not extendable)',
    description: 'Ireland does not have a dedicated nomad visa. The Atypical Working Scheme allows short-term (max 90 days) specialized assignments arranged by a host employer. Longer stays require a standard employment permit.',
    requirements: [
      'A host company in Ireland must arrange the Atypical Working Scheme application.',
      'Salary must meet the General Employment Permit threshold (EUR 34,000/year).',
      'The 90-day cap applies with a cooling-off period before reuse.',
    ]
  },
  {
    country: 'Italy',
    continent: 'Europe',
    minIncome: 2680,
    visaLength: '1 year, renewable',
    description: 'Launched in 2024, Italy\'s Digital Nomad Visa targets "highly skilled" professionals. It grants a one-year renewable permit.',
    requirements: [
      'Must be a"highly skilled worker" (degree or 3+ years experience).',
      'Minimum annual income of €28,000 (~€2,333/month, ~$2,680 USD).',
      'Health insurance covering all risks in Italy.',
      'Proof of accommodation.',
    ]
  },
  {
    country: 'Japan',
    continent: 'Asia',
    minIncome: 5650,
    visaLength: 'Up to 6 months (non-renewable)',
    description: 'Japan introduced a digital nomad visa in 2024 for citizens of 49 countries that have tax treaties with Japan. It allows a stay of up to six months but cannot be renewed (6-month wait before reapplying).',
    requirements: [
      'Citizen of a visa-exempt country with a tax treaty with Japan (49 eligible countries)',
      'Annual income of at least ¥10 million (~$68,000 USD)',
      'Private health/travel insurance with at least ¥10 million in treatment coverage',
      'Proof of remote work or freelance activity'
    ]
  },
  {
    country: 'Kazakhstan',
    continent: 'Asia',
    minIncome: 3000,
    visaLength: '1 year, extendable for 1 more',
    description: 'Kazakhstan\'s "Neo Nomad Visa" (Category B12-1) launched in November 2024. It targets remote workers earning foreign income, offering a low-tax stay with no obligation to file local taxes on overseas earnings.',
    requirements: [
      'Proof of remote work for a foreign employer or clients.',
      'Monthly income of at least $3,000 USD (6 months of bank statements).',
      'Tax return from country of citizenship.',
      'Criminal record certificate (apostilled).',
      'Health insurance valid in Kazakhstan for the full visa period.',
      'No local employment permitted.'
    ]
  },
  {
    country: 'Kenya',
    continent: 'Africa',
    minIncome: 0,
    visaLength: '1-2 years, renewable',
    description: 'Kenya\'s Class N "Digital Nomads" permit (not to be confused with Class K for retirees) allows remote workers employed by foreign companies to live in Kenya. No specific income threshold is published on the official portal: only proof of foreign income via bank statements.',
    requirements: [
      'Work for an employer or clients outside Kenya (local employment prohibited).',
      'Bank statements or payslips for the last 3 months proving foreign income.',
      'Employer/company cover letter to the Director General.',
      'Valid passport and proof of accommodation.',
      'Issuance fee: USD 1,000/year. Processing fee: USD 200.'
    ]
  },
  {
    country: 'Latvia',
    continent: 'Europe',
    minIncome: 2700,
    visaLength: '1 year, renewable',
    description: 'Latvia offers a temporary residence permit for remote workers, allowing stays of up to one year with renewal while conditions hold.',
    requirements: [
      'Proof of remote work for a foreign employer.',
      'Monthly income of at least 3x the Latvian minimum monthly wage (€2,340/month as of April 2026).',
      'Valid health insurance.'
    ]
  },
  {
    country: 'Malaysia',
    continent: 'Asia',
    minIncome: 2000,
    visaLength: '3-12 months, renewable up to 24 months total',
    description: 'The DE Rantau Nomad Pass aims to establish Malaysia as a leading digital nomad hub. It is issued as a Professional Visit Pass of 3-12 months, renewable once.',
    requirements: [
      'Proof of remote work (freelancer or remote employee).',
      'Annual income of at least $24,000 USD ($2,000/month) for tech talent, or $60,000 USD for non-tech talent.',
      'Spouses may not work locally.',
      'Valid passport and health insurance.',
    ]
  },
  {
    country: 'Malta',
    continent: 'Europe',
    minIncome: 4000,
    visaLength: '1 year, renewable up to 3 times (max 4 years)',
    description: 'Malta\'s Nomad Residence Permit is for non-EU nationals and allows a stay of one year. Malta offers an English-speaking environment and sunny Mediterranean climate.',
    requirements: [
      'Proof of remote work for a foreign company.',
      'Gross annual income of at least €42,000 (~€3,500/month) for applications since April 2024.',
      'Valid travel document and health insurance (EU + UK coverage).',
      'Rental or purchase agreement for accommodation.'
    ]
  },
  {
    country: 'Mauritius',
    continent: 'Africa',
    minIncome: 0,
    visaLength: '1 year, renewable',
    description: 'The Mauritius Premium Visa is a free, one-year renewable visa for remote workers. It offers a tropical lifestyle with no local income tax obligations.',
    requirements: [
      'Proof of remote work and funds from outside Mauritius.',
      'No minimum income requirement.',
      'Must not enter the Mauritian labour market.',
      'Proof of accommodation and health insurance.',
    ]
  },
  {
    country: 'Mexico',
    continent: 'North America',
    minIncome: 1850,
    visaLength: '1 year, up to 4',
    description: 'Mexico\'s Temporary Resident Visa is very popular with remote workers. It allows stays longer than 180 days and up to four years.',
    requirements: [
      'Proof of economic solvency.',
      'A monthly income of at least 300x the daily UMA (MXN 35,193/month in 2026, ~$1,850 USD), OR equivalent savings.',
      'Must be applied for from a Mexican consulate outside of Mexico.'
    ]
  },
  {
    country: 'Montenegro',
    continent: 'Europe',
    minIncome: 0,
    visaLength: '2 years, renewable for 2 more',
    description: 'Montenegro offers a temporary residence permit for digital nomads, allowing a stay of up to two years, with a possible extension of another two.',
    requirements: [
      'Proof of remote work for a foreign company (or your own company not registered in Montenegro).',
      'Proof of sufficient financial means (no fixed amount is published).',
      'Proof of accommodation.',
      'Valid travel document and health insurance.'
    ]
  },
  {
    country: 'Moldova',
    continent: 'Europe',
    minIncome: 3022,
    visaLength: 'Up to 2 years (full re-application required on renewal)',
    description: 'Moldova\'s Digital Nomad program is technically a temporary residence permit, not a visa. Launched September 2025, the income requirement is formula-based (18× the current year\'s forecasted average monthly salary) rather than a fixed dollar amount.',
    requirements: [
      'Remote work exclusively for a foreign-registered legal entity (employment, service, or shareholder contract).',
      'Show income of 18× the current-year forecasted average monthly salary over the preceding 6 months (~$3,022/month for 2026).',
      'Criminal record certificate (apostilled, waived on renewal).',
      'Valid health insurance in Moldova.',
      'Proof of accommodation.',
      'In-person application at the General Inspectorate for Migration (GIM).'
    ]
  },
  {
    country: 'Morocco',
    continent: 'Africa',
    minIncome: 0,
    visaLength: '90 days',
    description: 'Morocco does not have a specific digital nomad visa. However, remote workers can enter on a standard tourist visa for up to 90 days.',
    requirements: [
      'Sufficient funds to support your stay.',
      'Stays under 183 days are exempt from local income tax.',
    ]
  },
  {
    country: 'Namibia',
    continent: 'Africa',
    minIncome: 2000,
    visaLength: 'Up to 6 months',
    description: 'Namibia launched a digital nomad visa in 2022, allowing a stay of up to six months. Ideal for those wanting to explore the country\'s unique landscapes.',
    requirements: [
      'Proof of remote work for a foreign employer.',
      'Minimum monthly income of $2,000.',
      'Health insurance and clean criminal record.',
    ]
  },
  {
    country: 'Netherlands',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Varies by permit (typically 1-2 years)',
    description: 'The Netherlands has no digital nomad visa. The closest routes are the self-employed residence permit (points-based business plan assessment) and the Dutch-American Friendship Treaty (DAFT) for US entrepreneurs.',
    requirements: [
      'Self-employed route: a business plan scored on viability via RVO points system.',
      'DAFT route (US citizens only): investment capital in a Dutch business, not an income threshold.',
      'No remote-work-for-foreign-employer category exists.'
    ]
  },
  {
    country: 'New Zealand',
    continent: 'Oceania',
    minIncome: 0,
    visaLength: 'Up to 9 months per visitor visa',
    description: 'New Zealand introduced a remote work allowance for visitor visa and NZeTA holders in January 2025. This is not a dedicated digital nomad visa; remote work is simply permitted under existing visitor visa conditions. Work must be for overseas employers only.',
    requirements: [
      'Hold a valid visitor visa or NZeTA (applied for on or after 27 January 2025).',
      'Work must be for an overseas employer or client: no work for NZ employers.',
      'Sufficient funds for the duration of stay (standard visitor visa requirement).',
      '92-day tax threshold: NZ tax may apply if staying 92+ days in a 12-month period.'
    ]
  },
  {
    country: 'North Macedonia',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Not yet available',
    description: 'North Macedonia announced a digital nomad permit in 2024, but it was never enacted. Remote workers use ordinary temporary residence routes under the Law on Foreigners.',
    requirements: [
      'Details are yet to be announced (TBA).',
      'Expected to offer low living costs.'
    ]
  },
  {
    country: 'Norway',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Up to 2 years per grant (self-employed route)',
    description: 'Norway has no digital nomad visa. The former independent contractor permit has been discontinued. The closest route is a self-employed permit requiring a company abroad and skilled-worker qualifications.',
    requirements: [
      'An assignment contract with one Norwegian enterprise (not remote work for foreign clients).',
      'Pay not poorer than normal in Norway: at least NOK 545,400/year (~$4,500/month, bachelor level).',
      'Skilled-worker qualifications required.',
    ]
  },
  {
    country: 'Panama',
    continent: 'North America',
    minIncome: 3000,
    visaLength: '9 months, renewable once',
    description: 'Panama\'s Short-Stay Visa for Remote Workers is valid for nine months and renewable once. It offers a low cost of living and a strategic location.',
    requirements: [
      'Proof of remote work for a foreign company.',
      'Annual income of at least $36,000 USD ($3,000/month).',
      'Health insurance valid in Panama.',
    ]
  },
  {
    country: 'Paraguay',
    continent: 'South America',
    minIncome: 0,
    visaLength: 'Temporary residence (typically 1-2 years)',
    description: 'Paraguay has no dedicated digital nomad visa, but foreign nationals can apply for temporary residency under general categories (Ley 6984/22), making it an option for remote workers. The process involves submitting documents and obtaining a residence permit.',
    requirements: [
      'Proof of economic solvency (no specific amount).',
      'Clean criminal record.',
      'Birth and marriage certificates.'
    ]
  },
  {
    country: 'Peru',
    continent: 'South America',
    minIncome: 1240,
    visaLength: '1 year, renewable',
    description: 'Peru launched the "nomada digital" residence category with a one-year duration (renewable) for remote workers.',
    requirements: [
      'Proof of remote work for a company outside Peru.',
      'Minimum monthly income of $1,240 USD.',
      'Health insurance.',
    ]
  },
   {
    country: 'Philippines',
    continent: 'Asia',
    minIncome: 2000,
    visaLength: '1 year, renewable',
    description: 'The Philippines\' Digital Nomad Visa, launched via Executive Order No. 86, allows a stay of up to 12 months with a 12-month extension. Applicants must be from a country that offers a reciprocal visa to Filipino nationals.',
    requirements: [
      'Minimum annual income of $24,000 USD (~$2,000/month).',
      'Must be a citizen of a country offering reciprocal nomad visa to Filipinos.',
      'Proof of remote work or freelance contracts with foreign clients.',
      'Health insurance and clean criminal record.'
    ]
  },
  {
    country: 'Poland',
    continent: 'Europe',
    minIncome: 0,
    visaLength: 'Up to 3 years (temporary residence)',
    description: 'Poland doesn\'t have a dedicated nomad visa, but non-EU freelancers and remote workers can obtain a temporary residence permit via Voivodeship offices.',
    requirements: [
      'Proof of stable and regular income (no fixed minimum; subsistence benchmark ~PLN 776/month).',
      'Health insurance.',
      'Proof of accommodation.'
    ]
  },
  {
    country: 'Portugal',
    continent: 'Europe',
    minIncome: 4000,
    visaLength: '4-month visa, then 2-year permits up to 5 years',
    description: 'Portugal\'s D8 visa is highly popular. It offers a path to residency and access to the Schengen Area. The country boasts a great quality of life and active startup and engineering hubs in Lisbon and Porto.',
    requirements: [
      'Proof of income from remote work.',
      'Monthly income of at least 4 times the Portuguese minimum wage (€3,480/month in 2025, ~$4,000 USD; revised annually).',
      'Proof of accommodation for at least 12 months.',
      'Clean criminal record and private health insurance.'
    ]
  },
  {
    country: 'Puerto Rico',
    continent: 'North America',
    minIncome: 0,
    visaLength: 'No limit for US citizens',
    description: 'As a US territory, Puerto Rico requires no visa or time limit for US citizens. For others, a standard US visa (like ESTA for eligible countries) allows a 90-day stay.',
    requirements: [
      'US Citizens can work freely.',
      'Others require a valid US visa (e.g., ESTA).',
      'Tax incentives under Act 60 are available for residents.'
    ]
  },
  {
    country: 'Romania',
    continent: 'Europe',
    minIncome: 6200,
    visaLength: '1 year, renewable',
    description: 'Romania provides a digital nomad visa with one of the highest income requirements. It allows a one-year stay, which can be extended.',
    requirements: [
      'Proof of remote work for a company registered outside Romania.',
      'Monthly income of at least three times the Romanian average gross salary (~€5,400/month as of 2025, ~$6,200 USD; floating target revised quarterly).',
      'Income proven for each of the last 6 months.',
      'Proof of accommodation and health insurance.'
    ]
  },
  {
    country: 'Saint Lucia',
    continent: 'North America',
    minIncome: 0,
    visaLength: 'Up to 1 year',
    description: 'The"Live It" program in Saint Lucia offers a multiple-entry visa for up to one year. It is aimed at individuals who want to work remotely while enjoying the island.',
    requirements: [
      'Proof of remote work and sufficient funds for the stay.',
      'No specific minimum income is stated.',
      'Valid passport.',
    ]
  },
  {
    country: 'Serbia',
    continent: 'Europe',
    minIncome: 4025,
    visaLength: '1 year',
    description: 'Serbia\'s Law on Foreigners (amended February 2024) explicitly allows temporary residence for foreigners working remotely for foreign employers.',
    requirements: [
      'Proof of remote work and a reported monthly income of at least €3,500 (~$4,025 USD).',
      'Low cost of living compared to the high income requirement.',
      'Temporary residence is granted for up to 1-3 years depending on basis.'
    ]
  },
  {
    country: 'Seychelles',
    continent: 'Africa',
    minIncome: 0,
    visaLength: 'Up to 1 year',
    description: 'The Seychelles Workcation Program allows visitors to stay and work remotely for up to one year. It requires proof of being a remote worker or business owner.',
    requirements: [
      'Valid passport and proof of remote work/business ownership.',
      'Proof of funds/income.',
      'Health and travel insurance.',
    ]
  },
  {
    country: 'South Africa',
    continent: 'Africa',
    minIncome: 2900,
    visaLength: '1 year, up to 3',
    description: 'South Africa has introduced a digital nomad visa (Immigration Amendment Act 2024), allowing remote work for a foreign employer.',
    requirements: [
      'Proof of remote work for a foreign employer; may not serve the South African market',
      'Annual earnings of at least R650,000 (~$34,000 USD or ~$2,900/month)',
      'Sufficient funds and comprehensive health insurance',
      'Clean criminal record'
    ]
  },
  {
    country: 'South Korea',
    continent: 'Asia',
    minIncome: 5500,
    visaLength: 'Up to 3 years (F-1-D, permanent since July 2026)',
    description: 'South Korea\'s F-1-D"workcation" visa was made permanent in July 2026 with eased eligibility and longer stays. The original 2024 pilot required high income and capped stays at 2 years.',
    requirements: [
      'Proof of remote work for a foreign company for at least 1 year.',
      'Income threshold (originally KRW 85M/year ~ $5,500/month; lowered under the July 2026 rules, especially for applicants under 55).',
      'Private health insurance enrollment required.'
    ]
  },
  {
    country: 'Spain',
    continent: 'Europe',
    minIncome: 3100,
    visaLength: '1 year, up to 5',
    description: 'Spain\'s digital nomad visa allows non-EU citizens to live and work remotely for up to five years. It offers a favorable tax regime under"Beckham\'s Law" (24% flat tax rate on Spanish-source income).',
    requirements: [
      'Proof of being a qualified professional (university degree or 3+ years of experience).',
      'Work contract with a foreign company (active for at least 3 months).',
      'Income of at least 200% of the Spanish minimum wage (€2,760/month in 2025, ~$3,100 USD).',
      'Clean criminal record and comprehensive health insurance.'
    ]
  },
  {
    country: 'Sri Lanka',
    continent: 'Asia',
    minIncome: 2000,
    visaLength: '1 year, renewable',
    description: 'Sri Lanka officially launched its Digital Nomad Visa in February 2026. It allows remote workers to stay for 12 months, renewable annually. The visa fee is $500 USD.',
    requirements: [
      'Minimum monthly income of $2,000 USD from foreign sources.',
      'Proof of remote work, freelancing, or business ownership outside Sri Lanka.',
      'Valid passport (6+ months), health insurance, and clean criminal record.',
      'Application fee of $500 USD.'
    ]
  },
  {
    country: 'Taiwan',
    continent: 'Asia',
    minIncome: 3333,
    visaLength: '180 days, extendable up to 2 years',
    description: 'Taiwan launched a Digital Nomad Visitor Visa in January 2025. The Employment Gold Card (open work permit + residence, 1-3 years) remains an option for highly skilled professionals.',
    requirements: [
      'Age 30+: annual salary of at least $40,000 USD in one of the last 2 years (age 20-29: $20,000/year).',
      'OR hold another country\'s digital nomad visa.',
      'Bank balance averaging at least $10,000 USD/month over the past 6 months.',
      'Health insurance and proof of remote employment.'
    ]
  },
  {
    country: 'Thailand',
    continent: 'Asia',
    minIncome: 0,
    visaLength: '5 years (Destination Thailand Visa)',
    description: 'Thailand offers the Destination Thailand Visa (DTV) for digital nomads and remote workers. It is a 5-year multiple-entry visa with 180-day stays per entry, extendable once.',
    requirements: [
      'Proof of remote work, freelancing, or being a digital nomad',
      'Bank balance of at least 500,000 THB (~$14,000 USD) - a funds test, not an income test',
      'Valid passport and health insurance'
    ]
  },
  {
    country: 'Turkey',
    continent: 'Asia',
    minIncome: 3000,
    visaLength: 'Short-term residence permit (duration varies)',
    description: 'Turkey introduced digital nomad provisions in April 2024, implemented as a short-term residence permit for remote workers from designated countries. It offers a low cost of living and is tax-free for stays under 183 days.',
    requirements: [
      'Citizen of an eligible country (US, Canada, UK, EU, etc.).',
      'Reported minimum monthly income of $3,000 USD.',
      'Valid passport and proof of accommodation.'
    ]
  },
  {
    country: 'UAE (Dubai)',
    continent: 'Asia',
    minIncome: 3500,
    visaLength: '1 year, renewable',
    description: 'Dubai\'s virtual work program allows professionals to live in the emirate while working for companies overseas. It offers a tax-free environment and a high-tech lifestyle.',
    requirements: [
      'Passport with minimum 6 months validity.',
      'Proof of employment with a contract valid for one year.',
      'Monthly salary of at least $3,500 USD.',
      'Health insurance with UAE coverage.'
    ]
  },
  {
    country: 'Uruguay',
    continent: 'South America',
    minIncome: 0,
    visaLength: '6-12 months',
    description: 'Uruguay offers the "Hoja de Identidad Provisoria - Nomada Digital" for six months, renewable. It\'s notable for not having a specific income requirement, though applicants must prove they can support themselves.',
    requirements: [
      'A sworn statement declaring you have the means to support yourself.',
      'No specified minimum income.',
      'Clean criminal record.',
      'Offers a path to permanent residency.'
    ]
  },
  {
    country: 'Vietnam',
    continent: 'Asia',
    minIncome: 0,
    visaLength: '90 days',
    description: 'Vietnam does not have a specific nomad visa, but its Tourist e-Visa is popular with remote workers, allowing stays of up to 90 days. It can be renewed by leaving and re-entering.',
    requirements: [
      'Tourist e-Visa available to citizens of most countries.',
      'No official income requirement.',
      'Low cost of living and large remote worker community.'
    ]
  },
  {
    country: 'Andorra',
    continent: 'Europe',
    minIncome: 4500,
    visaLength: 'Residency permit for remote workers',
    description: 'Andorra offers a remote worker residency permit under its Digital Economy Law. It is set in a safe, low-tax European microstate with beautiful Pyrenean nature.',
    requirements: [
      'Work remotely for an employer or clients based outside Andorra.',
      'Proof of monthly income of at least 3x Andorran minimum wage (approx. €4,128/month, ~$4,500 USD).',
      'Proof of local accommodation (rental or purchase agreement).',
      'Clean criminal record and private health insurance.'
    ]
  },
  {
    country: 'Kyrgyzstan',
    continent: 'Asia',
    minIncome: 417,
    visaLength: 'Initially 60 days, extendable up to 1 year (renewable)',
    description: 'Kyrgyzstan launched a dedicated "Digital Nomad" status for IT, creative, and digital professionals, offering a path to low-tax residency in Central Asia.',
    requirements: [
      'IT, digital design, or tech sector professional.',
      'Proof of stable remote income (approx. $5,000 USD/year, ~$417/month).',
      'Clean criminal record and valid passport.',
      'Allows registration as an individual entrepreneur with local bank accounts.'
    ]
  },
];
export async function getVisas(): Promise<DigitalNomadVisa[]> {
  // Sort alphabetically by country
  return visaData.sort((a, b) => a.country.localeCompare(b.country));
}
