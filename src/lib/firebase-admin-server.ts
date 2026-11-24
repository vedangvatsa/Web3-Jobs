import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function parseServiceAccountJson(): string | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) return rawJson;

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!key) return null;

  if (key.startsWith('{')) return key;
  try {
    return Buffer.from(key, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(parseServiceAccountJson());
}

/** Firestore via service account (required for server reads; rules block public reads). */
export function getAdminFirestore(): Firestore | null {
  if (getApps().length) {
    return getFirestore();
  }

  const json = parseServiceAccountJson();
  if (!json) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(json) as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccount),
    });
    return getFirestore();
  } catch (error) {
    console.error('[firebase-admin] Failed to initialize:', error);
    return null;
  }
}
