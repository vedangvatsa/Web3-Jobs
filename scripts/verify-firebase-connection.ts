/**
 * Verifies Firebase Admin + public project config (any Firebase project).
 * Usage: set FIREBASE_* env vars, then: npx tsx scripts/verify-firebase-connection.ts
 */
import { getAdminFirestore, isFirebaseAdminConfigured } from '../src/lib/firebase-admin-server';

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  console.log('[firebase] NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ?? '(missing)');

  if (!isFirebaseAdminConfigured()) {
    console.error('[firebase] Admin: not configured (FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON)');
    process.exit(1);
  }

  const db = getAdminFirestore();
  if (!db) {
    console.error('[firebase] Admin: failed to initialize');
    process.exit(1);
  }

  try {
    await db.collection('subscribers').limit(1).get();
    console.log('[firebase] Admin: OK (read subscribers)');
  } catch (err) {
    console.error('[firebase] Admin: Firestore read failed:', err);
    process.exit(1);
  }

  console.log('[firebase] Done — sync secrets to Cloudflare when switching projects.');
}

main();
