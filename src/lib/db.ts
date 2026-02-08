import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function saveEmail(db: Firestore, email: string) {
  if (!email) return;

  const subscribersCol = collection(db, 'subscribers');

  // Do not await. Let it run in the background.
  // The .catch block will handle any security rule violations.
  addDoc(subscribersCol, {
      email: email,
      createdAt: serverTimestamp()
  }).catch(async (serverError) => {
      // If the write fails, assume it's a permission error for now.
      const permissionError = new FirestorePermissionError({
          path: subscribersCol.path,
          operation: 'create',
          requestResourceData: { email },
      });
      // Emit the custom error so a listener can display it.
      errorEmitter.emit('permission-error', permissionError);
  });
}
