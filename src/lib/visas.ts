
import type { DigitalNomadVisa } from '@/types';

export const visaData: DigitalNomadVisa[] = [
    {
        country: 'Albania',
        continent: 'Europe',
        minIncome: 820,
        description: 'Albania\'s "Unique Permit" is available for digital nomads, offering a one-year stay that can be renewed. The country is known for its affordable cost of living and beautiful scenery.',
        requirements: [
            'Proof of remote work for a foreign company or as a freelancer.',
            'Annual income of at least $10,000 USD (approx. $820/month).',
            'Proof of accommodation in Albania.',
            'Health insurance for Albania.',
            'Clean criminal record.'
        ],
        link: 'https://e-albania.al/eAlbaniaServices/UseService.aspx?service_code=15433'
    },
    {
        country: 'Argentina',
        continent: 'South America',
        minIncome: 2500,
        description: 'Argentina launched a visa specifically for digital nomads, allowing them to stay for 180 days, with the option to renew for another 180 days. It offers access to the vibrant culture of cities like Buenos Aires.',
        requirements: [
            'Work remotely for a foreign company or clients.',
            'Provide a CV, proof of work, and demonstrate sufficient funds (approx. $2,500/month).',
            'Valid passport and clean criminal record.'
        ],
        link: 'https://www.cancilleria.gob.ar/en/services/visa/digital-nomad-visa'
    },
    {
        country: 'Armenia',
        continent: 'Asia',
        minIncome: 0,
        description: 'Armenia offers a very accessible path for remote workers by allowing them to register as sole proprietors. The country has a simple, low-tax system and a growing tech community. No explicit minimum income is stated.',
        requirements: [
            'Obtain a residency permit by registering as a self-employed person.',
            'No minimum income requirement to register as a sole proprietor.',
            'Open a local bank account.',
            'Provide an address in Armenia.'
        ],
        link: 'https://www.investinarmenia.am/en/business-residency-programs'
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
        description: 'Known for its "Pura Vida" lifestyle, Costa Rica offers a digital nomad visa ("Estancia por Teletrabajo") for one year, extendable for a second. Nomads are exempt from income tax.',
        requirements: [
            'Proof of remote work for a foreign entity.',
            'Stable monthly income of at least $3,000 USD (or $4,000 for a family).',
            'Health insurance covering the duration of the stay.'
        ],
        link: 'https://www.migracion.go.cr/Paginas/Teletrabajo.aspx'
    },
    {
        country: 'Croatia',
        continent: 'Europe',
        minIncome: 2539,
        description: 'Croatia offers a temporary residence permit for digital nomads, allowing them to stay for up to a year (cannot be extended immediately). It\'s known for its beautiful coastline and affordable living.',
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
        description: 'Cyprus attracts digital nomads with its sunny weather and strategic location. The permit is for one year, renewable for two more. You are not subject to local income tax.',
        requirements: [
            'Proof of remote work for clients or an employer outside Cyprus.',
            'Net monthly income of at least €3,500 (after taxes).',
            'Proof of accommodation.',
            'Health insurance.',
            'Clean criminal record.'
        ],
        link: 'https://moi.gov.cy/en/frequently-asked-questions-for-digital-nomad-visa'
    },
    {
        country: 'Czech Republic',
        continent: 'Europe',
        minIncome: 5200, // This is a savings requirement, not monthly income.
        description: 'The Czech Republic offers a long-term visa for business (Zivno), popular among freelancers. It requires a trade license and proof of sufficient funds, rather than a monthly income.',
        requirements: [
            'A trade license (Zivnostenske opravneni).',
            'Proof of funds of at least 124,500 CZK (approx. $5,200 USD).',
            'Proof of accommodation.',
            'Clean criminal record.',
            'The application process is complex and often requires an agency.'
        ],
        link: 'https://www.mzv.cz/jnp/en/information_for_aliens/long_stay_visa/business_purpose.html'
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
        link: 'https://www.politsei.ee/en/instructions/digital-nomad'
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
        link: 'https://immigration.gov.ge/en/page/remotelyfromgeorgia'
    },
    {
        country: 'Germany',
        continent: 'Europe',
        minIncome: 3000, // No official amount, but this is a common guideline.
        description: 'Germany\'s Digital Nomad Visa allows freelance remote workers and self-employed individuals to live in the country for up to 3 years. There is no strict minimum income, but you must prove you can cover your living expenses.',
        requirements: [
            'Proof of sufficient funds to cover living costs (approx. €3,000/month recommended).',
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
        description: 'Greece\'s digital nomad visa offers a two-year stay with a potential for extension and a 50% tax break for up to 7 years. It provides access to a beautiful Mediterranean lifestyle.',
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
        minIncome: 2110,
        description: 'Hungary\'s "White Card" is a residence permit for digital nomads from third countries. It allows a stay of one year, extendable for one more. The program is primarily aimed at single applicants under 40.',
        requirements: [
            'Proof of remote work contract outside of Hungary.',
            'Monthly income of at least €2,110 for the last 6 months.',
            'Cannot have shares in a Hungarian company.',
            'Proof of accommodation.'
        ],
        link: 'http://www.bmbah.hu/index.php?option=com_k2&view=item&id=1716:digital-nomad&lang=en'
    },
    {
        country: 'Iceland',
        continent: 'Europe',
        minIncome: 7763,
        description: 'Iceland offers a long-term visa for remote workers with a very high income requirement. It\'s designed for high-earning professionals looking to experience Iceland\'s unique nature for up to 6 months.',
        requirements: [
            'Must not be an EU/EEA/EFTA citizen.',
            'Proof of remote work for a foreign company.',
            'Monthly income of 1,000,000 ISK (approx. $7,763 USD) for a single applicant.',
            'Health insurance valid in Iceland.'
        ],
        link: 'https://island.is/en/get-a-visa-for-remote-workers'
    },
    {
        country: 'Italy',
        continent: 'Europe',
        minIncome: 2500,
        description: 'Italy launched its digital nomad visa in 2024. It targets "highly skilled" workers and offers a one-year permit, which can be renewed. The annual income requirement is around €30,000.',
        requirements: [
            'Must be a "highly skilled worker".',
            'Minimum annual income of approx. €30,000 (approx. €2,500/month).',
            'Health insurance covering all risks in Italy.',
            'Proof of accommodation.',
            'Higher education diploma or proof of 5 years of professional experience.'
        ],
        link: 'https://www.poliziadistato.it/articolo/visto-per-nomadi-digitali-e-lavoratori-da-remoto-altamente-qualificati-articolo-27-del-d-lgs-286-98-come-modificato-dalla-legge-n-25-2024'
    },
    {
        country: 'Japan',
        continent: 'Asia',
        minIncome: 5250, // Approx.
        description: 'Japan introduced a digital nomad visa in 2024 for citizens of 49 countries that have tax treaties with Japan. It allows a stay of up to six months, but cannot be extended.',
        requirements: [
            'Citizen of a visa-exempt country with a tax treaty with Japan (e.g., EU, USA, UK, Australia).',
            'Annual income of at least ¥10 million (approx. $63,000 USD or $5,250/month).',
            'Private health insurance.',
        ],
        link: 'https://www.mofa.go.jp/ca/fna/page22e_001028.html'
    },
    {
        country: 'Latvia',
        continent: 'Europe',
        minIncome: 3843,
        description: 'Latvia\'s digital nomad visa allows remote workers from OECD countries to live in the country for one year, with a possible renewal for a second year.',
        requirements: [
            'Citizen of an OECD country.',
            'Proof of remote work for a foreign employer or as a self-employed person registered in an OECD country.',
            'Monthly income of at least 2.5 times the Latvian average wage (approx. €3,843).',
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
            'Annual income of over $24,000 USD (approx. $2,000/month).',
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
        minIncome: 2762,
        description: 'While not a specific "digital nomad visa," Mexico offers a Temporary Resident Visa that is very popular with remote workers. It allows stays longer than 180 days and up to four years.',
        requirements: [
            'Proof of economic solvency.',
            'A monthly income of approx. $2,762 USD over the last six months, OR a bank account balance of approx. $46,000 USD over the last year.',
            'Must be applied for from a Mexican consulate outside of Mexico.'
        ],
        link: 'https://consulmex.sre.gob.mx/toronto/index.php/en/services/visas/temporary-resident-visa'
    },
    {
        country: 'Montenegro',
        continent: 'Europe',
        minIncome: 1450,
        description: 'Montenegro has launched its digital nomad program, allowing a stay of up to two years, with a possible extension of another two. After four years, nomads can apply for temporary residency.',
        requirements: [
            'Proof of remote work for a foreign company or as an entrepreneur.',
            'Monthly income of at least €1,450.',
            'Proof of accommodation.',
            'Valid travel document and health insurance.'
        ],
        link: 'https://www.invest.gov.me/en/news/live-and-work-in-montenegro-digital-nomad-visa-now-available/'
    },
     {
        country: 'Norway',
        continent: 'Europe',
        minIncome: 3150,
        description: 'Norway offers a 2-year visa for independent contractors. It is valid for Svalbard, an archipelago between mainland Norway and the North Pole, not the mainland.',
        requirements: [
            'Be self-employed with a business registered abroad.',
            'Proof of annual income of at least €37,680 (approx. €3,150/month).',
            'Proof of accommodation.',
            'Relevant qualifications for your profession.'
        ],
        link: 'https://www.udi.no/en/want-to-apply/work-immigration/skilled-workers/skilled-worker-who-wishes-to-be-self-employed-with-own-business-or-a-sole-proprietorship/'
    },
    {
        country: 'Portugal',
        continent: 'Europe',
        minIncome: 3280,
        description: 'Portugal\'s D8 visa is highly popular. It offers a path to residency and access to the Schengen Area. The country boasts a low cost of living, great weather, and a vibrant tech scene.',
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
        minIncome: 3900,
        description: 'Romania provides a digital nomad visa with a relatively high income requirement. It allows a one-year stay, which can be extended.',
        requirements: [
            'Proof of remote work for a company registered outside Romania for at least 3 years.',
            'Monthly income of at least three times the Romanian average gross salary (approx. €3,900).',
            'Proof of accommodation and health insurance.'
        ],
        link: 'https://evisa.mae.ro/VisaDetails'
    },
    {
        country: 'South Korea',
        continent: 'Asia',
        minIncome: 5500,
        description: 'South Korea\'s "workcation" visa allows remote workers to stay in the country for up to two years. It targets high-income professionals wanting to experience Korean culture.',
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
        minIncome: 2762,
        description: 'Spain\'s digital nomad visa allows non-EU citizens to live and work remotely in the country for up to five years. It offers a favorable tax regime for the first few years under "Beckham\'s Law".',
        requirements: [
            'Proof of being a qualified professional (university degree or 3+ years of experience).',
            'Work contract with a foreign company for at least 3 months.',
            'Income of at least 200% of the Spanish minimum wage (approx. €2,762/month).',
            'Clean criminal record for the past 5 years.',
            'Comprehensive public or private health insurance.'
        ],
        link: 'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Visado-de-Teletrabajo-de-caracter-internacional.aspx'
    },
    {
        country: 'UAE (Dubai)',
        continent: 'Asia',
        minIncome: 3500,
        description: 'Dubai\'s virtual work program allows professionals to live in the emirate while working for companies overseas. It offers a tax-free environment and a high-tech lifestyle.',
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
 