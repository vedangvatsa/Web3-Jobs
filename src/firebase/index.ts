import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// This function initializes Firebase and returns the app, auth, and firestore instances.
// It's designed to be called once, in the client provider.
export function initializeFirebase() {
  // Check if all necessary config keys are present from the environment
  const isConfigValid = firebaseConfig && firebaseConfig.projectId;

  if (!isConfigValid) {
    // This warning will appear in the browser console if the .env file is missing
    console.warn("Firebase config is missing or incomplete. Firebase will not be initialized.");
    return { app: null, auth: null, firestore: null };
  }

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  } catch (e) {
    console.error("Failed to initialize Firebase", e);
  }
  return { app: null, auth: null, firestore: null };
}

// Re-export providers and hooks for easy consumption
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
