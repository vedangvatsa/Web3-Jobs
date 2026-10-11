import { setTimeout as delay } from 'node:timers/promises';
import { verifyCatalogFreshness } from './lib/catalog-freshness.mjs';

let error;
for (let attempt = 1; attempt <= 6; attempt++) {
  try {
    const manifest = await verifyCatalogFreshness({ origin: process.env.SITE_ORIGIN || 'https://hashtagweb3.com', since: process.env.DEPLOY_STARTED_AT });
    console.log(JSON.stringify({ verified: true, ...manifest }, null, 2));
    error = null; break;
  } catch (failure) { error = failure; console.error(`Live catalogue check ${attempt}/6: ${failure.message}`); if (attempt < 6) await delay(10000); }
}
if (error) process.exitCode = 1;
