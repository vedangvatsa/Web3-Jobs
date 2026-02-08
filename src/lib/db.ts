import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function saveEmail(db: Firestore | null, email: string) {
  if (!db) {
      toast({
          variant: "destructive",
          title: "Database Not Configured",
          description: "The application is not connected to a database. Your email could not be saved.",
      });
      console.error("Firestore instance is null. Firebase may not be configured correctly.");
      return;
  }
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
  }).catch(async (error) => {
      console.error("Firestore 'saveEmail' Error:", error);

      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
          const permissionError = new FirestorePermissionError({
              path: subscribersCol.path,
              operation: 'create',
              requestResourceData: { email },
          });
          errorEmitter.emit('permission-error', permissionError);
      } else {
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: error.message || "Could not save your email at this time. Please try again later.",
        });
      }
  });
}
