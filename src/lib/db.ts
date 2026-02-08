import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function saveEmail(db: Firestore, email: string) {
  if (!email) return;

  const subscribersCol = collection(db, 'subscribers');

  addDoc(subscribersCol, {
      email: email,
      createdAt: serverTimestamp()
  }).catch(async (serverError) => {
      // Log the complete error for better debugging
      console.error("Firestore 'saveEmail' Error:", serverError);
      
      const permissionError = new FirestorePermissionError({
          path: subscribersCol.path,
          operation: 'create',
          requestResourceData: { email },
      });
      
      errorEmitter.emit('permission-error', permissionError);
  });
}
