import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function saveEmail(db: Firestore, email: string) {
  if (!email) return;

  const subscribersCol = collection(db, 'subscribers');

  addDoc(subscribersCol, {
      email: email,
      createdAt: serverTimestamp()
  }).then(() => {
    toast({
        title: "Success!",
        description: "You're subscribed. We'll keep you updated on the latest jobs.",
      });
  }).catch(async (serverError) => {
      // Log the complete error for better debugging
      console.error("Firestore 'saveEmail' Error:", serverError);

      const permissionError = new FirestorePermissionError({
          path: subscribersCol.path,
          operation: 'create',
          requestResourceData: { email },
      });

      errorEmitter.emit('permission-error', permissionError);

      // Also show a generic error to the user
       toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not save your email at this time. Please try again later.",
      });
  });
}

    