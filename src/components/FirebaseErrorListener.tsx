'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
 const { toast } = useToast();

 useEffect(() => {
  const handleError = (error: FirestorePermissionError) => {
   // Log the detailed error to the console for debugging
   console.error("A Firestore permission error was caught. Context:", error);
   
   toast({
    variant: "destructive",
    title: "Permission Denied",
    description: "Your request was denied by database security rules. The developer has been notified.",
   });
  };

  const unsubscribe = errorEmitter.on('permission-error', handleError);

  return () => {
   unsubscribe();
  };
 }, [toast]);

 return null; // This component doesn't render anything
}
