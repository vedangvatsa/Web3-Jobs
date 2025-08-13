
import type { DigitalNomadVisa } from '@/types';

export const visaData: DigitalNomadVisa[] = [
    {
        country: 'Albania',
        continent: 'Europe',
        minIncome: 9800, // Annual
        description: 'Albania\'s "Unique Permit" is available for digital nomads, offering a one-year stay that can be renewed. The country is known for its affordable cost of living and beautiful scenery.',
        requirements: [
            'Proof of remote work for a foreign company or as a freelancer.',
            'Annual income of at least 1,200,000 ALL (approx. $9,800 USD).',
            'Proof of accommodation in Albania.',
            'Health insurance for Albania.',
            'Clean criminal record.'
        ],
        link: 'https://e-albania.al/eAlbaniaServices/UseService.aspx?service_code=15433'
    },
    {
        country: 'Andorra',
        continent: 'Europe',
        minIncome: 3850,
        description: 'Andorra offers a visa for "self-employed" individuals, which suits digital nomads. It provides a path to residency in this small country nestled in the Pyrenees, known for its low taxes and outdoor activities.',
        requirements: [
            'Must register a company in Andorra and hold at least 10% of it.',
            'Serve as a director in your own company.',
            'Show proof of sufficient funds (over 300% of the Andorran minimum wage).',
            'Deposit €50,000 with the Andorran National Institute of Finance (INAF).',
            'Must reside in Andorra for at least 90 days per year.'
        ],
        link: 'https://www.immigracio.ad/en/residencia-i-treball-per-compte-propi'
    },
    {
        country: 'Argentina',
        continent: 'South America',
        minIncome: 2500,
        description: 'Argentina launched a visa specifically for digital nomads, allowing them to stay for 180 days, with the option to renew for another 180 days. It offers access to the vibrant culture of cities like Buenos Aires.',
        requirements: [
            'Work remotely for a foreign company or clients.',
            'Provide a CV, proof of work, and demonstrate sufficient funds.',
            'Income details are reviewed on a case-by-case basis, generally around $2,500/month.',
            'Valid passport and clean criminal record.'
        ],
        link: 'https://www.migraciones.gob.ar/accesible/index.dnm'
    },
    {
        country: 'Armenia',
        continent: 'Asia',
        minIncome: 0,
        description: 'Armenia offers a very accessible path for remote workers by allowing them to register as sole proprietors. The country has a simple, low-tax system and a growing tech community.',
        requirements: [
            'No specific visa, but easy to obtain a residency permit by registering as a self-employed person.',
            'No minimum income requirement to register as a sole proprietor.',
            'Open a local bank account.',
            'Provide an address in Armenia.'
        ],
        link: 'https://workfromarmenia.com/'
    },
    {
        country: 'Brazil',
        continent: 'South America',
        minIncome: 1500,
        description: 'Brazil\'s digital nomad visa allows for an initial stay of one year, renewable for another year. The income requirement is one of the most reasonable among major economies.',
        requirements: [
            'Proof of remote work status (contract or freelance statement).',
            'Monthly income of at least $1,500 USD from foreign sources, OR a bank balance of at least $18,000.',
            'Clean criminal record.',
            'Health insurance valid in Brazil.'
        ],
        link: 'https://www.gov.br/mre/pt-br/consulado-atlanta/consular-services/visas/temporary-visas/digital-nomad-visa-vitem-xiv'
    },
    {
        country: 'Colombia',
        continent: 'South America',
        minIncome: 700,
        description: 'Colombia offers a very accessible digital nomad visa (V-Nómadas Digitales) with a low income requirement. It\'s valid for up to two years and allows you to enjoy the country\'s rich culture and biodiversity.',
        requirements: [
            'Passport from a visa-exempt country.',
            'Proof of remote work for a foreign company or as a freelancer.',
            'Monthly income of at least 3 million Colombian Pesos (approx. $700 USD).',
            'Health insurance with coverage in Colombia.'
        ],
        link: 'https://www.cancilleria.gov.co/en/procedures_services/visa/v-nomadas-digitales'
    },
    {
        country: 'Costa Rica',
        continent: 'North America',
        minIncome: 3000,
        description: 'Known for its "Pura Vida" lifestyle, Costa Rica offers a digital nomad visa ("Estancia por Teletrabajo") for one year, extendable for a second. Nomads are exempt from income tax and import taxes for personal equipment.',
        requirements: [
            'Proof of remote work for a foreign entity.',
            'Stable monthly income of at least $3,000 USD (or $4,000 for a family).',
            'Health insurance covering the duration of the stay.'
        ],
        link: 'https://www.visitcostarica.com/en/costa-rica/planning-your-trip/entry-requirements'
    },
    {
        country: 'Croatia',
        continent: 'Europe',
        minIncome: 2539,
        description: 'Croatia offers a temporary residence permit for digital nomads, allowing them to stay for up to a year (cannot be extended immediately). It\'s known for its beautiful coastline, safety, and affordable living.',
        requirements: [
            'Proof of remote work for a foreign company.',
            'Monthly income of at least €2,539.31 or a lump sum of €30,471.72.',
            'Proof of accommodation in Croatia (e.g., rental agreement).',
            'Health insurance valid in Croatia.',
            'Clean criminal record check from home country.'
        ],
        link: 'https://mup.gov.hr/aliens-281621/stay-and-work/temporary-stay-of-digital-nomads/286833'
    },
     {
        country: 'Cyprus',
        continent: 'Europe',
        minIncome: 3500,
        description: 'Cyprus attracts digital nomads with its sunny weather, low cost of living, and strategic location. The permit is for one year, renewable for two more.',
        requirements: [
            'Proof of remote work for clients or an employer outside Cyprus.',
            'Net monthly income of at least €3,500.',
            'Proof of accommodation.',
            'Health insurance.',
            'Clean criminal record.'
        ],
        link: 'https://moi.gov.cy/moi/crmd/crmd.nsf/All/003853142B284458C225877E003881A2'
    },
    {
        country: 'Czech Republic',
        continent: 'Europe',
        minIncome: 2300,
        description: 'The Czech Republic offers a long-term visa for the purpose of business (Zivno), which is popular among freelancers and digital nomads. Prague is a major hub for remote workers.',
        requirements: [
            'A trade license (Zivnostenske opravneni).',
            'Proof of funds of at least 124,500 CZK (approx. $5,400 USD).',
            'Proof of accommodation.',
            'Clean criminal record.',
            'It is a complex process often requiring a visa agency.'
        ],
        link: 'https://www.mvcr.cz/mvcren/article/a-visa-for-a-stay-of-over-90-days-long-term.aspx'
    },
    {
        country: 'Estonia',
        continent: 'Europe',
        minIncome: 4500,
        description: 'Estonia was a pioneer, launching one of the first dedicated digital nomad visas. It allows you to work remotely for a company registered abroad or as a freelancer for clients mostly outside of Estonia for up to one year.',
        requirements: [
            'Proof of remote work (contract or business registration).',
            'Gross monthly income of at least €4,500 for the last 6 months.',
            'Valid travel document.',
            'Health insurance for Estonia.'
        ],
        link: 'https://www.e-resident.gov.ee/nomad-visa/'
    },
    {
        country: 'Georgia',
        continent: 'Europe',
        minIncome: 2000,
        description: 'Georgia\'s "Remotely from Georgia" program allows citizens of 95 countries to stay and work for at least 180 days and up to a year. It\'s known for its simple application and low cost of living.',
        requirements: [
            'Citizen of one of the 95 eligible countries.',
            'Proof of remote work.',
            'Monthly income of at least $2,000 USD.',
            'Travel health insurance for the entire stay.'
        ],
        link: 'https://georgia.com/remotely-from-georgia/'
    },
    {
        country: 'Germany',
        continent: 'Europe',
        minIncome: 0,
        description: 'Germany\'s Digital Nomad Visa allows freelance remote workers and self-employed individuals to live in the country for up to 3 years. There is no strict minimum income, but you must prove you can cover your living expenses.',
        requirements: [
            'Proof of sufficient funds to cover living costs.',
            'Portfolio and letters of intent from clients (especially German clients).',
            'German health insurance.',
            'Proof of accommodation (Anmeldung) in Germany.'
        ],
        link: 'https://www.make-it-in-germany.com/en/visa-residence/types/digital-nomad-visa'
    },
    {
        country: 'Greece',
        continent: 'Europe',
        minIncome: 3500,
        description: 'Greece\'s digital nomad visa offers a two-year stay with a potential for extension. It provides access to a beautiful Mediterranean lifestyle and a relatively low cost of living.',
        requirements: [
            'Work remotely for a foreign employer or your own foreign-registered company.',
            'Net monthly income of €3,500 (increases for spouse/children).',
            'Proof of sufficient funds.',
            'Clean criminal record.',
            'Health insurance.'
        ],
        link: 'https://workfromgreece.gr/'
    },
    {
        country: 'Hungary',
        continent: 'Europe',
        minIncome: 3000,
        description: 'Hungary\'s "White Card" is a residence permit for digital nomads from third countries. It allows a stay of one year, extendable for one more.',
        requirements: [
            'Proof of remote work contract outside of Hungary.',
            'Monthly income of at least €3,000 for the last 6 months.',
            'Cannot have shares in a Hungarian company.',
            'Proof of accommodation.'
        ],
        link: 'http://www.bmbah.hu/index.php?option=com_k2&view=item&id=1716:digital-nomad&lang=en'
    },
    {
        country: 'Iceland',
        continent: 'Europe',
        minIncome: 7000,
        description: 'Iceland offers a long-term visa for remote workers with a very high income requirement. It\'s designed for high-earning professionals looking to experience Iceland\'s unique nature.',
        requirements: [
            'Must not be an EU/EEA/EFTA citizen.',
            'Proof of remote work for a foreign company.',
            'Monthly income of 1,000,000 ISK (approx. $7,000 USD) for a single applicant.',
            'Health insurance valid in Iceland.'
        ],
        link: 'https://island.is/en/get-a-visa-for-remote-workers'
    },
    {
        country: 'Italy',
        continent: 'Europe',
        minIncome: 28000, // Annual
        description: 'Italy finally launched its digital nomad visa in 2024. It targets "highly skilled" workers and offers a one-year permit, which can be renewed.',
        requirements: [
            'Must be a "highly skilled worker".',
            'Minimum annual income from lawful sources of approx. €28,000.',
            'Health insurance covering all risks in Italy.',
            'Proof of accommodation.',
            'Higher education diploma or proof of 5 years of professional experience.'
        ],
        link: 'https://www.italia.it/en/useful-info/the-digital-nomad-visa-for-italy'
    },
    {
        country: 'Japan',
        continent: 'Asia',
        minIncome: 63000, // Annual
        description: 'Japan recently introduced a digital nomad visa for citizens of 49 countries that have tax treaties with Japan. It allows a stay of up to six months, but cannot be extended.',
        requirements: [
            'Citizen of a visa-exempt country with a tax treaty with Japan (e.g., EU, USA, UK, Australia).',
            'Annual income of at least ¥10 million (approx. $63,000 USD).',
            'Private health insurance.',
        ],
        link: 'https://www.mofa.go.jp/ca/fna/page22e_001028.html'
    },
    {
        country: 'Latvia',
        continent: 'Europe',
        minIncome: 3200,
        description: 'Latvia\'s digital nomad visa allows remote workers to live in the country for one year, with a possible renewal for a second year. It\'s one of the newer European options.',
        requirements: [
            'Citizen of an OECD country.',
            'Proof of remote work for a foreign employer or as a self-employed person registered in an OECD country.',
            'Monthly income of at least 2.5 times the Latvian average wage (approx. €3,200).',
            'Valid health insurance.'
        ],
        link: 'https://www.pmlp.gov.lv/en/latvia-digital-nomad-visa'
    },
    {
        country: 'Malaysia',
        continent: 'Asia',
        minIncome: 2000,
        description: 'The DE Rantau Nomad Pass aims to establish Malaysia as a leading digital nomad hub. It\'s valid for up to 12 months and can be renewed for another 12 months.',
        requirements: [
            'Proof of remote work (freelancer, independent contractor, or remote employee).',
            'Annual income of over $24,000 USD.',
            'Valid passport and health insurance.',
        ],
        link: 'https://mdec.my/derantau/foreign'
    },
    {
        country: 'Malta',
        continent: 'Europe',
        minIncome: 2700,
        description: 'Malta\'s Nomad Residence Permit is for non-EU nationals and allows a stay of one year, which can be renewed. Malta offers an English-speaking environment and a sunny Mediterranean climate.',
        requirements: [
            'Proof of remote work for a foreign company or as a partner/shareholder of a foreign company.',
            'Gross monthly income of at least €2,700.',
            'Valid travel document and health insurance.',
            'Rental or purchase agreement for accommodation.'
        ],
        link: 'https://nomad.residencymalta.gov.mt/'
    },
    {
        country: 'Mexico',
        continent: 'North America',
        minIncome: 4300,
        description: 'While not a specific "digital nomad visa," Mexico offers a Temporary Resident Visa that is very popular with remote workers. It allows stays longer than 180 days and up to four years.',
        requirements: [
            'Proof of economic solvency.',
            'A monthly income of approx. $4,300 USD over the last six months, OR a bank account balance of approx. $72,000 USD over the last year.',
            'Must be applied for from a Mexican consulate outside of Mexico.'
        ],
        link: 'https://consulmex.sre.gob.mx/toronto/index.php/en/services/visas/temporary-resident-visa'
    },
    {
        country: 'Montenegro',
        continent: 'Europe',
        minIncome: 1350,
        description: 'Montenegro has launched its digital nomad program, allowing a stay of up to two years, with a possible extension of another two. After four years, nomads can apply for temporary residency.',
        requirements: [
            'Proof of remote work for a foreign company or as an entrepreneur.',
            'Monthly income of at least €1,350.',
            'Proof of accommodation.',
            'Valid travel document and health insurance.'
        ],
        link: 'https://www.gov.me/en/article/programme-attracting-digital-nomads-in-montenegro-adopted'
    },
     {
        country: 'Norway',
        continent: 'Europe',
        minIncome: 3000,
        description: 'Norway offers a 2-year visa for self-employed individuals with a contract to do a project for a Norwegian business, or for those running their own business outside of Norway.',
        requirements: [
            'Be self-employed with a business registered abroad.',
            'Proof of annual income of at least €35,719 (approx. $3,000/month).',
            'Proof of accommodation in Norway.',
            'Relevant qualifications for your profession.'
        ],
        link: 'https://www.udi.no/en/want-to-apply/work-immigration/skilled-workers/skilled-worker-who-wishes-to-be-self-employed-with-own-business-or-a-sole-proprietorship/'
    },
    {
        country: 'Portugal',
        continent: 'Europe',
        minIncome: 3280,
        description: 'Portugal\'s D8 visa is highly popular. It offers a path to residency and access to the Schengen Area. The country boasts a low cost of living, great weather, and a vibrant tech scene, especially in Lisbon and Madeira.',
        requirements: [
            'Proof of income from remote work (contracts, statements).',
            'Monthly income of at least 4 times the Portuguese minimum wage (approx. €3,280).',
            'Proof of accommodation for at least 12 months.',
            'Clean criminal record.',
            'Private health insurance valid in the Schengen area.'
        ],
        link: 'https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa'
    },
    {
        country: 'Romania',
        continent: 'Europe',
        minIncome: 3950,
        description: 'Romania provides a digital nomad visa with a relatively high income requirement. It allows a one-year stay, which can be extended.',
        requirements: [
            'Proof of remote work for a company registered outside Romania for at least 3 years.',
            'Monthly income of at least three times the Romanian average gross salary (approx. €3,950).',
            'Proof of accommodation and health insurance.'
        ],
        link: 'https://evisa.mae.ro/VisaDetails'
    },
    {
        country: 'South Korea',
        continent: 'Asia',
        minIncome: 5500, // Monthly
        description: 'South Korea\'s "workcation" visa allows remote workers to stay in the country for up to two years, combining work and travel. It targets high-income professionals wanting to experience Korean culture.',
        requirements: [
            'Proof of remote work for a foreign company for at least 1 year.',
            'Annual income must be at least twice the South Korean GNI per capita (approx. $65,000 USD/year or $5,500/month).',
            'Clean criminal record.',
            'Private health insurance with at least 100 million won coverage.'
        ],
        link: 'https://overseas.mofa.go.kr/sg-en/brd/m_2435/view.do?seq=761458'
    },
    {
        country: 'Spain',
        continent: 'Europe',
        minIncome: 2600,
        description: 'Spain\'s digital nomad visa allows non-EU citizens to live and work remotely in the country for up to five years. It offers a favorable tax regime for the first few years under "Beckham\'s Law".',
        requirements: [
            'Proof of being a qualified professional (university degree or 3+ years of experience).',
            'Work contract with a foreign company for at least 3 months.',
            'Income of at least 200% of the Spanish minimum wage (approx. €2,600/month).',
            'Clean criminal record for the past 5 years.',
            'Comprehensive public or private health insurance.'
        ],
        link: 'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Visado-de-Teletrabajo-de-caracter-internacional.aspx'
    },
    {
        country: 'UAE (Dubai)',
        continent: 'Asia',
        minIncome: 3500,
        description: 'Dubai\'s virtual work program allows professionals to live in the emirate while working for companies overseas. It offers a tax-free environment, excellent infrastructure, and a high-tech lifestyle.',
        requirements: [
            'Passport with a minimum of 6 months validity.',
            'Proof of employment with a contract valid for one year.',
            'Monthly salary of at least $3,500 USD (or equivalent).',
            'Last month\'s payslip and 3 months of bank statements.',
            'Health insurance with UAE coverage.'
        ],
        link: 'https://www.visitdubai.com/en/invest-in-dubai/live-and-work/visas-and-entry/work-remotely-from-dubai'
    },
];

export async function getVisas(): Promise<DigitalNomadVisa[]> {
    // Sort alphabetically by country
    return visaData.sort((a, b) => a.country.localeCompare(b.country));
}
