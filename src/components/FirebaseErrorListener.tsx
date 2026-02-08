'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error.message); // Log the detailed error to the console for debugging
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Your request was blocked by security rules.",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      // Clean up the listener when the component unmounts
      // This requires adding a 'removeListener' method to our simple emitter
    };
  }, [toast]);

  return null; // This component doesn't render anything
}
