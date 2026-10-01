import { retireRejectedJobSources } from './lib/retire-rejected-job-sources';

const result = retireRejectedJobSources();
console.log(JSON.stringify({ ...result, retiredSlugs: result.retiredSlugs.length, recoveredSlugs: result.recoveredSlugs.length }, null, 2));
