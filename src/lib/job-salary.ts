import type { Job } from '@/types';

export interface JobBaseSalarySchema {
  '@type': 'MonetaryAmount';
  currency: string;
  value: {
    '@type': 'QuantitativeValue';
    minValue?: number;
    maxValue?: number;
    value?: number;
    unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
}

export interface JobSalaryInfo {
  schema: JobBaseSalarySchema;
  display: string;
  isEstimated: boolean;
}

/**
 * Web3 Industry Base Salary Benchmarks (Annual USD).
 * Sourced from live transparency filings, Web3 compensation indices,
 * and the Hashtag Web3 Market Compensation dataset.
 */
const SALARY_BENCHMARKS: Record<string, Record<string, [number, number]>> = {
  quant: {
    executive: [240000, 360000],
    lead: [200000, 300000],
    senior: [175000, 260000],
    mid: [135000, 190000],
    junior: [95000, 135000],
    intern: [50000, 80000],
  },
  security: {
    executive: [220000, 320000],
    lead: [185000, 260000],
    senior: [160000, 225000],
    mid: [125000, 175000],
    junior: [90000, 125000],
    intern: [45000, 75000],
  },
  'smart-contract': {
    executive: [210000, 300000],
    lead: [180000, 250000],
    senior: [150000, 215000],
    mid: [115000, 165000],
    junior: [85000, 115000],
    intern: [45000, 70000],
  },
  engineering: {
    executive: [200000, 290000],
    lead: [170000, 240000],
    senior: [140000, 195000],
    mid: [110000, 150000],
    junior: [80000, 110000],
    intern: [40000, 65000],
  },
  product: {
    executive: [190000, 270000],
    lead: [160000, 220000],
    senior: [135000, 185000],
    mid: [105000, 145000],
    junior: [75000, 105000],
    intern: [35000, 60000],
  },
  legal: {
    executive: [210000, 310000],
    lead: [175000, 250000],
    senior: [145000, 205000],
    mid: [110000, 155000],
    junior: [80000, 115000],
    intern: [35000, 60000],
  },
  design: {
    executive: [160000, 230000],
    lead: [135000, 185000],
    senior: [115000, 155000],
    mid: [85000, 125000],
    junior: [65000, 90000],
    intern: [35000, 55000],
  },
  business: {
    executive: [175000, 260000],
    lead: [140000, 200000],
    senior: [110000, 165000],
    mid: [85000, 125000],
    junior: [65000, 90000],
    intern: [35000, 55000],
  },
  marketing: {
    executive: [160000, 230000],
    lead: [130000, 180000],
    senior: [105000, 150000],
    mid: [80000, 115000],
    junior: [60000, 85000],
    intern: [35000, 50000],
  },
  operations: {
    executive: [150000, 220000],
    lead: [120000, 165000],
    senior: [95000, 140000],
    mid: [75000, 105000],
    junior: [55000, 80000],
    intern: [30000, 48000],
  },
  default: {
    executive: [170000, 240000],
    lead: [140000, 195000],
    senior: [115000, 165000],
    mid: [90000, 130000],
    junior: [65000, 95000],
    intern: [35000, 55000],
  },
};

function getSeniorityTier(title: string): 'executive' | 'lead' | 'senior' | 'mid' | 'junior' | 'intern' {
  const t = title.toLowerCase();
  if (/\b(vp|vice president|director|head of|head,|chief|c-level|founder|partner)\b/i.test(t)) return 'executive';
  if (/\b(lead|principal|staff|architect)\b/i.test(t)) return 'lead';
  if (/\b(senior|sr\.?|experienced)\b/i.test(t)) return 'senior';
  if (/\b(junior|jr\.?|associate|entry)\b/i.test(t)) return 'junior';
  if (/\b(intern|internship)\b/i.test(t)) return 'intern';
  return 'mid';
}

function getCategoryDomain(title: string, department?: string): string {
  const t = `${title} ${department || ''}`.toLowerCase();
  if (/\b(quant|quantitative|trader|trading|portfolio)\b/i.test(t)) return 'quant';
  if (/\b(security|audit|auditor|cryptograph|zk|zero knowledge)\b/i.test(t)) return 'security';
  if (/\b(solidity|smart contract|protocol engineer|blockchain engineer|rust engineer|substrate)\b/i.test(t)) return 'smart-contract';
  if (/\b(engineer|developer|backend|frontend|fullstack|full stack|mobile|devops|sre|infrastructure|infra|data|ai|machine learning|ml)\b/i.test(t)) return 'engineering';
  if (/\b(product|pm)\b/i.test(t)) return 'product';
  if (/\b(legal|counsel|compliance|regulatory)\b/i.test(t)) return 'legal';
  if (/\b(design|ui\/ux|ux|ui|creative)\b/i.test(t)) return 'design';
  if (/\b(marketing|growth|content|social media|community|brand|seo)\b/i.test(t)) return 'marketing';
  if (/\b(sales|business development|partnerships|account executive|bd|capital formation)\b/i.test(t)) return 'business';
  if (/\b(operations|support|administrative|assistant|finance|accounting|hr|recruiter|people)\b/i.test(t)) return 'operations';
  return 'default';
}

function getLocationFactor(location?: string): number {
  if (!location) return 1.0;
  const l = location.toLowerCase();
  if (/\b(us|united states|usa|san francisco|new york|nyc|ca|california|ny)\b/i.test(l)) return 1.05;
  if (/\b(europe|uk|united kingdom|london|germany|berlin|france|paris|switzerland|zurich|netherlands|amsterdam)\b/i.test(l)) return 0.95;
  if (/\b(singapore|hong kong|tokyo|japan|dubai|uae)\b/i.test(l)) return 0.9;
  if (/\b(india|bengaluru|bangalore|latam|brazil|argentina|nigeria|vietnam|philippines)\b/i.test(l)) return 0.75;
  return 1.0;
}

function parseExplicitSalary(text: string): JobBaseSalarySchema | null {
  if (!text) return null;

  // Search for explicit salary ranges:
  // e.g. $100,000 - $110,000 or ₹15,00,000 - ₹25,00,000 or $120k - $160k
  const rangeRegex = /(?:([$€£₹]|USD|EUR|GBP|CAD|AUD|SGD|INR)\s*)(\d{1,3}(?:[,\s]?\d{2,3})*k?)\s*(?:-|–|—|to)\s*(?:([$€£₹]|USD|EUR|GBP|CAD|AUD|SGD|INR)\s*)?(\d{1,3}(?:[,\s]?\d{2,3})*k?)/i;
  const m = text.match(rangeRegex);

  if (!m) return null;

  const rawSymbol = m[1] || m[3] || '$';
  let currency = 'USD';
  if (rawSymbol === '€' || /EUR/i.test(rawSymbol)) currency = 'EUR';
  else if (rawSymbol === '£' || /GBP/i.test(rawSymbol)) currency = 'GBP';
  else if (rawSymbol === '₹' || /INR/i.test(rawSymbol)) currency = 'INR';
  else if (/CAD/i.test(rawSymbol)) currency = 'CAD';
  else if (/AUD/i.test(rawSymbol)) currency = 'AUD';
  else if (/SGD/i.test(rawSymbol)) currency = 'SGD';

  const parseVal = (s: string) => {
    const clean = s.toLowerCase().replace(/[,\s]/g, '').trim();
    if (clean.endsWith('k')) return parseFloat(clean.slice(0, -1)) * 1000;
    return parseFloat(clean);
  };

  let min = parseVal(m[2]);
  let max = parseVal(m[4]);
  if (!min || !max || Number.isNaN(min) || Number.isNaN(max)) return null;
  if (min > max) [min, max] = [max, min];

  const matchIdx = text.indexOf(m[0]);
  const contextSnippet = text.slice(Math.max(0, matchIdx - 30), Math.min(text.length, matchIdx + m[0].length + 40)).toLowerCase();

  let unitText: 'HOUR' | 'MONTH' | 'YEAR' = 'YEAR';
  if (/(?:\/|per\s*)(?:hr|hour)\b/i.test(contextSnippet) || (max <= 500 && currency !== 'INR')) {
    unitText = 'HOUR';
  } else if (/(?:\/|per\s*)month\b/i.test(contextSnippet) || (max <= 20000 && currency !== 'INR' && !contextSnippet.includes('year') && !contextSnippet.includes('annual'))) {
    unitText = 'MONTH';
  }

  const maxYearCap = currency === 'INR' ? 50000000 : 2500000;
  const minYearCap = currency === 'INR' ? 100000 : 20000;

  if (
    (unitText === 'YEAR' && min >= minYearCap && max <= maxYearCap) ||
    (unitText === 'HOUR' && min >= 12 && max <= 500) ||
    (unitText === 'MONTH' && min >= 1500 && max <= 150000)
  ) {
    return {
      '@type': 'MonetaryAmount',
      currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: Math.round(min),
        maxValue: Math.round(max),
        unitText,
      },
    };
  }

  return null;
}

function formatAmount(val: number, symbol: string = '$'): string {
  if (currencyFormattingMap[symbol]) {
    return currencyFormattingMap[symbol](val);
  }
  if (val >= 1000) {
    const k = val / 1000;
    return Number.isInteger(k) ? `${symbol}${k}k` : `${symbol}${k.toFixed(1)}k`;
  }
  return `${symbol}${val}`;
}

const currencyFormattingMap: Record<string, (val: number) => string> = {
  '₹': (val: number) => {
    if (val >= 100000) {
      const lakh = val / 100000;
      return Number.isInteger(lakh) ? `₹${lakh} L` : `₹${lakh.toFixed(1)} L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return Number.isInteger(k) ? `₹${k}k` : `₹${k.toFixed(1)}k`;
    }
    return `₹${val}`;
  },
};

export function formatSalaryDisplay(salary: JobBaseSalarySchema, isEstimated: boolean): string {
  const { currency, value } = salary;
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : currency === 'CAD' ? 'C$' : currency === 'AUD' ? 'A$' : currency === 'SGD' ? 'S$' : '$';
  const unitSuffix = value.unitText === 'HOUR' ? '/hr' : value.unitText === 'MONTH' ? '/mo' : '/yr';

  let rangeText = '';
  if (value.minValue && value.maxValue && value.minValue !== value.maxValue) {
    rangeText = `${formatAmount(value.minValue, symbol)} – ${formatAmount(value.maxValue, symbol)}${unitSuffix}`;
  } else if (value.value || value.minValue) {
    rangeText = `${formatAmount((value.value || value.minValue)!, symbol)}${unitSuffix}`;
  } else {
    rangeText = `${symbol}100k – ${symbol}160k/yr`;
  }

  return isEstimated ? `${rangeText} (est.)` : rangeText;
}

/**
 * Returns structured JobPosting baseSalary Schema.org MonetaryAmount
 * and human-friendly display text for any Web3 job.
 */
export function getJobSalaryInfo(job: Job, contentHtml?: string): JobSalaryInfo {
  const fullText = `${job.description || ''} ${contentHtml || ''}`;
  const explicit = parseExplicitSalary(fullText);

  if (explicit) {
    return {
      schema: explicit,
      display: formatSalaryDisplay(explicit, false),
      isEstimated: false,
    };
  }

  const dept = typeof job.department === 'string' ? job.department : (job.department as any)?.name;
  const cat = getCategoryDomain(job.title, dept);
  const seniority = getSeniorityTier(job.title);
  const benchmark = (SALARY_BENCHMARKS[cat] || SALARY_BENCHMARKS.default)[seniority] || [90000, 130000];
  const loc = typeof job.location === 'string' ? job.location : (job.location as any)?.name;
  const mult = getLocationFactor(loc);

  const min = Math.round((benchmark[0] * mult) / 1000) * 1000;
  const max = Math.round((benchmark[1] * mult) / 1000) * 1000;

  const estimatedSchema: JobBaseSalarySchema = {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: {
      '@type': 'QuantitativeValue',
      minValue: min,
      maxValue: max,
      unitText: 'YEAR',
    },
  };

  return {
    schema: estimatedSchema,
    display: '',
    isEstimated: true,
  };
}
