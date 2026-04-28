
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

// This function ensures firebase is initialized only once on the server.
function initializeServerFirebase() {
 if (!getApps().length) {
  if (firebaseConfig.projectId) {
   app = initializeApp(firebaseConfig);
   firestore = getFirestore(app);
  } else {
   console.warn("Server-side Firebase config is missing. Firebase will not be initialized.");
  }
 } else {
  app = getApp();
  firestore = getFirestore(app);
 }
}

initializeServerFirebase();

export { firestore as serverFirestore };
