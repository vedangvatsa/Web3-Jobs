import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const REPO = '/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs';
const CONTENT_DIR = path.join(REPO, 'content');
const OUT_FILE = path.join(CONTENT_DIR, 'cbdc-catalog.json');

// Country normalization map to match existing citizenship and nomad records
const COUNTRY_MAP: Record<string, { code: string; normalizedName: string }> = {
  'United Arab Emirates': { code: 'AE', normalizedName: 'United Arab Emirates' },
  'United States': { code: 'US', normalizedName: 'United States' },
  'United Kingdom': { code: 'GB', normalizedName: 'United Kingdom' },
  'European Union': { code: 'EU', normalizedName: 'European Union' },
  'China': { code: 'CN', normalizedName: 'China' },
  'India': { code: 'IN', normalizedName: 'India' },
  'Singapore': { code: 'SG', normalizedName: 'Singapore' },
  'Switzerland': { code: 'CH', normalizedName: 'Switzerland' },
  'Hong Kong': { code: 'HK', normalizedName: 'Hong Kong' },
  'Japan': { code: 'JP', normalizedName: 'Japan' },
  'South Korea': { code: 'KR', normalizedName: 'South Korea' },
  'Bahamas': { code: 'BS', normalizedName: 'Bahamas' },
  'Nigeria': { code: 'NG', normalizedName: 'Nigeria' },
  'Jamaica': { code: 'JM', normalizedName: 'Jamaica' },
  'Brazil': { code: 'BR', normalizedName: 'Brazil' },
  'Canada': { code: 'CA', normalizedName: 'Canada' },
  'Australia': { code: 'AU', normalizedName: 'Australia' },
  'Sweden': { code: 'SE', normalizedName: 'Sweden' },
  'Russia': { code: 'RU', normalizedName: 'Russia' },
  'Ghana': { code: 'GH', normalizedName: 'Ghana' },
  'South Africa': { code: 'ZA', normalizedName: 'South Africa' },
  'Thailand': { code: 'TH', normalizedName: 'Thailand' },
  'Malaysia': { code: 'MY', normalizedName: 'Malaysia' },
  'Indonesia': { code: 'ID', normalizedName: 'Indonesia' },
  'Philippines': { code: 'PH', normalizedName: 'Philippines' },
  'Saudi Arabia': { code: 'SA', normalizedName: 'Saudi Arabia' },
  'Israel': { code: 'IL', normalizedName: 'Israel' },
  'Turkey': { code: 'TR', normalizedName: 'Turkey' },
  'Kazakhstan': { code: 'KZ', normalizedName: 'Kazakhstan' },
  'Georgia': { code: 'GE', normalizedName: 'Georgia' },
  'Mexico': { code: 'MX', normalizedName: 'Mexico' },
  'France': { code: 'FR', normalizedName: 'France' },
  'Germany': { code: 'DE', normalizedName: 'Germany' },
  'Italy': { code: 'IT', normalizedName: 'Italy' },
  'Spain': { code: 'ES', normalizedName: 'Spain' },
  'Dominica': { code: 'DM', normalizedName: 'Dominica' },
  'Cambodia': { code: 'KH', normalizedName: 'Cambodia' },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fetchCbdcs(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const req = https.get('https://cbdctracker.org/api/currencies', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  console.log('Fetching live currencies from cbdctracker.org/api/currencies...');
  const rawCurrencies = await fetchCbdcs();
  console.log(`Fetched ${rawCurrencies.length} currencies from cbdctracker.org`);

  const seenSlugs = new Set<string>();

  const catalog = rawCurrencies.map((item) => {
    const rawCountry = (item.country || (item.countries && item.countries[0]?.name) || 'Global').trim();
    const mapped = COUNTRY_MAP[rawCountry];
    const countryName = mapped?.normalizedName || rawCountry;
    const countryCode = mapped?.code || '';

    const currencyName = (item.digitalCurrency || 'Digital Currency').trim();
    let baseSlug = item.tag ? slugify(item.tag) : slugify(`${countryName}-${currencyName}`);
    if (!baseSlug) baseSlug = slugify(item.uid || 'cbdc');

    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    seenSlugs.add(slug);

    let year = '';
    if (item.announcementYear) {
      if (typeof item.announcementYear === 'number') {
        if (item.announcementYear > 1000000000) {
          year = new Date(item.announcementYear).getFullYear().toString();
        } else {
          year = item.announcementYear.toString();
        }
      } else {
        year = item.announcementYear.toString();
      }
    }

    const status = (item.status || 'Research').trim();
    const type = (item.type || 'Retail').trim();
    const dlt = (item.dlt || 'Traditional').trim();

    return {
      id: item.uid || slug,
      slug,
      country: countryName,
      countryCode,
      digitalCurrency: currencyName,
      centralBank: item.centralBank || 'Central Bank',
      status,
      type,
      dlt,
      announcementYear: year,
      goals: item.goals || '',
      announcementLink: item.announcementLink || 'https://cbdctracker.org',
      crossBorderProject: Boolean(item.crossBorderProject),
      verifiedOn: new Date().toISOString().split('T')[0],
    };
  });

  fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2));
  console.log(`Saved ${catalog.length} normalized CBDC profiles to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed to sync CBDC catalog:', err);
  process.exit(1);
});
