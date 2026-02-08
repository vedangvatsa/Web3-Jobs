'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // Log the detailed error to the console for debugging
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Your email could not be saved due to a database permissions issue. I am working on a fix.",
      });
    };

    const unsubscribe = errorEmitter.on('permission-error', handleError);

    return () => {
      unsubscribe();
    };
  }, [toast]);

  return null; // This component doesn't render anything
}
