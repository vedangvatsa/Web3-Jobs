import * as cheerio from 'cheerio';

export function postingText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  $('br').replaceWith('\n');
  $('p, li, div, h1, h2, h3, h4, tr').append('\n');
  return $.root().text().replace(/[\t \u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function percentage(count: number, total: number): number {
  return total ? Math.round(count / total * 1000) / 10 : 0;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export const departmentRules: [string, RegExp][] = [
  ['Engineering', /\b(engineer(?:ing)?|software|developer|devops|sre|backend|frontend|solidity)\b/i],
  ['Product & Design', /\b(product|design(?:er)?|ux|ui)\b/i],
  ['Sales & Business Development', /\b(sales|business development|partnerships?|account executive|account management)\b/i],
  ['Marketing', /\b(marketing|growth|brand|communications|content|community)\b/i],
  ['Compliance & Legal', /\b(compliance|legal|counsel|paralegal|aml|kyc|regulatory)\b/i],
  ['Finance', /\b(finance|financial|accountant|accounting|controller|treasury|fp&a)\b/i],
  ['Human Resources', /\b(people|talent|recruit(?:er|ing|ment)?|human resources|hr)\b/i],
  ['Trading', /\b(trading|trader|quant|quantitative)\b/i],
  ['Operations & Support', /\b(operations|ops|support|customer success)\b/i],
];

export function department(title: string, field: string): string {
  for (const text of [field, title]) {
    const match = departmentRules.find(([, pattern]) => pattern.test(text));
    if (match) return match[0];
  }
  return 'Other / unclassified';
}

export function seniority(title: string): string {
  if (/\b(intern(?:ship)?|graduate|entry[- ]level|junior|jr)\b/i.test(title)) return 'Entry / internship';
  if (/\b(director|vp|vice president|chief|ceo|cto|cfo|cpo|head of|svp|evp|president|coo|cmo)\b/i.test(title)) return 'Director / executive';
  if (/\b(senior|sr|staff|lead|principal)\b/i.test(title)) return 'Senior / lead';
  return 'No matched seniority term';
}

export const keywordRules: [string, RegExp][] = [
  ['AI / machine learning / LLM', /\b(ai|ml|llms?|machine learning|large language models?|artificial intelligence)\b/i],
  ['Python', /\bpython\b/i],
  ['SQL', /\bsql\b/i],
  ['AWS', /\baws\b|\bamazon web services\b/i],
  ['Java', /\bjava\b/i],
  ['TypeScript', /\btypescript\b/i],
  ['JavaScript', /\bjavascript\b/i],
  ['React', /\breact(?:\.js|js)?\b/i],
  ['Rust', /\brust\b/i],
  ['Solidity', /\bsolidity\b/i],
  ['Smart contracts', /\bsmart contracts?\b/i],
  ['Project management', /\bproject manag(?:er|ement)\b/i],
  ['Risk management', /\brisk management\b/i],
  ['AML', /\baml\b|\banti[- ]money laundering\b/i],
];

export type SalaryRange = { low: number; high: number; midpoint: number; excerpt: string };

export function annualUsdRange(text: string, location: string): SalaryRange | null {
  const usLocation = /\b(united states|usa|new york|san francisco|california|seattle|austin|chicago|boston|miami|los angeles|washington dc)\b|\bU\.?S\.?\b/i.test(location);
  const ranges = new Map<string, SalaryRange>();
  const amount = '(\\d[\\d,]*(?:\\.\\d+)?\\s*[kK]?)';
  const pattern = new RegExp(`(?:USD\\s*\\$?|US\\$|\\$)\\s*${amount}\\s*(?:[-–—]|to)\\s*(?:(?:USD\\s*\\$?|US\\$|\\$)\\s*)?${amount}`, 'gi');
  const number = (value: string) => Number(value.replace(/[,\sKk]/g, '')) * (/k/i.test(value) ? 1000 : 1);
  for (const paragraph of text.split(/\n+/)) {
    if (!/\b(salary|base pay|base compensation|pay range)\b/i.test(paragraph)) continue;
    const periodText = paragraph.replace(/annual(?:\s+target|\s+discretionary)?\s+bonus/gi, 'bonus');
    if (!/\b(annual(?:ly)?|yearly|per year|per annum|a year)\b|\/\s*(yr|year)\b/i.test(periodText)) continue;
    if (/\b(hour(?:ly)?|monthly|per month|per week|cad|aud|sgd|hkd|nzd|eur|gbp|ote|on[- ]target earnings|total compensation)\b|(?:CA|AU|SG|HK|NZ)\$/i.test(paragraph)) continue;
    const explicitUsd = /\bUSD\b|US\$|\bU\.?S\.? dollars\b/i.test(paragraph);
    if (!explicitUsd && (!usLocation || /\b(canada|canadian|toronto|vancouver|singapore|hong kong|australia|sydney|new zealand)\b/i.test(location))) continue;
    for (const match of paragraph.matchAll(pattern)) {
      const before = paragraph.slice(Math.max(0, match.index - 200), match.index);
      const salaryContext = before.match(/\b(?:base (?:salary|pay|compensation)|salary(?: range)?|pay range)\b([^.!?;]{0,160})$/i);
      if (!salaryContext || /\b(equity|bonus|stock|grants?|assets|revenue|funding)\b/i.test(salaryContext[1])) continue;
      const low = !/k/i.test(match[1]) && /k/i.test(match[2]) && number(match[1]) < 1000 ? number(match[1]) * 1000 : number(match[1]);
      const high = number(match[2]);
      if (low <= 0 || high < low || !Number.isFinite(high)) continue;
      ranges.set(`${low}:${high}`, { low, high, midpoint: (low + high) / 2, excerpt: paragraph });
    }
  }
  return ranges.size === 1 ? [...ranges.values()][0] : null;
}
