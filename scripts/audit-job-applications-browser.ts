import fs from 'node:fs';
import { chromium } from '@playwright/test';
import type { ApplicationAudit } from './audit-job-applications';
import { getJobIdentity } from '../src/lib/job-slugs';
import type { Job } from '../src/types';
import { applicationAuditSubjects } from './lib/job-application-subjects';

async function main() {
  const file = '.cache/job-applications/audit.json';
  const audit = JSON.parse(fs.readFileSync(file, 'utf8')) as { checkedAt: string; results: ApplicationAudit[] };
  const jobs = applicationAuditSubjects();
  const byIdentity = new Map(jobs.map(job => [getJobIdentity(job), job]));
  const pending = audit.results.filter(result => result.status === 'unverified' && /HTTP 200/.test(result.evidence));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN, headless: true });
  let cursor = 0, completed = 0;
  const counts = { open: 0, closed: 0, unverified: 0 };
  const normalized = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const closedPattern = /(?:this|the) (?:job(?: posting| opening)?|position|vacancy) (?:is|has been) (?:no longer (?:available|accepting applications|active)|closed|filled|removed|expired)|no longer accepting applications for this (?:job|position)|the job you (?:are|were) looking for (?:is no longer available|could not be found)|вакансия (?:закрыта|больше недоступна)/i;
  const save = () => { audit.checkedAt = new Date().toISOString(); fs.writeFileSync(file, JSON.stringify(audit, null, 2)); };
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const context = await browser.newContext();
      await context.route('**/*', route => ['image', 'media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue());
      const page = await context.newPage();
      page.on('dialog', dialog => dialog.dismiss());
      while (cursor < pending.length) {
        const result = pending[cursor++], job = byIdentity.get(result.identity);
        if (!job) continue;
        try {
          const response = await page.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
          const text = (await page.locator('body').innerText({ timeout: 5000 })).replace(/\s+/g, ' ').trim();
          const closed = text.match(closedPattern);
          const heading = (await page.locator('h1,h2').allTextContents()).map(value => value.trim()).find(value => /^(?:(?:job|position|vacancy)(?: posting)? (?:closed|expired|not found)|(?:404\s*[-:]?\s*)?(?:page )?not found)[.!]?$/i.test(value));
          const closedMessage = closed && closed.index! < 2000 ? closed[0] : heading;
          if ((response && [404, 410].includes(response.status())) || closedMessage) {
            const again = await page.reload({ waitUntil: 'domcontentloaded', timeout: 25000 });
            await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
            const confirm = (await page.locator('body').innerText({ timeout: 5000 })).replace(/\s+/g, ' ').trim();
            if (response && [404, 410].includes(response.status()) && again && [404, 410].includes(again.status())) {
              result.status = 'not-found'; result.evidence = `Browser received HTTP ${again.status()} twice: ${page.url()}`; counts.closed++;
            } else if (closedMessage && confirm.includes(closedMessage)) {
              result.status = 'closed'; result.evidence = `Rendered employer page confirms: ${closedMessage} (${page.url()})`; counts.closed++;
            } else counts.unverified++;
          } else if (normalized(job.title).length >= 12 && normalized(text).includes(normalized(job.title))) {
            result.status = 'open'; result.evidence = `Rendered application page contains the role title: ${page.url()}`; counts.open++;
          } else { result.evidence = `Browser could not verify an active or closed role: ${page.url()}`; counts.unverified++; }
          result.checkedAt = new Date().toISOString();
        } catch (error) { result.evidence = `Browser unavailable: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`; counts.unverified++; }
        completed++;
        if (completed % 20 === 0) { save(); console.log(JSON.stringify({ checked: completed, total: pending.length, ...counts })); }
      }
      await context.close();
    }));
    save();
    console.log(JSON.stringify({ browserChecked: completed, ...counts, totals: Object.fromEntries(['open', 'closed', 'not-found', 'unverified'].map(status => [status, audit.results.filter(result => result.status === status).length])) }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
