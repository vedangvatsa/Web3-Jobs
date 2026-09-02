'use client';

import * as React from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
 children: React.ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
 // Use React.useMemo to ensure Firebase is only initialized once
 const firebaseInstances = React.useMemo(() => {
  return initializeFirebase();
 }, []);

 return <FirebaseProvider {...firebaseInstances}>{children}</FirebaseProvider>;
}
