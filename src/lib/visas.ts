
import type { DigitalNomadVisa } from '@/types';

export const visaData: DigitalNomadVisa[] = [
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
    {
        country: 'Japan',
        continent: 'Asia',
        minIncome: 6300,
        description: 'Japan recently introduced a digital nomad visa for citizens of 49 countries that have tax treaties with Japan. It allows a stay of up to six months, but cannot be extended.',
        requirements: [
            'Citizen of a visa-exempt country with a tax treaty with Japan (e.g., EU, USA, UK, Australia).',
            'Annual income of at least ¥10 million (approx. $63,000 USD).',
            'Private health insurance.',
        ],
        link: 'https://www.mofa.go.jp/ca/fna/page22e_001028.html'
    },
    {
        country: 'South Korea',
        continent: 'Asia',
        minIncome: 6500,
        description: 'South Korea\'s "workcation" visa allows remote workers to stay in the country for up to two years, combining work and travel. It targets high-income professionals wanting to experience Korean culture.',
        requirements: [
            'Proof of remote work for a foreign company for at least 1 year.',
            'Annual income must be at least twice the South Korean GNI per capita (approx. $65,000 USD/year).',
            'Clean criminal record.',
            'Private health insurance with at least 100 million won coverage.'
        ],
        link: 'https://overseas.mofa.go.kr/sg-en/brd/m_2435/view.do?seq=761458'
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
];

export async function getVisas(): Promise<DigitalNomadVisa[]> {
    // Sort alphabetically by country
    return visaData.sort((a, b) => a.country.localeCompare(b.country));
}
