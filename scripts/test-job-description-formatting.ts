import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as cheerio from 'cheerio';
import type { Job } from '../src/types';
import { buildSynthesizedJobContent } from '../src/lib/job-guides';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';
import { descriptionFormattingIssues } from './lib/description-format-checks';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { formatJobStructuredContent } from '../src/lib/job-structured-content';

const fixture: Job = {
  id: 'formatting-fixture', slug: 'formatting-fixture', title: 'Account Executive',
  company: 'Example', source: 'test', date: '2026-09-20',
  link: 'https://example.com/careers/account-executive',
};
const zones = [
  'Zone A: $155,445.33 - $174,893.33',
  'Zone B: $144,560.00 - $162,656.00',
  'Zone C: $136,794.67 - $153,920.00',
  'Zone D: $128,960.00 - $145,080.00',
];
const note = 'Amounts listed above include target variable compensation.';
const guidelines = 'Candidates may submit up to 9 active applications within a 60-day period.';
const ai = 'We may use automated AI tools to evaluate job applications for efficiency and consistency.';
const raw = `${zones.map(text => `<p>${text}</p>`).join('')}<p>${note}</p>` +
  `<div><p><strong>Application Guidelines</strong></p><p>${guidelines}</p>` +
  `<p><strong>Use of AI in Our Hiring Process</strong></p><p>${ai}</p></div>`;
const html = buildSynthesizedJobContent(fixture, raw);
const $ = cheerio.load(html);
const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
for (const text of [...zones, note, guidelines, ai]) {
  assert.ok(paragraphs.includes(text), `Expected separate paragraph: ${text}`);
}
assert.deepEqual($('h3').map((_, el) => $(el).text()).get(), [
  'Application Guidelines', 'Use of AI in Our Hiring Process',
]);
assert.doesNotMatch(html, /###BLOCK###|###HEADING###/);

const cached = cheerio.load(buildSynthesizedJobContent(fixture,
  `<div class="space-y-6"><p>${zones.join(' ')} ${note}Application Guidelines ${guidelines}</p>` +
  `<p>Use of AI in Our Hiring Process ${ai}</p></div>`));
const cachedParagraphs = cached('p').map((_, el) => cached(el).text()).get();
for (const text of [...zones, note, guidelines, ai]) {
  assert.ok(cachedParagraphs.includes(text), `Cached layout must keep a separate paragraph: ${text}`);
}
assert.deepEqual(cached('h3').map((_, el) => cached(el).text()).get(), [
  'Application Guidelines', 'Use of AI in Our Hiring Process',
]);
assert.doesNotMatch(cached.html(), /compensation\.Application/);

const independent = [
  'Build and maintain production systems with a distributed engineering team',
  'collaborate with colleagues to deliver the product roadmap and support customers',
];
const parsed = cheerio.load(buildSynthesizedJobContent(fixture,
  independent.map(text => `<p>${text}</p>`).join('')));
assert.deepEqual(parsed('p').map((_, el) => parsed(el).text().trim()).get(), independent);

const structured = `<p>${independent.join('. ')}.</p><h3><br><strong>How We Work</strong></h3>` +
  '<ol start="3"><li>Submit application<ul><li>Attach resume</li><li>Include portfolio</li></ul></li><li value="7">Attend interview</li></ol>' +
  '<table><thead><tr><th>Location</th><th>Pay</th></tr></thead><tbody><tr><td>London</td><td>GBP 100,000</td></tr></tbody></table>' +
  '<pre><code># Not a section heading\nconst value = "&lt;div&gt;";\n  return value;</code></pre>';
const renderedStructure = buildSynthesizedJobContent(fixture, sanitizeJobDescriptionHtml(structured));
const dom = cheerio.load(renderedStructure);
assert.equal(dom('ol').attr('start'), '3');
assert.equal(dom('ol > li[value="7"]').text().trim(), 'Attend interview');
assert.equal(dom('ol > li > ul > li').length, 2);
assert.equal(dom('table tr').length, 2);
assert.equal(dom('td').last().text(), 'GBP 100,000');
assert.equal(dom('pre code').text(), '# Not a section heading\nconst value = "<div>";\n  return value;');
assert.ok(dom('h3').toArray().some(el => dom(el).text() === 'How We Work'));
assert.deepEqual(descriptionFormattingIssues(renderedStructure), []);
const malformedList = '<ul><div><p><strong>Requirements</strong></p><li>First</li><h3>Second section</h3><li>Second</li></div></ul>';
const repairedList = formatJobStructuredContent(malformedList);
assert.deepEqual(descriptionFormattingIssues(repairedList), []);
assert.equal(cheerio.load(repairedList)('li').length, 2);
assert.equal(formatJobStructuredContent(repairedList), repairedList, 'Structured formatting must be idempotent');
assert.ok(descriptionFormattingIssues('<h3></h3><p>## Heading</p><ul><p>Invalid item</p></ul>').length >= 3);

const binanceSource = '<div><strong>About Binance Accelerator Program</strong></div>' +
  '<div>The internship includes backend development, testing and documentation for the KYB system.</div>' +
  '<div><strong>Who may apply</strong></div><div>Current university students and recent graduates.</div>' +
  '<div><em>*Terms of employment / engagement shall be subject to contract and local applicable laws</em></div>' +
  '<h3>Responsibilities</h3><ul><li>Maintain the KYB backend system</li>' +
  '<li>Demonstrate strong troubleshooting skills to solve problems reported by the QA team<br>Assist the CS team to solve customer problems and classify them for system improvement</li></ul>' +
  '<h3>Requirements</h3><ul><li>Solid Java foundation</li><li>Familiar with MySQL</li></ul>' +
  '<div><span style="font-size: 16px;">Why Binance</span></div>' +
  '<div>• Competitive salary and company benefits</div><div>• Work-from-home arrangement</div>' +
  '<div><em>By submitting a job application, you confirm that you have read and agree to our&nbsp;<a href="https://www.binance.com/en/candidate/privacy/notice">Candidate Privacy Notice</a>.</em></div>';
for (const source of [binanceSource, sanitizeJobDescriptionHtml(binanceSource, 'Binance')]) {
  const rendered = buildSynthesizedJobContent({ ...fixture, company: 'Binance' }, source);
  const binance = cheerio.load(rendered);
  const responsibilities = binance('h3').filter((_, heading) => binance(heading).text() === 'Key Responsibilities').next('ul');
  assert.equal(responsibilities.children('li').length, 2);
  assert.equal(responsibilities.children('li').last().find('br').length, 1, 'Employer line breaks inside responsibilities must survive');
  assert.equal(binance('h3').filter((_, heading) => binance(heading).text() === 'Why Binance').next('ul').children('li').length, 2);
  assert.equal(binance('p > em').filter((_, note) => binance(note).text().startsWith('Terms of employment')).length, 1);
  assert.doesNotMatch(binance.root().text(), /By submitting a job application|agree to our\s*\./);
  assert.deepEqual(descriptionFormattingIssues(rendered), []);
}
const quotedNote = cheerio.load(buildSynthesizedJobContent({ ...fixture, company: 'Binance' },
  binanceSource + '<blockquote><p><em>*A source footnote inside quoted material.</em></p></blockquote>'));
assert.equal(quotedNote('blockquote em').text(), '*A source footnote inside quoted material.');
assert.doesNotMatch(quotedNote.html(), /###STRUCTURE:/);

const jobs: Job[] = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8'));
const store = readJobDescriptionStore();
let checked = 0;
for (const job of jobs.filter(job => job.active !== false)) {
  const source = store.descriptions[getJobContentKey(job)] || job.description || '';
  if (!/Zone A:|Application Guidelines|Use of AI in Our Hiring Process/.test(source)) continue;
  const original = cheerio.load(source);
  const output = cheerio.load(buildSynthesizedJobContent(job, source));
  const renderedParagraphs = output('p').map((_, el) => output(el).text()).get();
  const originalZones = original('p').map((_, el) => original(el).text().trim()).get()
    .filter(text => /^Zone [A-D]:/.test(text))
    .flatMap(text => text.match(/Zone [A-D]:\s*\(?\$[\d,.]+\s*[-–—]\s*\$[\d,.]+\)?/g) || []);
  for (const zone of originalZones) {
    const label = zone.match(/^Zone [A-D]:/)![0];
    const row = renderedParagraphs.find(text => text.startsWith(label));
    assert.ok(row, `${job.slug}: missing standalone ${label}`);
    assert.equal((row.match(/Zone [A-D]:/g) || []).length, 1, `${job.slug}: salary rows fused: ${row}; source: ${zone}`);
    const amounts = zone.match(/\$[\d,.]+/g) || [];
    for (const amount of amounts) assert.ok(row.includes(amount), `${job.slug}: lost salary ${amount}`);
  }
  for (const heading of ['Application Guidelines', 'Use of AI in Our Hiring Process']) {
    const sourceHeading = original('strong,b,h1,h2,h3,h4').toArray()
      .some(el => original(el).text().trim() === heading);
    if (sourceHeading) {
      assert.ok(output('h3').toArray().some(el => output(el).text() === heading),
        `${job.slug}: lost heading ${heading}`);
    }
  }
  checked++;
}
assert.ok(checked > 0, 'Expected matching employer descriptions');
console.log(`Job formatting regression passed: fixtures and ${checked} matching published descriptions.`);
