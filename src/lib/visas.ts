
import type { DigitalNomadVisa } from '@/types';

export const visaData: DigitalNomadVisa[] = [
    {
        country: 'Albania',
        continent: 'Europe',
        minIncome: 820,
        visaLength: '1 year, renewable up to 5',
        description: 'Known for its affordable cost of living and beautiful Adriatic coast, Albania\'s "Unique Permit" is a very accessible option for remote workers.',
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
        minIncome: 2500,
        visaLength: '180 days, renewable',
        description: 'Argentina\'s visa allows nomads to stay for 180 days, renewable for another 180. It offers access to vibrant culture, especially in Buenos Aires.',
        requirements: [
            'Work remotely for a foreign company.',
            'Demonstrate sufficient funds (approx. $2,500/month).',
            'Valid passport and clean criminal record.',
        ]
    },
    {
        country: 'Armenia',
        continent: 'Asia',
        minIncome: 0,
        visaLength: '1 year, renewable up to 5',
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
        description: 'Aruba\'s "One Happy Workation" program allows a stay of up to 90 days. While not a long-term visa, it\'s an attractive option for short stays.',
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
        visaLength: '1 year, renewable up to 3',
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
        description: 'The "Barbados Welcome Stamp" allows remote workers to live on the island for 12 months, with an option to renew. It\'s one of the most popular Caribbean programs.',
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
        visaLength: '180 days',
        description: 'Belize\'s "Work Where You Vacation" program allows a stay of up to 6 months, aimed at professionals who want to enjoy the country\'s natural beauty.',
        requirements: [
            'Proof of employment with a foreign company.',
            'Annual income of at least $75,000 USD for individuals (~$6,250/month).',
            'Health insurance coverage.'
        ]
    },
    {
        country: 'Bermuda',
        continent: 'North America',
        minIncome: 0,
        visaLength: '1 year, renewable',
        description: 'The "Work From Bermuda" certificate allows remote workers to live in this self-governing British territory for one year. No minimum income is specified, but the cost of living is high.',
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
        minIncome: 2500,
        visaLength: '12 months, renewable',
        description: 'Bulgaria offers a Type D Visa through a freelance permit. It boasts a low cost of living, a growing tech scene in Sofia, and a 10% flat tax rate.',
        requirements: [
            'Obtain a freelance permit from the Employment Agency.',
            'Minimum monthly income of approx. $2,500.',
            'Non-EU/EEA national.',
            'Path to Schengen travel post-2025.'
        ]
    },
    {
        country: 'Cabo Verde',
        continent: 'Africa',
        minIncome: 1630,
        visaLength: '6 months, renewable',
        description: 'The Cabo Verde Remote Working Program allows a stay of six months, renewable for another six. It targets remote workers from Europe, North America, and ECOWAS countries.',
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
        country: 'Cayman Islands',
        continent: 'North America',
        minIncome: 8333,
        visaLength: 'Up to 2 years',
        description: 'The Global Citizen Concierge Program (GCCP) is a premium option, allowing high-earning individuals to work remotely in the Cayman Islands.',
        requirements: [
            'Proof of employment with a foreign entity.',
            'Annual income of at least $100,000 USD (~$8,333/month).',
            'Notarized bank reference and proof of health insurance.',
        ]
    },
    {
        country: 'Colombia',
        continent: 'South America',
        minIncome: 700,
        visaLength: 'Up to 2 years',
        description: 'Colombia offers a very accessible digital nomad visa (V-Nómadas Digitales) with a low income requirement. It\'s valid for up to two years.',
        requirements: [
            'Passport from a visa-exempt country.',
            'Proof of remote work for a foreign company.',
            'Monthly income of at least 3 million COP (approx. $700 USD).',
            'Health insurance with coverage in Colombia.'
        ]
    },
    {
        country: 'Costa Rica',
        continent: 'North America',
        minIncome: 3000,
        visaLength: '1 year, renewable',
        description: 'Costa Rica\'s "Estancia por Teletrabajo" visa is for one year, extendable for a second. Nomads are exempt from income tax and can enjoy the "Pura Vida" lifestyle.',
        requirements: [
            'Proof of remote work for a foreign entity.',
            'Stable monthly income of at least $3,000 USD.',
            'Health insurance covering the duration of the stay.'
        ]
    },
    {
        country: 'Croatia',
        continent: 'Europe',
        minIncome: 2750,
        visaLength: 'Up to 1 year',
        description: 'Croatia offers a temporary residence permit for nomads, allowing a stay of up to a year (cannot be immediately extended). It\'s known for its beautiful coastline.',
        requirements: [
            'Proof of remote work for a foreign company.',
            'Monthly income of at least €2,539.31 (~$2,750 USD).',
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
        minIncome: 5200, // This is a savings requirement
        visaLength: '1 year, renewable',
        description: 'The Czech Republic offers a long-term visa for business (Zivno), popular among freelancers. It requires a trade license and proof of sufficient funds.',
        requirements: [
            'A trade license (Zivnostenske opravneni).',
            'Proof of funds of at least 124,500 CZK (approx. $5,200 USD).',
            'Proof of accommodation and a clean criminal record.',
            'The application process is known to be complex.'
        ]
    },
    {
        country: 'Dominica',
        continent: 'North America',
        minIncome: 4167,
        visaLength: 'Up to 18 months',
        description: 'Dominica\'s "Work in Nature" (WIN) visa allows a stay of up to 18 months, targeting professionals who want to work surrounded by the island\'s lush nature.',
        requirements: [
            'Proof of remote work.',
            'Expected annual income of $50,000 USD (~$4,167/month).',
            'Health insurance.',
        ]
    },
    {
        country: 'Ecuador',
        continent: 'South America',
        minIncome: 1350,
        visaLength: '2 years, renewable',
        description: 'Ecuador offers a professional, technical, or artisanal visa (Rentista) for up to two years. It\'s a great option for those seeking adventure in a biodiverse country.',
        requirements: [
            'Proof of a stable income from foreign sources.',
            'Minimum monthly income of three unified basic salaries (approx. $1,350 USD).',
            'Clean criminal record and health insurance.',
        ]
    },
    {
        country: 'El Salvador',
        continent: 'North America',
        minIncome: 2500,
        visaLength: '1 year, renewable',
        description: 'El Salvador is preparing a digital nomad visa, aiming to attract remote professionals with its surfing beaches and rapidly developing tech scene, famous for its Bitcoin adoption.',
        requirements: [
            'Expected income requirement of $2,500–$3,000/month.',
            'Visa expected to be valid for 12 months and renewable.',
            'Program is not yet launched as of mid-2024.'
        ]
    },
    {
        country: 'Estonia',
        continent: 'Europe',
        minIncome: 4880,
        visaLength: 'Up to 1 year',
        description: 'Estonia was a pioneer, launching one of the first dedicated digital nomad visas. It allows you to work remotely for a company registered abroad for up to one year.',
        requirements: [
            'Proof of remote work contract or business registration.',
            'Gross monthly income of at least €4,500 (~$4,880 USD) for the last 6 months.',
            'Health insurance for Estonia.'
        ]
    },
    {
        country: 'Georgia',
        continent: 'Europe',
        minIncome: 2000,
        visaLength: 'Up to 1 year',
        description: 'Georgia\'s "Remotely from Georgia" program allows citizens of 95 countries to stay and work for at least 180 days and up to a year. It\'s known for its simple application and low cost of living.',
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
        minIncome: 3000,
        visaLength: 'Up to 3 years',
        description: 'Germany\'s Digital Nomad Visa allows freelance remote workers to live in the country for up to 3 years. There is no strict minimum income, but you must prove you can cover living expenses.',
        requirements: [
            'Proof of sufficient funds to cover living costs (approx. €3,000/month recommended).',
            'Portfolio and letters of intent from clients.',
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
        visaLength: '1 year, renewable',
        description: 'Hungary\'s "White Card" is a residence permit for digital nomads. It allows a stay of one year, extendable for one more. It targets high-income remote workers.',
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
        minIncome: 140000,
        description: 'While a dedicated nomad visa is in the works, Bali\'s B211A visa allows for stays up to 180 days. A new "Second Home" visa requires a proof of funds of $140,000.',
        requirements: [
            'The B211A Social/Cultural visa allows a 60-day stay, extendable twice.',
            'For the longer "Second Home" visa, proof of funds of approx. $140,000 USD is required.',
            'Stays over 183 days a year make you a local tax resident.'
        ]
    },
    {
        country: 'Ireland',
        continent: 'Europe',
        minIncome: 4050,
        visaLength: '90 days, extendable',
        description: 'Ireland does not have a dedicated nomad visa. A short-stay visa allows a 90-day stay, which can be extended in special circumstances. You must prove sufficient funds.',
        requirements: [
            'For certain nationalities, a visa is required for entry.',
            'Proof of sufficient funds is required (approx. $4,050/month).',
            'English-speaking environment.',
        ]
    },
    {
        country: 'Italy',
        continent: 'Europe',
        minIncome: 2500,
        visaLength: '1 year, renewable',
        description: 'Launched in 2024, Italy’s Digital Nomad Visa targets "highly skilled" professionals. It grants a one-year renewable permit.',
        requirements: [
            'Must be a "highly skilled worker".',
            'Minimum annual income of approx. €30,000 (~$2,500/month).',
            'Health insurance covering all risks in Italy.',
            'Proof of accommodation.',
        ]
    },
    {
        country: 'Japan',
        continent: 'Asia',
        minIncome: 5250,
        visaLength: 'Up to 6 months',
        description: 'Japan introduced a digital nomad visa in 2024 for citizens of 49 countries that have tax treaties with Japan. It allows a stay of up to six months, but cannot be renewed.',
        requirements: [
            'Citizen of a visa-exempt country with a tax treaty with Japan (e.g., EU, USA, UK).',
            'Annual income of at least ¥10 million (approx. $63,000 USD or ~$5,250/month).',
            'Private health insurance.',
        ]
    },
    {
        country: 'Latvia',
        continent: 'Europe',
        minIncome: 4160,
        visaLength: '1 year, renewable',
        description: 'Latvia\'s digital nomad visa allows remote workers from OECD countries to live in the country for one year, with a possible renewal for a second year.',
        requirements: [
            'Citizen of an OECD country.',
            'Proof of remote work for a foreign employer.',
            'Monthly income of at least 2.5 times the Latvian average wage (approx. €3,843 or ~$4,160 USD).',
            'Valid health insurance.'
        ]
    },
    {
        country: 'Malaysia',
        continent: 'Asia',
        minIncome: 2000,
        visaLength: 'Up to 1 year, renewable',
        description: 'The DE Rantau Nomad Pass aims to establish Malaysia as a leading digital nomad hub. It\'s valid for up to 12 months and can be renewed for another 12 months.',
        requirements: [
            'Proof of remote work (freelancer or remote employee).',
            'Annual income of over $24,000 USD ($2,000/month).',
            'Valid passport and health insurance.',
        ]
    },
    {
        country: 'Malta',
        continent: 'Europe',
        minIncome: 2925,
        visaLength: '1 year, renewable',
        description: 'Malta\'s Nomad Residence Permit is for non-EU nationals and allows a stay of one year. Malta offers an English-speaking environment and sunny Mediterranean climate.',
        requirements: [
            'Proof of remote work for a foreign company.',
            'Gross monthly income of at least €2,700 (~$2,925 USD).',
            'Valid travel document and health insurance.',
            'Rental or purchase agreement for accommodation.'
        ]
    },
    {
        country: 'Mauritius',
        continent: 'Africa',
        minIncome: 1500,
        visaLength: '1 year, renewable',
        description: 'The Mauritius Premium Travel Visa is a one-year renewable visa for remote workers. It offers a tropical lifestyle with no local income tax obligations.',
        requirements: [
            'Proof of remote work and funds from outside Mauritius.',
            'Minimum monthly income of $1,500.',
            'Proof of accommodation and health insurance.',
        ]
    },
    {
        country: 'Mexico',
        continent: 'North America',
        minIncome: 2720,
        visaLength: '1 year, up to 4',
        description: 'Mexico\'s Temporary Resident Visa is very popular with remote workers. It allows stays longer than 180 days and up to four years.',
        requirements: [
            'Proof of economic solvency.',
            'A monthly income of approx. $2,720 USD over the last six months, OR a bank account balance of approx. $45,000 USD.',
            'Must be applied for from a Mexican consulate outside of Mexico.'
        ]
    },
    {
        country: 'Montenegro',
        continent: 'Europe',
        minIncome: 1460,
        visaLength: '2 years, renewable for 2 more',
        description: 'Montenegro has launched its digital nomad program, allowing a stay of up to two years, with a possible extension of another two.',
        requirements: [
            'Proof of remote work for a foreign company.',
            'Monthly income of at least €1,350 (~$1,460 USD).',
            'Proof of accommodation.',
            'Valid travel document and health insurance.'
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
        minIncome: 1340,
        visaLength: '90+ days, renewable',
        description: 'The Netherlands offers a self-employed residence permit, allowing you to live there as a foreign professional. It requires a detailed business plan.',
        requirements: [
            'Must register as an independent worker.',
            'Sufficient funds based on business plan (approx. $1,340/month).',
            'Apply at a Dutch embassy or consulate.'
        ]
    },
    {
        country: 'North Macedonia',
        continent: 'Europe',
        minIncome: 0,
        visaLength: 'Likely 1 year',
        description: 'North Macedonia has been discussing a digital nomad visa since 2021, but a program has not yet been formally implemented.',
        requirements: [
            'Details are yet to be announced (TBA).',
            'Expected to offer low living costs.'
        ]
    },
    {
        country: 'Norway',
        continent: 'Europe',
        minIncome: 3320,
        visaLength: 'Up to 2 years',
        description: 'Norway offers a 2-year visa for independent contractors for Svalbard, an archipelago between mainland Norway and the North Pole, not for the mainland itself.',
        requirements: [
            'Be self-employed with a business registered abroad.',
            'Proof of annual income of at least €37,680 (approx. €3,140 or ~$3,320 USD/month).',
            'Proof of accommodation.',
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
        visaLength: '1 year',
        description: 'Paraguay allows foreign nationals to apply for residency, making it an option for digital nomads. The process involves submitting documents and obtaining a residence permit.',
        requirements: [
            'Proof of economic solvency (no specific amount).',
            'Clean criminal record.',
            'Birth and marriage certificates.'
        ]
    },
    {
        country: 'Peru',
        continent: 'South America',
        minIncome: 1000,
        visaLength: '1 year, renewable',
        description: 'Peru launched a visa with a one-year duration (renewable) for remote workers. It requires a relatively low monthly income.',
        requirements: [
            'Proof of remote work for a company outside Peru.',
            'Minimum monthly income of $1,000 USD.',
            'Health insurance.',
        ]
    },
     {
        country: 'Philippines',
        continent: 'Asia',
        minIncome: 2000,
        visaLength: '1 year, renewable',
        description: 'The Philippines offers a digital nomad visa allowing a stay of up to 12 months, with a possible 12-month extension. Nomads are exempt from local income tax.',
        requirements: [
            'Minimum monthly income of $2,000.',
            'Valid for 1 year, extendable for another year.',
            'Exempt from foreign income tax.'
        ]
    },
    {
        country: 'Poland',
        continent: 'Europe',
        minIncome: 0,
        visaLength: '1 year',
        description: 'Poland doesn\'t have a dedicated nomad visa, but non-EU citizens can apply for a national visa (Type D) based on a work contract with a Polish entity or as a business owner.',
        requirements: [
            'Proof of steady income.',
            'Health insurance.',
            'Proof of accommodation.'
        ]
    },
    {
        country: 'Portugal',
        continent: 'Europe',
        minIncome: 3550,
        visaLength: '1 year, up to 5',
        description: 'Portugal\'s D8 visa is highly popular. It offers a path to residency and access to the Schengen Area. The country boasts a great quality of life and vibrant tech scenes.',
        requirements: [
            'Proof of income from remote work.',
            'Monthly income of at least 4 times the Portuguese minimum wage (approx. €3,280 or ~$3,550 USD).',
            'Proof of accommodation for at least 12 months.',
            'Clean criminal record and private health insurance.'
        ]
    },
    {
        country: 'Puerto Rico',
        continent: 'North America',
        minIncome: 0,
        visaLength: '90 days',
        description: 'As a US territory, Puerto Rico is a popular remote work destination for US citizens. For others, a standard US visa (like ESTA for eligible countries) allows a 90-day stay.',
        requirements: [
            'US Citizens can work freely.',
            'Others require a valid US visa (e.g., ESTA).',
            'Tax incentives under Act 60 are available for residents.'
        ]
    },
    {
        country: 'Romania',
        continent: 'Europe',
        minIncome: 4225,
        visaLength: '1 year, renewable',
        description: 'Romania provides a digital nomad visa with a relatively high income requirement. It allows a one-year stay, which can be extended.',
        requirements: [
            'Proof of remote work for a company registered outside Romania.',
            'Monthly income of at least three times the Romanian average gross salary (approx. €3,900 or ~$4,225 USD).',
            'Proof of accommodation and health insurance.'
        ]
    },
    {
        country: 'Saint Lucia',
        continent: 'North America',
        minIncome: 0,
        visaLength: 'Up to 1 year',
        description: 'The "Live It" program in Saint Lucia offers a multiple-entry visa for up to one year. It is aimed at individuals who want to work remotely while enjoying the island.',
        requirements: [
            'Proof of remote work and sufficient funds for the stay.',
            'No specific minimum income is stated.',
            'Valid passport.',
        ]
    },
    {
        country: 'Serbia',
        continent: 'Europe',
        minIncome: 3500,
        visaLength: '1 year',
        description: 'Serbia offers a temporary residence permit for remote workers. It provides a tax-free period for the first 90 days of the stay.',
        requirements: [
            'Proof of remote work and a monthly income of at least $3,500.',
            'Low cost of living compared to the high income requirement.',
            'The visa program is active.'
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
        minIncome: 2650,
        visaLength: '1 year, up to 3',
        description: 'South Africa has recently introduced a digital nomad visa, allowing a stay of up to one year with the possibility of renewal for up to three years.',
        requirements: [
            'Proof of remote work for a foreign employer.',
            'Annual income of at least R1 million (~$53,000 USD), though a lower amount of ~$2,650/month may be accepted.',
            'Sufficient funds and health insurance.',
        ]
    },
    {
        country: 'South Korea',
        continent: 'Asia',
        minIncome: 5500,
        visaLength: '1 year, renewable',
        description: 'South Korea\'s "workcation" visa allows remote workers to stay in the country for up to two years. It targets high-income professionals wanting to experience Korean culture.',
        requirements: [
            'Proof of remote work for a foreign company for at least 1 year.',
            'Annual income must be at least twice the South Korean GNI per capita (approx. $65,000 USD/year or $5,500/month).',
            'Clean criminal record and private health insurance.'
        ]
    },
    {
        country: 'Spain',
        continent: 'Europe',
        minIncome: 3000,
        visaLength: '1 year, up to 5',
        description: 'Spain\'s digital nomad visa allows non-EU citizens to live and work remotely for up to five years. It offers a favorable tax regime for the first few years under "Beckham\'s Law".',
        requirements: [
            'Proof of being a qualified professional (university degree or 3+ years of experience).',
            'Work contract with a foreign company.',
            'Income of at least 200% of the Spanish minimum wage (approx. €2,780 or ~$3,000 USD/month).',
            'Clean criminal record and comprehensive health insurance.'
        ]
    },
    {
        country: 'Sri Lanka',
        continent: 'Asia',
        minIncome: 0,
        visaLength: '1 year',
        description: 'Sri Lanka has announced plans for a digital nomad visa to promote tourism, but it has not been fully implemented yet. Currently, remote workers can use tourist visas.',
        requirements: [
            'The formal program details are still pending.',
            'A tourist visa (ETA) is available for up to 180 days.',
            'Low cost of living.'
        ]
    },
    {
        country: 'Taiwan',
        continent: 'Asia',
        minIncome: 5700,
        visaLength: '1-3 years, renewable',
        description: 'Taiwan\'s Employment Gold Card is a 4-in-1 visa for highly skilled professionals, widely used by remote workers. It combines a work permit, resident visa, and re-entry permit.',
        requirements: [
            'Must qualify as a highly skilled professional in specific fields.',
            'Minimum monthly income of approx. $5,700 USD.',
            'Exempt from Taiwan income tax on foreign earnings.',
        ]
    },
    {
        country: 'Thailand',
        continent: 'Asia',
        minIncome: 6667,
        visaLength: 'Up to 10 years',
        description: 'Thailand\'s Long-Term Resident (LTR) visa is a highly selective scheme for high-income professionals. It offers a 10-year stay and significant tax advantages.',
        requirements: [
            'Proof of remote work for a foreign company.',
            'Personal income of at least $80,000/year for the past two years.',
            'The employer company must have at least $150M revenue over the last 3 years.',
            'Health insurance with at least $50,000 coverage.'
        ]
    },
    {
        country: 'Turkey',
        continent: 'Asia',
        minIncome: 3000,
        visaLength: '1 year, renewable',
        description: 'Turkey introduced its Digital Nomad Visa in 2024 for remote workers from 36 eligible countries. It offers a low cost of living and is tax-free for stays under 183 days.',
        requirements: [
            'Citizen of an eligible country (US, Canada, UK, EU, etc.).',
            'Age 21-55.',
            'Minimum monthly income of $3,000 USD.',
            'University degree.'
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
        description: 'Uruguay offers a permit for digital nomads for six months, renewable. It\'s notable for not having a specific income requirement, though applicants must prove they can support themselves.',
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
            'Low cost of living and vibrant nomad community.'
        ]
    },
];
export async function getVisas(): Promise<DigitalNomadVisa[]> {
    // Sort alphabetically by country
    return visaData.sort((a, b) => a.country.localeCompare(b.country));
}
