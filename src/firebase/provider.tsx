'use client';

import * as React from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = React.createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

export interface FirebaseProviderProps {
  children: React.ReactNode;
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export function FirebaseProvider({ children, app, auth, firestore }: FirebaseProviderProps) {
  const contextValue = React.useMemo(() => ({ app, auth, firestore }), [app, auth, firestore]);

  return (
    <FirebaseContext.Provider value={contextValue}>
        {children}
        {app && <FirebaseErrorListener />}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return React.useContext(FirebaseContext);
}

export function useFirebaseApp() {
  return React.useContext(FirebaseContext).app;
}

export function useAuth() {
  return React.useContext(FirebaseContext).auth;
}

export function useFirestore() {
  return React.useContext(FirebaseContext).firestore;
}
