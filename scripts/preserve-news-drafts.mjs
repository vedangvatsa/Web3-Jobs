import { currentRun, loadResearch } from './news-research.mjs';
import { preserveUnpublishedNewsOutputs } from './lib/news-validation.mjs';

try {
  console.log(JSON.stringify(preserveUnpublishedNewsOutputs({ context: currentRun(), ledger: loadResearch() })));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
