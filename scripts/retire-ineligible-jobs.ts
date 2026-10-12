import fs from 'node:fs';
import { retireIneligibleJobs } from './lib/retire-ineligible-jobs';

const result = retireIneligibleJobs();
const report = process.argv.find(arg => arg.startsWith('--report='))?.slice('--report='.length) || 'content/job-age-cleanup-report.json';
if (result.removedJobs || !fs.existsSync(report)) fs.writeFileSync(report, `${JSON.stringify(result, null, 2)}\n`);
const { removed: _removed, ...summary } = result;
console.log(JSON.stringify(summary, null, 2));
