import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function saveEmail(db: Firestore | null, email: string): Promise<void> {
  if (!db) {
      console.error("Firestore instance is null. This is likely because the Firebase environment variables are not set correctly.");
      throw new Error("Database Not Configured");
  }
  if (!email) {
    return Promise.resolve();
  }

  const normalizedEmail = email.toLowerCase().trim();
  // Use the email as the document ID to naturally prevent duplicates
  // without requiring read access (which is blocked by security rules).
  const subscriberRef = doc(db, 'subscribers', normalizedEmail);

  try {
    // merge: true ensures that if the document already exists,
    // it updates the timestamp without overwriting other fields.
    await setDoc(subscriberRef, {
        email: normalizedEmail,
        createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error("Firestore 'saveEmail' Error:", error.code, error.message);
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        const permissionError = new FirestorePermissionError({
            path: subscriberRef.path,
            operation: 'create',
            requestResourceData: { email: normalizedEmail },
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    // Re-throw the error so the caller can handle it.
    throw error;
  }
}
