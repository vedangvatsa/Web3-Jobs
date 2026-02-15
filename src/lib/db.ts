import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
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

  const subscribersCol = collection(db, 'subscribers');

  try {
    await addDoc(subscribersCol, {
        email: email,
        createdAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error("Firestore 'saveEmail' Error:", error.code, error.message);
    if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        const permissionError = new FirestorePermissionError({
            path: subscribersCol.path,
            operation: 'create',
            requestResourceData: { email },
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    // Re-throw the error so the caller can handle it.
    throw error;
  }
}
