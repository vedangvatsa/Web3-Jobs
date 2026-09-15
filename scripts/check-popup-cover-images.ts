import { getAllPopups } from '@/lib/popups';
import { isCommunityPhotoRef } from '@/lib/popup-community-photos';
import { POPUP_MIN_COVER_IMAGES, popupCommunityCoverCount } from '@/lib/popup-gallery';
import { existsSync } from 'fs';
import path from 'path';

const short = getAllPopups().filter((p) => popupCommunityCoverCount(p) < POPUP_MIN_COVER_IMAGES);
const missingFiles: string[] = [];

for (const popup of getAllPopups()) {
  for (const src of popup.coverImages ?? []) {
    const fsPath = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    if (!existsSync(fsPath)) missingFiles.push(`${popup.slug}: ${src}`);
    if (!isCommunityPhotoRef(src)) {
      missingFiles.push(`${popup.slug}: not a community photo (${src})`);
    }
  }
}

if (short.length) {
  console.error(`Popups with fewer than ${POPUP_MIN_COVER_IMAGES} cover images:`);
  for (const p of short) {
    console.error(`  ${p.slug} (${popupCommunityCoverCount(p)} community)`);
  }
}

if (missingFiles.length) {
  console.error('Missing cover files on disk:');
  for (const line of missingFiles) console.error(`  ${line}`);
}

if (short.length || missingFiles.length) process.exit(1);
console.log(
  `All ${getAllPopups().length} popups have at least ${POPUP_MIN_COVER_IMAGES} community photos on disk.`,
);
