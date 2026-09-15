import { getAllPopups } from '@/lib/popups';
import { POPUP_PAGE_MIN_WORDS, popupPageWordCount } from '@/lib/popup-page-words';

const short = getAllPopups()
  .map((popup) => ({ slug: popup.slug, words: popupPageWordCount(popup) }))
  .filter((row) => row.words < POPUP_PAGE_MIN_WORDS)
  .sort((a, b) => a.words - b.words);

if (short.length) {
  console.error(`Popups below ${POPUP_PAGE_MIN_WORDS} words:`);
  for (const row of short) {
    console.error(`  ${row.slug}: ${row.words}`);
  }
  process.exit(1);
}

console.log(`All ${getAllPopups().length} popups meet the ${POPUP_PAGE_MIN_WORDS}-word minimum.`);
